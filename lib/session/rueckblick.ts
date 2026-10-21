import { ALLE_DRILLS_BY_ID } from "./drills"
import { startBpmFor, type Profile } from "./profile"
import { dayKey, SAUBER_AB, weekKey } from "./progress"
import type { DrillResult, PracticeLog } from "./types"
import { median } from "@/lib/audio/timing"

/**
 * Der Rückblick über die Wochen.
 *
 * „Wo du stehst" zeigt den Bestwert — eine Zahl, die nur steigen kann und
 * deshalb nichts darüber sagt, ob es gerade vorangeht. Hier steht der Verlauf:
 * je Woche, wie oft geübt wurde, und je Drill, welches Tempo sauber sass und
 * wie eng das gemessene Timing lag.
 *
 * Wie die Ansage behauptet auch der Rückblick nichts, was nicht im Log steht.
 * Eine Woche ohne sauberes Tempo hat keinen Tempowert — keine Null, keine
 * Fortschreibung, eine Lücke. Eine Woche ohne Mikrofon hat keine Streuung.
 */

/** So weit reicht der Rückblick höchstens zurück. Ein Quartal. */
export const WOCHEN_HOECHSTENS = 12

/** Montag der Woche, um `n` Wochen verschoben — als Schlüssel wie `weekKey`. */
function wocheVerschoben(key: string, n: number): string {
  const tag = new Date(`${key}T12:00:00`)
  tag.setDate(tag.getDate() + 7 * n)
  return weekKey(tag)
}

/**
 * Die Wochen, die der Rückblick zeigt, älteste zuerst.
 *
 * Das Fenster wächst mit dem Log, wie der Übungskalender: wer seit drei
 * Wochen übt, sieht drei Wochen und nicht neun leere davor. Ein leeres Raster
 * ist keine Auskunft.
 */
export function fensterWochen(log: PracticeLog, now: Date = new Date(), max = WOCHEN_HOECHSTENS): string[] {
  const aktuell = weekKey(now)
  if (log.results.length === 0) return [aktuell]
  const erste = log.results.map((r) => weekKey(new Date(r.at))).sort()[0]
  const wochen: string[] = []
  for (let w = aktuell; w >= erste && wochen.length < max; w = wocheVerschoben(w, -1)) {
    wochen.unshift(w)
  }
  // Ein Log, der nur in der Zukunft liegt (falsch gestellte Uhr auf einem
  // anderen Gerät), soll kein leeres Fenster ergeben.
  return wochen.length > 0 ? wochen : [aktuell]
}

export interface Woche {
  /** Montag der Woche, `YYYY-MM-DD`. */
  woche: string
  /** Tage mit mindestens einem Block. */
  tage: number
  minuten: number
  bloecke: number
}

function nachWoche(log: PracticeLog, wochen: string[]): Map<string, DrillResult[]> {
  const gruppen = new Map<string, DrillResult[]>(wochen.map((w) => [w, []]))
  for (const r of log.results) gruppen.get(weekKey(new Date(r.at)))?.push(r)
  return gruppen
}

export function wochen(log: PracticeLog, now: Date = new Date(), max = WOCHEN_HOECHSTENS): Woche[] {
  const fenster = fensterWochen(log, now, max)
  const gruppen = nachWoche(log, fenster)
  return fenster.map((woche) => {
    const r = gruppen.get(woche) ?? []
    return {
      woche,
      tage: new Set(r.map((x) => dayKey(new Date(x.at)))).size,
      minuten: Math.round(r.reduce((summe, x) => summe + x.seconds, 0) / 60),
      bloecke: r.length,
    }
  })
}

export interface Punkt {
  woche: string
  /** `null` heisst: in dieser Woche gibt es dazu nichts im Log. */
  wert: number | null
}

export interface DrillVerlauf {
  drillId: string
  /** Höchstes Tempo je Woche, das mit „sauber" oder besser bewertet wurde. */
  tempo: Punkt[]
  /** Median der gemessenen Streuung je Woche, in ms. Weniger ist besser. */
  streuung: Punkt[]
  /** Blöcke im Fenster. */
  bloecke: number
  /** Zeitpunkt des letzten Blocks. */
  zuletzt: string
}

/**
 * Je Drill der Verlauf über die Wochen, zuletzt Gespieltes zuerst.
 *
 * Nur Drills, die im Fenster vorkommen — was vor drei Monaten zuletzt dran
 * war, hat hier keinen Verlauf.
 */
export function drillVerlaeufe(log: PracticeLog, now: Date = new Date(), max = WOCHEN_HOECHSTENS): DrillVerlauf[] {
  const fenster = fensterWochen(log, now, max)
  const imFenster = new Set(fenster)
  const jeDrill = new Map<string, DrillResult[]>()
  for (const r of log.results) {
    if (!imFenster.has(weekKey(new Date(r.at)))) continue
    jeDrill.set(r.drillId, [...(jeDrill.get(r.drillId) ?? []), r])
  }

  return [...jeDrill.entries()]
    .map(([drillId, ergebnisse]) => {
      const gruppen = nachWoche({ version: 1, results: ergebnisse }, fenster)
      return {
        drillId,
        tempo: fenster.map((woche) => {
          const sauber = (gruppen.get(woche) ?? []).filter((r) => r.rating >= SAUBER_AB)
          return { woche, wert: sauber.length > 0 ? Math.max(...sauber.map((r) => r.bpm)) : null }
        }),
        streuung: fenster.map((woche) => {
          const gemessen = (gruppen.get(woche) ?? []).flatMap((r) => (r.timing ? [r.timing.spreadMs] : []))
          return { woche, wert: gemessen.length > 0 ? Math.round(median(gemessen)) : null }
        }),
        bloecke: ergebnisse.length,
        zuletzt: ergebnisse.map((r) => r.at).sort().at(-1)!,
      }
    })
    .sort((a, b) => Date.parse(b.zuletzt) - Date.parse(a.zuletzt))
}

export interface Entwicklung {
  von: number
  bis: number
  vonWoche: string
  bisWoche: string
}

/**
 * Erster gegen letzten Wert im Fenster — oder nichts.
 *
 * Nichts heisst: weniger als zwei Wochen mit einem Wert. Aus einem Punkt
 * lässt sich keine Richtung ablesen, und eine Richtung, die nicht im Log
 * steht, sagt der Rückblick nicht.
 */
export function entwicklung(punkte: Punkt[]): Entwicklung | null {
  const belegt = punkte.filter((p): p is Punkt & { wert: number } => p.wert !== null)
  if (belegt.length < 2) return null
  const erster = belegt[0]
  const letzter = belegt[belegt.length - 1]
  return { von: erster.wert, bis: letzter.wert, vonWoche: erster.woche, bisWoche: letzter.woche }
}

/** ISO-Kalenderwoche eines Wochenschlüssels — so steht es im Kalender. */
export function kalenderwoche(key: string): number {
  const tag = new Date(`${key}T12:00:00`)
  // Der Donnerstag einer Woche entscheidet, zu welchem Jahr sie gehört.
  tag.setDate(tag.getDate() + 3 - ((tag.getDay() + 6) % 7))
  const ersterDonnerstag = new Date(tag.getFullYear(), 0, 4, 12)
  ersterDonnerstag.setDate(ersterDonnerstag.getDate() + 3 - ((ersterDonnerstag.getDay() + 6) % 7))
  return 1 + Math.round((tag.getTime() - ersterDonnerstag.getTime()) / (7 * 24 * 3600 * 1000))
}

/** So viele Kanalzüge hat das Pult: zwei Reihen auf dem Handy, mehr wäre eine Liste. */
export const KANAELE_HOECHSTENS = 8

export interface Kanal {
  drillId: string
  /** Das letzte saubere Tempo im Fenster — dort steht der Fader. */
  jetzt: number
  /** Das erste saubere Tempo im Fenster — dort sitzt die Kerbe. */
  anfang: number
  /** Ob es mehr als eine Woche mit Wert gibt; sonst hat die Kerbe nichts zu sagen. */
  bewegt: boolean
  /** Starttempo *dieses* Spielers — der Fuss der Bahn. */
  start: number
  /** Zieltempo des Drills — das obere Ende. */
  ziel: number
  /** Stellung zwischen Start und Ziel, 0…1. Über dem Ziel steht er oben an. */
  stellung: number
  stellungAnfang: number
}

/**
 * Das Pult, aus Roadie: je Drill ein Kanalzug, der Fader dort, wo das
 * Tempo gerade sauber sitzt, die Kerbe dort, wo es am Anfang des Fensters
 * sass. Die Bahn läuft vom Starttempo *dieses* Spielers bis zum Ziel —
 * dieselbe Strecke, die `masteryOf` misst, damit ein Fader auf halber Höhe
 * dasselbe heisst wie ein halber Balken unter *Wo du stehst*.
 *
 * Nur Drills mit einem sauberen Tempo im Fenster: ein Fader ohne Wert
 * stünde unten und behauptete „Starttempo", und das steht nicht im Log.
 * Was der Katalog nicht kennt, hat kein Ziel und bekommt keinen Kanal.
 */
export function pultKanaele(verlaeufe: DrillVerlauf[], profile: Profile | null): Kanal[] {
  return verlaeufe
    .flatMap((verlauf) => {
      const drill = ALLE_DRILLS_BY_ID[verlauf.drillId]
      const werte = verlauf.tempo.flatMap((p) => (p.wert === null ? [] : [p.wert]))
      if (!drill || werte.length === 0) return []
      const start = startBpmFor(drill, profile)
      const ziel = drill.targetBpm
      const stellung = (bpm: number) => (ziel <= start ? 1 : Math.max(0, Math.min(1, (bpm - start) / (ziel - start))))
      const jetzt = werte.at(-1)!
      const anfang = werte[0]
      return [
        {
          drillId: verlauf.drillId,
          jetzt,
          anfang,
          bewegt: werte.length > 1,
          start,
          ziel,
          stellung: stellung(jetzt),
          stellungAnfang: stellung(anfang),
        },
      ]
    })
    .slice(0, KANAELE_HOECHSTENS)
}
