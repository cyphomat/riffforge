"use client"

import { useEffect } from "react"
import Link from "next/link"
import { DRILLS_BY_ID } from "@/lib/session/drills"
import { progressFor, streakDays } from "@/lib/session/progress"
import type { DrillResult, PracticeLog } from "@/lib/session/types"
import { syncInBackground } from "@/lib/sync/run"
import { MdAdd } from "react-icons/md"

export interface SessionSummaryProps {
  results: DrillResult[]
  /** Der Stand *vor* dieser Session, für den Vergleich. */
  previousLog: PracticeLog
  log: PracticeLog
  /** Wie viele Wissensfragen unterwegs beantwortet wurden. */
  fragen?: number
  onExtend: () => void
}

interface Gain {
  title: string
  /** null, wenn es der erste saubere Durchgang war. */
  from: number | null
  to: number
}

/** Bestwerte aus dieser Session, damit oben etwas Echtes steht. */
function gainsFrom(results: DrillResult[], previousLog: PracticeLog): Gain[] {
  return results.flatMap((result) => {
    if (result.rating < 3) return []
    const drill = DRILLS_BY_ID[result.drillId]
    if (!drill) return []

    const before = progressFor(previousLog, result.drillId).bestBpm
    if (before !== null && result.bpm <= before) return []

    return [{ title: drill.title, from: before, to: result.bpm }]
  })
}

export function SessionSummary({ results, previousLog, log, fragen = 0, onExtend }: SessionSummaryProps) {
  const minutes = Math.max(1, Math.round(results.reduce((sum, r) => sum + r.seconds, 0) / 60))
  const streak = streakDays(log)
  const gains = gainsFrom(results, previousLog)

  // Die frische Session hochschieben, sobald sie steht. Lautlos: mitten nach
  // dem Üben ist ein Fehlerbanner das Letzte, was jemand braucht, und der
  // lokale Log bleibt ohnehin vollständig.
  useEffect(() => {
    syncInBackground()
  }, [])

  return (
    <div className="huelle">
      {/* Erst das Geschaffte, dann der Bericht. */}
      <section className="card mt-6">
        <span className="kicker text-gruen">Feierabend</span>
        <h1 className="display mt-1 text-[38px] text-fg">Session steht</h1>
        <p className="ziffern mt-1 text-[13px] text-muted">
          {minutes === 1 ? "1 Minute" : `${minutes} Minuten`} ·{" "}
          {results.length === 1 ? "1 Block" : `${results.length} Blöcke`}
          {fragen > 0 && ` · ${fragen === 1 ? "1 Frage" : `${fragen} Fragen`}`}
          {streak > 1 && ` · ${streak} Tage in Folge`}
        </p>

        {gains.length > 0 && (
          <ul className="mt-4 border-t border-line">
            {gains.map((gain) => (
              <li
                key={gain.title}
                className="flex items-baseline justify-between gap-3 border-b border-line py-[9px]"
              >
                <span className="text-[14px] text-fg">{gain.title}</span>
                <span className="ziffern flex-none text-[13px] text-gruen">
                  {gain.from === null ? "erster sauberer Lauf" : `${gain.from} →`}{" "}
                  <b className="text-[15px]">{gain.to} BPM</b>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <h2 className="rule mb-3 mt-8">Was du gespielt hast</h2>
      <div className="flex flex-col gap-[9px]">
        {results.map((result, index) => {
          const drill = DRILLS_BY_ID[result.drillId]
          return (
            <div
              key={`${result.drillId}-${index}`}
              className="flex items-baseline justify-between gap-3 border border-line bg-panel px-[15px] py-3"
            >
              <span className="display text-[17px] text-fg">{drill?.title ?? result.drillId}</span>
              <span className="ziffern flex-none text-[13px]">
                {result.timing && (
                  <span className="text-dim">
                    Timing <span className="text-stahl">{result.timing.score}</span> · ±
                    {result.timing.spreadMs} ms{" "}
                  </span>
                )}
                <span className="text-akzent">{result.bpm} BPM</span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex flex-wrap gap-[9px]">
        <Link href="/" className="btn flex-1">
          Feierabend
        </Link>
        <button onClick={onExtend} className="btn btn-ghost flex-1">
          <MdAdd className="h-[18px] w-[18px]" /> +5 Minuten
        </button>
      </div>
    </div>
  )
}
