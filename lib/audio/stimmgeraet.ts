import type { AudioEngine } from "./audio-engine"
import { tonhoehe, type Tonhoehe } from "./tonhoehe"

/**
 * The microphone, read for pitch.
 *
 * Unlike the onset detector this does not need a worklet: a tuner wants a
 * steady reading a few times a second, not a timestamp to the millisecond.
 * An AnalyserNode holds the last stretch of audio, and the main thread pulls
 * it when it wants an estimate — no extra work in the audio thread, which on
 * a phone is the one place that must never stall.
 *
 * Same AudioContext as everything else, as everywhere.
 */
export class Stimmgeraet {
  private engine: AudioEngine
  private stream: MediaStream | null = null
  private source: MediaStreamAudioSourceNode | null = null
  private analyser: AnalyserNode | null = null
  private puffer: Float32Array<ArrayBuffer> | null = null
  private sink: GainNode | null = null

  constructor(engine: AudioEngine) {
    this.engine = engine
  }

  /** Must run inside a user gesture. Returns a reason when it cannot start. */
  async start(): Promise<string | null> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      return "Dieser Browser gibt keinen Mikrofonzugriff frei."
    }
    try {
      const ctx = await this.engine.resume()
      // The same three cleanups off as for onsets: automatic gain and noise
      // suppression bend exactly the decaying tail a tuner listens to.
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      this.source = ctx.createMediaStreamSource(this.stream)
      this.analyser = ctx.createAnalyser()
      // 4096 at 48 kHz is 85 ms — more than two periods of a low B (16 ms),
      // with room for YIN's lag search.
      this.analyser.fftSize = 4096
      this.puffer = new Float32Array(this.analyser.fftSize)
      // Silent sink, as for the onset detector: the graph only pulls nodes that
      // reach the destination, and the microphone must not reach the speakers.
      this.sink = ctx.createGain()
      this.sink.gain.value = 0
      this.source.connect(this.analyser)
      this.analyser.connect(this.sink)
      this.sink.connect(ctx.destination)
      return null
    } catch (error) {
      this.stop()
      const name = error instanceof DOMException ? error.name : ""
      if (name === "NotAllowedError" || name === "SecurityError") return "Mikrofonzugriff abgelehnt."
      if (name === "NotFoundError") return "Kein Mikrofon gefunden."
      return error instanceof Error ? error.message : "Mikrofon nicht verfügbar."
    }
  }

  /** One estimate from the most recent audio, or null for silence or noise. */
  lesen(): Tonhoehe | null {
    const ctx = this.engine.context
    if (!this.analyser || !this.puffer || !ctx) return null
    this.analyser.getFloatTimeDomainData(this.puffer)
    return tonhoehe(this.puffer, ctx.sampleRate)
  }

  stop(): void {
    this.source?.disconnect()
    this.analyser?.disconnect()
    this.sink?.disconnect()
    this.sink = null
    this.stream?.getTracks().forEach((track) => track.stop())
    this.source = null
    this.analyser = null
    this.puffer = null
    this.stream = null
  }
}
