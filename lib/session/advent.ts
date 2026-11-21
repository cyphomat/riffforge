import { AUFNAEHER_TUERCHEN, TUERCHEN, TUERCHEN_ANZAHL, type Tuerchen } from "./advent-daten"
import { dayKey } from "./progress"
import type { PracticeLog } from "./types"

/**
 * Der Advent: vierundzwanzig Türchen, geöffnet durch Übungstage im Dezember.
 *
 * Wie der Gurt wird nichts gespeichert. Ein Türchen öffnet sich, wenn so viele
 * Tage des Dezembers geübt wurden, wie seine Nummer sagt: zwei Übungstage
 * öffnen Türchen 1 und 2. Damit gilt dreierlei ohne eigene Regel:
 *
 *  - Ein verpasster Tag lässt sich nachholen, ohne dass etwas verfällt.
 *  - Ein Türchen, dessen Datum noch nicht erreicht ist, bleibt zu — an einem
 *    Kalendertag zählt höchstens ein Übungstag.
 *  - Der Log ist append-only, also fällt ein geöffnetes Türchen nie wieder zu.
 *
 * Gezählt wird nach Gerätezeit, wie bei Serie und Kalender.
 */

/** Alle Übungstage dieses Dezembers, aufsteigend. */
export function adventTage(log: PracticeLog, jahr: number): string[] {
  const praefix = `${jahr}-12-`
  const tage = new Set<string>()
  for (const r of log.results) {
    const zeit = Date.parse(r.at)
    if (Number.isNaN(zeit)) continue
    const tag = dayKey(new Date(zeit))
    if (tag.startsWith(praefix)) tage.add(tag)
  }
  return [...tage].sort()
}

/** Wie viele Türchen offen sind: Übungstage im Dezember, höchstens 24. */
export function offeneTuerchen(log: PracticeLog, jahr: number): number {
  return Math.min(adventTage(log, jahr).length, TUERCHEN_ANZAHL)
}

export interface AdventStand {
  jahr: number
  /** Wie viele Türchen offen sind. */
  offen: number
  /** Das zuletzt geöffnete Türchen, oder null. */
  letztes: Tuerchen | null
  /** Die Türchen mit Inhalt, die offen sind, in Reihenfolge. */
  geoeffnet: Tuerchen[]
}

export function adventStand(log: PracticeLog, jahr: number): AdventStand {
  const offen = offeneTuerchen(log, jahr)
  const geoeffnet = TUERCHEN.filter((t) => t.nr <= offen)
  return { jahr, offen, letztes: geoeffnet.at(-1) ?? null, geoeffnet }
}

/** Der Dezember eines ISO-Tages `JJJJ-MM-TT`: sein Jahr, sonst null. */
export function adventJahr(iso: string): number | null {
  return /^\d{4}-12-\d{2}$/.test(iso) ? Number(iso.slice(0, 4)) : null
}

/**
 * Die Tage, an denen die Aufnäher-Türchen aufgingen — der Tag des 12. und des
 * 24. Übungstags im Dezember, über alle Jahre im Log, der früheste gewinnt.
 */
export function adventAufnaeherTage(log: PracticeLog): Record<number, string> {
  const jahre = new Set<number>()
  for (const r of log.results) {
    const zeit = Date.parse(r.at)
    if (!Number.isNaN(zeit)) {
      const tag = dayKey(new Date(zeit))
      if (tag.slice(5, 7) === "12") jahre.add(Number(tag.slice(0, 4)))
    }
  }
  const aus: Record<number, string> = {}
  for (const jahr of [...jahre].sort()) {
    const tage = adventTage(log, jahr)
    for (const n of AUFNAEHER_TUERCHEN) {
      if (tage.length >= n && !aus[n]) aus[n] = tage[n - 1]
    }
  }
  return aus
}
