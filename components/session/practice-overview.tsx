"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DRILLS } from "@/lib/session/drills"
import { briefingFor, TONE_CLASS, TONE_LABEL } from "@/lib/session/briefing"
import {
  daysPractisedInLast,
  masteryOf,
  progressFor,
  streakDays,
  totalMinutes,
} from "@/lib/session/progress"
import { loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"
import type { Profile } from "@/lib/session/profile"
import { Onboarding } from "@/components/session/onboarding"
import { PracticeCalendar } from "@/components/session/practice-calendar"
import { Welcome } from "@/components/session/welcome"
import { merkeWillkommen, willkommenGesehen } from "@/lib/storage/lokal"
import { EMPTY_LOG, TECHNIQUE_LABELS, type PracticeLog } from "@/lib/session/types"
import { MdMusicNote } from "react-icons/md"

const EXTRA_LENGTHS = [10, 25]

function Stat({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="n">{label}</div>
      <div className="v">{value}</div>
      {sub && <div className="font-mono text-[11.5px] text-dim">{sub}</div>}
    </div>
  )
}

export function PracticeOverview() {
  // localStorage gibt es beim Rendern auf dem Server nicht: der erste Anstrich
  // zeigt den leeren Stand, die echten Zahlen kommen beim Mounten.
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [willkommen, setWillkommen] = useState(false)

  useEffect(() => {
    const gelesen = loadLog()
    setLog(gelesen)
    setProfile(loadProfile())
    // Der Willkommens-Schirm gilt dem, der wirklich zum ersten Mal hier ist.
    // Wer schon einen Log hat — etwa nach einem Import — hat die Antworten
    // längst und würde nur aufgehalten.
    setWillkommen(!willkommenGesehen() && gelesen.results.length === 0)
    setLoaded(true)
  }, [])

  const willkommenWeg = () => {
    merkeWillkommen()
    setWillkommen(false)
  }

  // Einmal überhaupt: wo bleiben die Daten, brauche ich ein Konto, wie komme
  // ich wieder raus. Erst danach die zwei Fragen zum Starttempo.
  if (loaded && willkommen) {
    return (
      <Welcome onStart={willkommenWeg} onImport={willkommenWeg} />
    )
  }

  // Ersteinrichtung nur beim allerersten Mal — und nur, solange noch nichts
  // geübt wurde. Wer schon einen Log hat, braucht keine Starttempi mehr.
  if (loaded && !profile && log.results.length === 0) {
    return <Onboarding onDone={() => setProfile(loadProfile())} />
  }

  const briefing = briefingFor(log)
  const hasHistory = loaded && log.results.length > 0

  const tracked = DRILLS.filter((drill) => drill.kind !== "warmup")
    .map((drill) => {
      const progress = progressFor(log, drill.id)
      return { drill, progress, mastery: masteryOf(drill, progress, profile) }
    })
    .filter((entry) => entry.progress.attempts > 0)
    .sort((a, b) => b.mastery - a.mastery)

  return (
    <div className="huelle-breit zwei-spalten">
      <div className="spalte">
      {/* Die Ansage: was heute ansteht, und woran das festgemacht ist. */}
      <section className="card winkel mt-6">
        <div className="flex items-center gap-3">
          {/* Kontrolllampe in der Farbe des Tonfalls — dieselbe Auskunft wie
              das Wort daneben, nur als Lampe. `aria-hidden`, weil sie nichts
              sagt, was daneben nicht schon steht. */}
          <span className={`jewel ${TONE_CLASS[briefing.tone]}`} aria-hidden />
          <span className={`kicker border border-current px-2 py-[3px] ${TONE_CLASS[briefing.tone]}`}>
            {TONE_LABEL[briefing.tone]}
          </span>
          {hasHistory && (
            <span className="kicker text-dim">
              {streakDays(log)} {streakDays(log) === 1 ? "Tag" : "Tage"} in Folge
            </span>
          )}
        </div>
        <h1 className="display mt-2 text-[34px] text-fg sm:text-[38px]">{briefing.line}</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{briefing.reason}</p>
      </section>

      <Link href="/session?minutes=15" className="btn mt-4 w-full py-5 text-[15px]">
        Session starten · 15 Min
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-dim">oder</span>
        {EXTRA_LENGTHS.map((length) => (
          <Link key={length} href={`/session?minutes=${length}`} className="btn btn-ghost btn-small">
            {length} Min
          </Link>
        ))}
      </div>

      {/* Der zweite Eingang: drei Minuten Lead, ohne Session drumherum.
          Bewusst als Nebenweg gesetzt — die Viertelstunde bleibt das Produkt,
          und ein zweiter Knopf in Bernstein hätte zwei Hauptwege gemacht. */}
      <Link href="/lick" className="btn btn-ghost mt-[9px] w-full py-4">
        <MdMusicNote className="h-[18px] w-[18px]" /> Let&apos;s play a lick
      </Link>

        {hasHistory && (
          <>
            <h2 className="rule mb-3 mt-9">Übungstage</h2>
            <PracticeCalendar log={log} />
          </>
        )}
      </div>

      <div className="spalte">
      {hasHistory && (
        <>
          <h2 className="rule mt-9 mb-3">Bisher</h2>
          <div className="grid grid-cols-3 gap-[9px]">
            <Stat value={daysPractisedInLast(log, 7)} label="Diese Woche" sub="von 7 Tagen" />
            <Stat value={totalMinutes(log)} label="Minuten" sub="insgesamt" />
            <Stat value={log.results.length} label="Blöcke" sub="gespielt" />
          </div>

          {tracked.length > 0 && (
            <>
              <h2 className="rule mt-9 mb-3">Wo du stehst</h2>
              <div className="flex flex-col gap-[9px]">
                {tracked.map(({ drill, progress, mastery }) => (
                  <div key={drill.id} className="border border-line bg-panel px-[15px] py-[13px]">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="min-w-0">
                        <div className="display text-[17px] text-fg">{drill.title}</div>
                        <div className="kicker mt-0.5 text-dim">
                          {TECHNIQUE_LABELS[drill.technique]}
                        </div>
                      </div>
                      <div className="flex-none text-right">
                        <div className="ziffern text-[15px] font-bold text-akzent">
                          {progress.bestBpm ?? "–"}
                          <span className="text-dim"> / {drill.targetBpm} BPM</span>
                        </div>
                        {progress.bestTimingScore !== null && (
                          <div className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-stahl">
                            Timing {progress.bestTimingScore}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="bar mt-[10px] h-[5px]">
                      <i style={{ width: `${Math.round(mastery * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      </div>
    </div>
  )
}
