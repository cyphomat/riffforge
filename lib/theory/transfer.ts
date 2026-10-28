import { dueCards, cardStates } from "./progress"
import type { Stufe, TheoryCard, TheoryLog } from "./types"

/**
 * Die Transfer-Runde: Szenarien quer durch alle Stufen.
 *
 * Anwenden setzt Gelerntes voraus. Eine Stufe kommt deshalb erst dran, wenn
 * dort mindestens so viele Wissenskarten begonnen sind — sonst bekäme ein
 * Neuling sechs Fragen zu Stoff, den er nie gesehen hat, und hielte das für
 * seinen Fehler.
 */
export const TRANSFER_AB = 3

/** Mischen mit einsetzbarem Zufall, damit der Test fest bleibt. */
function mischen<T>(liste: T[], rng: () => number): T[] {
  const kopie = [...liste]
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[kopie[i], kopie[j]] = [kopie[j], kopie[i]]
  }
  return kopie
}

/**
 * Eine Szenario-Frage je Stufe, durchgemischt.
 *
 * Innerhalb einer Stufe gilt dieselbe Reihenfolge wie überall (`dueCards`):
 * Scheinwissen zuerst, dann das, was am schlechtesten sitzt, dann Neues. Die
 * Mischung danach verhindert, dass die Stufe an der Reihenfolge abzulesen ist
 * — der Sinn der Runde ist, dass kein Themenname die Antwort vorwegnimmt.
 *
 * `karten` sind die Wissenskarten, nach denen "begonnen" gezählt wird; der
 * Griffbrett-Trainer zählt nicht mit, seine Kennungen stehen in keiner dieser
 * Karten.
 */
export function transferRunde(
  szenarien: TheoryCard[],
  karten: TheoryCard[],
  log: TheoryLog,
  now: Date = new Date(),
  rng: () => number = Math.random,
): TheoryCard[] {
  const stand = cardStates(log)
  const begonnen = new Map<Stufe, number>()
  for (const karte of karten) {
    if (stand.has(karte.id)) begonnen.set(karte.stufe, (begonnen.get(karte.stufe) ?? 0) + 1)
  }

  const erste = new Map<Stufe, TheoryCard>()
  for (const { card } of dueCards(szenarien, log, now)) {
    if ((begonnen.get(card.stufe) ?? 0) < TRANSFER_AB) continue
    if (!erste.has(card.stufe)) erste.set(card.stufe, card)
  }
  return mischen([...erste.values()], rng)
}
