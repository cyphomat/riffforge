"use client"

import Link from "next/link"
import { MdArrowForward, MdFileUpload } from "react-icons/md"
import { InstallPanel } from "@/components/session/install-panel"

/**
 * Der erste Bildschirm überhaupt — einmal, dann nie wieder.
 *
 * Er verkauft nichts. Er beantwortet die drei Fragen, die jemand hat, der
 * gerade auf einer fremden Seite gelandet ist: Wo bleiben meine Daten?
 * Brauche ich ein Konto? Und wie komme ich hier wieder raus, ohne alles zu
 * verlieren?
 *
 * Die dritte ist die, an der solche Apps sonst scheitern: wer nicht weiss,
 * dass sein Stand nur in diesem Browser liegt, verliert ihn beim ersten
 * Aufräumen — und merkt es erst, wenn es weg ist. Das steht deshalb hier und
 * nicht im Kleingedruckten.
 */

export interface WelcomeProps {
  /** Weiter zur Ersteinrichtung — und den Schirm nie wieder zeigen. */
  onStart: () => void
  /**
   * Dasselbe Merken, aber der Weg nach „Daten" läuft über `next/link`.
   * `window.location` würde den `basePath` unterschlagen und unter
   * GitHub Pages ins Leere greifen.
   */
  onImport: () => void
}

const PUNKTE = [
  {
    kopf: "Kein Konto, kein Server",
    text: "Es gibt nichts anzumelden. Die App spricht mit niemandem — kein Tracking, keine Einbettungen, keine fremden Schriften.",
  },
  {
    kopf: "Alles bleibt auf dem Gerät",
    text: "Dein Übungs-Log liegt in diesem Browser. Das ist der Vorteil und der Haken: Browserdaten löschen heisst auch Log löschen.",
  },
  {
    kopf: "Mitnehmen geht über eine Datei",
    text: "Unter Daten holst du deinen Stand als Datei heraus und anderswo wieder hinein. Auf ein anderes Gerät, in ein Backup, wohin du willst.",
  },
]

export function Welcome({ onStart, onImport }: WelcomeProps) {
  return (
    <div className="huelle">
      <section className="card winkel mt-6">
        <span className="kicker text-akzent">Willkommen</span>
        <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">
          Fünfzehn Minuten am Tag
        </h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Eine Übungs-App für Metal-Gitarre. Starten, üben, fertig — und morgen wieder.
        </p>
      </section>

      <ul className="mt-6 border-t border-line">
        {PUNKTE.map((punkt) => (
          <li key={punkt.kopf} className="border-b border-line py-[13px]">
            <div className="display text-[16px] text-fg">{punkt.kopf}</div>
            <p className="mt-1 text-[14px] leading-relaxed text-muted">{punkt.text}</p>
          </li>
        ))}
      </ul>

      {/* Nicht „Los geht's" — so heisst schon der Knopf am Ende der
          Ersteinrichtung, die direkt danach kommt. Zwei Schirme
          hintereinander mit demselben Knopf lassen einen glauben, man sei im
          Kreis gelaufen. Stattdessen steht hier, was als Nächstes passiert. */}
      <button onClick={onStart} className="btn mt-6 w-full py-5 text-[15px]">
        Einrichten · zwei Fragen <MdArrowForward className="h-[18px] w-[18px]" />
      </button>

      <Link
        href="/daten"
        onClick={onImport}
        className="btn btn-ghost btn-small mt-[9px] w-full py-3"
      >
        <MdFileUpload className="h-[16px] w-[16px]" /> Ich habe schon einen Stand
      </Link>

      <InstallPanel />
    </div>
  )
}
