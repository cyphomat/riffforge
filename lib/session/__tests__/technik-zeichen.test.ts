import { describe, expect, it } from "vitest"
import { DRILLS } from "@/lib/session/drills"
import { SIEBEN_DRILLS } from "@/lib/session/drills-sieben"
import { TECHNIK_TITEL } from "@/lib/session/merch"
import { AUFNAEHER_GROESSE, TECHNIK_ZEICHEN, technikAufnaeher, ZEICHEN_GROESSE } from "@/lib/session/technik-zeichen"
import { TECHNIQUES } from "@/lib/session/types"

describe("Die Technik-Zeichen", () => {
  it("gibt es für jede Technik, 16 × 16, nur aus Strich, Akzent und Leere", () => {
    for (const technik of TECHNIQUES) {
      const raster = TECHNIK_ZEICHEN[technik]
      expect(raster, technik).toHaveLength(ZEICHEN_GROESSE)
      for (const zeile of raster) {
        expect(zeile, technik).toHaveLength(ZEICHEN_GROESSE)
        expect(zeile, technik).toMatch(/^[.ab]+$/)
      }
      // Leer wäre ein Loch in der Liste.
      expect(raster.join("").replace(/\./g, "").length, technik).toBeGreaterThan(20)
    }
  })

  it("decken jeden Drill ab, auch auf sieben Saiten", () => {
    for (const drill of [...DRILLS, ...SIEBEN_DRILLS]) expect(TECHNIK_ZEICHEN[drill.technique], drill.id).toBeDefined()
  })

  it("sind voneinander verschieden", () => {
    const bilder = TECHNIQUES.map((t) => TECHNIK_ZEICHEN[t].join("\n"))
    expect(new Set(bilder).size).toBe(TECHNIQUES.length)
  })
})

describe("Die Technik-Aufnäher", () => {
  const techniken = Object.keys(TECHNIK_TITEL) as Array<keyof typeof TECHNIK_TITEL>

  it("liegen auf 24 × 24, jede Stelle einmal, als spiegelgleiches Wappen", () => {
    for (const technik of techniken) {
      const pixel = technikAufnaeher(technik)
      const stellen = new Set(pixel.map((p) => `${p.x},${p.y}`))
      expect(stellen.size, technik).toBe(pixel.length)
      for (const p of pixel) {
        expect(p.x).toBeGreaterThanOrEqual(0)
        expect(p.x).toBeLessThan(AUFNAEHER_GROESSE)
        expect(p.y).toBeLessThan(AUFNAEHER_GROESSE)
        expect(p.farbe).toMatch(/^#[0-9a-f]{6}$/)
        expect(stellen.has(`${AUFNAEHER_GROESSE - 1 - p.x},${p.y}`), `${technik} ${p.x},${p.y}`).toBe(true)
      }
    }
  })

  it("tragen das ganze Zeichen — Rand und Naht schneiden nichts davon ab", () => {
    for (const technik of techniken) {
      const pixel = new Map(technikAufnaeher(technik).map((p) => [`${p.x},${p.y}`, p.farbe]))
      const links = (AUFNAEHER_GROESSE - ZEICHEN_GROESSE) / 2
      const oben = links - 1
      TECHNIK_ZEICHEN[technik].forEach((zeile, y) =>
        [...zeile].forEach((zeichen, x) => {
          if (zeichen === ".") return
          // Strich in Garn, Akzent in Gold — dieselben zwei Farben wie die gezeichneten Aufnäher.
          expect(pixel.get(`${x + links},${y + oben}`), `${technik} ${x},${y}`).toBe(zeichen === "a" ? "#f2e2a8" : "#d8b44a")
        }),
      )
    }
  })

  it("haben jeder ein eigenes Tuch", () => {
    const tuch = techniken.map((t) => technikAufnaeher(t).find((p) => p.x === 12 && p.y === 21)!.farbe)
    expect(new Set(tuch).size).toBe(techniken.length)
  })
})
