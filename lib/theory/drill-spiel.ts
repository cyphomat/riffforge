import { midiAt } from "./fretboard"

/**
 * Wie ein Drill klingt — als Daten neben der Tabulatur.
 *
 * Die Tabulatur eines Drills ist Text und kein Zeitraster: der Abstand der
 * Spalten sagt nur ungefähr, wie lang etwas dauert. Deshalb wird der Klang
 * nicht aus dem Text gelesen, sondern hier eigens notiert, und
 * `drill-spiel.test.ts` hält beides gegeneinander: dieselben Griffe in
 * derselben Reihenfolge, sonst fällt der Test.
 *
 * Ein Drill ist ein Raster (`raster` Schritte je Schlag) und eine Figur: je
 * Schritt ein Wort, mit Leerzeichen getrennt.
 *
 *   .        nichts Neues — was klingt, klingt weiter
 *   6:0      Saite 6, Bund 0 (angeschlagen). Die Saite gilt weiter, bis eine neue
 *            genannt wird: „6:1 2 3 4" sind vier Bünde auf Saite 6
 *   x        tote Note (Klacken ohne Ton) auf der Saite davor
 *   m…       Palm Mute: kurz und dumpf
 *   l…       Legato (Hammer-on, Pull-off): nicht angeschlagen, leiser
 *   P6:2     Powerchord, Grundton auf Saite 6 oder 5 (Quinte und Oktave
 *            zwei Bünde höher auf den nächsten beiden Saiten)
 *   /7  \5   Slide zum Bund 7 / 5 auf derselben Saite — kein neuer Anschlag
 *   b9       Bending zum Bund 9 — kein neuer Anschlag
 *
 * Alle Drills sind eigene Übungen; der Klang ist so geschrieben wie die Tabs.
 */

export interface Griff {
  saite: 1 | 2 | 3 | 4 | 5 | 6
  bund: number
}

/** Eine gespielte Stelle der Tabulatur: ein Griff oder mehrere zugleich, oder tot (`bund` fehlt). */
export interface TabGriff {
  saite: Griff["saite"]
  bund: number | "x"
}

export interface Spielweise {
  /** Schritte je Schlag: 1 = Viertel, 2 = Achtel, 4 = Sechzehntel. */
  raster: 1 | 2 | 4
  figur: string
}

export interface Anschlag {
  /** Schritt im Raster, 0-basiert. */
  schritt: number
  griffe: TabGriff[]
  dumpf: boolean
  gebunden: boolean
  /** Slide oder Bending: kein Anschlag, die vorige Note wandert zu diesem Griff. */
  folge?: "slide" | "bend"
}

export interface Figur {
  raster: Spielweise["raster"]
  /** Alle Schritte der Figur, auch die leeren — die Länge eines Durchgangs. */
  schritte: number
  anschlaege: Anschlag[]
}

const WORT = /^([mlP]*)(?:([1-6]):)?(?:(\d+|x)|([/\\b])(\d+))$/

function istSaite(n: number): n is Griff["saite"] {
  return n >= 1 && n <= 6
}

/** Liest eine Figur. Wirft bei einem Wort, das es nicht gibt — die Daten sind vom Menschen getippt. */
export function liesFigur(spiel: Spielweise): Figur {
  const worte = spiel.figur.split(/\s+/).filter(Boolean)
  const anschlaege: Anschlag[] = []
  let saite: Griff["saite"] | null = null

  worte.forEach((wort, schritt) => {
    if (wort === ".") return
    const m = WORT.exec(wort)
    if (!m) throw new Error(`Schritt ${schritt + 1}: „${wort}" ist kein Wort der Figur`)
    const [, flags, saiteWort, bundWort, folgeZeichen, folgeBund] = m

    if (saiteWort) saite = Number(saiteWort) as Griff["saite"]
    if (saite === null) throw new Error(`Schritt ${schritt + 1}: „${wort}" braucht eine Saite`)
    const dumpf = flags.includes("m")
    const gebunden = flags.includes("l")
    const kraftakkord = flags.includes("P")

    if (folgeZeichen) {
      if (anschlaege.length === 0) throw new Error(`Schritt ${schritt + 1}: ${wort} ohne Note davor`)
      if (kraftakkord || dumpf || gebunden) throw new Error(`Schritt ${schritt + 1}: ${wort} nimmt keine Zeichen davor`)
      anschlaege.push({
        schritt,
        griffe: [{ saite, bund: Number(folgeBund) }],
        dumpf: false,
        gebunden: false,
        folge: folgeZeichen === "b" ? "bend" : "slide",
      })
      return
    }

    const tot = bundWort === "x"
    const bund = tot ? "x" : Number(bundWort)
    if (kraftakkord) {
      if (saite !== 6 && saite !== 5) throw new Error(`Schritt ${schritt + 1}: Powerchord nur mit Grundton auf Saite 5 oder 6`)
      const quinte = tot ? "x" : (bund as number) + 2
      const griffe: TabGriff[] = [
        { saite, bund },
        { saite: (saite - 1) as Griff["saite"], bund: quinte },
        { saite: (saite - 2) as Griff["saite"], bund: quinte },
      ]
      anschlaege.push({ schritt, griffe, dumpf, gebunden, })
      return
    }
    if (!istSaite(saite)) throw new Error(`Schritt ${schritt + 1}: Saite ${saite} gibt es nicht`)
    anschlaege.push({ schritt, griffe: [{ saite, bund }], dumpf, gebunden })
  })

  if (worte.length === 0) throw new Error("Eine leere Figur klingt nach nichts")
  return { raster: spiel.raster, schritte: worte.length, anschlaege }
}

/** Die MIDI-Nummer eines Griffs; tot hat keine. */
export function midiVon(griff: TabGriff): number | null {
  return griff.bund === "x" ? null : midiAt({ saite: griff.saite, bund: griff.bund })
}

/**
 * Die Figuren der Drills, nach Drill-Id.
 *
 * Gelesen wird beim ersten Gebrauch, nicht beim Laden der Seite: nur wer
 * „Anhören" drückt, braucht die Figur.
 */
export const SPIELWEISEN: Record<string, Spielweise> = {
  // Eine Note je Klick, Bund für Bund über die Saiten.
  "warmup-chromatic": {
    raster: 1,
    figur:
      "6:1 2 3 4 5:1 2 3 4 4:1 2 3 4 3:1 2 3 4 2:1 2 3 4 1:1 2 3 4",
  },
  // Sechs Töne, dann zwei Schläge Luft, damit die Figur zwei Takte füllt.
  "warmup-string-skip": {
    raster: 1,
    figur: "5:5 3:5 5:7 3:5 5:8 3:5 . .",
  },
  // Powerchord, nur Abschläge, ein Anschlag je Klick.
  "tech-downpicking": {
    raster: 1,
    figur: "P6:0 P0 P0 P0 P0 P0 P0 P0",
  },
  "tech-palm-mute": {
    raster: 1,
    figur: "m6:0 m0 m0 m0 m0 m0 m0 m0 m0 m0 m0 m0",
  },
  // Achtel plus zwei Sechzehntel auf jeden Schlag.
  "tech-gallop": {
    raster: 4,
    figur: "m6:0 . m0 m0  m0 . m0 m0  m0 . m0 m0  m0 . m0 m0",
  },
  // Jeder Akkord zwei Schläge.
  "tech-power-chord-shifts": {
    raster: 1,
    figur: "P6:0 . P3 . P5 . P8 .",
  },
  "tech-alternate-picking": {
    raster: 2,
    figur: "6:5 6 7 8 7 6 5 6",
  },
  // Aufwärts durch die Box; zwei Schläge Luft, dann von vorn.
  "tech-pentatonic-box": {
    raster: 2,
    figur: "6:5 8 5:5 7 4:5 7 3:5 7 2:5 8 1:5 8 . . . .",
  },
  // Anschlagen, auf den nächsten Schlag ziehen und halten.
  "tech-bending": {
    raster: 1,
    figur: "3:7 b9 3:7 b9 3:7 b9 3:7 3:9",
  },
  // Zwei Gallops, dann G5 und F#5 auf je einem Schlag.
  "riff-ironclad": {
    raster: 4,
    figur: "mP6:0 . mP0 mP0  mP0 . mP0 mP0  P3 . . .  P2 . . .",
  },
  // Offene Chugs mit chromatischer Zielnote, Sechzehntel.
  "riff-chromatic-crawl": {
    raster: 4,
    figur: "m6:0 m0 m0 6:1  m0 m0 m0 6:2  m0 m0 m0 6:3  m0 m0 m0 6:5",
  },
  "riff-dirge": {
    raster: 1,
    figur: "P6:5 P5 P3 P3 P0 P0 P2 P2",
  },
  "riff-escape": {
    raster: 2,
    figur: "5:5 7 4:5 7 3:5 7 2:8 b10 2:8 3:7 . . . . . .",
  },
  "tech-legato": {
    raster: 4,
    figur: "6:5 l7 l5 .  6:7 l9 l7 .  6:5 l7 l5 .  6:7 l9 l7 .",
  },
  "tech-slides": {
    raster: 1,
    figur: "5:5 /7 5:7 \\5 5:5 /9 5:9 \\5",
  },
  // Klingende und tote Anschläge im Wechsel, Achtel.
  "tech-dead-notes": {
    raster: 2,
    figur: "m6:0 x m0 x m0 x m0 x m0 x m0 x . . . .",
  },
  "tech-tremolo": {
    raster: 4,
    figur:
      "6:0 0 0 0  0 0 0 0  0 0 0 0  0 0 0 0  3 3 3 3  3 3 3 3  3 3 3 3  3 3 3 3",
  },
  "riff-ghost": {
    raster: 4,
    figur: "m6:0 x m0 x  m0 x m0 x  P3 Px P3 Px  . . . .",
  },
  "riff-hammer": {
    raster: 2,
    figur: "6:0 l3 6:0 l5  6:0 l3 P5 .  6:0 l3 P3 .  . . . .",
  },
}

/** Der Klang eines Drills, falls er einen hat. */
export function spielweiseVon(drillId: string): Spielweise | undefined {
  return SPIELWEISEN[drillId]
}

/** Die Figur eines Drills, gelesen. Nur für Drills mit Klang. */
export function figurVon(drillId: string): Figur | undefined {
  const spiel = SPIELWEISEN[drillId]
  return spiel ? liesFigur(spiel) : undefined
}
