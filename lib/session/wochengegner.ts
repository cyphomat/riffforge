import { ALLE_DRILLS_BY_ID } from "./drills"
import { istRepertoire } from "./repertoire-session"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import { hash } from "./gurt"
import { dayKey, weekKey } from "./progress"
import type { DrillResult, PracticeLog } from "./types"
import type { TheoryLog } from "@/lib/theory/types"

/**
 * Der Wochengegner: ein Verstärker-Monster mit 20 Lebenspunkten pro Woche.
 *
 * Wie der Gurt wird nichts gespeichert — die Leiste fällt aus Log und
 * Wissens-Log, ein besiegter Gegner kann nicht wieder aufstehen (beide Logs
 * sind append-only) und wandert mit dem Abgleich. Gezählt wird die Woche
 * Montag bis Sonntag nach Gerätezeit, wie die Serie.
 *
 * Treffer kommen aus mehreren Quellen, jede nur bis zu ihrem Deckel: Wer
 * wenig Zeit hat, kommt über Wissen und saubere Blöcke trotzdem voran, und
 * niemand schafft ihn an einem einzigen Abend. Die Zahlen sind eine
 * Vermutung und dürfen sich ändern, solange der Test mitzieht.
 */

export const GEGNER_HP = 20

/** Wie viele Treffer jede Quelle höchstens beisteuert. */
export const DECKEL = { tage: 4, sauber: 8, ziel: 6, wissen: 6 } as const

/** Ab dieser Bewertung zählt ein Block als sauber (siehe `SAUBER_AB`). */
const SAUBER = 3
/** Treffer je Riff, das diese Woche im Zieltempo sauber lief. */
const TREFFER_JE_ZIEL = 2

export const GEGNER_NAMEN = [
  "Der Feedback-Dämon",
  "Die Brummschleife",
  "Der Röhrenfresser",
  "Das Kabelmonster",
  "Der Dauerton",
  "Die Rückkopplung",
  "Der Netzbrummer",
  "Das Wackelkontakt-Biest",
]

export interface Treffer {
  tage: number
  sauber: number
  ziel: number
  wissen: number
  summe: number
}

export interface Wochengegner {
  /** Montag der Woche, `JJJJ-MM-TT`. */
  woche: string
  name: string
  hp: number
  treffer: Treffer
  /** Übrige Lebenspunkte, nie unter null. */
  rest: number
  gefallen: boolean
}

const drillFuer = (id: string) => ALLE_DRILLS_BY_ID[id] ?? SIEBEN_DRILLS_BY_ID[id]

export function gegnerName(woche: string): string {
  return GEGNER_NAMEN[hash(`gegner-${woche}`) % GEGNER_NAMEN.length]
}

export function wochenTreffer(log: PracticeLog, theorie: TheoryLog, woche: string): Treffer {
  const inWoche = (iso: string) => {
    const t = Date.parse(iso)
    return !Number.isNaN(t) && weekKey(new Date(t)) === woche
  }
  const ergebnisse = log.results.filter((r) => inWoche(r.at))

  const tage = new Set(ergebnisse.map((r) => dayKey(new Date(r.at)))).size
  const sauber = ergebnisse.filter((r) => r.rating >= SAUBER).length
  const ziele = new Set(
    ergebnisse
      .filter((r) => {
        const drill = drillFuer(r.drillId)
        return drill?.kind === "riff" && r.rating >= SAUBER && r.bpm >= drill.targetBpm
      })
      .map((r) => r.drillId),
  )
  const wissen = theorie.answers.filter((a) => a.correct && inWoche(a.at)).length

  const t = {
    tage: Math.min(tage, DECKEL.tage),
    sauber: Math.min(sauber, DECKEL.sauber),
    ziel: Math.min(ziele.size * TREFFER_JE_ZIEL, DECKEL.ziel),
    wissen: Math.min(wissen, DECKEL.wissen),
  }
  return { ...t, summe: t.tage + t.sauber + t.ziel + t.wissen }
}

export function wochengegner(log: PracticeLog, theorie: TheoryLog, jetzt: Date = new Date()): Wochengegner {
  const woche = weekKey(jetzt)
  const treffer = wochenTreffer(log, theorie, woche)
  const rest = Math.max(0, GEGNER_HP - treffer.summe)
  return { woche, name: gegnerName(woche), hp: GEGNER_HP, treffer, rest, gefallen: rest === 0 }
}

/**
 * Ist der Gegner durch genau diese Session gefallen? Vorher-nachher-Rechnung
 * wie bei den Aufnähern: eine zweite Session am selben Tag feiert nichts doppelt.
 */
export function gegnerGefallenDurch(
  vorher: { log: PracticeLog; theorie: TheoryLog },
  nachher: { log: PracticeLog; theorie: TheoryLog },
  jetzt: Date = new Date(),
): Wochengegner | null {
  const davor = wochengegner(vorher.log, vorher.theorie, jetzt)
  const danach = wochengegner(nachher.log, nachher.theorie, jetzt)
  return !davor.gefallen && danach.gefallen ? danach : null
}

/**
 * Die längste Kette sauberer Blöcke in Folge — nur aus den Ergebnissen einer
 * Session, in der Reihenfolge, in der sie gespielt wurden. Ein wackeliger
 * Block bricht die Kette, zählt aber nicht gegen einen.
 */
export function combo(ergebnisse: DrillResult[]): number {
  // A repertoire block is not rated, so it neither extends nor breaks the chain.
  const geordnet = ergebnisse.filter((r) => !istRepertoire(r)).sort((a, b) => a.at.localeCompare(b.at))
  let beste = 0
  let lauf = 0
  for (const r of geordnet) {
    lauf = r.rating >= SAUBER ? lauf + 1 : 0
    beste = Math.max(beste, lauf)
  }
  return beste
}

/** Ab so vielen sauberen Blöcken in Folge steht die Combo auf dem Zettel. */
export const COMBO_AB = 3

/**
 * Wie viele Wochen es gibt, in denen der Gegner gefallen ist — über alles, was
 * im Log steht. Monoton: der Log wächst nur, und eine gefallene Woche bleibt es.
 */
export function gefalleneWochen(log: PracticeLog, theorie: TheoryLog): number {
  const wochen = new Set<string>()
  for (const r of log.results) {
    const t = Date.parse(r.at)
    if (!Number.isNaN(t)) wochen.add(weekKey(new Date(t)))
  }
  for (const a of theorie.answers) {
    const t = Date.parse(a.at)
    if (!Number.isNaN(t)) wochen.add(weekKey(new Date(t)))
  }
  let n = 0
  for (const w of wochen) if (wochenTreffer(log, theorie, w).summe >= GEGNER_HP) n += 1
  return n
}
