import { ALLE_DRILLS_BY_ID } from "./drills"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import type { Drop } from "./drops"
import { hash } from "./gurt"
import type { DrillResult, PracticeLog } from "./types"

/**
 * Der Roadie kommentiert die Übung — leise, ein Satz, ohne Animation.
 *
 * Er steht nur auf *Heute* und auf dem Abschluss-Zettel, nie in der Session.
 * Welcher Satz, entscheidet der Tag (`hash`), nicht der Zufall: wer die Seite
 * zweimal öffnet, liest denselben Satz.
 */

export const GRUND_SPRUECHE = [
  "Kabel liegt, Amp ist warm. Du bist dran.",
  "Fünfzehn Minuten reichen. Mehr verlangt hier keiner.",
  "Erst stimmen, dann das Riff. Die Reihenfolge zählt.",
  "Ich trage die Kisten. Das Spielen bleibt bei dir.",
  "Langsam und sauber schlägt schnell und schlampig.",
  "Soundcheck ist kein Zeitverlust.",
]

const drillFuer = (id: string) => ALLE_DRILLS_BY_ID[id] ?? SIEBEN_DRILLS_BY_ID[id]

function pool(drops: Drop[]): string[] {
  return [...GRUND_SPRUECHE, ...drops.flatMap((d) => d.sprueche)]
}

function waehle(liste: string[], schluessel: string): string {
  return liste[hash(schluessel) % liste.length]
}

/** Der Satz zum Ende einer Session: mal zum Riff selbst, mal ein allgemeiner. */
export function uebungsSpruch(results: DrillResult[], tag: string, drops: Drop[]): string {
  const bekannt = results.filter((r) => drillFuer(r.drillId))
  const fokus = bekannt.find((r) => drillFuer(r.drillId).kind === "riff") ?? bekannt.at(-1)
  const allgemein = waehle(pool(drops), `abschluss-${tag}`)
  if (!fokus || hash(`art-${tag}`) % 2 === 0) return allgemein
  const drill = drillFuer(fokus.drillId)
  if (fokus.rating <= 2) return `${drill.title} war zäh. Das liegt morgen wieder auf dem Pult.`
  if (fokus.bpm >= drill.targetBpm) return `${drill.title} auf ${fokus.bpm} BPM — Zieltempo. Das schreib ich mir auf.`
  return `${drill.title} sitzt bei ${fokus.bpm} BPM. Kabel aufgewickelt, Feierabend.`
}

/** Der Satz auf *Heute*: auch das letzte Riff aus dem Log kann drankommen. */
export function heuteSpruch(log: PracticeLog, tag: string, drops: Drop[]): string {
  const letztes = [...log.results]
    .filter((r) => drillFuer(r.drillId)?.kind === "riff" && !Number.isNaN(Date.parse(r.at)))
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1)
  const liste = pool(drops)
  if (letztes) liste.push(`Zuletzt hier: ${drillFuer(letztes.drillId).title} bei ${letztes.bpm} BPM.`)
  return waehle(liste, `heute-${tag}`)
}
