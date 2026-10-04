import { ALLE_DRILLS_BY_ID } from "./drills"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import { LEAD_DRILL_ID, SITZT_AB } from "./lead"
import { dayKey, weekKey } from "./progress"
import type { DrillResult, PracticeLog } from "./types"
import { newCard, review, type CardState } from "@/lib/theory/fsrs"
import { SITZT_AB_TAGEN } from "@/lib/theory/progress"
import type { TheoryCard, TheoryLog } from "@/lib/theory/types"

/**
 * Der Merch-Stand — abgeschaut bei Setlist, angepasst an die Gitarre.
 *
 * Spiel, aber ehrlich. Alles hier wird aus den beiden Logs abgeleitet und
 * nirgends gespeichert, wie Tempo und Kartenstand auch: wer den Log einliest,
 * hat danach dieselbe Kutte. Und weil der Log append-only ist, kann ein
 * verdienter Aufnäher nie wieder verschwinden.
 *
 * DIE LEITREGEL, von Setlist übernommen: **belohnt wird Regelmässigkeit und
 * Qualität, nie Menge.** Deshalb zählt der Rang Wochen statt Sessions, es
 * gibt keinen Aufnäher für Minuten am Stück und keinen für die zehnte
 * Session an einem Tag. Und was ein Gerät nicht hat — etwa eine
 * Siebensaitige —, fehlt auf der Kutte, statt als verfehlt dazustehen.
 *
 * Gemessen wird nur, was die App wirklich weiss: die eigene Bewertung, das
 * Tempo gegen das Zieltempo, das gemessene Timing, der Kartenstand aus FSRS.
 * Ob die *Töne* sassen, weiss sie nicht, und dafür gibt es auch nichts.
 */

/** Ein Tag als `YYYY-MM-DD`, lokal. */
type Tag = string

export type Reihe = "buehne" | "handwerk" | "lead" | "sieben" | "wissen"

export const REIHEN: Array<{ id: Reihe; titel: string }> = [
  { id: "buehne", titel: "Bühne" },
  { id: "handwerk", titel: "Handwerk" },
  { id: "lead", titel: "Lead" },
  { id: "sieben", titel: "Sieben Saiten" },
  { id: "wissen", titel: "Wissen" },
]

export interface Aufnaeher {
  id: string
  reihe: Reihe
  /**
   * Die Leiter, zu der er gehört. An der Kutte steht je Leiter nur der
   * nächste fehlende als Umriss — keine Weste voller leerer Kreise.
   */
  gruppe: string
  titel: string
  /** Was es dafür braucht, in einem Satz. */
  text: string
  /** Der Tag, an dem er verdient wurde. Null: noch nicht. */
  verdient: Tag | null
}

/* ───────────────────────────── Schwellen ───────────────────────────── */

export const GIG_STUFEN = [10, 25, 50, 100, 250]
export const SERIE_STUFEN = [4, 12, 26, 52]
export const ZIELTEMPO_STUFEN = [1, 3, 10]
export const LICK_STUFEN = [1, 10, 25]
export const WISSEN_STUFEN = [10, 25, 50, 100]

/** Ab so vielen Tagen ohne Übung ist ein Wiederanfang ein Comeback. */
export const COMEBACK_PAUSE_TAGE = 14

/** Wie viele Tage mit lauter sauberen Blöcken es für „Tight" braucht. */
export const TIGHT_N = 10

/**
 * Ab welchem gemessenen Timing ein Block „auf den Punkt" war.
 *
 * Dieselbe Schwelle, ab der die App nach einer Messung *Locker* vorschlägt —
 * `suggestRating` in `lib/audio/timing.ts`. Zwei Zahlen für dieselbe
 * Aussage liefen auseinander; ein Test hält sie zusammen.
 */
export const AUF_DEN_PUNKT_AB = 85
export const AUF_DEN_PUNKT_N = 10

/* ─────────────────────────────── Hilfen ─────────────────────────────── */

const tagVon = (result: DrillResult): Tag => dayKey(new Date(result.at))

function chronologisch(log: PracticeLog): DrillResult[] {
  return [...log.results]
    .filter((r) => !Number.isNaN(Date.parse(r.at)))
    .sort((a, b) => a.at.localeCompare(b.at))
}

const istSieben = (result: DrillResult) => result.drillId in SIEBEN_DRILLS_BY_ID
const istLickAbgehakt = (result: DrillResult) =>
  result.drillId === LEAD_DRILL_ID && result.rating >= SITZT_AB

/**
 * Wie viele Wochen am Stück bis einschliesslich jeder geübten Woche.
 * Die laufende Serie interessiert hier nicht, sondern jede, die es je gab:
 * eine erreichte Stufe bleibt erreicht, auch wenn die Serie danach riss.
 */
function wochenLaeufe(tage: Tag[]): Array<{ tag: Tag; laenge: number }> {
  const wochen = [...new Set(tage.map((t) => weekKey(new Date(`${t}T12:00:00`))))].sort()
  const erster = new Map<string, Tag>()
  for (const t of [...tage].sort()) {
    const w = weekKey(new Date(`${t}T12:00:00`))
    if (!erster.has(w)) erster.set(w, t)
  }

  const out: Array<{ tag: Tag; laenge: number }> = []
  let laenge = 0
  let vorige: string | null = null
  for (const w of wochen) {
    if (vorige !== null) {
      const erwartet = new Date(`${vorige}T12:00:00`)
      erwartet.setDate(erwartet.getDate() + 7)
      laenge = dayKey(erwartet) === w ? laenge + 1 : 1
    } else {
      laenge = 1
    }
    out.push({ tag: erster.get(w)!, laenge })
    vorige = w
  }
  return out
}

/* ─────────────────────────────── Katalog ─────────────────────────────── */

/**
 * Welche Aufnäher es auf diesem Gerät überhaupt gibt.
 *
 * Die Sieben-Saiter-Reihe erscheint erst, wenn je auf sieben Saiten geübt
 * wurde. Wer keine hat, soll sie nicht als Lücke auf der Kutte sehen.
 */
export function katalog({ mitSieben }: { mitSieben: boolean }): Omit<Aufnaeher, "verdient">[] {
  const out: Omit<Aufnaeher, "verdient">[] = []
  const p = (id: string, reihe: Reihe, gruppe: string, titel: string, text: string) =>
    out.push({ id, reihe, gruppe, titel, text })

  p("debuet", "buehne", "debuet", "Debüt", "Die erste Session.")
  for (const n of GIG_STUFEN) p(`gigs-${n}`, "buehne", "gigs", `${n} Gigs`, `An ${n} Tagen geübt.`)
  for (const n of SERIE_STUFEN) {
    p(`serie-${n}`, "buehne", "serie", `${n} Wochen am Stück`, `${n} Wochen in Folge, jede mit mindestens einer Session.`)
  }
  p("comeback", "buehne", "comeback", "Comeback", `Nach mindestens ${COMEBACK_PAUSE_TAGE} Tagen Pause wieder angefangen.`)

  p("tight", "handwerk", "tight", "Tight", `${TIGHT_N} Tage, an denen jeder Block mindestens sauber lief.`)
  p(
    "auf-den-punkt",
    "handwerk",
    "auf-den-punkt",
    "Auf den Punkt",
    `${AUF_DEN_PUNKT_N} Blöcke mit gemessenem Timing ${AUF_DEN_PUNKT_AB} oder besser.`,
  )
  for (const n of ZIELTEMPO_STUFEN) {
    p(
      `zieltempo-${n}`,
      "handwerk",
      "zieltempo",
      n === 1 ? "Zieltempo" : `Zieltempo × ${n}`,
      n === 1 ? "Ein Drill sauber im Zieltempo." : `${n} verschiedene Drills sauber im Zieltempo.`,
    )
  }

  for (const n of LICK_STUFEN) {
    p(
      `licks-${n}`,
      "lead",
      "licks",
      n === 1 ? "Gitarrensolo" : `${n} Licks`,
      n === 1 ? "Das erste Lick mit Sauber abgehakt." : `${n} Licks mit Sauber abgehakt.`,
    )
  }

  if (mitSieben) {
    p("sieben-1", "sieben", "sieben", "Die Siebte", "Die erste Session auf sieben Saiten.")
    p("sieben-10", "sieben", "sieben", "Low End", "An zehn Tagen auf sieben Saiten geübt.")
  }

  for (const n of WISSEN_STUFEN) {
    p(`wissen-${n}`, "wissen", "wissen", `${n} Karten sitzen`, `${n} Wissenskarten, die eine Woche halten.`)
  }
  p("taktgefuehl", "wissen", "taktgefuehl", "Taktgefühl", "Die erste gespielte Frage richtig beantwortet.")
  return out
}

/* ──────────────────────────── Verdient wann ──────────────────────────── */

/**
 * Jeder Aufnäher mit dem Tag, an dem er verdient wurde — oder null.
 *
 * Ein Durchlauf durch beide Logs, in zeitlicher Reihenfolge. Der Kartenstand
 * wird dabei mitgespielt, nicht am Ende abgelesen: eine Karte, die einmal
 * eine Woche hielt und später vergessen wurde, hat ihren Aufnäher trotzdem
 * verdient. Er sagt, was erreicht wurde, nicht was heute gilt.
 */
export function aufnaeher(
  log: PracticeLog,
  theorie: TheoryLog = { version: 1, answers: [] },
  karten: TheoryCard[] = [],
): Aufnaeher[] {
  const ergebnisse = chronologisch(log)
  const kat = katalog({ mitSieben: ergebnisse.some(istSieben) })
  const gibt = new Set(kat.map((k) => k.id))
  const verdient: Record<string, Tag> = {}
  const setze = (id: string, tag: Tag) => {
    if (gibt.has(id) && !verdient[id]) verdient[id] = tag
  }

  // ── Bühne: Tage, Serien, Comeback
  const tage = [...new Set(ergebnisse.map(tagVon))].sort()
  if (tage.length > 0) setze("debuet", tage[0])
  for (const n of GIG_STUFEN) if (tage.length >= n) setze(`gigs-${n}`, tage[n - 1])
  for (const { tag, laenge } of wochenLaeufe(tage)) {
    for (const n of SERIE_STUFEN) if (laenge >= n) setze(`serie-${n}`, tag)
  }
  tage.forEach((tag, i) => {
    if (i === 0) return
    const pause = (Date.parse(`${tag}T12:00:00`) - Date.parse(`${tage[i - 1]}T12:00:00`)) / 86_400_000
    if (pause >= COMEBACK_PAUSE_TAGE) setze("comeback", tag)
  })

  // ── Handwerk: sauber, gemessen, im Zieltempo
  const jeTag = new Map<Tag, DrillResult[]>()
  for (const r of ergebnisse) jeTag.set(tagVon(r), [...(jeTag.get(tagVon(r)) ?? []), r])
  let tight = 0
  for (const tag of tage) {
    if (jeTag.get(tag)!.every((r) => r.rating >= SITZT_AB) && ++tight >= TIGHT_N) setze("tight", tag)
  }

  let punktgenau = 0
  const imZiel = new Set<string>()
  let licks = 0
  const siebenTage = new Set<Tag>()
  for (const r of ergebnisse) {
    const tag = tagVon(r)
    if (r.timing && r.timing.score >= AUF_DEN_PUNKT_AB && ++punktgenau >= AUF_DEN_PUNKT_N) {
      setze("auf-den-punkt", tag)
    }
    const drill = ALLE_DRILLS_BY_ID[r.drillId]
    if (drill && r.rating >= SITZT_AB && r.bpm >= drill.targetBpm) {
      imZiel.add(r.drillId)
      for (const n of ZIELTEMPO_STUFEN) if (imZiel.size >= n) setze(`zieltempo-${n}`, tag)
    }
    if (istLickAbgehakt(r)) {
      licks += 1
      for (const n of LICK_STUFEN) if (licks >= n) setze(`licks-${n}`, tag)
    }
    if (istSieben(r)) {
      siebenTage.add(tag)
      setze("sieben-1", tag)
      if (siebenTage.size >= 10) setze("sieben-10", tag)
    }
  }

  // ── Wissen: der Kartenstand, mitgespielt
  const gespielt = new Set(karten.filter((k) => k.frage.art === "gespielt").map((k) => k.id))
  const stand = new Map<string, CardState>()
  const sitzen = new Set<string>()
  const antworten = [...theorie.answers]
    .filter((a) => !Number.isNaN(Date.parse(a.at)))
    .sort((a, b) => a.at.localeCompare(b.at))
  for (const antwort of antworten) {
    const zeit = new Date(antwort.at)
    const tag = dayKey(zeit)
    const neu = review(stand.get(antwort.cardId) ?? newCard(zeit), antwort.grade, zeit)
    stand.set(antwort.cardId, neu)
    if ((neu.stability ?? 0) >= SITZT_AB_TAGEN) sitzen.add(antwort.cardId)
    for (const n of WISSEN_STUFEN) if (sitzen.size >= n) setze(`wissen-${n}`, tag)
    if (antwort.correct && gespielt.has(antwort.cardId)) setze("taktgefuehl", tag)
  }

  return kat.map((k) => ({ ...k, verdient: verdient[k.id] ?? null }))
}

/** Was an die Kutte kommt: alles Verdiente, und je Leiter der nächste Schritt. */
export function kutte(liste: Aufnaeher[]): { verdient: Aufnaeher[]; naechste: Aufnaeher[] } {
  const verdient = liste.filter((a) => a.verdient)
  const gesehen = new Set<string>()
  const naechste: Aufnaeher[] = []
  for (const a of liste) {
    if (a.verdient || gesehen.has(a.gruppe)) continue
    gesehen.add(a.gruppe)
    naechste.push(a)
  }
  return { verdient, naechste }
}

/**
 * Was eine Session neu eingebracht hat.
 *
 * Gerechnet als Differenz zweier vollständiger Läufe — vorher und nachher —,
 * nicht als „was heute verdient wurde": sonst feierte der Abschluss einer
 * zweiten Session am selben Tag noch einmal, was schon die erste gebracht hat.
 */
export function neueAufnaeher(vorher: Aufnaeher[], nachher: Aufnaeher[]): Aufnaeher[] {
  const alt = new Set(vorher.filter((a) => a.verdient).map((a) => a.id))
  return nachher.filter((a) => a.verdient && !alt.has(a.id))
}

/* ─────────────────────────────── Der Rang ─────────────────────────────── */

/**
 * Wochen mit mindestens einer Session — nicht Sessions. Wer in einer Woche
 * siebenmal übt, steigt nicht schneller als mit zweimal; wer pausiert, steigt
 * nicht ab. **Der Rang fällt nie.**
 */
export const RAENGE = [
  { id: "garage", titel: "Garagenband", wochen: 0 },
  { id: "proberaum", titel: "Proberaum", wochen: 4 },
  { id: "vorband", titel: "Vorband", wochen: 12 },
  { id: "support", titel: "Support", wochen: 26 },
  { id: "headliner", titel: "Headliner", wochen: 52 },
  { id: "festival", titel: "Festival", wochen: 104 },
  { id: "halloffame", titel: "Hall of Fame", wochen: 208 },
] as const

export interface Rang {
  id: string
  titel: string
  stufe: number
  wochen: number
  naechster: { titel: string; wochen: number; fehlt: number } | null
  /** Wie weit es bis zum nächsten Rang ist, 0 bis 1. */
  anteil: number
}

export function rang(log: PracticeLog): Rang {
  const wochen = new Set(chronologisch(log).map((r) => weekKey(new Date(r.at)))).size
  let i = 0
  while (i + 1 < RAENGE.length && wochen >= RAENGE[i + 1].wochen) i += 1
  const jetzt = RAENGE[i]
  const naechster = RAENGE[i + 1] ?? null
  return {
    id: jetzt.id,
    titel: jetzt.titel,
    stufe: i,
    wochen,
    naechster: naechster
      ? { titel: naechster.titel, wochen: naechster.wochen, fehlt: naechster.wochen - wochen }
      : null,
    anteil: naechster ? (wochen - jetzt.wochen) / (naechster.wochen - jetzt.wochen) : 1,
  }
}

/* ────────────────────────────── Tourshirts ────────────────────────────── */

const ADJEKTIVE = [
  "Iron", "Steel", "Thunder", "Heavy", "Black", "Electric",
  "Molten", "Savage", "Midnight", "Raw", "Burning", "Chrome",
]
const NOMEN = [
  "Riffs", "Strings", "Frets", "Pickups", "Amps", "Feedback",
  "Distortion", "Downstrokes", "Palm Mutes", "Power Chords", "Tremolo", "Fuzz",
]

/** FNV-1a — klein, deterministisch, und für Namen völlig ausreichend. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Ein Tourname, der für dasselbe Quartal immer derselbe ist — auf jedem Gerät. */
export function tourName(jahr: number, quartal: number): string {
  const h = hash(`${jahr}-Q${quartal}`)
  return `${ADJEKTIVE[h % ADJEKTIVE.length]} ${NOMEN[(h >>> 8) % NOMEN.length]} Tour`
}

export interface Tour {
  jahr: number
  quartal: number
  name: string
  laufend: boolean
  /** Die Tage, an denen geübt wurde — der Rückendruck. */
  gigs: Tag[]
  minuten: number
  /** Davon auf sieben Saiten. */
  siebenGigs: number
  aufnaeher: number
}

const quartalVon = (tag: Tag) => Math.floor((Number(tag.slice(5, 7)) - 1) / 3) + 1

/** Jedes Quartal mit mindestens einem Gig ist eine Tour, die neueste zuerst. */
export function touren(log: PracticeLog, liste: Aufnaeher[] = [], heute: Date = new Date()): Tour[] {
  const jetzt = dayKey(heute)
  const map = new Map<string, { jahr: number; quartal: number; tage: Set<Tag>; sieben: Set<Tag>; sekunden: number }>()
  for (const r of chronologisch(log)) {
    const tag = tagVon(r)
    const jahr = Number(tag.slice(0, 4))
    const quartal = quartalVon(tag)
    const key = `${jahr}-Q${quartal}`
    if (!map.has(key)) map.set(key, { jahr, quartal, tage: new Set(), sieben: new Set(), sekunden: 0 })
    const t = map.get(key)!
    t.tage.add(tag)
    if (istSieben(r)) t.sieben.add(tag)
    t.sekunden += r.seconds
  }
  return [...map.values()].reverse().map((t) => ({
    jahr: t.jahr,
    quartal: t.quartal,
    name: tourName(t.jahr, t.quartal),
    laufend: Number(jetzt.slice(0, 4)) === t.jahr && quartalVon(jetzt) === t.quartal,
    gigs: [...t.tage].sort(),
    minuten: Math.round(t.sekunden / 60),
    siebenGigs: t.sieben.size,
    aufnaeher: liste.filter(
      (a) => a.verdient && Number(a.verdient.slice(0, 4)) === t.jahr && quartalVon(a.verdient) === t.quartal,
    ).length,
  }))
}
