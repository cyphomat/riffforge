import { midiAt, TOENE, type Ton } from "./fretboard"
import type { Griff } from "./types"

/**
 * CAGED: five ways to grip the same major chord, one after the other up the
 * neck.
 *
 * Each shape is an open major chord — C, A, G, E, D — moved up so that the
 * nut becomes a barre. Moved far enough, each one lands on the next, and
 * after five shapes the first comes back an octave higher. That is the whole
 * system, and it is why it maps the neck: every major chord is somewhere
 * under the hand, wherever the hand is.
 *
 * Computed, not typed: a shape is its open chord plus a shift, and the
 * shift comes from the interval between the chord's root and the shape's
 * own. The test checks the open shapes against the chords everyone knows
 * and every transposition against the note names.
 */

export const FORMEN = ["C", "A", "G", "E", "D"] as const
export type Form = (typeof FORMEN)[number]

/**
 * The open chords, string 6 to string 1. `null` is a string not played.
 * Only the major chord: minor comes from lowering the third, and that is a
 * question, not a second table.
 */
const OFFEN: Record<Form, ReadonlyArray<number | null>> = {
  C: [null, 3, 2, 0, 1, 0],
  A: [null, 0, 2, 2, 2, 0],
  G: [3, 2, 0, 0, 0, 3],
  E: [0, 2, 2, 1, 0, 0],
  D: [null, null, 0, 2, 3, 2],
}

/** A tone of a shape: where it sits, and what it is in the chord. */
export interface Formton extends Griff {
  /** Semitones above the chord's root, 0–11: 0 root, 4 third, 7 fifth. */
  stufe: number
}

/** How far the open shape moves to sound `akkord`, in frets, 0–11. */
export function verschiebung(form: Form, akkord: Ton): number {
  return (TOENE.indexOf(akkord) - TOENE.indexOf(form) + 12) % 12
}

/** The shape `form` played as the major chord `akkord`. */
export function cagedForm(form: Form, akkord: Ton): Formton[] {
  const um = verschiebung(form, akkord)
  const wurzel = TOENE.indexOf(akkord)
  const toene: Formton[] = []
  OFFEN[form].forEach((bund, i) => {
    if (bund === null) return
    const stelle = { saite: (6 - i) as Griff["saite"], bund: bund + um }
    toene.push({ ...stelle, stufe: (((midiAt(stelle) - wurzel) % 12) + 12) % 12 })
  })
  return toene
}

/** Where a degree sits in a shape — the root, the third, the fifth. */
export function stufeInForm(form: Form, akkord: Ton, stufe: number): Griff[] {
  return cagedForm(form, akkord)
    .filter((ton) => ton.stufe === stufe)
    .map(({ saite, bund }) => ({ saite, bund }))
}

/** The lowest fret a shape uses — where it sits on the neck. */
export function tiefsterBund(form: Form, akkord: Ton): number {
  return Math.min(...cagedForm(form, akkord).map((ton) => ton.bund))
}

/** The five shapes of one chord, from the bottom of the neck upwards. */
export function formenAmHals(akkord: Ton): Form[] {
  return [...FORMEN].sort((a, b) => tiefsterBund(a, akkord) - tiefsterBund(b, akkord))
}
