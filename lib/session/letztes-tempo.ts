import type { PracticeLog } from "./types"

/**
 * Das Tempo des zuletzt gespielten Blocks, oder `null`.
 *
 * Gelesen wird nach dem Zeitstempel, nicht nach der Stelle im Array: der Log
 * wird zwischen Geräten verschmolzen, und danach sagt die Reihenfolge nichts.
 * Bei gleichem Zeitstempel gilt der spätere Eintrag. Einträge mit einem
 * Zeitstempel, den `Date` nicht lesen kann, zählen nicht.
 *
 * `grenzen` legt fest, was der Aufrufer brauchen kann; ein Tempo außerhalb gibt
 * `null` statt eines zurechtgebogenen Werts. Wer ein langsames Warm-up gespielt
 * hat, soll nicht still ein anderes Tempo bekommen, als er gespielt hat.
 *
 * Rein: liest nichts, schreibt nichts. Der Log bleibt append-only.
 */
export function letztesTempo(log: PracticeLog, grenzen: { min: number; max: number }): number | null {
  let neuester: { bpm: number; zeit: number } | null = null
  for (const result of log.results) {
    const zeit = Date.parse(result.at)
    if (Number.isNaN(zeit)) continue
    if (neuester === null || zeit >= neuester.zeit) neuester = { bpm: result.bpm, zeit }
  }
  if (neuester === null) return null
  return neuester.bpm >= grenzen.min && neuester.bpm <= grenzen.max ? neuester.bpm : null
}
