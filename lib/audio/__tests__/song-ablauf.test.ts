import { describe, expect, it } from "vitest"
import { SONGS } from "../../theory/songs"
import { achtelSekunden, bauAblauf, einzaehler, klingendeNoten } from "../song-ablauf"

/**
 * Das Tempo, nachgerechnet: bei 120 BPM dauert eine Viertel eine halbe
 * Sekunde und ein Achtel eine Viertel — die Zahlen sind Kopfrechnen.
 */

const [drei, pendel, abstaende] = SONGS.map((s) => s.song)

describe("achtelSekunden", () => {
  it("zählt BPM in Vierteln", () => {
    expect(achtelSekunden(120)).toBe(0.25)
    expect(achtelSekunden(60)).toBe(0.5)
  })
})

describe("bauAblauf", () => {
  it("dauert ganze Takte, damit die Schleife anschließt", () => {
    // Zwei Takte zu je vier Vierteln bei 120 BPM: vier Sekunden.
    expect(bauAblauf(drei, 120).dauer).toBe(4)
    expect(bauAblauf(abstaende, 120).dauer).toBe(8)
  })

  it("rechnet Start und Ende jeder Note nach", () => {
    // „Drei Töne": Halbe auf 0 (vier Achtel), dann Viertel auf Achtel 4.
    const [a, c] = bauAblauf(drei, 120).toene
    expect([a.start, a.ende]).toEqual([0, 1])
    expect([c.start, c.ende]).toEqual([1, 1.5])
  })

  it("gibt jeder Note ihre klingende Tonhöhe", () => {
    // A3 = 57, C4 = 60, D4 = 62.
    expect(bauAblauf(drei, 100).toene.map((t) => t.midi)).toEqual([57, 60, 62, 60, 57])
  })

  it("behält den Index der Note, damit die Anzeige mitlaufen kann", () => {
    expect(bauAblauf(pendel, 100).toene.map((t) => t.note)).toEqual(pendel.noten.map((_, i) => i))
  })

  it("lässt keine Note in die nächste laufen, auch nicht bei Pausen dazwischen", () => {
    for (const song of [drei, pendel, abstaende]) {
      const toene = bauAblauf(song, 90).toene
      toene.slice(1).forEach((ton, i) => expect(ton.start).toBeGreaterThanOrEqual(toene[i].ende))
    }
  })

  it("lässt keine Note über den Durchgang hinaus klingen", () => {
    for (const song of [drei, pendel, abstaende]) {
      const ablauf = bauAblauf(song, 90)
      expect(Math.max(...ablauf.toene.map((t) => t.ende))).toBeLessThanOrEqual(ablauf.dauer + 1e-9)
    }
  })

  it("klickt jede Viertel und betont die Eins", () => {
    const { klicks } = bauAblauf(drei, 120)
    expect(klicks.map((k) => k.zeit)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5])
    expect(klicks.map((k) => k.betont)).toEqual([true, false, false, false, true, false, false, false])
  })

  it("wird mit höherem Tempo kürzer, im gleichen Verhältnis", () => {
    const langsam = bauAblauf(pendel, 60)
    const schnell = bauAblauf(pendel, 120)
    expect(langsam.dauer).toBe(2 * schnell.dauer)
    langsam.toene.forEach((t, i) => expect(t.start).toBeCloseTo(2 * schnell.toene[i].start))
  })
})

describe("einzaehler", () => {
  it("zählt einen Takt an", () => {
    const { klicks, dauer } = einzaehler(120)
    expect(klicks.map((k) => k.zeit)).toEqual([0, 0.5, 1, 1.5])
    expect(klicks[0].betont).toBe(true)
    expect(klicks.slice(1).every((k) => !k.betont)).toBe(true)
    expect(dauer).toBe(2)
  })
})

describe("klingendeNoten", () => {
  // „Drei Töne" bei 120 BPM: Noten 0 bis 4 beginnen bei 0, 1, 1.5, 2 und 3 Sekunden.
  const toene = bauAblauf(drei, 120).toene

  it("nennt die Note, die gerade erklingt", () => {
    expect(klingendeNoten(toene, 0, 0.5)).toEqual([0])
    expect(klingendeNoten(toene, 0, 1.2)).toEqual([1])
  })

  it("rechnet ab dem Beginn des Durchgangs, nicht ab der Uhr null", () => {
    expect(klingendeNoten(toene, 10, 10.5)).toEqual([0])
    expect(klingendeNoten(toene, 10, 0.5)).toEqual([])
  })

  it("nennt vor dem Beginn des Durchgangs nichts, auch nicht im Einzähler", () => {
    expect(klingendeNoten(toene, 2, 1)).toEqual([])
  })

  it("lässt die Note am Ende ihres Werts los, genau dort, wo auch abgedämpft wird", () => {
    expect(klingendeNoten(toene, 0, 0.999)).toEqual([0])
    expect(klingendeNoten(toene, 0, 1)).toEqual([1])
  })

  it("kennt höchstens eine Note je Zeitpunkt, denn der Song hat eine Stimme", () => {
    for (let t = 0; t < 4; t += 0.05) expect(klingendeNoten(toene, 0, t).length).toBeLessThanOrEqual(1)
  })
})
