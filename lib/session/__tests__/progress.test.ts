import { describe, expect, it } from "vitest"
import { DRILLS, DRILLS_BY_ID } from "../drills"
import { startBpmFor, type Profile } from "../profile"
import {
  bpmStepFor,
  dayKey,
  daysPractisedInLast,
  floorBpmFor,
  masteryOf,
  nextBpm,
  progressFor,
  streakWeeks,
  weekKey,
} from "../progress"
import { drillResultSchema, type DrillResult, type PracticeLog, type Rating } from "../types"

const DRILL = DRILLS_BY_ID["tech-downpicking"]

function result(overrides: Partial<DrillResult> = {}): DrillResult {
  return {
    drillId: DRILL.id,
    technique: DRILL.technique,
    bpm: 100,
    rating: 3,
    seconds: 300,
    at: new Date("2026-03-10T20:00:00").toISOString(),
    ...overrides,
  }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("nextBpm", () => {
  it("opens at the drill's start tempo with no history", () => {
    expect(nextBpm(DRILL, progressFor(log(), DRILL.id))).toBe(DRILL.startBpm)
  })

  const SCHRITT = bpmStepFor(DRILL)
  const cases: Array<[Rating, number]> = [
    [4, 100 + SCHRITT * 2],
    [3, 100 + SCHRITT],
    [2, 100],
    [1, 100 - SCHRITT],
  ]

  it.each(cases)("moves the tempo per rating %i", (rating, expected) => {
    const state = progressFor(log(result({ rating, bpm: 100 })), DRILL.id)
    expect(nextBpm(DRILL, state)).toBe(expected)
  })

  it("misst den Schritt am Ziel, nicht in festen BPM", () => {
    // Der eigentliche Punkt der Umstellung: derselbe Anteil, verschiedene BPM.
    // Fünf Schritte waren auf einem 190er-Ziel 2,6 % und auf einem 100er 5 %.
    expect(bpmStepFor(DRILLS_BY_ID["tech-downpicking"])).toBe(8) // Ziel 190
    expect(bpmStepFor(DRILLS_BY_ID["tech-bending"])).toBe(4) // Ziel 100
  })

  it("nimmt auf jedem Drill denselben relativen Schritt", () => {
    for (const drill of DRILLS) {
      const anteil = bpmStepFor(drill) / drill.targetBpm
      expect(anteil, drill.id).toBeGreaterThan(0.03)
      expect(anteil, drill.id).toBeLessThan(0.055)
    }
  })

  it("fällt nie unter ein Tempo, bei dem das noch dieser Drill ist", () => {
    const state = progressFor(log(result({ rating: 1, bpm: 40 })), DRILL.id)
    expect(nextBpm(DRILL, state)).toBe(floorBpmFor(DRILL))
  })

  it("hält den Boden unter jedem Starttempo, das ein Profil erzeugen kann", () => {
    // Sonst schöbe eine zähe Runde einen Anfänger nach *oben*.
    for (const drill of DRILLS) {
      expect(floorBpmFor(drill), drill.id).toBeLessThanOrEqual(drill.startBpm * 0.8)
    }
  })

  it("bleibt in dem, was der Log überhaupt aufnehmen kann", () => {
    // Ein bpm über 300 fällt durchs Schema — und legt beim nächsten Lesen den
    // *ganzen* Log beiseite, nicht nur diesen Eintrag.
    const state = progressFor(log(result({ rating: 4, bpm: 300 })), DRILL.id)
    expect(() =>
      drillResultSchema.parse(result({ bpm: nextBpm(DRILL, state) })),
    ).not.toThrow()
  })

  it("follows the most recent round, not the best one", () => {
    const state = progressFor(
      log(
        result({ bpm: 160, rating: 3, at: "2026-03-01T20:00:00.000Z" }),
        result({ bpm: 120, rating: 1, at: "2026-03-09T20:00:00.000Z" }),
      ),
      DRILL.id,
    )
    expect(nextBpm(DRILL, state)).toBe(120 - SCHRITT)
  })
})

describe("progressFor", () => {
  it("counts only clean rounds towards the best tempo", () => {
    const state = progressFor(log(result({ bpm: 180, rating: 2 }), result({ bpm: 110, rating: 3 })), DRILL.id)
    expect(state.bestBpm).toBe(110)
  })

  it("reports no best tempo when nothing was ever clean", () => {
    expect(progressFor(log(result({ rating: 1 })), DRILL.id).bestBpm).toBeNull()
  })
})

describe("bestTimingScore", () => {
  const timing = (score: number) => ({
    hits: 8, expected: 8, spreadMs: 10, offsetMs: 20, score, trend: "steady" as const,
  })

  it("is null when the microphone was never used for that drill", () => {
    expect(progressFor(log(result()), DRILL.id).bestTimingScore).toBeNull()
  })

  it("keeps the best measured score, not the latest", () => {
    const entries = log(
      result({ timing: timing(88), at: "2026-03-01T20:00:00.000Z" }),
      result({ timing: timing(54), at: "2026-03-09T20:00:00.000Z" }),
    )
    expect(progressFor(entries, DRILL.id).bestTimingScore).toBe(88)
  })

  it("ignores rounds played without the microphone", () => {
    const entries = log(result(), result({ timing: timing(71) }))
    expect(progressFor(entries, DRILL.id).bestTimingScore).toBe(71)
  })
})

describe("masteryOf", () => {
  it("is 0 untouched and 1 at target tempo", () => {
    expect(masteryOf(DRILL, progressFor(log(), DRILL.id))).toBe(0)
    const owned = progressFor(log(result({ bpm: DRILL.targetBpm, rating: 3 })), DRILL.id)
    expect(masteryOf(DRILL, owned)).toBe(1)
  })

  it("does not exceed 1 past the target", () => {
    const state = progressFor(log(result({ bpm: DRILL.targetBpm + 40, rating: 4 })), DRILL.id)
    expect(masteryOf(DRILL, state)).toBe(1)
  })

  it("beginnt bei null — beim Tempo, bei dem dieser Spieler angefangen hat", () => {
    // Vorher stand ein Wiedereinsteiger nach der ersten sauberen Runde bei
    // einem Viertel, ohne es erspielt zu haben: sein Starttempo ist 1,25-mal
    // das des Katalogs, gemessen wurde aber ab dem des Katalogs.
    const laeuft: Profile = {
      version: 1,
      experience: "laeuft",
      focus: "beides",
      at: new Date().toISOString(),
    }
    const von = startBpmFor(DRILL, laeuft)
    const state = progressFor(log(result({ bpm: von, rating: 3 })), DRILL.id)

    expect(masteryOf(DRILL, state, laeuft)).toBe(0)
    // Ohne Profil bleibt es beim alten Wert — bestehende Anzeigen springen nicht.
    expect(masteryOf(DRILL, state)).toBeGreaterThan(0.2)
  })

  it("öffnet jeden Drill ohne Profil genau beim Katalogwert", () => {
    // Daran hängt, dass die Umstellung für alle ohne Profil folgenlos ist.
    for (const drill of DRILLS) expect(startBpmFor(drill, null), drill.id).toBe(drill.startBpm)
  })
})

describe("streakWeeks", () => {
  // Dienstag. Die Woche davor beginnt am Montag, dem 2. März.
  const now = new Date("2026-03-10T21:00:00")
  const on = (day: string) => result({ at: new Date(`${day}T20:00:00`).toISOString() })

  it("is 0 with no history", () => {
    expect(streakWeeks(log(), now)).toBe(0)
  })

  it("puts Monday and Sunday into the same week", () => {
    expect(weekKey(new Date("2026-03-09T08:00:00"))).toBe("2026-03-09")
    expect(weekKey(new Date("2026-03-15T23:30:00"))).toBe("2026-03-09")
    expect(weekKey(new Date("2026-03-16T00:30:00"))).toBe("2026-03-16")
  })

  it("counts consecutive weeks with practice, ending this week", () => {
    expect(streakWeeks(log(on("2026-02-24"), on("2026-03-04"), on("2026-03-10")), now)).toBe(3)
  })

  it("does not break on a missed day — that was the point", () => {
    // Montag und Donnerstag der einen, Dienstag der anderen Woche: in Tagen
    // gezählt wäre das zweimal gerissen.
    expect(streakWeeks(log(on("2026-03-02"), on("2026-03-05"), on("2026-03-10")), now)).toBe(2)
  })

  it("does not write off this week before it is over", () => {
    // Diese Woche noch nichts — die Serie der Vorwochen steht trotzdem.
    expect(streakWeeks(log(on("2026-02-24"), on("2026-03-03")), now)).toBe(2)
  })

  it("breaks once a whole week is missed", () => {
    expect(streakWeeks(log(on("2026-02-17"), on("2026-02-24")), now)).toBe(0)
  })

  it("counts a week once no matter how much it holds", () => {
    expect(streakWeeks(log(on("2026-03-09"), on("2026-03-10"), on("2026-03-10")), now)).toBe(1)
  })
})

describe("daysPractisedInLast", () => {
  const now = new Date("2026-03-10T21:00:00")
  const on = (day: string) => result({ at: new Date(`${day}T20:00:00`).toISOString() })

  it("counts distinct days inside the window", () => {
    // A 7-day window ending on the 10th opens on the 4th, so all three days count.
    const entries = log(on("2026-03-04"), on("2026-03-08"), on("2026-03-08"), on("2026-03-10"))
    expect(daysPractisedInLast(entries, 7, now)).toBe(3)
  })

  it("ignores days that fall outside the window", () => {
    const entries = log(on("2026-03-03"), on("2026-03-10"))
    expect(daysPractisedInLast(entries, 7, now)).toBe(1)
  })
})

describe("dayKey", () => {
  it("uses local time so a late session counts for that day", () => {
    expect(dayKey(new Date(2026, 2, 10, 23, 50))).toBe("2026-03-10")
  })
})
