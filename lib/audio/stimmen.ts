import { TOENE } from "@/lib/theory/fretboard"
import { LEERSAITEN_SIEBEN } from "@/lib/theory/sieben"
import { midiAus, type Tonhoehe } from "./tonhoehe"

/**
 * The tuner's logic: which string a pitch belongs to, and how far off it is.
 *
 * The open strings are not typed in a second time — they come from the same
 * tables the fretboard questions and the seven-string drills are checked
 * against. Six strings are the seven without the low B.
 */

export type Stimmung = "sechs" | "sieben"

export interface Saite {
  /** 1 = high e, as in tablature. */
  nummer: number
  midi: number
  /** `E2`, `B1` — note name and scientific octave. */
  name: string
}

export function notenname(midi: number): string {
  return `${TOENE[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`
}

export function saitenVon(stimmung: Stimmung): Saite[] {
  const midis = stimmung === "sieben" ? LEERSAITEN_SIEBEN : LEERSAITEN_SIEBEN.slice(0, 6)
  return midis.map((midi, i) => ({ nummer: i + 1, midi, name: notenname(midi) }))
}

/** Within this, a string counts as in tune. Three cents is below what most ears hear on a held note. */
export const IM_TON_CENT = 3

/**
 * Below this certainty, an estimate is not shown. YIN's certainty drops on
 * the pick attack and when two strings ring together — exactly the moments a
 * tuner should keep quiet rather than jump.
 */
export const MINDEST_SICHERHEIT = 0.85

export interface Anzeige {
  saite: Saite
  /** Cents from that string's target. Negative = flat. */
  cent: number
  imTon: boolean
}

/**
 * The string a pitch is closest to, by cents — not by Hertz, which would
 * favour the high strings, where a semitone is many Hertz wide.
 */
export function naechsteSaite(hz: number, stimmung: Stimmung): Anzeige {
  const ton = midiAus(hz)
  const saite = saitenVon(stimmung).reduce((beste, s) =>
    Math.abs(ton - s.midi) < Math.abs(ton - beste.midi) ? s : beste,
  )
  const cent = Math.round((ton - saite.midi) * 100)
  return { saite, cent, imTon: Math.abs(cent) <= IM_TON_CENT }
}

/**
 * The value a needle should show, from the last few estimates.
 *
 * Median, not mean: one octave slip during the attack would drag a mean
 * across half the dial, a median ignores it. Estimates below the certainty
 * floor do not vote at all.
 */
export function geglaettet(schaetzungen: Array<Tonhoehe | null>): number | null {
  const gut = schaetzungen
    .filter((s): s is Tonhoehe => s !== null && s.sicherheit >= MINDEST_SICHERHEIT)
    .map((s) => s.hz)
    .sort((a, b) => a - b)
  if (gut.length < Math.ceil(schaetzungen.length / 2)) return null
  return gut[Math.floor(gut.length / 2)]
}
