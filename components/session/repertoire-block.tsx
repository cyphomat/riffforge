"use client"

import { ABSCHNITT_STATUS, type AbschnittStatus } from "@/lib/session/repertoire"
import { MAX_BPM, MIN_BPM, type RepertoireStelle } from "@/lib/session/repertoire-session"
import { SoundNotizen, STATUS_AKTIV, takteText } from "./repertoire-teile"

const HINWEIS: Record<AbschnittStatus, string> = {
  neu: "Noch am Zusammensuchen",
  langsam: "Geht im Übetempo",
  sitzt: "Steht, nur noch warm halten",
}

/**
 * What to play: the section, where it is in the file, the tuning and the sound.
 * No notes and no tab — the player reads from their own Guitar Pro file.
 */
export function RepertoireNotizen({ stelle }: { stelle: RepertoireStelle }) {
  const zeilen = [
    ["Takte", takteText(stelle.von, stelle.bis)],
    ["Spur", stelle.spur],
    ["Stimmung", stelle.stimmung.join(" ")],
    ["Datei", stelle.quelle],
  ]
  const begrenzt = stelle.uebetempo < MIN_BPM || stelle.uebetempo > MAX_BPM
  return (
    // On the phone this follows the metronome card directly and needs its own gap.
    <div className="pt-5 wide:pt-0">
      <h3 className="rule mb-3">Nach deiner Datei</h3>
      <dl className="space-y-2">
        {zeilen.map(([name, wert]) => (
          <div key={name} className="flex gap-3">
            <dt className="kicker w-20 flex-none text-dim">{name}</dt>
            <dd className="min-w-0 break-words text-[14.5px] text-fg">{wert}</dd>
          </div>
        ))}
      </dl>
      {begrenzt && (
        <p className="mt-3 text-[13px] leading-relaxed text-rost">
          Eingetragen sind {stelle.uebetempo} BPM. Das Metronom geht von {MIN_BPM} bis {MAX_BPM}.
        </p>
      )}
      <SoundNotizen sound={stelle.sound} />
    </div>
  )
}

/** One tap sets the status and ends the block. */
export function RepertoireStand({
  bisher,
  onWahl,
}: {
  bisher: AbschnittStatus
  onWahl: (status: AbschnittStatus) => void
}) {
  return (
    <div>
      <h3 className="rule mb-3">Wo steht der Abschnitt?</h3>
      <div className="grid gap-[13px] p-[2px] sm:grid-cols-3">
        {ABSCHNITT_STATUS.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => onWahl(status)}
            className={`min-h-[64px] cursor-pointer p-[14px] text-left ${
              status === bisher ? STATUS_AKTIV[status] : "bg-panel shadow-(--pix-line)"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className={`display text-[20px] capitalize ${status === bisher ? "" : "text-fg"}`}>{status}</span>
              {status === bisher && <span className="kicker">bisher</span>}
            </span>
            <span className="mt-1 block text-[13px] text-muted">{HINWEIS[status]}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[13px] leading-relaxed text-dim">
        Ein Tipp speichert und geht weiter. Das Übetempo änderst du im Repertoire.
      </p>
    </div>
  )
}
