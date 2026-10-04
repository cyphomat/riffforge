import { startBpmFor, type Profile } from "./profile"
import type { Drill, DrillResult, PracticeLog, Rating } from "./types"

export interface DrillProgress {
  drillId: string
  attempts: number
  /** Highest tempo ever rated "sauber" or better. */
  bestBpm: number | null
  lastBpm: number | null
  lastRating: Rating | null
  lastPlayedAt: string | null
  /** Best measured timing score, or null if the mic was never on for this drill. */
  bestTimingScore: number | null
}

const MIN_BPM = 40

/**
 * Was das Schema hergibt. Ein Ergebnis darüber fällt beim Lesen durch die
 * Prüfung — und legt dann nicht nur sich selbst, sondern den *ganzen* Log
 * beiseite. Deshalb steht die Grenze hier und nicht nur im Schema.
 */
const MAX_BPM = 300

/**
 * Ein Temposchritt als Anteil des Zieltempos.
 *
 * Fünf BPM heissen an den beiden Enden des Katalogs etwas völlig
 * Verschiedenes: auf einem Downpicking-Ziel von 190 sind das 2,6 %, auf einem
 * Bending-Ziel von 100 ganze 5 %. Genau deshalb hing die Rampe bisher am Drill
 * statt am Ziel, und genau das war der Fehler — der Drill, der die längste
 * Strecke vor sich hat, kroch am langsamsten.
 *
 * Vier Prozent liegt in der Mitte dessen, was der Katalog von Hand gewählt
 * hatte (2,6 bis 5 %, im Mittel knapp 3,8 %), sodass sich die meisten Drills
 * praktisch nicht bewegen.
 */
const SCHRITT_ANTEIL = 0.04

/**
 * Wie weit ein Tempo unter das Ziel fallen darf, bevor es eine andere Übung
 * ist. Bewusst tief: der Boden muss unter jedem Starttempo liegen, das ein
 * Profil erzeugen kann, sonst schöbe eine zähe Runde einen Anfänger nach oben.
 */
const BODEN_ANTEIL = 0.3

/** Ein Temposchritt für diesen Drill, in BPM. */
export function bpmStepFor(drill: Drill): number {
  return Math.max(2, Math.round(drill.targetBpm * SCHRITT_ANTEIL))
}

/** Das langsamste Tempo, bei dem das noch dieser Drill ist. */
export function floorBpmFor(drill: Drill): number {
  return Math.max(MIN_BPM, Math.round(drill.targetBpm * BODEN_ANTEIL))
}

/** Newest result first. */
export function resultsFor(log: PracticeLog, drillId: string): DrillResult[] {
  return log.results
    .filter((r) => r.drillId === drillId)
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}

export function progressFor(log: PracticeLog, drillId: string): DrillProgress {
  const results = resultsFor(log, drillId)
  const clean = results.filter((r) => r.rating >= 3)
  const measured = results.filter((r) => r.timing !== undefined)

  return {
    drillId,
    attempts: results.length,
    bestBpm: clean.length ? Math.max(...clean.map((r) => r.bpm)) : null,
    lastBpm: results[0]?.bpm ?? null,
    lastRating: results[0]?.rating ?? null,
    lastPlayedAt: results[0]?.at ?? null,
    bestTimingScore: measured.length ? Math.max(...measured.map((r) => r.timing!.score)) : null,
  }
}

/**
 * The tempo to open the next round at.
 *
 * Rated easy, move up twice the step; clean, one step; wobbly, hold; rough,
 * back off. Holding after a wobbly round is deliberate — repeating a tempo is
 * how it gets consolidated.
 */
export function nextBpm(drill: Drill, progress: DrillProgress, profile: Profile | null = null): number {
  if (progress.lastBpm === null || progress.lastRating === null) {
    // Beim ersten Mal zählt das Starttempo dieses Spielers, nicht das des
    // Katalogs — danach schreibt sich das Tempo ohnehin selbst fort.
    return startBpmFor(drill, profile)
  }

  const schritt = bpmStepFor(drill)
  const delta =
    progress.lastRating === 4
      ? schritt * 2
      : progress.lastRating === 3
        ? schritt
        : progress.lastRating === 2
          ? 0
          : -schritt

  const naechstes = Math.round(progress.lastBpm + delta)
  return Math.min(MAX_BPM, Math.max(floorBpmFor(drill), naechstes))
}

/**
 * 0 = beim eigenen Starttempo, 1 = Ziel sauber erreicht.
 *
 * Gemessen ab dem Tempo, bei dem *dieser* Spieler angefangen hat. Vorher lief
 * die Rechnung immer ab `drill.startBpm` aus dem Katalog, während
 * `startBpmFor` das Starttempo mit dem Profil skaliert — wer „spielt
 * regelmässig" angegeben hatte, stand nach der ersten sauberen Runde bei einem
 * Viertel, ohne es erspielt zu haben, und ein Anfänger klebte zwei Runden auf
 * null. Das ist nicht nur eine schiefe Anzeige: `priorityOf` wählt über
 * `1 - mastery` aus, die Verzerrung verschob also auch, welcher Drill drankam.
 *
 * Ohne Profil ändert sich nichts — `startBpmFor(drill, null)` gibt genau
 * `drill.startBpm` zurück, und ein Test hält das fest.
 */
export function masteryOf(
  drill: Drill,
  progress: DrillProgress,
  profile: Profile | null = null,
): number {
  if (progress.bestBpm === null) return 0
  const von = startBpmFor(drill, profile)
  const span = drill.targetBpm - von
  if (span <= 0) return 1
  return Math.max(0, Math.min(1, (progress.bestBpm - von) / span))
}

export function daysSince(iso: string | null, now: Date = new Date()): number {
  if (!iso) return Number.POSITIVE_INFINITY
  return (now.getTime() - Date.parse(iso)) / 86_400_000
}

/** Local-time YYYY-MM-DD, so a session at 23:50 counts for that day. */
export function dayKey(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, "0")
  const day = `${date.getDate()}`.padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function practiceDays(log: PracticeLog): string[] {
  const days = new Set(log.results.map((r) => dayKey(new Date(r.at))))
  return [...days].sort()
}

/** The Monday of the week a date falls in, as a local YYYY-MM-DD key. */
export function weekKey(date: Date): string {
  const monday = new Date(date)
  monday.setHours(12, 0, 0, 0)
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return dayKey(monday)
}

/**
 * Die Serie, in Wochen gezählt — wie bei Setlist.
 *
 * Gezählt werden Wochen mit mindestens einer Übung, nicht Tage. Eine Serie in
 * Tagen riss nach einem einzigen verpassten Abend, und wer einmal gerissen
 * ist, hat einen Grund weniger, morgen wieder anzufangen. Belohnt wird
 * Regelmässigkeit, nicht Lückenlosigkeit.
 *
 * Die laufende Woche zählt, sobald in ihr geübt wurde. Solange noch nicht,
 * ist sie nicht verloren — sie ist nur noch nicht vorbei; gezählt wird dann
 * ab der Woche davor.
 */
export function streakWeeks(log: PracticeLog, now: Date = new Date()): number {
  const weeks = new Set(log.results.map((r) => weekKey(new Date(r.at))))
  if (weeks.size === 0) return 0

  const cursor = new Date(now)
  cursor.setHours(12, 0, 0, 0)
  if (!weeks.has(weekKey(cursor))) cursor.setDate(cursor.getDate() - 7)

  let streak = 0
  while (weeks.has(weekKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

export function daysPractisedInLast(log: PracticeLog, span: number, now: Date = new Date()): number {
  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - (span - 1))
  const from = dayKey(cutoff)
  return practiceDays(log).filter((day) => day >= from).length
}

export function totalMinutes(log: PracticeLog): number {
  return Math.round(log.results.reduce((sum, r) => sum + r.seconds, 0) / 60)
}
