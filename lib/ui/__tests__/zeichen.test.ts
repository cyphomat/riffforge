import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

/**
 * Das Zeichen als Pixelraster. Die Regel aus docs/marke-und-merch.md als Prüfung: bei 48 px
 * überlebt nur eine geschlossene Silhouette — also eine Fläche, spiegelgleich,
 * ohne Loch und ohne abgesprengte Punkte.
 */

const quelle = readFileSync(join(process.cwd(), "assets/logo/totenkopf.txt"), "utf8").split("\n")
const raster = quelle.filter((z) => z.length > 0 && !z.startsWith("#"))
const farben = new Set(quelle.flatMap((z) => z.match(/^#\s(\S)\s#[0-9a-f]{6}\b/i)?.[1] ?? []))
const voll = (x: number, y: number) => raster[y]?.[x] !== undefined && raster[y][x] !== "."

function groesse(pfad: string): [number, number] {
  const kopf = readFileSync(join(process.cwd(), pfad))
  return [kopf.readUInt32BE(16), kopf.readUInt32BE(20)]
}

describe("Das Zeichen", () => {
  it("ist 32 × 32 und braucht nur Farben, die die Quelle nennt", () => {
    expect(raster).toHaveLength(32)
    for (const zeile of raster) {
      expect(zeile).toHaveLength(32)
      for (const p of zeile) expect(farben.has(p), p).toBe(true)
    }
  })

  it("ist spiegelgleich geschnitten und 20 × 20 gross", () => {
    for (let y = 0; y < 32; y += 1)
      for (let x = 0; x < 32; x += 1) expect(voll(x, y), `${x},${y}`).toBe(voll(31 - x, y))
    const zeilen = raster.filter((z) => /[^.]/.test(z)).length
    const spalten = new Set(raster.flatMap((z) => [...z].flatMap((p, x) => (p === "." ? [] : [x])))).size
    expect([spalten, zeilen]).toEqual([20, 20])
  })

  it("ist eine geschlossene Fläche: zusammenhängend und ohne Loch", () => {
    const zaehle = (start: [number, number], gehoert: (x: number, y: number) => boolean) => {
      const gesehen = new Set<string>()
      const offen = [start]
      while (offen.length) {
        const [x, y] = offen.pop()!
        if (x < 0 || y < 0 || x > 31 || y > 31 || gesehen.has(`${x},${y}`) || !gehoert(x, y)) continue
        gesehen.add(`${x},${y}`)
        offen.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
      }
      return gesehen.size
    }
    const flaeche = raster.join("").replace(/\./g, "").length
    const ersterPunkt = raster.flatMap((z, y) => [...z].map((p, x) => [x, y, p] as const)).find(([, , p]) => p !== ".")!
    // Alles Volle hängt an einem Stück …
    expect(zaehle([ersterPunkt[0], ersterPunkt[1]], voll)).toBe(flaeche)
    // … und alles Leere erreicht den Rand: kein Loch im Inneren.
    expect(zaehle([0, 0], (x, y) => !voll(x, y))).toBe(32 * 32 - flaeche)
  })

  it("liegt als Icon in jeder Grösse vor, die Manifest und Layout nennen", () => {
    for (const [datei, seite] of [["icon-32", 32], ["icon-180", 180], ["icon-192", 192], ["icon-512", 512], ["icon-1024", 1024], ["icon-maskable-512", 512]] as const) {
      expect(groesse(`public/icons/${datei}.png`), datei).toEqual([seite, seite])
    }
    const manifest = JSON.parse(readFileSync(join(process.cwd(), "public/manifest.json"), "utf8"))
    for (const icon of manifest.icons) expect(() => groesse(`public/${icon.src}`), icon.src).not.toThrow()
  })
})
