"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MdArrowBack } from "react-icons/md"
import { datum } from "@/components/session/merch-stand"
import { AlbumCover } from "@/components/session/album-cover"
import { alben, coverPixel, type Album, type Track } from "@/lib/session/album"
import { loadLog } from "@/lib/storage/practice-log"
import { loadTheoryLog } from "@/lib/storage/theory-log"

const mehrzahl = (n: number, eins: string, viele: string) => `${n} ${n === 1 ? eins : viele}`

function TrackZeile({ t }: { t: Track }) {
  return (
    <li className="flex gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
      <span className="ziffern w-6 flex-none pt-[3px] text-[13px] text-dim">{`${t.nr}`.padStart(2, "0")}</span>
      <div className="min-w-0">
        <p className="display text-[20px] leading-tight text-fg [overflow-wrap:anywhere]">{t.titel}</p>
        <p className="mt-1 text-[13px] text-muted">
          KW {t.kw} · {mehrzahl(t.tage, "Tag", "Tage")} · {mehrzahl(t.bloecke, "Block", "Blöcke")}
        </p>
        {t.songs.length > 0 && <p className="mt-1 text-[13px] text-muted">feat. {t.songs.join(", ")}</p>}
        {t.bestwerte.map((b) => (
          <p key={b.drill} className="mt-1 text-[13px] text-muted">
            Neuer Bestwert: {b.drill}, {b.bpm} BPM sauber
          </p>
        ))}
        {t.gegner && <p className="mt-1 text-[13px] text-akzent">Bonus: {t.gegner} gefällt</p>}
      </div>
    </li>
  )
}

function Platte({ album }: { album: Album }) {
  const zahlen: Array<[string, number]> = [
    ["Wochen", album.tracks.length],
    ["Übungstage", album.tage],
    ["Saubere Blöcke", album.sauber],
    // Wie an der Kutte: was nie fiel, wird nicht als Null ausgestellt.
    ...(album.gegner > 0 ? ([["Gegner gefällt", album.gegner]] as Array<[string, number]>) : []),
  ]
  return (
    <section aria-label={album.titel} className="mt-6">
      <div className="card plain">
        <span className="kicker text-dim">
          {album.erschienen ? "Erschienen" : `Noch im Studio bis ${datum(album.bis)}`}
        </span>
        <AlbumCover pixel={coverPixel(album)} />
        <h2 className="display mt-4 text-[30px] leading-none text-fg">{album.titel}</h2>
        <p className="mt-2 text-[14px] text-muted">
          {album.format} · {mehrzahl(album.tracks.length, "Track", "Tracks")}
          {album.naechstes &&
            ` · noch ${mehrzahl(album.naechstes.fehlt, "Übungswoche", "Übungswochen")} bis zur ${album.naechstes.name}`}
        </p>
      </div>

      <h2 className="tape">Trackliste</h2>
      <ol className="card">
        {album.tracks.map((t) => (
          <TrackZeile key={t.woche} t={t} />
        ))}
      </ol>

      <h2 className="tape">Rückseite</h2>
      <dl className="card plain grid grid-cols-[repeat(2,minmax(0,1fr))] gap-4">
        {zahlen.map(([name, wert]) => (
          <div key={name} className="flex flex-col-reverse">
            <dt className="text-[13px] text-muted">{name}</dt>
            <dd className="display text-[30px] leading-none text-fg">{wert}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/**
 * Das Jahresalbum. Beim Öffnen aus den beiden Logs gerechnet, nichts davon
 * wird gespeichert (`lib/session/album.ts`). Ältere Jahre stehen darunter.
 */
export function AlbumAnsicht() {
  const [liste, setListe] = useState<Album[] | null>(null)

  useEffect(() => {
    setListe(alben(loadLog(), loadTheoryLog()))
  }, [])

  if (!liste) return null

  return (
    <div className="huelle">
      <header className="mt-6">
        <span className="kicker">Merch</span>
        <h1 className="display mt-1 text-[30px] text-fg sm:text-[40px]">Jahresalbum</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Jede Woche mit Gitarre ist ein Track. Pausen kommen nicht aufs Vinyl.
        </p>
      </header>

      {liste.length === 0 ? (
        <p className="mt-6 text-[14px] text-dim">Noch nichts eingespielt. Die erste Session ist Track eins.</p>
      ) : (
        liste.map((album) => <Platte key={album.jahr} album={album} />)
      )}

      <Link href="/merch" className="btn btn-ghost btn-small mt-9 w-full py-3">
        <MdArrowBack className="h-[16px] w-[16px]" /> Zum Merch-Stand
      </Link>
    </div>
  )
}
