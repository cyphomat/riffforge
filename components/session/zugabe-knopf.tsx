"use client"

import { useEffect, useState } from "react"
import { MdPlayArrow, MdStop } from "react-icons/md"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { SongPlayer } from "@/lib/audio/song-player"
import { zugabeRiff } from "@/lib/session/zugabe"
import { aktivesBoard } from "@/lib/storage/board"
import type { DrillResult } from "@/lib/session/types"

/**
 * Die Zugabe auf dem Abschluss-Zettel: ein Riff, einmal, übers Board, ohne
 * Klick. Nur Ton, nur auf Tippen — der AudioContext entsteht erst dort.
 */
export function ZugabeKnopf({ results, tag }: { results: DrillResult[]; tag: string }) {
  const engine = useAudioEngine()
  const riff = zugabeRiff(results, tag)
  const [spielt, setSpielt] = useState(false)
  const [player] = useState(
    () => new SongPlayer(engine, { schleife: false, klick: false, onEnde: () => setSpielt(false) }),
  )
  useEffect(() => () => player.dispose(), [player])

  const umschalten = async () => {
    if (spielt) {
      player.stop()
      setSpielt(false)
      return
    }
    player.setBpm(riff.bpm)
    player.setBoard(aktivesBoard())
    setSpielt(true)
    await player.start(riff.song)
  }

  return (
    <div className="mt-6 flex items-center gap-3">
      <button type="button" className="btn btn-ghost btn-small" onClick={umschalten} aria-pressed={spielt}>
        {spielt ? <MdStop className="h-[18px] w-[18px]" /> : <MdPlayArrow className="h-[18px] w-[18px]" />} Zugabe
      </button>
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-muted">
        {riff.titel} · {riff.bpm} BPM, übers Board
      </p>
    </div>
  )
}
