import { TOENE, type Ton } from "../theory/fretboard"
import { ACHTEL_JE_TAKT, type Song } from "../theory/song"
import { achtelSekunden } from "./song-ablauf"

/**
 * Was die Band spielt — für einen Durchgang durch den Song, in Sekunden.
 *
 * Rein, wie `song-ablauf.ts`: der Player schiebt diese Zeiten nur noch auf die
 * Uhr des AudioContext. Die Band spielt kein Arrangement, sondern Takt: das
 * Schlagzeug einen Rock-Beat in Achteln, der Bass den Grundton des Songs auf
 * jedem Schlag. Das genügt, um ein Riff im Tempo zu hören, statt allein gegen
 * einen Klick zu spielen.
 *
 * Alle Zeiten sind relativ zum Anfang des Durchgangs; ein Takt sind acht Achtel.
 */

export type SchlagArt = "kick" | "snare" | "hat"

export interface Schlag {
  zeit: number
  art: SchlagArt
  /** 0 bis 1, relativ zum Pegel der Art. */
  laut: number
}

export interface BassNote {
  zeit: number
  dauer: number
  midi: number
}

/** Der Grundton eines Songs als Bass-Note: immer die Oktave von C2 bis H2, also E2 = 40. */
export function grundtonMidi(grundton: Ton): number {
  return 36 + TOENE.indexOf(grundton)
}

/**
 * Ein Rock-Beat in Achteln: Kick auf Eins und Drei, Snare auf Zwei und Vier,
 * Hi-Hat auf jedem Achtel, auf den Schlägen etwas lauter.
 */
export function schlagzeugAblauf(song: Song, bpm: number): Schlag[] {
  const achtel = achtelSekunden(bpm)
  const schlaege: Schlag[] = []
  for (let takt = 0; takt < song.takte; takt += 1) {
    for (let i = 0; i < ACHTEL_JE_TAKT; i += 1) {
      const zeit = (takt * ACHTEL_JE_TAKT + i) * achtel
      if (i === 0 || i === 4) schlaege.push({ zeit, art: "kick", laut: i === 0 ? 1 : 0.85 })
      if (i === 2 || i === 6) schlaege.push({ zeit, art: "snare", laut: 0.9 })
      schlaege.push({ zeit, art: "hat", laut: i % 2 === 0 ? 0.6 : 0.35 })
    }
  }
  return schlaege
}

/** Der Grundton auf jedem Schlag, kurz genug, dass zwischen zwei Noten Luft bleibt. */
export function bassAblauf(song: Song, bpm: number): BassNote[] {
  const achtel = achtelSekunden(bpm)
  const midi = grundtonMidi(song.grundton)
  const noten: BassNote[] = []
  for (let takt = 0; takt < song.takte; takt += 1) {
    for (let i = 0; i < ACHTEL_JE_TAKT; i += 2) {
      noten.push({ zeit: (takt * ACHTEL_JE_TAKT + i) * achtel, dauer: achtel * 1.6, midi })
    }
  }
  return noten
}
