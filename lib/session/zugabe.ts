import { TUERCHEN } from "./advent-daten"
import { ALLE_DRILLS_BY_ID } from "./drills"
import { hash } from "./gurt"
import type { DrillResult } from "./types"
import type { Song } from "@/lib/theory/song"

/**
 * Die Zugabe: ein Riff nach der Session, einmal, übers Board.
 *
 * Gespielt wird, was Noten hat. Das ist ein Song, wenn die Session einen
 * hatte — der zuletzt geübte —, sonst eines der Advents-Riffe, vom Tag
 * gewählt und nicht gewürfelt: wer den Zettel zweimal öffnet, hört dasselbe.
 * Die Drills mit reiner Tabulatur haben keine Noten und können nicht erklingen.
 */

export interface ZugabeRiff {
  /** Kennung für das Riffbuch. */
  id: string
  titel: string
  song: Song
  bpm: number
  herkunft: "session" | "advent"
}

const ADVENT_RIFFE = TUERCHEN.flatMap((t) => (t.art === "riff" ? [t.riff] : []))

export function zugabeRiff(ergebnisse: DrillResult[], tag: string): ZugabeRiff {
  const letzter = [...ergebnisse]
    .sort((a, b) => a.at.localeCompare(b.at))
    .reverse()
    .find((r) => ALLE_DRILLS_BY_ID[r.drillId]?.song)
  if (letzter) {
    const drill = ALLE_DRILLS_BY_ID[letzter.drillId]
    return { id: drill.id, titel: drill.title, song: drill.song!, bpm: letzter.bpm, herkunft: "session" }
  }
  const riff = ADVENT_RIFFE[hash(`zugabe-${tag}`) % ADVENT_RIFFE.length]
  const mitte = Math.round((riff.startBpm + riff.targetBpm) / 2 / 5) * 5
  return { id: riff.id, titel: riff.titel, song: riff.song, bpm: mitte, herkunft: "advent" }
}
