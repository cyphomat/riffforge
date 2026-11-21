import { describe, expect, it } from "vitest"
import { ALLE_DRILLS_BY_ID } from "../drills"
import { zugabeRiff } from "../zugabe"
import { pruefeSong } from "@/lib/theory/song"
import type { DrillResult } from "../types"

const mitNoten = Object.values(ALLE_DRILLS_BY_ID).find((d) => d.song)!
const ohneNoten = ALLE_DRILLS_BY_ID["riff-ironclad"]

const ergebnis = (id: string, at: string, bpm = 70): DrillResult => ({ drillId: id, technique: "pentatonic", bpm, rating: 3, seconds: 150, at })

describe("Die Zugabe", () => {
  it("spielt den zuletzt geübten Song der Session, im geübten Tempo", () => {
    const z = zugabeRiff([ergebnis(mitNoten.id, "2026-11-20T18:00:00", 65), ergebnis(ohneNoten.id, "2026-11-20T18:05:00")], "2026-11-20")
    expect(z).toMatchObject({ titel: mitNoten.title, bpm: 65, herkunft: "session" })
  })

  it("greift auf ein Advents-Riff zurück, wenn kein Block Noten hatte", () => {
    const z = zugabeRiff([ergebnis(ohneNoten.id, "2026-11-20T18:00:00")], "2026-11-20")
    expect(z.herkunft).toBe("advent")
    expect(pruefeSong(z.song)).toEqual([])
    expect(z.bpm).toBeGreaterThan(40)
  })

  it("wählt am selben Tag dasselbe Riff und über die Tage verschiedene", () => {
    const tag = (d: string) => zugabeRiff([], d).titel
    expect(tag("2026-12-05")).toBe(tag("2026-12-05"))
    expect(new Set(["2026-12-01", "2026-12-02", "2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06"].map(tag)).size).toBeGreaterThan(1)
  })

  it("kommt ohne Ergebnisse aus", () => {
    expect(zugabeRiff([], "2026-11-20").song.noten.length).toBeGreaterThan(0)
  })
})
