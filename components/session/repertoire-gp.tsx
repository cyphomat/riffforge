"use client"

import { useRef, useState } from "react"
import { MdFileUpload } from "react-icons/md"
import { MAX_GP_BYTES, gpLesen, type GpSong } from "@/lib/session/repertoire-gp"
import { Meldungen } from "./repertoire-meldungen"

/**
 * Picks a Guitar Pro file and hands on what it says. The file is read in the
 * browser and goes nowhere.
 */
export function GpDatei({ onGelesen }: { onGelesen: (song: GpSong, dateiname: string) => void }) {
  const [fehler, setFehler] = useState<string[]>([])
  const [gelesen, setGelesen] = useState("")
  const eingabe = useRef<HTMLInputElement>(null)

  const lesen = async (datei: File | undefined) => {
    // The same file may be picked again.
    if (eingabe.current) eingabe.current.value = ""
    if (!datei) return
    setFehler([])
    setGelesen("")
    const nein = (grund: string) => setFehler([`${grund} Nichts wurde geändert.`])
    if (datei.size > MAX_GP_BYTES) return nein("Die Datei ist viel zu groß für eine Guitar-Pro-Datei.")
    let bytes: Uint8Array
    try {
      bytes = new Uint8Array(await datei.arrayBuffer())
    } catch {
      return nein("Die Datei lässt sich nicht öffnen.")
    }
    const ergebnis = gpLesen(bytes)
    if (!ergebnis.ok) return nein(ergebnis.grund)
    setGelesen(datei.name)
    onGelesen(ergebnis.song, datei.name)
  }

  return (
    <div>
      {/* No `accept`: iOS greys out file types it does not know. The content decides. */}
      <input ref={eingabe} type="file" onChange={(event) => void lesen(event.target.files?.[0])} className="hidden" />
      <button type="button" onClick={() => eingabe.current?.click()} className="btn btn-ghost w-full">
        <MdFileUpload className="h-[18px] w-[18px]" /> Aus Guitar-Pro-Datei ausfüllen
      </button>
      <Meldungen fehler={fehler} />
      {gelesen && (
        <p role="status" className="mt-3 break-words border-l-2 border-gruen py-2 pl-3 text-[13.5px] leading-relaxed text-muted">
          Aus {gelesen} ausgefüllt. Prüfe die Angaben, gespeichert ist noch nichts.
        </p>
      )}
    </div>
  )
}
