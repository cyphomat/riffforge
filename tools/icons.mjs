#!/usr/bin/env node
/**
 * Erzeugt public/icons/ aus assets/logo/plektrum.svg.
 *
 * Eine Quelle, vier Grössen, zwei Zwecke. Von Hand gepflegte Icons laufen
 * auseinander: irgendwann trägt das 192er ein anderes Zeichen als das 512er,
 * und niemand merkt es, weil man sie nie nebeneinander sieht.
 *
 * `maskable` ist der Grund, warum es nicht bei einer Skalierung bleibt:
 * Android schneidet das Icon in eine Form seiner Wahl — Kreis, Rundeck,
 * Tropfen — und schneidet dabei bis zu 20 % vom Rand weg. Ein Zeichen, das
 * die Fläche füllt, verliert dort seine Spitze. Die maskierbare Fassung sitzt
 * deshalb kleiner in der Mitte, mit Grund bis zum Rand.
 *
 * Braucht Playwright und einen Chromium — wie tools/shots.mjs bewusst keine
 * Projekt-Abhängigkeit:
 *   CHROMIUM_PATH=/pfad/zu/chromium node tools/icons.mjs
 */
import { chromium } from "playwright"
import { readFile, mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const quelle = await readFile(join(root, "assets/logo/plektrum.svg"), "utf8")

/** Die Sicherheitszone maskierbarer Icons: innen 80 %, also 10 % je Seite. */
const MASKE = 0.72

const gewuenscht = [
  { datei: "icon-180.png", groesse: 180 },
  { datei: "icon-192.png", groesse: 192 },
  { datei: "icon-512.png", groesse: 512 },
  { datei: "icon-1024.png", groesse: 1024 },
  { datei: "icon-maskable-512.png", groesse: 512, maske: true },
]

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH })
await mkdir(join(root, "public/icons"), { recursive: true })

for (const { datei, groesse, maske } of gewuenscht) {
  const page = await browser.newPage({ viewport: { width: groesse, height: groesse } })
  // Das Zeichen schrumpft, der Grund nicht: sonst entstünde beim Maskieren
  // ein heller Rand um einen zu kleinen Kasten.
  const inhalt = maske
    ? quelle.replace(
        /<path /,
        `<g transform="translate(${(1 - MASKE) * 256} ${(1 - MASKE) * 256}) scale(${MASKE})"><path `,
      ).replace(/<\/svg>/, "</g></svg>")
    : quelle
  await page.setContent(
    `<style>html,body{margin:0;background:#0c0c0e}svg{display:block;width:100%;height:100%}</style>${inhalt}`,
  )
  await page.waitForTimeout(80)
  const bild = await page.screenshot({ omitBackground: false })
  await writeFile(join(root, "public/icons", datei), bild)
  await page.close()
  console.log(`${datei} · ${groesse}px${maske ? " · maskierbar" : ""}`)
}

await browser.close()
