"use client"

import { useEffect, useState } from "react"
import { NotenMitTab } from "@/components/session/noten-view"
import { SongBedienung } from "@/components/session/song-bedienung"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { AMPS, PEDALE, type Amp, type Pedal } from "@/lib/session/board-daten"
import { STANDARD_WAHL, gewaehlterAmp, kette, pedaleGeordnet, umschalten, type BoardWahl, type Besitz } from "@/lib/session/board"
import { TUERCHEN } from "@/lib/session/advent-daten"
import { besitz as berechneBesitz, questStand, type QuestStand } from "@/lib/session/quests"
import { boardWahl, merkeBoardWahl } from "@/lib/storage/lokal"
import { loadLog } from "@/lib/storage/practice-log"
import { loadTheoryLog } from "@/lib/storage/theory-log"

const PROBE = TUERCHEN.find((t) => t.art === "riff")!

/** Ein kurzes Riff zum Hören, mit dem Board, wie es gerade steht. */
function Probe({ wahlStempel }: { wahlStempel: string }) {
  const engine = useAudioEngine()
  const [bpm, setBpm] = useState(60)
  if (PROBE.art !== "riff") return null
  return (
    <div className="mt-3 space-y-3">
      <NotenMitTab song={PROBE.riff.song} mitNamen />
      {/* Der Schlüssel baut den Player neu, sobald sich das Board ändert — er liest es beim Anlegen. */}
      <SongBedienung key={wahlStempel} song={PROBE.riff.song} bpm={bpm} onBpm={setBpm} engine={engine} />
    </div>
  )
}

function Zeile({ an, onClick, kopf, wirkung, bleibt }: { an: boolean; onClick?: () => void; kopf: string; wirkung: string; bleibt?: boolean }) {
  return (
    <li>
      <button
        type="button"
        role={bleibt ? "radio" : "switch"}
        aria-checked={an}
        onClick={onClick}
        className={`flex w-full items-center gap-3 border px-3 py-2.5 text-left ${an ? "border-akzent bg-panel" : "border-line bg-sunken"}`}
      >
        <span className={`h-3 w-3 flex-none border ${an ? "border-akzent bg-akzent" : "border-line"}`} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className={`block text-[14px] leading-tight ${an ? "text-fg" : "text-muted"}`}>{kopf}</span>
          <span className="mt-0.5 block text-[12.5px] leading-snug text-dim">{wirkung}</span>
        </span>
      </button>
    </li>
  )
}

/**
 * Das Board auf dem Merch-Stand: Quests mit ihrem Lohn, die Pedale in
 * Signalrichtung zum An- und Ausschalten und der Amp. Der Besitz fällt aus
 * dem Log; gemerkt wird nur die Wahl, auf diesem Gerät.
 */
export function BoardAnsicht() {
  const [stand, setStand] = useState<{ besitz: Besitz; quests: QuestStand[] } | null>(null)
  const [wahl, setWahl] = useState<BoardWahl>(STANDARD_WAHL)

  useEffect(() => {
    const log = loadLog()
    const theorie = loadTheoryLog()
    setStand({ besitz: berechneBesitz(log, theorie), quests: questStand(log, theorie) })
    setWahl(boardWahl())
  }, [])

  if (!stand) return null
  const { besitz, quests } = stand
  const geordnet = pedaleGeordnet(besitz)
  const ampSteht = gewaehlterAmp(besitz, wahl)
  const stempel = `${wahl.aus.join(",")}|${ampSteht.id}|${besitz.pedale.size}`
  // Alles, was man hat, vor und hinter dem Amp — an oder aus.
  const alle = kette(besitz, STANDARD_WAHL)
  const aendern = (neu: BoardWahl) => {
    setWahl(neu)
    merkeBoardWahl(neu)
  }
  const name = (art: "pedal" | "amp", id: string): string =>
    ((art === "pedal" ? PEDALE : AMPS) as Array<Pedal | Amp>).find((x) => x.id === id)?.name ?? id

  return (
    <>
      <h2 className="tape">Board</h2>
      <section className="card">
        <p className="text-[14px] leading-relaxed text-muted">
          Pedale und Amp färben die Wiedergabe von Songs und Riffen — nicht das Metronom. Die Reihenfolge ist die der
          Kette: Verzerrer vor dem Amp, Hall und Echo dahinter. {geordnet.length} von {PEDALE.length} Pedalen und{" "}
          {besitz.amps.size} von {AMPS.length} Amps sind dein.
        </p>

        <h3 className="rule mt-5">Vor dem Amp</h3>
        <ul className="mt-3 space-y-[6px]">
          {alle.vor.map((p) => (
              <Zeile key={p.id} an={!wahl.aus.includes(p.id)} onClick={() => aendern(umschalten(wahl, p.id))} kopf={`${p.name} · ${p.typ}`} wirkung={p.wirkung} />
            ))}
        </ul>

        <h3 className="rule mt-5">Amp</h3>
        <ul className="mt-3 space-y-[6px]" role="radiogroup" aria-label="Amp">
          {AMPS.filter((a) => besitz.amps.has(a.id)).map((a) => (
            <Zeile key={a.id} bleibt an={ampSteht.id === a.id} onClick={() => aendern({ ...wahl, amp: a.id })} kopf={`${a.name} · ${a.typ}`} wirkung={a.wirkung} />
          ))}
        </ul>

        <h3 className="rule mt-5">Dahinter</h3>
        <ul className="mt-3 space-y-[6px]">
          {alle.nach.map((p) => (
              <Zeile key={p.id} an={!wahl.aus.includes(p.id)} onClick={() => aendern(umschalten(wahl, p.id))} kopf={`${p.name} · ${p.typ}`} wirkung={p.wirkung} />
            ))}
          {alle.nach.length === 0 && <li className="text-[13px] text-dim">Noch nichts hinter dem Amp.</li>}
        </ul>

        <h3 className="rule mt-5">Zum Hören</h3>
        <Probe wahlStempel={stempel} />
      </section>

      <h2 className="tape schief">Quests</h2>
      <section className="card">
        <p className="mb-3 text-[13px] text-dim">Kein Gold, nichts zu kaufen: Ein Stück fürs Board gibt es, wenn das Ziel geschafft ist.</p>
        <ul className="space-y-3">
          {quests.map(({ quest, stand: n, ziel, erfuellt }) => (
            <li key={quest.id} className={erfuellt ? "" : "opacity-90"}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="display text-[17px] leading-none text-fg">{quest.name}</span>
                <span className={`font-mono text-[11px] uppercase tracking-[0.12em] ${quest.stufe === "legendär" ? "text-akzent" : "text-stahl"}`}>{quest.stufe}</span>
              </div>
              <p className="mt-1 text-[13px] leading-snug text-muted">{quest.text}</p>
              <div className="bar mt-2 h-[4px]">
                <i style={{ width: `${Math.round((n / ziel) * 100)}%` }} />
              </div>
              <p className="mt-1 font-mono text-[11.5px] uppercase tracking-[0.12em] text-dim">
                {erfuellt ? "Geschafft" : `${n} von ${ziel}`} · Lohn: {name(quest.lohn.art, quest.lohn.id)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
