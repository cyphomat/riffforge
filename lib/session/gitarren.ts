import { z } from "zod"
import type { SessionBlock } from "./types"

/**
 * Die Gitarrenroulette: welche Gitarre in die Hand kommt.
 *
 * Gewürfelt wird je Technik+Riff-Paar, nicht je Block. Das Riff ist dieselbe
 * Technik im musikalischen Kontext; mittendrin umzugreifen kostet nur Ruhe.
 * Die Gitarre der Runde bleibt also über das Riff stehen, und die nächste
 * Technik würfelt neu — nie dieselbe wie davor. Das Warm-up bekommt keine, es
 * ist zu kurz, um dafür die Gitarre zu wechseln.
 *
 * Das Ergebnis ist kein Übungsergebnis und kommt nicht in den Log: er ist
 * append-only und wird abgeglichen, ein Zufall hätte dort nichts zu suchen.
 */

export const MAX_GITARREN = 12

export const gitarreSchema = z.object({
  name: z.string().trim().min(1).max(24),
  /** Eine Siebensaitige — nur sie kommt im Sieben-Saiter-Modus in Frage. */
  sieben: z.boolean(),
})

export const gitarrenSchema = z.array(gitarreSchema).max(MAX_GITARREN)

export type Gitarre = z.infer<typeof gitarreSchema>

export const STANDARD_GITARREN: Gitarre[] = [
  { name: "Solar S-Type", sieben: false },
  { name: "EVH Wolfgang Floyd Rose", sieben: false },
  { name: "ESP Arrow V-Type", sieben: false },
  { name: "Solar H-Type 7 Saiter", sieben: true },
]

/** Hängt eine Gitarre an. Leere Namen, Doppelte (ohne Groß/Klein) und ein volles Rack bleiben draussen. */
export function gitarreDazu(liste: Gitarre[], name: string, sieben: boolean): Gitarre[] {
  const neu = gitarreSchema.safeParse({ name, sieben })
  if (!neu.success || liste.length >= MAX_GITARREN) return liste
  const schluessel = neu.data.name.toLowerCase()
  if (liste.some((gitarre) => gitarre.name.toLowerCase() === schluessel)) return liste
  return [...liste, neu.data]
}

export function gitarreWeg(liste: Gitarre[], name: string): Gitarre[] {
  return liste.filter((gitarre) => gitarre.name !== name)
}

/** Eine Gitarre je Block, in Blockreihenfolge; `null` heisst: hier wird nichts gezeigt. */
export type Zuweisung = (string | null)[]

function ziehe(pool: string[], nicht: string | null, random: () => number): string {
  const kandidaten = pool.filter((name) => name !== nicht)
  const aus = kandidaten.length > 0 ? kandidaten : pool
  return aus[Math.min(Math.floor(random() * aus.length), aus.length - 1)]
}

/**
 * Verteilt die Gitarren auf die Blöcke.
 *
 * `bisher` bleibt stehen: „+5 Minuten" hängt Blöcke an, und die schon
 * gezeigten dürfen dabei nicht neu gewürfelt werden. Gerechnet wird nur ab
 * dem ersten Block ohne Eintrag.
 *
 * Mit weniger als zwei Gitarren zur Auswahl gibt es nichts zu würfeln — dann
 * bleibt überall `null` und die App zeigt keine Karte.
 */
export function zuweisen(
  bisher: Zuweisung,
  blocks: SessionBlock[],
  liste: Gitarre[],
  random: () => number,
  optionen: { nurSieben?: boolean } = {},
): Zuweisung {
  const pool = (optionen.nurSieben ? liste.filter((gitarre) => gitarre.sieben) : liste).map(
    (gitarre) => gitarre.name,
  )
  const ergebnis = bisher.slice(0, blocks.length)
  let aktuell = [...ergebnis].reverse().find((name) => name !== null) ?? null

  for (let i = ergebnis.length; i < blocks.length; i++) {
    const art = blocks[i].drill.kind
    if (pool.length < 2 || art === "warmup") {
      ergebnis.push(null)
      continue
    }
    // Neu gewürfelt wird an jeder Technik — und wo noch keine in der Hand ist.
    if (art === "technique" || aktuell === null) aktuell = ziehe(pool, aktuell, random)
    ergebnis.push(aktuell)
  }
  return ergebnis
}
