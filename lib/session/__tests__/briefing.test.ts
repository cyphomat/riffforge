import { describe, expect, it } from "vitest"
import { briefingFor } from "../briefing"
import { DRILLS_BY_ID } from "../drills"
import type { DrillResult, PracticeLog, Rating } from "../types"

const NOW = new Date("2026-03-10T21:00:00")

function on(day: string, drillId = "tech-downpicking", rating: Rating = 3, bpm = 100): DrillResult {
  return {
    drillId,
    technique: DRILLS_BY_ID[drillId].technique,
    bpm,
    rating,
    seconds: 300,
    at: new Date(`${day}T20:00:00`).toISOString(),
  }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("briefingFor", () => {
  it("greets an empty log without pretending to know anything", () => {
    const briefing = briefingFor(log(), NOW)
    expect(briefing.tone).toBe("erste")
    expect(briefing.line).toBe("Erste Session")
  })

  it("names the length of a break", () => {
    const briefing = briefingFor(log(on("2026-02-24")), NOW)
    expect(briefing.tone).toBe("zurueck")
    expect(briefing.line).toContain("14 Tagen")
  })

  it("lets one wobbly block set the tone over three clean ones", () => {
    const briefing = briefingFor(
      log(
        on("2026-03-09", "warmup-chromatic", 4),
        on("2026-03-09", "tech-gallop", 2, 95),
        on("2026-03-09", "riff-ironclad", 3),
      ),
      NOW,
    )
    expect(briefing.tone).toBe("technik")
    expect(briefing.reason).toContain("Gallop")
    expect(briefing.reason).toContain("95 BPM")
  })

  it("distinguishes rough from wobbly in the wording", () => {
    const rough = briefingFor(log(on("2026-03-09", "tech-gallop", 1)), NOW)
    const wobbly = briefingFor(log(on("2026-03-09", "tech-gallop", 2)), NOW)
    expect(rough.reason).toContain("zäh")
    expect(wobbly.reason).toContain("wackelig")
  })

  it("goes hard once a streak is running and nothing wobbled", () => {
    // Drei Wochen in Folge, je einmal — gezählt wird Regelmässigkeit.
    const briefing = briefingFor(
      log(on("2026-02-25"), on("2026-03-04"), on("2026-03-10", "tech-gallop", 3, 120)),
      NOW,
    )
    expect(briefing.tone).toBe("hart")
    expect(briefing.reason).toContain("3 Wochen in Folge")
  })

  it("does not go hard on three days in one week", () => {
    // Drei Abende am Stück sind ein Wochenende, noch keine Gewohnheit.
    const briefing = briefingFor(
      log(on("2026-03-08"), on("2026-03-09"), on("2026-03-10", "tech-gallop", 3, 120)),
      NOW,
    )
    expect(briefing.tone).toBe("solide")
  })

  it("does not go hard on a streak that had a bad block", () => {
    const briefing = briefingFor(
      log(on("2026-02-25"), on("2026-03-04"), on("2026-03-10", "tech-gallop", 1)),
      NOW,
    )
    expect(briefing.tone).toBe("technik")
  })

  it("calls yesterday evening yesterday, not today", () => {
    // Zwoelf Stunden her, aber ein anderer Kalendertag.
    const morning = new Date("2026-03-10T08:00:00")
    expect(briefingFor(log(on("2026-03-09", "tech-gallop", 3, 110)), morning).line).toBe(
      "Weiter im Text",
    )
  })

  it("says nochmal only for a second session on the same day", () => {
    expect(briefingFor(log(on("2026-03-10", "tech-gallop", 3, 110)), NOW).line).toBe("Nochmal")
  })

  it("falls back to steady progress", () => {
    const briefing = briefingFor(log(on("2026-03-09", "tech-gallop", 3, 110)), NOW)
    expect(briefing.tone).toBe("solide")
    expect(briefing.reason).toContain("110 BPM")
  })

  it("only looks at the most recent day, not the whole history", () => {
    // Ein zäher Block vor Wochen darf den heutigen Ton nicht mehr bestimmen.
    const briefing = briefingFor(log(on("2026-02-01", "tech-gallop", 1), on("2026-03-09")), NOW)
    expect(briefing.tone).not.toBe("technik")
  })

  it("skips the warm-up when naming what carried the session", () => {
    const briefing = briefingFor(log(on("2026-03-09", "warmup-chromatic", 3, 60), on("2026-03-09", "tech-gallop", 3, 130)), NOW)
    expect(briefing.reason).toContain("Gallop")
  })

  it("always says something, whatever the log looks like", () => {
    for (const entries of [log(), log(on("2026-03-10")), log(on("2026-01-01", "riff-escape", 1))]) {
      const briefing = briefingFor(entries, NOW)
      expect(briefing.line.length).toBeGreaterThan(0)
      expect(briefing.reason.length).toBeGreaterThan(0)
    }
  })
})
