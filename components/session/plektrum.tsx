"use client"

import { useId } from "react"
import type { Aussehen, Stufe } from "@/lib/session/gurt"

/**
 * Ein Plektrum als SVG. Die Farben stehen am Plektrum, nicht im Design: wie die
 * Farbe eines Pixelbilds sind sie Daten (Drop, Drill-ID), kein Teil der Oberfläche.
 *
 * Die Rahmenfarbe dagegen folgt dem Thema: ab episch Bernstein, sonst dunkel.
 * Patina und Staub sind stille Zeichen — beide fallen aus dem Log (`lib/session/gurt.ts`).
 */

const PFAD: Record<Aussehen["form"], string> = {
  std: "M12 1C20 1 23 5 23 9C23 15 16 22 12 27C8 22 1 15 1 9C1 5 4 1 12 1Z",
  jazz: "M12 2C17 2 19 5 19 8C19 13 15 20 12 26C9 20 5 13 5 8C5 5 7 2 12 2Z",
  tri: "M12 2C14 2 22 15 22 19C22 23 19 24 12 24C5 24 2 23 2 19C2 15 10 2 12 2Z",
}

/** Verläufe der glänzenden Materialien; die Farbe des Plektrums mischt sich bei Gold ein. */
const VERLAUF: Partial<Record<NonNullable<Aussehen["material"]>, (farbe: string) => string[]>> = {
  metall: () => ["#eef2f5", "#8d969d", "#dfe4e8"],
  perl: () => ["#f6f3ff", "#cfe7ef", "#f2dbe8"],
  gold: (farbe) => ["#f7d774", farbe, farbe],
  horn: () => ["#3b2e24", "#7a6450", "#2f241c"],
}

export interface PlektrumProps {
  aussehen: Aussehen
  stufe: Stufe
  /** `false`: nur der gestrichelte Umriss, noch nicht verdient. */
  an: boolean
  /** 0 neu, 1 abgegriffen, 2 durchgenudelt. */
  patina?: 0 | 1 | 2
  staubig?: boolean
  groesse?: number
}

export function Plektrum({ aussehen, stufe, an, patina = 0, staubig = false, groesse = 40 }: PlektrumProps) {
  const id = `pk-${useId().replace(/:/g, "")}`
  const { farbe, form, material } = aussehen
  const hoch = stufe === "e"
  const verlauf = material ? VERLAUF[material] : undefined
  const muster = material === "holz" || material === "stein" || material === "filz"

  return (
    <svg
      viewBox="0 0 24 28"
      width={groesse}
      height={(groesse * 28) / 24}
      aria-hidden="true"
      className={an ? undefined : "text-dim"}
      style={staubig ? { opacity: 0.5, filter: "grayscale(0.7)" } : undefined}
    >
      {an && material && (
        <defs>
          {verlauf ? (
            <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
              {verlauf(farbe).map((c, i, alle) => (
                <stop key={i} offset={i / (alle.length - 1)} stopColor={c} />
              ))}
            </linearGradient>
          ) : (
            <pattern id={id} patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill={farbe} />
              {material === "holz" ? (
                <path d="M0 1H4M0 3.2H4" stroke="#6e4824" strokeWidth=".6" />
              ) : (
                <circle
                  cx={material === "stein" ? 1 : 2}
                  cy={material === "stein" ? 3 : 2}
                  r={material === "stein" ? 0.7 : 0.5}
                  fill={material === "stein" ? "#555b60" : "#a84a57"}
                />
              )}
            </pattern>
          )}
        </defs>
      )}
      <path
        d={PFAD[form]}
        fill={an ? (material && (verlauf || muster) ? `url(#${id})` : farbe) : "none"}
        stroke={an ? undefined : "currentColor"}
        strokeWidth={an ? (hoch ? 1.6 : 0.8) : 1}
        strokeDasharray={an ? undefined : "2 2"}
        style={an ? { stroke: hoch ? "var(--akzent)" : "rgba(0,0,0,.35)" } : undefined}
      />
      {an && material === "gold" && (
        <text x="12" y="14" textAnchor="middle" fontSize="7" fill="#fff3c4">
          ★
        </text>
      )}
      {an && patina >= 1 && (
        <path d="M8 8L10.5 12M14 7L15.5 10" stroke="rgba(255,255,255,.4)" strokeWidth=".6" fill="none" />
      )}
      {an && patina >= 2 && (
        <>
          <path d="M9 14L12 19M15 13L13 17M7 11L8 14" stroke="rgba(255,255,255,.4)" strokeWidth=".6" fill="none" />
          <circle cx="12" cy={form === "tri" ? 20 : 23} r="1.6" fill="rgba(0,0,0,.35)" />
        </>
      )}
    </svg>
  )
}
