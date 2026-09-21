"use client"

import { GRUNDTOENE, LAGEN, boxBeschreibung, type LickBox } from "@/lib/session/lead"

/**
 * Grundton und Lage wählen.
 *
 * Zwei Reihen statt zweier Aufklappfelder: die Auswahl ist klein genug, um
 * sie ganz zu zeigen, und dann ist das Antippen ein Griff statt dreier.
 *
 * Unter der Auswahl steht, ab welchem Bund die Box liegt. Das ist die
 * Auskunft, die beim Greifen zählt — „Lage 3" sagt einem nichts, „ab Bund 8"
 * schon. Gerechnet aus `pentatonikLage`, nicht aus einer Tabelle: die Lagen
 * laufen im Kreis, und welche zuunterst liegt, hängt am Grundton.
 */
export interface BoxPickerProps {
  box: LickBox
  onChange: (box: LickBox) => void
}

export function BoxPicker({ box, onChange }: BoxPickerProps) {
  const feld = (aktiv: boolean) =>
    `border px-0 py-[9px] text-center font-mono text-[13px] tabular-nums transition-colors ${
      aktiv ? "border-akzent bg-[--tint-akzent] text-akzent" : "border-line bg-sunken text-muted"
    }`

  return (
    <div>
      <h3 className="rule mb-2">Grundton</h3>
      <div className="grid grid-cols-6 gap-[5px]">
        {GRUNDTOENE.map((ton) => (
          <button
            key={ton}
            onClick={() => onChange({ ...box, grundton: ton })}
            className={feld(ton === box.grundton)}
            aria-pressed={ton === box.grundton}
          >
            {ton}
          </button>
        ))}
      </div>

      <h3 className="rule mb-2 mt-5">Lage</h3>
      <div className="grid grid-cols-5 gap-[5px]">
        {LAGEN.map((lage) => (
          <button
            key={lage}
            onClick={() => onChange({ ...box, lage })}
            className={feld(lage === box.lage)}
            aria-pressed={lage === box.lage}
          >
            {lage}
          </button>
        ))}
      </div>

      <p className="ziffern mt-3 text-[12px] text-dim">{boxBeschreibung(box)}</p>
    </div>
  )
}
