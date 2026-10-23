import { midiAt } from "../theory/fretboard"
import { ACHTEL_JE_TAKT, type Song } from "../theory/song"

/**
 * Wann was erklingt — für einen Durchgang durch den Song, in Sekunden.
 *
 * Rein, damit sich das Tempo nachrechnen lässt, ohne einen Ton zu hören: der
 * Player (`song-player.ts`) schiebt diese Zeiten nur noch auf die Uhr des
 * AudioContext. Alle Zeiten sind relativ zum Anfang des Durchgangs.
 */

export const SCHLAEGE_JE_TAKT = ACHTEL_JE_TAKT / 2

export interface SongTon {
  /** Index der Note im Song. */
  note: number
  /** Klingende MIDI-Nummer — die Gitarre klingt, wie sie gegriffen wird. */
  midi: number
  start: number
  /** Wann die Note endet. Dort wird abgedämpft: so hört man ihre Länge. */
  ende: number
}

export interface SongKlick {
  zeit: number
  /** Der erste Schlag im Takt. */
  betont: boolean
}

export interface Ablauf {
  /** Länge eines Durchgangs: ganze Takte, damit eine Schleife nahtlos anschließt. */
  dauer: number
  toene: SongTon[]
  /** Ein Klick je Viertel. */
  klicks: SongKlick[]
}

/** Sekunden je Achtel bei diesem Tempo. BPM zählt Viertel. */
export function achtelSekunden(bpm: number): number {
  return 60 / bpm / 2
}

export function bauAblauf(song: Song, bpm: number): Ablauf {
  const achtel = achtelSekunden(bpm)
  const schlag = achtel * 2

  return {
    dauer: song.takte * ACHTEL_JE_TAKT * achtel,
    toene: song.noten.map((note, i) => ({
      note: i,
      midi: midiAt(note.griff),
      start: note.start * achtel,
      ende: (note.start + note.dauer) * achtel,
    })),
    klicks: Array.from({ length: song.takte * SCHLAEGE_JE_TAKT }, (_, i) => ({
      zeit: i * schlag,
      betont: i % SCHLAEGE_JE_TAKT === 0,
    })),
  }
}

/** Der Einzähler: ein Takt Klicks, bevor der Song anfängt. */
export function einzaehler(bpm: number): { klicks: SongKlick[]; dauer: number } {
  const schlag = 60 / bpm
  return {
    klicks: Array.from({ length: SCHLAEGE_JE_TAKT }, (_, i) => ({ zeit: i * schlag, betont: i === 0 })),
    dauer: SCHLAEGE_JE_TAKT * schlag,
  }
}
