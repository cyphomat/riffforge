"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { MdMic, MdPlayArrow } from "react-icons/md"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { useMetronome } from "@/hooks/use-metronome"
import { useOnsetMic } from "@/hooks/use-onset-mic"
import {
  beatSeconds,
  beatsFor,
  bewerteFigur,
  EINZAEHLER_SCHLAEGE,
  patternMarks,
  toleranceSeconds,
  type FigurBewertung,
  type Rhythmusfigur,
} from "@/lib/theory/rhythm"

/**
 * Eine Rhythmusfrage, die man spielt statt ankreuzt.
 *
 * Die Anschlagserkennung ist ohnehin da und auf 2,7 ms genau — es fehlte nur
 * die Angabe, wann die Anschläge hätten kommen sollen. Damit lässt sich eine
 * Figur *messen* statt abfragen, und das kann kein Karteikartenprogramm.
 *
 * Zuerst zwei Takte Einzähler mit je einem Ton auf den Schlag: daraus kommt
 * die Verzögerung der Signalkette. Erst danach die Figur. Ohne diesen Anker
 * wäre eine falsch gespielte Figur von einer verschobenen richtigen nicht zu
 * unterscheiden.
 */

export interface RhythmQuizProps {
  figur: Rhythmusfigur
  bpm: number
  /** Wie viele Takte die Figur läuft. */
  takte: number
  onFertig: (ergebnis: FigurBewertung) => void
}

type Phase = "bereit" | "einzaehler" | "figur" | "fertig"

const SCHLAEGE_JE_TAKT = 4

export function RhythmQuiz({ figur, bpm, takte, onFertig }: RhythmQuizProps) {
  const engine = useAudioEngine()
  const mic = useOnsetMic(engine)

  const [phase, setPhase] = useState<Phase>("bereit")
  const [schlag, setSchlag] = useState(0)
  const [ergebnis, setErgebnis] = useState<FigurBewertung | null>(null)

  const schlagzeiten = useRef<number[]>([])
  // Ganze Perioden, nicht ganze Takte: eine Dreiergruppe läuft über drei
  // Schläge und ginge in zwei Takten nicht auf. Die Länge kommt deshalb aus
  // der Figur, nicht aus der Taktzahl.
  const figurSchlaege = beatsFor(figur, takte, SCHLAEGE_JE_TAKT)
  const gesamt = EINZAEHLER_SCHLAEGE + figurSchlaege

  const { anschlaege, onsets, disable: disableMic } = mic

  const auswerten = useCallback(() => {
    const zeiten = schlagzeiten.current
    const einzaehler = zeiten.slice(0, EINZAEHLER_SCHLAEGE)
    // Genau so viele Schläge, wie die Figur lang ist. Der Nachlauf bis zur
    // Auswertung bringt sonst einen weiteren Klick mit, und der zählt drei
    // Anschläge als verpasst, die nie verlangt waren.
    const figurBeats = zeiten.slice(EINZAEHLER_SCHLAEGE, EINZAEHLER_SCHLAEGE + figurSchlaege)
    const jeSchlag = beatSeconds(bpm)

    // Die Marken tragen mit, welcher Anschlag gedämpft sein soll; ohne
    // Dämpfung in der Figur ändert das nichts.
    const marken = patternMarks(figurBeats, figur, jeSchlag)
    const bewertung = bewerteFigur({
      onsets: onsets(),
      anschlaege: anschlaege(),
      marken,
      einzaehler,
      erwartet: marken.map((marke) => marke.time),
      toleranz: toleranceSeconds(figur, jeSchlag),
    })
    disableMic()
    setErgebnis(bewertung)
    setPhase("fertig")
    onFertig(bewertung)
  }, [anschlaege, bpm, disableMic, figur, figurSchlaege, onFertig, onsets])

  const auswertenRef = useRef(auswerten)
  auswertenRef.current = auswerten

  const metronome = useMetronome(engine, {
    bpm,
    beatsPerBar: SCHLAEGE_JE_TAKT,
    subdivision: 1,
    onTick: (tick) => {
      schlagzeiten.current.push(tick.time)
      const nummer = schlagzeiten.current.length
      setSchlag(nummer)
      setPhase(nummer > EINZAEHLER_SCHLAEGE ? "figur" : "einzaehler")
      // Der letzte Schlag klingt noch — eine Viertel Nachlauf, damit der Ton
      // darauf noch gehört wird.
      if (nummer >= gesamt) {
        window.setTimeout(() => auswertenRef.current(), (60 / bpm) * 1000 + 250)
      }
    },
  })

  const { stop: stopMetronome } = metronome
  useEffect(() => {
    return () => {
      stopMetronome()
      disableMic()
    }
  }, [disableMic, stopMetronome])

  const starten = async () => {
    schlagzeiten.current = []
    mic.reset()
    setSchlag(0)
    const an = await mic.enable()
    if (!an) return
    setPhase("einzaehler")
    await metronome.start()
  }

  useEffect(() => {
    if (phase === "fertig") stopMetronome()
  }, [phase, stopMetronome])

  const restEinzaehler = Math.max(0, EINZAEHLER_SCHLAEGE - schlag)

  // In Takten, solange die Figur in Takten aufgeht — sonst ehrlich in Schlägen.
  // Eine Dreiergruppe läuft neun oder zwölf Schläge, und „zweieinviertel Takte"
  // hilft niemandem.
  const ganzeTakte = figurSchlaege % SCHLAEGE_JE_TAKT === 0 ? figurSchlaege / SCHLAEGE_JE_TAKT : null
  const laenge =
    ganzeTakte === null
      ? `${figurSchlaege} Schläge`
      : ganzeTakte === 1
        ? "einen Takt"
        : `${ganzeTakte} Takte`

  return (
    <div className="space-y-4">
      <div className="border border-line bg-panel p-[18px]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="kicker text-dim">{figur.name}</span>
          <span className="ziffern text-[13px] text-muted">{bpm} BPM</span>
        </div>

        <p className="mt-3 text-[14.5px] leading-relaxed text-muted">
          {phase === "bereit" &&
            `Zwei Takte Einzähler — auf jeden Schlag einen Ton —, dann ${laenge} die Figur.`}
          {phase === "einzaehler" && `Einzähler: noch ${restEinzaehler}`}
          {phase === "figur" && "Jetzt die Figur."}
          {phase === "fertig" && ergebnis && (
            <>
              {ergebnis.treffer} von {ergebnis.erwartet} getroffen, Streuung ±
              {Math.round(ergebnis.streuungMs)} ms.
              {ergebnis.versatzMs !== 0 && (
                <span className="text-dim">
                  {" "}
                  Versatz {ergebnis.versatzMs > 0 ? "+" : ""}
                  {ergebnis.versatzMs} ms — Laufzeit, kein Fehler.
                </span>
              )}
            </>
          )}
        </p>

        {phase !== "bereit" && phase !== "fertig" && (
          <div className="mt-4 flex items-center gap-2">
            {Array.from({ length: gesamt }, (_, i) => (
              <span
                key={i}
                className={`h-[6px] flex-1 ${
                  i < schlag
                    ? i < EINZAEHLER_SCHLAEGE
                      ? "bg-stahl"
                      : "bg-akzent"
                    : "bg-line"
                }`}
              />
            ))}
          </div>
        )}

        {phase === "bereit" && (
          <button onClick={() => void starten()} className="btn mt-4 w-full">
            <MdPlayArrow className="h-[18px] w-[18px]" /> Mikrofon an und los
          </button>
        )}

        {mic.status === "denied" || mic.status === "unsupported" || mic.status === "error" ? (
          <>
            {/* Keine Fehlermeldung, sondern eine fehlende Bedingung: ohne
                Mikrofon gibt es nichts zu messen. Deshalb Rost, nicht Rot. */}
            <div className="warnstreifen mt-3" aria-hidden />
            <p className="mt-2 flex items-start gap-2 text-[13.5px] leading-relaxed text-rost">
              <MdMic className="mt-[2px] h-4 w-4 shrink-0" />
              {mic.detail ?? "Mikrofon nicht verfügbar."} Ohne Mikrofon lässt sich diese Frage nicht
              messen — überspring sie einfach.
            </p>
          </>
        ) : null}
      </div>

      <p className="text-[13px] leading-relaxed text-dim">{figur.beschreibung}</p>
    </div>
  )
}
