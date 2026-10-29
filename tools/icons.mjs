#!/usr/bin/env node
/**
 * Erzeugt public/icons/ aus assets/logo/totenkopf.txt.
 *
 * Eine Quelle, alle Grössen, zwei Zwecke. Von Hand gepflegte Icons laufen
 * auseinander: irgendwann trägt das 192er ein anderes Zeichen als das 512er,
 * und niemand merkt es, weil man sie nie nebeneinander sieht.
 *
 * Das Zeichen ist Pixelkunst auf 32 × 32 und wird deshalb nur **ganzzahlig**
 * vergrössert — wie alle Pixelkunst in der App. Wo die Grösse kein Vielfaches
 * von 32 ist (180), bekommt es den nächstkleineren Faktor und Grund drumherum;
 * ein krummer Faktor verschmiert die Stufen, an denen man es erkennt.
 *
 * `maskable` sitzt kleiner in der Mitte: Android schneidet das Icon in eine
 * Form seiner Wahl und dabei bis zu 20 % vom Rand weg. Ein Zeichen, das die
 * Fläche füllt, verlöre dort seine Spitze.
 *
 *   node tools/icons.mjs
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { bild, malen, pngSchreiben, rasterLesen, svgRechtecke } from "./pixel.mjs"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const zeichen = rasterLesen(join(root, "assets/logo/totenkopf.txt"))
const GRUND = zeichen.farben["."]

const gewuenscht = [
  // Der Tab im Browser: 32 px ist das Raster selbst, Punkt für Punkt.
  { datei: "icon-32.png", groesse: 32 },
  { datei: "icon-180.png", groesse: 180 },
  { datei: "icon-192.png", groesse: 192 },
  { datei: "icon-512.png", groesse: 512 },
  { datei: "icon-1024.png", groesse: 1024 },
  // 10 × 32 = 320 von 512: gut 62 %, sicher innerhalb der 80 %, die Android stehen lässt.
  { datei: "icon-maskable-512.png", groesse: 512, faktor: 10 },
]

mkdirSync(join(root, "public/icons"), { recursive: true })
for (const { datei, groesse, faktor = Math.floor(groesse / zeichen.breite) } of gewuenscht) {
  const icon = bild(groesse, groesse, GRUND)
  const rand = Math.floor((groesse - zeichen.breite * faktor) / 2)
  malen(icon, zeichen, rand, rand, faktor, ".")
  writeFileSync(join(root, "public/icons", datei), pngSchreiben(icon))
  console.log(`${datei} · ${groesse}px · ${faktor}×${faktor === 10 ? " · maskierbar" : ""}`)
}

// Das Zeichen allein, ohne Grund und auf seine 20 × 20 beschnitten: für die
// Navigation neben der Wortmarke. Als SVG aus Rechtecken bleibt es in jeder
// Grösse scharf, auch dort, wo der Browser ein PNG weichzeichnen würde.
const zeilen = zeichen.raster.map((zeile, y) => [y, zeile]).filter(([, zeile]) => /[^.]/.test(zeile))
const spalten = zeichen.raster.flatMap((zeile) => [...zeile].flatMap((p, x) => (p === "." ? [] : [x])))
const oben = zeilen[0][0]
const links = Math.min(...spalten)
const hoehe = zeilen.length
const breite = Math.max(...spalten) - links + 1
const frei = bild(breite, hoehe, GRUND, false)
malen(frei, zeichen, -links, -oben, 1, ".")
writeFileSync(
  join(root, "public/icons/totenkopf.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breite} ${hoehe}" width="${breite}" height="${hoehe}" shape-rendering="crispEdges">${svgRechtecke(frei)}</svg>\n`,
)
console.log(`totenkopf.svg · ${breite}×${hoehe}, ohne Grund`)

// Das Favicon, das Next aus `app/icon.svg` selbst ausliefert: das ganze
// 32er-Raster mit Grund, als Rechtecke. Stand hier bis Oktober ein Amboss von
// Hand — und blieb es, als alle anderen Icons längst ein anderes Zeichen
// trugen. Jetzt kommt es aus derselben Quelle wie der Rest.
const kachel = bild(zeichen.breite, zeichen.hoehe, GRUND)
malen(kachel, zeichen, 0, 0, 1, ".")
writeFileSync(
  join(root, "app/icon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${zeichen.breite} ${zeichen.hoehe}" shape-rendering="crispEdges"><rect width="${zeichen.breite}" height="${zeichen.hoehe}" fill="${GRUND}"/>${svgRechtecke(kachel, { ohne: GRUND })}</svg>\n`,
)
console.log("app/icon.svg · 32×32 mit Grund")

// Die Startseite liegt auf einer fremden Adresse und lädt nichts nach — das
// Zeichen steht deshalb eingebettet darin, zwischen zwei Markierungen, damit
// es nicht von Hand gepflegt auseinanderläuft.
const landing = join(root, "landing/index.html")
const seite = readFileSync(landing, "utf8")
const eingebettet = `<svg viewBox="0 0 ${breite} ${hoehe}" shape-rendering="crispEdges" aria-hidden="true">${svgRechtecke(frei)}</svg>`
const neu = seite.replace(
  /(<!-- zeichen: von tools\/icons\.mjs eingesetzt -->)[\s\S]*?(<!-- \/zeichen -->)/,
  `$1${eingebettet}$2`,
)
if (neu === seite && !seite.includes(eingebettet)) throw new Error("landing/index.html: Markierung für das Zeichen fehlt")
writeFileSync(landing, neu)
console.log("landing/index.html · Zeichen eingesetzt")
