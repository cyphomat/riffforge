"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { BlockRunner, type BlockOutcome } from "@/components/session/block-runner"
import { LEAD_DRILL_ID, SITZT_AB, istLead, mitLick, naechsterSeed } from "@/lib/session/lead"
import { lickBox, lickSeed, merkeLickSeed } from "@/lib/storage/lokal"
import { SessionSummary } from "@/components/session/session-summary"
import { TheoryBreak } from "@/components/session/theory-break"
import { buildDrillSession, buildSession, nextExtraBlock } from "@/lib/session/builder"
import {
  FRAGEN_JE_PORTION,
  theorieEinschuebe,
  type TheorieEinschub,
} from "@/lib/session/theory-slots"
import { appendResults, loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"
import { loadTheoryLog } from "@/lib/storage/theory-log"
import { THEORY_CARDS } from "@/lib/theory/cards"
import { pickCards } from "@/lib/theory/progress"
import { EMPTY_LOG, type DrillResult, type PracticeLog, type SessionBlock } from "@/lib/session/types"

export function SessionRunner({ minutes, drillId }: { minutes: number; drillId?: string }) {
  /**
   * Der Plan entsteht erst nach dem Mounten, nicht beim Rendern.
   *
   * Er hängt an zwei Dingen, die es auf dem Server nicht gibt: am Übungs-Log
   * aus dem localStorage und am Zufall, mit dem der Scheduler gleichwertige
   * Drills mischt. Beim Vorrendern käme dabei eine andere Session heraus als
   * im Browser — React verwirft den Baum dann und baut ihn neu auf, und für
   * einen Moment steht der falsche Drill auf dem Schirm.
   */
  const [startingLog, setStartingLog] = useState<PracticeLog | null>(null)
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [blocks, setBlocks] = useState<SessionBlock[] | null>(null)

  const [current, setCurrent] = useState(0)
  const [results, setResults] = useState<DrillResult[]>([])

  /**
   * Wo die Fragen sitzen — einmal aus dem ursprünglichen Plan bestimmt.
   *
   * Bewusst nicht aus `blocks` abgeleitet: "+5 Minuten" hängt einen Block an,
   * und eine mitgerechnete Stelle würde daraus eine fünfte und sechste Frage
   * machen. Wer verlängert, will spielen.
   */
  const [einschuebe, setEinschuebe] = useState<TheorieEinschub[]>([])

  /** Welche Fragen-Portionen schon durch sind — nach Blockindex. */
  const [erledigteEinschuebe, setErledigteEinschuebe] = useState<number[]>([])
  const [beantworteteFragen, setBeantworteteFragen] = useState(0)

  useEffect(() => {
    const initial = loadLog()
    const profile = loadProfile()
    const single = drillId ? buildDrillSession(initial, drillId, { minutes, profile }) : null
    setStartingLog(initial)
    setLog(initial)
    const plan = (single ?? buildSession(initial, { minutes, profile })).blocks
    setBlocks(plan)
    setEinschuebe(theorieEinschuebe(plan, { fokussiert: drillId !== undefined }))
  }, [drillId, minutes])

  /**
   * Ein Drill über mehrere Runden ist ein Eintrag im Log, keine drei. Bis zur
   * letzten Runde sammeln sich hier Spielzeit und zuletzt benutztes Tempo.
   */
  const carried = useRef<Record<string, { seconds: number; bpm: number }>>({})

  const block = blocks?.[current]
  const done = blocks !== null && current >= blocks.length

  /**
   * Steht hier eine Portion Fragen an?
   *
   * Die Karten werden erst gewählt, wenn die Stelle erreicht ist — und aus dem
   * Log, wie er *jetzt* aussieht. Vorher gewählt hiesse: was in der ersten
   * Portion beantwortet wurde, käme in der zweiten nochmal.
   */
  const offenerEinschub = einschuebe.find(
    (einschub) => einschub.vorIndex === current && !erledigteEinschuebe.includes(einschub.vorIndex),
  )
  const fragen = useMemo(() => {
    if (!offenerEinschub) return []
    return pickCards(THEORY_CARDS, loadTheoryLog(), FRAGEN_JE_PORTION, {
      technique: offenerEinschub.technique ?? undefined,
    })
    // Die Auswahl hängt an der Stelle, nicht am Rendern: derselbe Einschub
    // soll dieselben Karten behalten, solange er offen ist.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offenerEinschub?.vorIndex])

  const einschubFertig = (beantwortet: number) => {
    if (!offenerEinschub) return
    setBeantworteteFragen((zahl) => zahl + beantwortet)
    setErledigteEinschuebe((bisher) => [...bisher, offenerEinschub.vorIndex])
  }

  // Nichts fällig: die Portion fällt lautlos aus, statt einen leeren
  // Bildschirm zwischen zwei Blöcke zu schieben.
  useEffect(() => {
    if (offenerEinschub && fragen.length === 0) {
      setErledigteEinschuebe((bisher) => [...bisher, offenerEinschub.vorIndex])
    }
  }, [offenerEinschub, fragen.length])

  // Runde zwei startet mit dem Tempo, das in Runde eins tatsächlich lief —
  // nicht mit dem, das der Plan vor der Session vorgesehen hatte.
  // Der Startwert wird einmal gelesen und dann festgehalten: würde er bei
  // jedem Anstrich neu aus dem Speicher kommen, wechselte das Lick mitten im
  // Block, sobald der Wert sich ändert.
  const seed = useRef<number | null>(null)
  const box = useRef<ReturnType<typeof lickBox> | null>(null)
  if (seed.current === null && typeof window !== "undefined") {
    seed.current = lickSeed()
    box.current = lickBox()
  }

  const active: SessionBlock | undefined = block && {
    ...block,
    bpm: carried.current[block.drill.id]?.bpm ?? block.bpm,
    // Der einzige Drill, dessen Inhalt gerechnet wird — siehe lib/session/lead.ts.
    drill: istLead(block.drill)
      ? mitLick(block.drill, seed.current ?? 1, box.current ?? undefined)
      : block.drill,
  }

  const completeBlock = (outcome: BlockOutcome) => {
    if (!block) return
    const previous = carried.current[block.drill.id] ?? { seconds: 0, bpm: outcome.bpm }
    const seconds = previous.seconds + outcome.seconds

    if (outcome.rating === null) {
      // Zwischenrunde: merken und weiterziehen, bewertet wird am Ende.
      carried.current[block.drill.id] = { seconds, bpm: outcome.bpm }
      setCurrent((index) => index + 1)
      return
    }

    const result: DrillResult = {
      drillId: block.drill.id,
      technique: block.drill.technique,
      bpm: outcome.bpm,
      rating: outcome.rating,
      seconds,
      at: new Date().toISOString(),
      timing: outcome.timing,
    }

    // „Sitzt" heisst: nächstes Lick. Darunter bleibt dieses — Wiederholung
    // mit Abstand ist der Sinn, und eine Tempokurve über lauter verschiedene
    // Licks wäre ohnehin nicht deutbar.
    if (block.drill.id === LEAD_DRILL_ID && outcome.rating >= SITZT_AB) {
      const weiter = naechsterSeed(seed.current ?? 1)
      seed.current = weiter
      merkeLickSeed(weiter)
    }

    // Pro Block geschrieben, nicht am Ende: eine abgebrochene Session zählt
    // trotzdem für alles, was wirklich gespielt wurde.
    delete carried.current[block.drill.id]
    setLog(appendResults([result]))
    setResults((previous) => [...previous, result])
    setCurrent((index) => index + 1)
  }

  const extend = () => {
    setBlocks((previous) => (previous ? [...previous, nextExtraBlock(log, previous, { minutes: 5 })] : previous))
  }

  const overallProgress = useMemo(
    () => (blocks?.length ? (current / blocks.length) * 100 : 0),
    [current, blocks],
  )

  if (blocks === null || startingLog === null) {
    return (
      <p className="huelle pt-8 font-mono text-[12px] uppercase tracking-[0.18em] text-dim">
        Session wird vorbereitet…
      </p>
    )
  }

  if (done || !active) {
    return (
      <SessionSummary
        results={results}
        previousLog={startingLog}
        log={log}
        fragen={beantworteteFragen}
        onExtend={extend}
      />
    )
  }

  return (
    <div className="huelle-breit">
      <div className="bar mt-6 h-[3px]">
        <i className="transition-[width] duration-500" style={{ width: `${overallProgress}%` }} />
      </div>
      <div className="mt-5" />
      {offenerEinschub && fragen.length > 0 ? (
        <TheoryBreak
          key={`fragen-${offenerEinschub.vorIndex}`}
          karten={fragen}
          grundiert={offenerEinschub.technique !== null}
          onDone={einschubFertig}
        />
      ) : (
      <BlockRunner
        key={`${active.drill.id}-${current}`}
        block={active}
        index={current}
        total={blocks.length}
        onComplete={completeBlock}
      />
      )}
    </div>
  )
}
