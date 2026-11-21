import type { SchlagArt } from "./band-ablauf"

/**
 * Die Klänge des Schlagzeugs, synthetisch und ohne Dateien. Wie beim Board
 * sind sie Näherungen: es soll nach Kick, Snare und Hi-Hat klingen, nicht nach
 * einem bestimmten Set.
 */

/** Pegel je Art, ohne Anschlagstärke; die Klicks des Metronoms müssen daneben hörbar bleiben. */
const PEGEL: Record<SchlagArt, number> = { kick: 0.45, snare: 0.28, hat: 0.1 }

/** Ein Sekunde Rauschen, einmal je Kontext gerechnet. */
const RAUSCHEN = new WeakMap<BaseAudioContext, AudioBuffer>()
function rauschen(ctx: BaseAudioContext): AudioBuffer {
  let puffer = RAUSCHEN.get(ctx)
  if (!puffer) {
    puffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const daten = puffer.getChannelData(0)
    for (let i = 0; i < daten.length; i += 1) daten[i] = Math.random() * 2 - 1
    RAUSCHEN.set(ctx, puffer)
  }
  return puffer
}

function geraeusch(ctx: BaseAudioContext, ziel: AudioNode, zeit: number, filter: BiquadFilterType, hz: number, pegel: number, dauer: number): void {
  const quelle = ctx.createBufferSource()
  quelle.buffer = rauschen(ctx)
  const f = ctx.createBiquadFilter()
  f.type = filter
  f.frequency.value = hz
  const g = ctx.createGain()
  g.gain.setValueAtTime(pegel, zeit)
  g.gain.exponentialRampToValueAtTime(0.0001, zeit + dauer)
  quelle.connect(f)
  f.connect(g)
  g.connect(ziel)
  quelle.start(zeit)
  quelle.stop(zeit + dauer + 0.01)
}

function ton(ctx: BaseAudioContext, ziel: AudioNode, zeit: number, von: number, bis: number, pegel: number, dauer: number, form: OscillatorType): void {
  const o = ctx.createOscillator()
  o.type = form
  o.frequency.setValueAtTime(von, zeit)
  o.frequency.exponentialRampToValueAtTime(bis, zeit + dauer * 0.8)
  const g = ctx.createGain()
  g.gain.setValueAtTime(pegel, zeit)
  g.gain.exponentialRampToValueAtTime(0.0001, zeit + dauer)
  o.connect(g)
  g.connect(ziel)
  o.start(zeit)
  o.stop(zeit + dauer + 0.01)
}

/** Ein Schlag zur Zeit `zeit` auf der Uhr des Kontexts. */
export function spieleSchlag(ctx: BaseAudioContext, ziel: AudioNode, zeit: number, art: SchlagArt, laut = 1): void {
  const pegel = PEGEL[art] * laut
  switch (art) {
    case "kick":
      ton(ctx, ziel, zeit, 130, 45, pegel, 0.18, "sine")
      break
    case "snare":
      geraeusch(ctx, ziel, zeit, "bandpass", 1900, pegel, 0.16)
      ton(ctx, ziel, zeit, 220, 150, pegel * 0.6, 0.09, "triangle")
      break
    case "hat":
      geraeusch(ctx, ziel, zeit, "highpass", 7000, pegel, 0.045)
      break
  }
}
