/**
 * Tour shirts as pixel art: a 32 × 32 tee, coloured by the first word of the
 * tour name and printed with a motif for the second.
 *
 * Drawn from grids rather than shipped as images: twelve colours times twelve
 * motifs would be 144 files, and a grid of characters can be checked by a
 * test — every motif the right size, every word of the name covered. The
 * colours here are the shirt's *dye*, not the app's palette; they belong to
 * the picture the way the pixels in `public/merch/` do, which is why they are
 * not CSS variables.
 */

export const SHIRT_GROESSE = 32
export const MOTIV_GROESSE = 12

/** Shirt colours by the tour name's adjective. Dark, as band shirts are. */
export const STOFF: Record<string, string> = {
  Iron: "#3a3d42",
  Steel: "#34404c",
  Thunder: "#262a44",
  Heavy: "#1c1c20",
  Black: "#141416",
  Electric: "#2e2448",
  Molten: "#4a1612",
  Savage: "#2f3320",
  Midnight: "#141c34",
  Raw: "#3b2a1e",
  Burning: "#5a2210",
  Chrome: "#4a4c52",
}

/**
 * Prints by the tour name's noun. `a` is the main ink, `b` the second colour,
 * `.` is the shirt showing through.
 */
export const MOTIVE: Record<string, string[]> = {
  Riffs: [
    "..........aa",
    ".........aa.",
    "........aa..",
    ".......aa...",
    "......aa....",
    "..b..aa.....",
    "..bbaa......",
    ".bbbbb......",
    ".bbbb.......",
    "bbbbbb......",
    "bb..b.......",
    "b...........",
  ],
  Strings: [
    "..b..b..b...",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "..a..a..a..a",
    "...b..b..b..",
  ].map((zeile) => zeile.slice(1) + "."),
  Frets: [
    "aaaaaaaaaaaa",
    "a....a.....a",
    "a....a.....a",
    "aaaaaaaaaaaa",
    "a.b..a..b..a",
    "a....a.....a",
    "aaaaaaaaaaaa",
    "a....a.....a",
    "a..b.a..b..a",
    "aaaaaaaaaaaa",
    "a....a.....a",
    "aaaaaaaaaaaa",
  ],
  Pickups: [
    "............",
    ".aaaaaaaaaa.",
    ".a........a.",
    ".a.b.b.b..a.",
    ".a........a.",
    ".a.b.b.b..a.",
    ".a........a.",
    ".aaaaaaaaaa.",
    "a..........a",
    "a..........a",
    "aa........aa",
    "............",
  ],
  Amps: [
    "aaaaaaaaaaaa",
    "a.b.b.b.b..a",
    "aaaaaaaaaaaa",
    "a.a.a.a.a.aa",
    "aa.a.a.a.a.a",
    "a.a.a.a.a.aa",
    "aa.a.a.a.a.a",
    "a.a.a.a.a.aa",
    "aa.a.a.a.a.a",
    "a.a.a.a.a.aa",
    "aaaaaaaaaaaa",
    ".a........a.",
  ],
  Feedback: [
    "........a...",
    "...a.....a..",
    "..aa..a...a.",
    "aaaa...a..a.",
    "abba...a...a",
    "abba...a...a",
    "abba...a...a",
    "abba...a...a",
    "aaaa...a..a.",
    "..aa..a...a.",
    "...a.....a..",
    "........a...",
  ],
  Distortion: [
    "......aaaa..",
    ".....aaaa...",
    "....aaaa....",
    "...aaaa.....",
    "..aaaaaaaa..",
    "......aaa...",
    ".....aaa....",
    "....aaa.....",
    "...aab......",
    "..abb.......",
    "..bb........",
    "..b.........",
  ],
  Downstrokes: [
    "..a......a..",
    "..a......a..",
    "..a......a..",
    "..a......a..",
    "..a......a..",
    "aaaaa..aaaaa",
    ".aaa....aaa.",
    "..a......a..",
    "............",
    "bbbbbbbbbbbb",
    "............",
    "............",
  ],
  "Palm Mutes": [
    "....a.a.a...",
    "....a.a.a...",
    "..a.a.a.a...",
    "..a.a.a.a...",
    "..aaaaaaa.a.",
    "..aaaaaaaaa.",
    "..aaaaaaaa..",
    "...aaaaaa...",
    "....aaaa....",
    "............",
    "bbbbbbbbbbbb",
    "............",
  ],
  "Power Chords": [
    "aaaaaaaaa...",
    "aaaaaaaaa...",
    "aa..........",
    "aa..........",
    "aaaaaaaa....",
    "aaaaaaaaa...",
    ".......aa...",
    ".......aa.b.",
    ".......aa.b.",
    "aaaaaaaaa.b.",
    "aaaaaaaa..b.",
    "...........b",
  ],
  Tremolo: [
    "............",
    "a..a..a..a..",
    "aa.aa.aa.aa.",
    ".aa.aa.aa.aa",
    "..a..a..a..a",
    "............",
    "b..b..b..b..",
    "bb.bb.bb.bb.",
    ".bb.bb.bb.bb",
    "..b..b..b..b",
    "............",
    "............",
  ],
  Fuzz: [
    "aaaaaaaaaaaa",
    "a.b..b..b..a",
    "a..........a",
    "a..........a",
    "a...aaaa...a",
    "a..a....a..a",
    "a..a.bb.a..a",
    "a..a....a..a",
    "a...aaaa...a",
    "a..........a",
    "aaaaaaaaaaaa",
    "............",
  ],
}

/** Ink colours: a cream for the main print, a second colour that suits the dye. */
const TINTE = "#e6dcc4"
const ZWEITE = ["#c9a14a", "#c8463a", "#7fa6c9"]

/**
 * The silhouette of the tee, as its left half — the right is the mirror, so
 * the shirt cannot come out lopsided. `#` is cloth.
 */
const HALB = [
  "................",
  "................",
  "..........###...",
  "........######..",
  "......#########.",
  "....############",
  "...#############",
  "..##############",
  ".###############",
  "################",
  "###.############",
  "##...###########",
  ...Array.from({ length: 18 }, () => "......##########"),
  "................",
  "................",
]
const SCHNITT = HALB.map((zeile) => zeile + [...zeile].reverse().join(""))

export interface Pixel {
  x: number
  y: number
  farbe: string
}

/** Lighten or darken a `#rrggbb` colour by a factor — the fold and the seam. */
function schattiere(hex: string, faktor: number): string {
  const kanal = (i: number) => {
    const wert = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16)
    const neu = faktor >= 1 ? wert + (255 - wert) * (faktor - 1) : wert * faktor
    return Math.round(Math.max(0, Math.min(255, neu))).toString(16).padStart(2, "0")
  }
  return `#${kanal(0)}${kanal(1)}${kanal(2)}`
}

/** Splits a tour name into its adjective and noun — "Molten Palm Mutes Tour". */
export function shirtTeile(name: string): { stoff: string; motiv: string } {
  const ohneTour = name.replace(/ Tour$/, "")
  const stoff = Object.keys(STOFF).find((wort) => ohneTour.startsWith(`${wort} `)) ?? "Black"
  const motiv = ohneTour.slice(stoff.length + 1)
  return { stoff, motiv: motiv in MOTIVE ? motiv : "Riffs" }
}

/** The pixels of one shirt, ready to be drawn as rectangles. */
export function shirtPixel(name: string): Pixel[] {
  const { stoff, motiv } = shirtTeile(name)
  const zweite = ZWEITE[(Object.keys(STOFF).indexOf(stoff) + Object.keys(MOTIVE).indexOf(motiv)) % ZWEITE.length]
  return zeichne(SCHNITT, STOFF[stoff], MOTIVE[motiv], TINTE, zweite)
}

/**
 * One shirt from its parts: a cut, a dye, a print and two inks. Tour shirts
 * and festival shirts differ in all four, but not in how cloth, fold, neck
 * and print are laid on top of one another.
 */
function zeichne(
  schnitt: string[],
  grund: string,
  motiv: string[],
  tinte: string,
  zweite: string,
  aermel = false,
): Pixel[] {
  const pixel: Pixel[] = []
  const istStoff = (x: number, y: number) => schnitt[y]?.[x] === "#"

  for (let y = 0; y < SHIRT_GROESSE; y += 1) {
    for (let x = 0; x < SHIRT_GROESSE; x += 1) {
      if (!istStoff(x, y)) continue
      // A darker edge where the cloth meets the air, so the shape reads on a
      // dark card; a lighter fold down the left of the chest.
      const rand = !istStoff(x - 1, y) || !istStoff(x + 1, y) || !istStoff(x, y - 1) || !istStoff(x, y + 1)
      const falte = x === 9 && y > 12 && y < 28
      pixel.push({ x, y, farbe: rand ? schattiere(grund, 0.6) : falte ? schattiere(grund, 1.12) : grund })
    }
  }
  // The neck opening: the inside of the back shows through, darker.
  for (let y = 2; y <= 3; y += 1) {
    for (let x = 13; x <= 18; x += 1) pixel.push({ x, y, farbe: schattiere(grund, 0.45) })
  }

  // The print, centred on the chest.
  const links = 10
  const oben = 12
  motiv.forEach((zeile, dy) => {
    ;[...zeile].forEach((zeichen, dx) => {
      if (zeichen === "a") pixel.push({ x: links + dx, y: oben + dy, farbe: tinte })
      if (zeichen === "b") pixel.push({ x: links + dx, y: oben + dy, farbe: zweite })
    })
  })
  // A festival shirt has a stripe printed down each sleeve, in the second ink.
  if (aermel) {
    for (let y = 14; y <= 22; y += 1) {
      pixel.push({ x: 1, y, farbe: zweite }, { x: SHIRT_GROESSE - 2, y, farbe: zweite })
    }
  }
  return pixel
}

/* ─────────────────────────── Festival-Shirts ─────────────────────────── */

/**
 * The long-sleeve cut, as its left half like the tee: the sleeves hang down
 * beside the body to the wrist, with a gap under the arm so the shape reads
 * as a longsleeve at 48 px and not as a sack.
 */
const HALB_LANG = [
  ...HALB.slice(0, 10),
  "###.############",
  "###..###########",
  ...Array.from({ length: 14 }, () => "###...##########"),
  ...Array.from({ length: 4 }, () => "......##########"),
  "................",
  "................",
]
const LANGARM = HALB_LANG.map((zeile) => zeile + [...zeile].reverse().join(""))

/**
 * One festival shirt per rank reached, the first at *Proberaum*. Each has its
 * own dye, inks and a print about the rank — not the tour name's word game,
 * because it marks a step, not a season.
 */
export const FESTIVAL: Record<string, { stoff: string; tinte: string; zweite: string; motiv: string[] }> = {
  // A demo tape: what a band in the rehearsal room makes first.
  proberaum: {
    stoff: "#2f3320",
    tinte: TINTE,
    zweite: "#c8463a",
    motiv: [
      "............",
      "aaaaaaaaaaaa",
      "a..........a",
      "a.bbbbbbbb.a",
      "a..........a",
      "a..a....a..a",
      "a.a.abba.a.a",
      "a..a....a..a",
      "a..........a",
      "a..aaaaaa..a",
      "aaaaaaaaaaaa",
      "............",
    ],
  },
  // A microphone on its stand: the opening slot.
  vorband: {
    stoff: "#262a44",
    tinte: TINTE,
    zweite: "#c9a14a",
    motiv: [
      "....aaa.....",
      "...aaaaa....",
      "...ababa....",
      "...aaaaa....",
      "....aaa.....",
      ".....a......",
      ".....a......",
      ".....a......",
      ".....a......",
      ".....a......",
      "...aaaaa....",
      "..a..a..a...",
    ].map((zeile) => "." + zeile.slice(0, 11)),
  },
  // The laminate on its lanyard: on the tour, backstage.
  support: {
    stoff: "#3b2a1e",
    tinte: TINTE,
    zweite: "#7fa6c9",
    motiv: [
      "..a......a..",
      "...a....a...",
      "....a..a....",
      ".....aa.....",
      "..aaaaaaaa..",
      "..a......a..",
      "..a.bbbb.a..",
      "..a......a..",
      "..a.aaaa.a..",
      "..a.aa...a..",
      "..a......a..",
      "..aaaaaaaa..",
    ],
  },
  // The spotlight on an empty stage: it is yours now.
  headliner: {
    stoff: "#141416",
    tinte: TINTE,
    zweite: "#c9a14a",
    motiv: [
      "....aaaa....",
      "...aaaaaa...",
      "...abbbba...",
      "....b..b....",
      "...b....b...",
      "...b....b...",
      "..b......b..",
      "..b......b..",
      ".b........b.",
      ".b........b.",
      "b..........b",
      "aaaaaaaaaaaa",
    ],
  },
  // The horns, raised: a field full of them.
  festival: {
    stoff: "#4a1612",
    tinte: TINTE,
    zweite: "#c9a14a",
    motiv: [
      "..a......a..",
      "..a......a..",
      "..aa.....aa.",
      "..aa.....aa.",
      "..aa.....aa.",
      "..aaaaaaaaa.",
      "..aa.a.a.aa.",
      ".aaaaaaaaaa.",
      "..aaaaaaaaa.",
      "...aaaaaaa..",
      "....aaaaa...",
      "....aaaaa...",
    ],
  },
  // A gold record, in gold ink: the hall of fame.
  halloffame: {
    stoff: "#1c1c20",
    tinte: "#c9a14a",
    zweite: "#c8463a",
    motiv: [
      "....aaaa....",
      "..aaaaaaaa..",
      ".aaa....aaa.",
      ".aa.aaaa.aa.",
      "aa.aa..aa.aa",
      "aa.a.bb.a.aa",
      "aa.a.bb.a.aa",
      "aa.aa..aa.aa",
      ".aa.aaaa.aa.",
      ".aaa....aaa.",
      "..aaaaaaaa..",
      "....aaaa....",
    ],
  },
}

/** The pixels of the festival shirt for a rank. */
export function festivalPixel(rangId: string): Pixel[] {
  const f = FESTIVAL[rangId] ?? FESTIVAL.proberaum
  return zeichne(LANGARM, f.stoff, f.motiv, f.tinte, f.zweite, true)
}
