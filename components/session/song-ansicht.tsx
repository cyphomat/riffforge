"use client"

import { useState } from "react"
import { NotenMitTab } from "@/components/session/noten-view"
import { SongBedienung } from "@/components/session/song-bedienung"
import type { AudioEngine } from "@/lib/audio/audio-engine"
import type { Song } from "@/lib/theory/song"

/**
 * Was ein Song-Block zusätzlich zeigt: die Notenschrift, die Tonnamen auf
 * Wunsch und die Bedienung zum Anhören. Die Tabulatur steht wie bei jedem
 * Drill darunter, im Block.
 *
 * Die Tonnamen sind zu Anfang an: wer Noten lernt, braucht sie zum
 * Gegenlesen, und sie auszuschalten ist der Test, ob man sie schon kennt.
 *
 * Während der Block läuft, gibt es kein Anhören. Der Block hat sein eigenes
 * Metronom, und zwei Takte gegeneinander helfen niemandem; vor dem Los oder in
 * der Pause ist das Anhören da. Die Bedienung verschwindet dann ganz, damit
 * auch der Player mit seinem Zustand geht und beim nächsten Mal frisch anfängt.
 */
export function SongAnsicht({
  song,
  bpm,
  engine,
  blockLaeuft,
}: {
  song: Song
  /** Das Tempo des Blocks, wie es das Metronom gerade hat. */
  bpm: number
  engine: AudioEngine
  blockLaeuft: boolean
}) {
  const [namen, setNamen] = useState(true)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="rule flex-1">Noten und Tabulatur</h3>
        <button
          className={`btn btn-small ${namen ? "" : "btn-ghost"}`}
          aria-pressed={namen}
          onClick={() => setNamen(!namen)}
        >
          Tonnamen
        </button>
      </div>
      <NotenMitTab song={song} mitNamen={namen} />
      {blockLaeuft ? (
        <p className="text-[13px] text-dim">Anhören ist in der Pause und vor dem Los da — im Block läuft das Metronom.</p>
      ) : (
        <SongBedienung song={song} bpm={bpm} engine={engine} />
      )}
    </div>
  )
}
