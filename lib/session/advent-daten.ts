import { z } from "zod"
import type { Form, Material } from "./gurt"
import { songSchema, notenwerteOf, abstaendeOf, toeneOf, type Dauer, type Song, type SongNote } from "@/lib/theory/song"

/**
 * Die 24 Türchen des Advents: gemischt aus Mini-Riffen, Plektren, Tipps und
 * zwei Aufnähern. Alles ist für diese App geschrieben — eigene Melodien, keine
 * abgeschriebenen Stücke, und keine Fakten, die nicht belegt wären.
 *
 * Ein Türchen ist ein Datensatz, kein Dienst: Riffforge ist ein statischer
 * Export, ein neues Jahr ist ein Commit. Welche Türchen offen sind, rechnet
 * `advent.ts` aus dem Log; hier steht nur, was dahinter liegt.
 */

export const TUERCHEN_ANZAHL = 24

/** Die Türchen, hinter denen ein Aufnäher liegt. */
export const AUFNAEHER_TUERCHEN = [12, 24] as const

const hex = z.string().regex(/^#[0-9a-f]{6}$/i)

export const adventPlektrumSchema = z.object({
  id: z.string().regex(/^advent-[a-z-]+$/),
  name: z.string().trim().min(1).max(40),
  farbe: hex,
  form: z.enum(["std", "jazz", "tri"]),
  material: z.enum(["holz", "horn", "stein", "metall", "filz", "perl", "gold"]).optional(),
  /** Ein Satz in eigenen Worten. */
  text: z.string().trim().min(1).max(160),
})

export const adventTippSchema = z.object({
  titel: z.string().trim().min(1).max(40),
  text: z.string().trim().min(1).max(220),
  /** Die Theorie dazu — sie steht am Tipp, wie das `why` am Drill. */
  warum: z.string().trim().min(1).max(260),
})

export const adventRiffSchema = z.object({
  id: z.string().regex(/^advent-riff-[a-z-]+$/),
  titel: z.string().trim().min(1).max(40),
  /** Worauf es bei diesem Riff ankommt, ein Satz. */
  hinweis: z.string().trim().min(1).max(160),
  startBpm: z.number().int().min(30).max(200),
  targetBpm: z.number().int().min(30).max(200),
  song: songSchema,
})

export type AdventPlektrum = z.infer<typeof adventPlektrumSchema>
export type AdventTipp = z.infer<typeof adventTippSchema>
export type AdventRiff = z.infer<typeof adventRiffSchema>

export type Tuerchen =
  | { nr: number; art: "tipp"; tipp: AdventTipp }
  | { nr: number; art: "plektrum"; plektrum: AdventPlektrum }
  | { nr: number; art: "riff"; riff: AdventRiff }
  | { nr: number; art: "aufnaeher"; titel: string; text: string }

/* ───────────────────────────── Riffe ───────────────────────────── */

type Eintrag = readonly [saite: SongNote["griff"]["saite"], bund: number, dauer: Dauer, artikulation?: SongNote["artikulation"]]

/**
 * Ein Riff aus einer Liste von Noten, lückenlos hintereinander. Eine Pause
 * ist ein `null` mit ihrer Dauer. Das Lernziel wird aus den Noten gerechnet:
 * die Mini-Riffe sind Schmuck, kein Lehrgang, und `pruefeSong` prüft trotzdem
 * das Raster (Notenwert beginnt auf einem Vielfachen seiner Länge, keine Note
 * über die Taktgrenze).
 */
function riff(grundton: Song["grundton"], takte: number, liste: ReadonlyArray<Eintrag | readonly [null, Dauer]>): Song {
  let start = 0
  const noten: SongNote[] = []
  for (const e of liste) {
    if (e[0] === null) {
      start += e[1]
      continue
    }
    const [saite, bund, dauer, artikulation] = e as Eintrag
    noten.push({ griff: { saite, bund }, start, dauer, artikulation: artikulation ?? "normal" })
    start += dauer
  }
  const rohling = { grundton, takte, noten, lernziel: { toene: ["E" as const], abstaende: [0], notenwerte: [2 as Dauer] } }
  return {
    ...rohling,
    lernziel: { toene: toeneOf(rohling), abstaende: abstaendeOf(rohling), notenwerte: notenwerteOf(rohling) },
  }
}

const RIFFE: Record<string, AdventRiff> = {
  schneeketten: {
    id: "advent-riff-schneeketten",
    titel: "Schneeketten",
    hinweis: "Nur Viertel auf der tiefen E-Saite. Gleichmäßig wie Ketten im Schnee.",
    startBpm: 60,
    targetBpm: 100,
    song: riff("E", 2, [
      [6, 0, 2], [6, 0, 2], [6, 0, 2], [6, 3, 2],
      [6, 5, 2], [6, 5, 2], [6, 3, 2], [6, 0, 2],
    ]),
  },
  lametta: {
    id: "advent-riff-lametta-gallop",
    titel: "Lametta-Gallop",
    hinweis: "Zwei Achtel, dann ein Viertel. Die Achtel leicht, das Viertel schwer.",
    startBpm: 60,
    targetBpm: 96,
    song: riff("E", 2, [
      [6, 0, 1], [6, 0, 1], [6, 3, 2], [6, 0, 1], [6, 0, 1], [6, 5, 2],
      [6, 0, 1], [6, 0, 1], [6, 7, 2], [6, 5, 2], [6, 3, 2],
    ]),
  },
  winterschlaf: {
    id: "advent-riff-winterschlaf",
    titel: "Winterschlaf",
    hinweis: "Hammer-on und Pull-off in einem Zug: nur die erste Note wird angeschlagen.",
    startBpm: 56,
    targetBpm: 84,
    song: riff("E", 2, [
      [6, 0, 2], [6, 0, 2], [6, 5, 1], [6, 7, 1, "hammer"], [6, 5, 1, "pull"], [6, 3, 1, "pull"],
      [6, 0, 4], [6, 3, 2], [6, 0, 2],
    ]),
  },
  glockenturm: {
    id: "advent-riff-glockenturm",
    titel: "Glockenturm",
    hinweis: "Von der E- auf die A-Saite und zurück. Der Saitenwechsel ist hier die Aufgabe.",
    startBpm: 60,
    targetBpm: 92,
    song: riff("E", 2, [
      [6, 0, 2], [5, 0, 2], [5, 2, 2], [5, 3, 2],
      [5, 5, 2], [5, 3, 2], [5, 2, 2], [6, 0, 2],
    ]),
  },
  lichterkette: {
    id: "advent-riff-lichterkette",
    titel: "Lichterkette",
    hinweis: "Durchgehende Achtel, abwechselnd Ab- und Aufschlag. Sie dürfen nicht stolpern.",
    startBpm: 56,
    targetBpm: 88,
    song: riff("E", 2, [
      [6, 0, 1], [6, 3, 1], [6, 5, 1], [6, 3, 1], [6, 0, 1], [6, 3, 1], [6, 5, 1], [6, 7, 1],
      [6, 5, 1], [6, 3, 1], [6, 0, 1], [6, 3, 1], [5, 0, 2], [6, 0, 2],
    ]),
  },
  schlittenglocken: {
    id: "advent-riff-schlittenglocken",
    titel: "Schlittenglocken",
    hinweis: "Eine Pause, die mitzählen muss. Erst wer sie hört, trifft danach den Einsatz.",
    startBpm: 60,
    targetBpm: 90,
    song: riff("E", 2, [
      [6, 0, 2], [6, 3, 1], [6, 3, 1], [6, 5, 2], [null, 1], [6, 0, 1],
      [6, 0, 2], [6, 7, 1], [6, 5, 1], [6, 3, 2], [6, 0, 2],
    ]),
  },
  adventskranz: {
    id: "advent-riff-adventskranz",
    titel: "Adventskranz",
    hinweis: "Der Halbton zwischen Bund 0 und 1 macht es düster: E phrygisch statt E-Moll.",
    startBpm: 56,
    targetBpm: 84,
    song: riff("E", 2, [
      [6, 0, 2], [6, 1, 2], [6, 0, 2], [6, 3, 2],
      [6, 5, 2], [6, 3, 2], [6, 1, 2], [6, 0, 2],
    ]),
  },
  mitternacht: {
    id: "advent-riff-mitternachtsmesse",
    titel: "Mitternachtsmesse",
    hinweis: "Hammer-on hinauf, drei Pull-offs herunter, dann ein Vibrato zum Schluss.",
    startBpm: 56,
    targetBpm: 80,
    song: riff("E", 2, [
      [5, 0, 2], [5, 2, 1], [5, 3, 1, "hammer"], [5, 5, 2], [6, 0, 2],
      [5, 5, 1], [5, 3, 1, "pull"], [5, 2, 1, "pull"], [5, 0, 1, "pull"], [6, 7, 2], [6, 5, 2, "vibrato"],
    ]),
  },
}

/* ──────────────────────────── Plektren ──────────────────────────── */

function plektrum(id: string, name: string, farbe: string, form: Form, text: string, material?: Material): AdventPlektrum {
  return { id: `advent-${id}`, name, farbe, form, text, ...(material ? { material } : {}) }
}

/* ──────────────────────────── Die 24 ──────────────────────────── */

export const TUERCHEN: Tuerchen[] = [
  { nr: 1, art: "tipp", tipp: {
    titel: "Erst stimmen, dann spielen",
    text: "Heute vor dem ersten Ton das Stimmgerät. Eine Minute, und jedes Riff klingt, wie es soll.",
    warum: "Eine verstimmte Saite ändert jeden Abstand im Riff. Du übst dann nicht das Riff, sondern ein anderes.",
  } },
  { nr: 2, art: "plektrum", plektrum: plektrum("lametta", "Lametta", "#c9ced2", "jazz", "Dünn, silbern, überall im Verstärker.", "metall") },
  { nr: 3, art: "riff", riff: RIFFE.schneeketten },
  { nr: 4, art: "tipp", tipp: {
    titel: "Zähl laut mit",
    text: "Sag „eins, zwei, drei, vier“ beim Spielen, laut genug, dass du es hörst. Es wirkt albern und hilft.",
    warum: "Zählen hält den Grundschlag im Kopf, auch wenn die Hand schneller oder langsamer werden will. Das Metronom gibt den Takt von außen, das Zählen von innen.",
  } },
  { nr: 5, art: "plektrum", plektrum: plektrum("zimtstern", "Zimtstern", "#b8761e", "tri", "Dreieckig, braun, riecht nach Küche.") },
  { nr: 6, art: "riff", riff: RIFFE.lametta },
  { nr: 7, art: "tipp", tipp: {
    titel: "Langsam ist schnell",
    text: "Spiel ein Riff zehn Prozent unter dem Tempo, bei dem es gerade noch geht. Dort wird es sauber.",
    warum: "Die Hand lernt, was du ihr zeigst. Ein Fehler im schnellen Tempo wird mitgelernt; im langsamen nicht.",
  } },
  { nr: 8, art: "plektrum", plektrum: plektrum("tannengruen", "Tannengrün", "#3f8f4e", "std", "Klassische Form, die Farbe des Baums.") },
  { nr: 9, art: "riff", riff: RIFFE.winterschlaf },
  { nr: 10, art: "plektrum", plektrum: plektrum("gluehwein", "Glühwein", "#a8201a", "std", "Dunkelrot und leicht klebrig.", "horn") },
  { nr: 11, art: "tipp", tipp: {
    titel: "Pausen sind Noten",
    text: "Zähl die Pause ganz mit, so als würdest du spielen. Die Hand bleibt locker und wartet.",
    warum: "Rhythmus besteht zur Hälfte aus Stille. Wer eine Pause verkürzt, kommt zu früh, und das klingt nach Hektik.",
  } },
  { nr: 12, art: "aufnaeher", titel: "Halbzeit im Advent", text: "Zwölf Türchen offen. Ein Aufnäher für die Kutte." },
  { nr: 13, art: "riff", riff: RIFFE.glockenturm },
  { nr: 14, art: "plektrum", plektrum: plektrum("schneeflocke", "Schneeflocke", "#f1efe8", "jazz", "Keine gleicht der anderen. Dieses Plektrum auch nicht.", "perl") },
  { nr: 15, art: "tipp", tipp: {
    titel: "Palm Mute an der Brücke",
    text: "Leg die Handkante genau an den Steg, nicht auf die Saiten davor. Kleine Verschiebungen ändern den Ton.",
    warum: "Je näher am Steg, desto kürzer schwingt die gedämpfte Saite mit. Wer die Hand wandern lässt, hat jedes Mal einen anderen Klang.",
  } },
  { nr: 16, art: "riff", riff: RIFFE.lichterkette },
  { nr: 17, art: "plektrum", plektrum: plektrum("lebkuchen", "Lebkuchen", "#6b3a1c", "tri", "Dunkelbraun, mit Zuckerrand.", "holz") },
  { nr: 18, art: "riff", riff: RIFFE.schlittenglocken },
  { nr: 19, art: "plektrum", plektrum: plektrum("kerzenwachs", "Kerzenwachs", "#efe2c4", "std", "Weich, warm, tropft nicht.", "filz") },
  { nr: 20, art: "tipp", tipp: {
    titel: "Der Anschlag kommt aus dem Handgelenk",
    text: "Der Unterarm bleibt ruhig, das Handgelenk dreht. So hält der Anschlag länger durch als aus dem ganzen Arm.",
    warum: "Kleine Muskeln bewegen sich schneller und ermüden weniger, wenn sie nicht gegen große arbeiten müssen.",
  } },
  { nr: 21, art: "riff", riff: RIFFE.adventskranz },
  { nr: 22, art: "plektrum", plektrum: plektrum("sternenstaub", "Sternenstaub", "#e8c23a", "std", "Das glänzende Plektrum vor dem Fest.", "gold") },
  { nr: 23, art: "riff", riff: RIFFE.mitternacht },
  { nr: 24, art: "aufnaeher", titel: "Alle Türchen auf", text: "Vierundzwanzig Türchen, vierundzwanzig Übungstage. Der Roadie hängt dir den Kranz an die Kutte." },
]
