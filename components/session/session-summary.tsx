"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
// Über beide Kataloge: im Log steht eine Nummer, und der Sieben-Saiter-Modus
// schreibt in denselben Log. Ohne das stünde hier die nackte Nummer.
import { ALLE_DRILLS_BY_ID } from "@/lib/session/drills"
import { nextBpm, progressFor, streakWeeks } from "@/lib/session/progress"
import { SITZT_AB } from "@/lib/session/lead"
import { aufnaeher, neueAufnaeher, type Aufnaeher } from "@/lib/session/merch"
import { loadProfile } from "@/lib/storage/profile"
import { loadTheoryLog } from "@/lib/storage/theory-log"
import { THEORY_CARDS } from "@/lib/theory/cards"
import type { TheoryLog } from "@/lib/theory/types"
import { AufnaeherKachel } from "@/components/session/merch-stand"
import type { DrillResult, PracticeLog } from "@/lib/session/types"
import { syncInBackground } from "@/lib/sync/run"
import { lastSynced } from "@/lib/sync/settings"
import { sollErinnern } from "@/lib/backup-erinnerung"
import { zuletztGesichert } from "@/lib/storage/lokal"
import { MdAdd, MdFileDownload } from "react-icons/md"

export interface SessionSummaryProps {
  results: DrillResult[]
  /** Der Stand *vor* dieser Session, für den Vergleich. */
  previousLog: PracticeLog
  log: PracticeLog
  /** Wie viele Wissensfragen unterwegs beantwortet wurden. */
  fragen?: number
  /**
   * Der Antwort-Log vom Beginn der Session. Ohne ihn zählten Wissens-
   * Aufnäher, die in den Fragepausen verdient wurden, nicht als neu.
   */
  previousTheory?: TheoryLog
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
    const drill = ALLE_DRILLS_BY_ID[result.drillId]
    if (!drill) return []

    const before = progressFor(previousLog, result.drillId).bestBpm
    if (before !== null && result.bpm <= before) return []

    return [{ title: drill.title, from: before, to: result.bpm }]
  })
}

export function SessionSummary({
  results,
  previousLog,
  log,
  fragen = 0,
  previousTheory,
  onExtend,
}: SessionSummaryProps) {
  const minutes = Math.max(1, Math.round(results.reduce((sum, r) => sum + r.seconds, 0) / 60))
  const streak = streakWeeks(log)
  const gains = gainsFrom(results, previousLog)
  const jetzt = new Date()
  const heute = `${jetzt.getDate()}.${jetzt.getMonth() + 1}.${jetzt.getFullYear()}`

  // Der Abschluss ist die einzige Stelle, an der jemand freiwillig stehen
  // bleibt — und der Moment, in dem gerade etwas entstanden ist, das
  // verlorengehen kann. Hier steht der Hinweis deshalb, und sonst nirgends.
  // Dieselbe Regel wie auf „Daten": erst wenn es wirklich etwas zu verlieren
  // gibt und lange nichts gesichert wurde.
  const [sichern, setSichern] = useState(false)

  // Was diese Session an Aufnähern gebracht hat — als Differenz zweier voller
  // Läufe, damit eine zweite Session am selben Tag nichts doppelt feiert.
  const [neu, setNeu] = useState<Aufnaeher[]>([])
  const [profil, setProfil] = useState<ReturnType<typeof loadProfile>>(null)
  useEffect(() => {
    const theorie = loadTheoryLog()
    setNeu(
      neueAufnaeher(
        aufnaeher(previousLog, previousTheory ?? theorie, THEORY_CARDS),
        aufnaeher(log, theorie, THEORY_CARDS),
      ),
    )
    setProfil(loadProfile())
  }, [previousLog, log, previousTheory])
  useEffect(() => {
    setSichern(
      sollErinnern({
        eintraege: log.results.length,
        gesichert: zuletztGesichert(),
        abgeglichen: lastSynced(),
        aeltester:
          log.results.length > 0
            ? new Date(Math.min(...log.results.map((r) => new Date(r.at).getTime())))
            : null,
      }),
    )
  }, [log])

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
          {streak > 1 && ` · ${streak} Wochen in Folge`}
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

      {/* Die Setlist als Zettel — abgeschaut bei Setlist, und hier wörtlich
          eine: die Songs dieses Abends. Sauber gespielt ist durchgestrichen;
          was zäh oder wackelig war, bekommt den Stempel und kommt wieder. */}
      <div className="zettel mt-8">
        <p className="kicker">Setlist · {heute}</p>
        <ol className="mt-2">
          {results.map((result, index) => {
            const drill = ALLE_DRILLS_BY_ID[result.drillId]
            const sauber = result.rating >= SITZT_AB
            const weiter = drill ? nextBpm(drill, progressFor(log, drill.id), profil) : null
            return (
              <li key={`${result.drillId}-${index}`} className={sauber ? "sauber" : ""}>
                <span className="song">{drill?.title ?? result.drillId}</span>
                {!sauber && <span className="nochmal">nochmal</span>}
                <span className="tempo">
                  {result.bpm} BPM
                  {weiter !== null && weiter !== result.bpm && ` → nächstes Mal ${weiter}`}
                  {result.timing && ` · Timing ${result.timing.score}, ±${result.timing.spreadMs} ms`}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      {neu.length > 0 && (
        <>
          <h2 className="rule mb-3 mt-9">Neu auf der Kutte</h2>
          <div className="grid grid-cols-2 gap-[9px]">
            {neu.map((a) => (
              <AufnaeherKachel key={a.id} a={a} />
            ))}
          </div>
          <Link href="/merch" className="btn btn-ghost btn-small mt-[9px] w-full py-3">
            Zum Merch-Stand ›
          </Link>
        </>
      )}

      <div className="mt-6 flex flex-wrap gap-[9px]">
        <Link href="/" className="btn flex-1">
          Feierabend
        </Link>
        <button onClick={onExtend} className="btn btn-ghost flex-1">
          <MdAdd className="h-[18px] w-[18px]" /> +5 Minuten
        </button>
      </div>

      {sichern && (
        <div className="mt-8">
          <div className="warnstreifen mb-2" aria-hidden />
          <p className="text-[13.5px] leading-relaxed text-rost">
            Dein Log liegt nur in diesem Browser und ist länger nicht gesichert worden. Eine
            Datei davon dauert einen Klick.
          </p>
          <Link href="/daten" className="btn btn-ghost btn-small mt-3 w-full py-3">
            <MdFileDownload className="h-[16px] w-[16px]" /> Stand sichern
          </Link>
        </div>
      )}
    </div>
  )
}
