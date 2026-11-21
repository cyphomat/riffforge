import { describe, expect, it } from "vitest"
import { ALLE_DRILLS_BY_ID } from "../drills"
import {
  COMBO_AB,
  DECKEL,
  GEGNER_HP,
  GEGNER_NAMEN,
  combo,
  gegnerGefallenDurch,
  gegnerName,
  wochengegner,
  wochenTreffer,
} from "../wochengegner"
import type { DrillResult, PracticeLog } from "../types"
import type { TheoryLog } from "@/lib/theory/types"

/** Alle Logs hier sind erfunden. Die Woche läuft Montag 2026-11-16 bis Sonntag 2026-11-22. */

const RIFF = ALLE_DRILLS_BY_ID["riff-ironclad"]
const WOCHE = "2026-11-16"
const MITTWOCH = new Date("2026-11-18T12:00:00")

function ergebnis(tag: string, rating: 1 | 2 | 3 | 4, bpm = 80, uhr = "12:00:00", id = RIFF.id): DrillResult {
  return { drillId: id, technique: RIFF.technique, bpm, rating, seconds: 150, at: `${tag}T${uhr}` }
}
const log = (...r: DrillResult[]): PracticeLog => ({ version: 1, results: r })
const wissen = (n: number, tag = "2026-11-18", correct = true): TheoryLog => ({
  version: 1,
  answers: Array.from({ length: n }, (_, i) => ({
    cardId: `karte-${i}`,
    grade: 3 as const,
    correct,
    at: `${tag}T10:00:0${i % 10}`,
  })) as TheoryLog["answers"],
})
const LEER: TheoryLog = { version: 1, answers: [] }

describe("Treffer der Woche", () => {
  it("zählt nur Einträge dieser Woche", () => {
    const t = wochenTreffer(log(ergebnis("2026-11-15", 3), ergebnis("2026-11-23", 3)), LEER, WOCHE)
    expect(t.summe).toBe(0)
  })

  it("zählt Tage, saubere Blöcke und Wissen", () => {
    const t = wochenTreffer(log(ergebnis("2026-11-17", 3), ergebnis("2026-11-17", 2), ergebnis("2026-11-18", 4)), wissen(2), WOCHE)
    expect(t).toMatchObject({ tage: 2, sauber: 2, ziel: 0, wissen: 2, summe: 6 })
  })

  it("ein Riff im Zieltempo zählt doppelt, aber nur einmal je Riff", () => {
    const am_ziel = [ergebnis("2026-11-17", 3, RIFF.targetBpm), ergebnis("2026-11-18", 4, RIFF.targetBpm + 4)]
    expect(wochenTreffer(log(...am_ziel), LEER, WOCHE).ziel).toBe(2)
  })

  it("Zieltempo mit wackeligem Block zählt nicht", () => {
    expect(wochenTreffer(log(ergebnis("2026-11-17", 2, RIFF.targetBpm)), LEER, WOCHE).ziel).toBe(0)
  })

  it("falsche Wissensantworten zählen nicht", () => {
    expect(wochenTreffer(log(), wissen(3, "2026-11-18", false), WOCHE).wissen).toBe(0)
  })

  it("jede Quelle hat ihren Deckel", () => {
    const viele = Array.from({ length: 30 }, (_, i) => ergebnis("2026-11-17", 3, 80, `12:${`${i}`.padStart(2, "0")}:00`))
    const t = wochenTreffer(log(...viele), wissen(40), WOCHE)
    expect(t.sauber).toBe(DECKEL.sauber)
    expect(t.wissen).toBe(DECKEL.wissen)
  })

  it("ein Abend allein schafft ihn nicht", () => {
    const abend = Array.from({ length: 30 }, (_, i) => ergebnis("2026-11-17", 4, RIFF.targetBpm, `12:${`${i}`.padStart(2, "0")}:00`))
    const g = wochengegner(log(...abend), wissen(40, "2026-11-17"), MITTWOCH)
    expect(g.gefallen).toBe(false)
    expect(g.rest).toBeGreaterThan(0)
  })
})

describe("der Gegner", () => {
  it("hat 20 Lebenspunkte und fällt bei null", () => {
    const tage = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"]
    const viele = tage.flatMap((tag) => Array.from({ length: 4 }, (_, i) => ergebnis(tag, 4, RIFF.targetBpm, `12:0${i}:00`)))
    const g = wochengegner(log(...viele), wissen(10), MITTWOCH)
    expect(g.hp).toBe(GEGNER_HP)
    expect(g.rest).toBe(0)
    expect(g.gefallen).toBe(true)
  })

  it("liegt in der Woche fest: gleicher Name, auf jedem Gerät", () => {
    expect(gegnerName(WOCHE)).toBe(gegnerName(WOCHE))
    expect(GEGNER_NAMEN).toContain(gegnerName(WOCHE))
    expect(new Set(["2026-11-16", "2026-11-23", "2026-11-30", "2026-12-07", "2026-12-14", "2026-12-21"].map(gegnerName)).size).toBeGreaterThan(1)
  })

  it("eine neue Woche beginnt mit voller Leiste", () => {
    const alt = log(ergebnis("2026-11-17", 3))
    expect(wochengegner(alt, LEER, new Date("2026-11-24T12:00:00")).rest).toBe(GEGNER_HP)
  })
})

describe("Sieg durch diese Session", () => {
  const voll = (() => {
    const tage = ["2026-11-16", "2026-11-17", "2026-11-18", "2026-11-19"]
    return tage.flatMap((tag) => Array.from({ length: 4 }, (_, i) => ergebnis(tag, 4, RIFF.targetBpm, `12:0${i}:00`)))
  })()

  it("meldet den Sieg genau einmal", () => {
    const vorher = { log: log(...voll.slice(0, 4)), theorie: LEER }
    const nachher = { log: log(...voll), theorie: wissen(10) }
    expect(gegnerGefallenDurch(vorher, nachher, MITTWOCH)?.gefallen).toBe(true)
    expect(gegnerGefallenDurch(nachher, nachher, MITTWOCH)).toBeNull()
  })

  it("schweigt, solange er steht", () => {
    expect(gegnerGefallenDurch({ log: log(), theorie: LEER }, { log: log(ergebnis("2026-11-18", 3)), theorie: LEER }, MITTWOCH)).toBeNull()
  })
})

describe("Combo", () => {
  const r = (...ratings: Array<1 | 2 | 3 | 4>) => ratings.map((x, i) => ergebnis("2026-11-18", x, 80, `12:0${i}:00`))

  it("ist die längste Kette sauberer Blöcke", () => {
    expect(combo(r(3, 4, 3, 2, 3, 3))).toBe(3)
  })
  it("ein wackeliger Block bricht die Kette", () => {
    expect(combo(r(3, 3, 2, 3))).toBe(2)
  })
  it("liest die Reihenfolge nach Zeit, nicht nach Position", () => {
    const umgekehrt = r(3, 3, 3, 2).reverse()
    expect(combo(umgekehrt)).toBe(3)
  })
  it("ohne Ergebnisse null", () => {
    expect(combo([])).toBe(0)
    expect(COMBO_AB).toBe(3)
  })
})
