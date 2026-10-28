/**
 * Anlässe: saisonale Banner auf *Heute*.
 *
 * Reine Logik, ohne React und Browser: welcher Anlass trifft auf welchen Tag,
 * und was bleibt, wenn zwei zugleich treffen. Ob er gezeigt wird (Schalter,
 * "für heute ausblenden") liegt in `lib/storage/lokal.ts`, die Darstellung in
 * `components/session/anlass-banner.tsx`, die Motive baut `tools/anlaesse.mjs`.
 *
 * Die Regeln stammen aus Setlist (`js/anlaesse.js`, dort zuerst gebaut) und
 * stehen hier ein zweites Mal — die Repos teilen keinen Code. Die Tests
 * tragen dieselben Fälle, damit beide Fassungen zusammenbleiben.
 *
 * Nur öffentliche Anlässe, nichts Persönliches: Riffforge hat keine Daten,
 * aus denen sich Geburtstage oder Konzerte ergäben, und das soll so bleiben.
 */

/** Die Motive, je eine Datei `public/bilder/anlass-<id>.png`. */
export const MOTIVE = ["tannenbaum", "geschenk", "kerze"] as const
export type MotivId = (typeof MOTIVE)[number]

/** Kantenlänge eines Motivs in Pixeln. Gezeichnet wird nur ganzzahlig, 3 ×. */
export const MOTIV_KANTE = 15

export function motivBild(id: MotivId): string {
  return `/bilder/anlass-${id}.png`
}

/**
 * Wann ein Tag zutrifft.
 *
 * - `fix`: Monat und Tag.
 * - `ostern`: Tage vor (negativ) oder nach dem Ostersonntag.
 * - `nth`: der n-te Wochentag eines Monats (Wochentag 0 = Sonntag, n = -1 für
 *   den letzten).
 * - `datum`: einmalig, `JJJJ-MM-TT`.
 */
export type Regel =
  | { fix: [number, number] }
  | { ostern: number }
  | { nth: { monat: number; wochentag: number; n: number } }
  | { datum: string }

/** Phase: von bis bis. Tag und Gedenktag: ein Tag, nach `regel`. */
export type AnlassTyp = "phase" | "tag" | "gedenk"

export interface Anlass {
  id: string
  typ: AnlassTyp
  name: string
  /** Mehrere wechseln mit dem Tag des Monats, einer bleibt. */
  saetze: string[]
  /** Motive nebeneinander im Banner. */
  bild: MotivId[]
  regel?: Regel
  von?: Regel
  bis?: Regel
  /**
   * Der Aufnäher dazu (`lib/session/merch.ts`): verdient, wenn an einem Tag des
   * Anlasses geübt wurde. Er steht erst an der Kutte, wenn er verdient ist.
   */
  patch?: { titel: string; text: string }
}

/**
 * Gedenktag vor Einzeltag vor Phase: ein Gedenktag bleibt schlicht, auch
 * mitten in einer Phase.
 */
export const RANG: Record<AnlassTyp, number> = { gedenk: 0, tag: 1, phase: 2 }

/**
 * Die Anlässe dieser Fassung. Ostern und Halloween folgen, sobald ihre Motive
 * da sind. Sätze ohne ß, wie der übrige Text der App.
 */
export const STANDARD: Anlass[] = [
  {
    id: "weihnachten",
    typ: "phase",
    name: "Weihnachten",
    von: { fix: [12, 1] },
    bis: { fix: [12, 26] },
    bild: ["tannenbaum", "geschenk", "tannenbaum"],
    patch: { titel: "Weihnachtsgig", text: "In der Weihnachtszeit geübt." },
    saetze: [
      "Die Lichterkette hängt. Das Plektrum auch?",
      "Plätzchen nach der Session, nicht davor.",
      "Die Feiertage sind die Zugabe. Fünf Minuten reichen.",
    ],
  },
  {
    id: "lemmy",
    typ: "gedenk",
    name: "Lemmy",
    regel: { fix: [12, 28] },
    bild: ["kerze"],
    patch: { titel: "Lemmy", text: "An seinem Todestag geübt." },
    saetze: ["Lemmy Kilmister, 1945 bis 2015. Heute etwas Lautes."],
  },
  {
    id: "ozzy",
    typ: "gedenk",
    name: "Ozzy",
    regel: { fix: [7, 22] },
    bild: ["kerze"],
    patch: { titel: "Ozzy", text: "An seinem Todestag geübt." },
    saetze: ["Ozzy Osbourne, 1948 bis 2025. Ein Riff in seinem Namen."],
  },
]

const zwei = (n: number) => String(n).padStart(2, "0")

/** Datum plus n Tage, als `JJJJ-MM-TT`. UTC, damit keine Sommerzeit stört. */
export function plusTage(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10)
}

/** Ostersonntag nach der Gaußschen Formel (gregorianisch). */
export function ostern(y: number): string {
  const a = y % 19
  const b = Math.floor(y / 100)
  const c = y % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const monat = Math.floor((h + l - 7 * m + 114) / 31)
  const tag = ((h + l - 7 * m + 114) % 31) + 1
  return `${y}-${zwei(monat)}-${zwei(tag)}`
}

/** Das Datum einer Regel im Jahr y — oder null, wenn es dort keins gibt. */
export function datum(regel: Regel | null | undefined, y: number): string | null {
  if (!regel) return null

  if ("fix" in regel && Array.isArray(regel.fix)) {
    const [m, d] = regel.fix
    // 29.2. im Nichtschaltjahr wird zum 28.2.
    const letzter = new Date(Date.UTC(y, m, 0)).getUTCDate()
    return `${y}-${zwei(m)}-${zwei(Math.min(d, letzter))}`
  }

  if ("ostern" in regel && typeof regel.ostern === "number") return plusTage(ostern(y), regel.ostern)

  if ("datum" in regel && typeof regel.datum === "string") {
    return regel.datum.slice(0, 4) === String(y) ? regel.datum : null
  }

  if ("nth" in regel && regel.nth) {
    const { monat, wochentag, n } = regel.nth
    const letzter = new Date(Date.UTC(y, monat, 0)).getUTCDate()
    let tag: number
    if (n > 0) {
      const erster = new Date(Date.UTC(y, monat - 1, 1)).getUTCDay()
      tag = 1 + ((wochentag - erster + 7) % 7) + 7 * (n - 1)
      if (tag > letzter) return null
    } else {
      const wl = new Date(Date.UTC(y, monat - 1, letzter)).getUTCDay()
      tag = letzter - ((wl - wochentag + 7) % 7)
    }
    return `${y}-${zwei(monat)}-${zwei(tag)}`
  }

  return null
}

/** Trifft der Anlass auf den Tag iso? Phasen dürfen über den Jahreswechsel laufen. */
export function trifft(a: Anlass, iso: string): boolean {
  const jahr = Number(iso.slice(0, 4))
  if (a.typ === "phase") {
    for (const y of [jahr - 1, jahr]) {
      const von = datum(a.von, y)
      let bis = datum(a.bis, y)
      if (!von || !bis) return false
      if (bis < von) bis = datum(a.bis, y + 1)
      if (bis && iso >= von && iso <= bis) return true
    }
    return false
  }
  return datum(a.regel, jahr) === iso
}

/** Der Anlass für den Tag (höchstens einer, nach Rang) oder null. */
export function fuer(iso: string, liste: Anlass[] = STANDARD): Anlass | null {
  const treffer = liste.filter((a) => a && a.typ in RANG && trifft(a, iso))
  treffer.sort((a, b) => RANG[a.typ] - RANG[b.typ])
  return treffer[0] ?? null
}

export function finde(id: string, liste: Anlass[] = STANDARD): Anlass | null {
  return liste.find((a) => a.id === id) ?? null
}

/** Der Satz des Tages. Mehrere Sätze wechseln mit dem Tag des Monats. */
export function satzFuer(a: Anlass, iso: string): string {
  return a.saetze[Number(iso.slice(8, 10)) % a.saetze.length]
}

/** Lokales Datum als `JJJJ-MM-TT` — nicht UTC: um 0:30 gilt schon der neue Tag. */
export function isoLokal(d: Date = new Date()): string {
  return `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}`
}
