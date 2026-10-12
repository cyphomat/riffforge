/**
 * Pitch from a stretch of audio, with YIN (de Cheveigné & Kawahara, 2002).
 *
 * Why YIN and not an FFT peak: a distorted guitar puts more energy into its
 * second and third harmonic than into the fundamental, and the loudest bin is
 * then an octave or a fifth off. YIN looks for the period instead — the lag at
 * which the signal best matches itself — and its cumulative normalisation is
 * what keeps it from preferring the shortest lag that merely looks similar.
 *
 * Pure: a Float32Array in, a frequency out. Where it runs and what it may be
 * trusted with is decided elsewhere, by measurement — see `tonhoehe.test.ts`.
 */

export interface Tonhoehe {
  /** Fundamental in Hz. */
  hz: number
  /** 0–1. One minus the normalised difference at the chosen lag. */
  sicherheit: number
}

/** Lowest note we look for: B1 of a seven-string, with a little room below. */
export const TIEFSTE_HZ = 55
/** Highest: E6, the 24th fret of the high E string, with room above. */
export const HOECHSTE_HZ = 1400

/**
 * Below this normalised difference, a lag counts as a period. 0.15 is the
 * middle of the range the paper recommends; the measurements in the test
 * decide whether it holds for distorted guitar.
 */
const SCHWELLE = 0.15

/** Too quiet to say anything — room noise, not a note. */
const STILLE_RMS = 0.005

/**
 * The fundamental of `samples`, or null when there is none to find — silence,
 * noise, or a window shorter than two periods of the lowest note.
 */
export function tonhoehe(samples: Float32Array, sampleRate: number): Tonhoehe | null {
  const tauMin = Math.floor(sampleRate / HOECHSTE_HZ)
  const tauMax = Math.ceil(sampleRate / TIEFSTE_HZ)
  const fenster = samples.length - tauMax
  if (fenster < tauMax) return null

  let energie = 0
  for (let i = 0; i < samples.length; i += 1) energie += samples[i] * samples[i]
  if (Math.sqrt(energie / samples.length) < STILLE_RMS) return null

  // Difference function, then its cumulative mean normalisation (YIN steps 2–3).
  const d = new Float32Array(tauMax + 1)
  for (let tau = 1; tau <= tauMax; tau += 1) {
    let summe = 0
    for (let i = 0; i < fenster; i += 1) {
      const delta = samples[i] - samples[i + tau]
      summe += delta * delta
    }
    d[tau] = summe
  }
  const dn = new Float32Array(tauMax + 1)
  dn[0] = 1
  let laufend = 0
  for (let tau = 1; tau <= tauMax; tau += 1) {
    laufend += d[tau]
    dn[tau] = laufend === 0 ? 1 : (d[tau] * tau) / laufend
  }

  // Absolute threshold: the first dip below it, followed to its bottom (step 4).
  let tau = -1
  for (let t = tauMin; t <= tauMax; t += 1) {
    if (dn[t] < SCHWELLE) {
      while (t + 1 <= tauMax && dn[t + 1] < dn[t]) t += 1
      tau = t
      break
    }
  }
  // Nothing under the threshold: take the global minimum, and say how unsure.
  if (tau === -1) {
    let bester = tauMin
    for (let t = tauMin + 1; t <= tauMax; t += 1) if (dn[t] < dn[bester]) bester = t
    tau = bester
  }

  // Parabolic interpolation between neighbouring lags (step 5). Without it
  // a high note is off by up to half a sample of period — at E6 that is
  // around fifteen cents, enough to make a tuner lie.
  let genau = tau
  if (tau > tauMin && tau < tauMax) {
    const [a, b, c] = [dn[tau - 1], dn[tau], dn[tau + 1]]
    const nenner = a - 2 * b + c
    if (nenner !== 0) genau = tau + (a - c) / (2 * nenner)
  }

  return { hz: sampleRate / genau, sicherheit: Math.max(0, Math.min(1, 1 - dn[tau])) }
}

/** MIDI note number, fractional: 69 is A4 at 440 Hz. */
export function midiAus(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440)
}

/** Cents between a frequency and the nearest equal-tempered note. */
export function centsAb(hz: number, midi: number): number {
  return Math.round((midiAus(hz) - midi) * 100)
}
