import { baueLick, erklaerungOf, tabOf } from "@/lib/theory/lick"
import { TOENE, pentatonikLage, type Lage, type Ton } from "@/lib/theory/fretboard"
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
export function mitLick(drill: Drill, seed: number, box: LickBox = BOX_STANDARD): Drill {
  const lick = baueLick(seed, box.grundton, box.lage)
  return {
    ...drill,
    // Der Titel nennt die Box: sonst stünde auf dem Bildschirm „Lick-Schmiede"
    // und man wüsste nicht, woran man gerade arbeitet.
    title: `${drill.title} · ${box.grundton}m Lage ${box.lage}`,
    tab: tabOf(lick),
    why: erklaerungOf(lick),
  }
}

/** Grundton und Lage, in der die Licks gebaut werden. */
export interface LickBox {
  grundton: Ton
  lage: Lage
}

export const BOX_STANDARD: LickBox = { grundton: "A", lage: 1 }

/** Die Lagen, in der Reihenfolge, in der sie am Hals aufeinander folgen. */
export const LAGEN: Lage[] = [1, 2, 3, 4, 5]

/**
 * Die Grundtöne zur Auswahl.
 *
 * Alle zwölf, ohne Vorauswahl: welcher gebraucht wird, hängt am Repertoire,
 * und eine App, die dem Nutzer sagt, in welchen Tonarten Metal stattfindet,
 * läge daneben. Die Schreibweise ist die englische — so steht es in jeder
 * Tabulatur, und dieselbe Regel gilt in der ganzen App.
 */
export const GRUNDTOENE: readonly Ton[] = TOENE

/**
 * Ob eine Box am Hals überhaupt existiert.
 *
 * `pentatonikLage` sucht den Anker auf der tiefen E-Saite. Für jeden der
 * zwölf Grundtöne und jede der fünf Lagen gibt es ihn — aber die Prüfung
 * steht hier, damit eine leere Box nie bis in den Generator durchschlägt.
 */
export function boxVorhanden(box: LickBox): boolean {
  return pentatonikLage(box.grundton, box.lage).length >= 12
}

/**
 * Eine Box in Worten — für die Auswahl und die Kopfzeile.
 *
 * Nennt den tiefsten Bund, weil das die Auskunft ist, die beim Greifen
 * zählt: „Lage 3" sagt einem nichts, „ab dem 8. Bund" schon.
 */
export function boxBeschreibung(box: LickBox): string {
  const griffe = pentatonikLage(box.grundton, box.lage)
  if (griffe.length === 0) return `${box.grundton}-Moll, Lage ${box.lage}`
  const tiefster = Math.min(...griffe.map((g) => g.bund))
  return `${box.grundton}-Moll · Lage ${box.lage} · ab Bund ${tiefster}`
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
