"use client"

import { useRef, useState } from "react"
import { MdReplay, MdVolumeUp } from "react-icons/md"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { gezupft, hertzAus } from "@/lib/audio/zupfen"
import { hoerPaar, saitenTon, type Richtung } from "@/lib/theory/gehoer"
import type { Griff } from "@/lib/theory/types"

/** Seconds between the two tones — long enough to hear the first one land. */
const ABSTAND_S = 0.8
/** Seconds a tone rings (`gezupft` default) — the button stays busy until the last one has. */
const TONDAUER_S = 1.4

/**
 * Spielt Töne nacheinander, auf Tippen.
 *
 * Kein Abspielen von selbst: ein AudioContext entsteht nur aus einem Tippen,
 * sonst bleibt er auf iOS dauerhaft stumm.
 */
function TonSpieler({ toene }: { toene: number[] }) {
  const engine = useAudioEngine()
  const [gehoert, setGehoert] = useState(false)
  const [spielt, setSpielt] = useState(false)
  const puffer = useRef<Map<number, AudioBuffer>>(new Map())

  const abspielen = async () => {
    const ctx = await engine.resume()
    const start = ctx.currentTime + 0.05
    toene.forEach((midi, i) => {
      let buffer = puffer.current.get(midi)
      if (!buffer) {
        const samples = gezupft(hertzAus(midi), ctx.sampleRate)
        buffer = ctx.createBuffer(1, samples.length, ctx.sampleRate)
        buffer.copyToChannel(samples, 0)
        puffer.current.set(midi, buffer)
      }
      const quelle = ctx.createBufferSource()
      quelle.buffer = buffer
      quelle.connect(ctx.destination)
      quelle.start(start + i * ABSTAND_S)
    })
    setGehoert(true)
    setSpielt(true)
    setTimeout(() => setSpielt(false), ((toene.length - 1) * ABSTAND_S + TONDAUER_S) * 1000)
  }

  return (
    <button onClick={() => void abspielen()} disabled={spielt} className={`btn w-full ${gehoert ? "btn-ghost" : ""}`}>
      {gehoert ? <MdReplay className="h-[18px] w-[18px]" /> : <MdVolumeUp className="h-[18px] w-[18px]" />}
      {spielt ? "Hör zu …" : gehoert ? "Nochmal hören" : "Anhören"}
    </button>
  )
}

/**
 * Die zwei Töne einer Hörfrage. Sie werden beim ersten Zeigen gewürfelt und
 * bleiben dann für diese Karte — *Nochmal* spielt dasselbe Paar, sonst wäre
 * es eine neue Frage.
 */
export function IntervallHoeren({ halbtoene, richtung }: { halbtoene: number; richtung: Richtung }) {
  const [zufall] = useState(() => Math.random())
  return <TonSpieler toene={hoerPaar(halbtoene, richtung, zufall)} />
}

/** Eine Leersaite, immer derselbe Ton — gefragt ist, welche Saite es ist. */
export function SaiteHoeren({ saite }: { saite: Griff["saite"] }) {
  return <TonSpieler toene={[saitenTon(saite)]} />
}
