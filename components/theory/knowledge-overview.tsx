"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MdCheck } from "react-icons/md"
import { QuizCard } from "@/components/theory/quiz-card"
import { THEORY_CARDS } from "@/lib/theory/cards"
import { type Grade } from "@/lib/theory/fsrs"
import { cardStates, dueCards, SITZT_AB_TAGEN, theorieStand } from "@/lib/theory/progress"
import { STUFEN, type TheoryCard, type TheoryLog } from "@/lib/theory/types"
import { EMPTY_THEORY_LOG } from "@/lib/theory/types"
import { appendAnswers, loadTheoryLog } from "@/lib/storage/theory-log"

/** Wie viele Fragen eine Runde unter *Wissen* umfasst. */
const RUNDE = 6

function Stat({ value, label, sub }: { value: string | number; label: string; sub?: string }) {
  return (
    <div className="stat">
      <div className="n">{label}</div>
      <div className="v">{value}</div>
      {sub && <div className="font-mono text-[11.5px] text-dim">{sub}</div>}
    </div>
  )
}

export function KnowledgeOverview() {
  const [log, setLog] = useState<TheoryLog>(EMPTY_THEORY_LOG)
  const [loaded, setLoaded] = useState(false)
  const [runde, setRunde] = useState<TheoryCard[] | null>(null)
  const [index, setIndex] = useState(0)
  const [fertig, setFertig] = useState(0)

  useEffect(() => {
    setLog(loadTheoryLog())
    setLoaded(true)
  }, [])

  const stand = theorieStand(THEORY_CARDS, log)
  const faellig = dueCards(THEORY_CARDS, log)
  const zustaende = cardStates(log)

  const starten = () => {
    setRunde(dueCards(THEORY_CARDS, loadTheoryLog()).slice(0, RUNDE).map((eintrag) => eintrag.card))
    setIndex(0)
    setFertig(0)
  }

  const beantworten = (grade: Grade, correct: boolean) => {
    if (!runde) return
    // Sofort schreiben, nicht erst am Ende: wer die Seite mitten in der Runde
    // verlässt, soll die Antworten trotzdem behalten.
    setLog(
      appendAnswers([
        { cardId: runde[index].id, grade, correct, at: new Date().toISOString() },
      ]),
    )
    setFertig((zahl) => zahl + 1)
    if (index + 1 < runde.length) setIndex(index + 1)
    else setRunde(null)
  }

  if (!loaded) return null

  if (runde && runde.length > 0) {
    return (
      <div className="huelle-breit">
        <div className="mx-auto max-w-[640px] py-6">
          <QuizCard
            key={runde[index].id}
            card={runde[index]}
            zaehler={`Frage ${index + 1} von ${runde.length}`}
            onAnswer={beantworten}
          />
          <button
            onClick={() => setRunde(null)}
            className="btn btn-ghost btn-small mt-6 w-full"
          >
            Abbrechen
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="huelle-breit zwei-spalten">
      <div className="spalte">
        <section className="card winkel mt-6">
          <span className="kicker text-akzent">Wissen</span>
          <h1 className="display mt-2 text-[34px] text-fg sm:text-[38px]">
            {faellig.length === 0
              ? "Alles beisammen"
              : stand.angefangen === 0
                ? "Noch nichts abgefragt"
                : `${faellig.length} ${faellig.length === 1 ? "Karte" : "Karten"} dran`}
          </h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            {faellig.length === 0
              ? "Es ist gerade nichts fällig. Was sitzt, kommt von selbst wieder, wenn es Zeit wird."
              : "Erst kommt, was am schlechtesten sitzt — dann Neues. Nach jeder Antwort steht da, warum sie richtig ist."}
          </p>

          {fertig > 0 && (
            <p className="mt-3 flex items-center gap-2 font-mono text-[12.5px] text-gruen">
              <MdCheck className="h-4 w-4" />
              {fertig} {fertig === 1 ? "Frage" : "Fragen"} beantwortet
            </p>
          )}

          <button onClick={starten} disabled={faellig.length === 0} className="btn mt-4 w-full">
            {faellig.length === 0
              ? "Nichts fällig"
              : `${Math.min(RUNDE, faellig.length)} Fragen`}
          </button>
        </section>

        <section>
          <h2 className="rule mb-3 mt-8">Stand</h2>
          <div className="grid grid-cols-3 gap-[9px]">
            {/* Kurze Etiketten: drei Kacheln nebeneinander lassen auf einem
                schmalen Gerät rund sieben Zeichen zu, sonst schiebt das
                Wort die Seite auseinander. */}
            <Stat value={stand.angefangen} label="Begonnen" sub={`von ${THEORY_CARDS.length}`} />
            <Stat value={stand.sitzen} label="Sitzt" sub={`hält ${SITZT_AB_TAGEN}+ Tage`} />
            <Stat
              value={stand.trefferquote === null ? "—" : `${Math.round(stand.trefferquote * 100)}%`}
              label="Richtig"
              sub="aller Antworten"
            />
          </div>
        </section>
      </div>

      <div className="spalte">
        {STUFEN.filter((stufe) => THEORY_CARDS.some((card) => card.stufe === stufe.nummer)).map(
          (stufe) => (
            <section key={stufe.nummer}>
              <h2 className="rule mb-3 mt-8">
                {stufe.nummer}. {stufe.titel}
              </h2>
              <ul className="space-y-[6px]">
                {THEORY_CARDS.filter((card) => card.stufe === stufe.nummer).map((card) => {
                  const zustand = zustaende.get(card.id)
                  // Stabilität in Tagen statt Abrufbarkeit in Prozent: die
                  // steht direkt nach dem Antworten immer bei 100 % und sagt
                  // dann nichts. Tage sagen, wie lange es hält.
                  const tage = zustand?.stability ?? null
                  return (
                    <li
                      key={card.id}
                      className="flex items-baseline justify-between gap-3 border-b border-line pb-[6px]"
                    >
                      <span className="text-[14.5px] text-fg">{card.begriff}</span>
                      <span
                        className={`shrink-0 font-mono text-[11.5px] ${
                          tage !== null && tage >= SITZT_AB_TAGEN ? "text-gruen" : "text-dim"
                        }`}
                        title={tage === null ? "noch nie abgefragt" : "hält rund so lange"}
                      >
                        {tage === null ? "neu" : `${tage < 1 ? tage.toFixed(1) : Math.round(tage)} T`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </section>
          ),
        )}

        <p className="mt-6 text-[13px] leading-relaxed text-dim">
          Vier der Fragen kommen ohnehin in jeder Session vor — hier ist nur der
          Rest.{" "}
          <Link href="/" className="text-stahl underline-offset-2 hover:underline">
            Zurück zur Session
          </Link>
        </p>
      </div>
    </div>
  )
}
