import { z } from "zod"
import { TUERCHEN } from "./advent-daten"
import { SONG_DRILLS } from "./drills-songs"

/**
 * Das Riffbuch: welche Riffe du schon gehört hast.
 *
 * Anders als Gurt, Quests und Board fällt das nicht aus dem Log: dass ein Riff
 * erklungen ist, steht nirgends. Gespeichert wird es deshalb, aber nur auf
 * diesem Gerät und nicht im Abgleich — es ist eine Hörliste, nichts Verdientes,
 * und ein zweites Gerät fängt mit einem leeren Buch an. Dafür gibt es zwei
 * Regeln: das erste Datum bleibt (ein Riff wird nicht „neu" gehört), und
 * Kaputtes fällt auf ein leeres Buch zurück.
 */

export const riffbuchSchema = z.object({
  /** Kennung des Riffs → wann es zum ersten Mal ganz durchgespielt wurde, ISO. */
  gehoert: z.record(z.string(), z.string().refine((s) => !Number.isNaN(Date.parse(s)), "kein Datum")),
})
export type Riffbuch = z.infer<typeof riffbuchSchema>

export const LEERES_BUCH: Riffbuch = { gehoert: {} }

export interface RiffEintrag {
  id: string
  titel: string
  herkunft: "song" | "advent"
}

/** Alles, was im Buch stehen kann: die Songs und die Advents-Riffe. */
export const ALLE_RIFFE: RiffEintrag[] = [
  ...SONG_DRILLS.map((d): RiffEintrag => ({ id: d.id, titel: d.title, herkunft: "song" })),
  ...TUERCHEN.flatMap((t): RiffEintrag[] => (t.art === "riff" ? [{ id: t.riff.id, titel: t.riff.titel, herkunft: "advent" }] : [])),
]

/** Das Riff ist gehört. Das erste Datum bleibt, Unbekanntes kommt nicht hinein. */
export function gehoert(buch: Riffbuch, id: string, jetzt: Date = new Date()): Riffbuch {
  if (!ALLE_RIFFE.some((r) => r.id === id) || id in buch.gehoert) return buch
  return { gehoert: { ...buch.gehoert, [id]: jetzt.toISOString() } }
}

export interface BuchStand {
  gehoert: Array<RiffEintrag & { am: string }>
  /** Wie viele noch nicht. Die Titel stehen nicht da: ein ungehörtes Riff ist ein Umriss. */
  offen: number
}

export function buchStand(buch: Riffbuch): BuchStand {
  const gehoertListe = ALLE_RIFFE.flatMap((r) => (r.id in buch.gehoert ? [{ ...r, am: buch.gehoert[r.id] }] : [])).sort((a, b) =>
    a.am.localeCompare(b.am),
  )
  return { gehoert: gehoertListe, offen: ALLE_RIFFE.length - gehoertListe.length }
}
