"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MdArrowBack, MdCheck } from "react-icons/md"
import { Fretboard } from "@/components/theory/fretboard"
import { noteAt, SAITENNAMEN, type Ton } from "@/lib/theory/fretboard"
import {
  benannt,
  FLINK_MS,
  gefunden,
  halsBericht,
  halsId,
  halskarte,
  halsNote,
  halsRunde,
  NAMEN_WAHL,
  SAITEN_WAHL,
  ZAEH_MS,
  type HalsBericht,
  type HalsErgebnis,
  type HalsRichtung,
} from "@/lib/theory/hals-trainer"
import { appendAnswers, loadTheoryLog } from "@/lib/storage/theory-log"
import { EMPTY_THEORY_LOG, type Griff, type TheoryLog } from "@/lib/theory/types"

/** Places per round — about two minutes, short enough to fit before a session. */
const RUNDE = 12
/** How long a right answer stays on screen before the next question. */
const TREFFER_MS = 450

const saiteText = (saite: number) => (saite === 1 ? "hohen e-Saite" : `${SAITENNAMEN[saite - 1]}-Saite`)
const tonText = (ton: Ton) => {
  const auch = NAMEN_WAHL.find((name) => name.ton === ton)?.auch
  return auch ? `${ton} · ${auch}` : ton
}
const sekunden = (ms: number) => `${(ms / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} s`

interface Frage {
  stelle: Griff
  /** A second go at a missed place, later in the round. Not written to the log. */
  wiederholung: boolean
}

/**
 * Der Griffbrett-Trainer: den Hals lernen, Stelle für Stelle.
 *
 * Zwei Richtungen, weil es zwei Fähigkeiten sind: einen Ton *finden*, wenn
 * man weiss, welchen man will — und eine Stelle *benennen*, auf der die Hand
 * gerade liegt. Jede der zweiundsiebzig Stellen ist in jeder Richtung eine
 * eigene Karte mit eigener Wiederholung; die Rechnung steht in
 * `lib/theory/hals-trainer.ts`.
 */
export function HalsTrainer() {
  const [log, setLog] = useState<TheoryLog>(EMPTY_THEORY_LOG)
  const [geladen, setGeladen] = useState(false)
  const [richtung, setRichtung] = useState<HalsRichtung>("finden")
  const [wahl, setWahl] = useState(0)

  const [fragen, setFragen] = useState<Frage[] | null>(null)
  const [index, setIndex] = useState(0)
  const [getippt, setGetippt] = useState<Griff | null>(null)
  const [genannt, setGenannt] = useState<Ton | null>(null)
  const [aufgeloest, setAufgeloest] = useState(false)
  const [ergebnisse, setErgebnisse] = useState<HalsErgebnis[]>([])
  const [bericht, setBericht] = useState<HalsBericht | null>(null)
  const seit = useRef(0)

  useEffect(() => {
    setLog(loadTheoryLog())
    setGeladen(true)
  }, [])

  // The clock starts when a question is on screen, not when the round starts.
  useEffect(() => {
    if (fragen) seit.current = performance.now()
  }, [fragen, index])

  const starten = () => {
    const stellen = halsRunde(loadTheoryLog(), richtung, SAITEN_WAHL[wahl].saiten, RUNDE, {
      startwert: Date.now() % 2 ** 31,
    })
    setFragen(stellen.map((stelle) => ({ stelle, wiederholung: false })))
    setIndex(0)
    setErgebnisse([])
    setBericht(null)
    setGetippt(null)
    setGenannt(null)
    setAufgeloest(false)
  }

  const weiter = (liste: Frage[], neu: HalsErgebnis[]) => {
    setGetippt(null)
    setGenannt(null)
    setAufgeloest(false)
    if (index + 1 < liste.length) setIndex(index + 1)
    else {
      setFragen(null)
      setBericht(halsBericht(neu))
    }
  }

  const antworten = (richtig: boolean) => {
    if (!fragen || aufgeloest) return
    const frage = fragen[index]
    const ms = Math.round(performance.now() - seit.current)
    setAufgeloest(true)

    let liste = fragen
    let neu = ergebnisse
    if (!frage.wiederholung) {
      // Gleich schreiben, nicht am Ende: wer mitten in der Runde aufhört,
      // behält, was er schon beantwortet hat.
      setLog(
        appendAnswers([
          { cardId: halsId(richtung, frage.stelle), grade: halsNote(richtig, ms), correct: richtig, at: new Date().toISOString() },
        ]),
      )
      neu = [...ergebnisse, { stelle: frage.stelle, richtig, ms }]
      setErgebnisse(neu)
    }
    // Was danebenging, kommt am Ende der Runde noch einmal — ohne Wertung,
    // nur damit die richtige Stelle nicht als letzte Erinnerung bleibt.
    if (!richtig && !frage.wiederholung) {
      liste = [...fragen, { stelle: frage.stelle, wiederholung: true }]
      setFragen(liste)
    }
    if (richtig) setTimeout(() => weiter(liste, neu), TREFFER_MS)
  }

  if (!geladen) return null

  /* ───────────────────────────── Die Runde ───────────────────────────── */
  if (fragen) {
    const frage = fragen[index]
    const ton = noteAt(frage.stelle)
    const richtig =
      aufgeloest && (richtung === "finden" ? getippt !== null && gefunden(frage.stelle, getippt) : genannt !== null && benannt(frage.stelle, genannt))

    return (
      <div className="huelle">
        <header className="mt-6">
          <span className="kicker text-dim">
            {richtung === "finden" ? "Ton finden" : "Ton benennen"} · {Math.min(index + 1, fragen.length)} von {fragen.length}
            {frage.wiederholung && " · nochmal"}
          </span>
          <h1 className="display mt-1 text-[34px] leading-tight text-fg sm:text-[38px]" aria-live="polite">
            {richtung === "finden" ? (
              <>
                {/* Tonnamen nicht in Versalien: aus Db würde DB. */}
                <span className="text-akzent normal-case">{tonText(ton)}</span>{" "}
                <span className="text-[24px] text-muted sm:text-[26px]">auf der {saiteText(frage.stelle.saite)}</span>
              </>
            ) : (
              "Welcher Ton ist das?"
            )}
          </h1>
        </header>

        <div className="mt-4">
          <Fretboard
            gewaehlt={richtung === "finden" ? getippt : null}
            frage={richtung === "benennen" ? frage.stelle : null}
            loesung={aufgeloest ? (richtung === "finden" ? [frage.stelle] : []) : undefined}
            onPick={
              richtung === "finden" && !aufgeloest
                ? (stelle) => {
                    setGetippt(stelle)
                    antworten(gefunden(frage.stelle, stelle))
                  }
                : null
            }
          />
        </div>

        {richtung === "benennen" && (
          <div className="mt-3 grid grid-cols-4 gap-[6px]">
            {NAMEN_WAHL.map(({ ton: name, auch }) => {
              const istLoesung = aufgeloest && name === ton
              const istFalsch = aufgeloest && name === genannt && name !== ton
              return (
                <button
                  key={name}
                  disabled={aufgeloest}
                  onClick={() => {
                    setGenannt(name)
                    antworten(benannt(frage.stelle, name))
                  }}
                  className={`border py-[10px] text-center font-mono text-[14px] transition-colors ${
                    istLoesung
                      ? "border-gruen bg-(--tint-gruen) text-gruen"
                      : istFalsch
                        ? "border-rot text-rot"
                        : "border-line text-muted"
                  }`}
                >
                  {name}
                  {auch && <span className="block text-[11.5px] text-dim">{auch}</span>}
                </button>
              )
            })}
          </div>
        )}

        {aufgeloest && !richtig && (
          <div className="mt-4 border-l-2 border-rot py-2 pl-3">
            <p className="kicker text-rot">Daneben</p>
            <p className="mt-1 text-[15px] text-fg">
              {richtung === "finden"
                ? `${tonText(ton)} liegt auf der ${saiteText(frage.stelle.saite)} im ${frage.stelle.bund}. Bund.`
                : `Das ist ${tonText(ton)} — ${saiteText(frage.stelle.saite)}, ${frage.stelle.bund}. Bund.`}{" "}
              Kommt am Ende der Runde noch einmal.
            </p>
            <button onClick={() => weiter(fragen, ergebnisse)} className="btn mt-3 w-full">
              Weiter
            </button>
          </div>
        )}
        {aufgeloest && richtig && (
          <p className="mt-4 flex items-center gap-2 font-mono text-[13px] text-gruen">
            <MdCheck className="h-4 w-4" /> Sitzt.
          </p>
        )}

        <button onClick={() => setFragen(null)} className="btn btn-ghost btn-small mt-8 w-full">
          Abbrechen
        </button>
      </div>
    )
  }

  /* ──────────────────────── Überblick und Bericht ─────────────────────── */
  const karte = halskarte(log, richtung)
  const zaehle = (z: string) => [...karte.values()].filter((wert) => wert === z).length

  return (
    <div className="huelle">
      <section className="card winkel mt-6">
        <span className="kicker text-akzent">Griffbrett</span>
        <h1 className="display mt-2 text-[34px] text-fg sm:text-[38px]">Den Hals lernen</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Zwölf Stellen je Runde, rund zwei Minuten. Was hakt, kommt bald wieder, was sitzt, seltener —
          dieselbe Wiederholung wie bei den Wissenskarten. Gezählt wird auch die Zeit: wer suchen muss,
          kennt die Stelle noch nicht ganz.
        </p>

        {bericht && (
          <div className="mt-4 border-l-2 border-akzent py-2 pl-3" aria-live="polite">
            <p className="kicker text-akzent">Letzte Runde</p>
            <p className="mt-1 text-[15px] text-fg">
              {bericht.richtig} von {bericht.gesamt} richtig
              {bericht.medianMs !== null && <> · im Schnitt {sekunden(bericht.medianMs)}</>}
            </p>
            {bericht.nochmal.length > 0 && (
              <p className="mt-1 text-[13.5px] leading-relaxed text-muted">
                Noch nicht flüssig:{" "}
                {bericht.nochmal
                  .map((stelle) => `${noteAt(stelle)} auf der ${saiteText(stelle.saite)} (${stelle.bund}. Bund)`)
                  .join(", ")}
                .
              </p>
            )}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-[9px]" role="group" aria-label="Richtung">
          {(["finden", "benennen"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRichtung(r)}
              aria-pressed={richtung === r}
              className={`border px-3 py-2 font-mono text-[12px] uppercase tracking-[0.1em] ${
                richtung === r ? "border-akzent bg-(--tint-akzent) text-akzent" : "border-line text-muted"
              }`}
            >
              {r === "finden" ? "Ton finden" : "Ton benennen"}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-[6px]" role="group" aria-label="Saiten">
          {SAITEN_WAHL.map((option, i) => (
            <button
              key={option.name}
              onClick={() => setWahl(i)}
              aria-pressed={wahl === i}
              className={`border px-[10px] py-[6px] font-mono text-[12px] ${
                wahl === i ? "border-akzent text-akzent" : "border-line text-muted"
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>

        <button onClick={starten} className="btn mt-4 w-full">
          {bericht ? "Noch eine Runde" : `${RUNDE} Stellen`}
        </button>
      </section>

      <section>
        <h2 className="rule mb-3 mt-8">{richtung === "finden" ? "Finden" : "Benennen"} — der Stand</h2>
        <Fretboard karte={karte} onPick={null} />
        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[12px] text-muted">
          <span className="flex items-center gap-[6px]">
            <span className="inline-block h-[10px] w-[10px] rounded-full bg-gruen" aria-hidden /> sitzt {zaehle("sitzt")}
          </span>
          <span className="flex items-center gap-[6px]">
            <span className="inline-block h-[10px] w-[10px] rounded-full bg-rost" aria-hidden /> wackelt {zaehle("wackelt")}
          </span>
          <span>neu {zaehle("neu")}</span>
        </p>
        <p className="mt-3 text-[12.5px] leading-relaxed text-dim">
          Grün hält eine Woche. Flink heisst unter {sekunden(FLINK_MS)}, zäh über {sekunden(ZAEH_MS)} — eine
          richtige, aber zähe Antwort kommt früher wieder als eine flinke.
        </p>
      </section>

      <Link href="/" className="btn btn-ghost btn-small mt-9 w-full py-3">
        <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
      </Link>
    </div>
  )
}
