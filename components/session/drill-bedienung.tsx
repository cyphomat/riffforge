"use client"

import { useEffect, useMemo, useState } from "react"
import { MdPlayArrow, MdStop } from "react-icons/md"
import type { AudioEngine } from "@/lib/audio/audio-engine"
import { DrillPlayer } from "@/lib/audio/drill-player"
import { figurVon } from "@/lib/theory/drill-spiel"

/**
 * Die Tabulatur eines Drills zum Anhören: Knopf, Schleife, Klick.
 *
 * Gedacht für den Anfang, wo der Rhythmus aus dem Text allein schwer zu lesen
 * ist: erst hören, dann spielen. Das Tempo ist das des Metronoms im Block,
 * damit man das Gehörte gleich im selben Tempo nachspielt; im Block selbst
 * läuft das Metronom, deshalb gibt es das Anhören nur davor und in der Pause
 * (der Aufrufer blendet die Bedienung dann aus, und der Player geht mit).
 *
 * Schläge klingen lauter als die Schritte dazwischen — so hört man, wo die
 * Eins liegt. Gibt es zu dem Drill keinen Klang, zeigt die Bedienung nichts.
 *
 * Den `AudioEngine` bringt der Aufrufer mit, damit es nur einen
 * `AudioContext` gibt. Kein Abspielen von selbst: der Kontext entsteht erst
 * aus dem Tippen.
 */
export function DrillBedienung({
  drillId,
  bpm,
  subdivision,
  engine,
}: {
  drillId: string
  bpm: number
  /** Klicks je Schlag im Block des Drills; der Klick beim Anhören folgt ihm. */
  subdivision: number
  engine: AudioEngine
}) {
  const figur = useMemo(() => figurVon(drillId), [drillId])
  const [spielt, setSpielt] = useState(false)
  const [schleife, setSchleife] = useState(true)
  const [klick, setKlick] = useState(true)
  const [player] = useState(() => new DrillPlayer(engine, { bpm, subdivision, schleife: true, klick: true, onEnde: () => setSpielt(false) }))

  useEffect(() => () => player.dispose(), [player])
  useEffect(() => player.setBpm(bpm), [bpm, player])

  if (!figur) return null

  const umschalten = () => {
    if (spielt) {
      player.stop()
      setSpielt(false)
      return
    }
    setSpielt(true)
    void player.start(figur)
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
      <div className="flex gap-2">
        <button
          className={`btn btn-small ${schleife ? "" : "btn-ghost"}`}
          aria-pressed={schleife}
          onClick={() => {
            setSchleife(!schleife)
            player.setSchleife(!schleife)
          }}
        >
          Schleife
        </button>
        <button
          className={`btn btn-small ${klick ? "" : "btn-ghost"}`}
          aria-pressed={klick}
          onClick={() => {
            setKlick(!klick)
            player.setKlick(!klick)
          }}
        >
          Klick
        </button>
      </div>
    </div>
  )
}
