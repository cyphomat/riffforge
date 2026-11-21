import type { BoardKette } from "@/lib/audio/board"
import type { BandWahl } from "@/lib/audio/song-player"
import { bandAn } from "@/lib/session/band"
import { alsKlang, kette } from "@/lib/session/board"
import { besitz } from "@/lib/session/quests"
import { boardWahl } from "./lokal"
import { loadLog } from "./practice-log"
import { loadTheoryLog } from "./theory-log"

/** Das Board, wie es jetzt klingt: Besitz aus beiden Logs, Wahl vom Gerät. */
export function aktivesBoard(jetzt: Date = new Date()): BoardKette {
  return alsKlang(kette(besitz(loadLog(), loadTheoryLog(), jetzt), boardWahl()))
}

/** Wer von der Band mitspielt: dabei nach dem Rang im Log, nicht auf diesem Gerät abgewählt. */
export function aktiveBand(): BandWahl {
  return bandAn(loadLog(), boardWahl())
}
