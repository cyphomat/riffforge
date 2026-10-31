"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { letztesTempo } from "@/lib/session/letztes-tempo"
import { loadLog } from "@/lib/storage/practice-log"
import {
  DELAY_BPM,
  EFFEKTE,
  KATEGORIEN,
  ORTE,
  delayMs,
  kette,
  reihenfolge,
  type Effekt,
  type Kategorie,
} from "@/lib/theory/effekte"

type Filter = Kategorie | "alle"

const KATEGORIE_LABEL = Object.fromEntries(KATEGORIEN.map((k) => [k.value, k.label])) as Record<Kategorie, string>
const ORT_LABEL = Object.fromEntries(ORTE.map((o) => [o.value, o.label])) as Record<string, string>

/** Die Kette ist fest; die Nummer eines Eintrags ist seine Stelle darin. */
const STATIONEN = kette()
const NUMMER = new Map(reihenfolge().map((e, i) => [e.id, i + 1]))

function Zeile({ titel, text, ton }: { titel: string; text: string; ton?: string }) {
  return (
    <div>
      <dt className={`font-mono text-[11.5px] uppercase tracking-[0.12em] ${ton ?? "text-muted"}`}>{titel}</dt>
      <dd className="mt-[2px] text-[14.5px] leading-relaxed text-fg">{text}</dd>
    </div>
  )
}

/**
 * Delay-Zeiten zu einem Tempo. Das Feld beginnt beim Tempo des zuletzt
 * gespielten Blocks, sonst bei 120. Gelesen wird der Log, geschrieben wird
 * nichts: es ist ein Rechenschieber.
 */
function DelayRechner() {
  const [eingabe, setEingabe] = useState(String(DELAY_BPM.standard))
  const [ausLog, setAusLog] = useState(false)
  // Ein Tempo, das jemand selbst getippt hat, überschreibt der Log nie.
  const getippt = useRef(false)

  useEffect(() => {
    const tempo = letztesTempo(loadLog(), DELAY_BPM)
    if (tempo === null || getippt.current) return
    setEingabe(String(tempo))
    setAusLog(true)
  }, [])

  const bpm = Number(eingabe)
  const gueltig = eingabe.trim() !== "" && bpm >= DELAY_BPM.min && bpm <= DELAY_BPM.max
  const zeiten = gueltig ? delayMs(bpm) : null
  const ms = (wert: number | undefined) => (wert === undefined ? "—" : `${Math.round(wert)} ms`)

  return (
    <div className="mt-4 border border-line bg-sunken p-3">
      <label htmlFor="delay-bpm" className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-muted">
        Delay-Zeit zum Tempo
      </label>
      <div className="mt-2 flex items-center gap-2">
        <input
          id="delay-bpm"
          type="number"
          inputMode="numeric"
          min={DELAY_BPM.min}
          max={DELAY_BPM.max}
          value={eingabe}
          onChange={(event) => {
            getippt.current = true
            setAusLog(false)
            setEingabe(event.target.value)
          }}
          aria-invalid={!gueltig}
          className="w-20 border border-line bg-bg px-2 py-[6px] font-mono text-[16px] text-fg"
        />
        <span className="font-mono text-[12px] text-dim">BPM</span>
      </div>
      {ausLog && <p className="mt-2 text-[13px] text-dim">Tempo deines letzten Blocks.</p>}
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        {(
          [
            ["Viertel", zeiten?.viertel],
            ["Achtel", zeiten?.achtel],
            ["Punktierte Achtel", zeiten?.punktierteAchtel],
          ] as const
        ).map(([titel, wert]) => (
          <div key={titel}>
            <dt className="font-mono text-[11px] uppercase leading-tight tracking-[0.08em] text-muted">{titel}</dt>
            <dd className="mt-1 font-mono text-[15px] text-akzent">{ms(wert)}</dd>
          </div>
        ))}
      </dl>
      {!gueltig && (
        <p className="mt-2 text-[13px] text-rost" role="status">
          Tempo zwischen {DELAY_BPM.min} und {DELAY_BPM.max} BPM.
        </p>
      )}
    </div>
  )
}

function Eintrag({ effekt }: { effekt: Effekt }) {
  return (
    <article id={effekt.id} className="card scroll-mt-24">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="display text-[26px] text-fg">{effekt.name}</h3>
        <span className="shrink-0 font-mono text-[12px] text-akzent" title="Stelle in der Kette">
          {NUMMER.get(effekt.id)}
        </span>
      </div>
      <p className="kicker mt-1">
        {KATEGORIE_LABEL[effekt.kategorie]} · {ORT_LABEL[effekt.ort]}
      </p>
      <dl className="mt-3 space-y-3">
        <Zeile titel="Was es tut" text={effekt.wofuer} />
        <Zeile titel="Im Metal" text={effekt.metal} />
        <Zeile titel="Zum Ausprobieren" text={effekt.einstellung} />
        <Zeile titel="Fallstrick" text={effekt.fallstrick} ton="text-rost" />
        {effekt.ausnahme && <Zeile titel="Ausnahme" text={effekt.ausnahme} ton="text-stahl" />}
      </dl>
      {effekt.id === "fx-delay" && <DelayRechner />}
      {effekt.beispiele && (
        <p className="mt-3 font-mono text-[12px] text-dim">z. B. {effekt.beispiele.join(", ")}</p>
      )}
    </article>
  )
}

export function EffektLexikon() {
  const [filter, setFilter] = useState<Filter>("alle")
  const sichtbar = (e: Effekt) => filter === "alle" || e.kategorie === filter
  const gezeigt = STATIONEN.flatMap((s) => s.eintraege).filter(sichtbar)

  return (
    <div className="huelle-breit">
      <section className="card winkel mt-6">
        <span className="kicker text-akzent">Wissen</span>
        <h1 className="display mt-2 text-[34px] text-fg sm:text-[38px]">Pedale und Effekte</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Was ein Effekt tut, wo man ihn hört und vor allem: wo er in der Kette steht. Die Reihenfolge ist
          eine Konvention. Wo es sich lohnt, davon abzuweichen, steht es am Eintrag.
        </p>
      </section>

      <section>
        <h2 className="rule mb-3 mt-8">Die Kette</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Von oben nach unten, von der Gitarre bis zur Box. Tipp auf einen Namen springt zum Eintrag.
        </p>
        <ol className="space-y-[9px]">
          {STATIONEN.map((station) => (
            <li key={station.value} className="border border-line bg-panel p-3">
              <p className="kicker text-akzent">{station.label}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-dim">{station.erklaerung}</p>
              <ul className="mt-2 flex flex-wrap items-center gap-[6px]">
                {station.eintraege.map((e, i) => (
                  <li key={e.id} className="flex items-center gap-[6px]">
                    {i > 0 && (
                      <span aria-hidden className="font-mono text-[12px] text-dim">
                        →
                      </span>
                    )}
                    {sichtbar(e) ? (
                      <a
                        href={`#${e.id}`}
                        className="border border-akzent px-[10px] py-[6px] font-mono text-[12px] text-akzent hover:bg-(--tint-akzent)"
                      >
                        {e.name}
                      </a>
                    ) : (
                      <span className="border border-line px-[10px] py-[6px] font-mono text-[12px] text-dim">
                        {e.name}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="rule mb-3 mt-8">Nachschlagen</h2>
        <div className="flex flex-wrap gap-[6px]" role="group" aria-label="Kategorie">
          {([{ value: "alle", label: "Alle" }, ...KATEGORIEN] as { value: Filter; label: string }[]).map((k) => (
            <button
              key={k.value}
              onClick={() => setFilter(k.value)}
              aria-pressed={filter === k.value}
              className={`border px-[10px] py-[6px] font-mono text-[12px] ${
                filter === k.value ? "border-akzent text-akzent" : "border-line text-muted"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p className="mt-2 font-mono text-[12px] text-dim">
          {gezeigt.length} von {EFFEKTE.length}
        </p>

        <div className="mt-4 space-y-4 wide:grid wide:grid-cols-2 wide:items-start wide:gap-x-[26px] wide:space-y-0 wide:gap-y-4">
          {gezeigt.map((effekt) => (
            <Eintrag key={effekt.id} effekt={effekt} />
          ))}
        </div>
      </section>

      <p className="mt-6 text-[13px] leading-relaxed text-dim">
        Alles hier ist selbst geschrieben und gilt als Ausgangspunkt, nicht als Gesetz: am Ende zählt, was gut
        klingt.{" "}
        <Link href="/wissen" className="text-stahl underline-offset-2 hover:underline">
          Zurück zu Wissen
        </Link>
      </p>
    </div>
  )
}
