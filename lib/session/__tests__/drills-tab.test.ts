import { describe, expect, it } from "vitest"
import { ALLE_DRILLS_BY_ID, DRILLS_BY_ID } from "../drills"

/**
 * How many characters a hand-written tab may be wide.
 *
 * `TabView` scales its type with the viewport (4vw - 3.3px, between 9.5 and
 * 12.5px). Measured in the browser: the box leaves the viewport minus 81 px,
 * a character is 0.6 em wide. At 320 px that is 239 px at 9.5px type — 41
 * characters fit, 42 do not. Wider, and the phone cuts the tab off.
 */
const PASST_AUFS_HANDY = 41

describe("Tabulatur im Drill-Katalog", () => {
  it("ist nie breiter, als auf ein Handy passt", () => {
    // Both catalogues: the seven-string drills show their tab in the same box.
    const zuBreit = Object.values(ALLE_DRILLS_BY_ID)
      .filter((drill) => drill.tab && !drill.song)
      .map((drill) => ({
        id: drill.id,
        breite: Math.max(...drill.tab!.split("\n").map((zeile) => zeile.length)),
      }))
      .filter((eintrag) => eintrag.breite > PASST_AUFS_HANDY)
    expect(zuBreit).toEqual([])
  })

  it("setzt im Chromatic-Warm-up nie zwei Töne in dieselbe Spalte", () => {
    // Two systems of six strings each. A digit on two strings in one column
    // reads as two notes struck together — the exercise is one at a time.
    const systeme = DRILLS_BY_ID["warmup-chromatic"].tab!.split("\n\n")
    expect(systeme).toHaveLength(2)
    for (const system of systeme) {
      const zeilen = system.split("\n")
      expect(zeilen).toHaveLength(6)
      const breite = zeilen[0].length
      expect(zeilen.every((zeile) => zeile.length === breite)).toBe(true)
      for (let spalte = 2; spalte < breite; spalte += 1) {
        const toene = zeilen.filter((zeile) => /\d/.test(zeile[spalte])).length
        expect(toene).toBeLessThanOrEqual(1)
      }
      // Twelve notes per system: 1-2-3-4 on three strings.
      expect(system.match(/\d/g)).toHaveLength(12)
    }
  })
})
