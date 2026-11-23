import { describe, expect, it } from "vitest"
import { figurVon } from "../../theory/drill-spiel"
import { DUMPF_S, TOT_S, bauDrillAblauf, klickzeiten, schrittSekunden } from "../drill-ablauf"

/**
 * Das Tempo, nachgerechnet: bei 120 BPM dauert ein Schlag eine halbe Sekunde,
 * ein Achtel eine Viertel davon, ein Sechzehntel eine achtel Sekunde.
 */

const ablauf = (id: string, bpm = 120) => bauDrillAblauf(figurVon(id)!, bpm)

describe("schrittSekunden", () => {
  it("zählt BPM in Schlägen und teilt durch das Raster", () => {
    expect(schrittSekunden(120, 1)).toBe(0.5)
    expect(schrittSekunden(120, 2)).toBe(0.25)
    expect(schrittSekunden(120, 4)).toBe(0.125)
  })
})

describe("bauDrillAblauf", () => {
  it("dauert ganze Takte, mit einem Klick je Schlag und der Betonung auf der Eins", () => {
    const a = ablauf("tech-downpicking")
    expect(a.dauer).toBe(4)
    expect(a.klicks).toHaveLength(8)
    expect(a.klicks.map((k) => k.betont)).toEqual([true, false, false, false, true, false, false, false])
    expect(a.klicks[1].zeit).toBe(0.5)
  })

  it("spielt den Powerchord als drei Töne zugleich", () => {
    const [erster] = ablauf("tech-downpicking").toene
    // E5: E, H, E — leere E-Saite, A-Saite Bund 2, D-Saite Bund 2.
    expect(erster.midis).toEqual([40, 47, 52])
  })

  it("legt den Gallop als Achtel und zwei Sechzehntel", () => {
    const [a, b, c] = ablauf("tech-gallop").toene
    expect([a.start, b.start, c.start]).toEqual([0, 0.25, 0.375])
    // Der Schlag ist lauter als das Sechzehntel dazwischen: so hört man den Takt.
    expect(a.laut).toBeGreaterThan(b.laut)
    expect(a.laut).toBeGreaterThan(c.laut)
  })

  it("dämpft einen Palm Mute kurz, auch wenn bis zum nächsten Ton Zeit wäre", () => {
    const [erster] = ablauf("tech-palm-mute").toene
    expect(erster.dumpf).toBe(true)
    expect(erster.ende).toBe(DUMPF_S)
  })

  it("lässt einen offenen Ton bis zum nächsten Anschlag stehen", () => {
    const [a, b] = ablauf("riff-dirge").toene
    expect(a.ende).toBe(b.start)
  })

  it("macht aus einer toten Note ein Klacken ohne Tonhöhe", () => {
    const toene = ablauf("tech-dead-notes").toene
    const tot = toene.find((t) => t.tot)!
    expect(tot.midis).toEqual([])
    expect(tot.ende - tot.start).toBeCloseTo(Math.min(TOT_S, 0.25), 10)
    expect(tot.laut).toBeLessThan(toene[0].laut)
  })

  it("lässt ein Bending nach dem Anschlag wandern, nicht neu anschlagen", () => {
    const toene = ablauf("tech-bending").toene
    const [erster, zweiter] = toene
    // Sieben- zu Neunbund auf der G-Saite: zwei Halbtöne, ab dem Schlag nach dem Anschlag.
    expect(erster.gleiten).toMatchObject({ ab: 0.5, halbtoene: 2 })
    // Die Note klingt bis zum nächsten Anschlag, über den Schritt des Ziehens hinweg.
    expect(erster.ende).toBe(zweiter.start)
    expect(zweiter.start).toBe(1)
    // Fünf Anschläge je Durchgang: drei gezogene, zwei einzelne.
    expect(toene).toHaveLength(5)
  })

  it("lässt einen Slide gleiten, ohne die Note neu anzuschlagen", () => {
    const [erster, zweiter] = ablauf("tech-slides").toene
    expect(erster.gleiten?.halbtoene).toBe(2)
    expect(zweiter.start).toBe(1)
    // Der Slide abwärts: von Bund 7 zurück auf 5.
    expect(zweiter.gleiten?.halbtoene).toBe(-2)
  })

  it("spielt Legato leiser als einen angeschlagenen Ton", () => {
    const [angeschlagen, gebunden] = ablauf("tech-legato").toene
    expect(gebunden.laut).toBeLessThan(angeschlagen.laut)
  })

  it("folgt dem Tempo: doppelt so schnell, halb so lang", () => {
    expect(ablauf("tech-gallop", 60).dauer).toBe(2 * ablauf("tech-gallop", 120).dauer)
  })
})

describe("klickzeiten", () => {
  it("klickt je Schlag so oft wie der Drill Klicks je Schlag hat", () => {
    // Achtel-Drill bei 120 BPM: ein Klick alle Viertelsekunde, der Nebenschlag leiser.
    const klicks = klickzeiten(4, 120, 2)
    expect(klicks).toHaveLength(8)
    expect(klicks.map((k) => k.zeit)).toEqual([0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75])
    expect(klicks.map((k) => k.nebenschlag)).toEqual([false, true, false, true, false, true, false, true])
    expect(klicks.filter((k) => k.betont)).toHaveLength(1)
  })

  it("lässt den Klick eines Viertel-Drills, wie er war", () => {
    const klicks = klickzeiten(8, 120, 1)
    expect(klicks).toHaveLength(8)
    expect(klicks.every((k) => !k.nebenschlag)).toBe(true)
    expect(klicks.filter((k) => k.betont).map((k) => k.zeit)).toEqual([0, 2])
  })

  it("gibt dem Anhören denselben Klick wie dem Block", () => {
    // Pentatonik Box: Achtel, Tempo 72 — 144 Klicks je Minute, ein Klick je Ton.
    const a = bauDrillAblauf(figurVon("tech-pentatonic-box")!, 72, 2)
    expect(a.klicks).toHaveLength(16)
    expect(a.klicks[1].zeit).toBeCloseTo(60 / 72 / 2, 10)
  })
})
