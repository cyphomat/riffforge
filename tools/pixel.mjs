/**
 * Pixelbilder ohne Browser: Raster lesen, PNG lesen und schreiben,
 * ganzzahlig vergrössern, als SVG aus Rechtecken ausgeben.
 *
 * Für tools/icons.mjs und tools/readme-bilder.mjs. Bewusst ohne Abhängigkeit —
 * `node:zlib` reicht für PNG, und ein Werkzeug, das für ein Icon einen
 * Chromium braucht, läuft irgendwann nicht mehr, wenn man es braucht.
 */
import { readFileSync } from "node:fs"
import { deflateSync, inflateSync } from "node:zlib"

/** Ein Raster aus einer Textdatei: Kommentarzeilen mit `#`, darin die Farben als `# x #rrggbb`. */
export function rasterLesen(pfad) {
  const zeilen = readFileSync(pfad, "utf8").split("\n")
  const farben = {}
  for (const zeile of zeilen) {
    const treffer = zeile.match(/^#\s(\S)\s(#[0-9a-f]{6})\b/i)
    if (treffer) farben[treffer[1]] = treffer[2]
  }
  const raster = zeilen.filter((z) => z.length > 0 && !z.startsWith("#"))
  const breite = raster[0].length
  for (const zeile of raster) {
    if (zeile.length !== breite) throw new Error(`${pfad}: Zeilen ungleich lang`)
    for (const zeichen of zeile) if (!(zeichen in farben)) throw new Error(`${pfad}: Farbe für „${zeichen}" fehlt`)
  }
  return { raster, farben, breite, hoehe: raster.length }
}

const hex = (farbe) => [1, 3, 5].map((i) => parseInt(farbe.slice(i, i + 2), 16))

/** Ein Bild als RGBA-Puffer — die eine Form, in der hier gerechnet wird. */
export function bild(breite, hoehe, grund = "#000000", deckend = true) {
  const daten = Buffer.alloc(breite * hoehe * 4)
  const [r, g, b] = hex(grund)
  for (let i = 0; i < breite * hoehe; i += 1) daten.set([r, g, b, deckend ? 255 : 0], i * 4)
  return { breite, hoehe, daten }
}

export function setze(ziel, x, y, farbe, alpha = 255) {
  if (x < 0 || y < 0 || x >= ziel.breite || y >= ziel.hoehe) return
  ziel.daten.set([...hex(farbe), alpha], (y * ziel.breite + x) * 4)
}

/** Ein Raster in ein Bild malen, jeder Punkt `faktor` × `faktor` gross. `.` bleibt frei, wenn `leer` gesetzt ist. */
export function malen(ziel, { raster, farben }, links, oben, faktor = 1, leer = null) {
  raster.forEach((zeile, y) =>
    [...zeile].forEach((zeichen, x) => {
      if (zeichen === leer) return
      for (let dy = 0; dy < faktor; dy += 1)
        for (let dx = 0; dx < faktor; dx += 1) setze(ziel, links + x * faktor + dx, oben + y * faktor + dy, farben[zeichen])
    }),
  )
}

/** Ein Bild in ein anderes kopieren, ganzzahlig vergrössert, Alpha über dem Grund verrechnet. */
export function einsetzen(ziel, quelle, links, oben, faktor = 1) {
  for (let y = 0; y < quelle.hoehe; y += 1)
    for (let x = 0; x < quelle.breite; x += 1) {
      const i = (y * quelle.breite + x) * 4
      const a = quelle.daten[i + 3] / 255
      if (a === 0) continue
      for (let dy = 0; dy < faktor; dy += 1)
        for (let dx = 0; dx < faktor; dx += 1) {
          const zx = links + x * faktor + dx
          const zy = oben + y * faktor + dy
          if (zx < 0 || zy < 0 || zx >= ziel.breite || zy >= ziel.hoehe) continue
          const j = (zy * ziel.breite + zx) * 4
          for (let k = 0; k < 3; k += 1) ziel.daten[j + k] = Math.round(quelle.daten[i + k] * a + ziel.daten[j + k] * (1 - a))
          ziel.daten[j + 3] = Math.max(ziel.daten[j + 3], quelle.daten[i + 3])
        }
    }
}

/* ─────────────────────────────── PNG ─────────────────────────────── */

const CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(puffer) {
  let c = 0xffffffff
  for (const byte of puffer) c = CRC[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function block(typ, inhalt) {
  const laenge = Buffer.alloc(4)
  laenge.writeUInt32BE(inhalt.length)
  const kopf = Buffer.from(typ, "ascii")
  const pruef = Buffer.alloc(4)
  pruef.writeUInt32BE(crc32(Buffer.concat([kopf, inhalt])))
  return Buffer.concat([laenge, kopf, inhalt, pruef])
}

/** RGBA, 8 Bit, ohne Filter — klein genug für Pixelkunst, und von jedem Leser lesbar. */
export function pngSchreiben({ breite, hoehe, daten }) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(breite, 0)
  ihdr.writeUInt32BE(hoehe, 4)
  ihdr.set([8, 6, 0, 0, 0], 8)
  const roh = Buffer.alloc(hoehe * (breite * 4 + 1))
  for (let y = 0; y < hoehe; y += 1) daten.copy(roh, y * (breite * 4 + 1) + 1, y * breite * 4, (y + 1) * breite * 4)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    block("IHDR", ihdr),
    block("IDAT", deflateSync(roh, { level: 9 })),
    block("IEND", Buffer.alloc(0)),
  ])
}

/** Liest RGBA-PNGs mit 8 Bit — das Format der Pixelkunst in public/merch/. */
export function pngLesen(pfad) {
  const datei = readFileSync(pfad)
  let i = 8
  let breite = 0
  let hoehe = 0
  const idat = []
  while (i < datei.length) {
    const laenge = datei.readUInt32BE(i)
    const typ = datei.toString("ascii", i + 4, i + 8)
    const inhalt = datei.subarray(i + 8, i + 8 + laenge)
    if (typ === "IHDR") {
      breite = inhalt.readUInt32BE(0)
      hoehe = inhalt.readUInt32BE(4)
      if (inhalt[8] !== 8 || inhalt[9] !== 6 || inhalt[12] !== 0) throw new Error(`${pfad}: nur RGBA, 8 Bit, ohne Zeilensprung`)
    }
    if (typ === "IDAT") idat.push(inhalt)
    i += 12 + laenge
  }
  const roh = inflateSync(Buffer.concat(idat))
  const zeile = breite * 4
  const daten = Buffer.alloc(hoehe * zeile)
  for (let y = 0; y < hoehe; y += 1) {
    const filter = roh[y * (zeile + 1)]
    for (let x = 0; x < zeile; x += 1) {
      const wert = roh[y * (zeile + 1) + 1 + x]
      const a = x >= 4 ? daten[y * zeile + x - 4] : 0
      const b = y > 0 ? daten[(y - 1) * zeile + x] : 0
      const c = x >= 4 && y > 0 ? daten[(y - 1) * zeile + x - 4] : 0
      const p = a + b - c
      const vorhersage =
        filter === 1 ? a
        : filter === 2 ? b
        : filter === 3 ? (a + b) >> 1
        : filter === 4 ? (Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c)
        : 0
      daten[y * zeile + x] = (wert + vorhersage) & 0xff
    }
  }
  return { breite, hoehe, daten }
}

/* ─────────────────────────────── SVG ─────────────────────────────── */

/**
 * Ein Bild als SVG aus Rechtecken, waagerechte Läufe gleicher Farbe zu einem
 * zusammengefasst. Scharf in jeder Grösse — GitHub kennt kein
 * `image-rendering: pixelated` und verschmiert vergrösserte PNGs.
 */
export function svgRechtecke({ breite, hoehe, daten }, { ohne = null } = {}) {
  const teile = []
  for (let y = 0; y < hoehe; y += 1) {
    let x = 0
    while (x < breite) {
      const i = (y * breite + x) * 4
      const farbe = `#${[0, 1, 2].map((k) => daten[i + k].toString(16).padStart(2, "0")).join("")}`
      let lauf = 1
      while (x + lauf < breite && daten.compare(daten, i, i + 4, i + lauf * 4, i + lauf * 4 + 4) === 0) lauf += 1
      if (daten[i + 3] > 0 && farbe !== ohne) teile.push(`<rect x="${x}" y="${y}" width="${lauf}" height="1" fill="${farbe}"/>`)
      x += lauf
    }
  }
  return teile.join("")
}
