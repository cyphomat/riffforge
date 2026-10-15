import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { aufnaeherBild, katalog, RAENGE, rangBild } from "@/lib/session/merch"

/** Width and height from a PNG's header — enough to check the art is the size it is drawn at. */
function groesse(pfad: string): [number, number] {
  const kopf = readFileSync(pfad)
  expect(kopf.subarray(1, 4).toString()).toBe("PNG")
  return [kopf.readUInt32BE(16), kopf.readUInt32BE(20)]
}

const datei = (pfad: string) => join(process.cwd(), "public", pfad)

describe("Die Bilder am Merch-Stand", () => {
  it("haben für jede Leiter einen Aufnäher, 24 × 24", () => {
    const gruppen = new Set(katalog({ mitSieben: true }).map((a) => a.gruppe))
    for (const gruppe of gruppen) {
      const pfad = datei(aufnaeherBild(gruppe))
      expect(existsSync(pfad), gruppe).toBe(true)
      expect(groesse(pfad), gruppe).toEqual([24, 24])
    }
  })

  it("haben für jeden Rang eine Szene, 96 × 48", () => {
    for (const rang of RAENGE) {
      const pfad = datei(rangBild(rang.id))
      expect(existsSync(pfad), rang.id).toBe(true)
      expect(groesse(pfad), rang.id).toEqual([96, 48])
    }
  })
})
