import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { STANDARD } from "@/lib/session/anlaesse"
import { aufnaeherBild, gitarreBild, katalog, RAENGE, rangBild } from "@/lib/session/merch"

/** Width and height from a PNG's header — enough to check the art is the size it is drawn at. */
function groesse(pfad: string): [number, number] {
  const kopf = readFileSync(pfad)
  expect(kopf.subarray(1, 4).toString()).toBe("PNG")
  return [kopf.readUInt32BE(16), kopf.readUInt32BE(20)]
}

const datei = (pfad: string) => join(process.cwd(), "public", pfad)

describe("Die Bilder am Merch-Stand", () => {
  it("haben für jede Leiter einen Aufnäher, 24 × 24", () => {
    // Technik-Aufnäher sind gerechnet, nicht gezeichnet — sie prüft technik-zeichen.test.ts.
    // Die der Anlässe stehen im Katalog erst, wenn sie verdient sind; hier alle.
    const gruppen = new Set(katalog({ mitSieben: true, anlaesse: STANDARD.map((x) => x.id) }).filter((a) => !a.technik).map((a) => a.gruppe))
    for (const gruppe of gruppen) {
      const pfad = datei(aufnaeherBild(gruppe))
      expect(existsSync(pfad), gruppe).toBe(true)
      expect(groesse(pfad), gruppe).toEqual([24, 24])
    }
  })

  it("haben eine Szene für den Willkommens-Schirm, 96 × 48", () => {
    expect(groesse(datei("/bilder/willkommen.png"))).toEqual([96, 48])
  })

  it("haben für jeden Rang eine Szene, 96 × 48", () => {
    for (const rang of RAENGE) {
      const pfad = datei(rangBild(rang.id))
      expect(existsSync(pfad), rang.id).toBe(true)
      expect(groesse(pfad), rang.id).toEqual([96, 48])
    }
  })

  it("haben für jeden Rang eine Gitarre fürs Rack, 24 × 56", () => {
    for (const rang of RAENGE) {
      const pfad = datei(gitarreBild(rang.id))
      expect(existsSync(pfad), rang.id).toBe(true)
      expect(groesse(pfad), rang.id).toEqual([24, 56])
    }
  })
})
