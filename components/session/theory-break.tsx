"use client"

import { useState } from "react"
import { QuizCard } from "@/components/theory/quiz-card"
import { appendAnswers } from "@/lib/storage/theory-log"
import type { Grade } from "@/lib/theory/fsrs"
import type { Sicherheit, TheoryCard } from "@/lib/theory/types"

/**
 * Eine Portion Fragen zwischen zwei Blöcken.
 *
 * Zwei Stück, rund vierzig Sekunden — dort, wo man das Plektrum ohnehin
 * absetzt. Wer keine Lust hat, überspringt: die Karten bleiben fällig und
 * kommen morgen wieder. Blockieren darf das Üben nichts.
 *
 * Die Karten kommen von aussen. Sie hier auszuwählen hiesse, den Fall "nichts
 * fällig" mitten im Rendern zu bemerken — und die Portion müsste sich selbst
 * abmelden, während sie gezeichnet wird.
 */
export function TheoryBreak({
  karten,
  grundiert,
  onDone,
}: {
  karten: TheoryCard[]
  /** Ob die Auswahl auf den kommenden Block zeigt. Ändert nur die Ansage. */
  grundiert: boolean
  onDone: (beantwortet: number) => void
}) {
  const [index, setIndex] = useState(0)
  const [beantwortet, setBeantwortet] = useState(0)

  const antworten = (grade: Grade, correct: boolean, sure?: Sicherheit) => {
    // Sofort schreiben, nicht am Ende der Portion: wer die Session abbricht,
    // soll die Antwort trotzdem behalten.
    appendAnswers([
      { cardId: karten[index].id, grade, correct, ...(sure && { sure }), at: new Date().toISOString() },
    ])
    const jetzt = beantwortet + 1
    setBeantwortet(jetzt)
    if (index + 1 < karten.length) setIndex(index + 1)
    else onDone(jetzt)
  }

  return (
    <div className="mx-auto max-w-[640px]">
      <p className="kicker mb-5 text-stahl">
        {grundiert ? "Kurz zum nächsten Block" : "Zwischendurch"}
      </p>

      <QuizCard
        key={karten[index].id}
        card={karten[index]}
        zaehler={`Frage ${index + 1} von ${karten.length}`}
        onAnswer={antworten}
      />

      <button onClick={() => onDone(beantwortet)} className="btn btn-ghost btn-small mt-6 w-full">
        Überspringen, weiterspielen
      </button>
    </div>
  )
}
