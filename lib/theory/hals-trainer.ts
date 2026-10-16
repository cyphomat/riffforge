import { isDue, retrievability, type Grade } from "./fsrs"
import { noteAt, SAITENNAMEN, TOENE, type Ton } from "./fretboard"
import { BUENDE } from "./hals"
import { cardStates, SITZT_AB_TAGEN } from "./progress"
import { HALS_PREFIX } from "./hals-id"
import type { Griff, TheoryLog } from "./types"

export { HALS_PREFIX, istHalsAntwort } from "./hals-id"

/**
 * The fretboard trainer: every place on the neck is a card of its own.
 *
 * Seventy-two places — six strings, frets one to twelve — in two directions:
 * *finden* (a note name in, the place out) and *benennen* (a place in, the
 * name out). Each pair of place and direction is scheduled by the same FSRS
 * as the knowledge cards and answered into the same log, so it syncs, backs
 * up and deletes with everything else without a single new storage key.
 *
 * The price of sharing the log is that its answers must not be counted as
 * knowledge cards. They carry the prefix `hals-`, and every count over the
 * theory log — the badges, the hit rate — leaves them out through
 * `istHalsAntwort`. The test sweeps the catalogue to make sure no card ever
 * takes that prefix.
 *
 * Pure: the log and a clock in, rounds and maps out.
 */

export type HalsRichtung = "finden" | "benennen"

/** Fret 0 is left out: an open string is not something to look for, and fret 12 already has its name. */
export const HALS_STELLEN: Griff[] = [6, 5, 4, 3, 2, 1].flatMap((saite) =>
  Array.from({ length: BUENDE }, (_, i) => ({ saite, bund: i + 1 }) as Griff),
)

export function halsId(richtung: HalsRichtung, stelle: Griff): string {
  return `${HALS_PREFIX}${richtung}-${stelle.saite}-${stelle.bund}`
}

/** The string choices on offer, lowest first; the first two are where riffs live. */
export const SAITEN_WAHL: Array<{ name: string; saiten: number[] }> = [
  { name: "E und A", saiten: [6, 5] },
  ...[6, 5, 4, 3, 2, 1].map((saite) => ({
    name: saite === 1 ? "hohe e" : `${SAITENNAMEN[saite - 1]}-Saite`,
    saiten: [saite],
  })),
  { name: "Alle", saiten: [6, 5, 4, 3, 2, 1] },
]

/**
 * Seconds that turn into a grade. Knowing a place is not the same as finding
 * it in time to play it: someone who needs eight seconds knows where it is,
 * but not yet well enough. The grade is suggested by the clock the way
 * `suggestRating` is by the microphone — there is nothing to ask afterwards.
 */
export const FLINK_MS = 2500
export const ZAEH_MS = 6000

export function halsNote(richtig: boolean, ms: number): Grade {
  if (!richtig) return 1
  if (ms <= FLINK_MS) return 4
  if (ms <= ZAEH_MS) return 3
  return 2
}

/**
 * New places are introduced in this order: natural notes before sharps — the
 * markers on the low strings are where everyone starts — and lower frets
 * before higher ones.
 */
function lernRang(stelle: Griff): number {
  const ton = noteAt(stelle)
  return (ton.includes("#") ? 100 : 0) + stelle.bund
}

/** Mulberry32 — small, fast, and enough to shuffle a round. */
function zufallsfolge(startwert: number): () => number {
  let s = startwert >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * One round: what is due first, weakest first; then new places in learning
 * order; then whatever is least stable. Shuffled at the end, so the order of
 * the questions does not walk up the neck and give the next answer away.
 */
export function halsRunde(
  log: TheoryLog,
  richtung: HalsRichtung,
  saiten: number[],
  anzahl: number,
  options: { now?: Date; startwert?: number } = {},
): Griff[] {
  const { now = new Date(), startwert = 1 } = options
  const stand = cardStates(log)
  const im = HALS_STELLEN.filter((stelle) => saiten.includes(stelle.saite))

  const faellig: Array<{ stelle: Griff; r: number }> = []
  const neu: Griff[] = []
  const rest: Array<{ stelle: Griff; s: number }> = []
  for (const stelle of im) {
    const state = stand.get(halsId(richtung, stelle))
    if (!state) neu.push(stelle)
    else if (isDue(state, now)) faellig.push({ stelle, r: retrievability(state, now) })
    else rest.push({ stelle, s: state.stability ?? 0 })
  }
  faellig.sort((a, b) => a.r - b.r)
  neu.sort((a, b) => lernRang(a) - lernRang(b))
  rest.sort((a, b) => a.s - b.s)

  const gewaehlt = [...faellig.map((f) => f.stelle), ...neu, ...rest.map((r) => r.stelle)].slice(0, anzahl)
  const zufall = zufallsfolge(startwert)
  for (let i = gewaehlt.length - 1; i > 0; i -= 1) {
    const j = Math.floor(zufall() * (i + 1))
    ;[gewaehlt[i], gewaehlt[j]] = [gewaehlt[j], gewaehlt[i]]
  }
  return gewaehlt
}

/** Whether a tap answers a *finden* question: the asked string, the asked note. */
export function gefunden(frage: Griff, getippt: Griff): boolean {
  return getippt.saite === frage.saite && noteAt(getippt) === noteAt(frage)
}

/**
 * Every place on the asked string that holds the asked note, open string
 * included. The question is "E on the low E string", not "fret 12": the card
 * sits at 12 because an open string is not something to look for, but a
 * player who reaches for the open string has found it.
 */
export function halsLoesungen(frage: Griff): Griff[] {
  return Array.from({ length: BUENDE + 1 }, (_, bund) => ({ saite: frage.saite, bund }) as Griff).filter((stelle) =>
    gefunden(frage, stelle),
  )
}

/** Where a place is, in words: "leer" or "5. Bund". */
export const bundWort = (bund: number) => (bund === 0 ? "leer" : `${bund}. Bund`)

/** Whether a name answers a *benennen* question. Sharps and flats both count. */
export function benannt(frage: Griff, ton: Ton): boolean {
  return noteAt(frage) === ton
}

export type HalsZustand = "neu" | "wackelt" | "sitzt"

/** The map of the neck for one direction: each place new, shaky, or held for a week. */
export function halskarte(log: TheoryLog, richtung: HalsRichtung): Map<string, HalsZustand> {
  const stand = cardStates(log)
  const karte = new Map<string, HalsZustand>()
  for (const stelle of HALS_STELLEN) {
    const state = stand.get(halsId(richtung, stelle))
    karte.set(
      `${stelle.saite}-${stelle.bund}`,
      !state ? "neu" : (state.stability ?? 0) >= SITZT_AB_TAGEN ? "sitzt" : "wackelt",
    )
  }
  return karte
}

export interface HalsErgebnis {
  stelle: Griff
  richtig: boolean
  ms: number
}

export interface HalsBericht {
  richtig: number
  gesamt: number
  /** Median time per answer, right or wrong, in ms. Null without answers. */
  medianMs: number | null
  /** What to look at next: wrong first, then the slow ones, at most four. */
  nochmal: Griff[]
}

export function halsBericht(ergebnisse: HalsErgebnis[]): HalsBericht {
  const zeiten = ergebnisse.map((e) => e.ms).sort((a, b) => a - b)
  const mitte = zeiten.length === 0 ? null : zeiten.length % 2
    ? zeiten[(zeiten.length - 1) / 2]
    : (zeiten[zeiten.length / 2 - 1] + zeiten[zeiten.length / 2]) / 2
  const daneben = ergebnisse.filter((e) => !e.richtig)
  const langsam = ergebnisse.filter((e) => e.richtig && e.ms > ZAEH_MS).sort((a, b) => b.ms - a.ms)
  return {
    richtig: ergebnisse.length - daneben.length,
    gesamt: ergebnisse.length,
    medianMs: mitte === null ? null : Math.round(mitte),
    nochmal: [...daneben, ...langsam].map((e) => e.stelle).slice(0, 4),
  }
}

/** The twelve names to pick from, with the flat spelling where there is one. */
export const NAMEN_WAHL: Array<{ ton: Ton; auch?: string }> = TOENE.map((ton) => {
  const b: Partial<Record<Ton, string>> = { "C#": "Db", "D#": "Eb", "F#": "Gb", "G#": "Ab", "A#": "Bb" }
  return { ton, auch: b[ton] }
})
