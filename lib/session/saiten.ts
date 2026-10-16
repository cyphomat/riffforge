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
 */
export function saitenStand(log: PracticeLog, gewechselt: string | null, heute: Date = new Date()): SaitenStand | null {
  if (!gewechselt) return null
  const tage = new Set(
    log.results
      .filter((r) => !Number.isNaN(Date.parse(r.at)))
      .map((r) => dayKey(new Date(r.at)))
      .filter((tag) => tag >= gewechselt),
  )
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
