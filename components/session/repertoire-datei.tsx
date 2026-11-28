"use client"

import { useEffect, useRef, useState } from "react"
import { MdFileDownload, MdFileUpload } from "react-icons/md"
import type { Repertoire } from "@/lib/session/repertoire"
import {
  MAX_DATEI_BYTES,
  dateiInhalt,
  dateiLesen,
  dateiName,
  zusammenfuehren,
  type SongBericht,
  type Zusammenfuehrung,
} from "@/lib/session/repertoire-datei"
import { importiereRepertoire, repertoire } from "@/lib/storage/lokal"
import { NICHT_GESPEICHERT } from "./repertoire-formulare"
import { Meldungen } from "./repertoire-meldungen"

interface Vorschau {
  name: string
  exportiert: string
  datei: Repertoire
  ergebnis: Zusammenfuehrung
}

/**
 * The share sheet is the way out of an installed web app on iPhone and iPad. On
 * a desktop a plain download is what one expects.
 */
function teilbar(datei: File): boolean {
  return window.matchMedia("(pointer: coarse)").matches && Boolean(navigator.canShare?.({ files: [datei] }))
}

function herunterladen(datei: File) {
  const url = URL.createObjectURL(datei)
  const link = document.createElement("a")
  link.href = url
  link.download = datei.name
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function Bericht({ bericht }: { bericht: SongBericht }) {
  return (
    <li className="border-t border-line pt-2.5">
      <p className="break-words text-[15px] text-fg">
        {bericht.titel} <span className="text-dim">· {bericht.band}</span>
        {bericht.neu && <span className="kicker ml-2 text-akzent">neu</span>}
      </p>
      <ul className="mt-1 space-y-0.5 text-[13.5px] leading-relaxed">
        {bericht.aenderungen.map((zeile, i) => (
          <li key={`a${i}`} className="break-words text-muted">
            {zeile}
          </li>
        ))}
        {bericht.hinweise.map((zeile, i) => (
          <li key={`h${i}`} className="break-words text-stahl">
            {zeile}
          </li>
        ))}
      </ul>
    </li>
  )
}

/** Saving the repertoire as a file of its own, and reading such a file back. */
export function RepertoireDatei({ anzahl, onGeaendert }: { anzahl: number; onGeaendert: () => void }) {
  const [vorschau, setVorschau] = useState<Vorschau | null>(null)
  const [fehler, setFehler] = useState<string[]>([])
  const [meldung, setMeldung] = useState("")
  const eingabe = useRef<HTMLInputElement>(null)
  const karte = useRef<HTMLDivElement>(null)
  // The preview opens below the fold on a phone; bring it into view.
  useEffect(() => {
    if (vorschau) karte.current?.scrollIntoView({ block: "nearest" })
  }, [vorschau])

  const neuBeginnen = () => {
    setVorschau(null)
    setFehler([])
    setMeldung("")
  }

  // Everything up to the share sheet runs synchronously: iOS only opens it
  // straight from the tap.
  const sichern = async () => {
    neuBeginnen()
    const jetzt = new Date()
    const name = dateiName(jetzt)
    const datei = new File([dateiInhalt(repertoire(), jetzt)], name, { type: "application/json" })
    if (teilbar(datei)) {
      try {
        await navigator.share({ files: [datei] })
        setMeldung(`${name} weitergegeben.`)
        return
      } catch (grund) {
        // Closing the sheet is a decision, not a failure.
        if (grund instanceof Error && grund.name === "AbortError") return
      }
    }
    herunterladen(datei)
    setMeldung(`${name} heruntergeladen.`)
  }

  const waehlen = async (datei: File | undefined) => {
    // The same file may be picked again after a correction.
    if (eingabe.current) eingabe.current.value = ""
    if (!datei) return
    neuBeginnen()
    if (datei.size > MAX_DATEI_BYTES) {
      setFehler(["Die Datei ist viel zu groß für ein Repertoire. Nichts wurde geändert."])
      return
    }
    let roh: string
    try {
      roh = await datei.text()
    } catch {
      setFehler(["Die Datei lässt sich nicht öffnen. Nichts wurde geändert."])
      return
    }
    const gelesen = dateiLesen(roh)
    if (!gelesen.ok) {
      setFehler([`${gelesen.grund} Nichts wurde geändert.`])
      return
    }
    setVorschau({
      name: datei.name,
      exportiert: gelesen.exportiert,
      datei: gelesen.repertoire,
      ergebnis: zusammenfuehren(repertoire(), gelesen.repertoire),
    })
  }

  const uebernehmen = () => {
    if (!vorschau) return
    if (!importiereRepertoire(vorschau.datei)) {
      setFehler([NICHT_GESPEICHERT])
      return
    }
    neuBeginnen()
    setMeldung("Übernommen.")
    onGeaendert()
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Eigene Datei</h2>
      <p className="mb-3 text-[13.5px] leading-relaxed text-muted">
        Zum Aufbewahren und zum Mitnehmen auf ein anderes Gerät. Einlesen legt dazu und löscht nichts.
      </p>
      <div className="grid gap-[9px] wide:grid-cols-2">
        <button type="button" onClick={() => void sichern()} disabled={anzahl === 0} className="btn btn-ghost w-full">
          <MdFileDownload className="h-[18px] w-[18px]" /> Datei sichern
        </button>
        <button type="button" onClick={() => eingabe.current?.click()} className="btn btn-ghost w-full">
          <MdFileUpload className="h-[18px] w-[18px]" /> Datei einlesen
        </button>
      </div>
      <input
        ref={eingabe}
        type="file"
        accept="application/json,.json"
        onChange={(event) => void waehlen(event.target.files?.[0])}
        className="hidden"
      />

      <Meldungen fehler={fehler} />
      {meldung && (
        <p role="status" className="mt-3 border-l-2 border-gruen py-2 pl-3 font-mono text-[13px] text-gruen">
          {meldung}
        </p>
      )}

      {vorschau && (
        <div ref={karte} className="card mt-3">
          <span className="kicker">Vorschau</span>
          <p className="mt-1 break-all font-mono text-[13px] text-fg">{vorschau.name}</p>
          <p className="mt-1 text-[13.5px] text-dim">
            gesichert am {new Date(vorschau.exportiert).toLocaleDateString("de-DE")}
          </p>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            {vorschau.ergebnis.aendert
              ? "Noch ist nichts geändert. Das passiert beim Übernehmen:"
              : "Nichts Neues dabei. Hier ändert sich nichts."}
          </p>
          {vorschau.ergebnis.songs.length > 0 && (
            <ul className="mt-3 space-y-2.5">
              {vorschau.ergebnis.songs.map((bericht) => (
                <Bericht key={bericht.id} bericht={bericht} />
              ))}
            </ul>
          )}
          <div className="mt-4 flex gap-[9px]">
            {vorschau.ergebnis.aendert && (
              <button type="button" onClick={uebernehmen} className="btn flex-1">
                Übernehmen
              </button>
            )}
            <button type="button" onClick={neuBeginnen} className="btn btn-ghost btn-small flex-1 py-3">
              {vorschau.ergebnis.aendert ? "Abbrechen" : "Schließen"}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
