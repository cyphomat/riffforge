"use client"

import { useEffect, useState } from "react"
import { asset } from "@/lib/base-path"
import { finde, fuer, isoLokal, motivBild, MOTIV_KANTE, satzFuer, type Anlass } from "@/lib/session/anlaesse"
import { anlassVersteckt, saisonalAn, verstecke } from "@/lib/storage/lokal"

/** Ein Motiv wird dreifach gezeichnet: 15 px sind auf dem Handy zu klein, 4 × schon laut. */
const FAKTOR = 3

interface Zeigt {
  anlass: Anlass
  tag: string
  /** Vorschau über `?anlass=`: nichts wird gespeichert, ✕ blendet nur aus. */
  vorschau: boolean
}

/**
 * Der eine Schmuck der App: ein ruhiger Streifen unter der Ansage, an rund
 * vierzig Tagen im Jahr (`lib/session/anlaesse.ts`).
 *
 * Bewusst klein — kein Winkel, keine Lampe, keine Bewegung, keine
 * Akzentfarbe, nur Linie, Motiv und ein Satz. Ein Gedenktag verzichtet auch
 * noch auf die Linie. Steht nur auf *Heute*, nie in einer Session. Die
 * Regeln und ihre Begründung: `docs/design-und-themes.md`.
 *
 * Wann er erscheint, entscheidet erst der Effekt nach dem ersten Anstrich:
 * beim statischen Export gibt es weder Datum noch Speicher, und ein Banner,
 * der kurz aufblitzt und wieder verschwindet, wäre schlimmer als keiner.
 * `?anlass=weihnachten` zeigt ihn zur Probe, auch ausserhalb der Zeit.
 */
export function AnlassBanner() {
  const [zeigt, setZeigt] = useState<Zeigt | null>(null)

  useEffect(() => {
    const tag = isoLokal()
    // `window.location` statt `useSearchParams`: Das zöge die ganze Seite aus
    // dem statischen Export in den Client-Abruf.
    const gewuenscht = new URLSearchParams(window.location.search).get("anlass")
    const probe = gewuenscht ? finde(gewuenscht) : null
    if (probe) {
      setZeigt({ anlass: probe, tag, vorschau: true })
      return
    }
    const heute = fuer(tag)
    if (heute && saisonalAn() && !anlassVersteckt(tag)) setZeigt({ anlass: heute, tag, vorschau: false })
  }, [])

  if (!zeigt) return null
  const { anlass, tag, vorschau } = zeigt
  const schlicht = anlass.typ === "gedenk"

  const ausblenden = () => {
    if (!vorschau) verstecke(tag)
    setZeigt(null)
  }

  return (
    <aside
      aria-label={anlass.name}
      className={`mt-3 flex items-center gap-3 ${schlicht ? "px-1 py-2" : "border border-line px-3 py-2"}`}
    >
      <span className="flex flex-none items-end gap-[3px]" aria-hidden>
        {anlass.bild.map((id, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${id}-${i}`}
            src={asset(motivBild(id))}
            width={MOTIV_KANTE * FAKTOR}
            height={MOTIV_KANTE * FAKTOR}
            alt=""
            className="pixel flex-none"
          />
        ))}
      </span>
      <p className="min-w-0 flex-1 text-[14px] leading-snug text-muted">{satzFuer(anlass, tag)}</p>
      <button
        onClick={ausblenden}
        aria-label={`${anlass.name} für heute ausblenden`}
        className="flex-none px-2 py-1 font-mono text-[14px] text-dim"
      >
        ✕
      </button>
    </aside>
  )
}
