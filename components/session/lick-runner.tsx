"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MdArrowBack, MdRefresh } from "react-icons/md"
import { BlockRunner, type BlockOutcome } from "@/components/session/block-runner"
import { BoxPicker } from "@/components/session/box-picker"
import { DRILLS_BY_ID } from "@/lib/session/drills"
import { LEAD_DRILL_ID, SITZT_AB, mitLick, naechsterSeed, type LickBox } from "@/lib/session/lead"
import { nextBpm, progressFor } from "@/lib/session/progress"
import { startBpmFor } from "@/lib/session/profile"
import { appendResults, loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"
import { lickBox, lickSeed, merkeLickBox, merkeLickSeed } from "@/lib/storage/lokal"
import type { DrillResult } from "@/lib/session/types"

/**
 * Ein Lick allein, ohne Session drumherum.
 *
 * Der zweite Eingang neben der Viertelstunde — für die drei Minuten, die man
 * zwischendurch hat. Er schreibt in denselben Log und unter dieselbe Nummer:
 * sonst hätte die Tempokurve zwei Hälften, die nichts voneinander wissen,
 * und die Lick-Schmiede in der Session fienge jedes Mal wieder von vorn an.
 *
 * Das Produktmodell bleibt, was es ist — die Session ist die Form, die keine
 * Entscheidung kostet. Das hier ist ausdrücklich das andere: ein Griff für
 * den, der gerade Lust auf Lead hat.
 */

/** Wie lange ein Lick allein läuft. Kürzer als ein Block — es ist ein Griff. */
const SEKUNDEN = 180

type Phase = "waehlen" | "spielen" | "fertig"

export function LickRunner() {
  const [box, setBox] = useState<LickBox | null>(null)
  const [seed, setSeed] = useState(1)
  const [phase, setPhase] = useState<Phase>("waehlen")
  const [bpm, setBpm] = useState<number | null>(null)
  const [zuletzt, setZuletzt] = useState<DrillResult | null>(null)

  useEffect(() => {
    setBox(lickBox())
    setSeed(lickSeed())
    const log = loadLog()
    const drill = DRILLS_BY_ID[LEAD_DRILL_ID]
    const fortschritt = progressFor(log, LEAD_DRILL_ID)
    // Dasselbe Tempo, das die Session ansetzen würde: der Log ist derselbe.
    setBpm(
      fortschritt.lastBpm === null
        ? startBpmFor(drill, loadProfile())
        : nextBpm(drill, fortschritt, loadProfile()),
    )
  }, [])

  const katalog = DRILLS_BY_ID[LEAD_DRILL_ID]
  if (!box || bpm === null) return null

  const waehle = (neu: LickBox) => {
    setBox(neu)
    merkeLickBox(neu)
  }

  const fertig = (outcome: BlockOutcome) => {
    if (outcome.rating === null) return
    const result: DrillResult = {
      drillId: LEAD_DRILL_ID,
      technique: katalog.technique,
      bpm: outcome.bpm,
      rating: outcome.rating,
      seconds: outcome.seconds,
      at: new Date().toISOString(),
      timing: outcome.timing,
    }
    appendResults([result])
    setZuletzt(result)
    // Dieselbe Regel wie in der Session: „sitzt" heisst nächstes Lick.
    if (outcome.rating >= SITZT_AB) {
      const weiter = naechsterSeed(seed)
      setSeed(weiter)
      merkeLickSeed(weiter)
    }
    setPhase("fertig")
  }

  if (phase === "spielen") {
    return (
      <div className="huelle-breit">
        <BlockRunner
          key={`${seed}-${box.grundton}-${box.lage}`}
          block={{ drill: mitLick(katalog, seed, box), seconds: SEKUNDEN, bpm, round: 1, rounds: 1 }}
          index={0}
          total={1}
          onComplete={fertig}
        />
      </div>
    )
  }

  return (
    <div className="huelle">
      <header className="mt-6">
        <span className="kicker">Lead</span>
        {/* Heisst wie der Knopf, der hierher führt — sonst fragt man sich
            beim Ankommen, ob man richtig ist. */}
        <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Ein Lick</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Ein gerechnetes Lead-Lick aus der Pentatonik, drei Minuten, ohne Session drumherum. Es
          bleibt, bis du es mit <b className="text-fg">Sauber</b> abhakst — dann kommt das nächste.
        </p>
      </header>

      {phase === "fertig" && zuletzt && (
        <section className="card mt-6">
          <span className="kicker text-gruen">Geschafft</span>
          <p className="mt-1 text-[15px] text-fg">
            {zuletzt.bpm} BPM
            {zuletzt.timing && ` · Timing ${zuletzt.timing.score} · ±${zuletzt.timing.spreadMs} ms`}
            {zuletzt.rating >= SITZT_AB
              ? " — abgehakt, unten wartet das nächste."
              : " — dasselbe Lick bleibt, bis es sitzt."}
          </p>
        </section>
      )}

      <section className="mt-7">
        <BoxPicker box={box} onChange={waehle} />
      </section>

      <button onClick={() => setPhase("spielen")} className="btn mt-7 w-full py-5 text-[15px]">
        {phase === "fertig" ? "Noch eins" : "Lick holen"}
      </button>

      <button
        onClick={() => {
          // Ein anderes Lick, ohne es abzuhaken: manchmal liegt eines schlicht
          // schlecht in der Hand, und daran festzuhalten übt nichts.
          const weiter = naechsterSeed(seed)
          setSeed(weiter)
          merkeLickSeed(weiter)
          setPhase("waehlen")
          setZuletzt(null)
        }}
        className="btn btn-ghost btn-small mt-[9px] w-full py-3"
      >
        <MdRefresh className="h-[16px] w-[16px]" /> Anderes Lick
      </button>

      <Link href="/" className="btn btn-ghost btn-small mt-[9px] w-full py-3">
        <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
      </Link>
    </div>
  )
}
