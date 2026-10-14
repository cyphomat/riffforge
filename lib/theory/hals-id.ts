import type { TheoryAnswer } from "./types"

/**
 * The fretboard trainer answers into the theory log under this prefix.
 *
 * Its own file because both sides need it: the trainer to name its places,
 * and every count over the theory log — badges, hit rate — to leave them out.
 * Seventy-two places in two directions are not knowledge cards, and counted
 * as such they would hand out "100 Karten sitzen" for a week of finding F.
 */
export const HALS_PREFIX = "hals-"

/** Whether an answer belongs to the trainer rather than to a knowledge card. */
export function istHalsAntwort(antwort: Pick<TheoryAnswer, "cardId">): boolean {
  return antwort.cardId.startsWith(HALS_PREFIX)
}
