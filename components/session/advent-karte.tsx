"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { adventJahr, adventStand } from "@/lib/session/advent"
import { TUERCHEN_ANZAHL } from "@/lib/session/advent-daten"
import { isoLokal } from "@/lib/session/anlaesse"
import type { PracticeLog } from "@/lib/session/types"

/**
 * Auf *Heute*, im Dezember: wie viele Türchen offen sind und wohin es zu den
 * Türchen geht. Ruhig, ohne Bewegung, nie in der Session. Das Datum gibt es
 * erst im Browser; der erste Anstrich zeigt deshalb nichts, wie beim Banner.
 */
export function AdventKarte({ log }: { log: PracticeLog }) {
  const [stand, setStand] = useState<{ offen: number } | null>(null)

  useEffect(() => {
    const jahr = adventJahr(isoLokal())
    setStand(jahr === null ? null : { offen: adventStand(log, jahr).offen })
  }, [log])

  if (!stand) return null
  const fertig = stand.offen >= TUERCHEN_ANZAHL

  return (
    <aside className="card mt-3" aria-label="Advent">
      <span className="kicker text-dim">Advent</span>
      <p className="display mt-2 text-[22px] leading-none text-fg">
        {stand.offen} von {TUERCHEN_ANZAHL} Türchen offen
      </p>
      <p className="mt-2 text-[13.5px] leading-snug text-muted">
        {fertig ? "Alle Türchen sind auf." : "Jeder Übungstag im Dezember öffnet das nächste. Verpasste holst du nach."}
      </p>
      <Link href="/advent" className="btn btn-ghost btn-small mt-3 w-full">
        Zu den Türchen ›
      </Link>
    </aside>
  )
}
