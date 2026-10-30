import { z } from "zod"
import { dayKey } from "./progress"
import type { DrillResult, PracticeLog } from "./types"

/**
 * Wo eine Session steht, damit ein Verlassen und Zurückkommen sie nicht
 * zerstört.
 *
 * Gemerkt wird nicht der Plan, sondern nur die Stelle: der Plan folgt aus
 * Tag, Log zu Beginn und Profil (siehe `tagesZufall`) und lässt sich daher
 * genau so wieder bauen. Den Log zu Beginn liefert `ausgangsLog`: der heutige
 * Log ohne das, was seit `startedAt` hinzukam. Das hält die Regel „der Log ist
 * append-only" ein — hier wird nichts umgeschrieben, nur zurückgerechnet.
 *
 * Der Stand gilt nur am selben Tag und für dieselbe Anfrage (Minuten, Drill).
 */
export const sessionStandSchema = z.object({
  version: z.literal(1),
  tag: z.string(),
  minutes: z.number(),
  drillId: z.string().optional(),
  startedAt: z.string(),
  current: z.number().int().min(0),
  erledigteEinschuebe: z.array(z.number().int()),
  beantworteteFragen: z.number().int().min(0),
  carried: z.record(z.string(), z.object({ seconds: z.number(), bpm: z.number() })),
})

export type SessionStand = z.infer<typeof sessionStandSchema>

export function stehtNoch(
  stand: SessionStand | null,
  anfrage: { minutes: number; drillId?: string; jetzt: Date },
): stand is SessionStand {
  return (
    stand !== null &&
    stand.current > 0 &&
    stand.tag === dayKey(anfrage.jetzt) &&
    stand.minutes === anfrage.minutes &&
    stand.drillId === anfrage.drillId
  )
}

export function ergebnisseSeit(log: PracticeLog, startedAt: string): DrillResult[] {
  const ab = Date.parse(startedAt)
  return log.results.filter((r) => Date.parse(r.at) >= ab)
}

export function ausgangsLog(log: PracticeLog, startedAt: string): PracticeLog {
  const ab = Date.parse(startedAt)
  return { ...log, results: log.results.filter((r) => Date.parse(r.at) < ab) }
}
