import { z } from "zod"
import { HOECHSTER_BUND, TOENE, midiAt, noteAt, type Ton } from "./fretboard"
import type { Artikulation } from "./lick"

/**
 * Songs: kurze Stücke mit einem Lernziel.
 *
 * Ein Lick wird gerechnet, ein Song wird geschrieben — von der AI, in einer
 * Sitzung, und dann geprüft. Was beide teilen: die Daten sind die Wahrheit.
 * Tabulatur und Notenschrift fallen aus denselben Noten, also können sie
 * nicht auseinanderlaufen, und was ein Song übt, wird aus den Noten
 * *nachgerechnet*, statt dem Text darüber zu glauben.
 *
 * Gezählt wird in Achteln, wie beim Lick. Ein Takt sind acht. Das reicht für
 * Ganze bis Achtel und ist fein genug, dass nichts auf ein Raster gezwungen
 * wird; Sechzehntel und Punktierte kommen, wenn ein Song sie braucht.
 *
 * Id, Titel und Tempo stehen nicht hier, sondern im Drill, in den ein Song
 * eingehängt wird: zweimal geführt wären sie zweimal falsch.
 */

/** 4/4, auf Achteln gezählt. */
export const ACHTEL_JE_TAKT = 8

/** Die Notenwerte, groß nach klein. Die Dauer ist zugleich das Raster, auf dem sie beginnen darf. */
export const NOTENWERTE = [
  { dauer: 8, name: "Ganze" },
  { dauer: 4, name: "Halbe" },
  { dauer: 2, name: "Viertel" },
  { dauer: 1, name: "Achtel" },
] as const

export type Dauer = (typeof NOTENWERTE)[number]["dauer"]

export function notenwertName(dauer: Dauer): string {
  return NOTENWERTE.find((wert) => wert.dauer === dauer)?.name ?? `${dauer} Achtel`
}

const dauerSchema = z.union([z.literal(8), z.literal(4), z.literal(2), z.literal(1)])

/** Dieselben Werte wie `Artikulation` im Lick; `satisfies` hält die Liste daran fest. */
const ARTIKULATIONEN = ["normal", "hammer", "pull", "vibrato"] as const satisfies readonly Artikulation[]

const griffSchema = z.object({
  saite: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]),
  bund: z.number().int().min(0).max(HOECHSTER_BUND),
})

export const songNoteSchema = z.object({
  griff: griffSchema,
  /** Achtel-Position ab Songanfang, 0-basiert. */
  start: z.number().int().min(0),
  dauer: dauerSchema,
  artikulation: z.enum(ARTIKULATIONEN),
})

/**
 * Was der Song übt — als Aussage, die nachgeprüft wird.
 *
 * Genau, nicht „höchstens": ein Song, der drei Töne verspricht und zwei
 * spielt, übt etwas anderes als angekündigt. Deshalb muss das Lernziel mit
 * dem übereinstimmen, was in den Noten steht (`pruefeSong`).
 */
export const lernzielSchema = z.object({
  /** Die Töne, die vorkommen — Namen, ohne Oktave. */
  toene: z.array(z.enum(TOENE)).min(1),
  /**
   * Die Abstände zwischen aufeinanderfolgenden Noten, in Halbtönen, aufsteigend.
   * Die Menge, nicht der größte: „Quarte und Quinte“ als Ziel verlangt, dass
   * beide vorkommen, und ein Höchstwert von sieben garantierte keine davon.
   */
  abstaende: z.array(z.number().int().min(0).max(24)),
  /** Die Notenwerte, die vorkommen. */
  notenwerte: z.array(dauerSchema).min(1),
})

export const songSchema = z.object({
  grundton: z.enum(TOENE),
  takte: z.number().int().min(1).max(4),
  /** Nach Start geordnet, eine Stimme: keine zwei Noten gleichzeitig. */
  noten: z.array(songNoteSchema).min(1),
  lernziel: lernzielSchema,
})

export type SongNote = z.infer<typeof songNoteSchema>
export type Lernziel = z.infer<typeof lernzielSchema>
export type Song = z.infer<typeof songSchema>

/** Die vorkommenden Töne, in der Reihenfolge der Tonleiter ab C. */
export function toeneOf(song: Song): Ton[] {
  const vorhanden = new Set(song.noten.map((note) => noteAt(note.griff)))
  return TOENE.filter((ton) => vorhanden.has(ton))
}

/** Die vorkommenden Notenwerte, groß nach klein. */
export function notenwerteOf(song: Song): Dauer[] {
  const vorhanden = new Set(song.noten.map((note) => note.dauer))
  return NOTENWERTE.map((wert) => wert.dauer).filter((dauer) => vorhanden.has(dauer))
}

/**
 * Die Sprünge von Note zu Note, in Halbtönen und ohne Richtung.
 *
 * Pausen zählen nicht: gefragt ist, wie weit die Hand zwischen zwei Tönen
 * wandert, nicht wie lange sie dazwischen wartet.
 */
export function spruenge(song: Song): number[] {
  return song.noten.slice(1).map((note, i) => Math.abs(midiAt(note.griff) - midiAt(song.noten[i].griff)))
}

/** Welche Abstände vorkommen, jeder einmal, aufsteigend. 0 ist ein wiederholter Ton. */
export function abstaendeOf(song: Song): number[] {
  return [...new Set(spruenge(song))].sort((a, b) => a - b)
}

export interface Pause {
  start: number
  dauer: Dauer
}

/**
 * Die Pausen, die zwischen den Noten übrig bleiben.
 *
 * Sie stehen nicht in den Daten, sondern fallen aus den Lücken: eine Pause
 * ist, was keine Note belegt. Gefüllt wird mit dem größten Wert, der auf
 * seinem Raster beginnt und noch hineinpasst — so entsteht, was jede Notenschrift
 * schreibt: eine Viertelpause auf der Drei, eine Halbe nur ab Eins oder Drei,
 * und keine Pause über eine Taktgrenze.
 */
export function pausenOf(song: Song): Pause[] {
  const pausen: Pause[] = []

  const fuelle = (von: number, bis: number) => {
    let platz = von
    while (platz < bis) {
      const dauer = NOTENWERTE.find((wert) => platz % wert.dauer === 0 && wert.dauer <= bis - platz)?.dauer ?? 1
      pausen.push({ start: platz, dauer })
      platz += dauer
    }
  }

  let ende = 0
  for (const note of song.noten) {
    fuelle(ende, note.start)
    ende = Math.max(ende, note.start + note.dauer)
  }
  fuelle(ende, song.takte * ACHTEL_JE_TAKT)
  return pausen
}

function gleicheMenge<T>(a: readonly T[], b: readonly T[]): boolean {
  const menge = new Set(b)
  return new Set(a).size === menge.size && a.every((x) => menge.has(x))
}

/**
 * Prüft einen Song und gibt zurück, was nicht stimmt — leer heißt gültig.
 *
 * Eine Liste statt einer Ausnahme, weil das Skript, das AI-Songs prüft, alle
 * Fehler eines Songs auf einmal braucht, nicht nur den ersten.
 *
 * Die Raster-Regel ist die, die Bindebögen überflüssig macht: eine Note
 * beginnt nur auf einem Vielfachen ihrer eigenen Länge. Eine Viertel steht
 * damit auf einem Schlag, eine Halbe auf Eins oder Drei, eine Ganze am
 * Taktanfang — und keine Note überquert eine Taktgrenze. Das hält die Songs
 * lesbar für Anfänger und den Notensatz ohne Haltebögen.
 */
export function pruefeSong(song: Song): string[] {
  const probleme: string[] = []
  const gesamt = song.takte * ACHTEL_JE_TAKT
  let ende = 0

  song.noten.forEach((note, i) => {
    const wo = `Note ${i + 1}`
    const wert = notenwertName(note.dauer)

    if (note.start < ende) probleme.push(`${wo}: beginnt vor dem Ende der vorigen Note`)
    if (note.start % note.dauer !== 0) {
      probleme.push(`${wo}: ${wert} darf nicht auf Achtel ${note.start} beginnen`)
    }
    if (note.start + note.dauer > gesamt) probleme.push(`${wo}: ragt über das Ende hinaus`)

    if (note.artikulation === "hammer" || note.artikulation === "pull") {
      const vorige = song.noten[i - 1]
      const gebunden =
        vorige !== undefined &&
        vorige.griff.saite === note.griff.saite &&
        vorige.start + vorige.dauer === note.start
      const richtig =
        vorige !== undefined &&
        (note.artikulation === "hammer" ? note.griff.bund > vorige.griff.bund : note.griff.bund < vorige.griff.bund)
      if (!gebunden || !richtig) {
        probleme.push(`${wo}: ${note.artikulation} braucht die vorige Note auf derselben Saite, direkt davor und in der passenden Richtung`)
      }
    }

    ende = Math.max(ende, note.start + note.dauer)
  })

  const toene = toeneOf(song)
  if (!gleicheMenge(song.lernziel.toene, toene)) {
    probleme.push(`Lernziel nennt die Töne ${song.lernziel.toene.join(" ")}, gespielt werden ${toene.join(" ")}`)
  }

  const abstaende = abstaendeOf(song)
  if (!gleicheMenge(song.lernziel.abstaende, abstaende)) {
    probleme.push(`Lernziel nennt die Abstände ${song.lernziel.abstaende.join(" ")}, gespielt werden ${abstaende.join(" ")}`)
  }

  const werte = notenwerteOf(song)
  if (!gleicheMenge(song.lernziel.notenwerte, werte)) {
    probleme.push(`Lernziel nennt die Notenwerte ${song.lernziel.notenwerte.join(" ")}, gespielt werden ${werte.join(" ")}`)
  }

  return probleme
}
