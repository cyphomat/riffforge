/**
 * Die Maße des Halses — in Pixeln, weil sie zweimal gebraucht werden.
 *
 * Einmal zeichnet `components/theory/fretboard.tsx` daraus das antippbare
 * Griffbrett. Einmal kachelt `app/globals.css` daraus den Hintergrund der
 * ganzen App. Beide meinen denselben Hals, und deshalb stehen die Zahlen
 * hier statt zweimal.
 *
 * Der Prüfstein dazu ist `__tests__/hals.test.ts`: er liest das Stylesheet
 * und rechnet nach, dass die Einlagen dort an den Stellen sitzen, die sich
 * aus diesen Werten ergeben. Ohne ihn wären es zwei Tabellen mit denselben
 * Zahlen — genau das, was die Griffbrett-Regel verbietet.
 */

/** Wie viele Bünde das gezeichnete Griffbrett zeigt. */
export const BUENDE = 12

/** Bundbreite. Quer zum Hals — im Hintergrund das senkrechte Raster. */
export const BREITE = 44

/** Saitenabstand. Längs zum Hals — im Hintergrund die Saiten. */
export const HOEHE = 62

/** Einlagen, wie auf einem echten Hals. Am 12. Bund doppelt. */
export const EINLAGEN = [3, 5, 7, 9]

/** Der Bund mit der Doppeleinlage: die Oktave. */
export const OKTAVBUND = 12

/**
 * Waagrechte Mitte eines Bundes, gemessen ab dem Sattel.
 *
 * Eine Einlage sitzt *hinter* dem Bundstäbchen, nicht darauf — deshalb der
 * halbe Bund Versatz.
 */
export function bundMitte(bund: number): number {
  return (bund - 0.5) * BREITE
}

/**
 * Senkrechte Lage einer Saite, gemessen ab der tiefen E-Saite.
 *
 * Nimmt gebrochene Werte an: 3,5 ist die Mitte zwischen G- und D-Saite, wo
 * die einfache Einlage sitzt.
 */
export function saitenLage(saite: number): number {
  return (saite - 1) * HOEHE
}

/** Die Kachel, mit der sich der Hals im Hintergrund wiederholt. */
export const KACHEL = { breite: BUENDE * BREITE, hoehe: 6 * HOEHE }
