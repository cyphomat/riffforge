"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { NotenMitTab } from "@/components/session/noten-view"
import { Plektrum } from "@/components/session/plektrum"
import { SongBedienung } from "@/components/session/song-bedienung"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { asset } from "@/lib/base-path"
import { adventJahr, adventStand, type AdventStand } from "@/lib/session/advent"
import { TUERCHEN, TUERCHEN_ANZAHL, type AdventRiff, type Tuerchen } from "@/lib/session/advent-daten"
import { isoLokal } from "@/lib/session/anlaesse"
import { aufnaeherBild } from "@/lib/session/merch"
import { loadLog } from "@/lib/storage/practice-log"

/** Ein Mini-Riff: Noten und Tabulatur, Anhören mit Klick. Der AudioContext entsteht erst aus dem Tippen. */
function RiffTuerchen({ riff }: { riff: AdventRiff }) {
  const engine = useAudioEngine()
  const [bpm, setBpm] = useState(riff.startBpm)
  const [klingend, setKlingend] = useState<number[]>([])
  return (
    <div className="mt-3 space-y-3">
      <p className="text-[13.5px] leading-snug text-muted">{riff.hinweis}</p>
      <NotenMitTab song={riff.song} mitNamen klingend={klingend} />
      <SongBedienung key={riff.id} song={riff.song} bpm={bpm} onBpm={setBpm} engine={engine} onKlingend={setKlingend} riffId={riff.id} />
      <p className="font-mono text-[11.5px] uppercase tracking-[0.12em] text-dim">
        Start {riff.startBpm} BPM · Ziel {riff.targetBpm} BPM
      </p>
    </div>
  )
}

function Inhalt({ t }: { t: Tuerchen }) {
  switch (t.art) {
    case "tipp":
      return (
        <div className="mt-3">
          <p className="display text-[22px] leading-none text-fg">{t.tipp.titel}</p>
          <p className="mt-2 text-[14px] leading-snug text-fg">{t.tipp.text}</p>
          <p className="mt-3 text-[13.5px] leading-snug text-muted">{t.tipp.warum}</p>
        </div>
      )
    case "plektrum":
      return (
        <div className="mt-3 flex items-center gap-4">
          <Plektrum aussehen={{ farbe: t.plektrum.farbe, form: t.plektrum.form, material: t.plektrum.material }} stufe="g" an groesse={72} />
          <div>
            <p className="display text-[22px] leading-none text-fg">{t.plektrum.name}</p>
            <p className="mt-2 text-[13.5px] leading-snug text-muted">{t.plektrum.text}</p>
          </div>
        </div>
      )
    case "riff":
      return (
        <div className="mt-3">
          <p className="display text-[22px] leading-none text-fg">{t.riff.titel}</p>
          <RiffTuerchen key={t.riff.id} riff={t.riff} />
        </div>
      )
    case "aufnaeher":
      return (
        <div className="mt-3 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
          <img src={asset(aufnaeherBild("advent"))} alt="" width={72} height={72} className="pixel flex-none" />
          <div>
            <p className="display text-[22px] leading-none text-fg">{t.titel}</p>
            <p className="mt-2 text-[13.5px] leading-snug text-muted">{t.text}</p>
            <Link href="/merch" className="btn btn-ghost btn-small mt-3">
              Zur Kutte ›
            </Link>
          </div>
        </div>
      )
  }
}

const ART: Record<Tuerchen["art"], string> = { tipp: "Tipp", plektrum: "Plektrum", riff: "Riff", aufnaeher: "Aufnäher" }

/**
 * Die 24 Türchen. Offen ist, wer so viele Übungstage im Dezember hat, wie die
 * Nummer sagt (`lib/session/advent.ts`); nichts wird gespeichert. Außerhalb des
 * Dezembers steht der letzte Advent, wie er ausging.
 */
export function AdventAnsicht() {
  const [stand, setStand] = useState<AdventStand | null>(null)
  const [imDezember, setImDezember] = useState(false)
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)

  useEffect(() => {
    const heute = isoLokal()
    const aktuell = adventJahr(heute)
    const jahr = aktuell ?? Number(heute.slice(0, 4)) - 1
    const s = adventStand(loadLog(), jahr)
    setImDezember(aktuell !== null)
    setStand(s)
    setGewaehlt(s.letztes?.nr ?? null)
  }, [])

  if (!stand) return null
  const t = gewaehlt === null ? null : TUERCHEN.find((x) => x.nr === gewaehlt && x.nr <= stand.offen)

  return (
    <div className="px-4 pb-10 pt-6">
      <h1 className="display text-[34px] leading-none text-fg">Advent</h1>
      <p className="mt-3 text-[14px] leading-snug text-muted">
        {imDezember
          ? `${stand.offen} von ${TUERCHEN_ANZAHL} Türchen offen. Ein Übungstag im Dezember öffnet das nächste; was du verpasst, holst du nach.`
          : stand.offen > 0
            ? `So ging der Advent ${stand.jahr} aus: ${stand.offen} von ${TUERCHEN_ANZAHL} Türchen. Der nächste beginnt am 1. Dezember.`
            : "Der Advent beginnt am 1. Dezember. Dann öffnet jeder Übungstag ein Türchen."}
      </p>

      <ol className="mt-5 grid grid-cols-6 gap-[6px]" aria-label="Türchen">
        {TUERCHEN.map((x) => {
          const offen = x.nr <= stand.offen
          return (
            <li key={x.nr}>
              <button
                type="button"
                disabled={!offen}
                aria-pressed={gewaehlt === x.nr}
                aria-label={offen ? `Türchen ${x.nr}: ${ART[x.art]}` : `Türchen ${x.nr}, noch zu`}
                onClick={() => setGewaehlt(x.nr)}
                className={`flex h-12 w-full items-center justify-center border font-mono text-[15px] ${
                  gewaehlt === x.nr
                    ? "border-akzent bg-panel text-akzent"
                    : offen
                      ? "border-line bg-panel text-fg"
                      : "border-dashed border-line bg-sunken text-dim opacity-60"
                }`}
              >
                {x.nr}
              </button>
            </li>
          )
        })}
      </ol>

      {t && (
        <section className="card mt-5" aria-label={`Türchen ${t.nr}`}>
          <span className="kicker text-dim">
            Türchen {t.nr} · {ART[t.art]}
          </span>
          <Inhalt t={t} />
        </section>
      )}

      <Link href="/" className="btn btn-ghost mt-6 w-full">
        Zurück zu Heute
      </Link>
    </div>
  )
}
