import { z } from "zod"
import { songSchema, type SongNote } from "./song"

/**
 * Der Song-Katalog.
 *
 * Alles hier ist für diese App geschrieben — eigene Melodien, keine
 * abgeschriebenen Stücke. Sie entstehen in einer Sitzung mit der AI und gelten
 * erst, wenn `songs.test.ts` sie durchgelassen hat: dort steht, was ein Song
 * einhalten muss, und `pruefeSong` rechnet nach, dass er übt, was sein
 * Lernziel sagt.
 *
 * Alle drei liegen in Lage 1 der A-Moll-Pentatonik, auf der D-, G- und
 * H-Saite. Die Hand bleibt dabei ruhig, und es kommen nur Naturtöne vor, also
 * keine Vorzeichen in der Notenschrift. Die Reihenfolge ist der Weg: erst
 * wenige Töne und lange Werte, dann kürzere, dann weitere Abstände.
 */

export const songEintragSchema = z.object({
  id: z.string().regex(/^song-[a-z-]+$/),
  titel: z.string().min(1),
  /** Eine Zeile: was dieser Song trainiert. Wird zum `goal` des Drills. */
  ziel: z.string().min(1),
  /** Worauf beim Spielen zu achten ist; wird zu den `cues` des Drills. */
  cues: z.array(z.string().min(1)).min(1),
  /**
   * Die Theorie dazu, zwei, drei Sätze — wie das `why` jedes Drills: sie steht
   * am Song, nicht in einem eigenen Bereich, weil sie dort etwas erklärt, was
   * die Hände gerade tun.
   */
  why: z.string().min(1),
  startBpm: z.number().int().min(20).max(300),
  targetBpm: z.number().int().min(20).max(300),
  song: songSchema,
})

export type SongEintrag = z.infer<typeof songEintragSchema>

/**
 * Die Stellen, die die Songs brauchen — Lage 1, A-Moll-Pentatonik:
 *
 *   A3 = D-Saite, Bund 7     C4 = G-Saite, Bund 5     D4 = G-Saite, Bund 7
 *   E4 = H-Saite, Bund 5     G4 = H-Saite, Bund 8
 *
 * Geschrieben steht jeder Ton eine Oktave höher, wie bei jeder Gitarre.
 */
const A3 = { saite: 4, bund: 7 } as const
const C4 = { saite: 3, bund: 5 } as const
const D4 = { saite: 3, bund: 7 } as const
const E4 = { saite: 2, bund: 5 } as const
const G4 = { saite: 2, bund: 8 } as const

/** Eine Note ohne Bindung: wo sie liegt, wann sie beginnt (in Achteln) und wie lang sie ist. */
function n(griff: SongNote["griff"], start: number, dauer: SongNote["dauer"]): SongNote {
  return { griff, start, dauer, artikulation: "normal" }
}

export const SONGS: SongEintrag[] = [
  {
    id: "song-drei-toene",
    titel: "Drei Töne",
    ziel: "Drei Töne lesen und spielen: A, C und D, mit Halben und Vierteln",
    cues: [
      "Erst anhören, dann mitspielen",
      "Die Tonnamen laut mitsprechen: A, C, D",
      "Eine Halbe hält zwei Schläge — nicht vor dem zweiten Schlag loslassen",
    ],
    why: "Die Gitarre klingt eine Oktave tiefer, als sie in den Noten steht: das A auf der D-Saite steht als A im zweiten Zwischenraum. Eine Viertel dauert einen Schlag, eine Halbe zwei. A und C liegen eine kleine Terz auseinander (drei Halbtöne), C und D eine Sekunde (zwei).",
    startBpm: 50,
    targetBpm: 80,
    song: {
      grundton: "A",
      takte: 2,
      // Halbe, Viertel, Viertel | Halbe, Halbe — und zurück auf den Grundton.
      noten: [n(A3, 0, 4), n(C4, 4, 2), n(D4, 6, 2), n(C4, 8, 4), n(A3, 12, 4)],
      lernziel: { toene: ["A", "C", "D"], abstaende: [2, 3], notenwerte: [4, 2] },
    },
  },
  {
    id: "song-achtel-pendel",
    titel: "Achtel-Pendel",
    ziel: "Achtel und Pausen: eine Achtel ist eine halbe Viertel",
    cues: [
      "Eins-und, zwei-und mitzählen — die Achtel fallen auf das „und“",
      "In der Pause die Hand ruhig lassen und weiterzählen",
      "Wechselschlag: runter auf dem Schlag, rauf auf dem „und“",
    ],
    why: "Zwei Achtel passen auf einen Schlag, deshalb werden sie im Notenbild verbunden. Eine Pause ist Stille mit eigener Länge: die Viertelpause dauert genau einen Schlag, in dem man nichts spielt, aber weiterzählt.",
    startBpm: 60,
    targetBpm: 90,
    song: {
      grundton: "A",
      takte: 2,
      // Takt 1 pendelt zwischen A und C, dann D und eine Viertelpause.
      // Takt 2 läuft von E herunter und löst auf A auf.
      noten: [
        n(A3, 0, 1),
        n(C4, 1, 1),
        n(A3, 2, 1),
        n(C4, 3, 1),
        n(D4, 4, 2),
        n(E4, 8, 1),
        n(D4, 9, 1),
        n(C4, 10, 1),
        n(D4, 11, 1),
        n(C4, 12, 2),
        n(A3, 14, 2),
      ],
      lernziel: { toene: ["A", "C", "D", "E"], abstaende: [2, 3], notenwerte: [2, 1] },
    },
  },
  {
    id: "song-abstaende",
    titel: "Abstände",
    ziel: "Abstände hören und lesen: Quarte und Quinte über mehrere Saiten",
    cues: [
      "Vor dem Spielen den Abstand benennen: Sekunde, Terz, Quarte oder Quinte?",
      "Die Hand bleibt in Lage 1 — der Sprung geht über die Saiten, nicht über die Bünde",
      "Im Notenbild mitlesen: höher geschrieben heißt höher gespielt",
    ],
    why: "Ein Abstand wird in Halbtönen gemessen: von A nach D sind es fünf (Quarte), von A nach E sieben (Quinte), von C nach G ebenfalls sieben. Auf der Gitarre ist es derselbe Ton an mehreren Stellen — in Lage 1 holt man ihn von der Nachbarsaite, statt die Hand zu verschieben.",
    startBpm: 60,
    targetBpm: 100,
    song: {
      grundton: "A",
      takte: 4,
      // Takt 1: Quinte hoch (A–E), Sekunde, Quarte hinunter (D–A).
      // Takt 2: Terz, Quinte hoch (C–G), dann Stufen hinab.
      // Takt 3: die Tonleiter hinauf in Achteln, dann Terzen (G, E).
      // Takt 4: hinab und auf den Grundton.
      noten: [
        n(A3, 0, 2),
        n(E4, 2, 2),
        n(D4, 4, 2),
        n(A3, 6, 2),
        n(C4, 8, 2),
        n(G4, 10, 1),
        n(E4, 11, 1),
        n(D4, 12, 2),
        n(C4, 14, 2),
        n(A3, 16, 1),
        n(C4, 17, 1),
        n(D4, 18, 1),
        n(E4, 19, 1),
        n(G4, 20, 2),
        n(E4, 22, 2),
        n(D4, 24, 2),
        n(C4, 26, 2),
        n(A3, 28, 4),
      ],
      lernziel: { toene: ["A", "C", "D", "E", "G"], abstaende: [2, 3, 5, 7], notenwerte: [4, 2, 1] },
    },
  },
]

export const SONGS_BY_ID: Record<string, SongEintrag> = Object.fromEntries(SONGS.map((eintrag) => [eintrag.id, eintrag]))
