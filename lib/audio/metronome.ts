import type { AudioEngine } from "./audio-engine"

/**
 * Sample-accurate metronome built on the Web Audio lookahead pattern.
 *
 * Timer callbacks in JavaScript drift; audio scheduling does not. So a plain
 * `setInterval` only ever *looks ahead* into a short window and hands the exact
 * start times to the audio clock, which then fires them precisely.
 */

export interface MetronomeTick {
  /** Beat index within the bar, 0-based. */
  beatInBar: number
  /** Bar index since start, 0-based. */
  bar: number
  /** Total beats since start, 0-based. */
  beat: number
  /** AudioContext time this beat sounds at. */
  time: number
  /** True on beat 0 of a bar. */
  accent: boolean
}

export interface MetronomeOptions {
  bpm?: number
  beatsPerBar?: number
  /** Multiplier on the click rate: 1 = quarters, 2 = eighths. */
  subdivision?: number
  onTick?: (tick: MetronomeTick) => void
  /**
   * Multiplier on the click level. Only calibration raises it: there the
   * microphone has to hear the click across the room, not the player.
   */
  lautstaerke?: number
}

/** How often the scheduler wakes up, in ms. */
const LOOKAHEAD_MS = 25
/** How far ahead of the audio clock we schedule, in seconds. */
const SCHEDULE_AHEAD_S = 0.1

/**
 * One click at a fixed time on the AudioContext clock.
 *
 * Pulled out because the song player needs the same clicks, and in the same
 * voice: practising a song to the metronome should sound like the metronome
 * heard everywhere else. `ziel` is the node the click goes into; the output
 * when omitted.
 */
export function spieleKlick(
  ctx: AudioContext,
  time: number,
  accent: boolean,
  offbeat: boolean,
  lautstaerke = 1,
  ziel: AudioNode = ctx.destination,
): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.connect(gain)
  gain.connect(ziel)

  osc.frequency.value = accent ? 1200 : offbeat ? 600 : 880
  const peak = Math.min(0.9, (accent ? 0.18 : offbeat ? 0.06 : 0.11) * lautstaerke)

  gain.gain.setValueAtTime(0.0001, time)
  gain.gain.exponentialRampToValueAtTime(peak, time + 0.002)
  gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06)

  osc.start(time)
  osc.stop(time + 0.07)
}

export class Metronome {
  private engine: AudioEngine
  private ctx: AudioContext | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private nextNoteTime = 0
  private beat = 0

  private bpm: number
  private beatsPerBar: number
  private subdivision: number
  private onTick?: (tick: MetronomeTick) => void
  private lautstaerke: number

  /** Beats already scheduled but not yet heard, so the UI can fire in sync. */
  private pending: MetronomeTick[] = []

  constructor(engine: AudioEngine, options: MetronomeOptions = {}) {
    this.engine = engine
    this.bpm = options.bpm ?? 100
    this.beatsPerBar = options.beatsPerBar ?? 4
    this.subdivision = options.subdivision ?? 1
    this.onTick = options.onTick
    this.lautstaerke = options.lautstaerke ?? 1
  }

  get isRunning(): boolean {
    return this.timer !== null
  }

  get currentBpm(): number {
    return this.bpm
  }

  /** Safe to call while running — takes effect on the next scheduled beat. */
  setBpm(bpm: number): void {
    this.bpm = Math.max(20, Math.min(300, bpm))
  }

  setSubdivision(subdivision: number): void {
    this.subdivision = Math.max(1, subdivision)
  }

  setOnTick(onTick: (tick: MetronomeTick) => void): void {
    this.onTick = onTick
  }

  /**
   * Must be called from a user gesture — browsers refuse to start an
   * AudioContext otherwise.
   */
  async start(): Promise<void> {
    if (this.timer) return

    this.ctx = await this.engine.resume()

    this.beat = 0
    this.pending = []
    this.nextNoteTime = this.ctx.currentTime + 0.05
    this.timer = setInterval(() => this.schedule(), LOOKAHEAD_MS)
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.pending = []
    this.beat = 0
  }

  /** Stops scheduling. The shared AudioContext is left alone. */
  dispose(): void {
    this.stop()
    this.ctx = null
  }

  /** Audio-clock time, for scoring how close an onset was to the beat. */
  now(): number {
    return this.engine.now()
  }

  /** Seconds between clicks at the current tempo and subdivision. */
  get secondsPerClick(): number {
    return 60 / this.bpm / this.subdivision
  }

  private schedule(): void {
    if (!this.ctx) return

    while (this.nextNoteTime < this.ctx.currentTime + SCHEDULE_AHEAD_S) {
      const clicksPerBar = this.beatsPerBar * this.subdivision
      const beatInBar = Math.floor((this.beat % clicksPerBar) / this.subdivision)
      const isDownbeat = this.beat % clicksPerBar === 0
      const isOffbeat = this.beat % this.subdivision !== 0

      this.click(this.nextNoteTime, isDownbeat, isOffbeat)

      this.pending.push({
        beatInBar,
        bar: Math.floor(this.beat / clicksPerBar),
        beat: this.beat,
        time: this.nextNoteTime,
        accent: isDownbeat,
      })

      this.nextNoteTime += this.secondsPerClick
      this.beat += 1
    }

    // Fire UI callbacks only once the beat has actually sounded, so the visual
    // pulse lines up with what the ear hears instead of the lookahead window.
    const now = this.ctx.currentTime
    while (this.pending.length && this.pending[0].time <= now) {
      const tick = this.pending.shift()!
      this.onTick?.(tick)
    }
  }

  private click(time: number, accent: boolean, offbeat: boolean): void {
    if (!this.ctx) return
    spieleKlick(this.ctx, time, accent, offbeat, this.lautstaerke)
  }
}
