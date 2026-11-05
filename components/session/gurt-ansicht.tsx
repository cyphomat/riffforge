"use client"

import { useState } from "react"
import { asset } from "@/lib/base-path"
import { FREISCHALTUNG, type DropStand, type DropPlektrum } from "@/lib/session/drops"
import { GEUEBT_TAGE, STUFEN_NAMEN, type RiffSlot } from "@/lib/session/gurt"
import { Plektrum } from "@/components/session/plektrum"

/** `2026-06-15` → `15.6.` — kurz genug für eine Detailzeile. */
const kurz = (tag: string) => {
  const [, monat, t] = tag.split("-").map(Number)
  return `${t}.${monat}.`
}

type Auswahl = { art: "riff"; id: string } | { art: "drop"; id: string } | null

/**
 * Der Gurt auf dem Merch-Stand: erst die Riff-Plektren, dann je Drop eine Bühne
 * mit seinen Plektren. Verdiente leuchten, offene stehen als Umriss da.
 * Die Rechnung steht in `lib/session/gurt.ts` und `drops.ts`.
 */
export function GurtAnsicht({ riffs, drops }: { riffs: RiffSlot[]; drops: DropStand[] }) {
  const [wahl, setWahl] = useState<Auswahl>(null)
  const verdient = riffs.filter((r) => r.verdient).length
  const slot = wahl?.art === "riff" ? riffs.find((r) => r.drillId === wahl.id) : undefined

  return (
    <>
      <h2 className="tape">Gurt</h2>
      <section className="card">
        <p className="mb-3 text-[12.5px] text-dim">
          Ein Plektrum für jedes Riff, das an {GEUEBT_TAGE} verschiedenen Tagen mindestens „Sauber“ war.{" "}
          <span className="ziffern text-muted">
            {verdient} von {riffs.length}
          </span>
        </p>
        <div role="group" aria-label="Riff-Plektren" className="grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">
          {riffs.map((r) => (
            <button
              key={r.drillId}
              type="button"
              onClick={() => setWahl({ art: "riff", id: r.drillId })}
              aria-pressed={wahl?.art === "riff" && wahl.id === r.drillId}
              aria-label={r.verdient ? `${r.titel}, Plektrum` : `Leerer Platz, ${r.titel}`}
              title={r.verdient ? r.titel : "noch nicht verdient"}
              className="flex justify-center border border-line bg-sunken p-2 aria-pressed:border-akzent"
            >
              <Plektrum aussehen={r.aussehen} stufe="g" an={r.verdient} patina={r.patina} staubig={r.staubig} />
            </button>
          ))}
        </div>
        <p className="mt-3 min-h-[3em] text-[13.5px] leading-snug text-muted" aria-live="polite">
          {slot ? (
            slot.verdient ? (
              <>
                <span className="text-fg">{slot.titel}</span> · seit {kurz(slot.seit!)} · an {slot.spieltage}{" "}
                {slot.spieltage === 1 ? "Tag" : "Tagen"} gespielt
                {slot.besterBpm !== null && ` · sauber bis ${slot.besterBpm} BPM`}
                {slot.staubig && ". Staubig: spiel es wieder, dann glänzt es."}
              </>
            ) : (
              <>
                {slot.titel}: noch {GEUEBT_TAGE - slot.guteTage} {GEUEBT_TAGE - slot.guteTage === 1 ? "Tag" : "Tage"}{" "}
                mit „Sauber“ oder besser.
              </>
            )
          ) : (
            "Tipp auf ein Plektrum für Details."
          )}
        </p>
      </section>

      {drops.map((stand) => (
        <DropAbschnitt key={stand.drop.id} stand={stand} />
      ))}
    </>
  )
}

function DropAbschnitt({ stand }: { stand: DropStand }) {
  const { drop, tage, eintraege, zugabe, verdient, gesamt } = stand
  const [offen, setOffen] = useState<string | null>(null)
  const alle: Array<{ plektrum: DropPlektrum; verdient: boolean }> = [
    ...eintraege,
    ...(zugabe ? [{ plektrum: zugabe, verdient: true }] : []),
  ]
  const gewaehlt = alle.find((e) => e.plektrum.id === offen)

  return (
    <>
      <h2 className="tape">Drop · {drop.titel}</h2>
      <section className="card">
        {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
        <img
          src={asset(`/bilder/drop-${drop.id}.png`)}
          alt={`Bühne: ${drop.titel}`}
          width={288}
          height={144}
          className="pixel block h-auto w-[288px] max-w-full border border-line sm:w-[384px]"
        />
        <p className="kicker mt-3 text-dim">{drop.thema}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-muted">{drop.text}</p>
        <p className="ziffern mt-2 text-[12.5px] text-dim">
          {verdient} von {gesamt}
          {zugabe && " + Zugabe"} · {tage} {tage === 1 ? "Übungstag" : "Übungstage"} in diesem Monat
        </p>
        <div role="group" aria-label="Plektren des Drops" className="mt-3 grid grid-cols-[repeat(auto-fill,minmax(52px,1fr))] gap-2">
          {alle.map(({ plektrum: p, verdient: an }) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setOffen(p.id)}
              aria-pressed={offen === p.id}
              aria-label={an ? `${p.name}, ${STUFEN_NAMEN[p.stufe]}` : `Leerer Platz, ${STUFEN_NAMEN[p.stufe]}`}
              title={an ? `${p.name} · ${STUFEN_NAMEN[p.stufe]}` : `ab ${FREISCHALTUNG[p.stufe]} Übungstagen`}
              className="flex justify-center border border-line bg-sunken p-2 aria-pressed:border-akzent"
            >
              <Plektrum aussehen={p} stufe={p.stufe} an={an} />
            </button>
          ))}
        </div>
        <div className="mt-3 min-h-[3em] text-[13.5px] leading-snug text-muted" aria-live="polite">
          {gewaehlt ? (
            gewaehlt.verdient ? (
              <>
                <p>
                  <span className="text-fg">{gewaehlt.plektrum.name}</span> · {STUFEN_NAMEN[gewaehlt.plektrum.stufe]}
                </p>
                <p className="mt-1">{gewaehlt.plektrum.text}</p>
                {gewaehlt.plektrum.fakt && (
                  <p className="mt-1 text-dim">
                    {gewaehlt.plektrum.fakt}{" "}
                    <a
                      href={gewaehlt.plektrum.quelle}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2"
                    >
                      Quelle
                    </a>
                  </p>
                )}
              </>
            ) : (
              `Noch nicht freigeschaltet: ${STUFEN_NAMEN[gewaehlt.plektrum.stufe]} ab ${FREISCHALTUNG[gewaehlt.plektrum.stufe]} Übungstagen im Monat.`
            )
          ) : (
            "Tipp auf ein Plektrum für Details."
          )}
        </div>
      </section>
    </>
  )
}
