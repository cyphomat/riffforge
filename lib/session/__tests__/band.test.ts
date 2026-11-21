import { describe, expect, it } from "vitest"
import { BAND, bandAn, bandUmschalten, dabei, stufeAb } from "../band"
import { STANDARD_WAHL, boardWahlSchema } from "../board"
import { RAENGE } from "../merch"
import type { PracticeLog } from "../types"

/** Alle Logs hier sind erfunden. Eine Woche mit Übung je Montag ab 2026-01-05. */
function wochen(n: number): PracticeLog {
  return {
    version: 1,
    results: Array.from({ length: n }, (_, i) => {
      const t = new Date(Date.UTC(2026, 0, 5 + i * 7, 12))
      return { drillId: "riff-ironclad", technique: "downpicking", bpm: 80, rating: 3 as const, seconds: 150, at: t.toISOString() }
    }),
  }
}

describe("Die Band", () => {
  it("kennt für jedes Mitglied einen echten Rang", () => {
    for (const b of BAND) expect(stufeAb(b.id), b.id).toBeGreaterThan(0)
    expect(RAENGE[stufeAb("schlagzeug")].id).toBe("proberaum")
    expect(RAENGE[stufeAb("bass")].id).toBe("vorband")
  })

  it("ist am Anfang leer, das Schlagzeug kommt mit dem Proberaum, der Bass mit der Vorband", () => {
    expect(dabei(wochen(1))).toEqual([])
    expect(dabei(wochen(4))).toEqual(["schlagzeug"])
    expect(dabei(wochen(12))).toEqual(["schlagzeug", "bass"])
  })

  it("verliert niemanden: ein späterer Log mit Lücke ändert nichts", () => {
    const l = wochen(12)
    l.results.push({ ...l.results[0], at: "2027-06-01T12:00:00.000Z" })
    expect(dabei(l)).toEqual(["schlagzeug", "bass"])
  })

  it("spielt mit, wer dabei und nicht abgewählt ist", () => {
    expect(bandAn(wochen(12), STANDARD_WAHL)).toEqual({ schlagzeug: true, bass: true })
    expect(bandAn(wochen(12), bandUmschalten(STANDARD_WAHL, "bass"))).toEqual({ schlagzeug: true, bass: false })
    expect(bandAn(wochen(1), STANDARD_WAHL)).toEqual({ schlagzeug: false, bass: false })
  })

  it("schaltet an und aus und ignoriert Unbekanntes", () => {
    const aus = bandUmschalten(STANDARD_WAHL, "schlagzeug")
    expect(aus.bandAus).toEqual(["schlagzeug"])
    expect(bandUmschalten(aus, "schlagzeug")).toEqual(STANDARD_WAHL)
    // @ts-expect-error absichtlich eine unbekannte Kennung
    expect(bandUmschalten(STANDARD_WAHL, "gesang")).toEqual(STANDARD_WAHL)
  })

  it("liest eine ältere gespeicherte Wahl ohne Band: es spielen alle", () => {
    expect(boardWahlSchema.parse({ aus: [], amp: null }).bandAus).toEqual([])
  })
})
