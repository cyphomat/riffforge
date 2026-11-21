"use client"

import { useEffect, useState } from "react"
import { buchStand, type BuchStand } from "@/lib/session/riffbuch"
import { riffbuch } from "@/lib/storage/lokal"

const tag = (iso: string) => {
  const d = new Date(iso)
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
}

/**
 * Das Riffbuch auf dem Merch-Stand: die Riffe, die ganz erklungen sind, mit
 * ihrem ersten Tag. Ungehörte stehen nur als Umriss da. Die Liste gehört
 * diesem Gerät (`lib/session/riffbuch.ts`).
 */
export function RiffbuchAnsicht() {
  const [stand, setStand] = useState<BuchStand | null>(null)
  useEffect(() => setStand(buchStand(riffbuch())), [])
  if (!stand) return null

  return (
    <>
      <h2 className="tape">Riffbuch</h2>
      <section className="card">
        <p className="text-[14px] leading-relaxed text-muted">
          Ein Riff steht hier, wenn es auf diesem Gerät einmal ganz erklungen ist: in der Zugabe, in der Probe am Board
          oder bei den Türchen des Advents. {stand.gehoert.length} gehört, {stand.offen} offen.
        </p>
        <ul className="mt-3 space-y-[6px]">
          {stand.gehoert.map((r) => (
            <li key={r.id} className="flex items-baseline justify-between gap-3 border border-line bg-sunken px-3 py-2">
              <span className="text-[14px] text-fg">{r.titel}</span>
              <span className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-dim">{tag(r.am)}</span>
            </li>
          ))}
          {Array.from({ length: Math.min(stand.offen, 3) }, (_, i) => (
            <li key={`offen-${i}`} className="border border-dashed border-line px-3 py-2 text-[13px] text-dim opacity-60">
              Noch nicht gehört
            </li>
          ))}
        </ul>
        {stand.offen > 3 && <p className="mt-2 text-[12.5px] text-dim">… und {stand.offen - 3} weitere.</p>}
      </section>
    </>
  )
}
