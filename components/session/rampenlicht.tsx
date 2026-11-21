"use client"

import { useEffect, useRef } from "react"
import { asset } from "@/lib/base-path"

export interface Hangt {
  id: string
  name: string
  /** Pfad der Gitarre, 24 × 56. */
  bild: string
  /** „seit 12.3.2026", oder null, wenn kein Tag bekannt ist. */
  seit: string | null
}

/**
 * Rampenlicht: eine Gitarre aus dem Rack, groß unter einem Scheinwerfer.
 *
 * Reine Anzeige, nichts wird gespeichert, und es bewegt sich nichts — Riffforge
 * animiert keinen Schmuck, also gibt es hier auch bei normaler Bewegung nur das
 * stehende Bild. Pfeiltasten blättern, Esc oder ein Tipp daneben schließt.
 * Der Fokus geht beim Öffnen auf „Schließen" und beim Schließen zurück.
 */
export function Rampenlicht({
  liste,
  index,
  onIndex,
  onZu,
}: {
  liste: Hangt[]
  index: number
  onIndex: (i: number) => void
  onZu: () => void
}) {
  const zu = useRef<HTMLButtonElement>(null)
  const g = liste[index]

  useEffect(() => {
    const davor = document.activeElement as HTMLElement | null
    zu.current?.focus()
    return () => davor?.focus?.()
  }, [])

  useEffect(() => {
    const taste = (e: KeyboardEvent) => {
      if (e.key === "Escape") onZu()
      if (e.key === "ArrowLeft" && index > 0) onIndex(index - 1)
      if (e.key === "ArrowRight" && index < liste.length - 1) onIndex(index + 1)
    }
    window.addEventListener("keydown", taste)
    return () => window.removeEventListener("keydown", taste)
  }, [index, liste.length, onIndex, onZu])

  if (!g) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rampenlicht: ${g.name}`}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-4"
      style={{ background: "color-mix(in srgb, var(--bg) 96%, transparent)" }}
      onClick={onZu}
    >
      <div
        className="flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "radial-gradient(ellipse 60% 70% at 50% 35%, color-mix(in srgb, var(--akzent) 26%, transparent), transparent 70%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
        <img src={asset(g.bild)} alt={g.name} width={144} height={336} className="pixel my-6 block" />
        <p className="display text-[30px] leading-none text-fg">{g.name}</p>
        {g.seit && <p className="mt-2 font-mono text-[13px] uppercase tracking-[0.08em] text-dim">seit {g.seit}</p>}
      </div>
      <div className="mt-6 flex gap-[9px]" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="btn btn-ghost btn-small" disabled={index === 0} onClick={() => onIndex(index - 1)} aria-label="Vorherige Gitarre">
          ‹
        </button>
        <button ref={zu} type="button" className="btn btn-small" onClick={onZu}>
          Schließen
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-small"
          disabled={index >= liste.length - 1}
          onClick={() => onIndex(index + 1)}
          aria-label="Nächste Gitarre"
        >
          ›
        </button>
      </div>
    </div>
  )
}
