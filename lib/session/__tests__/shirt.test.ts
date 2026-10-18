import { describe, expect, it } from "vitest"
import { tourName } from "@/lib/session/merch"
import { RAENGE } from "@/lib/session/merch"
import {
  FESTIVAL,
  festivalPixel,
  GROSS_BREITE,
  GROSS_HOEHE,
  grossesShirt,
  HELLSTER_STOFF,
  MOTIV_GROESSE,
  MOTIVE,
  SHIRT_GROESSE,
  shirtTeile,
  STOFF,
  tourDruck,
  tourZeilen,
} from "@/lib/session/shirt"
import { kontrast } from "@/lib/ui/kontrast"

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

  it("bleiben auf ihrer Fläche und sind spiegelgleich geschnitten, vorne wie hinten", () => {
    for (const hinten of [false, true]) {
      const pixel = grossesShirt(STOFF.Heavy, hinten)
      const stellen = new Set(pixel.map((p) => `${p.x},${p.y}`))
      expect(stellen.size).toBe(pixel.length)
      for (const p of pixel) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(GROSS_BREITE)
        expect(p.y).toBeLessThan(GROSS_HOEHE)
        expect(p.farbe).toMatch(/^#[0-9a-f]{6}$/)
        // Die Form ist spiegelgleich; nur die Rippen im Kragen wechseln Pixel für Pixel.
        expect(stellen.has(`${GROSS_BREITE - 1 - p.x},${p.y}`), `${p.x},${p.y}`).toBe(true)
      }
    }
  })

  it("haben hinten einen flachen Ausschnitt und vorne einen tiefen", () => {
    const mitteStoff = (hinten: boolean) =>
      grossesShirt(STOFF.Heavy, hinten).filter((p) => p.x === 31 && p.y < 12).length
    expect(mitteStoff(true)).toBeGreaterThan(mitteStoff(false))
  })

  it("tragen einen Druck, der auf jedem Stoff lesbar ist", () => {
    // Gegen die hellste Stelle, auf der Druck liegen kann — Falten und Licht
    // gehen bis HELLSTER_STOFF, der Kragen liegt über dem Druck.
    const drucke = new Map(NAMEN.map((name) => [tourDruck(name).stoff, tourDruck(name).tinte]))
    expect(drucke.size).toBe(Object.keys(STOFF).length)
    for (const [stoff, tinte] of drucke) {
      const farben = [...new Set(grossesShirt(stoff, false).filter((p) => p.y > 10).map((p) => p.farbe))]
      const hell = farben.sort((a, b) => kontrast(tinte, a) - kontrast(tinte, b))[0]
      expect(kontrast(tinte, hell), `${stoff}: Tinte auf ${hell}`).toBeGreaterThanOrEqual(4.5)
    }
    expect(HELLSTER_STOFF).toBeLessThan(1.2)
  })

  it("setzen den Tournamen in zwei Zeilen, ohne ein zweiteiliges Nomen zu zerreissen", () => {
    expect(tourZeilen("Molten Palm Mutes Tour")).toEqual(["Molten", "Palm Mutes"])
    expect(tourZeilen("Iron Riffs Tour")).toEqual(["Iron", "Riffs"])
  })

  it("sieht für dasselbe Quartal auf jedem Gerät gleich aus", () => {
    expect(tourDruck(tourName(2026, 4))).toEqual(tourDruck(tourName(2026, 4)))
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
    // Am Handgelenk Stoff — ein T-Shirt hätte hier längst aufgehört.
    expect(stellen.has("1,24")).toBe(true)
    // Zwischen Ärmel und Körper bleibt Luft.
    expect(stellen.has("4,20")).toBe(false)
    // Unter dem Druck ist der Schnitt spiegelgleich.
    for (const stelle of [...stellen].filter((s) => Number(s.split(",")[1]) >= 24)) {
      const [x, y] = stelle.split(",").map(Number)
      expect(stellen.has(`${SHIRT_GROESSE - 1 - x},${y}`), stelle).toBe(true)
    }
  })
})
