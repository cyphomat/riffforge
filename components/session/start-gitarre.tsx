"use client"

import { useState } from "react"
import { MdCasino, MdMusicNote, MdTune } from "react-icons/md"
import { Stimmgeraet } from "./stimmgeraet"

interface StartGitarreProps {
  /** Die Gitarre des ersten Technik+Riff-Paars. */
  gitarre: string
  /** Ob die Gitarre sieben Saiten hat: das Stimmgerät beginnt dann bei der Siebensaitigen. */
  sieben: boolean
  /** Würfelt neu; die nächste Gitarre ist eine andere. */
  onAndere: () => void
  onWeiter: () => void
}

/**
 * Der erste Bildschirm einer neuen Session, wenn die Roulette läuft: welche
 * Gitarre in die Hand kommt, einmal neu würfeln, stimmen, los. Das Stimmgerät
 * klappt hier auf, statt auf eine andere Seite zu führen — ein Weg dorthin und
 * zurück würde die gewürfelte Gitarre verlieren.
 */
export function StartGitarre({ gitarre, sieben, onAndere, onWeiter }: StartGitarreProps) {
  const [stimmen, setStimmen] = useState(false)

  return (
    <div className="huelle pt-8">
      <span className="kicker">Neue Session</span>
      <p className="card plain mt-4 px-4 py-4">
        <span className="kicker block text-stahl">Heute spielst du</span>
        <span className="display mt-2 block text-[34px] leading-none text-akzent sm:text-[38px]">{gitarre}</span>
      </p>

      <button onClick={onWeiter} className="btn mt-6 w-full py-5 text-[15px]">
        <MdMusicNote className="h-[18px] w-[18px]" /> Weiter
      </button>
      <div className="mt-[9px] grid grid-cols-2 gap-[9px]">
        <button onClick={onAndere} className="btn btn-ghost btn-small py-3">
          <MdCasino className="h-[16px] w-[16px]" /> Andere Gitarre
        </button>
        <button
          onClick={() => setStimmen((offen) => !offen)}
          aria-expanded={stimmen}
          className="btn btn-ghost btn-small py-3"
        >
          <MdTune className="h-[16px] w-[16px]" /> {stimmen ? "Stimmen zu" : "Erst stimmen"}
        </button>
      </div>

      {stimmen && (
        <section className="mt-6">
          <Stimmgeraet key={gitarre} eingebettet anfang={sieben ? "sieben" : "sechs"} />
        </section>
      )}
    </div>
  )
}
