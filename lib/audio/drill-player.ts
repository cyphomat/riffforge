import type { Figur } from "../theory/drill-spiel"
import type { AudioEngine } from "./audio-engine"
import { bauDrillAblauf, SCHLAEGE_JE_TAKT, schrittSekunden, type DrillKlick, type DrillTon } from "./drill-ablauf"
import { spieleKlick } from "./metronome"
import { gezupft, hertzAus } from "./zupfen"

/**
 * Spielt die Figur eines Drills ab, auf der einen Uhr der App.
 *
 * Gebaut wie `SongPlayer`: nichts läuft über Timer, ein Durchgang wird erst
 * geplant, wenn er gleich beginnt, und alles geht über einen Master-Knoten, an
 * dem das Anhalten trennt. Anders als der Song hat ein Drill mehrere Töne
 * zugleich (Powerchords), tote Anschläge, Palm Mutes und Slides — das hier
 * ist das, was dafür gebraucht wird, und sonst nichts: kein Board, keine Band,
 * kein Riffbuch.
 */

const TIMER_MS = 25
const VORAUS_S = 0.3
const VORLAUF_S = 0.1
const ABKLANG_S = 0.04
const TON_SEKUNDEN = 3
const NACHKLANG = 1.6
const TON_PEGEL = 0.45
/** Töne eines Akkords zusammen sollen nicht lauter sein als ein Einzelton. */
const AKKORD_ANTEIL = 0.62
/** Das Klacken eines toten Anschlags: Rauschen, dumpf gefiltert. */
const KLACK_HZ = 1400

export interface DrillPlayerOptions {
  bpm?: number
  schleife?: boolean
  /** Einzähler und Klick im Takt. */
  klick?: boolean
  onEnde?: () => void
}

export class DrillPlayer {
  private engine: AudioEngine
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private figur: Figur | null = null
  private naechster = 0
  private ende: number | null = null
  private puffer = new Map<number, AudioBuffer>()
  private rauschen: AudioBuffer | null = null
  private anhalten = 0

  private bpm: number
  private schleife: boolean
  private klick: boolean
  private onEnde?: () => void

  constructor(engine: AudioEngine, options: DrillPlayerOptions = {}) {
    this.engine = engine
    this.bpm = options.bpm ?? 80
    this.schleife = options.schleife ?? true
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

  setSchleife(schleife: boolean): void {
    this.schleife = schleife
    if (!this.timer) return
    this.ende = schleife ? null : this.naechster
  }

  /** Gilt ab dem nächsten Durchgang. */
  setKlick(klick: boolean): void {
    this.klick = klick
  }

  /** Muss aus einer Nutzergeste kommen, sonst startet der AudioContext nicht. */
  async start(figur: Figur): Promise<void> {
    this.stop()
    const nummer = this.anhalten
    const ctx = await this.engine.resume()
    // Während des `await` kann jemand angehalten haben: der Letzte gewinnt.
    if (nummer !== this.anhalten) return

    this.ctx = ctx
    this.figur = figur
    this.ende = null
    this.master = ctx.createGain()
    this.master.connect(ctx.destination)

    let beginn = ctx.currentTime + VORLAUF_S
    if (this.klick) {
      const schlag = schrittSekunden(this.bpm, 1)
      const zaehler = Array.from({ length: SCHLAEGE_JE_TAKT }, (_, i) => ({ zeit: i * schlag, betont: i === 0 }))
      this.planeKlicks(zaehler, beginn)
      beginn += SCHLAEGE_JE_TAKT * schlag
    }
    this.naechster = beginn
    this.planeDurchgang()
    this.timer = setInterval(() => this.nachsehen(), TIMER_MS)
  }

  stop(): void {
    this.anhalten += 1
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
    this.rauschen = null
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

  private planeDurchgang(): void {
    const { ctx, figur, master } = this
    if (!ctx || !figur || !master) return

    const ablauf = bauDrillAblauf(figur, this.bpm)
    const beginn = this.naechster
    for (const ton of ablauf.toene) this.planeTon(ton, beginn)
    if (this.klick) this.planeKlicks(ablauf.klicks, beginn)
    this.naechster = beginn + ablauf.dauer
    if (!this.schleife) this.ende = this.naechster
  }

  private planeTon(ton: DrillTon, beginn: number): void {
    const { ctx, master } = this
    if (!ctx || !master) return
    const start = beginn + ton.start
    const ende = beginn + ton.ende

    if (ton.tot) {
      this.planeKlacken(start, ende, ton.laut)
      return
    }

    // Ein Palm Mute klingt dumpf, nicht nur kurz: die hohen Teiltöne fehlen.
    let ziel: AudioNode = master
    if (ton.dumpf) {
      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = 900
      filter.connect(master)
      ziel = filter
    }

    const anteil = ton.midis.length > 1 ? AKKORD_ANTEIL : 1
    for (const midi of ton.midis) {
      const quelle = ctx.createBufferSource()
      quelle.buffer = this.pufferFuer(ctx, midi)
      if (ton.gleiten) {
        const { ab, dauer, halbtoene } = ton.gleiten
        const rate = quelle.playbackRate
        rate.setValueAtTime(1, start)
        rate.setValueAtTime(1, beginn + ab)
        rate.linearRampToValueAtTime(2 ** (halbtoene / 12), beginn + ab + dauer)
      }
      const huelle = ctx.createGain()
      const pegel = TON_PEGEL * ton.laut * anteil
      huelle.gain.setValueAtTime(pegel, start)
      huelle.gain.setValueAtTime(pegel, ende)
      huelle.gain.linearRampToValueAtTime(0, ende + ABKLANG_S)
      quelle.connect(huelle)
      huelle.connect(ziel)
      quelle.start(start)
      quelle.stop(ende + ABKLANG_S + 0.01)
    }
  }

  /** Der tote Anschlag: ein kurzes, gefiltertes Rauschen. */
  private planeKlacken(start: number, ende: number, laut: number): void {
    const { ctx, master } = this
    if (!ctx || !master) return
    const quelle = ctx.createBufferSource()
    quelle.buffer = this.rauschenFuer(ctx)
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = KLACK_HZ
    const huelle = ctx.createGain()
    huelle.gain.setValueAtTime(TON_PEGEL * laut, start)
    huelle.gain.linearRampToValueAtTime(0, ende + ABKLANG_S)
    quelle.connect(filter)
    filter.connect(huelle)
    huelle.connect(master)
    quelle.start(start)
    quelle.stop(ende + ABKLANG_S + 0.01)
  }

  private planeKlicks(klicks: DrillKlick[], beginn: number): void {
    const { ctx, master } = this
    if (!ctx || !master) return
    for (const k of klicks) spieleKlick(ctx, beginn + k.zeit, k.betont, false, 1, master)
  }

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

  private rauschenFuer(ctx: AudioContext): AudioBuffer {
    if (!this.rauschen) {
      const laenge = Math.round(0.2 * ctx.sampleRate)
      const buffer = ctx.createBuffer(1, laenge, ctx.sampleRate)
      const daten = buffer.getChannelData(0)
      for (let i = 0; i < laenge; i += 1) daten[i] = Math.random() * 2 - 1
      this.rauschen = buffer
    }
    return this.rauschen
  }
}
