/**
 * Die Siebensaitige als Rechnung.
 *
 * Dieselbe Regel wie beim sechssaitigen Griffbrett: was die Übungen über
 * Töne behaupten, fällt aus diesen Funktionen, statt danebengetippt zu
 * werden. Ein falscher Ton in einer Tabulatur fällt niemandem auf — bis
 * jemand ihn spielt und sich wundert.
 *
 * Gestimmt wird **B Standard**: die tiefe H-Saite kommt unten dazu, die
 * sechs darüber bleiben, wie sie sind. Das ist die Stimmung ab Werk, und es
 * ist die, in der man den Hals wirklich lernt — man erweitert, statt
 * umzulernen. Drop A ist hier bewusst nicht drin: das ist eine andere
 * Orientierung auf der tiefsten Saite und gehört dann auch eigens geübt.
 */

import { TOENE, type Ton } from "./fretboard"

/** Saite 1 ist die hohe e, 7 die tiefe B — wie in jeder Tabulatur. */
export type Saite7 = 1 | 2 | 3 | 4 | 5 | 6 | 7

export interface Griff7 {
  saite: Saite7
  bund: number
}

/**
 * MIDI-Nummern der Leersaiten in B Standard, Saite 1 bis 7.
 *
 * Die ersten sechs sind die der Sechssaitigen. Die siebte liegt auf 35 —
 * B1, eine Quarte unter der tiefen E. Dass es eine Quarte ist und keine
 * Quinte, ist der ganze Grund, warum alle Griffbilder unverändert
 * weitergelten: der Abstand zwischen zwei Saiten ist überall derselbe,
 * ausser zwischen G und B.
 */
export const LEERSAITEN_SIEBEN = [64, 59, 55, 50, 45, 40, 35] as const

/** Die Saitennamen, von oben nach unten — die Beschriftung der Tabulatur. */
export const SAITENNAMEN_SIEBEN = ["e", "B", "G", "D", "A", "E", "B"] as const

/** Wie viele Bünde die Übungen benutzen dürfen. */
export const HOECHSTER_BUND_SIEBEN = 15

export function midiSieben(griff: Griff7): number {
  return LEERSAITEN_SIEBEN[griff.saite - 1] + griff.bund
}

/** Der Tonname an einer Stelle — ohne Oktavzahl. */
export function tonSieben(griff: Griff7): Ton {
  return TOENE[midiSieben(griff) % 12]
}

/**
 * Die Frequenz einer Stelle in Hertz.
 *
 * Steht hier, weil die tiefe Saite ihr eigentliches Problem in dieser Zahl
 * hat: sie schwingt langsamer, klingt länger nach und braucht deshalb mehr
 * Dämpfung als die E. Was die Übungen darüber sagen, soll nachrechenbar
 * sein statt eine Behauptung.
 */
export function hertzSieben(griff: Griff7): number {
  return 440 * 2 ** ((midiSieben(griff) - 69) / 12)
}

/**
 * Wie viele Halbtöne zwischen zwei Stellen liegen — mit Vorzeichen.
 *
 * Für die Aussagen der Übungen über Saitenabstände: eine Quarte sind fünf,
 * zwei Quarten zehn, und zwischen G und B sind es vier.
 */
export function abstandSieben(von: Griff7, nach: Griff7): number {
  return midiSieben(nach) - midiSieben(von)
}

/**
 * Wo derselbe Ton auf der Nachbarsaite liegt.
 *
 * Die Auskunft, die einem Umsteiger fehlt: „dein alter tiefster Ton sitzt
 * jetzt im fünften Bund der neuen Saite."
 */
export function gleicherTonAuf(griff: Griff7, saite: Saite7): Griff7 | null {
  const bund = midiSieben(griff) - LEERSAITEN_SIEBEN[saite - 1]
  if (bund < 0 || bund > HOECHSTER_BUND_SIEBEN) return null
  return { saite, bund }
}
