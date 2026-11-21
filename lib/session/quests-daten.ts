import { z } from "zod"

/**
 * Die Quests: Ziele aus dem Übungs-Log mit einem Stück fürs Board als Lohn.
 *
 * Kein Gold, nichts zu kaufen: ein Stück gibt es, weil etwas geschafft ist.
 * Erfüllt ist erfüllt — und weil der Log append-only ist, kann keine Quest
 * wieder offen werden. Drops (`drops.ts`) dürfen weitere Quests tragen; sie
 * gehen durch dasselbe Schema.
 */

export const QUEST_TYPEN = [
  "uebungstage",
  "wochen",
  "saubere_bloecke",
  "ziel_riffe",
  "wissen_richtig",
  "gegner_wochen",
  "plektren",
] as const
export type QuestTyp = (typeof QUEST_TYPEN)[number]

export const questSchema = z.object({
  id: z.string().regex(/^quest-[a-z-]+$/),
  name: z.string().trim().min(1).max(32),
  text: z.string().trim().min(1).max(160),
  stufe: z.enum(["episch", "legendär"]),
  regel: z.object({ typ: z.enum(QUEST_TYPEN), n: z.number().int().min(1).max(100000) }),
  /** Ein Pedal (`fx-…`) oder ein Amp (`amp-…`) aus `board-daten.ts`. */
  lohn: z.object({ art: z.enum(["pedal", "amp"]), id: z.string().regex(/^(fx|amp)-[a-z-]+$/) }),
})
export type Quest = z.infer<typeof questSchema>

export const QUESTS: Quest[] = [
  { id: "quest-aufgewaermt", name: "Aufgewärmt", text: "An 5 verschiedenen Tagen geübt.", stufe: "episch", regel: { typ: "uebungstage", n: 5 }, lohn: { art: "pedal", id: "fx-chorus" } },
  { id: "quest-dranbleiber", name: "Dranbleiber", text: "In 4 verschiedenen Wochen geübt.", stufe: "episch", regel: { typ: "wochen", n: 4 }, lohn: { art: "pedal", id: "fx-tremolo" } },
  { id: "quest-sauberer-anschlag", name: "Sauberer Anschlag", text: "25 Blöcke mit „Sauber“ oder besser.", stufe: "episch", regel: { typ: "saubere_bloecke", n: 25 }, lohn: { art: "pedal", id: "fx-delay" } },
  { id: "quest-tempo-schmied", name: "Tempo-Schmied", text: "3 verschiedene Riffe im Zieltempo gespielt.", stufe: "legendär", regel: { typ: "ziel_riffe", n: 3 }, lohn: { art: "pedal", id: "fx-distortion" } },
  { id: "quest-wissensdurst", name: "Wissensdurst", text: "50 Fragen richtig beantwortet.", stufe: "episch", regel: { typ: "wissen_richtig", n: 50 }, lohn: { art: "pedal", id: "fx-reverb" } },
  { id: "quest-gegnerbezwinger", name: "Gegnerbezwinger", text: "Einen Wochengegner besiegt.", stufe: "episch", regel: { typ: "gegner_wochen", n: 1 }, lohn: { art: "amp", id: "amp-roehrenkomet" } },
  { id: "quest-gegnerjaeger", name: "Gegnerjäger", text: "Vier Wochengegner besiegt.", stufe: "legendär", regel: { typ: "gegner_wochen", n: 4 }, lohn: { art: "amp", id: "amp-backline" } },
  { id: "quest-gurt-voll", name: "Voller Gurt", text: "5 Riff-Plektren am Gurt.", stufe: "legendär", regel: { typ: "plektren", n: 5 }, lohn: { art: "amp", id: "amp-saegewerk" } },
]
