"use client"

import { useEffect, useState } from "react"
import { MdClose } from "react-icons/md"
import { MAX_GITARREN, gitarreDazu, gitarreWeg, type Gitarre } from "@/lib/session/gitarren"
import { gitarren, merkeGitarren, vergissGitarren } from "@/lib/storage/lokal"

/**
 * Das Rack für die Gitarrenroulette, auf *Daten*.
 *
 * Jede Runde (Technik und Riff) würfelt eine dieser Gitarren. Unter zwei
 * Gitarren gibt es nichts zu würfeln — dann bleibt die Karte weg. Die Liste
 * gehört dem Gerät und nur ihm.
 */
export function GitarrenPanel() {
  const [liste, setListe] = useState<Gitarre[]>([])
  const [name, setName] = useState("")
  const [sieben, setSieben] = useState(false)

  // Erst nach dem ersten Anstrich: beim statischen Export gibt es beim Bauen
  // keinen Speicher.
  useEffect(() => {
    setListe(gitarren())
  }, [])

  const setze = (neu: Gitarre[]) => {
    setListe(neu)
    merkeGitarren(neu)
  }

  const dazu = () => {
    const neu = gitarreDazu(liste, name, sieben)
    if (neu === liste) return
    setze(neu)
    setName("")
    setSieben(false)
  }

  const zuruecksetzen = () => {
    vergissGitarren()
    setListe(gitarren())
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Gitarren</h2>
      <p className="text-[14px] leading-relaxed text-muted">
        Zu jeder Technik wird eine davon gewürfelt, das Riff dazu spielst du auf derselben. Ab zwei
        Gitarren. Im Sieben-Saiter-Modus kommen nur Siebensaitige in Frage. Gilt nur für diesen
        Browser.
      </p>

      <ul className="mt-3 space-y-[9px]">
        {liste.map((gitarre) => (
          <li
            key={gitarre.name}
            className="flex items-center justify-between gap-3 border border-line bg-panel px-3 py-2.5"
          >
            <span className="min-w-0 text-[14.5px] text-fg">
              {gitarre.name}
              {gitarre.sieben && <span className="kicker ml-2 text-stahl">7 Saiten</span>}
            </span>
            <button
              onClick={() => setze(gitarreWeg(liste, gitarre.name))}
              aria-label={`${gitarre.name} entfernen`}
              className="flex-none p-1 text-dim hover:text-fg"
            >
              <MdClose className="h-[18px] w-[18px]" />
            </button>
          </li>
        ))}
        {liste.length === 0 && (
          <li className="text-[13.5px] text-dim">Keine Gitarre — die Roulette ist aus.</li>
        )}
      </ul>

      {liste.length < MAX_GITARREN && (
        <form
          className="mt-3 space-y-2"
          onSubmit={(e) => {
            e.preventDefault()
            dazu()
          }}
        >
          <label className="block">
            <span className="kicker text-dim">Neue Gitarre</span>
            <input
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Les Paul"
              className="mt-1 w-full border border-line bg-sunken px-3 py-2.5 text-[16px] text-fg outline-hidden focus:border-akzent"
            />
          </label>
          <label className="flex items-center gap-2 text-[14px] text-muted">
            <input type="checkbox" checked={sieben} onChange={(e) => setSieben(e.target.checked)} />
            Siebensaitig
          </label>
          <div className="grid grid-cols-2 gap-[9px]">
            <button type="submit" disabled={name.trim() === ""} className="btn btn-small disabled:opacity-40">
              Hinzufügen
            </button>
            <button type="button" onClick={zuruecksetzen} className="btn btn-ghost btn-small">
              Standardliste
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
