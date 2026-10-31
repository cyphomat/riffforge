import { INTERVALLE, midiAt } from "./fretboard"
import type { Griff } from "./types"

/**
 * Ear training: which intervals are asked, in which order, and on which notes.
 *
 * The answer to a card is the interval, never the notes — so the notes move.
 * Each time a card is shown, the first tone is drawn anew from a range the
 * size of a guitar's middle register; otherwise the card could be answered by
 * remembering how it sounded last time instead of hearing the distance.
 */

export type Richtung = "auf" | "ab"

/**
 * The order the cards come in. New cards are served in catalogue order, so
 * this is the order someone meets them: wide and distinct first (octave,
 * fifth, fourth), the thirds once those sit, the close and the tense ones
 * last. Every interval from the minor second to the octave is in it once.
 */
export const HOER_REIHENFOLGE = [12, 7, 5, 4, 3, 2, 1, 6, 9, 8, 10, 11] as const

/** The choices on every ear card: all of them, smallest first. */
export const HOER_AUSWAHL: string[] = INTERVALLE.slice(1).map((intervall) => intervall.name)

/**
 * Lowest and highest note played, MIDI: A2 to E5 — the middle of the guitar,
 * where a laptop speaker still carries the fundamental.
 */
export const TIEFSTER_TON = 45
export const HOECHSTER_TON = 76

/**
 * Open strings, heard one at a time. Unlike the interval cards the tone does
 * not move: the thing to learn *is* the pitch, and it stays put. The choices
 * are the six strings, lowest first; the two E strings carry their height in
 * the name, because telling them apart is the point of the exercise.
 */
export const SAITEN_AUSWAHL = ["E (tief)", "A", "D", "G", "B", "e (hoch)"] as const

/**
 * The order the string cards come in: the two ends first — two E's two octaves
 * apart are the easiest contrast — then the middle, neighbours last.
 */
export const SAITEN_REIHENFOLGE: readonly Griff["saite"][] = [6, 1, 4, 3, 5, 2]

/** The choice that names a string, 1 = high e … 6 = low E. */
export function saitenWahl(saite: Griff["saite"]): (typeof SAITEN_AUSWAHL)[number] {
  return SAITEN_AUSWAHL[6 - saite]
}

/** MIDI note of a string played open. */
export function saitenTon(saite: Griff["saite"]): number {
  return midiAt({ saite, bund: 0 })
}

/**
 * Notes against an anchor: the low E sounds first, then a second tone above
 * it, and the answer is the name of the second one. This is not absolute
 * pitch — nobody has to name a tone out of nothing — but the pitch of a tone
 * *relative to one that is known*, which is what a guitarist can actually
 * learn. The anchor is the open low E, the one string every player knows by
 * heart, and it never moves.
 */
export const ANKER_TON = saitenTon(6)

/**
 * The twelve choices, by distance from the anchor: E, F, F#/Gb … D#/Eb. The
 * black keys carry both names, so nobody is marked wrong for spelling. The
 * unison is E as well — as an answer it is the octave, one E above the anchor.
 */
export const ANKER_AUSWAHL = [
  "E",
  "F",
  "F# / Gb",
  "G",
  "G# / Ab",
  "A",
  "A# / Bb",
  "B",
  "C",
  "C# / Db",
  "D",
  "D# / Eb",
] as const

/**
 * Distances above the anchor in the order the cards come in: the fifth and
 * fourth first — they sound like the open strings, which are fourths — then
 * the octave, the thirds, and the close and tense ones last. The same
 * ordering the interval cards use, for the same reason.
 */
export const ANKER_REIHENFOLGE = [7, 5, 12, 4, 3, 2, 1, 6, 9, 8, 10, 11] as const

/** The choice that names the tone `halbtoene` above the anchor, 1 to 12. */
export function ankerWahl(halbtoene: number): (typeof ANKER_AUSWAHL)[number] {
  return ANKER_AUSWAHL[halbtoene % 12]
}

/** The two notes of one hearing: the anchor, then the tone above it. */
export function ankerPaar(halbtoene: number): [number, number] {
  return [ANKER_TON, ANKER_TON + halbtoene]
}

/**
 * Where the tone sits on the neck, closest to the nut: on the low E up to the
 * fourth fret, then on the A string, then the D string. The explanation on
 * the card names this place, and the tests work it out again.
 */
export function ankerStelle(halbtoene: number): Griff {
  if (halbtoene < 5) return { saite: 6, bund: halbtoene }
  if (halbtoene < 10) return { saite: 5, bund: halbtoene - 5 }
  if (halbtoene < 12) return { saite: 4, bund: halbtoene - 10 }
  return { saite: 4, bund: 2 }
}

/**
 * The two notes for one hearing. `zufall` is a number in [0, 1); the same
 * number gives the same pair, so a replay plays the same thing.
 */
export function hoerPaar(halbtoene: number, richtung: Richtung, zufall: number): [number, number] {
  const spielraum = HOECHSTER_TON - TIEFSTER_TON - halbtoene
  const unten = TIEFSTER_TON + Math.floor(Math.min(0.999999, Math.max(0, zufall)) * (spielraum + 1))
  const oben = unten + halbtoene
  return richtung === "auf" ? [unten, oben] : [oben, unten]
}
