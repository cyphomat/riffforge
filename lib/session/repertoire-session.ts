import type { Repertoire, Abschnitt, AbschnittStatus, RepertoireSong, Sound } from "./repertoire"
import { uebetempoBpm } from "./repertoire"
import type { Drill, DrillResult, SessionBlock } from "./types"

/**
 * The repertoire in the daily session: which section is up, which block it
 * fills and what goes into the practice log.
 *
 * The log is synced, the repertoire is not. A log entry therefore carries no
 * song, band, section or file name and no id of any of them.
 */

/** Id and technique of every repertoire entry in the practice log. */
export const REPERTOIRE_DRILL_ID = "repertoire"
export const REPERTOIRE_TITEL = "Repertoire"
/**
 * The log asks for a rating, the repertoire has none. Fixed below "sauber", so
 * that no version of the app counts it as a clean block.
 */
export const REPERTOIRE_RATING = 2

/** So many open sections are worked on at the same time. */
export const OFFEN_ZUGLEICH = 3
/** A section in place is due again after this many days without practice. */
export const WIEDERHOLUNG_NACH_TAGEN = 14
/** At most one repetition in this many days. */
export const WIEDERHOLUNG_ABSTAND_TAGEN = 7

/** The tempo range of the metronome and of the log schema. */
export const MIN_BPM = 20
export const MAX_BPM = 300

export interface RepertoireWahl {
  songId: string
  abschnittId: string
}

/** What the block shows. Stays on the device; nothing of this goes into the log. */
export interface RepertoireStelle extends RepertoireWahl {
  titel: string
  band: string
  abschnitt: string
  von: number
  bis: number
  spur: string
  status: AbschnittStatus
  stimmung: string[]
  quelle: string
  sound?: Sound
  /** The practice tempo as entered, which may lie outside the metronome's range. */
  uebetempo: number
}

export const istRepertoire = (r: Pick<DrillResult, "drillId">) => r.drillId === REPERTOIRE_DRILL_ID

/** Calendar days between a stored date and now; never practised is the longest ago. */
function tageSeit(iso: string | undefined, jetzt: Date): number {
  if (!iso) return Number.POSITIVE_INFINITY
  const mittag = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12).getTime()
  return Math.round((mittag(jetzt) - mittag(new Date(iso))) / 86_400_000)
}

/** Longest untouched first; equal dates keep the order of the list. */
function aeltesteZuerst<T extends { a: Abschnitt }>(liste: T[]): T[] {
  const zeit = (iso: string | undefined) => (iso ? Date.parse(iso) : 0)
  return [...liste].sort((x, y) => zeit(x.a.zuletzt) - zeit(y.a.zuletzt))
}

/**
 * Which section is up. Deterministic: the same repertoire on the same day gives
 * the same answer, so *Heute* can announce it.
 *
 * 1. A repetition, if a section in place is due and none was repeated lately.
 * 2. Otherwise an open section. While fewer than `OFFEN_ZUGLEICH` have been
 *    started, the next new one in list order joins; after that the one that has
 *    waited longest.
 * 3. Otherwise nothing, and the session stays as it is.
 */
export function waehleAbschnitt(repertoire: Repertoire, jetzt: Date = new Date()): RepertoireWahl | null {
  const alle = repertoire.songs.flatMap((song) => song.abschnitte.map((a) => ({ songId: song.id, a })))
  const als = (e: (typeof alle)[number]): RepertoireWahl => ({ songId: e.songId, abschnittId: e.a.id })

  const kuerzlichWiederholt = alle.some((e) => tageSeit(e.a.wiederholt, jetzt) < WIEDERHOLUNG_ABSTAND_TAGEN)
  const faellig = alle.filter((e) => e.a.status === "sitzt" && tageSeit(e.a.zuletzt, jetzt) >= WIEDERHOLUNG_NACH_TAGEN)
  if (!kuerzlichWiederholt && faellig.length > 0) return als(aeltesteZuerst(faellig)[0])

  const offen = alle.filter((e) => e.a.status !== "sitzt")
  const begonnen = offen.filter((e) => e.a.zuletzt)
  const frisch = offen.find((e) => !e.a.zuletzt)
  if (frisch && begonnen.length < OFFEN_ZUGLEICH) return als(frisch)
  return begonnen.length > 0 ? als(aeltesteZuerst(begonnen)[0]) : null
}

function stelleVon(song: RepertoireSong, a: Abschnitt): RepertoireStelle {
  return {
    songId: song.id,
    abschnittId: a.id,
    titel: song.titel,
    band: song.band,
    abschnitt: a.name,
    von: a.von,
    bis: a.bis,
    spur: a.spur,
    status: a.status,
    stimmung: song.stimmung,
    quelle: song.quelle,
    sound: song.sound,
    uebetempo: uebetempoBpm(song.tempoHeader, a.uebetempoProzent),
  }
}

/**
 * The bar accent for the metronome. Only a song that stays in one x/4 measure
 * has one; otherwise every click sounds the same.
 */
export function schlaegeJeTakt(taktarten: string[]): number {
  if (taktarten.length !== 1) return 1
  const [zaehler, nenner] = taktarten[0].split("/").map(Number)
  return nenner === 4 ? zaehler : 1
}

function blockFuer(song: RepertoireSong, a: Abschnitt, seconds: number): SessionBlock {
  const stelle = stelleVon(song, a)
  const bpm = Math.max(MIN_BPM, Math.min(MAX_BPM, stelle.uebetempo))
  const drill: Drill = {
    id: REPERTOIRE_DRILL_ID,
    title: `${song.titel} · ${a.name}`,
    kind: "riff",
    technique: a.technikTags[0] ?? "power-chords",
    goal: song.band,
    cues: [],
    startBpm: bpm,
    targetBpm: bpm,
    beatsPerBar: schlaegeJeTakt(song.taktarten),
    subdivision: 1,
  }
  return { drill, seconds, bpm, round: 1, rounds: 1, repertoire: stelle }
}

/**
 * Puts the chosen section in place of the last riff round. The catalogue riff
 * keeps its earlier rounds, so a plan with only one riff round stays untouched,
 * as does one whose section no longer exists.
 */
export function mitRepertoire(
  blocks: SessionBlock[],
  repertoire: Repertoire,
  wahl: RepertoireWahl | null | undefined,
): SessionBlock[] {
  const song = repertoire.songs.find((s) => s.id === wahl?.songId)
  const abschnitt = song?.abschnitte.find((a) => a.id === wahl?.abschnittId)
  if (!song || !abschnitt) return blocks

  const stelle = blocks.findLastIndex((b) => b.drill.kind === "riff" && b.rounds >= 2)
  if (stelle < 0) return blocks
  const ersetzt = blocks[stelle]

  return blocks.map((block, i) => {
    if (i === stelle) return blockFuer(song, abschnitt, ersetzt.seconds)
    if (block.drill.id !== ersetzt.drill.id) return block
    return { ...block, rounds: block.rounds - 1 }
  })
}

/** The anonymous log entry of a played repertoire block. */
export function repertoireEintrag(bpm: number, seconds: number, jetzt: Date = new Date()): DrillResult {
  return {
    drillId: REPERTOIRE_DRILL_ID,
    technique: REPERTOIRE_DRILL_ID,
    bpm,
    rating: REPERTOIRE_RATING,
    seconds,
    at: jetzt.toISOString(),
  }
}
