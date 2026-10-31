import { describe, expect, it } from "vitest"
import { ausgangsLog, ergebnisseSeit, sessionStandSchema, stehtNoch, type SessionStand } from "../session-stand"
import type { DrillResult, PracticeLog } from "../types"

const jetzt = new Date(2026, 9, 30, 19, 30, 0)
const stand: SessionStand = {
  version: 1,
  tag: "2026-10-30",
  minutes: 15,
  startedAt: new Date(2026, 9, 30, 19, 0, 0).toISOString(),
  current: 3,
  erledigteEinschuebe: [1],
  beantworteteFragen: 2,
  carried: {},
}

function eintrag(at: Date): DrillResult {
  return { drillId: "tech-downpicking", technique: "downpicking", bpm: 90, rating: 3, seconds: 180, at: at.toISOString() }
}

describe("stehtNoch", () => {
  it("gilt am selben Tag für dieselbe Anfrage", () => {
    expect(stehtNoch(stand, { minutes: 15, jetzt })).toBe(true)
  })

  it("gilt nicht ohne Fortschritt, an einem anderen Tag oder für eine andere Anfrage", () => {
    expect(stehtNoch({ ...stand, current: 0 }, { minutes: 15, jetzt })).toBe(false)
    expect(stehtNoch(stand, { minutes: 15, jetzt: new Date(2026, 9, 31, 8, 0, 0) })).toBe(false)
    expect(stehtNoch(stand, { minutes: 25, jetzt })).toBe(false)
    expect(stehtNoch(stand, { minutes: 15, drillId: "x", jetzt })).toBe(false)
    expect(stehtNoch(null, { minutes: 15, jetzt })).toBe(false)
  })
})

describe("ausgangsLog und ergebnisseSeit", () => {
  const frueh = eintrag(new Date(2026, 9, 29, 20, 0, 0))
  const dazu = eintrag(new Date(2026, 9, 30, 19, 5, 0))
  const log: PracticeLog = { version: 1, results: [frueh, dazu] }

  it("trennt den Log in Stand vor dem Start und das, was seither dazukam", () => {
    expect(ausgangsLog(log, stand.startedAt).results).toEqual([frueh])
    expect(ergebnisseSeit(log, stand.startedAt)).toEqual([dazu])
  })

  it("lässt den Log selbst unverändert", () => {
    ausgangsLog(log, stand.startedAt)
    expect(log.results).toHaveLength(2)
  })
})

describe("Gitarren im Stand", () => {
  it("nimmt die gewürfelten Gitarren mit, auch die leeren Stellen", () => {
    const mit = { ...stand, gitarren: [null, "Solar S-Type", "Solar S-Type"] }
    expect(sessionStandSchema.parse(mit).gitarren).toEqual([null, "Solar S-Type", "Solar S-Type"])
  })

  it("lässt einen Stand von vor der Roulette gültig", () => {
    expect(sessionStandSchema.safeParse(stand).success).toBe(true)
  })
})
