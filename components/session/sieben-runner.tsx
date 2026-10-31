"use client"

import { useState } from "react"
import Link from "next/link"
import { MdArrowBack, MdMusicNote, MdTune } from "react-icons/md"
import { BlockRunner, type BlockOutcome } from "@/components/session/block-runner"
import { SessionSummary } from "@/components/session/session-summary"
import { STIMMUNG, buildSiebenSession, naechsterSiebenBlock } from "@/lib/session/sieben"
import { zuweisen, type Zuweisung } from "@/lib/session/gitarren"
import { gitarren } from "@/lib/storage/lokal"
import { appendResults, loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"
import { EMPTY_LOG, type DrillResult, type PracticeLog, type SessionBlock } from "@/lib/session/types"

/**
 * Der Sieben-Saiter-Modus.
 *
 * Eigener Eingang, eigener Katalog, eigene kurze Form — und derselbe Log.
 * Warum das so getrennt ist, steht in `lib/session/sieben.ts`.
 *
 * Der Plan entsteht erst beim Starten, nicht beim Rendern: er hängt am Log
 * aus dem localStorage und am Zufall, mit dem gleichwertige Drills gemischt
 * werden. Beides gibt es auf dem Server nicht.
 */
export function SiebenRunner() {
  const [blocks, setBlocks] = useState<SessionBlock[] | null>(null)
  const [startLog, setStartLog] = useState<PracticeLog>(EMPTY_LOG)
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<DrillResult[]>([])
  // Hier würfelt die Roulette nur unter den Siebensaitigen — meist gibt es eine, dann bleibt sie still.
  const [gitarrenJeBlock, setGitarrenJeBlock] = useState<Zuweisung>([])

  const starten = () => {
    const gelesen = loadLog()
    setStartLog(gelesen)
    setLog(gelesen)
    const plan = buildSiebenSession(gelesen, { profile: loadProfile() }).blocks
    setBlocks(plan)
    setGitarrenJeBlock(zuweisen([], plan, gitarren(), Math.random, { nurSieben: true }))
    setCurrent(0)
    setResults([])
  }

  const fertig = (outcome: BlockOutcome) => {
    const block = blocks?.[current]
    if (!block) return
    if (outcome.rating === null) {
      setCurrent((index) => index + 1)
      return
    }

    const result: DrillResult = {
      drillId: block.drill.id,
      technique: block.drill.technique,
      bpm: outcome.bpm,
      rating: outcome.rating,
      seconds: outcome.seconds,
      at: new Date().toISOString(),
      timing: outcome.timing,
    }
    // Pro Block geschrieben, nicht am Ende: ein abgebrochener Durchgang zählt
    // trotzdem für alles, was wirklich gespielt wurde.
    setLog(appendResults([result]))
    setResults((bisher) => [...bisher, result])
    setCurrent((index) => index + 1)
  }

  const verlaengern = () => {
    if (!blocks) return
    const mehr = [...blocks, naechsterSiebenBlock(log, blocks.map((block) => block.drill.id))]
    setBlocks(mehr)
    setGitarrenJeBlock((bisher) => zuweisen(bisher, mehr, gitarren(), Math.random, { nurSieben: true }))
  }

  if (blocks === null) {
    return (
      <div className="huelle">
        <header className="mt-6">
          <span className="kicker">Bonus</span>
          <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Sieben Saiten</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            Zehn Minuten für die Siebensaitige: drei Blöcke aus einem eigenen Katalog, mit
            Metronom und Timing wie sonst auch. Steht bewusst neben der täglichen Viertelstunde
            — dafür brauchst du die andere Gitarre in der Hand.
          </p>
        </header>

        {/* Die Stimmung gehört auf den ersten Bildschirm: wer eine Siebensaitige
            neu hat, weiss oft nicht, worauf sie überhaupt steht. */}
        <section className="card mt-6">
          <span className="kicker text-stahl">Stimmung · {STIMMUNG.name}</span>
          <p className="ziffern mt-2 text-[17px] text-fg">{STIMMUNG.satz}</p>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Sechs davon kennst du — die tiefe <b className="text-fg">B</b> kommt unten dazu, eine
            Quarte unter der tiefen E. Im fünften Bund der neuen Saite liegt genau der Ton, den
            deine bisher tiefste Leersaite gibt. Alle Griffbilder gelten unverändert weiter.
          </p>
          {/* Wer die Gitarre gerade aus dem Koffer holt, stimmt zuerst. */}
          <Link
            href="/stimmen?saiten=7"
            className="mt-3 inline-flex items-center gap-1 font-mono text-[12.5px] text-stahl underline-offset-4 hover:underline"
          >
            <MdTune className="h-[15px] w-[15px]" /> Erst stimmen ›
          </Link>
        </section>

        <button onClick={starten} className="btn mt-7 w-full py-5 text-[15px]">
          <MdMusicNote className="h-[18px] w-[18px]" /> Modus starten · 10 Min
        </button>

        <Link href="/" className="btn btn-ghost btn-small mt-[9px] w-full py-3">
          <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
        </Link>
      </div>
    )
  }

  const block = blocks[current]

  if (!block) {
    return (
      <SessionSummary
        results={results}
        previousLog={startLog}
        log={log}
        onExtend={verlaengern}
      />
    )
  }

  return (
    <div className="huelle-breit">
      <div className="bar mt-6 h-[3px]">
        <i
          className="transition-[width] duration-500"
          style={{ width: `${(current / blocks.length) * 100}%` }}
        />
      </div>
      <div className="mt-5" />
      <BlockRunner
        key={`${block.drill.id}-${current}`}
        block={block}
        index={current}
        total={blocks.length}
        gitarre={gitarrenJeBlock[current] ?? null}
        onComplete={fertig}
      />
    </div>
  )
}
