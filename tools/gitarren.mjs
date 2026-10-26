#!/usr/bin/env node
/**
 * Erzeugt public/merch/gitarre-*.png: je Rang eine Gitarre fürs Rack.
 *
 * Die Formen stammen aus Roadie (dort als Pixelart von Hand gebaut, im Browser
 * auf eine Canvas gezeichnet); hier laufen sie ohne Browser, wie alle
 * Pixelkunst in der App. Jedes Bild ist 24 × 56, die Gitarre steht unten auf —
 * so stehen die Hälse im Rack auf einer Linie, wie auf einem Regal.
 *
 * Kontur, Licht und Schatten ergeben sich aus der Maske des Korpus: Randpunkte
 * sind Kontur, ein Punkt vom linken Rand Licht, vom rechten und unteren Schatten.
 *
 *   node tools/gitarren.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bild, pngSchreiben, setze } from "./pixel.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

/** Eine Gitarre je Rang, in der Reihenfolge von `RAENGE` — von schlicht bis Gold. */
const GITARREN = [
  { id: "garage", form: "dcut", kopf: "inline", farbe: "#ece0c4", akz: "#f2efe6", guard: "#6b2f22" },
  { id: "proberaum", form: "scut", kopf: "zwei", farbe: "#c8641e", akz: "#efe2c0", burst: 1 },
  { id: "vorband", form: "offset", kopf: "inline", farbe: "#86cbb8", akz: "#f2efe6", guard: "#3a2a22" },
  { id: "support", form: "vee", kopf: "spitz", farbe: "#1b1b1e", akz: "#c0282d" },
  { id: "headliner", form: "star", kopf: "spitz", farbe: "#a7b0b8", akz: "#2b3138" },
  { id: "festival", form: "dcut", kopf: "inline", farbe: "#4b2a6b", akz: "#d9c27a" },
  { id: "halloffame", form: "scut", kopf: "zwei", farbe: "#d6a92e", akz: "#2c2108" },
]

/* Der Korpus als Zeilen-Segmente (links, rechts) auf 24 Spalten, die Kopfplatten als Zeichenraster. */
const R=(n,seg)=>Array.from({length:n},()=>seg);
const SP={
  dcut:{rows:[[[5,6],[16,17]],[[4,7],[16,18]],[[4,8],[15,18]],[[3,9],[14,19]],...R(3,[[3,20]]),...R(2,[[4,19]]),...R(3,[[5,18]]),[[4,19]],[[3,20]],[[2,21]],...R(7,[[1,22]]),...R(2,[[2,21]]),[[3,20]],[[4,19]],[[6,17]],[[9,14]]],
    neckIn:6, pu:[12,17], bridge:21, knobs:[[17,22],[18,24],[15,25]],
    guard:[[8,[7,16]],...Array.from({length:12},(_,k)=>[9+k,[6,17]]),[21,[7,16]],[22,[8,15]]]},
  scut:{rows:[[[16,17]],[[15,18]],[[7,9],[14,19]],[[5,9],[14,19]],[[4,19]],...R(3,[[3,20]]),...R(3,[[4,19]]),[[3,20]],...R(2,[[2,21]]),...R(8,[[1,22]]),...R(2,[[2,21]]),[[3,20]],[[4,19]],[[6,17]],[[9,14]]],
    neckIn:5, pu:[11,16], bridge:20, knobs:[[17,21],[18,23],[15,24]]},
  offset:{rows:[[[4,5]],[[3,6]],[[3,7],[17,18]],[[3,8],[16,19]],[[3,9],[15,19]],[[3,20]],...R(2,[[4,20]]),...R(2,[[5,19]]),[[5,18]],[[4,18]],[[3,19]],[[2,20]],[[1,21]],...R(6,[[1,22]]),...R(2,[[1,21]]),[[2,20]],[[3,19]],[[5,18]],[[8,15]]],
    neckIn:6, pu:[12,17], bridge:21, knobs:[[17,22],[18,24],[15,25]],
    guard:[...Array.from({length:8},(_,k)=>[6+k,[k<2?6:7,9]]),[14,[5,9]],[15,[4,9]],[16,[4,9]],[17,[5,9]],[18,[6,9]]]},
  vee:{rows:[...R(2,[[9,14]]),...R(2,[[8,15]]),...R(2,[[7,16]]),...R(2,[[6,17]]),...R(3,[[5,18]]),...R(2,[[4,19]]),[[4,10],[13,19]],...R(2,[[3,9],[14,20]]),[[3,8],[15,20]],[[2,8],[15,21]],...R(2,[[2,7],[16,21]]),...R(2,[[1,6],[17,22]]),...R(2,[[1,5],[18,22]]),[[2,4],[19,21]]],
    neckIn:3, pu:[5,9], bridge:12, knobs:[[16,16],[17,18]]},
  etype:{rows:[[[19,20]],[[18,21]],[[17,21]],[[7,9],[16,21]],[[6,20]],[[5,20]],[[5,19]],[[4,19]],...R(2,[[4,18]]),[[3,18]],[[3,19]],[[3,20]],[[2,21]],...R(2,[[2,22]]),[[1,21]],[[1,19]],[[1,16]],[[0,13]],[[0,10]],[[0,7]],[[0,4]]],
    neckIn:4, pu:[6,10], bridge:14, knobs:[[18,16],[17,17]]},
  star:{rows:[[[9,14]],[[9,14],[19,20]],[[2,3],[9,14],[18,20]],[[2,4],[8,15],[17,20]],[[3,19]],[[4,19]],[[5,18]],...R(3,[[6,17]]),[[5,18]],[[4,19]],[[3,20]],[[2,10],[13,21]],[[1,9],[14,22]],[[1,7],[10,13],[16,22]],[[0,5],[10,13],[18,23]],[[0,3],[11,12],[20,23]],[[11,12]]],
    neckIn:3, pu:[4,8], bridge:11, knobs:[[15,12],[16,13]]},
  hollow:{rows:[[[6,8],[15,17]],[[4,9],[14,19]],[[3,20]],...R(2,[[2,21]]),...R(3,[[1,22]]),...R(2,[[2,21]]),...R(2,[[3,20]]),[[2,21]],[[1,22]],...R(8,[[0,23]]),...R(2,[[1,22]]),[[2,21]],[[3,20]],[[5,18]],[[8,15]]],
    neckIn:5, pu:[8,13], bridge:19, knobs:[[18,21],[19,23],[16,24]],
    fholes:[[4,13],[4,14],[5,15],[5,16],[4,17],[4,18],[19,13],[19,14],[18,15],[18,16],[19,17],[19,18]]},
  headless:{rows:[[[6,8],[15,17]],[[5,9],[14,18]],[[5,18]],...R(2,[[4,19]]),...R(2,[[5,18]]),[[4,19]],...R(6,[[3,20]]),[[4,19]],[[5,18]],[[7,16]]],
    neckIn:4, pu:[5], bridge:12, knobs:[[16,10]]}
};
const HEADS={
  inline:["............OOO.........","...........OHBBO........","..........OHBBO.........",".........MOHBO..........","..........OHBO..........",".........MOHBO..........","..........OHBO..........",".........MOHBO..........","..........OBBO..........","..........OWWO.........."],
  zwei:  ["..........OOOO..........",".........OHBBSO.........","........MOHBBSOM........",".........OHBBSO.........","........MOHBBSOM........",".........OHBBSO.........","........MOHBBSOM........",".........OHBBSO.........","..........OBBO..........","..........OWWO.........."],
  spitz: [".......OO...............",".......OHO..............","......MOHBO.............",".......OHBBO............","......MOHBBSO...........",".......OHBBBSO..........","......MOHBBBSO..........","........OHBBSO..........","..........OBSO..........","..........OWWO.........."],
  keiner:["........................","........................","........................","........................","........................","........................","........................","........................","..........OOOO..........","..........OMMO.........."]
};

const BREITE = 24
const HOEHE = 56
const HALS_OBEN = 10
const KORPUS_OBEN = 28

const hexRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const rgbHex = (rgb) => `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`
const shade = (rgb, f) => (f >= 0 ? rgb.map((c) => Math.round(c + (255 - c) * f)) : rgb.map((c) => Math.round(c * (1 + f))))

function gitarre(g) {
  const sp = SP[g.form]
  const B = hexRgb(g.farbe)
  const A = hexRgb(g.akz)
  const OUT = [20, 17, 22]
  const kopfFarbe = hexRgb(g.form === "scut" ? "#1c1a1e" : g.farbe)
  const zelle = Array.from({ length: HOEHE }, () => Array(BREITE).fill(null))

  // Korpusmaske
  const maske = Array.from({ length: HOEHE }, () => Array(BREITE).fill(false))
  sp.rows.forEach((segs, r) => {
    for (const [l, rr] of segs) for (let x = l; x <= rr; x += 1) maske[KORPUS_OBEN + r][x] = true
  })
  const drin = (x, y) => y >= 0 && y < HOEHE && x >= 0 && x < BREITE && maske[y][x]
  for (let y = 0; y < HOEHE; y += 1)
    for (let x = 0; x < BREITE; x += 1) {
      if (!maske[y][x]) continue
      if (!drin(x - 1, y) || !drin(x + 1, y) || !drin(x, y - 1) || !drin(x, y + 1)) {
        zelle[y][x] = "O"
        continue
      }
      let t = "B"
      if (!drin(x - 2, y)) t = "H"
      else if (!drin(x + 2, y) || !drin(x, y + 2)) t = "S"
      if (g.burst) {
        let d = 9
        for (let k = 1; k <= 5 && d === 9; k += 1) if (!drin(x - k, y) || !drin(x + k, y) || !drin(x, y - k) || !drin(x, y + k)) d = k
        t = d <= 2 ? "S" : d === 3 ? "B" : d === 4 ? "D" : "C"
      }
      zelle[y][x] = t
    }

  // Schlagbrett
  for (const [r, [l, rr]] of g.guard ? (sp.guard ?? []) : [])
    for (let x = l; x <= rr; x += 1) {
      const y = KORPUS_OBEN + r
      if (zelle[y][x] && zelle[y][x] !== "O") zelle[y][x] = "G"
    }

  // Hals vom Sattel bis in den Korpus, mit Bünden und Einlagen
  const halsEnde = KORPUS_OBEN + sp.neckIn
  for (let y = HALS_OBEN; y < halsEnde; y += 1) {
    zelle[y][10] = "O"
    zelle[y][13] = "O"
    zelle[y][11] = "N"
    zelle[y][12] = "N"
  }
  for (const y of [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32].filter((y) => y > HALS_OBEN && y < halsEnde - 1)) {
    zelle[y][11] = "R"
    zelle[y][12] = "R"
  }
  for (const y of [15, 19, 23, 27]) if (y > HALS_OBEN && y < halsEnde - 1 && zelle[y][11] === "N") zelle[y][11] = "I"

  // Kopfplatte
  HEADS[g.kopf].forEach((zeile, y) => {
    for (let x = 0; x < BREITE; x += 1) {
      const c = zeile[x]
      if (c && c !== "." && zelle[y][x] == null) zelle[y][x] = c === "B" || c === "H" || c === "S" ? `k${c}` : c
    }
  })

  // Tonabnehmer, Brücke, Regler
  for (const r of sp.pu) {
    const y = KORPUS_OBEN + r
    for (let x = 8; x <= 15; x += 1) {
      zelle[y][x] = x === 8 || x === 15 ? "O" : "Q"
      zelle[y + 1][x] = x === 8 || x === 15 ? "O" : "P"
    }
  }
  for (let x = 8; x <= 15; x += 1) zelle[KORPUS_OBEN + sp.bridge][x] = x === 8 || x === 15 ? "O" : "M"
  for (const [x, r] of sp.knobs) zelle[KORPUS_OBEN + r][x] = "K"

  const FARBE = {
    O: OUT,
    B,
    H: shade(B, 0.38),
    S: shade(B, -0.35),
    C: shade(B, 0.32),
    D: shade(B, 0.12),
    G: hexRgb(g.guard ?? "#000000"),
    N: [62, 38, 22],
    R: [150, 140, 128],
    I: [236, 230, 214],
    W: [240, 236, 222],
    M: [205, 205, 210],
    kB: kopfFarbe,
    kH: shade(kopfFarbe, 0.3),
    kS: shade(kopfFarbe, -0.35),
    Q: shade(A, 0.25),
    P: A,
    K: A,
    T: shade(B, -0.18),
  }
  if (g.burst) Object.assign(FARBE, { S: shade(B, -0.62), B: shade(B, -0.35), D: B, C: shade(B, 0.38) })

  // Unten bündig: die Gitarre steht auf dem Regal, die Kopfplatten enden verschieden hoch.
  const letzte = zelle.findLastIndex((zeile) => zeile.some(Boolean))
  const versatz = HOEHE - 1 - letzte
  const ziel = bild(BREITE, HOEHE, "#000000", false)
  zelle.forEach((zeile, y) =>
    zeile.forEach((c, x) => {
      if (c) setze(ziel, x, y + versatz, rgbHex(FARBE[c] ?? OUT))
    }),
  )
  return ziel
}

mkdirSync(join(root, "public/merch"), { recursive: true })
for (const g of GITARREN) {
  writeFileSync(join(root, "public/merch", `gitarre-${g.id}.png`), pngSchreiben(gitarre(g)))
  console.log(`public/merch/gitarre-${g.id}.png · ${BREITE}×${HOEHE}`)
}
