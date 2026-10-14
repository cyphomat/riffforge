import { isDue, newCard, review, retrievability, type CardState } from "./fsrs"
import { istHalsAntwort } from "./hals-id"
import type { TheoryAnswer, TheoryCard, TheoryLog } from "./types"

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
 * Was heute drankommt, schwächste zuerst.
 *
 * Eine neue Karte hat keine Abrufbarkeit — sie zählt als 0 und steht damit
 * ganz vorn, aber erst nachdem alles Fällige durch ist: Behalten geht vor
 * Neuanfangen, sonst wächst der Rückstand, während man Neues sammelt.
 */
export function dueCards(
  cards: TheoryCard[],
  log: TheoryLog,
  now: Date = new Date(),
): FaelligeKarte[] {
  const stand = cardStates(log)

  const faellig: FaelligeKarte[] = []
  const neu: FaelligeKarte[] = []

  for (const card of cards) {
    const state = stand.get(card.id)
    if (!state) {
      neu.push({ card, state: null, retrievability: 0 })
    } else if (isDue(state, now)) {
      faellig.push({ card, state, retrievability: retrievability(state, now) })
    }
  }

  faellig.sort((a, b) => a.retrievability - b.retrievability)
  return [...faellig, ...neu]
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

/** Alle Antworten zu einer Karte, älteste zuerst. */
export function answersFor(log: TheoryLog, cardId: string): TheoryAnswer[] {
  return log.answers
    .filter((antwort) => antwort.cardId === cardId)
    .sort((a, b) => a.at.localeCompare(b.at))
}
