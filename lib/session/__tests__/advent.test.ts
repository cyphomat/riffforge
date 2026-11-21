import { describe, expect, it } from "vitest"
import { adventAufnaeherTage, adventJahr, adventStand, adventTage, offeneTuerchen } from "../advent"
import {
  AUFNAEHER_TUERCHEN,
  TUERCHEN,
  TUERCHEN_ANZAHL,
  adventPlektrumSchema,
  adventRiffSchema,
  adventTippSchema,
} from "../advent-daten"
import { aufnaeher, katalog } from "../merch"
import { pruefeSong } from "@/lib/theory/song"
import type { PracticeLog } from "../types"

/** Alle Logs hier sind erfunden. */

function log(...tage: string[]): PracticeLog {
  return {
    version: 1,
    results: tage.map((tag) => ({
      drillId: "riff-ironclad",
      technique: "downpicking",
      bpm: 80,
      rating: 3 as const,
      seconds: 150,
      at: `${tag}T12:00:00`,
    })),
  }
}
const dezember = (n: number) => Array.from({ length: n }, (_, i) => `2026-12-${`${i + 1}`.padStart(2, "0")}`)

describe("Die 24 Türchen", () => {
  it("sind vierundzwanzig, fortlaufend nummeriert", () => {
    expect(TUERCHEN).toHaveLength(TUERCHEN_ANZAHL)
    expect(TUERCHEN.map((t) => t.nr)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1))
  })

  it("sind gemischt: acht Riffe, acht Plektren, sechs Tipps, zwei Aufnäher", () => {
    const zaehl = (art: string) => TUERCHEN.filter((t) => t.art === art).length
    expect([zaehl("riff"), zaehl("plektrum"), zaehl("tipp"), zaehl("aufnaeher")]).toEqual([8, 8, 6, 2])
  })

  it("tragen die Aufnäher hinter den Türchen 12 und 24", () => {
    expect(TUERCHEN.filter((t) => t.art === "aufnaeher").map((t) => t.nr)).toEqual([...AUFNAEHER_TUERCHEN])
  })

  it("haben eindeutige IDs und gültige Daten", () => {
    const ids: string[] = []
    for (const t of TUERCHEN) {
      if (t.art === "riff") ids.push(adventRiffSchema.parse(t.riff).id)
      if (t.art === "plektrum") ids.push(adventPlektrumSchema.parse(t.plektrum).id)
      if (t.art === "tipp") adventTippSchema.parse(t.tipp)
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("haben Riffe, die das Raster einhalten und ihr Lernziel erfüllen", () => {
    for (const t of TUERCHEN) {
      if (t.art !== "riff") continue
      expect(pruefeSong(t.riff.song), t.riff.titel).toEqual([])
      expect(t.riff.startBpm, t.riff.titel).toBeLessThan(t.riff.targetBpm)
    }
  })
})

describe("Welche Türchen offen sind", () => {
  it("keine ohne Übung im Dezember", () => {
    expect(offeneTuerchen(log("2026-11-30", "2027-01-02"), 2026)).toBe(0)
  })

  it("ein Übungstag öffnet ein Türchen, zwei Übungen am selben Tag nur eines", () => {
    expect(offeneTuerchen(log("2026-12-01", "2026-12-01"), 2026)).toBe(1)
  })

  it("verpasste Tage lassen sich nachholen: die Lücke kostet nichts", () => {
    expect(offeneTuerchen(log("2026-12-01", "2026-12-05", "2026-12-09"), 2026)).toBe(3)
  })

  it("nie mehr als vierundzwanzig, auch mit 31 Übungstagen", () => {
    expect(offeneTuerchen(log(...dezember(31)), 2026)).toBe(24)
  })

  it("zählt nur das Jahr, nach dem gefragt wird", () => {
    const l = log("2025-12-01", "2025-12-02", "2026-12-01")
    expect(offeneTuerchen(l, 2025)).toBe(2)
    expect(offeneTuerchen(l, 2026)).toBe(1)
  })

  it("bleibt offen, einmal gespielt: ein späterer Log nimmt nichts zurück", () => {
    const vorher = adventStand(log(...dezember(5)), 2026)
    const nachher = adventStand(log(...dezember(5), "2027-03-01"), 2026)
    expect(nachher.offen).toBe(vorher.offen)
    expect(nachher.geoeffnet.map((t) => t.nr)).toEqual([1, 2, 3, 4, 5])
  })

  it("öffnet kein Türchen vor seinem Datum: an einem Kalendertag höchstens eines", () => {
    // Drei Übungstage bis zum 3. Dezember — Türchen 4 ist zu.
    expect(offeneTuerchen(log("2026-12-01", "2026-12-02", "2026-12-03"), 2026)).toBe(3)
  })

  it("liest Tage nach Gerätezeit und überspringt kaputte Zeitstempel", () => {
    const l: PracticeLog = { version: 1, results: [{ ...log("2026-12-01").results[0], at: "kaputt" }] }
    expect(adventTage(l, 2026)).toEqual([])
  })

  it("erkennt den Dezember", () => {
    expect(adventJahr("2026-12-01")).toBe(2026)
    expect(adventJahr("2026-11-30")).toBeNull()
  })
})

describe("Die Aufnäher des Advents", () => {
  it("gehen am zwölften und am vierundzwanzigsten Übungstag auf", () => {
    const tage = adventAufnaeherTage(log(...dezember(24)))
    expect(tage).toEqual({ 12: "2026-12-12", 24: "2026-12-24" })
  })

  it("fehlen darunter", () => {
    expect(adventAufnaeherTage(log(...dezember(11)))).toEqual({})
  })

  it("stehen im Katalog erst, wenn sie verdient sind", () => {
    expect(katalog({ mitSieben: false }).some((a) => a.id.startsWith("advent-"))).toBe(false)
    const mit = katalog({ mitSieben: false, advent: [12] }).filter((a) => a.id.startsWith("advent-"))
    expect(mit.map((a) => a.id)).toEqual(["advent-12"])
    expect(mit[0].gruppe).toBe("advent")
  })

  it("landen mit ihrem Tag an der Kutte", () => {
    const kutte = aufnaeher(log(...dezember(12)))
    expect(kutte.find((a) => a.id === "advent-12")?.verdient).toBe("2026-12-12")
    expect(kutte.some((a) => a.id === "advent-24")).toBe(false)
  })
})
