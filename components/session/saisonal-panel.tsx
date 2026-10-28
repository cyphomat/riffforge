"use client"

import { useEffect, useState } from "react"
import { merkeSaisonal, saisonalAn } from "@/lib/storage/lokal"

/**
 * Der Banner zu Weihnachten und anderen Anlässen, an oder aus.
 *
 * Steht neben der Darstellung bei den Einstellungen des Geräts. Das ✕ im
 * Banner blendet ihn nur für den Tag aus; hier schaltet man ihn ganz ab, und
 * wieder an holt auch den für heute ausgeblendeten zurück.
 */
export function SaisonalPanel() {
  const [an, setAn] = useState(true)

  // Erst nach dem ersten Anstrich: beim statischen Export gibt es beim Bauen
  // keinen Speicher.
  useEffect(() => {
    setAn(saisonalAn())
  }, [])

  const waehle = (wert: boolean) => {
    setAn(wert)
    merkeSaisonal(wert)
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Saisonales</h2>
      <p className="text-[14px] leading-relaxed text-muted">
        Ein kleiner Streifen auf <b className="text-fg">Heute</b> zu Weihnachten und an ein paar
        Gedenktagen. Nie in der Session. Gilt nur für diesen Browser.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-[9px]" role="group" aria-label="Saisonales">
        {[true, false].map((wert) => (
          <button
            key={String(wert)}
            onClick={() => waehle(wert)}
            aria-pressed={an === wert}
            className={`border px-3 py-3 font-mono text-[12px] uppercase tracking-[0.1em] ${
              an === wert ? "border-akzent bg-(--tint-akzent) text-akzent" : "border-line text-muted"
            }`}
          >
            {wert ? "An" : "Aus"}
          </button>
        ))}
      </div>
    </section>
  )
}
