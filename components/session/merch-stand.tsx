"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MdArrowBack } from "react-icons/md"
import {
  RAENGE,
  REIHEN,
  aufnaeher as berechneAufnaeher,
  kutte,
  rang as berechneRang,
  touren as berechneTouren,
  type Aufnaeher,
  type Rang,
  type Tour,
} from "@/lib/session/merch"
import { loadLog } from "@/lib/storage/practice-log"
import { loadTheoryLog } from "@/lib/storage/theory-log"
import { THEORY_CARDS } from "@/lib/theory/cards"

/** `2026-06-15` → `15.6.2026` — wie man ein Datum auf einen Aufnäher stickt. */
export function datum(tag: string): string {
  const [jahr, monat, tagZahl] = tag.split("-").map(Number)
  return `${tagZahl}.${monat}.${jahr}`
}

export function AufnaeherKachel({ a }: { a: Aufnaeher }) {
  return (
    <div className={`aufnaeher ${a.verdient ? "verdient" : "offen"}`}>
      <div className={`display text-[17px] leading-tight ${a.verdient ? "text-fg" : "text-muted"}`}>
        {a.titel}
      </div>
      <p className={`mt-1 text-[13px] leading-snug ${a.verdient ? "text-muted" : "text-dim"}`}>
        {a.verdient ? `seit ${datum(a.verdient)}` : a.text}
      </p>
    </div>
  )
}

/**
 * Der Merch-Stand: Rang, Kutte, Tourshirts.
 *
 * Alles wird beim Öffnen aus den beiden Logs gerechnet — es gibt hier nichts
 * zu speichern und nichts, das zwischen zwei Geräten auseinanderlaufen
 * könnte. Warum es so gebaut ist, steht in `lib/session/merch.ts`.
 */
export function MerchStand() {
  const [stand, setStand] = useState<{ rang: Rang; liste: Aufnaeher[]; touren: Tour[] } | null>(null)

  useEffect(() => {
    const log = loadLog()
    const liste = berechneAufnaeher(log, loadTheoryLog(), THEORY_CARDS)
    setStand({ rang: berechneRang(log), liste, touren: berechneTouren(log, liste) })
  }, [])

  if (!stand) return null
  const { rang, liste, touren } = stand
  const { verdient, naechste } = kutte(liste)

  return (
    <div className="huelle-breit zwei-spalten">
      <div className="spalte">
        <header className="mt-6">
          <span className="kicker">Merch</span>
          <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Merch-Stand</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            Alles hier wird aus deinem Log berechnet. Belohnt wird Regelmässigkeit, nicht Menge.
          </p>
        </header>

        {/* Der Rang ist die eine Auskunft dieses Bildschirms — deshalb die
            Winkel hier und nirgends sonst. */}
        <section className="card winkel mt-6">
          <span className="kicker text-dim">
            {rang.wochen} {rang.wochen === 1 ? "Woche" : "Wochen"} auf Tour
          </span>
          <h2 className="display mt-1 text-[44px] leading-none text-fg">{rang.titel}</h2>

          <div className="rangleiter mt-4" style={{ gridTemplateColumns: `repeat(${RAENGE.length}, 1fr)` }}>
            {RAENGE.map((r, i) => (
              <i key={r.id} className={i <= rang.stufe ? "an" : ""} title={r.titel} />
            ))}
          </div>
          {rang.naechster && (
            <div className="bar mt-2 h-[4px]">
              <i style={{ width: `${Math.round(rang.anteil * 100)}%` }} />
            </div>
          )}

          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            {rang.naechster
              ? `Noch ${rang.naechster.fehlt} ${rang.naechster.fehlt === 1 ? "Woche" : "Wochen"} bis ${rang.naechster.titel}. `
              : "Ganz oben angekommen. "}
            Gezählt werden Wochen mit mindestens einer Session, nicht Sessions. Der Rang fällt nie.
          </p>
        </section>

        <h2 className="rule mb-3 mt-9">Tourshirts</h2>
        {touren.length === 0 ? (
          <p className="text-[14px] text-dim">Die erste Tour beginnt mit der ersten Session.</p>
        ) : (
          <div className="flex flex-col gap-[9px]">
            {touren.map((tour) => (
              <details key={`${tour.jahr}-${tour.quartal}`} className="info" open={tour.laufend}>
                <summary>
                  {tour.name} · Q{tour.quartal} {tour.jahr}
                  {tour.laufend && " · läuft"}
                </summary>
                <div className="px-[15px] pb-4">
                  <p className="ziffern text-[13px] text-muted">
                    {tour.gigs.length} {tour.gigs.length === 1 ? "Gig" : "Gigs"} · {tour.minuten} Min
                    {tour.siebenGigs > 0 && ` · ${tour.siebenGigs} auf sieben Saiten`}
                    {tour.aufnaeher > 0 && ` · ${tour.aufnaeher} Aufnäher`}
                  </p>
                  {/* Der Rückendruck: die Tourdaten, wie auf einem echten Shirt. */}
                  <p className="ziffern mt-2 text-[12px] leading-relaxed text-dim">
                    {tour.gigs.map((tag) => datum(tag).replace(/\.\d{4}$/, "")).join(" · ")}
                  </p>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>

      <div className="spalte">
        <h2 className="rule mb-1 mt-9">Die Kutte</h2>
        <p className="mb-3 text-[12.5px] text-dim">
          {verdient.length} Aufnäher verdient. Je Reihe steht der nächste als
          Umriss da.
        </p>
        {REIHEN.map((reihe) => {
          const hier = [
            ...verdient.filter((a) => a.reihe === reihe.id),
            ...naechste.filter((a) => a.reihe === reihe.id),
          ]
          if (hier.length === 0) return null
          return (
            <div key={reihe.id}>
              <p className="kicker mb-2 mt-5 text-dim">{reihe.titel}</p>
              <div className="grid grid-cols-2 gap-[9px]">
                {hier.map((a) => (
                  <AufnaeherKachel key={a.id} a={a} />
                ))}
              </div>
            </div>
          )
        })}

        <Link href="/" className="btn btn-ghost btn-small mt-9 w-full py-3">
          <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
        </Link>
      </div>
    </div>
  )
}
