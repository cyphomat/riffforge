"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { asset } from "@/lib/base-path"
import { isoLokal } from "@/lib/session/anlaesse"
import { sichtbareDrops, type Drop } from "@/lib/session/drops"
import { DROPS } from "@/lib/session/drops-daten"
import { heuteSpruch } from "@/lib/session/roadie"
import type { PracticeLog } from "@/lib/session/types"
import { dropGesehen, merkeDropGesehen } from "@/lib/storage/lokal"

/** Der Roadie als Pixelbild: 16 px, dreifach gezeichnet, steht still. */
export function RoadieBild({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer
    <img src={asset("/bilder/roadie.png")} alt="" width={48} height={48} className={`pixel flex-none ${className}`} />
  )
}

/**
 * Auf *Heute*, unter dem Banner: ein Satz des Roadies und, solange er neu ist,
 * die Karte des jüngsten Drops. Beides ruhig, ohne Bewegung, nie in der Session.
 *
 * Datum und gesehener Drop gibt es erst im Browser; der erste Anstrich zeigt
 * deshalb nichts, wie beim Anlass-Banner.
 */
export function RoadieHeute({ log }: { log: PracticeLog }) {
  const [stand, setStand] = useState<{ spruch: string; neu: Drop | null } | null>(null)

  useEffect(() => {
    const heute = isoLokal()
    const drops = sichtbareDrops(DROPS, heute)
    const neuester = drops[0] ?? null
    setStand({
      spruch: heuteSpruch(log, heute, drops),
      neu: neuester && dropGesehen() !== neuester.id ? neuester : null,
    })
  }, [log])

  if (!stand) return null
  const { spruch, neu } = stand

  return (
    <div className="mt-3">
      {neu && (
        <aside className="card mb-3" aria-label={`Neuer Drop: ${neu.titel}`}>
          <span className="kicker text-dim">Neuer Drop · {neu.thema}</span>
          {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
          <img
            src={asset(`/bilder/drop-${neu.id}.png`)}
            alt={`Bühne: ${neu.titel}`}
            width={288}
            height={144}
            className="pixel mt-2 block h-auto w-[288px] max-w-full border border-line"
          />
          <p className="display mt-3 text-[24px] leading-none text-fg">{neu.titel}</p>
          <p className="mt-2 text-[13.5px] leading-snug text-muted">{neu.text}</p>
          <div className="mt-3 flex gap-[9px]">
            <Link href="/merch" className="btn btn-small flex-1" onClick={() => merkeDropGesehen(neu.id)}>
              Zum Gurt ›
            </Link>
            <button
              type="button"
              className="btn btn-ghost btn-small flex-1"
              onClick={() => {
                merkeDropGesehen(neu.id)
                setStand({ ...stand, neu: null })
              }}
            >
              Gesehen
            </button>
          </div>
        </aside>
      )}
      <div className="flex items-center gap-3">
        <RoadieBild />
        <p className="text-[13.5px] italic leading-snug text-muted">„{spruch}“</p>
      </div>
    </div>
  )
}
