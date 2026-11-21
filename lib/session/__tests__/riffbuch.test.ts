import { describe, expect, it } from "vitest"
import { ALLE_RIFFE, LEERES_BUCH, buchStand, gehoert, riffbuchSchema } from "../riffbuch"

describe("Das Riffbuch", () => {
  it("kennt jedes Riff genau einmal: Songs und Advents-Riffe", () => {
    const ids = ALLE_RIFFE.map((r) => r.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ALLE_RIFFE.some((r) => r.herkunft === "song")).toBe(true)
    expect(ALLE_RIFFE.some((r) => r.herkunft === "advent")).toBe(true)
  })

  it("trägt ein Riff ein und lässt das erste Datum stehen", () => {
    const id = ALLE_RIFFE[0].id
    const eins = gehoert(LEERES_BUCH, id, new Date("2026-12-01T10:00:00Z"))
    const zwei = gehoert(eins, id, new Date("2026-12-09T10:00:00Z"))
    expect(zwei).toBe(eins)
    expect(zwei.gehoert[id]).toBe("2026-12-01T10:00:00.000Z")
  })

  it("ändert das alte Buch nicht und nimmt nichts Unbekanntes", () => {
    expect(gehoert(LEERES_BUCH, "nein")).toBe(LEERES_BUCH)
    gehoert(LEERES_BUCH, ALLE_RIFFE[0].id)
    expect(LEERES_BUCH.gehoert).toEqual({})
  })

  it("zählt, was gehört ist und was noch offen ist, in der Reihenfolge des Hörens", () => {
    let b = LEERES_BUCH
    b = gehoert(b, ALLE_RIFFE[2].id, new Date("2026-12-03T10:00:00Z"))
    b = gehoert(b, ALLE_RIFFE[1].id, new Date("2026-12-02T10:00:00Z"))
    const stand = buchStand(b)
    expect(stand.gehoert.map((r) => r.id)).toEqual([ALLE_RIFFE[1].id, ALLE_RIFFE[2].id])
    expect(stand.offen).toBe(ALLE_RIFFE.length - 2)
  })

  it("prüft das Datum im Schema", () => {
    expect(riffbuchSchema.safeParse({ gehoert: { a: "2026-12-01T10:00:00Z" } }).success).toBe(true)
    expect(riffbuchSchema.safeParse({ gehoert: { a: "gestern" } }).success).toBe(false)
  })
})
