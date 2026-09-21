import { SIEBEN_DRILLS } from "./drills-sieben"
import { rangfolge, toBlock, type BuildOptions } from "./builder"
import type { PracticeLog, SessionPlan } from "./types"

/**
 * Der Sieben-Saiter-Modus.
 *
 * Ein eigener Weg, kein zweiter Hauptweg: er hat einen eigenen Katalog, eine
 * eigene, kürzere Form und einen eigenen Eingang. Was ihn vom Rest trennt,
 * ist keine Design-Laune — man braucht eine andere Gitarre dafür. Ein Drill,
 * den man nicht spielen kann, weil das Instrument im Koffer liegt, hat in der
 * täglichen Viertelstunde nichts verloren.
 *
 * Was er **nicht** anders macht: Tempo, Bewertung und Log. Die Blöcke landen
 * im selben Übungs-Log wie alles andere, jeder Drill mit eigener Nummer und
 * eigener Tempokurve. Ein zweiter Log wäre eine zweite Wahrheit.
 *
 * Und keine Wissensfragen. Das hier ist ein Handwerks-Modus: die zehn
 * Minuten sind knapp, und was es über die tiefe Saite zu wissen gibt, steht
 * im `why` am Drill — dort, wo die Hände gerade damit beschäftigt sind.
 */

/** Aufwärmen ist kurz — dieselbe Länge wie in der grossen Session. */
const AUFWAERMEN_SEKUNDEN = 120

/** Technik und Riff. Drei Minuten sind eine Runde, in der etwas passiert. */
const BLOCK_SEKUNDEN = 180

/**
 * Drei Blöcke: Aufwärmen, Technik, Riff.
 *
 * Keine zweite Runde mit Abstand dazwischen — das ist die Form der
 * Viertelstunde und lebt davon, dass genug Zeit für zwei Anläufe da ist.
 * Hier wäre jede Runde zu kurz, um hineinzukommen; verteilte Wiederholung
 * findet zwischen den Tagen statt, nicht innerhalb von zehn Minuten.
 */
export function buildSiebenSession(log: PracticeLog, options: BuildOptions = {}): SessionPlan {
  const now = options.now ?? new Date()
  const random = options.random ?? Math.random
  const profile = options.profile ?? null

  const waehle = (kind: "warmup" | "technique" | "riff") =>
    rangfolge(SIEBEN_DRILLS, kind, log, now, random, profile)[0]

  const blocks = [
    toBlock(waehle("warmup"), log, AUFWAERMEN_SEKUNDEN, 1, 1, profile),
    toBlock(waehle("technique"), log, BLOCK_SEKUNDEN, 1, 1, profile),
    toBlock(waehle("riff"), log, BLOCK_SEKUNDEN, 1, 1, profile),
  ]

  return {
    blocks,
    totalSeconds: blocks.reduce((summe, block) => summe + block.seconds, 0),
  }
}

/**
 * Der nächste Block, wenn jemand verlängern will.
 *
 * Nimmt den höchstplatzierten Drill, der noch nicht dran war — und wenn
 * alles dran war, den dringendsten noch einmal, statt das Verlängern zu
 * verweigern.
 */
export function naechsterSiebenBlock(
  log: PracticeLog,
  gespielteIds: string[],
  options: BuildOptions = {},
): SessionPlan["blocks"][number] {
  const now = options.now ?? new Date()
  const random = options.random ?? Math.random
  const profile = options.profile ?? null

  const kandidaten = [
    ...rangfolge(SIEBEN_DRILLS, "technique", log, now, random, profile),
    ...rangfolge(SIEBEN_DRILLS, "riff", log, now, random, profile),
  ]
  const offen = kandidaten.find((drill) => !gespielteIds.includes(drill.id)) ?? kandidaten[0]
  return toBlock(offen, log, BLOCK_SEKUNDEN, 1, 1, profile)
}

/**
 * Die Stimmung in Worten — für den Startbildschirm.
 *
 * Steht hier und nicht in der Komponente, weil es eine Aussage über das
 * Instrument ist und nicht über das Layout: wer den Modus anfasst, soll die
 * Stimmung an einer Stelle finden.
 */
export const STIMMUNG = {
  name: "B Standard",
  saiten: ["B", "E", "A", "D", "G", "B", "E"],
  /** Von der tiefsten zur höchsten, wie man sie beim Stimmen durchgeht. */
  satz: "B – E – A – D – G – B – E",
} as const
