"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useScrollTopOn } from "@/hooks/use-scroll-top"
import { LEERES_REPERTOIRE, fortschritt, type Repertoire, type RepertoireSong } from "@/lib/session/repertoire"
import { repertoire } from "@/lib/storage/lokal"
import { SongFormular } from "./repertoire-formulare"
import { RepertoireSongAnsicht } from "./repertoire-song"

const PFAD = "/drills/repertoire"
const songPfad = (id: string) => `${PFAD}?song=${encodeURIComponent(id)}`

function Hinweis() {
  return (
    <p className="mt-3 border border-line bg-sunken px-3 py-2.5 text-[13.5px] leading-relaxed text-muted">
      <span className="text-stahl">Nur auf diesem Gerät, nicht in der Sicherung.</span> Wer die Browserdaten löscht,
      verliert das Repertoire.
    </p>
  )
}

function Eintrag({ song }: { song: RepertoireSong }) {
  const stand = fortschritt(song)
  return (
    <Link
      href={songPfad(song.id)}
      className="block border border-line bg-panel px-[15px] py-[13px] transition-colors hover:border-akzent"
    >
      <h2 className="display break-words text-[30px] text-fg">{song.titel}</h2>
      <p className="kicker mt-0.5 break-words text-dim">{song.band}</p>
      <p className="mt-2 font-mono text-[13px] text-muted">
        {stand.gesamt === 0 ? "Noch keine Abschnitte" : `${stand.sitzt} von ${stand.gesamt} sitzen`}
      </p>
      <div className="bar mt-[6px] h-[6px]">
        <i style={{ width: `${Math.round(stand.anteil * 100)}%` }} />
      </div>
    </Link>
  )
}

/** The list of songs, one song, or the form for a new one. */
export function RepertoireAnsicht() {
  const router = useRouter()
  const songId = useSearchParams().get("song")
  // `null` until the storage was read: a static export has none while building.
  const [bestand, setBestand] = useState<Repertoire | null>(null)
  const [anlegen, setAnlegen] = useState(false)
  const neuLesen = () => setBestand(repertoire())

  useEffect(() => {
    setBestand(repertoire())
  }, [])
  useScrollTopOn(`${songId}-${anlegen}`)

  const { songs } = bestand ?? LEERES_REPERTOIRE
  const song = songs.find((s) => s.id === songId)

  if (anlegen) {
    return (
      <div className="huelle">
        <SongFormular
          onGespeichert={(id) => {
            neuLesen()
            setAnlegen(false)
            router.push(songPfad(id))
          }}
          onAbbrechen={() => setAnlegen(false)}
        />
        <Hinweis />
      </div>
    )
  }

  if (song) {
    return (
      <div className="huelle">
        <RepertoireSongAnsicht
          // A different song starts without the open form of the one before.
          key={song.id}
          song={song}
          onGeaendert={neuLesen}
          onGeloescht={() => {
            neuLesen()
            router.replace(PFAD)
          }}
        />
        <Hinweis />
      </div>
    )
  }

  return (
    <div className="huelle-breit">
      <header className="mt-6">
        <span className="kicker">Deine Songs</span>
        <h1 className="display mt-1 text-[40px] text-fg">Repertoire</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Echte Songs, die du mit deiner Guitar-Pro-Datei lernst. Hier steht nur, wie weit du bist: keine Noten, keine
          Tabs.
        </p>
      </header>
      <Hinweis />
      {bestand !== null && (
        <>
          {songId !== null && <p className="mt-4 text-[14px] text-muted">Diesen Song gibt es hier nicht.</p>}
          <div className="mt-5 grid gap-[9px] wide:grid-cols-2">
            {songs.map((s) => (
              <Eintrag key={s.id} song={s} />
            ))}
          </div>
          <button type="button" onClick={() => setAnlegen(true)} className="btn mt-5 w-full">
            Song anlegen
          </button>
        </>
      )}
      <Link href="/drills" className="btn btn-ghost btn-small mt-6 w-full py-3">
        Zurück zu den Drills
      </Link>
    </div>
  )
}
