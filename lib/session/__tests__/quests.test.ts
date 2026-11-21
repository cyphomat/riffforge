import { describe, expect, it } from "vitest"
import { ALLE_DRILLS_BY_ID } from "../drills"
import { AMPS_BY_ID, PEDALE_BY_ID } from "../board-daten"
import { ALLE_QUESTS, besitz, fortschritt, questStand } from "../quests"
import { QUESTS, questSchema } from "../quests-daten"
import type { PracticeLog } from "../types"
import type { TheoryLog } from "@/lib/theory/types"

/** Alle Logs hier sind erfunden. */

const RIFF = ALLE_DRILLS_BY_ID["riff-ironclad"]
const JETZT = new Date("2026-12-10T12:00:00")
const LEER: TheoryLog = { version: 1, answers: [] }

function log(...e: Array<[string, 1 | 2 | 3 | 4, number?]>): PracticeLog {
  return {
    version: 1,
    results: e.map(([tag, rating, bpm], i) => ({
      drillId: RIFF.id,
      technique: RIFF.technique,
      bpm: bpm ?? 80,
      rating,
      seconds: 150,
      at: `${tag}T12:${`${i % 60}`.padStart(2, "0")}:00`,
    })),
  }
}
const tage = (n: number) => Array.from({ length: n }, (_, i) => [`2026-11-${`${i + 1}`.padStart(2, "0")}`, 3] as [string, 3])
const wissen = (n: number): TheoryLog => ({
  version: 1,
  answers: Array.from({ length: n }, (_, i) => ({ cardId: `k${i}`, grade: 3 as const, correct: true, at: "2026-11-18T10:00:00" })) as TheoryLog["answers"],
})

describe("Die Quests", () => {
  it("sind gültig, eindeutig und belohnen nur Stücke, die es gibt", () => {
    const ids = ALLE_QUESTS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const q of QUESTS) {
      questSchema.parse(q)
      const tabelle = q.lohn.art === "pedal" ? PEDALE_BY_ID : AMPS_BY_ID
      expect(tabelle[q.lohn.id], `${q.id} → ${q.lohn.id}`).toBeDefined()
    }
  })

  it("belohnen jedes Stück nur einmal", () => {
    const lohn = QUESTS.map((q) => q.lohn.id)
    expect(new Set(lohn).size).toBe(lohn.length)
  })

  it("lassen nichts Gekauftes zu: jedes Stück außer dem Start ist eine Quest", () => {
    const start = new Set(["fx-overdrive", "amp-uebungscombo"])
    const ausser = [...Object.keys(PEDALE_BY_ID), ...Object.keys(AMPS_BY_ID)].filter((id) => !start.has(id))
    expect(new Set(QUESTS.map((q) => q.lohn.id))).toEqual(new Set(ausser))
  })
})

describe("Fortschritt", () => {
  it("zählt Übungstage, nicht Blöcke", () => {
    expect(fortschritt("uebungstage", log(["2026-11-02", 3], ["2026-11-02", 3], ["2026-11-03", 3]), LEER, JETZT)).toBe(2)
  })

  it("zählt Wochen, saubere Blöcke und Wissen", () => {
    const l = log(["2026-11-02", 3], ["2026-11-03", 2], ["2026-11-10", 4])
    expect(fortschritt("wochen", l, LEER, JETZT)).toBe(2)
    expect(fortschritt("saubere_bloecke", l, LEER, JETZT)).toBe(2)
    expect(fortschritt("wissen_richtig", l, wissen(7), JETZT)).toBe(7)
  })

  it("zählt Riffe im Zieltempo einmal je Riff", () => {
    const l = log(["2026-11-02", 3, RIFF.targetBpm], ["2026-11-03", 4, RIFF.targetBpm + 5], ["2026-11-04", 2, RIFF.targetBpm])
    expect(fortschritt("ziel_riffe", l, LEER, JETZT)).toBe(1)
  })
})

describe("Besitz", () => {
  it("ist am Anfang nur der Start", () => {
    const b = besitz(log(), LEER, JETZT)
    expect([...b.pedale]).toEqual(["fx-overdrive"])
    expect([...b.amps]).toEqual(["amp-uebungscombo"])
  })

  it("wächst mit erfüllten Quests: fünf Tage geben den Chorus", () => {
    const b = besitz(log(...tage(5)), LEER, JETZT)
    expect(b.pedale.has("fx-chorus")).toBe(true)
    expect(b.pedale.has("fx-tremolo")).toBe(false)
  })

  it("füllt den Fortschritt nur bis zum Ziel", () => {
    const s = questStand(log(...tage(20)), LEER, JETZT).find((x) => x.quest.id === "quest-aufgewaermt")!
    expect(s.stand).toBe(s.ziel)
    expect(s.erfuellt).toBe(true)
  })

  it("nimmt nichts zurück: ein späterer Log mit mehr Einträgen verliert kein Stück", () => {
    const vorher = besitz(log(...tage(5)), LEER, JETZT)
    const nachher = besitz(log(...tage(5), ["2027-03-01", 1]), LEER, JETZT)
    for (const id of vorher.pedale) expect(nachher.pedale.has(id)).toBe(true)
  })
})
