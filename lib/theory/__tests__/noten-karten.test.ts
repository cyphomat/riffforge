import { describe, expect, it } from "vitest"
import { INTERVALLE, midiAt, noteAt } from "../fretboard"
import { NOTEN_KARTEN, notenbild } from "../noten-karten"
import { baueNotensatz } from "../notensatz"
import { cardById, THEORY_CARDS } from "../cards"
import { notenwertName, pausenOf, pruefeSong } from "../song"
import type { TheoryCard } from "../types"

/**
 * Karten mit Notenbild: das Bild ist die Aufgabe, und die Antwort wird aus
 * dem Bild gerechnet. Diese Tests rechnen sie ein zweites Mal, auf anderem
 * Weg, nach — wo beide Wege sich einig sind, stimmt die Karte.
 */

const richtige = (card: TheoryCard) => (card.frage.richtig as string[])[0]
const stelle = (card: TheoryCard) => card.frage.auswahl!.indexOf(richtige(card))

describe("Karten mit Notenbild", () => {
  it("sind im Katalog", () => {
    for (const karte of NOTEN_KARTEN) expect(cardById(karte.id)).toBe(karte)
    expect(THEORY_CARDS.filter((c) => c.frage.notenbild)).toHaveLength(NOTEN_KARTEN.length)
  })

  it("zeigen ein Bild und fragen mit Auswahl", () => {
    for (const karte of NOTEN_KARTEN) {
      expect(karte.frage.art).toBe("auswahl")
      expect(karte.frage.notenbild, karte.id).toBeDefined()
      expect(karte.frage.auswahl, karte.id).toHaveLength(4)
      expect(new Set(karte.frage.auswahl).size, karte.id).toBe(4)
      expect(karte.frage.auswahl, karte.id).toContain(richtige(karte))
    }
  })

  it("haben Bilder, die dieselbe Prüfung bestehen wie die Songs", () => {
    for (const karte of NOTEN_KARTEN) expect(pruefeSong(karte.frage.notenbild!), karte.id).toEqual([])
  })

  it("lassen sich setzen, ohne dass eine Note fehlt", () => {
    for (const karte of NOTEN_KARTEN) {
      const bild = karte.frage.notenbild!
      const satz = baueNotensatz(bild, 1)
      const gesetzt = satz.systeme.flatMap((s) => s.takte.flatMap((t) => t.koepfe)).length
      expect(gesetzt, karte.id).toBe(bild.noten.length)
    }
  })

  it("lassen die richtige Antwort nicht immer an derselben Stelle stehen", () => {
    const stellen = new Set(NOTEN_KARTEN.map(stelle))
    expect(stellen.size).toBeGreaterThanOrEqual(3)
  })

  it("haben eigene Kennungen mit Präfix n-", () => {
    for (const karte of NOTEN_KARTEN) expect(karte.id.startsWith("n-")).toBe(true)
  })
})

describe("Die Antworten, nachgerechnet", () => {
  it("benennen die Note, die im Bild steht", () => {
    for (const karte of NOTEN_KARTEN.filter((c) => c.stufe === 1)) {
      const griff = karte.frage.notenbild!.noten[0].griff
      expect(richtige(karte)).toBe(noteAt(griff))
    }
    // Zur Gegenprobe von Hand: leere e-Saite E, leere G-Saite G, B-Saite im ersten Bund C.
    expect(NOTEN_KARTEN.filter((c) => c.stufe === 1).map(richtige)).toEqual(["E", "G", "C"])
  })

  it("nennen den Abstand der zwei Noten im Bild", () => {
    const erwartet: Record<string, [number, string]> = {
      "n-abstand-quinte": [7, "Quinte"],
      "n-abstand-terz": [4, "grosse Terz"],
      "n-abstand-quarte": [5, "Quarte"],
    }
    for (const karte of NOTEN_KARTEN.filter((c) => c.stufe === 2)) {
      const [a, b] = karte.frage.notenbild!.noten
      const halbtoene = Math.abs(midiAt(b.griff) - midiAt(a.griff))
      const [soll, name] = erwartet[karte.id]
      expect(halbtoene, karte.id).toBe(soll)
      expect(INTERVALLE[halbtoene].name).toBe(name)
      expect(richtige(karte), karte.id).toBe(name)
    }
  })

  it("zählen die Schläge je Note aus der Dauer", () => {
    const erwartet: Record<string, string> = {
      "n-laenge-ganze": "4",
      "n-laenge-halbe": "2",
      "n-laenge-viertel": "1",
      "n-laenge-achtel": "1/2",
    }
    for (const [id, soll] of Object.entries(erwartet)) {
      const karte = cardById(id)!
      expect(richtige(karte), id).toBe(soll)
      // Jede Note im Bild hat denselben Wert, und die Takte sind genau voll.
      const noten = karte.frage.notenbild!.noten
      expect(new Set(noten.map((n) => n.dauer)).size, id).toBe(1)
      expect(noten.reduce((summe, n) => summe + n.dauer, 0), id).toBe(8)
    }
  })

  it("nennen den Wert der einzigen Pause im Bild", () => {
    for (const [id, soll] of [["n-pause-viertel", "Viertel"], ["n-pause-achtel", "Achtel"]] as const) {
      const karte = cardById(id)!
      const pausen = pausenOf(karte.frage.notenbild!)
      expect(pausen, id).toHaveLength(1)
      expect(notenwertName(pausen[0].dauer), id).toBe(soll)
      expect(richtige(karte), id).toBe(soll)
    }
  })

  it("lässt ein Notenbild aus Kurzschrift zu einem gültigen Song werden", () => {
    const bild = notenbild([[1, 0, 0, 8]])
    expect(bild.lernziel).toEqual({ toene: ["E"], abstaende: [], notenwerte: [8] })
  })
})
