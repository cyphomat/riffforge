import { delayMs } from "../theory/effekte"

/**
 * Das Board klingt: Pedale und ein Amp zwischen den Tönen eines Songs und dem
 * Ausgang.
 *
 * Es hängt am einen AudioContext der App und bekommt von dort Eingang und
 * Ausgang; ein zweiter Kontext entsteht nie. Nur Töne laufen hindurch — das
 * Metronom, die Klicks, die Hörfragen und das Stimmgerät bleiben trocken, denn
 * wer sein Timing misst, will keinen Hall auf dem Klick.
 *
 * Was hier steht, ist eine Näherung: eine Sättigungskurve statt einer Röhre,
 * ein Filter statt einer Box. Es soll nach Pedal und Amp klingen, nicht nach
 * einem bestimmten.
 */

export type Klang =
  | { art: "gain"; wert: number }
  | { art: "tremolo"; wert: number }
  | { art: "chorus"; wert: number }
  | { art: "delay" }
  | { art: "hall"; wert: number }

export interface AmpKlang {
  /** Wie hart die Vorstufe sättigt. */
  gain: number
  /** Die Grenze der „Box", in Hz. */
  hoehen: number
  /** Mitten, in dB um 700 Hz. */
  mitten: number
}

export interface BoardKette {
  vor: Klang[]
  amp: AmpKlang
  nach: Klang[]
}

/** Eine weiche Sättigung: tanh, vorverstärkt. Bei drive 1 fast linear, bei 100 fast eckig. */
export function sattigung(drive: number, stuetzen = 2049): Float32Array<ArrayBuffer> {
  const kurve = new Float32Array(stuetzen)
  const k = Math.max(0.1, drive)
  const norm = Math.tanh(k)
  for (let i = 0; i < stuetzen; i += 1) {
    const x = (i / (stuetzen - 1)) * 2 - 1
    kurve[i] = Math.tanh(k * x) / norm
  }
  return kurve
}

/** Ein Nachhall aus abklingendem Rauschen, nicht aus einem echten Raum. */
function nachhall(ctx: BaseAudioContext, sekunden: number): AudioBuffer {
  const laenge = Math.max(1, Math.floor(ctx.sampleRate * sekunden))
  const puffer = ctx.createBuffer(2, laenge, ctx.sampleRate)
  for (let kanal = 0; kanal < 2; kanal += 1) {
    const daten = puffer.getChannelData(kanal)
    for (let i = 0; i < laenge; i += 1) daten[i] = (Math.random() * 2 - 1) * (1 - i / laenge) ** 2.5
  }
  return puffer
}

interface Stufe {
  eingang: AudioNode
  ausgang: AudioNode
}

/**
 * Baut das Board zwischen `eingang` und `ausgang` und gibt zurück, wie man es
 * wieder abbaut. Das Tempo bestimmt die Delay-Zeit (punktierte Achtel) und
 * gilt ab dem nächsten Bau.
 */
export function baueBoard(
  ctx: BaseAudioContext,
  eingang: AudioNode,
  ausgang: AudioNode,
  kette: BoardKette,
  bpm: number,
): () => void {
  const knoten: AudioNode[] = []
  const oszillatoren: OscillatorNode[] = []
  const neu = <T extends AudioNode>(k: T): T => {
    knoten.push(k)
    return k
  }
  const lfo = (hz: number, tiefe: number, ziel: AudioParam) => {
    const o = ctx.createOscillator()
    o.frequency.value = hz
    const g = neu(ctx.createGain())
    g.gain.value = tiefe
    o.connect(g)
    g.connect(ziel)
    o.start()
    oszillatoren.push(o)
  }

  const pedal = (k: Klang): Stufe => {
    switch (k.art) {
      case "gain": {
        const eing = neu(ctx.createGain())
        const form = neu(ctx.createWaveShaper())
        form.curve = sattigung(k.wert)
        form.oversample = "4x"
        const aus = neu(ctx.createGain())
        aus.gain.value = 0.8
        eing.connect(form)
        form.connect(aus)
        return { eingang: eing, ausgang: aus }
      }
      case "tremolo": {
        const g = neu(ctx.createGain())
        g.gain.value = 0.6
        lfo(k.wert, 0.4, g.gain)
        return { eingang: g, ausgang: g }
      }
      case "chorus": {
        const eing = neu(ctx.createGain())
        const aus = neu(ctx.createGain())
        const trocken = neu(ctx.createGain())
        trocken.gain.value = 0.7
        const verzoegert = neu(ctx.createDelay(0.1))
        verzoegert.delayTime.value = 0.02
        lfo(k.wert, 0.004, verzoegert.delayTime)
        const nass = neu(ctx.createGain())
        nass.gain.value = 0.5
        eing.connect(trocken).connect(aus)
        eing.connect(verzoegert).connect(nass).connect(aus)
        return { eingang: eing, ausgang: aus }
      }
      case "delay": {
        const eing = neu(ctx.createGain())
        const aus = neu(ctx.createGain())
        const zeit = Math.min(1.9, delayMs(Math.max(30, bpm)).punktierteAchtel / 1000)
        const verzoegert = neu(ctx.createDelay(2))
        verzoegert.delayTime.value = zeit
        const rueck = neu(ctx.createGain())
        rueck.gain.value = 0.35
        const nass = neu(ctx.createGain())
        nass.gain.value = 0.35
        eing.connect(aus)
        eing.connect(verzoegert)
        verzoegert.connect(rueck).connect(verzoegert)
        verzoegert.connect(nass).connect(aus)
        return { eingang: eing, ausgang: aus }
      }
      case "hall": {
        const eing = neu(ctx.createGain())
        const aus = neu(ctx.createGain())
        const trocken = neu(ctx.createGain())
        trocken.gain.value = 0.75
        const raum = neu(ctx.createConvolver())
        raum.buffer = nachhall(ctx, k.wert)
        const nass = neu(ctx.createGain())
        nass.gain.value = 0.35
        eing.connect(trocken).connect(aus)
        eing.connect(raum).connect(nass).connect(aus)
        return { eingang: eing, ausgang: aus }
      }
    }
  }

  const amp = (a: AmpKlang): Stufe => {
    const eing = neu(ctx.createBiquadFilter())
    eing.type = "highpass"
    eing.frequency.value = 90
    const mitten = neu(ctx.createBiquadFilter())
    mitten.type = "peaking"
    mitten.frequency.value = 700
    mitten.gain.value = a.mitten
    const form = neu(ctx.createWaveShaper())
    form.curve = sattigung(a.gain)
    form.oversample = "4x"
    const box = neu(ctx.createBiquadFilter())
    box.type = "lowpass"
    box.frequency.value = a.hoehen
    const aus = neu(ctx.createGain())
    aus.gain.value = 0.7
    eing.connect(mitten)
    mitten.connect(form)
    form.connect(box)
    box.connect(aus)
    return { eingang: eing, ausgang: aus }
  }

  let spitze: AudioNode = eingang
  const verkette = (s: Stufe) => {
    spitze.connect(s.eingang)
    spitze = s.ausgang
  }
  for (const k of kette.vor) verkette(pedal(k))
  verkette(amp(kette.amp))
  for (const k of kette.nach) verkette(pedal(k))
  spitze.connect(ausgang)

  return () => {
    for (const o of oszillatoren) {
      try {
        o.stop()
      } catch {
        /* schon gestoppt */
      }
      o.disconnect()
    }
    for (const k of knoten) k.disconnect()
    // Der Eingang gehört dem Aufrufer; hier wird nur die Strecke zum Board gelöst.
    try {
      eingang.disconnect()
    } catch {
      /* nichts verbunden */
    }
  }
}
