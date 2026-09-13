"use client"

import type { MicStatus } from "@/lib/audio/onset-detector"
import { MdMic, MdMicOff } from "react-icons/md"

export interface MicPanelProps {
  status: MicStatus
  detail: string | null
  level: number
  hits: number
  onToggle: () => void
}

const LABELS: Record<MicStatus, string> = {
  idle: "aus",
  starting: "startet…",
  listening: "hört zu",
  denied: "Zugriff abgelehnt",
  unsupported: "nicht unterstützt",
  error: "Fehler",
}

export function MicPanel({ status, detail, level, hits, onToggle }: MicPanelProps) {
  const listening = status === "listening"
  const blocked = status === "denied" || status === "unsupported" || status === "error"

  return (
    <div className="border border-line bg-panel px-[15px] py-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onToggle}
          disabled={status === "starting" || status === "unsupported"}
          aria-pressed={listening}
          className={`btn btn-small px-3 py-2 ${listening ? "" : "btn-ghost"}`}
        >
          {listening ? <MdMic className="h-4 w-4" /> : <MdMicOff className="h-4 w-4" />}
          {listening ? "Mikrofon an" : "Timing messen"}
        </button>

        {listening && (
          <>
            <div className="bar h-[6px] w-28">
              <i style={{ width: `${Math.min(100, Math.round(level * 320))}%` }} />
            </div>
            <span className="ziffern text-[13px] text-muted">
              {hits} {hits === 1 ? "Anschlag" : "Anschläge"}
            </span>
          </>
        )}

        {!listening && !blocked && (
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-dim">
            {LABELS[status]}
          </span>
        )}
        {blocked && (
          <span className="font-mono text-[11.5px] text-rost">{detail ?? LABELS[status]}</span>
        )}
      </div>

      {/* Ohne Mikrofon misst die App nichts — das ist keine Fehlermeldung,
          sondern eine fehlende Bedingung. Deshalb Rost, nicht Rot. */}
      {blocked && <div className="warnstreifen mt-3" aria-hidden />}

      {listening && (
        <p className="mt-2 text-[12px] leading-relaxed text-dim">
          Kopfhörer benutzen — über Lautsprecher hört das Mikrofon das Metronom mit und zählt es
          als Anschlag.
        </p>
      )}
    </div>
  )
}
