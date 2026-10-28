import { isDue, newCard, review, retrievability, type CardState } from "./fsrs"
import { istHalsAntwort } from "./hals-id"
import type { Sicherheit, TheoryAnswer, TheoryCard, TheoryLog } from "./types"

/**
 * Der Stand jeder Karte, abgespielt aus dem Antwort-Log.
 *
 * Der Zustand wird **nicht** gespeichert, sondern hergeleitet. Das ist keine
 * Sparsamkeit, sondern Bedingung für den Abgleich: der Log ist append-only und
 * verschmilzt über Vereinigung, ein gespeicherter Kartenzustand dagegen wäre
 * veränderlich und zwei Geräte müssten sich einigen, wer gewinnt. Abspielen
 * liefert auf beiden dasselbe Ergebnis, ohne dass jemand gewinnen muss.
 *
 * Bei vier Fragen am Tag sind das nach einem Jahr rund anderthalbtausend
 * Einträge — für einen Durchlauf pro Session ist das nichts.
 */
export function cardStates(log: TheoryLog): Map<string, CardState> {
  const sortiert = [...log.answers].sort((a, b) => a.at.localeCompare(b.at))
  const stand = new Map<string, CardState>()

  for (const antwort of sortiert) {
    const zeit = new Date(antwort.at)
    if (Number.isNaN(zeit.getTime())) continue
    const vorher = stand.get(antwort.cardId) ?? newCard(zeit)
    stand.set(antwort.cardId, review(vorher, antwort.grade, zeit))
  }
  return stand
}

export interface FaelligeKarte {
  card: TheoryCard
  state: CardState | null
  /** Wie wahrscheinlich sie gerade noch sitzt. Null bei einer neuen Karte. */
  retrievability: number
}

/**
 * Sicher gewesen und danebengelegen: die gefährlichste Sorte Fehler, weil sie
 * sich richtig anfühlt und deshalb nie nachgeschlagen wird.
 */
export function istScheinwissen(antwort: Pick<TheoryAnswer, "sure" | "correct">): boolean {
  return antwort.sure === 3 && !antwort.correct
}

/**
 * Welche Karten gerade Scheinwissen sind: die *letzte* Antwort war sicher und
 * falsch. Mit der nächsten Antwort ist die Karte es nicht mehr — gezählt wird
 * nach Zeit, nicht nach Listenreihenfolge, denn nach einem Abgleich liegen die
 * Einträge durcheinander.
 *
 * Das ist eine Ansicht auf den Log, kein gespeicherter Zustand, aus demselben
 * Grund wie `cardStates`.
 */
function scheinwissenIds(log: TheoryLog): Set<string> {
  const letzte = new Map<string, TheoryAnswer>()
  const sortiert = [...log.answers].sort((a, b) => a.at.localeCompare(b.at))
  for (const antwort of sortiert) {
    if (Number.isNaN(Date.parse(antwort.at))) continue
    letzte.set(antwort.cardId, antwort)
  }
  const ids = new Set<string>()
  for (const [id, antwort] of letzte) {
    if (istScheinwissen(antwort)) ids.add(id)
  }
  return ids
}

/** Die Karten, bei denen die letzte Antwort Scheinwissen war. */
export function scheinwissenKarten(cards: TheoryCard[], log: TheoryLog): TheoryCard[] {
  const ids = scheinwissenIds(log)
  return cards.filter((card) => ids.has(card.id))
}

/**
 * Was heute drankommt, schwächste zuerst.
 *
 * Eine neue Karte hat keine Abrufbarkeit — sie zählt als 0 und steht damit
 * ganz vorn, aber erst nachdem alles Fällige durch ist: Behalten geht vor
 * Neuanfangen, sonst wächst der Rückstand, während man Neues sammelt.
 *
 * Scheinwissen geht vor allem anderen und gilt als sofort fällig, auch wenn
 * FSRS die Karte auf später gelegt hat. Die FSRS-Rechnung selbst bleibt
 * unberührt: sie weiss nicht, wie sicher man sich war, und soll es nicht
 * wissen, ihr Port hängt an den Prüfwerten der Referenz.
 */
export function dueCards(
  cards: TheoryCard[],
  log: TheoryLog,
  now: Date = new Date(),
): FaelligeKarte[] {
  const stand = cardStates(log)
  const schein = scheinwissenIds(log)

  const scheinwissen: FaelligeKarte[] = []
  const faellig: FaelligeKarte[] = []
  const neu: FaelligeKarte[] = []

  for (const card of cards) {
    const state = stand.get(card.id)
    if (!state) {
      neu.push({ card, state: null, retrievability: 0 })
    } else if (schein.has(card.id)) {
      scheinwissen.push({ card, state, retrievability: retrievability(state, now) })
    } else if (isDue(state, now)) {
      faellig.push({ card, state, retrievability: retrievability(state, now) })
    }
  }

  scheinwissen.sort((a, b) => a.retrievability - b.retrievability)
  faellig.sort((a, b) => a.retrievability - b.retrievability)
  return [...scheinwissen, ...faellig, ...neu]
}

/**
 * Die Auswahl für eine Portion in der Session.
 *
 * `technique` grundiert: passt eine fällige Karte zu dem, was gleich gespielt
 * wird, kommt sie zuerst. Ein Filter ist es nicht — wer nur zum Thema abfragt,
 * lässt den Rest verfallen.
 */
export function pickCards(
  cards: TheoryCard[],
  log: TheoryLog,
  anzahl: number,
  options: { now?: Date; technique?: string } = {},
): TheoryCard[] {
  const { now = new Date(), technique } = options
  const kandidaten = dueCards(cards, log, now)
  if (!technique) return kandidaten.slice(0, anzahl).map((eintrag) => eintrag.card)

  const passend = kandidaten.filter((eintrag) => eintrag.card.technique === technique)
  const rest = kandidaten.filter((eintrag) => eintrag.card.technique !== technique)
  return [...passend, ...rest].slice(0, anzahl).map((eintrag) => eintrag.card)
}

/**
 * Ab welcher Stabilität eine Karte als "sitzt" gilt: sie würde eine Woche
 * überstehen.
 *
 * Nicht über die Abrufbarkeit gemessen — die ist direkt nach dem Antworten
 * immer nahe 100 %, auch bei einer Karte, die man gerade nicht wusste. Eine
 * Anzeige, die nach fünf Reinfällen "sitzt: 5" meldet, misst nichts.
 */
export const SITZT_AB_TAGEN = 7

export interface TheorieStand {
  /** Karten, die schon mindestens einmal beantwortet wurden. */
  angefangen: number
  /** Davon solche, die eine Woche überstehen würden. */
  sitzen: number
  /** Wie viele heute dran wären. */
  faellig: number
  /** Anteil richtiger Antworten, über alles. Null ohne Antworten. */
  trefferquote: number | null
}

export function theorieStand(
  cards: TheoryCard[],
  log: TheoryLog,
  now: Date = new Date(),
): TheorieStand {
  const stand = cardStates(log)
  const bekannt = cards.filter((card) => stand.has(card.id))

  const sitzen = bekannt.filter(
    (card) => (stand.get(card.id)!.stability ?? 0) >= SITZT_AB_TAGEN,
  ).length
  const faellig = bekannt.filter((card) => isDue(stand.get(card.id)!, now)).length
  // Only knowledge cards: the fretboard trainer answers into the same log,
  // and a hundred quick taps on the E string would bury the hit rate.
  const karten = log.answers.filter((antwort) => !istHalsAntwort(antwort))
  const richtig = karten.filter((antwort) => antwort.correct).length

  return {
    angefangen: bekannt.length,
    sitzen,
    faellig,
    trefferquote: karten.length === 0 ? null : richtig / karten.length,
  }
}

/** Ab wie vielen Antworten einer Stufe die Trefferquote etwas sagt. */
export const KALIBRIERUNG_AB = 5

export type Kalibrierung = Record<Sicherheit, { n: number; richtig: number }>

/**
 * Wie oft die Selbsteinschätzung stimmte, je Stufe.
 *
 * Wer bei "sicher" in neun von zehn Fällen richtig liegt, kennt seinen Stand;
 * wer bei "sicher" nur die Hälfte trifft, überschätzt sich. Zählt nur Karten,
 * bei denen die Sicherheit abgefragt wurde — der Griffbrett-Trainer und ältere
 * Antworten haben keine, und der Trainer bleibt wie überall ausserhalb.
 */
export function kalibrierung(log: TheoryLog): Kalibrierung {
  const stand: Kalibrierung = {
    1: { n: 0, richtig: 0 },
    2: { n: 0, richtig: 0 },
    3: { n: 0, richtig: 0 },
  }
  for (const antwort of log.answers) {
    if (antwort.sure === undefined || istHalsAntwort(antwort)) continue
    stand[antwort.sure].n += 1
    if (antwort.correct) stand[antwort.sure].richtig += 1
  }
  return stand
}

/** Alle Antworten zu einer Karte, älteste zuerst. */
export function answersFor(log: TheoryLog, cardId: string): TheoryAnswer[] {
  return log.answers
    .filter((antwort) => antwort.cardId === cardId)
    .sort((a, b) => a.at.localeCompare(b.at))
}
