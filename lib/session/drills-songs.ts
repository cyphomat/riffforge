import { notenwerteOf } from "@/lib/theory/song"
import { songTab } from "@/lib/theory/song-tab"
import { SONGS } from "@/lib/theory/songs"
import type { Drill } from "./types"

/**
 * Die Songs als Drills.
 *
 * Der Katalog der Songs (`lib/theory/songs.ts`) ist Musik und Lernziel; hier
 * werden daraus Drills, damit alles an ihnen hängt, was an jedem Drill hängt:
 * Tempokurve, Beherrschung, Auswahl durch den Scheduler. Tabulatur und
 * Notenschrift fallen aus denselben Noten.
 *
 * Ein Riff, weil ein Song das ist, was in der zweiten Hälfte der Session
 * dran ist: dieselbe Technik im musikalischen Zusammenhang. Die Technik ist
 * `pentatonic`, denn alle Songs liegen in einer Pentatonik-Lage.
 */
export const SONG_DRILLS: Drill[] = SONGS.map((eintrag) => ({
  id: eintrag.id,
  title: eintrag.titel,
  kind: "riff",
  technique: "pentatonic",
  goal: eintrag.ziel,
  cues: eintrag.cues,
  tab: songTab(eintrag.song),
  why: eintrag.why,
  startBpm: eintrag.startBpm,
  targetBpm: eintrag.targetBpm,
  beatsPerBar: 4,
  // Mit Achteln im Song klickt das Metronom Achtel, sonst Viertel.
  subdivision: notenwerteOf(eintrag.song).includes(1) ? 2 : 1,
  song: eintrag.song,
}))
