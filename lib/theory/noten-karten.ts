import { INTERVALLE, midiAt, noteAt } from "./fretboard"
import {
  abstaendeOf,
  notenwertName,
  notenwerteOf,
  pausenOf,
  songSchema,
  toeneOf,
  type Dauer,
  type Song,
  type SongNote,
} from "./song"
import type { Griff, TheoryCard } from "./types"

/**
 * Wissenskarten, die die Notenschrift der Songs wiederverwenden.
 *
 * Die Frage trägt ein kleines Notenbild (`frage.notenbild`), und die Antwort
 * wird aus diesem Bild **gerechnet**, nicht dazu getippt: der Tonname aus
 * `noteAt`, der Abstand aus den MIDI-Nummern, die Länge aus der Dauer, die
 * Pause aus den Lücken (`pausenOf`). Bild und Antwort können so nicht
 * auseinanderlaufen — dieselbe Linie wie bei den Griffbrett-Karten.
 *
 * Die Bilder sind echte `Song`-Daten und gehen durch dieselbe Prüfung wie die
 * Songs; `noten-karten.test.ts` verlangt das.
 */

type Spec = [saite: Griff["saite"], bund: number, start: number, dauer: Dauer]

/** Ein Notenbild aus Kurzschrift; das Lernziel wird aus den Noten gerechnet, wie es `pruefeSong` verlangt. */
export function notenbild(noten: Spec[], takte = 1): Song {
  const liste: SongNote[] = noten.map(([saite, bund, start, dauer]) => ({
    griff: { saite, bund },
    start,
    dauer,
    artikulation: "normal",
  }))
  const roh: Song = {
    grundton: "C",
    takte,
    noten: liste,
    lernziel: { toene: ["C"], abstaende: [], notenwerte: [8] },
  }
  return songSchema.parse({
    ...roh,
    lernziel: { toene: toeneOf(roh), abstaende: abstaendeOf(roh), notenwerte: notenwerteOf(roh) },
  })
}

/**
 * Die vier Möglichkeiten, die richtige an Stelle `platz`.
 *
 * Die Stelle wechselt von Karte zu Karte: eine Antwort, die immer an
 * derselben Stelle steht, lernt man als Stelle und nicht als Wissen.
 */
function mitPlatz(richtig: string, andere: string[], platz: number): string[] {
  const rest = andere.filter((option) => option !== richtig).slice(0, 3)
  return [...rest.slice(0, platz), richtig, ...rest.slice(platz)]
}

const name = (saite: Griff["saite"], bund: number): string => noteAt({ saite, bund })

/** Wie viele Schläge (Viertel) eine Note im 4/4-Takt hält, als Text. */
function schlaege(dauer: Dauer): string {
  return dauer === 1 ? "1/2" : `${dauer / 2}`
}

/** Das Intervall zwischen zwei Noten, aufwärts gezählt, mit seinen Nachbarn als Alternativen. */
function intervallKarte(a: Griff, b: Griff) {
  const halbtoene = Math.abs(midiAt(b) - midiAt(a))
  const richtig = INTERVALLE[halbtoene].name
  const nachbarn = [halbtoene - 2, halbtoene - 1, halbtoene + 1, halbtoene + 2]
    .filter((h) => h >= 1 && h <= 12 && h !== halbtoene)
    .map((h) => INTERVALLE[h].name)
  return { halbtoene, richtig, nachbarn }
}

const A_EINS = { saite: 3, bund: 2 } as const // A
const E_LEER = { saite: 1, bund: 0 } as const // E
const C_B = { saite: 2, bund: 1 } as const // C
const D_B = { saite: 2, bund: 3 } as const // D
const G_E = { saite: 1, bund: 3 } as const // G

const namenKarten: { id: string; saite: Griff["saite"]; bund: number; andere: string[]; erklaerung: string; platz: number }[] = [
  {
    id: "n-name-e",
    saite: 1,
    bund: 0,
    andere: ["F", "D", "G"],
    platz: 1,
    erklaerung:
      "Die leere hohe e-Saite ist ein E, und in der Notenschrift steht sie im vierten Zwischenraum, geschrieben eine Oktave höher, als sie klingt. Die Gitarre ist ein transponierendes Instrument: so lernt jeder dieselben Namen, egal wie tief das Instrument klingt.",
  },
  {
    id: "n-name-g",
    saite: 3,
    bund: 0,
    andere: ["A", "F", "E"],
    platz: 3,
    erklaerung:
      "Die leere G-Saite ist ein G, und es sitzt auf der zweiten Linie von unten — genau dort, wo sich der Violinschlüssel einrollt, deshalb heißt er auch G-Schlüssel. Wer diese eine Linie kennt, zählt von ihr aus alle anderen Noten ab.",
  },
  {
    id: "n-name-c",
    saite: 2,
    bund: 1,
    andere: ["D", "B", "A"],
    platz: 0,
    erklaerung:
      "Die B-Saite im ersten Bund ist ein C, in der Notenschrift der dritte Zwischenraum von unten. Linien und Zwischenräume wechseln sich ab, und die Töne laufen dabei in der Reihenfolge der Tonleiter: von der G-Linie aus ist der Zwischenraum darüber A, die Linie darüber B und der nächste Zwischenraum C.",
  },
]

const laengenKarten: { id: string; spec: Spec[]; andere: string[]; erklaerung: string; platz: number }[] = [
  {
    id: "n-laenge-ganze",
    spec: [[3, 0, 0, 8]],
    andere: ["1", "2", "1/2"],
    platz: 2,
    erklaerung:
      "Die Ganze füllt einen ganzen 4/4-Takt und hält vier Schläge. Sie ist hohl und hat keinen Hals; jeder kleinere Wert halbiert sie: Halbe zwei Schläge, Viertel einen, Achtel einen halben.",
  },
  {
    id: "n-laenge-halbe",
    spec: [
      [2, 0, 0, 4],
      [1, 0, 4, 4],
    ],
    andere: ["1", "4", "1/2"],
    platz: 0,
    erklaerung:
      "Die Halbe hält zwei Schläge, zwei davon füllen den Takt. Sie ist hohl und hat einen Hals. Wer sie spielt, lässt sie bis zum zweiten Schlag klingen, bevor er die Hand zur nächsten Note bewegt.",
  },
  {
    id: "n-laenge-viertel",
    spec: [
      [3, 0, 0, 2],
      [3, 2, 2, 2],
      [2, 0, 4, 2],
      [2, 1, 6, 2],
    ],
    andere: ["2", "1/2", "4"],
    platz: 3,
    erklaerung:
      "Die Viertel hält einen Schlag, und vier davon füllen den 4/4-Takt: sie ist der Wert, den man mitzählt und mit dem Fuß tritt. Sie ist ausgefüllt und hat einen Hals, ohne Fähnchen.",
  },
  {
    id: "n-laenge-achtel",
    spec: [
      [3, 0, 0, 1],
      [3, 0, 1, 1],
      [3, 2, 2, 1],
      [3, 2, 3, 1],
      [2, 0, 4, 1],
      [2, 0, 5, 1],
      [2, 1, 6, 1],
      [2, 1, 7, 1],
    ],
    andere: ["1", "2", "4"],
    platz: 1,
    erklaerung:
      "Das Achtel hält einen halben Schlag, acht davon füllen den Takt. Mehrere davon werden mit einem Balken verbunden statt mit einzelnen Fähnchen. Zählt man „1 und 2 und …“, dann ist jedes „und“ ein Achtel.",
  },
]

const pausenKarten: { id: string; spec: Spec[]; erklaerung: string; platz: number }[] = [
  {
    id: "n-pause-viertel",
    spec: [
      [3, 0, 0, 4],
      [3, 2, 4, 2],
    ],
    platz: 2,
    erklaerung:
      "Wo keine Note klingt, steht eine Pause, und sie hat denselben Wert wie die Note, die dort stünde. Hier fehlt der letzte Schlag: eine Viertelpause, ein Zickzack mit einem Haken. Die Pause ist Teil des Rhythmus — beim Spielen zählt man sie mit und schlägt nichts an.",
  },
  {
    id: "n-pause-achtel",
    spec: [
      [3, 0, 0, 2],
      [3, 2, 2, 1],
      [2, 0, 4, 2],
      [2, 1, 6, 2],
    ],
    platz: 0,
    erklaerung:
      "Die Achtelpause steht für einen halben Schlag Stille und sieht aus wie eine kleine 7 mit einem Punkt. In der Mitte eines Riffs sorgt sie für den Schnitt, der aus einer Reihe Töne einen Groove macht: man spielt die Note kurz, und der nächste Schlag kommt ohne sie.",
  },
]

const intervallKarten = [
  {
    id: "n-abstand-quinte",
    a: A_EINS,
    b: E_LEER,
    platz: 1,
    erklaerung: (r: string) =>
      `Von A zu E sind es fünf Tonnamen (A B C D E) und sieben Halbtöne: eine ${r}. Dieselbe Rechnung gilt in jeder Notenschrift: gezählt wird, wie viele Linien und Zwischenräume die Noten überspannen, einschließlich beider.`,
  },
  {
    id: "n-abstand-terz",
    a: C_B,
    b: E_LEER,
    platz: 3,
    erklaerung: (r: string) =>
      `Von C zu E sind es drei Tonnamen (C D E) und vier Halbtöne: eine ${r}. Zwei Noten auf benachbarten Linien liegen immer eine Terz auseinander, denn dazwischen liegt ein Zwischenraum.`,
  },
  {
    id: "n-abstand-quarte",
    a: D_B,
    b: G_E,
    platz: 0,
    erklaerung: (r: string) =>
      `Von D zu G sind es vier Tonnamen (D E F G) und fünf Halbtöne: eine ${r}. Eine Quarte ist der Abstand der Gitarrensaiten zueinander, außer zwischen G- und B-Saite — dort ist er eine große Terz.`,
  },
]

export const NOTEN_KARTEN: TheoryCard[] = [
  ...namenKarten.map(
    (k, i): TheoryCard => ({
      id: k.id,
      stufe: 1,
      begriff: `Eine Note benennen (${i + 1})`,
      erklaerung: k.erklaerung,
      frage: {
        art: "auswahl",
        text: "Wie heißt diese Note?",
        notenbild: notenbild([[k.saite, k.bund, 0, 8]]),
        auswahl: mitPlatz(name(k.saite, k.bund), k.andere, k.platz),
        richtig: [name(k.saite, k.bund)],
      },
    }),
  ),
  ...intervallKarten.map((k, i): TheoryCard => {
    const { richtig, nachbarn } = intervallKarte(k.a, k.b)
    return {
      id: k.id,
      stufe: 2,
      begriff: `Den Abstand lesen (${i + 1})`,
      erklaerung: k.erklaerung(richtig),
      frage: {
        art: "auswahl",
        text: "Welcher Abstand liegt zwischen diesen zwei Noten?",
        notenbild: notenbild([
          [k.a.saite, k.a.bund, 0, 4],
          [k.b.saite, k.b.bund, 4, 4],
        ]),
        auswahl: mitPlatz(richtig, nachbarn, k.platz),
        richtig: [richtig],
      },
    }
  }),
  ...laengenKarten.map((k, i): TheoryCard => {
    const bild = notenbild(k.spec)
    const richtig = schlaege(bild.noten[0].dauer)
    return {
      id: k.id,
      stufe: 5,
      begriff: `Notenlängen lesen (${i + 1})`,
      erklaerung: k.erklaerung,
      frage: {
        art: "auswahl",
        text: "Wie viele Schläge hält jede dieser Noten im 4/4-Takt?",
        notenbild: bild,
        auswahl: mitPlatz(richtig, k.andere, k.platz),
        richtig: [richtig],
      },
    }
  }),
  ...pausenKarten.map((k, i): TheoryCard => {
    const bild = notenbild(k.spec)
    const richtig = notenwertName(pausenOf(bild)[0].dauer)
    return {
      id: k.id,
      stufe: 5,
      begriff: `Pausen lesen (${i + 1})`,
      erklaerung: k.erklaerung,
      frage: {
        art: "auswahl",
        text: "Welchen Wert hat die Pause in diesem Takt?",
        notenbild: bild,
        auswahl: mitPlatz(richtig, ["Ganze", "Halbe", "Viertel", "Achtel"], k.platz),
        richtig: [richtig],
      },
    }
  }),
]
