"use client"

import { useEffect, useState } from "react"
import { darstellung, merkeDarstellung } from "@/lib/storage/lokal"
import { DARSTELLUNGEN, type Darstellung } from "@/lib/ui/darstellung"

const NAME: Record<Darstellung, string> = { auto: "Auto", hell: "Hell", dunkel: "Dunkel" }

/**
 * Hell oder dunkel, für dieses Gerät.
 *
 * Steht bei den anderen Einstellungen des Geräts — Ablegen, Fassung,
 * Einmessen —, nicht in der Navigation: man wählt es einmal, und Auto folgt
 * danach ohnehin dem System. Angewendet wird es vom Skript im Kopf der Seite
 * (`lib/ui/darstellung.ts`), damit es schon vor dem ersten Anstrich stimmt.
 */
export function DarstellungPanel() {
  const [wahl, setWahl] = useState<Darstellung>("auto")

  // Erst nach dem ersten Anstrich: beim statischen Export gibt es beim Bauen
  // keinen Speicher.
  useEffect(() => {
    setWahl(darstellung())
  }, [])

  const waehle = (wert: Darstellung) => {
    setWahl(wert)
    merkeDarstellung(wert)
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Darstellung</h2>
      <p className="text-[14px] leading-relaxed text-muted">
        Dunkel für den Abend, hell für Tageslicht. <b className="text-fg">Auto</b> folgt dem
        Gerät. Gilt nur für diesen Browser.
      </p>
      <div className="mt-3 grid grid-cols-3 gap-[9px]" role="group" aria-label="Darstellung">
        {DARSTELLUNGEN.map((wert) => (
          <button
            key={wert}
            onClick={() => waehle(wert)}
            aria-pressed={wahl === wert}
            className={`border px-3 py-3 font-mono text-[12px] uppercase tracking-[0.1em] ${
              wahl === wert ? "border-akzent bg-(--tint-akzent) text-akzent" : "border-line text-muted"
            }`}
          >
            {NAME[wert]}
          </button>
        ))}
      </div>
    </section>
  )
}
