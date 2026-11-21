"use client"

import { useEffect, useState } from "react"
import { PixelGegner } from "@/components/ui/pixel-gegner"
import { wochengegner, type Wochengegner } from "@/lib/session/wochengegner"
import type { PracticeLog } from "@/lib/session/types"
import { loadTheoryLog } from "@/lib/storage/theory-log"

/** Die Lebensleiste: eine Zelle pro Lebenspunkt, Akzent nur auf dem, was noch steht. */
export function Lebensleiste({ rest, hp }: { rest: number; hp: number }) {
  return (
    <div
      role="meter"
      aria-valuemin={0}
      aria-valuemax={hp}
      aria-valuenow={rest}
      aria-label={`${rest} von ${hp} Lebenspunkten`}
      className="flex gap-[2px]"
    >
      {Array.from({ length: hp }, (_, i) => (
        <span key={i} className={`h-3 flex-1 ${i < rest ? "bg-akzent" : "bg-sunken border border-line"}`} />
      ))}
    </div>
  )
}

/**
 * Auf *Heute*: der Gegner der Woche mit seiner Leiste. Ruhig, ohne Bewegung,
 * nie in der Session. Erst wer einmal geübt hat, bekommt ihn zu sehen.
 */
export function WochengegnerKarte({ log }: { log: PracticeLog }) {
  const [gegner, setGegner] = useState<Wochengegner | null>(null)

  useEffect(() => {
    setGegner(wochengegner(log, loadTheoryLog()))
  }, [log])

  if (!gegner || log.results.length === 0) return null
  const { name, rest, hp, gefallen, treffer } = gegner

  return (
    <aside className="card mt-3" aria-label={`Wochengegner: ${name}`}>
      <span className="kicker text-dim">Gegner der Woche</span>
      <div className="mt-2 flex items-center gap-4">
        <PixelGegner besiegt={gefallen} />
        <div className="min-w-0 flex-1">
          <p className="display text-[20px] leading-none text-fg">{name}</p>
          <p className="mt-2 text-[13px] leading-snug text-muted">
            {gefallen
              ? "Liegt am Boden. Bis Montag Ruhe."
              : `${rest} von ${hp} Lebenspunkten. Tage, saubere Blöcke, Riffe im Zieltempo und richtige Antworten nehmen ihm etwas.`}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Lebensleiste rest={rest} hp={hp} />
      </div>
      <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.08em] text-dim">
        {treffer.summe} Treffer · {treffer.tage} Tage · {treffer.sauber} Blöcke · {treffer.ziel / 2} Riffe am Ziel · {treffer.wissen} Antworten
      </p>
    </aside>
  )
}
