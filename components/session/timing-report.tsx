import type { ReactNode } from "react"
import Link from "next/link"
import type { TimingAnalysis } from "@/lib/audio/timing"

const TREND_TEXT = {
  steady: "Tempo bleibt stabil",
  rushing: "Du wirst über den Block hinweg schneller",
  dragging: "Du wirst über den Block hinweg langsamer",
} as const

/**
 * What the offset says about the player — and what it cannot.
 *
 * A positive offset is mostly signal-chain latency and cannot be held against
 * the player. A negative one could only be the player's own doing — *if* the
 * offset is pinned down. At fast clicks it is not: a chain slower than half a
 * click wraps onto the previous click and reads as early. So "you play ahead"
 * is only said when it is unambiguous, and a calibration is what makes it so.
 */
function offsetText(analysis: TimingAnalysis): ReactNode {
  const { offsetMs, lageMs, einmessung, versatzEindeutig } = analysis

  if (einmessung === "passt-nicht") {
    return (
      <>
        {/* Keine Zahl hier: passt die Einmessung nicht, ist der Versatz bei
            dichten Klicks wieder nur bis auf ganze Klicks bestimmt — und
            „−39 ms hinter dem Klick" stand so tatsächlich schon da. */}
        Der Versatz passte diesmal nicht zu deiner Einmessung — andere Kopfhörer, ein anderes
        Mikrofon? Dann unter <Link href="/daten" className="underline underline-offset-2">Daten</Link> neu einmessen.
      </>
    )
  }
  if (lageMs !== null) {
    if (Math.abs(lageMs) <= 8) return `Laufzeit herausgerechnet: du lagst praktisch genau auf dem Klick.`
    return lageMs < 0
      ? `Laufzeit herausgerechnet: du lagst ${Math.abs(lageMs)} ms vor dem Klick.`
      : `Laufzeit herausgerechnet: du lagst ${lageMs} ms hinter dem Klick.`
  }
  if (einmessung === "passt") {
    return "Gemessen gegen deine Einmessung per Anschlag — sie enthält deine Gewohnheit schon, deshalb hier keine Lage zum Klick."
  }
  if (Math.abs(offsetMs) <= 8) return "Deine Anschläge lagen praktisch genau auf dem Klick."
  if (offsetMs > 0) {
    return `Deine Anschläge lagen konstant ${offsetMs} ms hinter dem Klick — darin steckt die Laufzeit von der Saite bis ins Mikrofon, die nicht gegen dich zählen kann.`
  }
  if (versatzEindeutig) {
    return `Deine Anschläge lagen konstant ${Math.abs(offsetMs)} ms vor dem Klick. Laufzeit kann einen Ton nur später machen, nie früher — du spielst also tatsächlich vorne.`
  }
  return (
    <>
      Deine Anschläge lagen scheinbar {Math.abs(offsetMs)} ms vor dem Klick. Bei so dichten Klicks
      kann das auch eine langsame Kette sein, die auf den vorigen Klick fällt.{" "}
      <Link href="/daten" className="underline underline-offset-2">Einmessen</Link> macht es eindeutig.
    </>
  )
}

function Metric({ value, unit, label }: { value: string | number; unit?: string; label: string }) {
  return (
    <div className="stat">
      <div className="n">{label}</div>
      <div className="v">
        {value}
        {unit && <span className="ml-1 font-mono text-[13px] font-normal text-dim">{unit}</span>}
      </div>
    </div>
  )
}

/**
 * Deviations as a strip around the beat, so a glance says whether the notes sat
 * in a tight cluster or scattered. ±60 ms fills the width.
 */
function Scatter({ deviations }: { deviations: number[] }) {
  return (
    <div className="relative h-11 overflow-hidden border border-line bg-sunken">
      <div className="absolute inset-y-0 left-1/2 w-px bg-akzent opacity-40" />
      {deviations.map((deviation, index) => {
        const position = 50 + Math.max(-50, Math.min(50, (deviation / 60) * 50))
        return (
          <div
            key={index}
            className="absolute top-1/2 h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 bg-akzent opacity-70"
            style={{ left: `${position}%` }}
          />
        )
      })}
      <span className="absolute bottom-0.5 left-1.5 font-mono text-[11px] uppercase tracking-widest text-dim">früh</span>
      <span className="absolute bottom-0.5 right-1.5 font-mono text-[11px] uppercase tracking-widest text-dim">spät</span>
    </div>
  )
}

export function TimingReport({ analysis }: { analysis: TimingAnalysis }) {
  if (analysis.expected === 0) return null

  if (analysis.hits === 0) {
    return (
      <div className="border border-line bg-panel px-[15px] py-3 text-[13.5px] leading-relaxed text-muted">
        Das Mikrofon hat nichts gehört, was zum Klick passt. Lauter spielen oder näher ans
        Mikrofon — die Einschätzung unten machst du diesmal selbst.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-[9px]">
        <Metric value={analysis.score} label="Timing-Score" />
        <Metric value={`±${analysis.spreadMs}`} unit="ms" label="Streuung" />
        <Metric value={`${analysis.hits}/${analysis.expected}`} label="Getroffen" />
      </div>

      <Scatter deviations={analysis.deviationsMs} />

      <div className="border-l-2 border-line pl-3">
        <p className="text-[14px] text-fg">{TREND_TEXT[analysis.trend]}.</p>
        <p className="mt-1 text-[12px] leading-relaxed text-dim">
          Gemessen wird die Streuung, nicht der Versatz. {offsetText(analysis)}
        </p>
      </div>
    </div>
  )
}
