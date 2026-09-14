"use client"

import { MdIosShare, MdAddToHomeScreen, MdCheck } from "react-icons/md"
import { useInstall } from "@/hooks/use-install"

/**
 * Auf den Startbildschirm legen.
 *
 * Steht bewusst nicht ganz oben auf „Daten": wer hier ist, will meistens
 * sichern. Aber es ist die Stelle, an der jemand nachsieht, wenn er die App
 * dauerhaft haben will — und ohne Knopf findet er den Weg auf dem Handy
 * praktisch nie.
 */
export function InstallPanel() {
  const { lage, installieren } = useInstall()

  // Die Überschrift gehört in den Abschnitt, nicht darüber: wo der Browser
  // nichts anbietet, verschwindet beides zusammen. Eine Überschrift ohne
  // Inhalt ist schlimmer als kein Abschnitt.
  if (lage === "unbekannt") return null

  if (lage === "installiert") {
    return (
      <section>
        <h2 className="rule mb-1 mt-9">Als App ablegen</h2>
        <p className="mt-2 flex items-center gap-2 text-[13.5px] text-gruen">
          <MdCheck className="h-4 w-4 shrink-0" />
          Läuft als installierte App — offline und ohne Browserleiste.
        </p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Als App ablegen</h2>
      <p className="text-[14px] leading-relaxed text-muted">
        Riffforge läuft wie eine normale App: offline, im Vollbild, mit eigenem Symbol. Es
        wird nichts hochgeladen — die Seite wird nur auf dem Gerät abgelegt.
      </p>

      {lage === "bereit" ? (
        <button onClick={() => void installieren()} className="btn mt-3 w-full">
          <MdAddToHomeScreen className="h-[18px] w-[18px]" /> Auf dem Gerät installieren
        </button>
      ) : (
        // iOS gibt keine API her. Ein Knopf, der nichts tut, wäre schlimmer
        // als drei Zeilen Anleitung.
        <ol className="mt-3 border-t border-line">
          {[
            <>
              Unten auf <b className="text-fg">Teilen</b> tippen
              <MdIosShare className="mx-1 inline h-4 w-4 align-text-bottom text-stahl" />
            </>,
            <>
              <b className="text-fg">Zum Home-Bildschirm</b> wählen
            </>,
            <>
              Mit <b className="text-fg">Hinzufügen</b> bestätigen
            </>,
          ].map((schritt, i) => (
            <li
              key={i}
              className="flex gap-3 border-b border-line py-[9px] text-[14px] leading-relaxed text-muted"
            >
              <span className="ziffern flex-none text-akzent">{i + 1}</span>
              <span>{schritt}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
