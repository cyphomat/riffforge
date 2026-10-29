import { describe, expect, it } from "vitest"
import { feld, HEISS, PALETTE, schritt } from "../feuer"

/** Ein fester Zufall, damit der Lauf wiederholbar ist (mulberry32). */
function zufall(seed: number) {
  let a = seed
  return () => {
    a += 0x6d2b79f5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

describe("Pixelfeuer", () => {
  it("hat 37 Stufen, von durchsichtig bis weiss, und wird nie durchsichtiger", () => {
    expect(PALETTE).toHaveLength(37)
    expect(PALETTE[0][3]).toBe(0)
    expect(PALETTE[HEISS]).toEqual([255, 255, 255, 255])
    for (let i = 1; i < PALETTE.length; i += 1) expect(PALETTE[i][3], `Stufe ${i}`).toBeGreaterThanOrEqual(PALETTE[i - 1][3])
  })

  it("zündet unten und lässt die Hitze nach oben abnehmen", () => {
    const f = feld(40, 16)
    const z = zufall(7)
    for (let i = 0; i < 120; i += 1) schritt(f, true, 2, z)
    const mittel = (reihe: number) => f.px.slice(reihe * 40, reihe * 40 + 40).reduce((a, b) => a + b, 0) / 40
    expect(mittel(15)).toBeGreaterThan(HEISS - 4)
    expect(mittel(15)).toBeGreaterThan(mittel(8))
    expect(mittel(8)).toBeGreaterThan(mittel(1))
  })

  it("bleibt in der Palette, egal wie lange es brennt", () => {
    const f = feld(30, 14)
    const z = zufall(3)
    for (let i = 0; i < 300; i += 1) schritt(f, true, 2, z)
    expect(Math.max(...f.px)).toBeLessThanOrEqual(HEISS)
  })

  it("brennt aus, wenn man aufhört nachzulegen, und sagt es", () => {
    const f = feld(30, 14)
    const z = zufall(11)
    for (let i = 0; i < 60; i += 1) schritt(f, true, 2, z)
    let noch = true
    let schritte = 0
    while (noch && schritte < 200) {
      noch = schritt(f, false, 2, z)
      schritte += 1
    }
    expect(noch).toBe(false)
    expect(Math.max(...f.px)).toBe(0)
  })

  it("ist bei gleichem Zufall dasselbe Feuer", () => {
    const lauf = () => {
      const f = feld(20, 10)
      const z = zufall(42)
      for (let i = 0; i < 50; i += 1) schritt(f, true, 2, z)
      return Array.from(f.px)
    }
    expect(lauf()).toEqual(lauf())
  })
})
