"use client"

import { useEffect, useState } from "react"

/**
 * Die App auf den Startbildschirm legen.
 *
 * Chrome und Edge feuern `beforeinstallprompt` und lassen sich später
 * auffordern — daraus wird ein echter Knopf. Safari auf iOS feuert es nicht
 * und bietet keine API dafür an; dort bleibt nur der Weg über *Teilen → Zum
 * Home-Bildschirm*, und statt eines Knopfes, der nichts tut, steht dann die
 * Anleitung da.
 *
 * Wer schon installiert hat, braucht beides nicht: `display-mode: standalone`
 * verrät das, und dann verschwindet der ganze Abschnitt.
 */

interface InstallEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export type InstallLage =
  /** Läuft bereits als installierte App. */
  | "installiert"
  /** Der Browser hat angeboten, aufzufordern — ein Knopf geht. */
  | "bereit"
  /** iOS: geht, aber nur von Hand über das Teilen-Menü. */
  | "anleitung"
  /** Weder noch — dann wird gar nichts gezeigt, statt etwas zu behaupten. */
  | "unbekannt"

export function useInstall() {
  const [lage, setLage] = useState<InstallLage>("unbekannt")
  const [event, setEvent] = useState<InstallEvent | null>(null)

  useEffect(() => {
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // Safari auf iOS meldet es nur über diese eigene Eigenschaft.
      (window.navigator as { standalone?: boolean }).standalone === true

    if (standalone) {
      setLage("installiert")
      return
    }

    // iOS-Safari: WebKit ohne Chrome-Kennung. Absichtlich grob — die Folge
    // eines Fehlurteils ist eine Anleitung zu viel, nicht ein toter Knopf.
    const ua = window.navigator.userAgent
    const iOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
    const safari = /Safari/.test(ua) && !/CriOS|FxiOS|Chrome|Chromium|Edg/.test(ua)
    if (iOS && safari) setLage("anleitung")

    const auf = (e: Event) => {
      // Sonst zeigt Chrome seine eigene Leiste, und es gäbe zwei Angebote.
      e.preventDefault()
      setEvent(e as InstallEvent)
      setLage("bereit")
    }
    const fertig = () => setLage("installiert")

    window.addEventListener("beforeinstallprompt", auf)
    window.addEventListener("appinstalled", fertig)
    return () => {
      window.removeEventListener("beforeinstallprompt", auf)
      window.removeEventListener("appinstalled", fertig)
    }
  }, [])

  const installieren = async () => {
    if (!event) return
    await event.prompt()
    const { outcome } = await event.userChoice
    // Das Ereignis lässt sich nur einmal verwenden. Bei „später" verschwindet
    // der Knopf deshalb bis zum nächsten Aufruf der Seite — ihn stehen zu
    // lassen wäre ein Knopf, der beim zweiten Druck nichts tut.
    setEvent(null)
    setLage(outcome === "accepted" ? "installiert" : "unbekannt")
  }

  return { lage, installieren }
}
