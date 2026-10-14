import { midiAt, TOENE, type Ton } from "./fretboard"
import { BUENDE } from "./hals"
import type { Griff } from "./types"

/**
 * Triads on three adjacent strings, in close position.
 *
 * Close position means the three notes are stacked as tightly as they go —
 * each one the next chord tone above the one below — so the whole chord fits
 * inside an octave and under one hand. Which tone sits at the bottom is the
 * inversion: root position, first inversion (third below), second inversion
 * (fifth below). On one string group that gives exactly three grips per
 * chord before the first comes back an octave higher.
 *
 * Computed like everything else on the fretboard: the open strings and the
 * chord's degrees in, frets out. The G–B kink needs no special case — it
 * falls out of the open-string pitches.
 */

/** The four groups of three adjacent strings, lowest string first. */
export const SAITENGRUPPEN = [
  [6, 5, 4],
  [5, 4, 3],
  [4, 3, 2],
  [3, 2, 1],
] as const
export type Saitengruppe = (typeof SAITENGRUPPEN)[number]

export type Geschlecht = "dur" | "moll"
/** 0 root position, 1 first inversion, 2 second inversion. */
export type Umkehrung = 0 | 1 | 2

const STUFEN: Record<Geschlecht, readonly [number, number, number]> = {
  dur: [0, 4, 7],
  moll: [0, 3, 7],
}

export interface Dreiklangton extends Griff {
  /** Semitones above the root, 0–11. */
  stufe: number
}

/**
 * Every grip of one triad in one inversion on one string group, lowest
 * first. Usually one, two where the neck has room for the octave above.
 */
export function dreiklang(
  akkord: Ton,
  geschlecht: Geschlecht,
  gruppe: Saitengruppe,
  umkehrung: Umkehrung,
  bisBund: number = BUENDE,
): Dreiklangton[][] {
  const wurzel = TOENE.indexOf(akkord)
  const stufen = STUFEN[geschlecht]
  // The degrees bottom to top, and how far each one sits above the bass.
  const folge = [0, 1, 2].map((i) => stufen[(umkehrung + i) % 3])
  const abstand = folge.map((stufe) => (stufe - folge[0] + 12) % 12)
  const leer = gruppe.map((saite) => midiAt({ saite, bund: 0 } as Griff))

  const griffe: Dreiklangton[][] = []
  for (let bass = 0; bass <= bisBund; bass += 1) {
    const tief = leer[0] + bass
    if ((((tief - wurzel) % 12) + 12) % 12 !== folge[0]) continue
    const buende = abstand.map((ab, i) => tief + ab - leer[i])
    if (buende.some((bund) => bund < 0 || bund > bisBund)) continue
    griffe.push(
      gruppe.map((saite, i) => ({ saite: saite as Griff["saite"], bund: buende[i], stufe: folge[i] })),
    )
  }
  return griffe
}

/** Where one degree sits in the lowest grip — the root, the third, the fifth. */
export function dreiklangTon(
  akkord: Ton,
  geschlecht: Geschlecht,
  gruppe: Saitengruppe,
  umkehrung: Umkehrung,
  stufe: number,
): Griff[] {
  const griff = dreiklang(akkord, geschlecht, gruppe, umkehrung)[0] ?? []
  return griff.filter((ton) => ton.stufe === stufe).map(({ saite, bund }) => ({ saite, bund }))
}
