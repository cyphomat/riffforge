/**
 * Pixelfeuer — der Feuer-Algorithmus aus dem PSX-Doom, aus Setlist übernommen.
 *
 * Die unterste Reihe glüht, jedes Pixel steigt nach oben, kühlt dabei zufällig
 * ab und weht ein wenig zur Seite. Mehr ist es nicht; die Palette macht aus
 * Zahlen zwischen 0 und 36 Glut, Flamme und eine weisse Spitze.
 *
 * Rein und ohne Browser: der Zufall kommt von aussen, damit der Test ihn
 * festhalten kann. Gezeichnet wird in `components/ui/pixel-feuer.tsx`.
 */

export type Farbe = readonly [number, number, number, number]

const STUFEN: Farbe[] = [
  [0, 0, 0, 0],
  [31, 7, 7, 90],
  [71, 15, 7, 150],
  [143, 39, 7, 200],
  [191, 71, 7, 230],
  [223, 87, 7, 245],
  [215, 111, 15, 255],
  [207, 135, 23, 255],
  [199, 151, 31, 255],
  [191, 167, 39, 255],
  [223, 223, 159, 255],
  [255, 255, 255, 255],
]

/** 37 Stufen von durchsichtig über Rot und Gelb bis Weiss. */
export const PALETTE: Farbe[] = Array.from({ length: 37 }, (_, i) => {
  const f = (i / 36) * (STUFEN.length - 1)
  const a = Math.floor(f)
  const b = Math.min(a + 1, STUFEN.length - 1)
  const t = f - a
  return STUFEN[a].map((v, k) => Math.round(v + (STUFEN[b][k] - v) * t)) as unknown as Farbe
})

export const HEISS = PALETTE.length - 1

/** Ein Feld: Breite, Höhe, je Pixel eine Hitze von 0 bis 36. */
export interface Feld {
  w: number
  h: number
  px: Uint8Array
}

export const feld = (w: number, h: number): Feld => ({ w, h, px: new Uint8Array(w * h) })

/**
 * Ein Schritt. `an`: unten nachlegen oder ausgehen lassen. Gibt zurück, ob noch
 * irgendwo etwas glüht — sonst darf die Schleife enden.
 */
export function schritt(f: Feld, an: boolean, kuehlung = 2, zufall: () => number = Math.random): boolean {
  const { w, h, px } = f
  for (let x = 0; x < w; x += 1) {
    const i = (h - 1) * w + x
    px[i] = an ? HEISS - ((zufall() * 4) | 0) : Math.max(0, px[i] - 4)
  }
  for (let x = 0; x < w; x += 1)
    for (let y = 1; y < h; y += 1) {
      const quelle = y * w + x
      const p = px[quelle]
      if (!p) {
        px[quelle - w] = 0
        continue
      }
      const ziel = quelle - ((zufall() * 3) | 0) + 1 - w
      if (ziel >= 0 && ziel < px.length) px[ziel] = Math.max(0, p - ((zufall() * (kuehlung + 1)) | 0))
    }
  let glueht = 0
  for (let i = 0; i < px.length; i += 1) glueht |= px[i]
  return glueht > 0
}
