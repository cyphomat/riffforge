import { baueLick, erklaerungOf, tabOf } from "@/lib/theory/lick"
import type { Drill } from "./types"

/**
 * Der eine Drill, dessen Inhalt gerechnet wird statt im Katalog zu stehen.
 *
 * Aller Fortschritt der App hängt an `drillId`: Tempo, Bestwert,
 * Beherrschung, Auswahl. Wäre jedes Lick ein eigener Drill, hätte keines
 * eine Geschichte — die Tempokurve fienge bei jedem Block von vorn an, und
 * `masteryOf` hätte nichts zu messen.
 *
 * Deshalb die Teilung: **der Generator ist der Drill**, mit fester Nummer und
 * eigener Tempokurve, und das **Lick ist der Inhalt**, der wechselt. Der
 * Startwert steht daneben; aus ihm lässt sich jedes gespielte Lick wieder
 * herstellen.
 *
 * Und deshalb bleibt ein Lick auch, bis es sitzt: eine Tempokurve über lauter
 * verschiedene Licks wäre nicht deutbar, und Wiederholung mit Abstand ist
 * ohnehin das, woran diese App sonst überall hängt.
 */

/** Die feste Nummer, an der die ganze Lead-Geschichte hängt. */
export const LEAD_DRILL_ID = "riff-lead-pentatonik"

export function istLead(drill: Drill): boolean {
  return drill.id === LEAD_DRILL_ID
}

/**
 * Der Katalogeintrag, gefüllt mit dem Lick zu diesem Startwert.
 *
 * `tab` und `why` bleiben im Katalog leer — was dort stünde, wäre eine
 * Behauptung über ein Lick, das es noch gar nicht gibt.
 */
export function mitLick(drill: Drill, seed: number): Drill {
  const lick = baueLick(seed)
  return { ...drill, tab: tabOf(lick), why: erklaerungOf(lick) }
}

/**
 * Ab welcher Bewertung das nächste Lick kommt.
 *
 * Drei heisst „sauber im Tempo". Wer das erreicht, hat das Lick — alles
 * darunter heisst: nochmal, und zwar dieses.
 */
export const SITZT_AB = 3

/**
 * Der nächste Startwert.
 *
 * Fortlaufend statt zufällig: so ist die Reihe nachvollziehbar, und wer
 * dasselbe Lick noch einmal sehen will, zählt zurück.
 */
export function naechsterSeed(seed: number): number {
  return seed + 1
}
