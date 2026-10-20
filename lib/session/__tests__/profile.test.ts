import { describe, expect, it } from "vitest"
import { buildSession, priorityOf } from "../builder"
import { DRILLS, DRILLS_BY_ID } from "../drills"
import { focusBonus, makeProfile, startBpmFor, tempoScaleOf } from "../profile"
import { nextBpm, progressFor } from "../progress"
import type { PracticeLog } from "../types"

const EMPTY: PracticeLog = { version: 1, results: [] }
const NOW = new Date("2026-03-10T21:00:00")
const fixed = () => 0

describe("tempoScaleOf", () => {
  it("is neutral without a profile", () => {
    expect(tempoScaleOf(null)).toBe(1)
  })

  it("goes down for a beginner and up for someone who plays", () => {
    expect(tempoScaleOf(makeProfile("anfang", "beides"))).toBeLessThan(1)
    expect(tempoScaleOf(makeProfile("laeuft", "beides"))).toBeGreaterThan(1)
  })
})

describe("startBpmFor", () => {
  const drill = DRILLS_BY_ID["tech-downpicking"]

  it("uses the catalogue value without a profile", () => {
    expect(startBpmFor(drill, null)).toBe(drill.startBpm)
  })

  it("lands on a tempo a metronome can be set to", () => {
    for (const level of ["anfang", "wieder", "laeuft"] as const) {
      expect(startBpmFor(drill, makeProfile(level, "beides")) % 5).toBe(0)
    }
  })

  it("never drops below a playable floor", () => {
    for (const candidate of DRILLS) {
      expect(startBpmFor(candidate, makeProfile("anfang", "beides"))).toBeGreaterThanOrEqual(40)
    }
  })

  it("reaches the drill's target only through practice, never through the answer", () => {
    for (const candidate of DRILLS) {
      expect(startBpmFor(candidate, makeProfile("laeuft", "beides"))).toBeLessThan(candidate.targetBpm)
    }
  })
})

describe("nextBpm with a profile", () => {
  const drill = DRILLS_BY_ID["tech-gallop"]

  it("opens at the player's tempo, not the catalogue's", () => {
    const profile = makeProfile("laeuft", "beides")
    expect(nextBpm(drill, progressFor(EMPTY, drill.id), profile)).toBe(startBpmFor(drill, profile))
  })

  it("stops mattering once there is history — the log takes over", () => {
    const log: PracticeLog = {
      version: 1,
      results: [
        { drillId: drill.id, technique: drill.technique, bpm: 120, rating: 3, seconds: 300, at: NOW.toISOString() },
      ],
    }
    const anfang = nextBpm(drill, progressFor(log, drill.id), makeProfile("anfang", "beides"))
    const laeuft = nextBpm(drill, progressFor(log, drill.id), makeProfile("laeuft", "beides"))
    expect(anfang).toBe(laeuft)
  })
})

describe("focusBonus", () => {
  it("is zero without a profile or with a balanced one", () => {
    const drill = DRILLS_BY_ID["tech-gallop"]
    expect(focusBonus(drill, null)).toBe(0)
    expect(focusBonus(drill, makeProfile("wieder", "beides"))).toBe(0)
  })

  it("lifts rhythm drills for a rhythm focus and lead drills for lead", () => {
    expect(focusBonus(DRILLS_BY_ID["tech-gallop"], makeProfile("wieder", "rhythmus"))).toBeGreaterThan(0)
    expect(focusBonus(DRILLS_BY_ID["tech-pentatonic-box"], makeProfile("wieder", "lead"))).toBeGreaterThan(0)
  })

  it("leaves the warm-up alone — it is nobody's focus", () => {
    expect(focusBonus(DRILLS_BY_ID["warmup-chromatic"], makeProfile("wieder", "lead"))).toBe(0)
  })

  it("nudges rather than filters — the other side stays reachable", () => {
    // Ein Zuschlag, kein Ausschluss: wer Lead will, soll trotzdem an die
    // rechte Hand kommen, nur später.
    const lead = makeProfile("wieder", "lead")
    expect(priorityOf(DRILLS_BY_ID["tech-gallop"], EMPTY, NOW, lead)).toBeGreaterThan(0)
  })
})

describe("buildSession with a focus", () => {
  // Geprüft wird der Zuschlag, nicht eine abgeschriebene Liste von Techniken:
  // die ging veraltet, sobald der Katalog eine neue Technik bekam, und meldete
  // dann einen Fehler in der Auswahl statt in sich selbst.
  it("opens a lead player on lead work", () => {
    const profile = makeProfile("wieder", "lead")
    const plan = buildSession(EMPTY, { now: NOW, random: fixed, profile })
    const technique = plan.blocks.find((block) => block.drill.kind === "technique")!
    expect(focusBonus(technique.drill, profile), technique.drill.id).toBeGreaterThan(0)
  })

  it("opens a rhythm player on the right hand", () => {
    const profile = makeProfile("wieder", "rhythmus")
    const plan = buildSession(EMPTY, { now: NOW, random: fixed, profile })
    const technique = plan.blocks.find((block) => block.drill.kind === "technique")!
    expect(focusBonus(technique.drill, profile), technique.drill.id).toBeGreaterThan(0)
  })

  it("teilt jede Technik genau einem Schwerpunkt zu", () => {
    // Ein Drill, den weder Rhythmus noch Lead beansprucht, bekäme für keinen
    // Schwerpunkt einen Zuschlag und käme bei beiden zuletzt.
    for (const drill of DRILLS) {
      if (drill.kind === "warmup") continue
      const rhythmus = focusBonus(drill, makeProfile("wieder", "rhythmus"))
      const lead = focusBonus(drill, makeProfile("wieder", "lead"))
      expect(Math.max(rhythmus, lead), drill.id).toBeGreaterThan(0)
    }
  })

  it("carries the scaled tempo into the blocks", () => {
    const profile = makeProfile("laeuft", "beides")
    const plan = buildSession(EMPTY, { now: NOW, random: fixed, profile })
    for (const block of plan.blocks) {
      expect(block.bpm).toBe(startBpmFor(block.drill, profile))
    }
  })

  it("still produces a full session without any profile", () => {
    const plan = buildSession(EMPTY, { now: NOW, random: fixed })
    expect(plan.blocks.map((block) => block.drill.kind)).toEqual(["warmup", "technique", "riff", "technique", "riff"])
  })
})
