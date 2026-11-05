import { ALLE_DRILLS_BY_ID } from "./drills"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import { dayKey } from "./progress"
import type { Drill, PracticeLog } from "./types"

/**
 * Der Gurt: die Plektren eines Spielers.
 *
 * Ein Riff-Plektrum gibt es für jedes Riff, das wirklich sitzt. Wie beim
 * Merch-Stand wird nichts gespeichert: alles fällt aus dem Log, ein
 * verdientes Plektrum kann nicht verschwinden (der Log ist append-only) und
 * wandert mit dem Abgleich auf jedes Gerät. Gewürfelt wird nicht — Aussehen
 * und Zeitpunkt folgen aus Drill-ID und Log.
 *
 * Zwei stille Eigenschaften zeigen sich nur am Plektrum selbst:
 *  - Patina: je mehr Tage ein Riff gespielt wurde, desto abgegriffener.
 *  - Staub: ein Riff, das lange liegt, wird matt, bis man es wieder spielt.
 */

export type Stufe = "g" | "s" | "e"
export const STUFEN_NAMEN: Record<Stufe, string> = { g: "gewöhnlich", s: "selten", e: "episch" }

export const FORMEN = ["std", "jazz", "tri"] as const
export type Form = (typeof FORMEN)[number]

export const MATERIALIEN = ["holz", "horn", "stein", "metall", "filz", "perl", "gold"] as const
export type Material = (typeof MATERIALIEN)[number]

export interface Aussehen {
  farbe: string
  form: Form
  material?: Material
}

/** Ein Riff gilt als geübt, wenn es an so vielen verschiedenen Tagen mindestens `GEUEBT_AB` bekam. */
export const GEUEBT_TAGE = 3
export const GEUEBT_AB = 3
/** Ab so vielen Tagen ohne dieses Riff wird das Plektrum staubig. */
export const STAUB_TAGE = 30
/** Spieltage eines Riffs, ab denen die Patina eine Stufe weiter ist. */
export const PATINA_STUFEN = [10, 25]

const FARBEN = [
  "#f1efe8",
  "#c8322b",
  "#e8c23a",
  "#2d64b8",
  "#3f8f4e",
  "#e07a26",
  "#1f1f22",
  "#6d3fa0",
  "#6c7377",
  "#b8761e",
  "#a8201a",
  "#efe2c4",
]

/** FNV-1a, 32 Bit: stabil über Geräte und Läufe, ohne Zufall. */
export function hash(text: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** Das Aussehen eines Riff-Plektrums: nur aus der Drill-ID, nie aus dem Log. */
export function aussehenFuer(drillId: string): Aussehen {
  const h = hash(drillId)
  return { farbe: FARBEN[h % FARBEN.length], form: FORMEN[Math.floor(h / FARBEN.length) % FORMEN.length] }
}

const RIFFS: Drill[] = [
  ...new Map(
    [...Object.values(ALLE_DRILLS_BY_ID), ...Object.values(SIEBEN_DRILLS_BY_ID)]
      .filter((d) => d.kind === "riff")
      .map((d) => [d.id, d] as const),
  ).values(),
]

export interface RiffSlot {
  drillId: string
  titel: string
  verdient: boolean
  aussehen: Aussehen
  /** Tage, an denen das Riff mindestens `GEUEBT_AB` bekam. */
  guteTage: number
  /** Alle Tage, an denen das Riff gespielt wurde. */
  spieltage: number
  /** Der Tag, an dem das Plektrum verdient wurde. */
  seit: string | null
  /** 0 neu, 1 abgegriffen, 2 durchgenudelt. */
  patina: 0 | 1 | 2
  staubig: boolean
  /** Höchstes Tempo mit mindestens `GEUEBT_AB`. */
  besterBpm: number | null
  zielTempo: number
}

function tageZwischen(von: string, bis: string): number {
  return Math.round((Date.parse(`${bis}T12:00:00Z`) - Date.parse(`${von}T12:00:00Z`)) / 86_400_000)
}

/** Alle Riff-Plektren, verdiente zuerst (nach Datum), dann die offenen in Katalog-Reihenfolge. */
export function gurtRiffs(log: PracticeLog, heute: string): RiffSlot[] {
  const jeRiff = new Map<string, Array<{ tag: string; bpm: number; rating: number }>>()
  for (const r of log.results) {
    const zeit = Date.parse(r.at)
    if (Number.isNaN(zeit)) continue
    const liste = jeRiff.get(r.drillId) ?? []
    liste.push({ tag: dayKey(new Date(zeit)), bpm: r.bpm, rating: r.rating })
    jeRiff.set(r.drillId, liste)
  }

  const slots = RIFFS.map((drill): RiffSlot => {
    const eintraege = jeRiff.get(drill.id) ?? []
    const spieltage = new Set(eintraege.map((e) => e.tag))
    const gute = [...new Set(eintraege.filter((e) => e.rating >= GEUEBT_AB).map((e) => e.tag))].sort()
    const verdient = gute.length >= GEUEBT_TAGE
    const letzter = [...spieltage].sort().at(-1)
    const besterBpm = eintraege.filter((e) => e.rating >= GEUEBT_AB).reduce<number | null>(
      (best, e) => (best === null || e.bpm > best ? e.bpm : best),
      null,
    )
    const aussehen = aussehenFuer(drill.id)
    if (verdient && besterBpm !== null && besterBpm >= drill.targetBpm) aussehen.material = "metall"
    return {
      drillId: drill.id,
      titel: drill.title,
      verdient,
      aussehen,
      guteTage: gute.length,
      spieltage: spieltage.size,
      seit: verdient ? gute[GEUEBT_TAGE - 1] : null,
      patina: spieltage.size >= PATINA_STUFEN[1] ? 2 : spieltage.size >= PATINA_STUFEN[0] ? 1 : 0,
      staubig: verdient && letzter !== undefined && tageZwischen(letzter, heute) > STAUB_TAGE,
      besterBpm,
      zielTempo: drill.targetBpm,
    }
  })

  return [
    ...slots.filter((s) => s.verdient).sort((a, b) => a.seit!.localeCompare(b.seit!)),
    ...slots.filter((s) => !s.verdient),
  ]
}
