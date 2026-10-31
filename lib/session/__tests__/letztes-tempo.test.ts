import { describe, expect, it } from "vitest"
import { letztesTempo } from "../letztes-tempo"
import type { DrillResult, PracticeLog } from "../types"

const GRENZEN = { min: 40, max: 300 }

function ergebnis(at: string, bpm: number): DrillResult {
  return { drillId: "tech-downpicking", technique: "downpicking", bpm, rating: 3, seconds: 180, at }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("letztesTempo", () => {
  it("gibt bei leerem Log nichts zurück", () => {
    expect(letztesTempo(log(), GRENZEN)).toBeNull()
  })

  it("nimmt das Tempo des einzigen Blocks", () => {
    expect(letztesTempo(log(ergebnis("2026-10-30T20:00:00.000Z", 112)), GRENZEN)).toBe(112)
  })

  it("nimmt den neuesten nach Zeitstempel, nicht den letzten im Array", () => {
    const alt = ergebnis("2026-10-28T20:00:00.000Z", 90)
    const neu = ergebnis("2026-10-30T20:00:00.000Z", 130)
    expect(letztesTempo(log(alt, neu), GRENZEN)).toBe(130)
    expect(letztesTempo(log(neu, alt), GRENZEN)).toBe(130)
  })

  it("vergleicht Zeitpunkte und nicht Zeichen: eine andere Zeitzone ändert die Reihenfolge", () => {
    // 21:00 +02:00 ist 19:00 UTC, also vor 20:00 UTC, obwohl der Text „später" aussieht.
    const spaeter = ergebnis("2026-10-30T20:00:00.000Z", 100)
    const frueher = ergebnis("2026-10-30T21:00:00+02:00", 140)
    expect(letztesTempo(log(spaeter, frueher), GRENZEN)).toBe(100)
  })

  it("nimmt bei gleichem Zeitstempel den späteren Eintrag", () => {
    const at = "2026-10-30T20:00:00.000Z"
    expect(letztesTempo(log(ergebnis(at, 80), ergebnis(at, 95)), GRENZEN)).toBe(95)
  })

  it("überspringt Einträge, deren Zeitstempel nichts bedeutet", () => {
    const gut = ergebnis("2026-10-29T20:00:00.000Z", 110)
    const kaputt = ergebnis("gestern", 200)
    expect(letztesTempo(log(gut, kaputt), GRENZEN)).toBe(110)
  })

  it("gibt null, wenn nur kaputte Zeitstempel da sind", () => {
    expect(letztesTempo(log(ergebnis("gestern", 120)), GRENZEN)).toBeNull()
  })

  it("nimmt Tempi genau auf den Grenzen", () => {
    expect(letztesTempo(log(ergebnis("2026-10-30T20:00:00.000Z", 40)), GRENZEN)).toBe(40)
    expect(letztesTempo(log(ergebnis("2026-10-30T20:00:00.000Z", 300)), GRENZEN)).toBe(300)
  })

  it("biegt kein Tempo außerhalb zurecht: ein langsames Warm-up gibt null", () => {
    expect(letztesTempo(log(ergebnis("2026-10-30T20:00:00.000Z", 39)), GRENZEN)).toBeNull()
    expect(letztesTempo(log(ergebnis("2026-10-30T20:00:00.000Z", 301)), GRENZEN)).toBeNull()
  })

  it("prüft nur den neuesten: ein altes Tempo im Bereich ersetzt ein neues außerhalb nicht", () => {
    const alt = ergebnis("2026-10-28T20:00:00.000Z", 120)
    const neu = ergebnis("2026-10-30T20:00:00.000Z", 30)
    expect(letztesTempo(log(alt, neu), GRENZEN)).toBeNull()
  })

  it("verändert den Log nicht", () => {
    const eingabe = log(ergebnis("2026-10-30T20:00:00.000Z", 120), ergebnis("2026-10-28T20:00:00.000Z", 90))
    const kopie = structuredClone(eingabe)
    letztesTempo(eingabe, GRENZEN)
    expect(eingabe).toEqual(kopie)
  })
})
