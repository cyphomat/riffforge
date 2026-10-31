import type { Song } from "../theory/song"
import type { AudioEngine } from "./audio-engine"
import { spieleKlick } from "./metronome"
import { bauAblauf, einzaehler, klingendeNoten, type SongKlick, type SongTon } from "./song-ablauf"
import { gezupft, hertzAus } from "./zupfen"

/**
 * Spielt einen Song ab, auf der einen Uhr der App.
 *
 * Wie beim Metronom wird nichts über Timer gespielt, sondern nur *geplant*:
 * ein Durchgang wird mit festen Zeiten an die Uhr des AudioContext gehängt,
 * und der Timer schaut bloß, ob der nächste Durchgang schon fällig ist. Töne
 * und Klicks laufen deshalb auf derselben Uhr und gegeneinander nicht weg.
 *
 * Ein Durchgang wird erst geplant, wenn er gleich beginnt. Dadurch gilt ein
 * neues Tempo ab dem nächsten Durchgang, ohne dass schon Geplantes umgebaut
 * werden müsste — und es gibt keinen Sprung mitten im Song.
 *
 * Alles geht über einen Master-Knoten. Anhalten trennt ihn vom Ausgang, und
 * damit ist auch das schon Geplante stumm: einzelne geplante Töne zurückzuholen
 * wäre ein Zählen aller Knoten, und ein vergessener klingt nach dem Stopp
 * noch einmal an.
 */

/** Wie oft der Timer nachsieht, in ms. */
const TIMER_MS = 25
/** Wie weit vor Beginn ein Durchgang geplant wird, in Sekunden. */
const VORAUS_S = 0.3
/** Abstand zwischen Knopfdruck und erstem Klang — Zeit, den ersten Ton sauber zu planen. */
const VORLAUF_S = 0.1
/** So lange wird eine Note nach ihrem Ende ausgeblendet, statt abzureißen. */
const ABKLANG_S = 0.04
/**
 * Wie lang ein Ton gerechnet wird und wie lange er nachklingt.
 *
 * Gemessen: mit dem Ton der Hörfragen (1,4 s, Nachklang 1) ist eine Halbe bei
 * 60 BPM schon vor ihrem Ende still und eine Viertel am Ende kaum noch zu
 * hören — dann hört man, wann Noten beginnen, aber nicht, wie lang sie sind,
 * und das ist hier der Lernstoff. Mit gut dem Doppelten klingt eine Halbe
 * noch, wenn sie abgedämpft wird. Für die Songs allein: Hörfragen und
 * Stimmgerät behalten ihren Ton.
 */
const TON_SEKUNDEN = 5
const NACHKLANG = 2.2
/** Pegel der Töne; die Klicks haben ihren eigenen und müssen daneben hörbar bleiben. */
const TON_PEGEL = 0.5

export interface SongPlayerOptions {
  bpm?: number
  schleife?: boolean
  /** Einzähler und Klick im Takt. Ohne Klick fängt der Song sofort an. */
  klick?: boolean
  /** Der letzte Durchgang ist verklungen (nur ohne Schleife) — nicht beim Anhalten. */
  onEnde?: () => void
}

export class SongPlayer {
  private engine: AudioEngine
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private song: Song | null = null
  /** Wann der nächste Durchgang beginnt. */
  private naechster = 0
  /** Wann der letzte geplante Durchgang vorbei ist; nur gesetzt, wenn keiner mehr folgt. */
  private ende: number | null = null
  private puffer = new Map<number, AudioBuffer>()
  /** Die geplanten Durchgänge mit ihrem Beginn auf der Uhr — Futter für `klingend`. */
  private durchgaenge: { beginn: number; ende: number; toene: SongTon[] }[] = []
  /** Zählt jedes Anhalten, damit ein `start`, das noch auf den AudioContext wartet, es merkt. */
  private anhalten = 0

  private bpm: number
  private schleife: boolean
  private klick: boolean
  private onEnde?: () => void

  constructor(engine: AudioEngine, options: SongPlayerOptions = {}) {
    this.engine = engine
    this.bpm = options.bpm ?? 80
    this.schleife = options.schleife ?? false
    this.klick = options.klick ?? true
    this.onEnde = options.onEnde
  }

  get laeuft(): boolean {
    return this.timer !== null
  }

  /** Gilt ab dem nächsten Durchgang. */
  setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm))
  }

  /**
   * Auch mitten im Lauf: an, und es folgt ein weiterer Durchgang; aus, und der
   * schon geplante ist der letzte.
   */
  setSchleife(schleife: boolean): void {
    this.schleife = schleife
    if (!this.timer) return
    this.ende = schleife ? null : this.naechster
  }

  /** Gilt ab dem nächsten Durchgang; der Einzähler steht schon fest. */
  setKlick(klick: boolean): void {
    this.klick = klick
  }

  /** Muss aus einer Nutzergeste kommen, sonst startet der AudioContext nicht. */
  async start(song: Song): Promise<void> {
    this.stop()
    const nummer = this.anhalten
    const ctx = await this.engine.resume()
    // Während des `await` kann jemand angehalten oder neu gestartet haben: der
    // Letzte gewinnt.
    if (nummer !== this.anhalten) return

    this.ctx = ctx
    this.song = song
    this.ende = null
    this.master = ctx.createGain()
    this.master.connect(ctx.destination)

    let beginn = ctx.currentTime + VORLAUF_S
    if (this.klick) {
      const zaehler = einzaehler(this.bpm)
      this.planeKlicks(zaehler.klicks, beginn)
      beginn += zaehler.dauer
    }
    this.naechster = beginn
    this.planeDurchgang()
    this.timer = setInterval(() => this.nachsehen(), TIMER_MS)
  }

  /**
   * Welche Noten gerade zu hören sind (Indizes im Song), für die Anzeige.
   *
   * Gefragt wird die Uhr des einen AudioContext, abzüglich der Zeit, die der
   * Ton bis zum Lautsprecher braucht — sonst leuchtete die Note, bevor man sie
   * hört. Ohne laufenden Player ist die Antwort leer.
   */
  klingend(): number[] {
    const ctx = this.ctx
    if (!ctx || !this.timer) return []
    const jetzt = ctx.currentTime - (ctx.outputLatency || ctx.baseLatency || 0)
    // Was vorbei ist, fliegt raus; der Durchgang nach einer Schleife steht schon da.
    this.durchgaenge = this.durchgaenge.filter((d) => d.ende > jetzt)
    return this.durchgaenge.flatMap((d) => klingendeNoten(d.toene, d.beginn, jetzt))
  }

  stop(): void {
    this.anhalten += 1
    this.durchgaenge = []
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.master?.disconnect()
    this.master = null
    this.ende = null
  }

  dispose(): void {
    this.stop()
    this.ctx = null
    this.puffer.clear()
  }

  private nachsehen(): void {
    const ctx = this.ctx
    if (!ctx) return

    if (this.ende !== null) {
      if (ctx.currentTime >= this.ende) {
        this.stop()
        this.onEnde?.()
      }
      return
    }
    if (this.naechster < ctx.currentTime + VORAUS_S) this.planeDurchgang()
  }

  /** Plant einen Durchgang ab `naechster`, mit dem Tempo von jetzt. */
  private planeDurchgang(): void {
    const { ctx, song, master } = this
    if (!ctx || !song || !master) return

    const ablauf = bauAblauf(song, this.bpm)
    const beginn = this.naechster
    this.durchgaenge.push({ beginn, ende: beginn + ablauf.dauer, toene: ablauf.toene })
    for (const ton of ablauf.toene) this.planeTon(ton.midi, beginn + ton.start, beginn + ton.ende)
    if (this.klick) this.planeKlicks(ablauf.klicks, beginn)

    this.naechster = beginn + ablauf.dauer
    if (!this.schleife) this.ende = this.naechster
  }

  private planeTon(midi: number, start: number, ende: number): void {
    const { ctx, master } = this
    if (!ctx || !master) return

    const quelle = ctx.createBufferSource()
    quelle.buffer = this.pufferFuer(ctx, midi)
    const huelle = ctx.createGain()
    // Dort, wo die Note endet, wird abgedämpft: ohne das klänge eine Viertel
    // wie eine Halbe, weil die Saite ohnehin ausschwingt — und die Länge ist
    // der Lernstoff.
    huelle.gain.setValueAtTime(TON_PEGEL, start)
    huelle.gain.setValueAtTime(TON_PEGEL, ende)
    huelle.gain.linearRampToValueAtTime(0, ende + ABKLANG_S)
    quelle.connect(huelle)
    huelle.connect(master)
    quelle.start(start)
    quelle.stop(ende + ABKLANG_S + 0.01)
  }

  private planeKlicks(klicks: SongKlick[], beginn: number): void {
    const { ctx, master } = this
    if (!ctx || !master) return
    for (const k of klicks) spieleKlick(ctx, beginn + k.zeit, k.betont, false, 1, master)
  }

  /** Ein Ton wird einmal gerechnet und bleibt: dieselbe Tonhöhe kommt in jedem Song oft vor. */
  private pufferFuer(ctx: AudioContext, midi: number): AudioBuffer {
    let buffer = this.puffer.get(midi)
    if (!buffer) {
      const samples = gezupft(hertzAus(midi), ctx.sampleRate, TON_SEKUNDEN, NACHKLANG)
      buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
      buffer.copyToChannel(samples, 0)
      this.puffer.set(midi, buffer)
    }
    return buffer
  }
}
