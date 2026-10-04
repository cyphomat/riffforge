"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { DRILLS } from "@/lib/session/drills"
import { buildSession, tagesZufall } from "@/lib/session/builder"
import { aufnaeher, rang as berechneRang, type Rang } from "@/lib/session/merch"
import { loadTheoryLog } from "@/lib/storage/theory-log"
import { THEORY_CARDS } from "@/lib/theory/cards"
import { SIEBEN_DRILLS } from "@/lib/session/drills-sieben"
import { briefingFor, TONE_CLASS, TONE_LABEL } from "@/lib/session/briefing"
import {
  daysPractisedInLast,
  masteryOf,
  progressFor,
  streakWeeks,
  totalMinutes,
} from "@/lib/session/progress"
import { loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"
import type { Profile } from "@/lib/session/profile"
import { Onboarding } from "@/components/session/onboarding"
import { PracticeCalendar } from "@/components/session/practice-calendar"
import { Welcome } from "@/components/session/welcome"
import { merkeWillkommen, willkommenGesehen } from "@/lib/storage/lokal"
import { EMPTY_LOG, TECHNIQUE_LABELS, type BlockKind, type PracticeLog, type SessionBlock } from "@/lib/session/types"
import { MdLinearScale, MdMusicNote } from "react-icons/md"

const EXTRA_LENGTHS = [10, 25]

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
const ART: Record<BlockKind, string> = { warmup: "Aufwärmen", technique: "Technik", riff: "Riff" }

/** Ein Drill je Zeile, mit seinen Runden — der Plan, wie man ihn liest. */
function alsSetlist(blocks: SessionBlock[]) {
  const zeilen: Array<{ block: SessionBlock; runden: number }> = []
  for (const block of blocks) {
    const schon = zeilen.find((z) => z.block.drill.id === block.drill.id)
    if (schon) schon.runden += 1
    else zeilen.push({ block, runden: 1 })
  }
  return zeilen
}

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
  const [plan, setPlan] = useState<SessionBlock[] | null>(null)
  const [merch, setMerch] = useState<{ rang: Rang; aufnaeher: number } | null>(null)

  useEffect(() => {
    const gelesen = loadLog()
    setLog(gelesen)
    setProfile(loadProfile())
    // Der Willkommens-Schirm gilt dem, der wirklich zum ersten Mal hier ist.
    // Wer schon einen Log hat — etwa nach einem Import — hat die Antworten
    // längst und würde nur aufgehalten.
    setWillkommen(!willkommenGesehen() && gelesen.results.length === 0)
    // Derselbe Plan, den die Session gleich baut: gleicher Log, gleicher
    // Zufall des Tages. Sonst kündigte das Plakat etwas anderes an.
    setPlan(buildSession(gelesen, { minutes: 15, profile: loadProfile(), random: tagesZufall() }).blocks)
    setMerch({
      rang: berechneRang(gelesen),
      aufnaeher: aufnaeher(gelesen, loadTheoryLog(), THEORY_CARDS).filter((a) => a.verdient).length,
    })
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
  const jetzt = new Date()
  const heuteKopf = `${WOCHENTAGE[jetzt.getDay()]} ${`${jetzt.getDate()}`.padStart(2, "0")}.${`${jetzt.getMonth() + 1}`.padStart(2, "0")}.`
  const hasHistory = loaded && log.results.length > 0

  // Beide Kataloge: der Sieben-Saiter schreibt in denselben Log, und was
  // gespielt wurde, gehört in den Fortschritt — gefiltert wird ohnehin auf
  // das, was Versuche hat.
  const tracked = [...DRILLS, ...SIEBEN_DRILLS]
    .filter((drill) => drill.kind !== "warmup")
    .map((drill) => {
      const progress = progressFor(log, drill.id)
      return { drill, progress, mastery: masteryOf(drill, progress, profile) }
    })
    .filter((entry) => entry.progress.attempts > 0)
    .sort((a, b) => b.mastery - a.mastery)

  return (
    <div className="huelle-breit zwei-spalten">
      <div className="spalte">
      {/* Das Plakat — abgeschaut bei Setlist. Ein Wort für den Tag, riesig und
          in seiner Farbe; ein Satz dazu; darunter, was gleich drankommt, und
          der Startknopf in derselben Karte. Vorher stand das Tageswort als
          kleines Etikett da, und was heute gespielt wird, sah man erst nach
          dem Start. */}
      <section className="card winkel mt-6">
        <div className="flex items-center gap-3">
          {/* Kontrolllampe in der Farbe des Tonfalls — dieselbe Auskunft wie
              das Wort darunter, nur als Lampe. */}
          <span className={`jewel ${TONE_CLASS[briefing.tone]}`} aria-hidden />
          <span className="kicker text-dim">
            {heuteKopf}
            {hasHistory && ` · ${streakWeeks(log)} ${streakWeeks(log) === 1 ? "Woche" : "Wochen"} in Folge`}
          </span>
        </div>
        <h1 className={`display mt-2 text-[64px] leading-[0.95] sm:text-[72px] ${TONE_CLASS[briefing.tone]}`}>
          {TONE_LABEL[briefing.tone]}
        </h1>
        <p className="mt-2 text-[19px] font-semibold leading-snug text-fg">{briefing.line}</p>
        <p className="mt-1 text-[14.5px] leading-relaxed text-muted">{briefing.reason}</p>

        {plan && (
          <div className="mt-5 border-t border-line pt-4">
            <span className="kicker text-dim">Als Nächstes</span>
            <ul className="mt-2">
              {alsSetlist(plan).map(({ block, runden }) => (
                <li
                  key={block.drill.id}
                  className="flex items-baseline gap-3 border-b border-line py-[9px] last:border-b-0"
                >
                  <span className="w-[76px] flex-none font-mono text-[11.5px] uppercase tracking-[0.1em] text-dim">
                    {ART[block.drill.kind]}
                  </span>
                  <span className="min-w-0 flex-1 text-[15px] leading-snug text-fg">
                    {block.drill.title}
                    {runden > 1 && <span className="text-dim"> · {runden} Runden</span>}
                  </span>
                  <span className="ziffern flex-none text-[15px] font-bold text-akzent">
                    {block.bpm}
                    <span className="text-[11.5px] font-normal text-dim"> BPM</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link href="/session?minutes=15" className="btn mt-5 w-full py-5 text-[15px]">
          Session starten · 15 Min
        </Link>
      </section>

      <div className="mt-3 flex items-center gap-2">
        <span className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-dim">oder</span>
        {EXTRA_LENGTHS.map((length) => (
          <Link key={length} href={`/session?minutes=${length}`} className="btn btn-ghost btn-small">
            {length} Min
          </Link>
        ))}
      </div>

      {/* Die zwei Nebenwege: drei Minuten Lead, und der Modus für die
          Siebensaitige. Bewusst beide in Grau und nebeneinander — die
          Viertelstunde bleibt das Produkt, und ein zweiter Knopf in Bernstein
          hätte zwei Hauptwege gemacht. */}
      <div className="mt-[9px] grid grid-cols-2 gap-[9px]">
        <Link href="/lick" className="btn btn-ghost w-full py-4">
          <MdMusicNote className="h-[18px] w-[18px]" /> Ein Lick
        </Link>
        <Link href="/sieben" className="btn btn-ghost w-full py-4">
          <MdLinearScale className="h-[18px] w-[18px]" /> Sieben Saiten
        </Link>
      </div>

      {/* Der Eingang zum Merch-Stand: eine Zeile unter den Nebenwegen, kein
          zweites Plakat. Er stand zuerst in der rechten Spalte unter *Bisher*
          — auf dem Handy stapelt die sich unter den Kalender, und die Zeile
          lag über tausend Pixel tief, wo niemand hinscrollt. Hier steht sie
          in beiden Breiten gleich nah am Startknopf. */}
      {hasHistory && merch && (
        <Link
          href="/merch"
          className="mt-[9px] flex items-center justify-between gap-3 border border-line bg-panel px-[15px] py-3 transition-colors hover:border-akzent"
        >
          <span className="flex items-baseline gap-2">
            <span className="kicker text-dim">Rang</span>
            <span className="display text-[17px] text-fg">{merch.rang.titel}</span>
          </span>
          <span className="ziffern text-[12px] text-muted">{merch.aufnaeher} Aufnäher ›</span>
        </Link>
      )}

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
