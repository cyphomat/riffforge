#!/usr/bin/env node
/**
 * Erzeugt public/merch/aufnaeher-advent.png: der Adventskranz-Aufnäher für die
 * Türchen 12 und 24 (ein Bild für beide Stufen, wie bei jeder Leiter).
 *
 * Ein Aufnäher ist 24 × 24 wie alle an der Kutte: Rand und Stickerei stammen
 * aus `aufnaeher-debuet.png`, nur das Motiv in der Mitte wird getauscht —
 * dasselbe Verfahren wie `tools/anlaesse.mjs`. Das Motiv, 15 × 15, ist ein Kranz
 * mit drei Kerzen und einer roten Schleife und wird gerechnet, nicht getippt.
 *
 *   node tools/advent.mjs
 */
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bild, pngLesen, pngSchreiben, setze } from "./pixel.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const KANTE = 15

const PALETTE = { G: "#2f8a43", g: "#1d5c2e", h: "#5fbf6a", C: "#e9e2d0", c: "#b9b19c", Y: "#f2c14e", F: "#e8892e", R: "#d2423a", o: "#8e2a25" }

function kranz() {
  const r = Array.from({ length: KANTE }, () => Array(KANTE).fill("."))
  // Der Ring: Mitte (7, 9), Außenradius 5,5, Innenradius 2,6.
  for (let y = 0; y < KANTE; y++)
    for (let x = 0; x < KANTE; x++) {
      const d = Math.hypot(x - 7, y - 9)
      if (d <= 5.5 && d >= 2.6) r[y][x] = d > 4.6 ? "g" : d < 3.4 ? "g" : (x + y) % 3 === 0 ? "h" : "G"
    }
  // Drei Kerzen auf dem oberen Rand, mit Flamme.
  for (const x of [4, 7, 10]) {
    r[1][x] = "F"
    r[2][x] = "Y"
    r[3][x] = "C"
    r[4][x] = "C"
    r[5][x] = "c"
  }
  // Die Schleife unten.
  for (const [y, x, c] of [[13, 6, "R"], [13, 8, "R"], [14, 5, "R"], [14, 9, "R"], [13, 7, "o"], [14, 7, "R"]]) r[y][x] = c
  return r
}

const vorlage = pngLesen(join(root, "public/merch/aufnaeher-debuet.png"))
const STOFF = "#1c2d55"
const MOTIV_ROT = 0xf2
const hex = (d, i) => `#${[0, 1, 2].map((k) => d[i + k].toString(16).padStart(2, "0")).join("")}`

const b = bild(vorlage.breite, vorlage.hoehe, "#000000", false)
for (let y = 0; y < b.hoehe; y++)
  for (let x = 0; x < b.breite; x++) {
    const i = (y * b.breite + x) * 4
    if (vorlage.daten[i + 3] === 0) continue
    const motivPunkt = vorlage.daten[i] === MOTIV_ROT && vorlage.daten[i + 1] === 0xe2
    setze(b, x, y, motivPunkt ? STOFF : hex(vorlage.daten, i))
  }
const motiv = kranz()
if (process.argv.includes("--vorschau")) console.log(motiv.map((z) => z.join("")).join("\n"))
motiv.forEach((zeile, y) =>
  zeile.forEach((zeichen, x) => {
    if (zeichen !== ".") setze(b, 4 + x, 4 + y, PALETTE[zeichen])
  }),
)
writeFileSync(join(root, "public/merch/aufnaeher-advent.png"), pngSchreiben(b))
console.log("public/merch/aufnaeher-advent.png")
