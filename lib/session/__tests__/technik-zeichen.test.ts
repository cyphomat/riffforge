import { describe, expect, it } from "vitest"
import { DRILLS } from "@/lib/session/drills"
import { SIEBEN_DRILLS } from "@/lib/session/drills-sieben"
import { TECHNIK_ZEICHEN, ZEICHEN_GROESSE } from "@/lib/session/technik-zeichen"
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
