"use client"

import { useState } from "react"
import Link from "next/link"
import { useScrollTopOn } from "@/hooks/use-scroll-top"
import {
  ABSCHNITT_STATUS,
  fortschritt,
  uebetempoBpm,
  type Abschnitt,
  type AbschnittStatus,
  type RepertoireSong,
} from "@/lib/session/repertoire"
import { TECHNIQUE_LABELS } from "@/lib/session/types"
import { merkeAbschnittStatus, vergissSong } from "@/lib/storage/lokal"
import { AbschnittFormular, Loeschen, Meldungen, NICHT_GESPEICHERT, SongFormular } from "./repertoire-formulare"

/** Green is "in place", amber is the one being worked on. */
const STATUS_AKTIV: Record<AbschnittStatus, string> = {
  neu: "bg-(--tint-stahl) text-stahl shadow-(--pix-stahl)",
  langsam: "bg-(--tint-akzent) text-akzent shadow-(--pix-akzent)",
  sitzt: "bg-(--tint-gruen) text-gruen shadow-(--pix-gruen)",
}

function AbschnittKarte({
  song,
  abschnitt,
  onStatus,
  onBearbeiten,
}: {
  song: RepertoireSong
  abschnitt: Abschnitt
  onStatus: (status: AbschnittStatus) => void
  onBearbeiten: () => void
}) {
  const takte = abschnitt.von === abschnitt.bis ? `Takt ${abschnitt.von}` : `Takt ${abschnitt.von}–${abschnitt.bis}`
  return (
    <li className="border border-line bg-panel px-[15px] py-[13px]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="display break-words text-[30px] text-fg">{abschnitt.name}</h3>
          <p className="kicker mt-0.5 break-words text-dim">
            {takte} · {abschnitt.spur}
          </p>
        </div>
        <button
          type="button"
          onClick={onBearbeiten}
          aria-label={`${abschnitt.name} bearbeiten`}
          className="-mr-2 -mt-1 flex-none p-2 font-mono text-[13px] uppercase tracking-[0.08em] text-stahl"
        >
          Ändern
        </button>
      </div>

      <p className="mt-2 flex items-baseline gap-2">
        <span className="display text-[40px] text-akzent">{uebetempoBpm(song.tempoHeader, abschnitt.uebetempoProzent)}</span>
        <span className="font-mono text-[13px] text-muted">BPM · {abschnitt.uebetempoProzent} %</span>
      </p>
      {abschnitt.technikTags.length > 0 && (
        <p className="mt-1 text-[13.5px] text-muted">
          {abschnitt.technikTags.map((tag) => TECHNIQUE_LABELS[tag]).join(" · ")}
        </p>
      )}

      <div role="group" aria-label={`Lernstand ${abschnitt.name}`} className="mt-3 grid grid-cols-3 gap-2 p-[2px]">
        {ABSCHNITT_STATUS.map((status) => {
          const aktiv = abschnitt.status === status
          return (
            <button
              key={status}
              type="button"
              aria-pressed={aktiv}
              onClick={() => onStatus(status)}
              className={`min-h-12 cursor-pointer font-mono text-[13px] uppercase tracking-[0.08em] ${
                aktiv ? STATUS_AKTIV[status] : "text-dim shadow-(--pix-line)"
              }`}
            >
              {status}
            </button>
          )
        })}
      </div>
    </li>
  )
}

function SoundNotizen({ song }: { song: RepertoireSong }) {
  const sound = song.sound
  if (!sound) return null
  const zahl = (wert: number) => String(wert).replace(".", ",")
  const eq = [
    ["Bass", sound.eq?.bass],
    ["Mitten", sound.eq?.mitten],
    ["Höhen", sound.eq?.hoehen],
    ["Präsenz", sound.eq?.praesenz],
  ].flatMap(([name, wert]) => (typeof wert === "number" ? [`${name} ${zahl(wert)}`] : []))
  const zeilen = [
    ["Amp", sound.amp],
    ["Kanal", sound.kanal],
    ["Gain", sound.gain && (sound.gain.von === sound.gain.bis ? zahl(sound.gain.von) : `${zahl(sound.gain.von)} bis ${zahl(sound.gain.bis)}`)],
    ["EQ", eq.join(" · ") || undefined],
    ["Boost", sound.boost],
  ].filter((zeile): zeile is [string, string] => Boolean(zeile[1]))

  return (
    <section>
      <h2 className="rule mb-3 mt-9">Sound</h2>
      <dl className="space-y-2">
        {zeilen.map(([name, wert]) => (
          <div key={name} className="flex gap-3">
            <dt className="kicker w-16 flex-none text-dim">{name}</dt>
            <dd className="min-w-0 break-words text-[14.5px] text-fg">{wert}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

type Modus = { art: "ansicht" } | { art: "song" } | { art: "abschnitt"; abschnitt?: Abschnitt }

export function RepertoireSongAnsicht({
  song,
  onGeaendert,
  onGeloescht,
}: {
  song: RepertoireSong
  onGeaendert: () => void
  onGeloescht: () => void
}) {
  const [modus, setModus] = useState<Modus>({ art: "ansicht" })
  const [fehler, setFehler] = useState<string[]>([])
  useScrollTopOn(modus.art)

  const zurueck = () => setModus({ art: "ansicht" })
  const gespeichert = () => {
    onGeaendert()
    zurueck()
  }

  if (modus.art === "song") {
    return <SongFormular song={song} onGespeichert={gespeichert} onAbbrechen={zurueck} />
  }
  if (modus.art === "abschnitt") {
    return (
      <AbschnittFormular song={song} abschnitt={modus.abschnitt} onGespeichert={gespeichert} onAbbrechen={zurueck} />
    )
  }

  const status = (abschnitt: Abschnitt, neu: AbschnittStatus) => {
    // Tapping the current status is not a change, so it is not a failure either.
    if (abschnitt.status === neu) return
    setFehler(merkeAbschnittStatus(song.id, abschnitt.id, neu) ? [] : [NICHT_GESPEICHERT])
    onGeaendert()
  }
  const stand = fortschritt(song)

  return (
    <div>
      <Link href="/drills/repertoire" className="kicker mt-5 inline-block py-2 text-stahl">
        ← Repertoire
      </Link>
      <header>
        <span className="kicker">{song.band}</span>
        <h1 className="display mt-1 break-words text-[40px] text-fg">{song.titel}</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted">
          {song.tempoHeader} BPM · {song.stimmung.join(" ")} · {song.takte} Takte · {song.taktarten.join(", ")}
        </p>
        <p className="break-all font-mono text-[13px] text-dim">{song.quelle}</p>
      </header>

      <h2 className="rule mb-3 mt-7">Abschnitte</h2>
      {stand.gesamt > 0 && (
        <>
          <p className="font-mono text-[13px] text-muted">
            {stand.sitzt} von {stand.gesamt} sitzen
          </p>
          <div className="bar mb-4 mt-[6px] h-[6px]">
            <i style={{ width: `${Math.round(stand.anteil * 100)}%` }} />
          </div>
        </>
      )}
      <Meldungen fehler={fehler} />
      <ul className="space-y-[13px]">
        {song.abschnitte.map((abschnitt) => (
          <AbschnittKarte
            key={abschnitt.id}
            song={song}
            abschnitt={abschnitt}
            onStatus={(neu) => status(abschnitt, neu)}
            onBearbeiten={() => setModus({ art: "abschnitt", abschnitt })}
          />
        ))}
      </ul>
      <button type="button" onClick={() => setModus({ art: "abschnitt" })} className="btn mt-4 w-full">
        Abschnitt anlegen
      </button>

      <SoundNotizen song={song} />

      <h2 className="rule mb-3 mt-9">Song</h2>
      <button type="button" onClick={() => setModus({ art: "song" })} className="btn btn-ghost mb-4 w-full">
        Song und Sound bearbeiten
      </button>
      <Loeschen
        knopf="Song löschen"
        frage={`„${song.titel}“ mit allen Abschnitten und dem Lernstand löschen? Das lässt sich nicht zurückholen.`}
        onLoeschen={() => {
          const ok = vergissSong(song.id)
          if (ok) onGeloescht()
          return ok
        }}
      />
    </div>
  )
}
