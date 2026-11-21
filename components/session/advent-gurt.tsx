"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plektrum } from "@/components/session/plektrum"
import { adventJahr, adventStand } from "@/lib/session/advent"
import { type AdventPlektrum } from "@/lib/session/advent-daten"
import { isoLokal } from "@/lib/session/anlaesse"
import type { PracticeLog } from "@/lib/session/types"

/**
 * Die Plektren des Advents, soweit ihre Türchen offen sind. Im Dezember das
 * laufende Jahr, sonst der letzte Advent. Fehlt noch jedes, steht nichts da —
 * keine Reihe leerer Umrisse vor dem 1. Dezember.
 */
export function AdventGurt({ log }: { log: PracticeLog }) {
  const [stand, setStand] = useState<{ jahr: number; plektren: AdventPlektrum[] } | null>(null)

  useEffect(() => {
    const heute = isoLokal()
    const jahr = adventJahr(heute) ?? Number(heute.slice(0, 4)) - 1
    const plektren = adventStand(log, jahr)
      .geoeffnet.flatMap((t) => (t.art === "plektrum" ? [t.plektrum] : []))
    setStand(plektren.length > 0 ? { jahr, plektren } : null)
  }, [log])

  if (!stand) return null

  return (
    <>
      <h2 className="tape">Advent {stand.jahr}</h2>
      <section className="card">
        <p className="mb-3 text-[13px] text-dim">
          Plektren aus den Türchen. <Link href="/advent" className="underline">Zu den Türchen</Link>
        </p>
        <ul className="grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3">
          {stand.plektren.map((p) => (
            <li key={p.id} className="flex flex-col items-center text-center">
              <Plektrum aussehen={{ farbe: p.farbe, form: p.form, material: p.material }} stufe="g" an />
              <span className="mt-1 text-[13px] leading-tight text-muted">{p.name}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
