import { z } from "zod"
import type { Technique } from "@/lib/session/types"
import type { Richtung } from "./gehoer"

/**
 * Die Wissensdatenbank: ein Begriff, eine Erklärung, mindestens eine Frage.
 *
 * Der Normalzustand ist die Frage, nicht der Artikel. Abfragen behält sich
 * besser als Nachlesen, und der Text ist deshalb das, was *nach* der Antwort
 * kommt — nicht davor.
 */

/** Die sechs Stufen des Katalogs, von den Tönen bis zum Riff-Bau. */
export const STUFEN = [
  { nummer: 1, titel: "Das Material" },
  { nummer: 2, titel: "Intervalle" },
  { nummer: 3, titel: "Tonleitern" },
  { nummer: 4, titel: "Akkorde" },
  { nummer: 5, titel: "Rhythmus" },
  { nummer: 6, titel: "Metal im Besonderen" },
] as const

export type Stufe = (typeof STUFEN)[number]["nummer"]

/**
 * Wie eine Frage beantwortet wird.
 *
 * Reihenfolge nicht zufällig: was sich auf dem Griffbrett zeigen lässt, wird
 * gezeigt. Produzieren bringt mehr als aus vier Kästchen wählen, und die
 * Gitarre ist das eine Instrument, auf dem sich Theorie zeigen lässt, ohne
 * dass man sie aufschreibt.
 */
export type FrageArt =
  /** Einen Ton auf dem Griffbrett antippen. */
  | "griffbrett"
  /** Kurzantwort tippen — Tonname, Stufenfolge, Intervallname. */
  | "eingabe"
  /** Eine aus mehreren, wo Tippen Schikane wäre. */
  | "auswahl"
  /**
   * Gespielt und gemessen. Die Antwort ist ein Rhythmus, das Mikrofon hört
   * ihn, und die Bewertung ist gemessen statt geraten — das kann kein
   * Karteikartenprogramm.
   */
  | "gespielt"
  /**
   * Gehört und benannt. Die App spielt zwei Töne, gefragt ist der Abstand.
   * Die Töne selbst wechseln bei jedem Zeigen — die Antwort ist das
   * Intervall, und das soll man hören, nicht wiedererkennen.
   */
  | "gehoert"

/** Eine Stelle auf dem Hals. Saite 1 ist die hohe e-Saite, 6 die tiefe E. */
export interface Griff {
  saite: 1 | 2 | 3 | 4 | 5 | 6
  bund: number
}

export interface Frage {
  art: FrageArt
  /** Die Frage selbst, kurz und ohne Umschweife. */
  text: string
  /**
   * Was schon auf dem Griffbrett steht, wenn die Frage erscheint — etwa der
   * Grundton, zu dem ein Intervall gesucht wird.
   */
  gegeben?: Griff[]
  /**
   * Alle richtigen Antworten. Auf der Gitarre liegt derselbe Ton an mehreren
   * Stellen: wer eine davon trifft, hat recht.
   */
  richtig: Griff[] | string[]
  /** Nur bei "auswahl": die Möglichkeiten, richtige eingeschlossen. */
  auswahl?: string[]
  /**
   * Wörtlich vergleichen, ohne Tonnamen zu normalisieren.
   *
   * Für die eine Sorte Frage, bei der die *Schreibweise* die Antwort ist:
   * "wie heisst dieser Ton in einer Tabulatur" liesse sich sonst mit dem Wort
   * aus der Frage beantworten, weil die Eingabe H und B ohnehin als denselben
   * Ton liest.
   */
  woertlich?: boolean
  /** Nur bei "gespielt": welche Figur, wie schnell, wie lange. */
  rhythmus?: { figurId: string; bpm: number; takte: number }
  /** Nur bei "gehoert": welcher Abstand, und ob der zweite Ton höher oder tiefer liegt. */
  hoeren?: { halbtoene: number; richtung: Richtung }
}

export interface TheoryCard {
  id: string
  stufe: Stufe
  begriff: string
  /**
   * Zwei, drei Sätze — die Länge eines `why`-Feldes. Was länger sein müsste,
   * sind meistens zwei Karten.
   */
  erklaerung: string
  frage: Frage
  /**
   * Woran das hängt. Theorie ohne Bezug zum Gespielten bleibt ein eigenes
   * Hobby; mit Bezug grundiert sie den Block, der gleich kommt.
   */
  technique?: Technique
}

/**
 * Eine Antwort. Unveränderlich, über Karte plus Zeitstempel identifiziert —
 * dieselbe Bauart wie der Übungs-Log, damit der Abgleich sie ohne Zutun
 * verschmilzt.
 */
export const theoryAnswerSchema = z.object({
  cardId: z.string(),
  /** 1 Nochmal · 2 Schwer · 3 Gut · 4 Leicht. */
  grade: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  /** Ob die Antwort sachlich stimmte. Die Note sagt, wie mühsam es war. */
  correct: z.boolean(),
  at: z.string(),
})

export type TheoryAnswer = z.infer<typeof theoryAnswerSchema>

export const theoryLogSchema = z.object({
  version: z.literal(1),
  answers: z.array(theoryAnswerSchema),
})

export type TheoryLog = z.infer<typeof theoryLogSchema>

export const EMPTY_THEORY_LOG: TheoryLog = { version: 1, answers: [] }
