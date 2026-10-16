import type { Technique } from "./types"

/**
 * A 16 × 16 pixel sign for each technique, for the drill list.
 *
 * Drawn from grids like the tour shirts, but with the app's colours, not a
 * picture's own: `a` is drawn in the current text colour and `b` in steel,
 * so the sign follows the line it sits in instead of bringing a palette of
 * its own. `.` is empty. `technik-zeichen.test.ts` holds every technique to
 * having one, at the right size.
 */

export const ZEICHEN_GROESSE = 16

export const TECHNIK_ZEICHEN: Record<Technique, string[]> = {
  // A flame: the fingers waking up.
  warmup: [
    ".......a........",
    "......aa........",
    "......aaa.......",
    ".....aaaa..a....",
    "....aaaaa.aa....",
    "....aaaaaaaa....",
    "...aaaabaaaaa...",
    "...aaabbbaaaa...",
    "..aaaabbbbaaaa..",
    "..aaabbbbbbaaa..",
    "..aaabbbbbbaaa..",
    "..aaaabbbbaaaa..",
    "...aaaabbaaaa...",
    "....aaaaaaaa....",
    ".....aaaaaa.....",
    "................",
  ],
  // Two strings, two frets, root and fifth — the shape the hand grips.
  "power-chords": [
    "................",
    ".a.....a.....a..",
    ".a.....a.....a..",
    "aaaaaaaaaaaaaaaa",
    ".a.....a.....a..",
    ".a.....a..bb.a..",
    "aaaaaaaaabbbbaaa",
    ".a.....a..bb.a..",
    ".a..bb.a.....a..",
    "aaabbbbaaaaaaaaa",
    ".a..bb.a.....a..",
    ".a.....a.....a..",
    "aaaaaaaaaaaaaaaa",
    ".a.....a.....a..",
    ".a.....a.....a..",
    "................",
  ],
  // The edge of the hand resting on the strings.
  "palm-mute": [
    "......a.a.a.....",
    "......a.a.a.....",
    "....a.a.a.a.....",
    "....a.a.a.a.....",
    "....a.a.a.a.....",
    "....aaaaaaa.a...",
    "....aaaaaaa.a...",
    "....aaaaaaaaa...",
    "....aaaaaaaa....",
    ".....aaaaaa.....",
    "......aaaa......",
    "................",
    "bbbbbbbbbbbbbbbb",
    "................",
    "bbbbbbbbbbbbbbbb",
    "................",
  ],
  // A pick and the one direction it travels.
  downpicking: [
    "................",
    "................",
    "..aaaaaaaa......",
    ".aaaaaaaaaa.....",
    ".aaaaaaaaaa..b..",
    ".aaaaaaaaaa..b..",
    "..aaaaaaaa...b..",
    "..aaaaaaaa...b..",
    "...aaaaaa....b..",
    "...aaaaaa....b..",
    "....aaaa...bbbbb",
    "....aaaa....bbb.",
    ".....aa......b..",
    ".....aa.........",
    "................",
    "................",
  ],
  // One eighth and two sixteenths under a beam — the gallop as it is written.
  gallop: [
    "................",
    "..aaaa..........",
    "..a.....aaaaaaaa",
    "..a.....aaaaaaaa",
    "..a.....a.....a.",
    "..a.....aaaaaaaa",
    "..a.....a.....a.",
    "..a.....a.....a.",
    "..a.....a.....a.",
    "..a.....a.....a.",
    "aaa...aaa...aaa.",
    "aaa...aaa...aaa.",
    "aa....aa....aa..",
    "................",
    "................",
    "................",
  ],
  // Down, then up.
  "alternate-picking": [
    "..a.........b...",
    "..a........bbb..",
    "..a.......bbbbb.",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "..a.........b...",
    "aaaaa.......b...",
    ".aaa........b...",
    "..a.........b...",
    "................",
  ],
  // A box: two notes on each string, the roots in steel.
  pentatonic: [
    "................",
    "..bb.......aa...",
    "..bb.......aa...",
    "................",
    "..aa.......aa...",
    "..aa.......aa...",
    "................",
    "..aa....aa......",
    "..aa....aa......",
    "................",
    "..bb....aa......",
    "..bb....aa......",
    "................",
    "..aa....aa......",
    "..aa....aa......",
    "................",
  ],
  // A string pushed up a whole step, and where it lands.
  bending: [
    "..........b.....",
    ".........bbb....",
    "........bbbbb...",
    "..........b.....",
    "..........b.....",
    ".........ab.....",
    "........aa......",
    ".......aa.......",
    "......aa........",
    ".....aa.........",
    "aaaaaa..........",
    "aaaaa...........",
    "................",
    "................",
    "................",
    "................",
  ],
  // Two notes under one slur: struck once.
  legato: [
    "................",
    "....bbbbbbbb....",
    "..bb........bb..",
    ".b............b.",
    "................",
    "....a.......a...",
    "....a.......a...",
    "....a.......a...",
    "....a.......a...",
    "....a.......a...",
    "..aaa.....aaa...",
    ".aaaa....aaaa...",
    ".aaa.....aaa....",
    "................",
    "................",
    "................",
  ],
  // From one fret to another without lifting.
  slides: [
    "................",
    "................",
    "...........aa...",
    "..........aaaa..",
    "..........aaaa..",
    "...........aa...",
    ".........b......",
    "........b.......",
    ".......b........",
    "......b.........",
    "..aa.b..........",
    ".aaaa...........",
    ".aaaa...........",
    "..aa............",
    "................",
    "................",
  ],
  // The X in the tab.
  "dead-notes": [
    "................",
    ".aa.........aa..",
    ".aaa.......aaa..",
    "..aaa.....aaa...",
    "...aaa...aaa....",
    "....aaa.aaa.....",
    ".....aaaaa......",
    "......aaa.......",
    ".....aaaaa......",
    "....aaa.aaa.....",
    "...aaa...aaa....",
    "..aaa.....aaa...",
    ".aaa.......aaa..",
    ".aa.........aa..",
    "................",
    "................",
  ],
  // A note with three strokes through the stem: picked as fast as it goes.
  tremolo: [
    "........a.......",
    "........a.......",
    "........a..bb...",
    "........abb.....",
    "......bba.......",
    "........a..bb...",
    "........abb.....",
    "......bba.......",
    "........a..bb...",
    "........abb.....",
    "......bba.......",
    "........a.......",
    "......aaa.......",
    ".....aaaa.......",
    ".....aaa........",
    "................",
  ],
}

/* ─────────────────────────── Als Aufnäher ─────────────────────────── */

/** The patch is a 24 × 24 shield, the size of the drawn patches in `public/merch/`. */
export const AUFNAEHER_GROESSE = 24

/**
 * Cloth by technique. Dark, as the drawn patches are, and different from one
 * another — eleven patches in one colour would be one patch eleven times.
 * Like the tour shirts these are the picture's own colours, not the app's.
 */
const TUCH: Record<Exclude<Technique, "warmup">, string> = {
  "power-chords": "#4a1612",
  "palm-mute": "#1c2d55",
  downpicking: "#2a2a30",
  gallop: "#3b2a1e",
  "alternate-picking": "#133838",
  pentatonic: "#2e2448",
  bending: "#5a2210",
  legato: "#1d3324",
  slides: "#34404c",
  "dead-notes": "#141416",
  tremolo: "#262a44",
}
/** Thread, from the drawn patches: cream for the motif, gold for the stitching. */
const RAND = "#0a0a0a"
const GARN = "#f2e2a8"
const GOLD = "#d8b44a"

/** Half the width of the shield in each row: straight sides, a point at the bottom. */
const halbeBreite = (y: number) => (y === 0 ? 11 : y <= 18 ? 12 : 12 - (y - 18) * 2)

const imSchild = (x: number, y: number) => {
  if (y < 0 || y >= AUFNAEHER_GROESSE) return false
  const w = halbeBreite(y)
  return x >= 12 - w && x < 12 + w
}

export interface PatchPixel {
  x: number
  y: number
  farbe: string
}

/**
 * The technique sign as an embroidered patch: a dark rim, gold stitching one
 * pixel in, the cloth, and the sign in the middle — `a` in cream thread, the
 * accent in gold. Computed rather than drawn, so the eleven patches cannot
 * drift from the signs in the drill list.
 */
export function technikAufnaeher(technik: Exclude<Technique, "warmup">): PatchPixel[] {
  const pixel: PatchPixel[] = []
  // Centred across; one pixel high of centre, so the sign sits in the straight
  // part of the shield and the point stays cloth.
  const links = (AUFNAEHER_GROESSE - ZEICHEN_GROESSE) / 2
  const oben = links - 1
  for (let y = 0; y < AUFNAEHER_GROESSE; y += 1) {
    for (let x = 0; x < AUFNAEHER_GROESSE; x += 1) {
      if (!imSchild(x, y)) continue
      const nachbarn = [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ]
      const rand = nachbarn.some(([nx, ny]) => !imSchild(nx, ny))
      // Stitching: every other pixel of the ring just inside the rim.
      const zweiterRing =
        !rand &&
        [
          [x - 2, y],
          [x + 2, y],
          [x, y - 2],
          [x, y + 2],
          [x - 1, y - 1],
          [x + 1, y - 1],
          [x - 1, y + 1],
          [x + 1, y + 1],
        ].some(([nx, ny]) => !imSchild(nx, ny))
      if (rand) pixel.push({ x, y, farbe: RAND })
      else if (zweiterRing && (x + y) % 2 === 0) pixel.push({ x, y, farbe: GOLD })
      else {
        const zeichen = TECHNIK_ZEICHEN[technik][y - oben]?.[x - links]
        pixel.push({ x, y, farbe: zeichen === "a" ? GARN : zeichen === "b" ? GOLD : TUCH[technik] })
      }
    }
  }
  return pixel
}
