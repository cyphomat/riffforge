import { z } from "zod"
import type { AmpKlang, BoardKette } from "@/lib/audio/board"
import { reihenfolge } from "@/lib/theory/effekte"
import { AMPS, AMPS_BY_ID, PEDALE, PEDALE_BY_ID, START_BESITZ, type Amp, type Pedal } from "./board-daten"

/**
 * Das Board als Rechnung: was man besitzt, was an ist, in welcher Reihenfolge.
 *
 * Die Reihenfolge ist die des Effektlexikons — vom Gitarrenausgang bis zur Box,
 * der Amp dort, wo `fx-amp` steht. Pedale vor dem Amp werden mitverzerrt, die
 * dahinter hören nur den fertigen Ton; deshalb steht ein Hall nie vor dem
 * Verzerrer, und das ist hier keine Wahl des Spielers.
 *
 * Besitz fällt aus dem Log (`quests.ts`); gespeichert wird nur die Wahl des
 * Geräts (was ausgeschaltet ist, welcher Amp steht), siehe `lib/storage/lokal.ts`.
 */

export interface Besitz {
  pedale: Set<string>
  amps: Set<string>
}

export const startBesitz = (): Besitz => ({ pedale: new Set(START_BESITZ.pedale), amps: new Set(START_BESITZ.amps) })

/** Gespeichert wird, was *aus* ist — ein neues Pedal ist damit von selbst an. */
export const boardWahlSchema = z.object({
  aus: z.array(z.string()).max(40),
  amp: z.string().nullable(),
})
export type BoardWahl = z.infer<typeof boardWahlSchema>
export const STANDARD_WAHL: BoardWahl = { aus: [], amp: null }

/** Die Stelle eines Pedals in der Kette; je kleiner, desto näher an der Gitarre. */
function stelle(id: string): number {
  const i = reihenfolge().findIndex((e) => e.id === id)
  return i === -1 ? Number.MAX_SAFE_INTEGER : i
}

const AMP_STELLE = () => stelle("fx-amp")

/** Alle Pedale, die man hat, in Signalrichtung. */
export function pedaleGeordnet(besitz: Besitz): Pedal[] {
  return PEDALE.filter((p) => besitz.pedale.has(p.id)).sort((a, b) => stelle(a.id) - stelle(b.id))
}

/** Der Amp, der steht: die Wahl, wenn sie noch gilt, sonst der stärkste, den man hat — der Übungscombo ist immer da. */
export function gewaehlterAmp(besitz: Besitz, wahl: BoardWahl): Amp {
  const gewahlt = wahl.amp ? AMPS_BY_ID[wahl.amp] : undefined
  if (gewahlt && besitz.amps.has(gewahlt.id)) return gewahlt
  return AMPS.find((a) => besitz.amps.has(a.id)) ?? AMPS[0]
}

export interface Kette {
  vor: Pedal[]
  amp: Amp
  nach: Pedal[]
}

/** Das Board, wie es jetzt klingt: nur was an ist, vor und hinter dem Amp. */
export function kette(besitz: Besitz, wahl: BoardWahl): Kette {
  const an = pedaleGeordnet(besitz).filter((p) => !wahl.aus.includes(p.id))
  const ampStelle = AMP_STELLE()
  return {
    vor: an.filter((p) => stelle(p.id) < ampStelle),
    amp: gewaehlterAmp(besitz, wahl),
    nach: an.filter((p) => stelle(p.id) > ampStelle),
  }
}

/** Die Kette als Klang für die Wiedergabe. */
export function alsKlang(k: Kette): BoardKette {
  const amp: AmpKlang = { gain: k.amp.gain, hoehen: k.amp.hoehen, mitten: k.amp.mitten }
  return { vor: k.vor.map((p) => p.klang), amp, nach: k.nach.map((p) => p.klang) }
}

/** Ein Pedal an- oder ausschalten, ohne die Wahl sonst anzufassen. */
export function umschalten(wahl: BoardWahl, id: string): BoardWahl {
  if (!(id in PEDALE_BY_ID)) return wahl
  return { ...wahl, aus: wahl.aus.includes(id) ? wahl.aus.filter((x) => x !== id) : [...wahl.aus, id] }
}
