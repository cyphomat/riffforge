"use client"

import { useState } from "react"
import { Fretboard } from "@/components/theory/fretboard"
import { IntervallHoeren } from "@/components/theory/intervall-hoeren"
import { NotenView } from "@/components/session/noten-view"
import { RhythmQuiz } from "@/components/theory/rhythm-quiz"
import { DAEMPFUNG_MINDESTENS, figurById, type FigurBewertung } from "@/lib/theory/rhythm"
import { bewertungsvorschlag } from "@/lib/theory/bewertung"
import { GRADES, type Grade } from "@/lib/theory/fsrs"
import { noteAt, parseTon, sameGriff, verwechselungshinweis } from "@/lib/theory/fretboard"
import { SICHERHEITEN, type Griff, type Sicherheit, type TheoryCard } from "@/lib/theory/types"

/**
 * Eine Frage, eine Antwort, dann die Erklärung.
 *
 * Die Rückmeldung ist kein Beiwerk: bei niedriger Trefferquote kehrt sich der
 * Vorteil des Abfragens ohne sie sogar um — wer rät und nichts erfährt, lernt
 * die falsche Antwort. Deshalb steht nach jedem Versuch die richtige Antwort
 * da, und darunter, warum sie richtig ist.
 */

/**
 * Vergleichsform für getippte Antworten.
 *
 * Stufenfolgen schreibt jeder anders — "1 b2 3" und "1♭2 3" meinen dasselbe.
 * Abstände, Vorzeichen und Gross-/Kleinschreibung sollen keine Rolle spielen;
 * geprüft wird Wissen, nicht Tippgenauigkeit.
 */
function vergleichsform(wert: string): string {
  return wert
    .trim()
    .toLowerCase()
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/[\s,]+/g, " ")
}

function istRichtig(card: TheoryCard, antwort: Griff | string | null): boolean {
  if (antwort === null) return false

  if (card.frage.art === "griffbrett") {
    const stellen = card.frage.richtig as Griff[]
    return typeof antwort !== "string" && stellen.some((stelle) => sameGriff(stelle, antwort))
  }

  const erwartet = card.frage.richtig as string[]
  const getippt = String(antwort).trim()
  if (getippt === "") return false

  if (erwartet.some((wert) => vergleichsform(wert) === vergleichsform(getippt))) return true

  // Sonst als Ton gelesen: "fis" und "F#" meinen dasselbe. Bei einer Frage
  // nach der Schreibweise wäre genau das der Fehler — dort zählt das Wort.
  if (card.frage.woertlich) return false

  const alsTon = parseTon(getippt)
  return alsTon !== null && erwartet.some((wert) => parseTon(wert) === alsTon)
}

export interface QuizCardProps {
  card: TheoryCard
  onAnswer: (grade: Grade, correct: boolean, sure?: Sicherheit) => void
  /** Kopfzeile, etwa "Frage 2 von 4". */
  zaehler?: string
}

export function QuizCard({ card, onAnswer, zaehler }: QuizCardProps) {
  const [griff, setGriff] = useState<Griff | null>(null)
  const [text, setText] = useState("")
  const [aufgeloest, setAufgeloest] = useState(false)
  const [gespielt, setGespielt] = useState<FigurBewertung | null>(null)
  // Wie sicher man vor der Auflösung war. Bleibt leer bei gespielten Fragen
  // (die Messung ist die Antwort) und beim Auflösen mit Enter (keine stille
  // Vorgabe, die die Kalibrierung verzerrt).
  const [sure, setSure] = useState<Sicherheit | undefined>(undefined)
  // Nach einem sicheren Treffer genügt ein Tap; die vier Noten kommen erst auf Wunsch.
  const [andersBewerten, setAndersBewerten] = useState(false)

  const antwort: Griff | string | null = card.frage.art === "griffbrett" ? griff : text
  const richtig = card.frage.art === "gespielt" ? (gespielt?.richtig ?? false) : istRichtig(card, antwort)
  // Wer ohne Mikrofon auflöst, hat nicht danebengespielt — er hat gar nicht
  // gespielt. Das ist ein dritter Zustand, kein Fehlversuch, und er bekommt
  // deshalb weder das Rot noch eine Notenempfehlung.
  const ungemessen = card.frage.art === "gespielt" && gespielt === null && aufgeloest
  const bereit =
    card.frage.art === "griffbrett"
      ? griff !== null
      : card.frage.art === "gespielt"
        ? gespielt !== null
        : text.trim() !== ""

  const loesungen = card.frage.richtig
  const hinweis =
    card.frage.art !== "griffbrett" && !richtig
      ? verwechselungshinweis(text, parseTon((loesungen as string[])[0]) ?? "C")
      : null

  return (
    <div className="space-y-4">
      <div>
        {zaehler && <p className="kicker text-dim">{zaehler}</p>}
        <h2 className="display mt-1 text-[26px] leading-tight text-fg sm:text-[30px]">
          {card.frage.text}
        </h2>
      </div>

      {card.frage.notenbild && <NotenView song={card.frage.notenbild} />}

      {card.frage.art === "griffbrett" && (
        <Fretboard
          gegeben={card.frage.gegeben}
          gewaehlt={griff}
          loesung={aufgeloest ? (loesungen as Griff[]) : undefined}
          onPick={aufgeloest ? null : (gewaehlt) => setGriff(gewaehlt)}
        />
      )}

      {card.frage.art === "gespielt" && card.frage.rhythmus && (
        <RhythmQuiz
          figur={figurById(card.frage.rhythmus.figurId)!}
          bpm={card.frage.rhythmus.bpm}
          takte={card.frage.rhythmus.takte}
          onFertig={(ergebnis) => {
            setGespielt(ergebnis)
            // Gemessen ist aufgelöst: eine zweite Bestätigung wäre nur ein
            // Klick zwischen Ergebnis und Erklärung.
            setAufgeloest(true)
          }}
        />
      )}

      {card.frage.art === "eingabe" && (
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && bereit && !aufgeloest) setAufgeloest(true)
          }}
          disabled={aufgeloest}
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Antwort"
          aria-label="Antwort"
          className="w-full border border-line bg-sunken px-3 py-3 font-mono text-[16px] text-fg outline-hidden focus:border-akzent disabled:text-muted"
        />
      )}

      {card.frage.art === "gehoert" && card.frage.hoeren && (
        <IntervallHoeren halbtoene={card.frage.hoeren.halbtoene} richtung={card.frage.hoeren.richtung} />
      )}

      {(card.frage.art === "auswahl" || card.frage.art === "gehoert") && (
        // Zwölf Intervallnamen untereinander wären auf dem Handy eine Liste
        // zum Scrollen; zu zweit nebeneinander passen sie auf einen Blick.
        <div className={`grid gap-[9px] ${card.frage.art === "gehoert" ? "grid-cols-2 sm:grid-cols-3" : "sm:grid-cols-2"}`}>
          {card.frage.auswahl?.map((option) => {
            const gewaehlt = text === option
            const istLoesung = (loesungen as string[]).includes(option)
            const rahmen = aufgeloest
              ? istLoesung
                ? "border-gruen bg-(--tint-gruen) text-gruen"
                : gewaehlt
                  ? "border-rot text-rot"
                  : "border-line text-dim"
              : gewaehlt
                ? "border-akzent text-fg"
                : "border-line text-muted"
            return (
              <button
                key={option}
                onClick={() => !aufgeloest && setText(option)}
                disabled={aufgeloest}
                className={`border text-left font-mono transition-colors ${
                  card.frage.art === "gehoert" ? "p-[11px] text-[13px]" : "p-[14px] text-[14px]"
                } ${rahmen}`}
              >
                {option}
              </button>
            )
          })}
        </div>
      )}

      {!aufgeloest ? (
        card.frage.art === "gespielt" ? (
          // Ohne Mikrofon — oder ohne Gitarre in der Hand — soll die Karte
          // trotzdem durchgehen. Blockieren darf hier nichts; die Erklärung
          // ist auch ohne Messung etwas wert.
          <button onClick={() => setAufgeloest(true)} className="btn btn-ghost btn-small w-full">
            Ohne Mikrofon: Auflösung zeigen
          </button>
        ) : (
          // Die Abfrage steckt im Auflösen selbst: derselbe Tap, nur mit einer
          // Antwort darauf, wie sicher man ist. Sie muss vor der Auflösung
          // kommen, danach wüsste jeder, dass er es gewusst hat.
          <div>
            <p className="kicker mb-2 text-dim">Auflösen — wie sicher bist du?</p>
            {!bereit && (
              <p className="mb-2 text-[14px] text-muted">
                {card.frage.art === "griffbrett"
                  ? "Erst die Stelle am Griffbrett antippen, dann die Sicherheit wählen."
                  : card.frage.art === "eingabe"
                    ? "Erst die Antwort eintippen, dann die Sicherheit wählen."
                    : "Erst eine Antwort wählen, dann die Sicherheit."}
              </p>
            )}
            <div className="grid grid-cols-3 gap-[9px]">
              {SICHERHEITEN.map((stufe) => (
                <button
                  key={stufe.value}
                  onClick={() => {
                    setSure(stufe.value)
                    setAufgeloest(true)
                  }}
                  disabled={!bereit}
                  className="btn btn-small"
                >
                  {stufe.label}
                </button>
              ))}
            </div>
          </div>
        )
      ) : (
        <div className="space-y-4">
          <div
            className={`border-l-2 py-2 pl-3 ${
              ungemessen ? "border-line" : richtig ? "border-gruen" : "border-rot"
            }`}
          >
            <p
              className={`kicker ${
                ungemessen ? "text-muted" : richtig ? "text-gruen" : "text-rot"
              }`}
            >
              {ungemessen ? "Nicht gemessen" : richtig ? "Sitzt" : "Daneben"}
            </p>
            {ungemessen && (
              <p className="mt-1 text-[15px] text-fg">
                Ohne Mikrofon gibt es keine Messung. Die Auflösung steht unten — bewerte selbst,
                wie sicher du dir bist.
              </p>
            )}
            {!richtig && !ungemessen && card.frage.art === "gespielt" && (
              <p className="mt-1 text-[15px] text-fg">
                {gespielt?.daempfung !== null &&
                gespielt !== null &&
                gespielt.daempfung < DAEMPFUNG_MINDESTENS
                  ? "Die Anschläge sassen, aber die gedämpften waren kaum leiser als die übrigen. Es fehlt die Dämpfung, nicht das Timing."
                  : "Nicht genug Anschläge sassen auf der Figur. Die Verzögerung der Signalkette ist dabei schon herausgerechnet — es liegt an der Figur, nicht an der Technik."}
              </p>
            )}
            {!richtig && !ungemessen && card.frage.art !== "gespielt" && (
              <p className="mt-1 text-[15px] text-fg">
                Richtig ist{" "}
                <b className="font-mono">
                  {card.frage.art === "griffbrett"
                    ? `${noteAt((loesungen as Griff[])[0])} — ${(loesungen as Griff[])
                        .slice(0, 3)
                        .map((stelle) => `Saite ${stelle.saite}, ${stelle.bund === 0 ? "leer" : `Bund ${stelle.bund}`}`)
                        .join(" oder ")}`
                    : (loesungen as string[])[0]}
                </b>
                .
              </p>
            )}
            {sure === 3 && !richtig && !ungemessen && (
              <p className="mt-1 text-[14px] leading-relaxed text-akzent">
                Du warst sicher — und lagst daneben. Die Karte kommt bald wieder.
              </p>
            )}
            {hinweis && <p className="mt-1 text-[14px] leading-relaxed text-akzent">{hinweis}</p>}
          </div>

          <div>
            <p className="kicker text-dim">{card.begriff}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-muted">{card.erklaerung}</p>
          </div>

          {(() => {
            const { vorschlag, volleWahl } = bewertungsvorschlag(richtig, sure, ungemessen)
            if (!volleWahl && vorschlag !== null && !andersBewerten) {
              return (
                <div className="space-y-2">
                  <button onClick={() => onAnswer(vorschlag, richtig, sure)} className="btn w-full">
                    Weiter
                  </button>
                  <button
                    onClick={() => setAndersBewerten(true)}
                    className="btn btn-ghost btn-small w-full"
                  >
                    Anders bewerten
                  </button>
                </div>
              )
            }
            return (
              <div>
                <h3 className="rule mb-3">Wie lief&apos;s?</h3>
                <div className="grid gap-[9px] sm:grid-cols-2">
                  {GRADES.map((note) => {
                    // Vorschlag, keine Vorgabe: falsch beantwortet heisst
                    // "Nochmal", richtig heisst "Gut". Überschreiben geht immer.
                    // Ohne Messung wird nichts vorgeschlagen — dafür weiss die App
                    // schlicht zu wenig.
                    const empfohlen = note.value === vorschlag
                    return (
                      <button
                        key={note.value}
                        onClick={() => onAnswer(note.value as Grade, richtig, sure)}
                        className={`border p-[14px] text-left transition-colors ${
                          empfohlen ? "border-akzent bg-(--tint-akzent)" : "border-line"
                        }`}
                      >
                        <span className="display block text-[17px] text-fg">{note.label}</span>
                        <span className="text-[13px] text-dim">{note.hint}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
