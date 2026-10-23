"use client"

import { useEffect, useState } from "react"
import { MdPlayArrow, MdStop } from "react-icons/md"
import type { AudioEngine } from "@/lib/audio/audio-engine"
import { SongPlayer } from "@/lib/audio/song-player"
import type { Song } from "@/lib/theory/song"

/** Wie bei den Drills: ein rundes Maß, damit der Knopf nicht mal 5 und mal 7 sagt. */
const SCHRITT = 5
const MIN_BPM = 30
const MAX_BPM = 300

/**
 * Anhören, Schleife und Klick für einen Song — und, wenn der Aufrufer ein
 * Tempo zum Verstellen anbietet, auch die Tempoknöpfe.
 *
 * Das Tempo gehört dem Aufrufer. Im Block ist es das des Metronoms, das dort
 * ohnehin von Hand verstellt wird; ein zweiter Regler für dasselbe wäre ein
 * Rätsel. Ohne `onBpm` gibt es deshalb keine Tempoknöpfe, und der Player folgt
 * dem Wert, den er bekommt.
 *
 * Den `AudioEngine` bringt der Aufrufer mit, statt dass hier einer entsteht:
 * zwei AudioContexts in einem Bildschirm liefen gegeneinander und machten
 * jede Timing-Messung zu Rauschen. Wer wechselnde Songs zeigen lässt, gibt
 * `key={song-id}` mit — sonst läuft der alte weiter.
 *
 * Kein Abspielen von selbst: der AudioContext entsteht erst aus dem Tippen.
 */
export function SongBedienung({
  song,
  bpm,
  onBpm,
  engine,
}: {
  song: Song
  bpm: number
  /** Wenn gesetzt, zeigt die Bedienung Tempoknöpfe und meldet das neue Tempo. */
  onBpm?: (bpm: number) => void
  engine: AudioEngine
}) {
  const [spielt, setSpielt] = useState(false)
  // Zum Üben ist die Schleife der Normalfall: ein Song, der nach einem
  // Durchgang aufhört, verlangt nach jedem Versuch einen neuen Druck.
  const [schleife, setSchleife] = useState(true)
  const [klick, setKlick] = useState(true)
  const [player] = useState(
    () => new SongPlayer(engine, { bpm, schleife: true, klick: true, onEnde: () => setSpielt(false) }),
  )

  useEffect(() => () => player.dispose(), [player])
  useEffect(() => player.setBpm(bpm), [bpm, player])

  const umschalten = () => {
    if (spielt) {
      player.stop()
      setSpielt(false)
      return
    }
    setSpielt(true)
    void player.start(song)
  }

  const schleifeUmschalten = () => {
    setSchleife(!schleife)
    player.setSchleife(!schleife)
  }

  const klickUmschalten = () => {
    setKlick(!klick)
    player.setKlick(!klick)
  }

  return (
    <div className="flex flex-wrap items-end gap-x-6 gap-y-3">
      <button onClick={umschalten} className="btn min-w-[9rem] flex-1">
        {spielt ? (
          <>
            <MdStop className="h-[18px] w-[18px]" /> Stopp
          </>
        ) : (
          <>
            <MdPlayArrow className="h-[18px] w-[18px]" /> Anhören
          </>
        )}
      </button>

      {onBpm && (
        <div>
          <span className="kicker block">Tempo</span>
          <div className="mt-1 flex items-center gap-2">
            <button
              className="btn btn-ghost btn-small"
              onClick={() => onBpm(Math.max(MIN_BPM, bpm - SCHRITT))}
              disabled={bpm <= MIN_BPM}
            >
              −{SCHRITT}
            </button>
            <span className="display num min-w-[3ch] text-center text-[28px] leading-none text-akzent">{bpm}</span>
            <button
              className="btn btn-ghost btn-small"
              onClick={() => onBpm(Math.min(MAX_BPM, bpm + SCHRITT))}
              disabled={bpm >= MAX_BPM}
            >
              +{SCHRITT}
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          className={`btn btn-small ${schleife ? "" : "btn-ghost"}`}
          aria-pressed={schleife}
          onClick={schleifeUmschalten}
        >
          Schleife
        </button>
        <button className={`btn btn-small ${klick ? "" : "btn-ghost"}`} aria-pressed={klick} onClick={klickUmschalten}>
          Klick
        </button>
      </div>
    </div>
  )
}
