import { ALLE_DRILLS_BY_ID } from "./drills"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import { DROPS } from "./drops-daten"
import { gurtRiffs } from "./gurt"
import { dayKey, practiceDays, weekKey } from "./progress"
import { QUESTS, type Quest, type QuestTyp } from "./quests-daten"
import { gefalleneWochen } from "./wochengegner"
import { startBesitz, type Besitz } from "./board"
import type { PracticeLog } from "./types"
import type { TheoryLog } from "@/lib/theory/types"

/**
 * Die Quests als Rechnung aus beiden Logs. Nichts wird gespeichert: ein
 * Fortschritt, der nur wächst, ist aus dem Log jederzeit neu zu zählen, und
 * ein erfülltes Ziel kann nicht verloren gehen.
 */

export const ALLE_QUESTS: Quest[] = [...QUESTS, ...DROPS.flatMap((d) => d.quests ?? [])]

const SAUBER = 3
const drillFuer = (id: string) => ALLE_DRILLS_BY_ID[id] ?? SIEBEN_DRILLS_BY_ID[id]

/** Wie weit ein Ziel dieser Art ist — eine Zahl, die nur wächst. */
export function fortschritt(typ: QuestTyp, log: PracticeLog, theorie: TheoryLog, jetzt: Date): number {
  switch (typ) {
    case "uebungstage":
      return practiceDays(log).length
    case "wochen":
      return new Set(log.results.map((r) => weekKey(new Date(r.at)))).size
    case "saubere_bloecke":
      return log.results.filter((r) => r.rating >= SAUBER).length
    case "ziel_riffe":
      return new Set(
        log.results
          .filter((r) => {
            const d = drillFuer(r.drillId)
            return d?.kind === "riff" && r.rating >= SAUBER && r.bpm >= d.targetBpm
          })
          .map((r) => r.drillId),
      ).size
    case "wissen_richtig":
      return theorie.answers.filter((a) => a.correct).length
    case "gegner_wochen":
      return gefalleneWochen(log, theorie)
    case "plektren":
      return gurtRiffs(log, dayKey(jetzt)).filter((s) => s.verdient).length
  }
}

export interface QuestStand {
  quest: Quest
  stand: number
  ziel: number
  erfuellt: boolean
}

export function questStand(
  log: PracticeLog,
  theorie: TheoryLog,
  jetzt: Date = new Date(),
  quests: Quest[] = ALLE_QUESTS,
): QuestStand[] {
  const gerechnet = new Map<QuestTyp, number>()
  return quests.map((quest) => {
    const typ = quest.regel.typ
    if (!gerechnet.has(typ)) gerechnet.set(typ, fortschritt(typ, log, theorie, jetzt))
    const stand = gerechnet.get(typ)!
    return { quest, stand: Math.min(stand, quest.regel.n), ziel: quest.regel.n, erfuellt: stand >= quest.regel.n }
  })
}

/**
 * Offene Quests zuerst, die nächste am Ziel vorn; geschaffte danach in der
 * Reihenfolge der Liste. Wer die Liste öffnet, sieht oben, was als Nächstes
 * fällt, nicht, was zufällig zuerst im Katalog stand.
 */
export function questGeordnet(staende: QuestStand[]): { offen: QuestStand[]; geschafft: QuestStand[] } {
  const anteil = (q: QuestStand) => q.stand / q.ziel
  const offen = staende
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => !q.erfuellt)
    .sort((a, b) => anteil(b.q) - anteil(a.q) || a.i - b.i)
    .map(({ q }) => q)
  return { offen, geschafft: staende.filter((q) => q.erfuellt) }
}

/**
 * Wie viele von `felder` Feldern des Fortschrittsbalkens leuchten. Voll nur,
 * wenn das Ziel erreicht ist (99 % sind 9 von 10, nicht 10), und leer nur bei
 * null: wer angefangen hat, sieht mindestens ein Feld.
 */
export function balkenFelder(stand: number, ziel: number, felder = 10): number {
  if (stand <= 0) return 0
  if (stand >= ziel) return felder
  return Math.min(felder - 1, Math.max(1, Math.floor((stand / ziel) * felder)))
}

/** Was jemand besitzt: der Anfang und der Lohn jeder erfüllten Quest. */
export function besitz(log: PracticeLog, theorie: TheoryLog, jetzt: Date = new Date()): Besitz {
  const b = startBesitz()
  for (const s of questStand(log, theorie, jetzt)) {
    if (!s.erfuellt) continue
    ;(s.quest.lohn.art === "pedal" ? b.pedale : b.amps).add(s.quest.lohn.id)
  }
  return b
}
