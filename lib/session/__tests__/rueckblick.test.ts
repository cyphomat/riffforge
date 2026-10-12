import { describe, expect, it } from "vitest"
import {
  WOCHEN_HOECHSTENS,
  drillVerlaeufe,
  entwicklung,
  fensterWochen,
  kalenderwoche,
  wochen,
} from "../rueckblick"
import type { DrillResult, PracticeLog } from "../types"

// Montag, 12. Oktober 2026, abends.
const JETZT = new Date(2026, 9, 12, 21, 0, 0)

function tag(vorTagen: number, stunde = 20): string {
  const d = new Date(JETZT)
  d.setDate(d.getDate() - vorTagen)
  d.setHours(stunde, 0, 0, 0)
  return d.toISOString()
}

function block(
  vorTagen: number,
  teil: Partial<DrillResult> & { spread?: number } = {},
): DrillResult {
  const { spread, ...rest } = teil
  return {
    drillId: "tech-downpicking",
    technique: "downpicking",
    bpm: 120,
    rating: 3,
    seconds: 180,
    at: tag(vorTagen),
    ...(spread !== undefined
      ? { timing: { hits: 40, expected: 48, spreadMs: spread, offsetMs: 30, score: 70, trend: "steady" as const } }
      : {}),
    ...rest,
  }
}

const log = (results: DrillResult[]): PracticeLog => ({ version: 1, results })

describe("Das Fenster", () => {
  it("wächst mit dem Log, statt leere Wochen vorzuzeigen", () => {
    expect(fensterWochen(log([]), JETZT)).toEqual(["2026-10-12"])
    expect(fensterWochen(log([block(9)]), JETZT)).toEqual(["2026-09-28", "2026-10-05", "2026-10-12"])
  })

  it("reicht höchstens ein Quartal zurück", () => {
    const f = fensterWochen(log([block(400)]), JETZT)
    expect(f).toHaveLength(WOCHEN_HOECHSTENS)
    expect(f.at(-1)).toBe("2026-10-12")
  })

  it("zeigt Wochen ohne Übung als Wochen mit null Tagen, nicht gar nicht", () => {
    // Eine Pause ist eine Auskunft — sie zu verschweigen, hiesse beschönigen.
    const w = wochen(log([block(15), block(1), block(0)]), JETZT)
    expect(w.map((x) => [x.woche, x.tage])).toEqual([
      ["2026-09-21", 1],
      ["2026-09-28", 0],
      ["2026-10-05", 1],
      ["2026-10-12", 1],
    ])
  })

  it("zählt Tage, nicht Blöcke", () => {
    const w = wochen(log([block(0, { seconds: 120 }), block(0, { seconds: 240 }), block(0)]), JETZT)
    expect(w.at(-1)).toEqual({ woche: "2026-10-12", tage: 1, minuten: 9, bloecke: 3 })
  })

  it("kommt mit einem Log aus der Zukunft zurecht", () => {
    expect(fensterWochen(log([block(-30)]), JETZT)).toEqual(["2026-10-12"])
  })
})

describe("Der Verlauf je Drill", () => {
  it("nimmt je Woche das höchste sauber gespielte Tempo", () => {
    const [v] = drillVerlaeufe(
      log([
        block(8, { bpm: 110 }),
        block(7, { bpm: 130, rating: 2 }), // wackelig zählt nicht
        block(1, { bpm: 118 }),
        block(0, { bpm: 124, rating: 4 }),
      ]),
      JETZT,
    )
    expect(v.tempo).toEqual([
      { woche: "2026-09-28", wert: 110 },
      { woche: "2026-10-05", wert: 118 },
      { woche: "2026-10-12", wert: 124 },
    ])
  })

  it("lässt eine Lücke, wo nichts sauber war, statt eine Null zu erfinden", () => {
    const [v] = drillVerlaeufe(log([block(8, { bpm: 110 }), block(1, { bpm: 130, rating: 1 })]), JETZT)
    expect(v.tempo.map((p) => p.wert)).toEqual([110, null, null])
  })

  it("nimmt für die Streuung den Median der gemessenen Blöcke", () => {
    const [v] = drillVerlaeufe(
      log([block(2, { spread: 30 }), block(1, { spread: 12 }), block(0, { spread: 18 }), block(0)]),
      JETZT,
    )
    expect(v.streuung.at(-1)).toEqual({ woche: "2026-10-12", wert: 18 })
  })

  it("hat ohne Mikrofon keine Streuung", () => {
    const [v] = drillVerlaeufe(log([block(0)]), JETZT)
    expect(v.streuung.every((p) => p.wert === null)).toBe(true)
  })

  it("stellt zuletzt Gespieltes nach vorn und lässt Älteres weg", () => {
    const v = drillVerlaeufe(
      log([
        block(3, { drillId: "riff-dirge" }),
        block(1, { drillId: "tech-gallop" }),
        block(200, { drillId: "uralt" }),
      ]),
      JETZT,
    )
    expect(v.map((x) => x.drillId)).toEqual(["tech-gallop", "riff-dirge"])
  })
})

describe("Die Entwicklung", () => {
  it("vergleicht ersten und letzten belegten Wert", () => {
    expect(
      entwicklung([
        { woche: "a", wert: null },
        { woche: "b", wert: 31 },
        { woche: "c", wert: null },
        { woche: "d", wert: 17 },
      ]),
    ).toEqual({ von: 31, bis: 17, vonWoche: "b", bisWoche: "d" })
  })

  it("sagt nichts aus einem einzigen Punkt", () => {
    expect(entwicklung([{ woche: "a", wert: 120 }, { woche: "b", wert: null }])).toBeNull()
  })
})

describe("Kalenderwoche", () => {
  it("folgt ISO 8601, auch über den Jahreswechsel", () => {
    expect(kalenderwoche("2026-10-12")).toBe(42)
    expect(kalenderwoche("2026-01-05")).toBe(2)
    // Der 29.12.2025 ist ein Montag, und seine Woche gehört schon zu 2026.
    expect(kalenderwoche("2025-12-29")).toBe(1)
    // 2026 hat 53 Wochen: der 28.12.2026 beginnt KW 53.
    expect(kalenderwoche("2026-12-28")).toBe(53)
  })
})
