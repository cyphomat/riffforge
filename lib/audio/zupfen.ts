/**
 * A plucked tone, built from its harmonics.
 *
 * For the ear-training cards the tone has to be *in tune* above all: two
 * tones a few cents off each other are a different question than the one on
 * the card. Karplus–Strong would sound more like a string, but its period is
 * a whole number of samples, and at the top of the range that is fifteen
 * cents of error. Summing harmonics puts the pitch exactly where it is asked
 * for; a fast attack and a decay that is quicker for the higher partials make
 * it read as plucked rather than as an organ.
 *
 * Pure: frequency in, samples out. `zupfen.test.ts` runs the result through
 * the same YIN the tuner uses and checks the pitch to the cent.
 */

/** Seconds until the attack is at full level — short enough to sound plucked, long enough not to click. */
const ANSCHLAG_S = 0.004
/** Harmonics stop here: above it a guitar has little left, and a laptop speaker less. */
const OBERGRENZE_HZ = 6000

export function gezupft(hz: number, sampleRate: number, sekunden = 1.4): Float32Array<ArrayBuffer> {
  const laenge = Math.round(sekunden * sampleRate)
  const samples = new Float32Array(laenge)
  const teiltoene = Math.max(1, Math.min(16, Math.floor(OBERGRENZE_HZ / hz)))

  for (let k = 1; k <= teiltoene; k += 1) {
    // A pluck near the bridge: strong low partials, falling off as 1/k, and
    // each one dying faster than the one below it.
    const staerke = 1 / k
    const daempfung = 1.6 + 0.9 * k
    const schritt = (2 * Math.PI * hz * k) / sampleRate
    for (let i = 0; i < laenge; i += 1) {
      samples[i] += staerke * Math.exp((-daempfung * i) / sampleRate) * Math.sin(schritt * i)
    }
  }

  const anschlag = Math.max(1, Math.round(ANSCHLAG_S * sampleRate))
  // The tail fades to zero over the last tenth, so the buffer never ends on a click.
  const ausklang = Math.round(laenge * 0.1)
  let spitze = 0
  for (let i = 0; i < laenge; i += 1) {
    if (i < anschlag) samples[i] *= i / anschlag
    if (i > laenge - ausklang) samples[i] *= (laenge - i) / ausklang
    spitze = Math.max(spitze, Math.abs(samples[i]))
  }
  if (spitze > 0) for (let i = 0; i < laenge; i += 1) samples[i] *= 0.8 / spitze
  return samples
}

/** Frequency of a MIDI note, equal temperament at A4 = 440 Hz. */
export function hertzAus(midi: number): number {
  return 440 * 2 ** ((midi - 69) / 12)
}
