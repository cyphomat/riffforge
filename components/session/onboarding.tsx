"use client"

import { useState } from "react"
import { EXPERIENCE, FOCUS, makeProfile, type Experience, type Focus } from "@/lib/session/profile"
import { saveProfile } from "@/lib/storage/profile"

function Choice({
  label,
  hint,
  active,
  onSelect,
}: {
  label: string
  hint: string
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={active}
      className={`border p-[14px] text-left transition-colors ${
        active
          ? "border-akzent bg-(--tint-akzent)"
          : "border-line bg-panel hover:border-stahl"
      }`}
    >
      <div className={`display text-[18px] ${active ? "text-akzent" : "text-fg"}`}>{label}</div>
      <div className="mt-1 text-[13px] text-muted">{hint}</div>
    </button>
  )
}

/**
 * Ersteinrichtung: zwei Fragen, mehr braucht die App nicht.
 *
 * Beide Antworten ändern etwas Echtes — das Starttempo aller Drills und was
 * zuerst drankommt. Eine Frage, die nichts bewirkt, gehört hier nicht hin.
 * Beides lässt sich später ohnehin nicht mehr aufhalten: sobald ein Log da
 * ist, schreibt sich das Tempo daraus fort.
 */
export function Onboarding({ onDone }: { onDone: () => void }) {
  const [experience, setExperience] = useState<Experience | null>(null)
  const [focus, setFocus] = useState<Focus | null>(null)

  const start = () => {
    if (!experience || !focus) return
    saveProfile(makeProfile(experience, focus))
    onDone()
  }

  return (
    <div className="huelle">
      <section className="card mt-6">
        <span className="kicker">Einmal kurz</span>
        <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Zwei Fragen</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Danach nie wieder. Beides ändert nur, wo du <i>anfängst</i> — wie es weitergeht,
          entscheidet, was du tatsächlich spielst.
        </p>
      </section>

      <h2 className="rule mb-3 mt-8">Wo stehst du</h2>
      <div className="grid gap-[9px] sm:grid-cols-3">
        {EXPERIENCE.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            hint={option.hint}
            active={experience === option.value}
            onSelect={() => setExperience(option.value)}
          />
        ))}
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-dim">
        Setzt die Starttempi. Zu hoch gegriffen merkst du in der ersten Session — dann sagst du
        &bdquo;zäh&ldquo;, und es geht runter.
      </p>

      <h2 className="rule mb-3 mt-8">Was zuerst</h2>
      <div className="grid gap-[9px] sm:grid-cols-3">
        {FOCUS.map((option) => (
          <Choice
            key={option.value}
            label={option.label}
            hint={option.hint}
            active={focus === option.value}
            onSelect={() => setFocus(option.value)}
          />
        ))}
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-dim">
        Ein Schwerpunkt, kein Filter. Die andere Seite kommt trotzdem dran, nur später.
      </p>

      <button onClick={start} disabled={!experience || !focus} className="btn mt-8 w-full py-5">
        Los geht&apos;s
      </button>
    </div>
  )
}
