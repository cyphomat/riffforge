import { DRILLS_BY_ID } from "./drills"
import { dayKey, daysSince, progressFor, streakWeeks } from "./progress"
import type { DrillResult, PracticeLog } from "./types"

/**
 * Der Ton des Tages — wie Setlists Ansage.
 *
 * Der Unterschied zu einem Logbuch: die App hat eine Meinung dazu, was heute
 * ansteht. Jede Zeile hier muss aus dem Log ableitbar sein; behauptet wird
 * nichts.
 */
export type BriefingTone = "erste" | "zurueck" | "technik" | "solide" | "hart"

export interface Briefing {
  tone: BriefingTone
  /** Die Ansage. Kurz, versal gesetzt. */
  line: string
  /** Woran sie festgemacht ist — nachprüfbar im Log. */
  reason: string
}

/** Ab hier zählt eine Pause als Pause. */
const BREAK_DAYS = 7
/**
 * Ab hier darf es wehtun: drei Wochen in Folge geübt. In Wochen gezählt,
 * wie die Serie überall in der App — drei Tage am Stück waren ein Wochenende,
 * drei Wochen sind eine Gewohnheit.
 */
const STREAK_FOR_HARD = 3

function lastSessionResults(log: PracticeLog): DrillResult[] {
  if (log.results.length === 0) return []
  const sorted = [...log.results].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
  const latest = new Date(sorted[0].at).toDateString()
  return sorted.filter((result) => new Date(result.at).toDateString() === latest)
}

function titleOf(result: DrillResult): string {
  return DRILLS_BY_ID[result.drillId]?.title ?? result.drillId
}

export function briefingFor(log: PracticeLog, now: Date = new Date()): Briefing {
  const recent = lastSessionResults(log)

  if (recent.length === 0) {
    return {
      tone: "erste",
      line: "Erste Session",
      reason: "Warm-up, eine Technik, ein Riff. Fünfzehn Minuten, dann ist Feierabend.",
    }
  }

  const days = Math.floor(daysSince(recent[0].at, now))

  if (days >= BREAK_DAYS) {
    return {
      tone: "zurueck",
      line: `Nach ${days} Tagen zurück`,
      reason:
        "Die Tempi stehen, wo du aufgehört hast. Nimm die erste Runde als Aufwärmen und geh erst danach ran.",
    }
  }

  // Ein wackeliger Block wiegt schwerer als drei saubere: was nicht sitzt,
  // bestimmt den Ton.
  const weakest = recent.filter((result) => result.rating <= 2).sort((a, b) => a.rating - b.rating)[0]
  if (weakest) {
    return {
      tone: "technik",
      line: "Heute sauber, nicht schnell",
      reason: `${titleOf(weakest)} war zuletzt ${
        weakest.rating === 1 ? "zäh" : "wackelig"
      } bei ${weakest.bpm} BPM. Das Tempo bleibt, bis es sitzt.`,
    }
  }

  const streak = streakWeeks(log, now)
  if (streak >= STREAK_FOR_HARD) {
    // Den Drill nennen, der am weitesten ist — das ist die Zahl, auf die man
    // stolz sein kann.
    const best = recent
      .map((result) => ({ result, drill: DRILLS_BY_ID[result.drillId] }))
      .filter((entry) => entry.drill && entry.drill.kind !== "warmup")
      .sort((a, b) => b.result.bpm - a.result.bpm)[0]

    return {
      tone: "hart",
      line: "Läuft — heute darf es wehtun",
      reason: best
        ? `${streak} Wochen in Folge. ${best.drill!.title} steht bei ${
            progressFor(log, best.result.drillId).bestBpm ?? best.result.bpm
          } von ${best.drill!.targetBpm} BPM.`
        : `${streak} Wochen in Folge.`,
    }
  }

  const last = recent.find((result) => DRILLS_BY_ID[result.drillId]?.kind !== "warmup") ?? recent[0]
  // Nach Kalendertag, nicht nach 24 Stunden: gestern Abend ist gestern,
  // auch wenn es erst zwölf Stunden her ist.
  const playedToday = dayKey(new Date(recent[0].at)) === dayKey(now)
  return {
    tone: "solide",
    line: playedToday ? "Nochmal" : "Weiter im Text",
    reason: `Zuletzt ${titleOf(last)} bei ${last.bpm} BPM, und es lief. Da machen wir weiter.`,
  }
}

/** Kalt und analytisch für Technik, heiss für die harten Tage. */
export const TONE_CLASS: Record<BriefingTone, string> = {
  erste: "text-akzent",
  zurueck: "text-stahl",
  technik: "text-stahl",
  solide: "text-gruen",
  hart: "text-rost",
}

export const TONE_LABEL: Record<BriefingTone, string> = {
  erste: "Start",
  zurueck: "Pause",
  technik: "Technik",
  solide: "Solide",
  hart: "Hart",
}
