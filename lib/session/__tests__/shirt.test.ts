import { describe, expect, it } from "vitest"
import { tourName } from "@/lib/session/merch"
import { RAENGE } from "@/lib/session/merch"
import {
  FESTIVAL,
  festivalPixel,
  MOTIV_GROESSE,
  MOTIVE,
  SHIRT_GROESSE,
  shirtPixel,
  shirtTeile,
  STOFF,
} from "@/lib/session/shirt"

/** Every tour name for half a century — enough to have met every word. */
const NAMEN = Array.from({ length: 50 }, (_, j) => 2000 + j).flatMap((jahr) =>
  [1, 2, 3, 4].map((quartal) => tourName(jahr, quartal)),
)

describe("Tourshirts", () => {
  it("finden für jeden Tournamen eine echte Farbe und ein echtes Motiv, ohne Ausweichen", () => {
    for (const name of NAMEN) {
      const ohneTour = name.replace(/ Tour$/, "")
      const { stoff, motiv } = shirtTeile(name)
      // Kein stilles Zurückfallen auf Black und Riffs: der Name besteht genau aus beiden Teilen.
      expect(`${stoff} ${motiv}`, name).toBe(ohneTour)
      expect(STOFF[stoff], name).toBeDefined()
      expect(MOTIVE[motiv], name).toBeDefined()
    }
  })

  it("brauchen jede Farbe und jedes Motiv auch wirklich", () => {
    const stoffe = new Set(NAMEN.map((n) => shirtTeile(n).stoff))
    const motive = new Set(NAMEN.map((n) => shirtTeile(n).motiv))
    expect([...stoffe].sort()).toEqual(Object.keys(STOFF).sort())
    expect([...motive].sort()).toEqual(Object.keys(MOTIVE).sort())
  })

  it("drucken jedes Motiv auf 12 × 12, nur aus Stoff, Tinte und zweiter Farbe", () => {
    for (const [name, raster] of Object.entries(MOTIVE)) {
      expect(raster, name).toHaveLength(MOTIV_GROESSE)
      for (const zeile of raster) {
        expect(zeile, name).toHaveLength(MOTIV_GROESSE)
        expect(zeile, name).toMatch(/^[.ab]+$/)
      }
    }
  })

  it("bleibt auf seiner Fläche und ist spiegelgleich geschnitten", () => {
    for (const name of NAMEN.slice(0, 12)) {
      for (const p of shirtPixel(name)) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(SHIRT_GROESSE)
        expect(p.y).toBeGreaterThanOrEqual(0)
        expect(p.y).toBeLessThan(SHIRT_GROESSE)
        expect(p.farbe).toMatch(/^#[0-9a-f]{6}$/)
      }
    }
    // Der Schnitt ohne Druck: jede Stoffstelle hat ihr Gegenstück auf der anderen Seite.
    const stoff = new Set(shirtPixel("Heavy Riffs Tour").filter((p) => p.y > 26).map((p) => `${p.x},${p.y}`))
    for (const stelle of stoff) {
      const [x, y] = stelle.split(",").map(Number)
      expect(stoff.has(`${SHIRT_GROESSE - 1 - x},${y}`), stelle).toBe(true)
    }
  })

  it("sieht für dasselbe Quartal auf jedem Gerät gleich aus", () => {
    expect(shirtPixel(tourName(2026, 4))).toEqual(shirtPixel(tourName(2026, 4)))
  })
})

describe("Festival-Shirts", () => {
  it("gibt es für jeden Rang ausser der Garage, mit einem Druck auf 12 × 12", () => {
    expect(Object.keys(FESTIVAL).sort()).toEqual(RAENGE.slice(1).map((r) => r.id).sort())
    for (const [id, f] of Object.entries(FESTIVAL)) {
      expect(f.motiv, id).toHaveLength(MOTIV_GROESSE)
      for (const zeile of f.motiv) expect(zeile, id).toMatch(new RegExp(`^[.ab]{${MOTIV_GROESSE}}$`))
    }
    expect(new Set(Object.values(FESTIVAL).map((f) => f.stoff)).size).toBe(Object.keys(FESTIVAL).length)
  })

  it("sind Langarm: Ärmel bis zum Handgelenk, spiegelgleich, mit Lücke unter dem Arm", () => {
    const pixel = festivalPixel("vorband")
    const stellen = new Set(pixel.map((p) => `${p.x},${p.y}`))
    // Am Handgelenk Stoff, wo das Tourshirt längst aufhört.
    expect(stellen.has("1,24")).toBe(true)
    expect(shirtPixel("Heavy Riffs Tour").some((p) => p.x === 1 && p.y === 24)).toBe(false)
    // Zwischen Ärmel und Körper bleibt Luft.
    expect(stellen.has("4,20")).toBe(false)
    // Unter dem Druck ist der Schnitt spiegelgleich.
    for (const stelle of [...stellen].filter((s) => Number(s.split(",")[1]) >= 24)) {
      const [x, y] = stelle.split(",").map(Number)
      expect(stellen.has(`${SHIRT_GROESSE - 1 - x},${y}`), stelle).toBe(true)
    }
  })
})
