#!/usr/bin/env node
/**
 * Erzeugt public/bilder/drop-<id>.png (die Bühne eines Drops, 96 × 48) und
 * public/bilder/roadie.png (der Roadie, 16 × 16).
 *
 * Beides steht still — Riffforge animiert keinen Schmuck. Gezeichnet wird
 * ganzzahlig über die Klasse `.pixel`, die Bühne dreifach wie die Rangszenen,
 * der Roadie dreifach (48 px). Zu jedem Drop in `lib/session/drops-daten.ts`
 * gehört hier eine Szene unter `SZENEN`; der Test in `merch-bilder.test.ts`
 * prüft, dass die Datei da ist und die Grösse stimmt.
 *
 *   node tools/drops.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bild, malen, pngSchreiben, setze } from "./pixel.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const ziel = join(root, "public/bilder")
mkdirSync(ziel, { recursive: true })

const rechteck = (b, x0, y0, x1, y1, farbe) => {
  for (let y = y0; y <= y1; y += 1) for (let x = x0; x <= x1; x += 1) setze(b, x, y, farbe)
}

/** Ein Lautsprecherschrank oder Combo: Rand, Gitter im Schachbrett, ein Griff oben. */
function schrank(b, x0, y0, x1, y1) {
  rechteck(b, x0, y0, x1, y1, "#0a0a0d")
  for (let y = y0 + 2; y <= y1 - 2; y += 1)
    for (let x = x0 + 2; x <= x1 - 2; x += 1) setze(b, x, y, (x + y) % 2 === 0 ? "#2a2a30" : "#212127")
}

/** November 2026: ein Marshall-artiger Stack, ein Combo und davor das Pedal. */
function verstaerker() {
  const b = bild(96, 48, "#101015")
  // Der Lichtkegel: kaum heller als der Grund, damit die Bühne ruhig bleibt.
  for (let y = 0; y < 40; y += 1) {
    const halb = 6 + Math.floor(y * 0.7)
    rechteck(b, 30 - halb, y, 30 + halb, y, "#15151b")
  }
  // Der Boden.
  rechteck(b, 0, 40, 95, 47, "#1d1d24")
  rechteck(b, 0, 40, 95, 40, "#2e2e38")
  // Der Stack: zwei Schränke, oben der Kopf.
  schrank(b, 16, 27, 45, 39)
  schrank(b, 16, 14, 45, 26)
  rechteck(b, 16, 7, 45, 13, "#0a0a0d")
  rechteck(b, 17, 8, 44, 13, "#1b1b1f")
  rechteck(b, 18, 9, 43, 10, "#d9a400")
  for (const x of [20, 24, 28, 32, 36, 40]) setze(b, x, 12, "#e9e9ee")
  // Bernstein nur auf dem, was zählt: die Röhre leuchtet.
  setze(b, 42, 12, "#ff9a2e")
  // Das Kabel zum Pedal.
  rechteck(b, 46, 41, 55, 41, "#0a0a0d")
  // Das Pedal.
  rechteck(b, 54, 33, 63, 39, "#0a0a0d")
  rechteck(b, 55, 34, 62, 38, "#d64534")
  setze(b, 57, 35, "#e9e9ee")
  setze(b, 60, 35, "#e9e9ee")
  rechteck(b, 58, 37, 59, 37, "#8d969d")
  // Der Combo rechts.
  schrank(b, 68, 24, 90, 39)
  rechteck(b, 68, 24, 90, 26, "#0a0a0d")
  rechteck(b, 70, 25, 88, 25, "#d9a400")
  for (const x of [72, 76, 80, 84]) setze(b, x, 26, "#e9e9ee")
  return b
}

const SZENEN = { "2026-11": verstaerker }

for (const [id, szene] of Object.entries(SZENEN)) {
  writeFileSync(join(ziel, `drop-${id}.png`), pngSchreiben(szene()))
}

/** Der Roadie, 16 × 16: Kappe, Gesicht, schwarzes Shirt, Jeans, Stiefel. */
const ROADIE = {
  farben: { k: "#17171c", s: "#f1c08e", h: "#d64534", t: "#26262e", w: "#e9e9ee", j: "#3d5f9a" },
  raster: [
    "................",
    ".....hhhhhh.....",
    "....hhhhhhhh....",
    "....kkkkkkkk....",
    "....kssssssk....",
    "....kskssksk....",
    "....kssssssk....",
    ".....kssssk.....",
    "...tttttttttt...",
    "..stttttttttts..",
    "..stttwwwwttts..",
    "...tttttttttt...",
    "...jjjjjjjjjj...",
    "...jjjj..jjjj...",
    "...jjjj..jjjj...",
    "..kkkkk..kkkkk..",
  ],
}
for (const zeile of ROADIE.raster) if (zeile.length !== 16) throw new Error(`Roadie: Zeile „${zeile}" ist nicht 16 breit`)
const roadie = bild(16, 16, "#000000", false)
malen(roadie, ROADIE, 0, 0, 1, ".")
writeFileSync(join(ziel, "roadie.png"), pngSchreiben(roadie))
