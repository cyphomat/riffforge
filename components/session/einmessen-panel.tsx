"use client"

import { useEffect, useState } from "react"
import { MdHeadphones, MdSpeaker } from "react-icons/md"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { einmessen } from "@/lib/audio/einmess-lauf"
import type { Einmessart } from "@/lib/audio/einmessen"
import { einmessung as ladeEinmessung, merkeEinmessung, vergissEinmessung, type Einmessung } from "@/lib/storage/lokal"

const ART_TEXT: Record<Einmessart, string> = {
  lautsprecher: "über den Lautsprecher",
  anschlag: "per Anschlag",
}

/**
 * Die Latenz dieses Geräts einmal messen.
 *
 * Steht auf *Daten* und nicht im Block: es ist eine Einstellung des Geräts,
 * kein Teil des Übens, und eine Messung mitten in der Viertelstunde wäre
 * genau die Unterbrechung, die die Session vermeiden soll. Warum und wie,
 * steht in `lib/audio/einmessen.ts`.
 */
export function EinmessenPanel() {
  const engine = useAudioEngine()
  const [stand, setStand] = useState<Einmessung | null>(null)
  const [laeuft, setLaeuft] = useState<{ art: Einmessart; klick: number; gesamt: number } | null>(null)
  const [meldung, setMeldung] = useState<{ ton: "ok" | "err"; text: string } | null>(null)

  useEffect(() => {
    setStand(ladeEinmessung())
  }, [])

  const starte = async (art: Einmessart) => {
    setMeldung(null)
    setLaeuft({ art, klick: 0, gesamt: 0 })
    const ergebnis = await einmessen(engine, art, (klick, gesamt) => setLaeuft({ art, klick, gesamt }))
    setLaeuft(null)
    if (!ergebnis.ok) {
      setMeldung({ ton: "err", text: ergebnis.grund })
      return
    }
    const neu: Einmessung = {
      ms: ergebnis.ms,
      art,
      streuungMs: ergebnis.streuungMs,
      at: new Date().toISOString(),
    }
    merkeEinmessung(neu)
    setStand(neu)
    setMeldung({
      ton: "ok",
      text: `${ergebnis.ms} ms, ${ergebnis.gehoert} von ${ergebnis.gezaehlt} Klicks gehört, ±${ergebnis.streuungMs} ms.`,
    })
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Mikrofon einmessen</h2>
      <p className="mb-3 text-[13px] leading-relaxed text-dim">
        Zwischen Klick und gehörtem Anschlag liegt die Laufzeit deiner Kette — Lautsprecher,
        Luft, Mikrofon. Einmal gemessen, rechnet die App sie heraus und kann dir sagen, ob du
        wirklich vor oder hinter dem Klick liegst. Ohne das geht es bei schnellen Achteln nicht
        sicher. Gilt nur für dieses Gerät.
      </p>

      <p className="mb-3 font-mono text-[12px] text-muted">
        {stand
          ? `Eingemessen ${ART_TEXT[stand.art]}: ${stand.ms} ms · ${new Date(stand.at).toLocaleDateString("de-DE")}`
          : "Noch nicht eingemessen."}
      </p>

      {laeuft ? (
        <p className="border-l-2 border-akzent py-2 pl-3 font-mono text-[12.5px] text-akzent" aria-live="polite">
          {laeuft.art === "lautsprecher" ? "Hör zu" : "Schlag auf jeden Klick an"} ·{" "}
          {laeuft.klick}/{laeuft.gesamt || "…"}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-[9px] sm:grid-cols-2">
          <button onClick={() => void starte("lautsprecher")} className="btn btn-ghost w-full">
            <MdSpeaker className="h-[18px] w-[18px]" /> Über Lautsprecher
          </button>
          <button onClick={() => void starte("anschlag")} className="btn btn-ghost w-full">
            <MdHeadphones className="h-[18px] w-[18px]" /> Mit Kopfhörern
          </button>
        </div>
      )}

      <details className="info mt-3">
        <summary>Wie das geht</summary>
        <div className="space-y-2 px-[15px] pb-[15px] text-[13.5px] leading-relaxed text-muted">
          <p>
            <b className="text-fg">Über Lautsprecher:</b> Ton laut, Gerät hinlegen, Raum still. Das
            Mikrofon hört sechzehn Klicks und misst, wie lange jeder unterwegs war. Dauert zwanzig
            Sekunden; du tust nichts.
          </p>
          <p>
            <b className="text-fg">Mit Kopfhörern:</b> Das Mikrofon hört den Klick dann nicht. Schlag
            stattdessen eine gedämpfte Saite auf jeden Klick an. Darin steckt dann auch deine eigene
            Gewohnheit, etwas früh oder spät zu sein — die App misst danach gegen sie, nicht gegen den
            Klick.
          </p>
          <p>
            <b className="text-fg">Welcher Weg:</b> Kabelkopfhörer hängen am selben Ausgang wie der
            Lautsprecher — dafür gilt die Messung über den Lautsprecher. Bluetooth-Kopfhörer legen
            150 bis 300 ms drauf; mit denen per Anschlag einmessen.
          </p>
          <p>Neue Kopfhörer, anderes Interface: neu einmessen. Merkt die App eine grosse Abweichung, sagt sie es nach dem Block.</p>
        </div>
      </details>

      {meldung && (
        <p
          className={`mt-3 border-l-2 py-2 pl-3 font-mono text-[12.5px] ${
            meldung.ton === "ok" ? "border-gruen text-gruen" : "border-rost text-rost"
          }`}
        >
          {meldung.text}
        </p>
      )}

      {stand && !laeuft && (
        <button
          onClick={() => {
            vergissEinmessung()
            setStand(null)
            setMeldung(null)
          }}
          className="mt-2 font-mono text-[12px] text-dim underline-offset-4 hover:text-stahl hover:underline"
        >
          Einmessung vergessen
        </button>
      )}
    </section>
  )
}
