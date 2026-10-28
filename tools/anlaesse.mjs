#!/usr/bin/env node
/**
 * Erzeugt public/bilder/anlass-*.png (die Motive der Anlass-Banner auf *Heute*)
 * und public/merch/aufnaeher-anlass-*.png (die Aufnäher dazu).
 *
 * Jedes Motiv ist 15 × 15 und steht still — Riffforge animiert keinen Schmuck.
 * Tannenbaum und Geschenk stammen aus Setlist (`tools/pixel-anlaesse.mjs`, dort
 * mit zwei Bildern; hier nur das erste), die Kerze für die Gedenktage ist neu.
 * Gezeichnet werden sie ganzzahlig, 3 ×, über die Klasse `.pixel`.
 *
 * Die Namen sind `MOTIVE` in lib/session/anlaesse.ts; der Test dort prüft,
 * dass zu jedem Namen eine Datei in dieser Grösse liegt.
 *
 * Ein Aufnäher ist 24 × 24 wie alle an der Kutte: Rand und Stickerei stammen
 * aus `aufnaeher-debuet.png` (nur das Motiv in der Mitte wird getauscht), das
 * Motiv ist dasselbe wie im Banner. Wer das Debüt-Zeichen ändert, lässt dieses
 * Werkzeug neu laufen.
 *
 *   node tools/anlaesse.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bild, pngLesen, pngSchreiben, setze } from "./pixel.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const KANTE = 15

/** Zeichen im Raster → Farbe. `.` ist durchsichtig. */
const PALETTE = {
  G: "#2f8a43", g: "#1d5c2e", h: "#5fbf6a", T: "#7a4a22", t: "#4f2f14",
  Y: "#f2c14e", W: "#f6f2e8", R: "#d2423a", r: "#e8645a", o: "#8e2a25", B: "#4aa3df",
  // Kerze
  C: "#e9e2d0", c: "#b9b19c", K: "#3b3b40", F: "#e8892e",
}

const leer = () => Array.from({ length: KANTE }, () => Array(KANTE).fill("."))
const setzeZ = (r, y, x, c) => {
  r[y][x] = c
}

/** Tannenbaum: Reihen mit wachsender Breite, aussen dunkel, innen hell, bunte Lichter, gelber Stern. */
function tannenbaum() {
  const r = leer()
  const BAUM = [1, 3, 5, 3, 5, 7, 9, 7, 9, 11, 13]
  const LICHTER = [[4, 7], [6, 6], [7, 9], [8, 5], [8, 10], [10, 4], [10, 9], [11, 6], [12, 3], [12, 8], [12, 11]]
  const LICHT_FARBEN = ["R", "Y", "B"]
  setzeZ(r, 0, 7, "Y")
  for (const x of [6, 7, 8]) setzeZ(r, 1, x, "Y")
  BAUM.forEach((breite, i) => {
    const y = 2 + i
    const links = 7 - (breite - 1) / 2
    for (let k = 0; k < breite; k++) {
      const rand = k === 0 || k === breite - 1
      setzeZ(r, y, links + k, rand ? "g" : k === 1 && breite > 3 ? "h" : "G")
    }
  })
  LICHTER.forEach(([y, x], i) => {
    if (r[y][x] === ".") throw new Error(`Tannenbaum: Licht (${y},${x}) sitzt neben dem Baum`)
    setzeZ(r, y, x, LICHT_FARBEN[i % 3])
  })
  for (const y of [13, 14]) for (const x of [6, 7, 8]) setzeZ(r, y, x, x === 8 ? "t" : "T")
  return r
}

/** Geschenk: rote Kiste mit gelbem Band und Schleife. */
function geschenk() {
  const r = leer()
  const schleife = ["....YYY.YYY....", "...Y...Y...Y...", "....YYY.YYY....", "......YYY......"]
  schleife.forEach((z, i) => {
    for (let x = 0; x < KANTE; x++) if (z[x] !== ".") setzeZ(r, 2 + i, x, z[x])
  })
  for (let x = 1; x <= 13; x++) {
    setzeZ(r, 6, x, "o")
    setzeZ(r, 8, x, "o")
  }
  for (let x = 2; x <= 12; x++) setzeZ(r, 7, x, "R")
  setzeZ(r, 7, 1, "o")
  setzeZ(r, 7, 13, "o")
  for (let y = 9; y <= 13; y++) {
    setzeZ(r, y, 2, "o")
    setzeZ(r, y, 12, "o")
    for (let x = 3; x <= 11; x++) setzeZ(r, y, x, "R")
  }
  for (let x = 2; x <= 12; x++) setzeZ(r, 14, x, "o")
  for (let y = 10; y <= 12; y++) setzeZ(r, y, 3, "r")
  setzeZ(r, 7, 3, "r")
  for (let y = 6; y <= 14; y++) for (const x of [6, 7, 8]) setzeZ(r, y, x, "Y")
  return r
}

/** Kerze: ruhige Flamme über einem hellen Schaft mit Schatten rechts, auf einem dunklen Fuss. */
function kerze() {
  const r = leer()
  setzeZ(r, 1, 7, "F")
  for (const [y, x, c] of [[2, 6, "F"], [2, 7, "Y"], [2, 8, "F"], [3, 6, "F"], [3, 7, "Y"], [3, 8, "F"], [4, 7, "F"]]) setzeZ(r, y, x, c)
  setzeZ(r, 5, 7, "K")
  for (let y = 6; y <= 12; y++) {
    for (const x of [5, 6, 7, 8]) setzeZ(r, y, x, "C")
    setzeZ(r, y, 9, "c")
  }
  for (let x = 5; x <= 9; x++) setzeZ(r, 6, x, "c")
  setzeZ(r, 9, 4, "C")
  for (let x = 3; x <= 11; x++) setzeZ(r, 13, x, "K")
  for (let x = 4; x <= 10; x++) setzeZ(r, 14, x, "K")
  return r
}

const MOTIVE = { tannenbaum, geschenk, kerze }

mkdirSync(join(root, "public/bilder"), { recursive: true })
for (const [id, bauen] of Object.entries(MOTIVE)) {
  const raster = bauen()
  const b = bild(KANTE, KANTE, "#000000", false)
  raster.forEach((zeile, y) =>
    zeile.forEach((zeichen, x) => {
      if (zeichen === ".") return
      if (!PALETTE[zeichen]) throw new Error(`${id}: unbekanntes Zeichen ${zeichen}`)
      setze(b, x, y, PALETTE[zeichen])
    }),
  )
  writeFileSync(join(root, "public/bilder", `anlass-${id}.png`), pngSchreiben(b))
  console.log(`public/bilder/anlass-${id}.png`)
}

/** Welcher Anlass welches Motiv auf den Aufnäher bekommt. Die Namen sind die Kennungen in `STANDARD`. */
const AUFNAEHER = { weihnachten: "tannenbaum", lemmy: "kerze", ozzy: "kerze" }

// Vom Debüt-Aufnäher bleiben Kontur (#0a0a0a), Stickerei (#d8b44a) und Stoff
// (#1c2d55); das helle Motiv (#f2e2a8) fällt weg.
const vorlage = pngLesen(join(root, "public/merch/aufnaeher-debuet.png"))
const STOFF = "#1c2d55"
const MOTIV_ROT = 0xf2
const hex = (d, i) => `#${[0, 1, 2].map((k) => d[i + k].toString(16).padStart(2, "0")).join("")}`

mkdirSync(join(root, "public/merch"), { recursive: true })
for (const [id, motiv] of Object.entries(AUFNAEHER)) {
  const b = bild(vorlage.breite, vorlage.hoehe, "#000000", false)
  for (let y = 0; y < b.hoehe; y++)
    for (let x = 0; x < b.breite; x++) {
      const i = (y * b.breite + x) * 4
      if (vorlage.daten[i + 3] === 0) continue
      const motivPunkt = vorlage.daten[i] === MOTIV_ROT && vorlage.daten[i + 1] === 0xe2
      setze(b, x, y, motivPunkt ? STOFF : hex(vorlage.daten, i))
    }
  MOTIVE[motiv]().forEach((zeile, y) =>
    zeile.forEach((zeichen, x) => {
      if (zeichen !== ".") setze(b, 4 + x, 4 + y, PALETTE[zeichen])
    }),
  )
  writeFileSync(join(root, "public/merch", `aufnaeher-anlass-${id}.png`), pngSchreiben(b))
  console.log(`public/merch/aufnaeher-anlass-${id}.png`)
}
