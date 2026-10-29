#!/usr/bin/env node
/**
 * Die Bilder der READMEs, aus derselben Pixelkunst wie die App.
 *
 *   assets/banner.svg          Totenkopf, Wortmarke, Bühne — als Rechtecke
 *   assets/readme/rang-*.png   die Rangszenen, zweifach
 *   assets/readme/kutte.png    alle gezeichneten Aufnäher in einer Reihe
 *
 * GitHub kennt kein `image-rendering: pixelated`: ein 96 × 48 Bild, im README
 * auf 192 gezogen, wird weichgezeichnet. Deshalb wird hier vorher ganzzahlig
 * vergrössert und im README in genau dieser Grösse gezeigt — oder gleich als
 * SVG aus Rechtecken ausgegeben, das in jeder Breite scharf bleibt.
 *
 * Die Wortmarke ist im Banner Pixelschrift statt Anton: ein SVG im README
 * kann keine Schrift mitbringen, und der Rückfall auf eine Systemschrift
 * passte nicht mehr neben einen Totenkopf aus Pixeln. Die Fuge „Riff|forge"
 * bekommt dabei ihr Haar Luft wie in der App — hier genau einen Pixel.
 *
 *   node tools/readme-bilder.mjs
 */
import { mkdirSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bild, einsetzen, malen, pngLesen, pngSchreiben, rasterLesen, setze, svgRechtecke } from "./pixel.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const zeichen = rasterLesen(join(root, "assets/logo/totenkopf.txt"))
const GRUND = zeichen.farben["."]
const BERNSTEIN = zeichen.farben.a
const SCHATTEN = zeichen.farben.s
const GRAU = "#a7a3ab"

/* ───────────────────────────── Schriften ───────────────────────────── */

/** Die Wortmarke: 16 hoch, Strich 3 — schmal und schwer wie Anton. */
const GROSS = {
  R: ["########.", "#########", "###...###", "###...###", "###...###", "###...###", "#########", "########.", "###.###..", "###..###.", "###..###.", "###...###", "###...###", "###...###", "###...###", "###...###"],
  I: Array(16).fill("###"),
  F: ["########", "########", "########", "###.....", "###.....", "###.....", "###.....", "#######.", "#######.", "#######.", "###.....", "###.....", "###.....", "###.....", "###.....", "###....."],
  O: [".#######.", "#########", ...Array(12).fill("###...###"), "#########", ".#######."],
  G: [".#######.", "#########", "###...###", "###...###", "###......", "###......", "###......", "###.#####", "###.#####", "###...###", "###...###", "###...###", "###...###", "###...###", "#########", ".#######."],
  E: ["########", "########", "########", "###.....", "###.....", "###.....", "#######.", "#######.", "#######.", "###.....", "###.....", "###.....", "###.....", "########", "########", "########"],
}

/** Der Untertitel: 5 × 7, nur die Zeichen, die er braucht. */
const KLEIN = {
  "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
  "5": ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
  I: [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#.#.#", "#..##", "#...#", "#...#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  Ü: [".#.#.", ".....", "#...#", "#...#", "#...#", "#...#", ".###."],
  "·": [".....", ".....", ".....", "..#..", ".....", ".....", "....."],
  " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
}

function schreiben(ziel, schrift, text, links, oben, farbe, abstand, schatten = null) {
  let x = links
  for (const buchstabe of text) {
    if (buchstabe === "|") {
      x += 1 // die Fuge: ein Haar Luft
      continue
    }
    const glyphe = schrift[buchstabe]
    glyphe.forEach((zeile, y) =>
      [...zeile].forEach((p, dx) => {
        if (p !== "#") return
        if (schatten) setze(ziel, x + dx + 1, oben + y + 1, schatten)
      }),
    )
    glyphe.forEach((zeile, y) => [...zeile].forEach((p, dx) => p === "#" && setze(ziel, x + dx, oben + y, farbe)))
    x += glyphe[0].length + abstand
  }
  return x - abstand - links
}
const breiteVon = (schrift, text, abstand) =>
  [...text].reduce((summe, b) => summe + (b === "|" ? 1 : schrift[b][0].length + abstand), 0) - abstand

/* ───────────────────────────── Die Bühne ───────────────────────────── */

const AMP = [
  "######################",
  "#hhhhhhhhhhhhhhhhhhhh#",
  "#hkkhkkhkkhkkhhhhhjhh#",
  "#hhhhhhhhhhhhhhhhhhhh#",
  "######################",
  "#cccccccccccccccccccc#",
  "#c.g.g.g.g.g.g.g.g.cc#",
  "#cg.g.g.g.g.g.g.g.gcc#",
  "#c.g.g.g.g.g.g.g.g.cc#",
  "#cg.g.g.g.g.g.g.g.gcc#",
  "#c.g.g.g.g.g.g.g.g.cc#",
  "#cg.g.g.g.g.g.g.g.gcc#",
  "#cccccccccccccccccccc#",
  "######################",
  "#cccccccccccccccccccc#",
  "#c.g.g.g.g.g.g.g.g.cc#",
  "#cg.g.g.g.g.g.g.g.gcc#",
  "#c.g.g.g.g.g.g.g.g.cc#",
  "#cg.g.g.g.g.g.g.g.gcc#",
  "#c.g.g.g.g.g.g.g.g.cc#",
  "#cg.g.g.g.g.g.g.g.gcc#",
  "#cccccccccccccccccccc#",
  "######################",
]
const AMP_FARBEN = { "#": "#2a2a30", h: "#1a1a1e", k: GRAU, j: BERNSTEIN, c: "#1d1d22", g: "#141417", ".": "#26262c" }

function banner() {
  const B = 280
  const H = 60
  const b = bild(B, H, GRUND)

  // Ein Glimmen hinter dem Zeichen, gerastert statt verlaufen — Pixelkunst
  // kennt keine Verläufe, nur Punkte, die dichter werden.
  for (let y = 0; y < 48; y += 1)
    for (let x = 0; x < B; x += 1) {
      const d = Math.hypot((x - B / 2) / 1.9, y - 18) / 48
      const dicht = d < 0.45 ? 0.5 : d < 0.7 ? 0.25 : d < 0.9 ? 0.12 : 0
      const muster = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]][y % 4][x % 4] / 16
      if (muster < dicht) setze(b, x, y, "#16130e")
    }

  // Bühne: Boden mit Kante, Bretter, links und rechts ein Stack.
  for (let x = 0; x < B; x += 1) {
    setze(b, x, 47, "#3a3a42")
    for (let y = 48; y < H; y += 1) setze(b, x, y, x % 24 === 0 ? "#18181c" : "#222226")
  }
  const amp = { raster: AMP, farben: AMP_FARBEN }
  malen(b, amp, 4, 24)
  malen(b, amp, B - 4 - 22, 24)

  // Das Publikum: Köpfe vor der Bühnenkante, ein paar Hände oben.
  // Vor der Bühne, nicht vor dem Zeichen: links und rechts, die Mitte bleibt frei.
  const reihe = [6, 13, 20, 28, 35, 43, 50, 58, 65, 73, 80, 88, 186, 194, 201, 209, 216, 224, 231, 239, 246, 254, 261, 269]
  reihe.forEach((x, i) => {
    const y = 54 + (i % 3)
    for (const [dx, dy] of [[1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2], [1, 2], [2, 2], [3, 2]]) setze(b, x + dx, y + dy, "#060607")
    for (let yy = y + 3; yy < H; yy += 1) for (let dx = -1; dx < 5; dx += 1) setze(b, x + dx, yy, "#060607")
    if (i % 4 === 1) {
      // Pommesgabel: Arm, Faust, zwei Finger.
      for (let yy = y - 4; yy < y; yy += 1) setze(b, x + 4, yy, "#060607")
      setze(b, x + 3, y - 5, "#060607")
      setze(b, x + 5, y - 5, "#060607")
      setze(b, x + 3, y - 6, "#060607")
      setze(b, x + 5, y - 6, "#060607")
    }
  })

  // Zeichen und Wortmarke, gemeinsam mittig.
  const marke = "RIFF|FORGE"
  const markeBreite = breiteVon(GROSS, marke, 2)
  const gesamt = 20 + 8 + markeBreite
  const links = Math.floor((B - gesamt) / 2)
  // Der Totenkopf liegt im Raster auf Zeile 6–25 und Spalte 6–25.
  malen(b, zeichen, links - 6, 8 - 6, 1, ".")
  schreiben(b, GROSS, marke, links + 28, 10, BERNSTEIN, 2, SCHATTEN)

  const zeile = "15 MINUTEN AM TAG · RIFF FÜR RIFF"
  schreiben(b, KLEIN, zeile, Math.floor((B - breiteVon(KLEIN, zeile, 1)) / 2), 33, GRAU, 1)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" width="${B * 5}" height="${H * 5}" shape-rendering="crispEdges" role="img" aria-label="Riffforge — 15 Minuten am Tag, Riff für Riff">
<!-- Erzeugt von tools/readme-bilder.mjs aus assets/logo/totenkopf.txt. Nicht von Hand ändern. -->
<rect width="${B}" height="${H}" fill="${GRUND}"/>${svgRechtecke(b, { ohne: GRUND })}
</svg>
`
  writeFileSync(join(root, "assets/banner.svg"), svg)
  console.log(`assets/banner.svg · ${B}×${H} Pixel, ${(svg.length / 1024).toFixed(0)} KB`)
}

/* ───────────────────────────── Die Streifen ───────────────────────────── */

function rangszenen() {
  for (const datei of readdirSync(join(root, "public/merch")).filter((d) => d.startsWith("rang-"))) {
    const szene = pngLesen(join(root, "public/merch", datei))
    const gross = bild(szene.breite * 2, szene.hoehe * 2, GRUND)
    einsetzen(gross, szene, 0, 0, 2)
    writeFileSync(join(root, "assets/readme", datei), pngSchreiben(gross))
  }
  console.log("assets/readme/rang-*.png · 192×96")
}

/** Die Reihenfolge der Kutte im Merch-Stand, eine Leiter je Aufnäher. */
const KUTTE = ["debuet", "gigs", "serie", "comeback", "tight", "auf-den-punkt", "zieltempo", "licks", "sieben", "wissen", "taktgefuehl", "hals", "hals-beide"]

function kutte() {
  const groesse = 48
  const luecke = 8
  const streifen = bild(KUTTE.length * (groesse + luecke) - luecke, groesse, GRUND, false)
  KUTTE.forEach((gruppe, i) => {
    einsetzen(streifen, pngLesen(join(root, `public/merch/aufnaeher-${gruppe}.png`)), i * (groesse + luecke), 0, 2)
  })
  writeFileSync(join(root, "assets/readme/kutte.png"), pngSchreiben(streifen))
  console.log(`assets/readme/kutte.png · ${streifen.breite}×${streifen.hoehe}`)
}

mkdirSync(join(root, "assets/readme"), { recursive: true })
banner()
rangszenen()
kutte()
