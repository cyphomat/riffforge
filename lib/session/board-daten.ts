import { z } from "zod"
import { EFFEKTE_BY_ID } from "@/lib/theory/effekte"

/**
 * Das Board: die Pedale und Amps, die der Wiedergabe einen Klang geben.
 *
 * Alles hier ist eigene Erfindung, ohne Marken. Ein Pedal trägt die Kennung
 * seines Eintrags im Effektlexikon (`fx-…`): so steht sein Platz in der Kette
 * dort und nicht zweimal, und `board.test.ts` hält beide zusammen. Wer was
 * besitzt, rechnet `quests.ts` aus dem Log.
 */

const hex = z.string().regex(/^#[0-9a-f]{6}$/i)

export const klangSchema = z.discriminatedUnion("art", [
  z.object({ art: z.literal("gain"), wert: z.number().min(1).max(200) }),
  z.object({ art: z.literal("tremolo"), wert: z.number().min(2).max(12) }),
  z.object({ art: z.literal("chorus"), wert: z.number().min(0.3).max(3) }),
  z.object({ art: z.literal("delay") }),
  z.object({ art: z.literal("hall"), wert: z.number().min(0.8).max(4) }),
])

export const pedalSchema = z.object({
  /** Die Kennung im Effektlexikon. */
  id: z.string().regex(/^fx-[a-z-]+$/),
  name: z.string().trim().min(1).max(24),
  typ: z.string().trim().min(1).max(28),
  wirkung: z.string().trim().min(1).max(110),
  farbe: hex,
  akz: hex,
  klang: klangSchema,
})

export const ampSchema = z.object({
  id: z.string().regex(/^amp-[a-z-]+$/),
  name: z.string().trim().min(1).max(24),
  typ: z.string().trim().min(1).max(28),
  wirkung: z.string().trim().min(1).max(110),
  gain: z.number().min(1).max(200),
  hoehen: z.number().min(1200).max(5000),
  mitten: z.number().min(-9).max(9),
  form: z.enum(["combo", "stack"]),
})

export type Pedal = z.infer<typeof pedalSchema>
export type Amp = z.infer<typeof ampSchema>

export const PEDALE: Pedal[] = [
  { id: "fx-overdrive", name: "Rostiger Anschieber", typ: "Overdrive", wirkung: "Schiebt den Amp an, ohne selbst zu zerren.", farbe: "#3f8f4e", akz: "#e8c23a", klang: { art: "gain", wert: 6 } },
  { id: "fx-distortion", name: "Zerrbrett", typ: "Distortion", wirkung: "Hartes Zerren mit scharfer Kante. Der Metal-Standard.", farbe: "#c8322b", akz: "#f1efe8", klang: { art: "gain", wert: 40 } },
  { id: "fx-chorus", name: "Doppelgänger", typ: "Chorus", wirkung: "Legt eine leicht verstimmte Kopie dazu: breit und wässrig.", farbe: "#2d64b8", akz: "#f1efe8", klang: { art: "chorus", wert: 0.8 } },
  { id: "fx-tremolo", name: "Zitterpartie", typ: "Tremolo", wirkung: "Die Lautstärke pulsiert im Takt der Hand.", farbe: "#6d3fa0", akz: "#e8c23a", klang: { art: "tremolo", wert: 6 } },
  { id: "fx-delay", name: "Echo im Keller", typ: "Delay", wirkung: "Wiederholt jeden Ton, im Tempo als punktierte Achtel.", farbe: "#1f1f22", akz: "#e07a26", klang: { art: "delay" } },
  { id: "fx-reverb", name: "Kathedrale", typ: "Hall", wirkung: "Ein großer Raum hinter dem Ton.", farbe: "#6c7377", akz: "#efe2c4", klang: { art: "hall", wert: 2.2 } },
]

export const AMPS: Amp[] = [
  { id: "amp-uebungscombo", name: "Übungscombo", typ: "Combo", wirkung: "Klein, sauber, brav. Der erste Amp.", gain: 4, hoehen: 4500, mitten: 0, form: "combo" },
  { id: "amp-roehrenkomet", name: "Röhrenkomet", typ: "Combo", wirkung: "Zerrt von selbst, wenn man ihn lässt.", gain: 30, hoehen: 4200, mitten: 2, form: "combo" },
  { id: "amp-backline", name: "Backline", typ: "Stack", wirkung: "Zwei Türme und viel Druck. Strafft die Mitten.", gain: 70, hoehen: 3600, mitten: -2, form: "stack" },
  { id: "amp-saegewerk", name: "Sägewerk", typ: "Stack", wirkung: "Dichtes Hochgain, die Höhen kappt die Box.", gain: 120, hoehen: 3000, mitten: 3, form: "stack" },
]

export const PEDALE_BY_ID: Record<string, Pedal> = Object.fromEntries(PEDALE.map((p) => [p.id, p]))
export const AMPS_BY_ID: Record<string, Amp> = Object.fromEntries(AMPS.map((a) => [a.id, a]))

/** Was von Anfang an da ist. */
export const START_BESITZ = { pedale: ["fx-overdrive"], amps: ["amp-uebungscombo"] } as const

/** Jedes Pedal muss im Lexikon stehen, sonst gäbe es keinen Platz in der Kette. */
export function imLexikon(p: Pedal): boolean {
  return p.id in EFFEKTE_BY_ID
}
