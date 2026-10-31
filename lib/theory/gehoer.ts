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
 * The two notes for one hearing. `zufall` is a number in [0, 1); the same
 * number gives the same pair, so a replay plays the same thing.
 */
export function hoerPaar(halbtoene: number, richtung: Richtung, zufall: number): [number, number] {
  const spielraum = HOECHSTER_TON - TIEFSTER_TON - halbtoene
  const unten = TIEFSTER_TON + Math.floor(Math.min(0.999999, Math.max(0, zufall)) * (spielraum + 1))
  const oben = unten + halbtoene
  return richtung === "auf" ? [unten, oben] : [oben, unten]
}
