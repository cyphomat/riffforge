import { ALLE_DRILLS_BY_ID, DRILLS } from "./drills"
import { daysSince, masteryOf, nextBpm, progressFor } from "./progress"
import { focusBonus, type Profile } from "./profile"
import type { BlockKind, Drill, PracticeLog, SessionBlock, SessionPlan } from "./types"

/** Share of the session each kind gets, after the fixed warm-up. */
const WARMUP_SECONDS = 120
/**
 * Unter dieser Länge lohnt eine Runde nicht: bis Griff und Tempo sitzen,
 * wäre sie vorbei.
 */
const MIN_ROUND_SECONDS = 90
/**
 * Anteil der ersten von zwei Runden. Etwas länger, weil dort das Reinkommen
 * steckt — die zweite Runde beginnt bereits warm.
 */
const FIRST_ROUND_SHARE = 0.55

export interface BuildOptions {
  minutes?: number
  now?: Date
  /** Deterministic tie-breaking for tests. */
  random?: () => number
  /** Aus der Ersteinrichtung: Starttempo und Schwerpunkt. */
  profile?: Profile | null
}

/**
 * How badly a drill wants to be picked.
 *
 * Two pulls: what is weakest (low mastery) and what has gone longest untouched.
 * Staleness saturates after a week so a drill skipped for a month does not
 * crowd out everything else forever.
 */
export function priorityOf(
  drill: Drill,
  log: PracticeLog,
  now: Date,
  profile: Profile | null = null,
): number {
  const progress = progressFor(log, drill.id)
  const weakness = 1 - masteryOf(drill, progress, profile)
  const staleness = Math.min(daysSince(progress.lastPlayedAt, now), 7) / 7

  // A drill never played is worth trying, but not ahead of a drill actively
  // being worked on and still far from target.
  const novelty = progress.attempts === 0 ? 0.15 : 0

  return weakness * 0.55 + staleness * 0.45 + novelty + focusBonus(drill, profile)
}

/**
 * Die Rangfolge innerhalb eines Katalogs.
 *
 * Der Katalog ist ein Parameter, weil es inzwischen zwei gibt: die tägliche
 * Viertelstunde zieht aus `DRILLS`, der Sieben-Saiter-Modus aus seinem
 * eigenen Vorrat. Die Auswahlregel ist in beiden dieselbe — zwei Fassungen
 * davon wären zwei Gelegenheiten, sie auseinanderlaufen zu lassen.
 */
export function rangfolge(
  katalog: Drill[],
  kind: BlockKind,
  log: PracticeLog,
  now: Date,
  random: () => number,
  profile: Profile | null,
): Drill[] {
  return katalog
    .filter((drill) => drill.kind === kind)
    .map((drill) => ({
      drill,
      // Small jitter so equal-priority drills rotate instead of locking in.
      score: priorityOf(drill, log, now, profile) + random() * 0.02,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.drill)
}

/** Dieselbe Rangfolge über den Hauptkatalog. */
function rank(
  kind: BlockKind,
  log: PracticeLog,
  now: Date,
  random: () => number,
  profile: Profile | null,
): Drill[] {
  return rangfolge(DRILLS, kind, log, now, random, profile)
}

/**
 * Ein Drill als Block, mit dem Tempo, das sein Log hergibt.
 *
 * Exportiert, weil der Sieben-Saiter-Modus seine drei Blöcke selbst
 * zusammenstellt, aber dieselbe Tempo-Fortschreibung braucht: derselbe Log,
 * dieselbe Rechnung.
 */
export function toBlock(
  drill: Drill,
  log: PracticeLog,
  seconds: number,
  round = 1,
  rounds = 1,
  profile: Profile | null = null,
): SessionBlock {
  return {
    drill,
    seconds,
    bpm: nextBpm(drill, progressFor(log, drill.id), profile),
    round,
    rounds,
  }
}

/**
 * Zerlegt die Zeit eines Drills in Runden.
 *
 * Zwei kurze Runden mit etwas anderem dazwischen behalten sich messbar besser
 * als eine lange am Stück — der Kontextinterferenz-Effekt. Das gilt aber fürs
 * *Behalten*, nicht fürs *Erlernen*: eine Bewegung, die die Hand noch nie
 * gemacht hat, braucht erst den Block am Stück. Deshalb bekommt nur ein Drill
 * mit Vorgeschichte zwei Runden.
 */
function roundsFor(
  drill: Drill,
  log: PracticeLog,
  seconds: number,
  profile: Profile | null,
): SessionBlock[] {
  const known = progressFor(log, drill.id).attempts > 0
  const first = Math.round((seconds * FIRST_ROUND_SHARE) / 15) * 15
  const second = seconds - first

  if (!known || Math.min(first, second) < MIN_ROUND_SECONDS) {
    return [toBlock(drill, log, seconds, 1, 1, profile)]
  }
  return [toBlock(drill, log, first, 1, 2, profile), toBlock(drill, log, second, 2, 2, profile)]
}

/** Abwechselnd aus beiden Listen — daher kommt das Interleaving. */
function interleave(a: SessionBlock[], b: SessionBlock[]): SessionBlock[] {
  const out: SessionBlock[] = []
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    if (a[i]) out.push(a[i])
    if (b[i]) out.push(b[i])
  }
  return out
}

/**
 * A session is one warm-up, then technique and riff work splitting whatever
 * time is left. The shape stays the same every day — that is the point; the
 * content is what adapts.
 */
export function buildSession(log: PracticeLog, options: BuildOptions = {}): SessionPlan {
  const minutes = options.minutes ?? 15
  const now = options.now ?? new Date()
  const random = options.random ?? Math.random

  const playable = Math.max(WARMUP_SECONDS + 120, minutes * 60 - 60)
  const remaining = playable - WARMUP_SECONDS
  const techniqueSeconds = Math.round(remaining / 2 / 30) * 30
  const riffSeconds = remaining - techniqueSeconds

  const profile = options.profile ?? null
  const warmup = rank("warmup", log, now, random, profile)[0]
  const technique = rank("technique", log, now, random, profile)[0]
  const riff = rank("riff", log, now, random, profile)[0]

  const blocks = [
    toBlock(warmup, log, WARMUP_SECONDS, 1, 1, profile),
    ...interleave(
      roundsFor(technique, log, techniqueSeconds, profile),
      roundsFor(riff, log, riffSeconds, profile),
    ),
  ]

  return {
    blocks,
    totalSeconds: blocks.reduce((sum, block) => sum + block.seconds, 0),
  }
}

/**
 * The "+10 Minuten" block: the next most-wanted drill that is not already in
 * the session, alternating technique and riff so an extended session keeps its
 * rhythm.
 */
export function nextExtraBlock(
  log: PracticeLog,
  used: SessionBlock[],
  options: BuildOptions = {},
): SessionBlock {
  const now = options.now ?? new Date()
  const random = options.random ?? Math.random
  const seconds = (options.minutes ?? 5) * 60

  const usedIds = new Set(used.map((block) => block.drill.id))
  const riffCount = used.filter((block) => block.drill.kind === "riff").length
  const techniqueCount = used.filter((block) => block.drill.kind === "technique").length
  const preferred: BlockKind = riffCount > techniqueCount ? "technique" : "riff"

  const profile = options.profile ?? null
  const candidates = [
    ...rank(preferred, log, now, random, profile),
    ...rank(preferred === "riff" ? "technique" : "riff", log, now, random, profile),
  ]

  // Everything played already? Then repeat the highest-priority drill rather
  // than refusing to extend the session.
  const drill = candidates.find((candidate) => !usedIds.has(candidate.id)) ?? candidates[0]

  return toBlock(drill, log, seconds, 1, 1, profile)
}

/**
 * A single drill on its own, for when you know exactly what you want to work
 * on. Same tempo logic and same logging as a full session.
 */
export function buildDrillSession(
  log: PracticeLog,
  drillId: string,
  options: BuildOptions = {},
): SessionPlan | null {
  // Über beide Kataloge gesucht: getrennt sind sie für die *Auswahl* durch
  // den Scheduler, nicht für die ausdrückliche Wahl. Wer im Katalog auf einen
  // Sieben-Saiter-Drill tippt, weiss, welche Gitarre er dafür braucht.
  const drill = ALLE_DRILLS_BY_ID[drillId]
  if (!drill) return null

  const seconds = Math.max(60, (options.minutes ?? 10) * 60)
  const blocks = [toBlock(drill, log, seconds, 1, 1, options.profile ?? null)]
  return { blocks, totalSeconds: seconds }
}
