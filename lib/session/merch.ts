import { ALLE_DRILLS_BY_ID } from "./drills"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import { LEAD_DRILL_ID, SITZT_AB } from "./lead"
import { dayKey, weekKey } from "./progress"
import { TECHNIQUE_LABELS, type DrillResult, type PracticeLog, type Technique } from "./types"
import { newCard, review, type CardState } from "@/lib/theory/fsrs"
import { HALS_PREFIX, istHalsAntwort } from "@/lib/theory/hals-id"
import { HALS_STELLEN } from "@/lib/theory/hals-trainer"
import { SITZT_AB_TAGEN } from "@/lib/theory/progress"
import { STANDARD as ANLAESSE, trifft } from "./anlaesse"
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

export type Reihe = "buehne" | "handwerk" | "technik" | "lead" | "sieben" | "wissen" | "hals" | "anlaesse"

export const REIHEN: Array<{ id: Reihe; titel: string }> = [
  { id: "buehne", titel: "Bühne" },
  { id: "handwerk", titel: "Handwerk" },
  { id: "technik", titel: "Techniken" },
  { id: "lead", titel: "Lead" },
  { id: "sieben", titel: "Sieben Saiten" },
  { id: "wissen", titel: "Wissen" },
  { id: "hals", titel: "Griffbrett" },
  { id: "anlaesse", titel: "Anlässe" },
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
  /**
   * Nur in der Reihe *Techniken*: das Motiv ist das Zeichen der Technik,
   * gerechnet statt gezeichnet — elf Bilder aus einem Raster.
   */
  technik?: Exclude<Technique, "warmup">
}

/* ───────────────────────────── Schwellen ───────────────────────────── */

export const GIG_STUFEN = [10, 25, 50, 100, 250]
export const SERIE_STUFEN = [4, 12, 26, 52]
export const ZIELTEMPO_STUFEN = [1, 3, 10]
export const LICK_STUFEN = [1, 10, 25]
export const WISSEN_STUFEN = [10, 25, 50, 100]
/** Stellen auf dem Hals, die beim Finden eine Woche halten. Die letzte Stufe ist der ganze Hals. */
export const HALS_STUFEN = [12, 36, HALS_STELLEN.length]

/** Ab so vielen Tagen ohne Übung ist ein Wiederanfang ein Comeback. */
export const COMEBACK_PAUSE_TAGE = 14

/** Tage mit lauter sauberen Blöcken — „Tight", dann „Eingespielt", dann „Wie aus einem Guss". */
export const TIGHT_STUFEN = [10, 25, 50]
export const TIGHT_N = TIGHT_STUFEN[0]
const TIGHT_TITEL = ["Tight", "Eingespielt", "Wie aus einem Guss"]

/**
 * Ab welchem gemessenen Timing ein Block „auf den Punkt" war.
 *
 * Dieselbe Schwelle, ab der die App nach einer Messung *Locker* vorschlägt —
 * `suggestRating` in `lib/audio/timing.ts`. Zwei Zahlen für dieselbe
 * Aussage liefen auseinander; ein Test hält sie zusammen.
 */
export const AUF_DEN_PUNKT_AB = 85
/** Gemessene Blöcke ab dieser Schwelle — „Auf den Punkt", „Im Raster", „Studioreif". */
export const AUF_DEN_PUNKT_STUFEN = [10, 50, 150]
export const AUF_DEN_PUNKT_N = AUF_DEN_PUNKT_STUFEN[0]
const AUF_DEN_PUNKT_TITEL = ["Auf den Punkt", "Im Raster", "Studioreif"]

/**
 * Ein Aufnäher je Technik: an so vielen *verschiedenen* Tagen ein Drill
 * dieser Technik, sauber gespielt. Tage statt Blöcke, damit es Regelmässigkeit
 * misst und nicht einen langen Abend; sauber statt Zieltempo, weil das
 * Zieltempo schon seine eigene Leiter hat und Monate weit weg liegen kann.
 */
export const TECHNIK_TAGE = 5

/** Die Namen auf den Technik-Aufnähern. Das Warm-up hat keinen: es kommt in jeder Session. */
export const TECHNIK_TITEL: Record<Exclude<Technique, "warmup">, string> = {
  "power-chords": "Wall of Sound",
  "palm-mute": "Chug",
  downpicking: "Stahlhand",
  gallop: "Galopp",
  "alternate-picking": "Wechselschlag",
  pentatonic: "Pentatonik",
  bending: "Bendmeister",
  legato: "Hammer & Pull",
  slides: "Rutschpartie",
  "dead-notes": "Dead Notes",
  tremolo: "Blizzard",
}
const TECHNIKEN = Object.keys(TECHNIK_TITEL) as Array<keyof typeof TECHNIK_TITEL>

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
 * wurde. Wer keine hat, soll sie nicht als Lücke auf der Kutte sehen. Mit den
 * Aufnähern der Anlässe ist es genauso: Sie stehen nur da, wenn sie verdient
 * sind (`anlaesse` nennt deren Kennungen) — Weihnachten und zwei Gedenktage
 * als leere Umrisse wären Schmuck und eine Lücke, die sich nur selten füllt.
 */
export function katalog({
  mitSieben,
  anlaesse = [],
}: {
  mitSieben: boolean
  anlaesse?: string[]
}): Omit<Aufnaeher, "verdient">[] {
  const out: Omit<Aufnaeher, "verdient">[] = []
  const p = (id: string, reihe: Reihe, gruppe: string, titel: string, text: string) =>
    out.push({ id, reihe, gruppe, titel, text })

  p("debuet", "buehne", "debuet", "Debüt", "Die erste Session.")
  for (const n of GIG_STUFEN) p(`gigs-${n}`, "buehne", "gigs", `${n} Gigs`, `An ${n} Tagen geübt.`)
  for (const n of SERIE_STUFEN) {
    p(`serie-${n}`, "buehne", "serie", `${n} Wochen am Stück`, `${n} Wochen in Folge, jede mit mindestens einer Session.`)
  }
  p("comeback", "buehne", "comeback", "Comeback", `Nach mindestens ${COMEBACK_PAUSE_TAGE} Tagen Pause wieder angefangen.`)

  // Die erste Stufe behält ihre alte Nummer, damit nichts doppelt gefeiert wird.
  TIGHT_STUFEN.forEach((n, i) =>
    p(
      i === 0 ? "tight" : `tight-${n}`,
      "handwerk",
      "tight",
      TIGHT_TITEL[i],
      `${n} Tage, an denen jeder Block mindestens sauber lief.`,
    ),
  )
  AUF_DEN_PUNKT_STUFEN.forEach((n, i) =>
    p(
      i === 0 ? "auf-den-punkt" : `auf-den-punkt-${n}`,
      "handwerk",
      "auf-den-punkt",
      AUF_DEN_PUNKT_TITEL[i],
      `${n} Blöcke mit gemessenem Timing ${AUF_DEN_PUNKT_AB} oder besser.`,
    ),
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

  for (const technik of TECHNIKEN) {
    out.push({
      id: `technik-${technik}`,
      reihe: "technik",
      gruppe: "technik",
      titel: TECHNIK_TITEL[technik],
      text: `An ${TECHNIK_TAGE} Tagen ${TECHNIQUE_LABELS[technik]} sauber gespielt.`,
      technik,
    })
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

  // Der Griffbrett-Trainer: gezählt wird, was eine Woche hält, nicht was
  // einmal getippt wurde — dieselbe Schwelle wie bei den Wissenskarten.
  for (const n of HALS_STUFEN) {
    const ganz = n === HALS_STELLEN.length
    p(
      `hals-${n}`,
      "hals",
      "hals",
      ganz ? "Der ganze Hals" : `${n} Stellen`,
      ganz
        ? `Alle ${n} Stellen bis zum 12. Bund gefunden, jede hält eine Woche.`
        : `${n} Stellen auf dem Hals, die beim Finden eine Woche halten.`,
    )
  }
  p(
    "hals-beide",
    "hals",
    "hals-beide",
    "In- und auswendig",
    `Alle ${HALS_STELLEN.length} Stellen in beiden Richtungen: finden und benennen.`,
  )

  for (const a of ANLAESSE) {
    if (a.patch && anlaesse.includes(a.id)) p(`anlass-${a.id}`, "anlaesse", `anlass-${a.id}`, a.patch.titel, a.patch.text)
  }
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
  // Der erste Tag, an dem geübt wurde und ein Anlass galt. Gerechnet über
  // `trifft`, nicht über den Rang: an einem Tag mit zwei Anlässen zählen beide.
  const anlassTage: Record<string, Tag> = {}
  for (const tag of [...new Set(ergebnisse.map(tagVon))].sort()) {
    for (const a of ANLAESSE) if (a.patch && !anlassTage[a.id] && trifft(a, tag)) anlassTage[a.id] = tag
  }
  const kat = katalog({ mitSieben: ergebnisse.some(istSieben), anlaesse: Object.keys(anlassTage) })
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

  for (const [id, tag] of Object.entries(anlassTage)) setze(`anlass-${id}`, tag)

  // ── Handwerk: sauber, gemessen, im Zieltempo
  const jeTag = new Map<Tag, DrillResult[]>()
  for (const r of ergebnisse) jeTag.set(tagVon(r), [...(jeTag.get(tagVon(r)) ?? []), r])
  let tight = 0
  for (const tag of tage) {
    if (!jeTag.get(tag)!.every((r) => r.rating >= SITZT_AB)) continue
    tight += 1
    TIGHT_STUFEN.forEach((n, i) => tight >= n && setze(i === 0 ? "tight" : `tight-${n}`, tag))
  }

  let punktgenau = 0
  const technikTage = new Map<Technique, Set<Tag>>()
  const imZiel = new Set<string>()
  let licks = 0
  const siebenTage = new Set<Tag>()
  for (const r of ergebnisse) {
    const tag = tagVon(r)
    if (r.timing && r.timing.score >= AUF_DEN_PUNKT_AB) {
      punktgenau += 1
      AUF_DEN_PUNKT_STUFEN.forEach(
        (n, i) => punktgenau >= n && setze(i === 0 ? "auf-den-punkt" : `auf-den-punkt-${n}`, tag),
      )
    }
    const drill = ALLE_DRILLS_BY_ID[r.drillId]
    // The catalogue knows the technique; the entry's own field is the
    // fallback for a drill this device does not have yet.
    const technik = (drill?.technique ?? r.technique) as Technique
    if (technik in TECHNIK_TITEL && r.rating >= SITZT_AB) {
      const tageHier = technikTage.get(technik) ?? new Set<Tag>()
      tageHier.add(tag)
      technikTage.set(technik, tageHier)
      if (tageHier.size >= TECHNIK_TAGE) setze(`technik-${technik}`, tag)
    }
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
  // Places on the neck from the fretboard trainer share the log but are not
  // knowledge cards — "100 Karten sitzen" is not earned by finding F.
  const antworten = [...theorie.answers]
    .filter((a) => !Number.isNaN(Date.parse(a.at)) && !istHalsAntwort(a))
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

  // ── Griffbrett: dieselbe Wiederholung, eigene Zählung je Richtung
  const halsStand = new Map<string, CardState>()
  const halsSitzt = { finden: new Set<string>(), benennen: new Set<string>() }
  const halsAntworten = [...theorie.answers]
    .filter((a) => !Number.isNaN(Date.parse(a.at)) && istHalsAntwort(a))
    .sort((a, b) => a.at.localeCompare(b.at))
  for (const antwort of halsAntworten) {
    const zeit = new Date(antwort.at)
    const tag = dayKey(zeit)
    const neu = review(halsStand.get(antwort.cardId) ?? newCard(zeit), antwort.grade, zeit)
    halsStand.set(antwort.cardId, neu)
    if ((neu.stability ?? 0) < SITZT_AB_TAGEN) continue
    const richtung = antwort.cardId.startsWith(`${HALS_PREFIX}finden-`) ? "finden" : "benennen"
    halsSitzt[richtung].add(antwort.cardId)
    for (const n of HALS_STUFEN) if (halsSitzt.finden.size >= n) setze(`hals-${n}`, tag)
    if (halsSitzt.finden.size >= HALS_STELLEN.length && halsSitzt.benennen.size >= HALS_STELLEN.length) {
      setze("hals-beide", tag)
    }
  }

  const liste = kat.map((k) => ({ ...k, verdient: verdient[k.id] ?? null }))
  // Techniques form one ladder with no fixed order. The outline on the vest
  // is the one closest to done, and it says how far it is — the next patch
  // should be the one this player is actually working on.
  const fehlt = (a: Aufnaeher) => TECHNIK_TAGE - (technikTage.get(a.technik!)?.size ?? 0)
  const technikListe = liste
    .filter((a) => a.technik)
    .map((a) =>
      a.verdient || fehlt(a) === TECHNIK_TAGE
        ? a
        : { ...a, text: `${a.text} Noch ${fehlt(a)} ${fehlt(a) === 1 ? "Tag" : "Tage"}.` },
    )
    .sort(
      (a, b) =>
        (a.verdient ? 0 : 1) - (b.verdient ? 0 : 1) ||
        (a.verdient ?? "").localeCompare(b.verdient ?? "") ||
        fehlt(a) - fehlt(b),
    )
  let t = 0
  return liste.map((a) => (a.technik ? technikListe[t++] : a))
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

/* ─────────────────────────────── Bilder ─────────────────────────────── */

/**
 * Pixel art from `public/merch/`: a 24×24 patch per ladder, a 96×48 scene
 * per rank. One picture per ladder, not per step — the step is in the title,
 * and twelve variations of the same microphone would say less, not more.
 * `merch-bilder.test.ts` checks that every ladder and every rank has its file,
 * at the size it is drawn for.
 */
export const aufnaeherBild = (gruppe: string) => `/merch/aufnaeher-${gruppe}.png`
export const rangBild = (rangId: string) => `/merch/rang-${rangId}.png`
/** Die Gitarre zum Rang fürs Rack, 24 × 56 — `tools/gitarren.mjs` zeichnet sie. */
export const gitarreBild = (rangId: string) => `/merch/gitarre-${rangId}.png`

/* ─────────────────────────────── Der Rang ─────────────────────────────── */

/**
 * Wochen mit mindestens einer Session — nicht Sessions. Wer in einer Woche
 * siebenmal übt, steigt nicht schneller als mit zweimal; wer pausiert, steigt
 * nicht ab. **Der Rang fällt nie.**
 */
export const RAENGE = [
  { id: "garage", titel: "Garagenband", wochen: 0, gitarre: "Proberaum-Brett" },
  { id: "proberaum", titel: "Proberaum", wochen: 4, gitarre: "Kellerkind" },
  { id: "vorband", titel: "Vorband", wochen: 12, gitarre: "Offset Blues" },
  { id: "support", titel: "Support", wochen: 26, gitarre: "Nachtfalke" },
  { id: "headliner", titel: "Headliner", wochen: 52, gitarre: "Stahlstern" },
  { id: "festival", titel: "Festival", wochen: 104, gitarre: "Sieben Siegel" },
  { id: "halloffame", titel: "Hall of Fame", wochen: 208, gitarre: "Goldene Axt" },
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

/* ──────────────────────────── Festival-Shirts ──────────────────────────── */

export interface FestivalShirt {
  /** The rank it belongs to — also the key of its print in `shirt.ts`. */
  id: string
  titel: string
  wochen: number
  /** The day of the session that reached the rank. Null: not yet. */
  verdient: Tag | null
}

/**
 * A shirt for every rank reached after the first. The rank is the slowest
 * thing in the app — months between steps —, and the tour shirts come once a
 * quarter; a step up the ladder is worth something to wear. Counted exactly
 * like `rang`: the day of the first session in the n-th week with one.
 */
/**
 * The day each rank was reached, in the order of `RAENGE` — null where it has
 * not been yet. The garage is the first session; every later rank is the
 * first session of its n-th week, counted exactly like `rang`.
 */
export function rangTage(log: PracticeLog): Array<Tag | null> {
  const ersteJeWoche = new Map<string, Tag>()
  for (const r of chronologisch(log)) {
    const woche = weekKey(new Date(r.at))
    if (!ersteJeWoche.has(woche)) ersteJeWoche.set(woche, tagVon(r))
  }
  const wochen = [...ersteJeWoche.keys()].sort()
  return RAENGE.map((r) =>
    wochen.length >= Math.max(1, r.wochen) ? ersteJeWoche.get(wochen[Math.max(1, r.wochen) - 1])! : null,
  )
}

export function festivalShirts(log: PracticeLog): FestivalShirt[] {
  const tage = rangTage(log)
  return RAENGE.slice(1).map((r, i) => ({
    id: r.id,
    // Durchgekoppelt, wie es im Deutschen gehört: Hall-of-Fame-Shirt.
    titel: `${r.titel.replace(/ /g, "-")}-Shirt`,
    wochen: r.wochen,
    verdient: tage[i + 1],
  }))
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

/** What a day on tour was: the daily session, a lick on its own, or the seven-string. */
export type GigArt = "session" | "lick" | "sieben"

export interface Termin {
  tag: Tag
  arten: GigArt[]
}

export interface Tour {
  jahr: number
  quartal: number
  name: string
  laufend: boolean
  /** Die Tage, an denen geübt wurde — der Rückendruck. */
  gigs: Tag[]
  /** Dieselben Tage mit dem, was gespielt wurde — die Liste unter dem Shirt. */
  termine: Termin[]
  minuten: number
  /** Davon auf sieben Saiten. */
  siebenGigs: number
  aufnaeher: number
}

const quartalVon = (tag: Tag) => Math.floor((Number(tag.slice(5, 7)) - 1) / 3) + 1

/** Jedes Quartal mit mindestens einem Gig ist eine Tour, die neueste zuerst. */
export function touren(log: PracticeLog, liste: Aufnaeher[] = [], heute: Date = new Date()): Tour[] {
  const jetzt = dayKey(heute)
  const map = new Map<
    string,
    { jahr: number; quartal: number; tage: Set<Tag>; sieben: Set<Tag>; sekunden: number; arten: Map<Tag, Set<GigArt>> }
  >()
  for (const r of chronologisch(log)) {
    const tag = tagVon(r)
    const jahr = Number(tag.slice(0, 4))
    const quartal = quartalVon(tag)
    const key = `${jahr}-Q${quartal}`
    if (!map.has(key)) map.set(key, { jahr, quartal, tage: new Set(), sieben: new Set(), sekunden: 0, arten: new Map() })
    const t = map.get(key)!
    t.tage.add(tag)
    const art: GigArt = istSieben(r) ? "sieben" : r.drillId === LEAD_DRILL_ID ? "lick" : "session"
    t.arten.set(tag, (t.arten.get(tag) ?? new Set<GigArt>()).add(art))
    if (istSieben(r)) t.sieben.add(tag)
    t.sekunden += r.seconds
  }
  return [...map.values()].reverse().map((t) => ({
    jahr: t.jahr,
    quartal: t.quartal,
    name: tourName(t.jahr, t.quartal),
    laufend: Number(jetzt.slice(0, 4)) === t.jahr && quartalVon(jetzt) === t.quartal,
    gigs: [...t.tage].sort(),
    termine: [...t.tage].sort().map((tag) => ({
      tag,
      // A session that included the lead drill was still a session, not a lick on its own.
      arten: (["session", "lick", "sieben"] as const).filter(
        (a) => t.arten.get(tag)!.has(a) && !(a === "lick" && t.arten.get(tag)!.has("session")),
      ),
    })),
    minuten: Math.round(t.sekunden / 60),
    siebenGigs: t.sieben.size,
    aufnaeher: liste.filter(
      (a) => a.verdient && Number(a.verdient.slice(0, 4)) === t.jahr && quartalVon(a.verdient) === t.quartal,
    ).length,
  }))
}
