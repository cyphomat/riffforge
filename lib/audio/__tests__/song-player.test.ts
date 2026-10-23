import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { SONGS } from "../../theory/songs"
import type { AudioEngine } from "../audio-engine"
import { SongPlayer } from "../song-player"

/**
 * Der Player gegen einen falschen AudioContext.
 *
 * Hören kann ein Test nichts, aber er kann nachsehen, *wann* etwas an die Uhr
 * gehängt wurde — und darauf kommt es an: ob die Note auf der Zeit liegt, ob
 * der zweite Durchgang erst kurz vor seinem Beginn geplant wird, ob nach dem
 * Anhalten nichts mehr nachklingt.
 */

const drei = SONGS[0].song
const NOTEN = drei.noten.length

function param() {
  return { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }
}

function falschesAudio() {
  const gains: Array<{ gain: ReturnType<typeof param>; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = []
  const quellen: Array<{ start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn> }> = []
  const klicks: number[] = []

  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    destination: {},
    createGain: vi.fn(() => {
      const g = { gain: param(), connect: vi.fn(), disconnect: vi.fn() }
      gains.push(g)
      return g
    }),
    createOscillator: vi.fn(() => ({
      frequency: { value: 0 },
      connect: vi.fn(),
      start: (zeit: number) => klicks.push(zeit),
      stop: vi.fn(),
    })),
    createBufferSource: vi.fn(() => {
      const q = { buffer: null as unknown, connect: vi.fn(), start: vi.fn(), stop: vi.fn() }
      quellen.push(q)
      return q
    }),
    createBuffer: vi.fn(() => ({ copyToChannel: vi.fn() })),
  }
  const engine = { resume: vi.fn(async () => ctx) } as unknown as AudioEngine

  /** Wann die Töne beginnen, in der Reihenfolge, in der sie geplant wurden. */
  const tonStarts = () => quellen.map((q) => q.start.mock.calls[0][0] as number)
  return { ctx, engine, gains, quellen, klicks, tonStarts }
}

/** Die Uhr vorstellen und dem Timer Gelegenheit geben, nachzusehen. */
function vorstellen(ctx: { currentTime: number }, zeit: number) {
  ctx.currentTime = zeit
  vi.advanceTimersByTime(25)
}

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe("SongPlayer", () => {
  it("plant jede Note auf die Zeit, ohne Klick sofort nach dem kurzen Vorlauf", async () => {
    const { engine, tonStarts } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false })
    await player.start(drei)

    // Achtel = 0.25 s. Noten auf Achtel 0, 4, 6, 8, 12.
    expect(tonStarts().map((t) => t - 0.1)).toEqual([0, 1, 1.5, 2, 3].map((t) => expect.closeTo(t, 6)))
    expect(tonStarts()).toHaveLength(NOTEN)
  })

  it("zählt mit Klick einen Takt an und klickt dann jede Viertel", async () => {
    const { engine, klicks, tonStarts } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: true })
    await player.start(drei)

    // Vier Klicks Einzähler plus acht im Song (zwei Takte).
    expect(klicks).toHaveLength(12)
    expect(klicks.slice(0, 4).map((t) => t - 0.1)).toEqual([0, 0.5, 1, 1.5].map((t) => expect.closeTo(t, 6)))
    // Der Song fängt nach dem Einzähler an, zwei Sekunden später.
    expect(tonStarts()[0]).toBeCloseTo(2.1)
    expect(klicks[4]).toBeCloseTo(2.1)
  })

  it("lässt die Klicks weg, wenn der Klick aus ist — auch den Einzähler", async () => {
    const { engine, klicks } = falschesAudio()
    await new SongPlayer(engine, { bpm: 120, klick: false }).start(drei)
    expect(klicks).toEqual([])
  })

  it("dämpft jede Note dort ab, wo sie endet", async () => {
    const { engine, gains } = falschesAudio()
    await new SongPlayer(engine, { bpm: 120, klick: false }).start(drei)

    // gains[0] ist der Master, gains[1] die Hülle der ersten Note: Halbe auf 0, Ende bei 1 s.
    const [pegel, zeit] = gains[1].gain.linearRampToValueAtTime.mock.calls[0]
    expect(pegel).toBe(0)
    expect(zeit).toBeCloseTo(0.1 + 1 + 0.04)
  })

  it("spielt ohne Schleife einen Durchgang und meldet dann das Ende", async () => {
    const { ctx, engine, gains, quellen } = falschesAudio()
    const onEnde = vi.fn()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, onEnde })
    await player.start(drei)

    // Der Durchgang dauert vier Sekunden und beginnt bei 0.1.
    vorstellen(ctx, 4.0)
    expect(onEnde).not.toHaveBeenCalled()
    expect(player.laeuft).toBe(true)

    vorstellen(ctx, 4.2)
    expect(onEnde).toHaveBeenCalledTimes(1)
    expect(player.laeuft).toBe(false)
    expect(gains[0].disconnect).toHaveBeenCalled()
    expect(quellen).toHaveLength(NOTEN)
  })

  it("plant mit Schleife den nächsten Durchgang erst, wenn er gleich beginnt", async () => {
    const { ctx, engine, quellen, tonStarts } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: true })
    await player.start(drei)

    vorstellen(ctx, 1)
    expect(quellen).toHaveLength(NOTEN)

    // Der zweite Durchgang beginnt bei 4.1; ab 3.8 liegt er im Voraus.
    vorstellen(ctx, 3.9)
    expect(quellen).toHaveLength(2 * NOTEN)
    expect(tonStarts()[NOTEN]).toBeCloseTo(4.1)
  })

  it("schließt die Schleife nahtlos an", async () => {
    const { ctx, engine, tonStarts } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: true })
    await player.start(drei)
    vorstellen(ctx, 3.9)
    vorstellen(ctx, 7.9)

    const starts = tonStarts()
    // Der erste Ton jedes Durchgangs liegt genau eine Durchgangslänge nach dem vorigen.
    expect(starts[NOTEN] - starts[0]).toBeCloseTo(4)
    expect(starts[2 * NOTEN] - starts[NOTEN]).toBeCloseTo(4)
  })

  it("lässt ein neues Tempo mit dem nächsten Durchgang gelten, nicht mittendrin", async () => {
    const { ctx, engine, quellen, tonStarts } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: true })
    await player.start(drei)
    player.setBpm(60)

    // Der schon geplante Durchgang bleibt im alten Tempo.
    expect(quellen).toHaveLength(NOTEN)
    expect(tonStarts()[1]).toBeCloseTo(0.1 + 1)

    // Der nächste beginnt bei 4.1 und läuft mit 60 BPM: die zweite Note liegt vier Achtel à 0.5 s später.
    vorstellen(ctx, 3.9)
    expect(tonStarts()[NOTEN + 1]).toBeCloseTo(4.1 + 2)
  })

  it("macht den geplanten Durchgang zum letzten, wenn die Schleife ausgeschaltet wird", async () => {
    const { ctx, engine, quellen } = falschesAudio()
    const onEnde = vi.fn()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: true, onEnde })
    await player.start(drei)
    player.setSchleife(false)

    vorstellen(ctx, 3.9)
    expect(quellen).toHaveLength(NOTEN)
    vorstellen(ctx, 4.2)
    expect(onEnde).toHaveBeenCalledTimes(1)
  })

  it("hängt einen Durchgang an, wenn die Schleife eingeschaltet wird, nachdem der letzte geplant war", async () => {
    const { ctx, engine, quellen } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: false })
    await player.start(drei)
    player.setSchleife(true)

    vorstellen(ctx, 3.9)
    expect(quellen).toHaveLength(2 * NOTEN)
  })

  it("trennt beim Anhalten den Master vom Ausgang, damit nichts Geplantes nachklingt", async () => {
    const { ctx, engine, gains, quellen } = falschesAudio()
    const onEnde = vi.fn()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: true, onEnde })
    await player.start(drei)
    player.stop()

    expect(gains[0].disconnect).toHaveBeenCalled()
    expect(player.laeuft).toBe(false)

    vorstellen(ctx, 10)
    expect(quellen).toHaveLength(NOTEN)
    // Anhalten ist kein Ende: das meldet nur der letzte Durchgang.
    expect(onEnde).not.toHaveBeenCalled()
  })

  it("rechnet jede Tonhöhe nur einmal, auch über Durchgänge hinweg", async () => {
    const { ctx, engine } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false, schleife: true })
    await player.start(drei)
    vorstellen(ctx, 3.9)

    // A3, C4, D4: drei Töne, obwohl fünf Noten und zwei Durchgänge.
    expect(ctx.createBuffer).toHaveBeenCalledTimes(3)
  })

  it("rechnet die Töne lang genug, dass auch die längste Note noch klingt", async () => {
    const { ctx, engine } = falschesAudio()
    await new SongPlayer(engine, { bpm: 120, klick: false }).start(drei)
    // Fünf Sekunden bei der Abtastrate des falschen Kontexts, nicht die 1,4 s der Hörfragen.
    expect(ctx.createBuffer).toHaveBeenCalledWith(1, 5 * ctx.sampleRate, ctx.sampleRate)
  })

  it("lässt den letzten Start gewinnen, wenn zwei fast gleichzeitig kommen", async () => {
    const { engine, quellen } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false })
    await Promise.all([player.start(drei), player.start(drei)])
    expect(quellen).toHaveLength(NOTEN)
  })

  it("startet nicht, wenn angehalten wird, während der AudioContext noch aufwacht", async () => {
    const { ctx, engine, quellen } = falschesAudio()
    let freigeben: (c: typeof ctx) => void = () => {}
    ;(engine.resume as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise((r) => (freigeben = r)))

    const player = new SongPlayer(engine, { bpm: 120, klick: false })
    const start = player.start(drei)
    player.stop()
    freigeben(ctx)
    await start

    expect(quellen).toHaveLength(0)
    expect(player.laeuft).toBe(false)
  })

  it("kann nach einem Ende wieder gestartet werden", async () => {
    const { ctx, engine, quellen } = falschesAudio()
    const player = new SongPlayer(engine, { bpm: 120, klick: false })
    await player.start(drei)
    vorstellen(ctx, 4.2)
    expect(player.laeuft).toBe(false)

    ctx.currentTime = 10
    await player.start(drei)
    expect(player.laeuft).toBe(true)
    expect(quellen).toHaveLength(2 * NOTEN)
  })
})
