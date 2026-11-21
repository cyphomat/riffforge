import { RAENGE, rang } from "./merch"
import type { BoardWahl } from "./board"
import type { PracticeLog } from "./types"

/**
 * Die Band: wer in der Wiedergabe mitspielt.
 *
 * Mitglieder kommen mit dem Rang — der fällt aus dem Log und nie zurück, also
 * geht auch keiner wieder. Gespeichert wird nichts; ob einer mitspielen soll,
 * gehört dem Gerät (`BoardWahl.bandAus`). Gespielt wird nur in der Wiedergabe,
 * nie im Block: dort misst das Mikro, und eine Band, die sich selbst im Mikro
 * hört, wäre jede Timing-Messung als Rauschen.
 */

export const BAND = [
  { id: "schlagzeug", name: "Schlagzeug", wirkung: "Ein Rock-Beat im Tempo: Kick, Snare, Hi-Hat.", rangAb: "proberaum" },
  { id: "bass", name: "Bass", wirkung: "Der Grundton des Songs auf jedem Schlag.", rangAb: "vorband" },
] as const

export type BandId = (typeof BAND)[number]["id"]

/** Die Stufe, ab der ein Mitglied dabei ist. */
export function stufeAb(id: BandId): number {
  const rangAb = BAND.find((b) => b.id === id)!.rangAb
  return RAENGE.findIndex((r) => r.id === rangAb)
}

/** Wer schon dabei ist, nach dem Rang im Log. */
export function dabei(log: PracticeLog): BandId[] {
  const stufe = rang(log).stufe
  return BAND.filter((b) => stufe >= stufeAb(b.id)).map((b) => b.id)
}

export interface BandAn {
  schlagzeug: boolean
  bass: boolean
}

/** Wer jetzt mitspielt: dabei und nicht abgewählt. */
export function bandAn(log: PracticeLog, wahl: BoardWahl): BandAn {
  const da = new Set(dabei(log))
  const an = (id: BandId) => da.has(id) && !wahl.bandAus.includes(id)
  return { schlagzeug: an("schlagzeug"), bass: an("bass") }
}

/** Ein Mitglied an- oder abwählen, ohne die Wahl sonst anzufassen. */
export function bandUmschalten(wahl: BoardWahl, id: BandId): BoardWahl {
  if (!BAND.some((b) => b.id === id)) return wahl
  return { ...wahl, bandAus: wahl.bandAus.includes(id) ? wahl.bandAus.filter((x) => x !== id) : [...wahl.bandAus, id] }
}
