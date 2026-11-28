import { z } from "zod"
import { dayKey } from "./progress"
import type { PracticeLog } from "./types"

/**
 * When the strings want changing — from the log, not from a calendar alone.
 *
 * Strings die of playing more than of time: sweat and wear take the top end
 * and then the intonation. So the count that matters is days practised since
 * they went on. Time still counts as a second limit, because strings that hang
 * on a guitar for months go dull and rusty even when nobody plays them.
 *
 * Twenty-five practice days is the number Roadie used for the same reminder,
 * from the same log; one source would be better than two, and this is the one
 * that knows the log first-hand.
 */

/** Practice days after which a set counts as played out. */
export const SAITEN_UEBUNGSTAGE = 25
/** Calendar days after which a set is due anyway. */
export const SAITEN_TAGE = 90

export interface SaitenStand {
  /** The day the current set went on, `YYYY-MM-DD`. */
  seit: string
  /** Distinct days with practice since then, the day itself included. */
  uebungstage: number
  /** Calendar days since then. */
  tage: number
  faellig: boolean
  /** Which limit made it due, for the sentence that says so. */
  grund: "gespielt" | "alt" | null
}

/**
 * The state of the current set, or null when no change has been noted —
 * without a starting point there is nothing honest to say.
 *
 * `gespielteTage`: the days one particular guitar was in hand. Without it,
 * every practice day in the log counts.
 */
export function saitenStand(
  log: PracticeLog,
  gewechselt: string | null,
  heute: Date = new Date(),
  gespielteTage?: string[],
): SaitenStand | null {
  if (!gewechselt) return null
  const alle =
    gespielteTage ??
    log.results.filter((r) => !Number.isNaN(Date.parse(r.at))).map((r) => dayKey(new Date(r.at)))
  const tage = new Set(alle.filter((tag) => tag >= gewechselt))
  const start = new Date(`${gewechselt}T12:00:00`)
  const jetzt = new Date(`${dayKey(heute)}T12:00:00`)
  const kalendertage = Math.max(0, Math.round((jetzt.getTime() - start.getTime()) / 86400e3))
  const gespielt = tage.size >= SAITEN_UEBUNGSTAGE
  const alt = kalendertage >= SAITEN_TAGE
  return {
    seit: gewechselt,
    uebungstage: tage.size,
    tage: kalendertage,
    faellig: gespielt || alt,
    grund: gespielt ? "gespielt" : alt ? "alt" : null,
  }
}

const tagSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/**
 * Was dieses Gerät über die Saiten weiss: je Gitarre der letzte Wechsel und
 * die Tage, an denen sie in der Hand war. `gewechselt` ist der Eintrag ohne
 * Gitarre — von früher, oder wenn das Rack leer ist.
 */
export const saitenBuchSchema = z.object({
  gewechselt: tagSchema.optional(),
  je: z.record(z.string(), tagSchema).default({}),
  tage: z.record(z.string(), z.array(tagSchema)).default({}),
})

export type SaitenBuch = z.infer<typeof saitenBuchSchema>

export const LEERES_SAITENBUCH: SaitenBuch = { je: {}, tage: {} }

/**
 * Neue Saiten auf `gitarre`. Der erste Eintrag mit Gitarre löst den ohne ab;
 * Spieltage des alten Satzes fallen weg.
 */
export function aufgezogen(buch: SaitenBuch, gitarre: string | null, tag: string): SaitenBuch {
  if (gitarre === null) return { ...buch, gewechselt: tag }
  return {
    je: { ...buch.je, [gitarre]: tag },
    tage: { ...buch.tage, [gitarre]: (buch.tage[gitarre] ?? []).filter((t) => t >= tag) },
  }
}

/** Merkt, dass `gitarre` an diesem Tag gespielt wurde. */
export function gespielt(buch: SaitenBuch, gitarre: string, tag: string): SaitenBuch {
  const bisher = buch.tage[gitarre] ?? []
  if (bisher.includes(tag)) return buch
  return { ...buch, tage: { ...buch.tage, [gitarre]: [...bisher, tag] } }
}

export interface SaitenZeile {
  /** null: der Eintrag ohne Gitarre. */
  gitarre: string | null
  stand: SaitenStand | null
}

/**
 * Eine Zeile je Gitarre im Rack. Ab zwei Gitarren zählen nur die Tage, an
 * denen genau diese gewürfelt war; mit einer ist jeder Übungstag ihrer. Der
 * Eintrag ohne Gitarre steht oben, solange noch keine einen eigenen hat.
 */
export function saitenZeilen(
  log: PracticeLog,
  buch: SaitenBuch,
  rack: string[],
  heute: Date = new Date(),
): SaitenZeile[] {
  const ohne = { gitarre: null, stand: saitenStand(log, buch.gewechselt ?? null, heute) }
  if (rack.length === 0) return [ohne]
  const zeilen = rack.map((gitarre) => ({
    gitarre,
    stand: saitenStand(
      log,
      buch.je[gitarre] ?? null,
      heute,
      rack.length >= 2 ? (buch.tage[gitarre] ?? []) : undefined,
    ),
  }))
  return ohne.stand && zeilen.every((z) => z.stand === null) ? [ohne, ...zeilen] : zeilen
}
