import { describe, expect, it } from "vitest"
import { ALLE_DRILLS_BY_ID } from "../drills"
import { makeProfile, startBpmFor } from "../profile"
import {
  KANAELE_HOECHSTENS,
  WOCHEN_HOECHSTENS,
  drillVerlaeufe,
  entwicklung,
  fensterWochen,
  kalenderwoche,
  pultKanaele,
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

describe("Das Pult", () => {
  const drill = ALLE_DRILLS_BY_ID["tech-downpicking"]
  const pult = (results: DrillResult[], profil = null as ReturnType<typeof makeProfile> | null) =>
    pultKanaele(drillVerlaeufe(log(results), JETZT), profil)

  it("stellt den Fader auf das letzte saubere Tempo, die Kerbe auf das erste", () => {
    const [kanal] = pult([block(20, { bpm: drill.startBpm + 10 }), block(1, { bpm: drill.startBpm + 30 })])
    expect(kanal.jetzt).toBe(drill.startBpm + 30)
    expect(kanal.anfang).toBe(drill.startBpm + 10)
    expect(kanal.bewegt).toBe(true)
    expect(kanal.stellung).toBeCloseTo(30 / (drill.targetBpm - drill.startBpm))
    expect(kanal.stellungAnfang).toBeCloseTo(10 / (drill.targetBpm - drill.startBpm))
  })

  it("zählt nur sauber Gespieltes — ein zähes Tempo verschiebt keinen Fader", () => {
    const [kanal] = pult([block(8, { bpm: drill.startBpm + 20 }), block(1, { bpm: drill.startBpm + 50, rating: 2 })])
    expect(kanal.jetzt).toBe(drill.startBpm + 20)
    expect(kanal.bewegt).toBe(false)
  })

  it("hat keinen Kanal für einen Drill ohne sauberes Tempo, und keinen für Unbekanntes", () => {
    expect(pult([block(1, { rating: 1 })])).toEqual([])
    expect(pult([block(1, { drillId: "gibt-es-nicht" })])).toEqual([])
  })

  it("misst ab dem Starttempo dieses Spielers, wie `masteryOf`", () => {
    const profil = makeProfile("anfang", "beides", JETZT)
    const start = startBpmFor(drill, profil)
    expect(start).not.toBe(drill.startBpm)
    const [kanal] = pult([block(1, { bpm: start })], profil)
    expect(kanal.start).toBe(start)
    expect(kanal.stellung).toBe(0)
  })

  it("steht über dem Ziel oben an und unter dem Start unten, ohne den Wert zu verbiegen", () => {
    const [oben] = pult([block(1, { bpm: drill.targetBpm + 20 })])
    expect(oben.stellung).toBe(1)
    expect(oben.jetzt).toBe(drill.targetBpm + 20)
    const [unten] = pult([block(1, { bpm: drill.startBpm - 20 })])
    expect(unten.stellung).toBe(0)
  })

  it("hat höchstens so viele Kanäle, wie aufs Pult passen — zuletzt Gespieltes zuerst", () => {
    const ids = Object.keys(ALLE_DRILLS_BY_ID).slice(0, KANAELE_HOECHSTENS + 3)
    const kanaele = pult(ids.map((drillId, i) => block(i, { drillId, bpm: ALLE_DRILLS_BY_ID[drillId].startBpm })))
    expect(kanaele).toHaveLength(KANAELE_HOECHSTENS)
    expect(kanaele[0].drillId).toBe(ids[0])
  })
})
