import { describe, expect, it } from "vitest"
import { GEUEBT_TAGE, STAUB_TAGE, aussehenFuer, gurtRiffs, hash } from "../gurt"
import { ALLE_DRILLS_BY_ID } from "../drills"
import type { PracticeLog } from "../types"

/**
 * Der Gurt: aus dem Log, ohne Zufall. Alle Logs hier sind erfunden.
 */

const RIFF = ALLE_DRILLS_BY_ID["riff-ironclad"]

function log(...eintraege: Array<[string, number, 1 | 2 | 3 | 4]>): PracticeLog {
  return {
    version: 1,
    results: eintraege.map(([tag, bpm, rating]) => ({
      drillId: RIFF.id,
      technique: RIFF.technique,
      bpm,
      rating,
      seconds: 150,
      at: `${tag}T12:00:00`,
    })),
  }
}

const slot = (l: PracticeLog, heute = "2026-11-20") => gurtRiffs(l, heute).find((s) => s.drillId === RIFF.id)!

describe("hash und Aussehen", () => {
  it("ist stabil und hängt nur an der ID", () => {
    expect(hash("riff-ironclad")).toBe(hash("riff-ironclad"))
    expect(aussehenFuer("riff-ironclad")).toEqual(aussehenFuer("riff-ironclad"))
  })
  it("liefert gültige Farben und Formen", () => {
    for (const id of ["a", "riff-x", "7-riff-y", "riff-ironclad"]) {
      const a = aussehenFuer(id)
      expect(a.farbe).toMatch(/^#[0-9a-f]{6}$/)
      expect(["std", "jazz", "tri"]).toContain(a.form)
    }
  })
})

describe("Riff-Plektren", () => {
  it("ein leerer Log verdient nichts", () => {
    const s = gurtRiffs({ version: 1, results: [] }, "2026-11-20")
    expect(s.length).toBeGreaterThan(0)
    expect(s.every((x) => !x.verdient && x.seit === null)).toBe(true)
  })

  it("verlangt drei verschiedene Tage mit Sauber oder besser", () => {
    expect(slot(log(["2026-11-01", 80, 3], ["2026-11-01", 85, 4], ["2026-11-02", 80, 3])).verdient).toBe(false)
    const s = slot(log(["2026-11-01", 80, 3], ["2026-11-02", 80, 4], ["2026-11-04", 80, 3]))
    expect(GEUEBT_TAGE).toBe(3)
    expect(s.verdient).toBe(true)
    expect(s.seit).toBe("2026-11-04")
  })

  it("zählt Zäh und Wackelig nicht", () => {
    expect(slot(log(["2026-11-01", 80, 3], ["2026-11-02", 80, 2], ["2026-11-03", 80, 1], ["2026-11-04", 80, 3])).verdient).toBe(false)
  })

  it("ignoriert Einträge mit kaputtem Datum und fremde Drills", () => {
    const l = log(["2026-11-01", 80, 3])
    l.results.push({ ...l.results[0], at: "kaputt" }, { ...l.results[0], drillId: "gibt-es-nicht", at: "2026-11-02T12:00:00" })
    expect(slot(l).spieltage).toBe(1)
  })

  it("macht ein Plektrum aus Metall, wenn das Zieltempo sauber stand", () => {
    const tage: Array<[string, number, 1 | 2 | 3 | 4]> = [
      ["2026-11-01", RIFF.targetBpm, 3],
      ["2026-11-02", 70, 3],
      ["2026-11-03", 70, 3],
    ]
    expect(slot(log(...tage)).aussehen.material).toBe("metall")
    expect(slot(log(["2026-11-01", 70, 3], ["2026-11-02", 70, 3], ["2026-11-03", 70, 3])).aussehen.material).toBeUndefined()
  })

  it("patina wächst mit den Spieltagen", () => {
    const tage = (n: number) =>
      Array.from({ length: n }, (_, i): [string, number, 1 | 2 | 3 | 4] => [`2026-10-${String(i + 1).padStart(2, "0")}`, 80, 3])
    expect(slot(log(...tage(5)), "2026-10-30").patina).toBe(0)
    expect(slot(log(...tage(10)), "2026-10-30").patina).toBe(1)
    expect(slot(log(...tage(25)), "2026-10-30").patina).toBe(2)
  })

  it("staub setzt sich nach einer langen Pause und geht mit dem nächsten Spielen", () => {
    const l = log(["2026-09-01", 80, 3], ["2026-09-02", 80, 3], ["2026-09-03", 80, 3])
    expect(slot(l, "2026-09-03").staubig).toBe(false)
    expect(slot(l, `2026-10-${String(3 + 1).padStart(2, "0")}`).staubig).toBe(true) // 31 Tage
    expect(STAUB_TAGE).toBe(30)
    l.results.push({ ...l.results[0], at: "2026-10-20T12:00:00" })
    expect(slot(l, "2026-10-25").staubig).toBe(false)
  })

  it("ein offenes Plektrum wird nie staubig", () => {
    expect(slot(log(["2026-01-01", 80, 3]), "2026-11-20").staubig).toBe(false)
  })

  it("verdiente stehen vorn, nach Datum", () => {
    const s = gurtRiffs(log(["2026-11-01", 80, 3], ["2026-11-02", 80, 3], ["2026-11-03", 80, 3]), "2026-11-20")
    expect(s[0].drillId).toBe(RIFF.id)
    expect(s[0].verdient).toBe(true)
    expect(s.slice(1).every((x) => !x.verdient)).toBe(true)
  })

  it("ändert den Log nicht", () => {
    const l = log(["2026-11-01", 80, 3])
    const vorher = JSON.stringify(l)
    gurtRiffs(l, "2026-11-20")
    expect(JSON.stringify(l)).toBe(vorher)
  })
})
