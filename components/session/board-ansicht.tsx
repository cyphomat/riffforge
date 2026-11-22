"use client"

import { useEffect, useState } from "react"
import { NotenMitTab } from "@/components/session/noten-view"
import { SongBedienung } from "@/components/session/song-bedienung"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { BAND, dabei, bandUmschalten, stufeAb } from "@/lib/session/band"
import { RAENGE } from "@/lib/session/merch"
import { AMPS, PEDALE, type Amp, type Pedal } from "@/lib/session/board-daten"
import { STANDARD_WAHL, gewaehlterAmp, kette, pedaleGeordnet, umschalten, type BoardWahl, type Besitz } from "@/lib/session/board"
import { TUERCHEN } from "@/lib/session/advent-daten"
import { balkenFelder, besitz as berechneBesitz, questGeordnet, questStand, type QuestStand } from "@/lib/session/quests"
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
      <SongBedienung key={wahlStempel} song={PROBE.riff.song} bpm={bpm} onBpm={setBpm} engine={engine} riffId={PROBE.riff.id} />
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
          <span className="mt-0.5 block text-[13px] leading-snug text-dim">{wirkung}</span>
        </span>
      </button>
    </li>
  )
}

const BALKEN_FELDER = 10

/**
 * Eine Quest: links der Name, rechts die Zahl, auf die es ankommt. Darunter der
 * Balken in zehn Feldern, dann der Lohn in normaler Schrift. Die Kante links
 * trägt die Stufe: Bernstein für legendär, Stahlblau für episch — ohne Wort, das
 * Wort steht nur für Screenreader da.
 */
function QuestZeile({ q, lohn }: { q: QuestStand; lohn: string }) {
  const { quest, stand: n, ziel, erfuellt } = q
  const legendaer = quest.stufe === "legendär"
  const leuchtend = balkenFelder(n, ziel, BALKEN_FELDER)
  return (
    <li className={`border-l-[3px] pl-3 ${legendaer ? "border-akzent" : "border-stahl"}`}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="display text-[20px] leading-none text-fg">
          {quest.name}
          <span className="sr-only"> ({quest.stufe})</span>
        </span>
        {erfuellt ? (
          <span className="display flex-none text-[20px] leading-none text-gruen">✓ Geschafft</span>
        ) : (
          <span className="display num flex-none text-[20px] leading-none text-akzent">
            {n}/{ziel}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[14px] leading-snug text-muted">{quest.text}</p>
      <div
        className="mt-2 grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${BALKEN_FELDER}, minmax(0, 1fr))` }}
        role="progressbar"
        aria-label={quest.name}
        aria-valuemin={0}
        aria-valuemax={ziel}
        aria-valuenow={n}
      >
        {Array.from({ length: BALKEN_FELDER }, (_, i) => (
          <span key={i} className={`h-[8px] ${i < leuchtend ? (erfuellt ? "bg-gruen" : "bg-akzent") : "bg-line"}`} />
        ))}
      </div>
      <p className="mt-2 text-[14px] text-muted">
        <span className="kicker mr-2">Lohn</span>
        <span className="text-fg">{lohn}</span>
      </p>
    </li>
  )
}

/**
 * Das Board auf dem Merch-Stand: Quests mit ihrem Lohn, die Pedale in
 * Signalrichtung zum An- und Ausschalten und der Amp. Der Besitz fällt aus
 * dem Log; gemerkt wird nur die Wahl, auf diesem Gerät.
 */
export function BoardAnsicht() {
  const [stand, setStand] = useState<{ besitz: Besitz; quests: QuestStand[]; band: string[] } | null>(null)
  const [wahl, setWahl] = useState<BoardWahl>(STANDARD_WAHL)

  useEffect(() => {
    const log = loadLog()
    const theorie = loadTheoryLog()
    setStand({ besitz: berechneBesitz(log, theorie), quests: questStand(log, theorie), band: dabei(log) })
    setWahl(boardWahl())
  }, [])

  if (!stand) return null
  const { besitz, quests, band } = stand
  const { offen, geschafft } = questGeordnet(quests)
  const geordnet = pedaleGeordnet(besitz)
  const ampSteht = gewaehlterAmp(besitz, wahl)
  const stempel = `${wahl.aus.join(",")}|${ampSteht.id}|${besitz.pedale.size}|${wahl.bandAus.join(",")}`
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

        <h3 className="rule mt-5">Band</h3>
        <p className="mt-3 text-[13px] leading-snug text-dim">
          Spielt nur in der Wiedergabe mit, nie im Block — dort misst das Mikro.
        </p>
        <ul className="mt-3 space-y-[6px]">
          {BAND.map((b) => {
            const da = band.includes(b.id)
            return da ? (
              <Zeile key={b.id} an={!wahl.bandAus.includes(b.id)} onClick={() => aendern(bandUmschalten(wahl, b.id))} kopf={b.name} wirkung={b.wirkung} />
            ) : (
              <li key={b.id} className="border border-dashed border-line px-3 py-2.5 text-[13px] text-dim opacity-60">
                {b.name} · kommt ab Rang {RAENGE[stufeAb(b.id)].titel}
              </li>
            )
          })}
        </ul>

        <h3 className="rule mt-5">Zum Hören</h3>
        <Probe wahlStempel={stempel} />
      </section>

      <h2 className="tape schief">Quests</h2>
      <section className="card">
        <p className="text-[14px] leading-relaxed text-muted">Kein Gold, nichts zu kaufen: Ein Stück fürs Board gibt es, wenn das Ziel geschafft ist.</p>
        {offen.length > 0 && (
          <>
            <h3 className="rule mt-5">Offen · {offen.length}</h3>
            <ul className="mt-4 space-y-5">
              {offen.map((q) => (
                <QuestZeile key={q.quest.id} q={q} lohn={name(q.quest.lohn.art, q.quest.lohn.id)} />
              ))}
            </ul>
          </>
        )}
        {geschafft.length > 0 && (
          <>
            <h3 className="rule mt-6">Geschafft · {geschafft.length}</h3>
            <ul className="mt-4 space-y-5">
              {geschafft.map((q) => (
                <QuestZeile key={q.quest.id} q={q} lohn={name(q.quest.lohn.art, q.quest.lohn.id)} />
              ))}
            </ul>
          </>
        )}
      </section>
    </>
  )
}
