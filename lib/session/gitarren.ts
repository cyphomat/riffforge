import { z } from "zod"

/**
 * Die Gitarrenroulette: welche Gitarre in die Hand kommt.
 *
 * Gewürfelt wird einmal je Durchgang, beim Start. Die Gitarre bleibt dann bis
 * zum Ende in der Hand, auch beim Verlängern: zwischen den Übungen umzugreifen
 * kostet nur Ruhe.
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

/**
 * Würfelt die Gitarre des Durchgangs.
 *
 * Mit weniger als zwei Gitarren zur Auswahl gibt es nichts zu würfeln — dann
 * `null`, und die App zeigt nichts.
 *
 * `nicht`: der Start-Schirm würfelt auf Wunsch neu, und es soll dann eine
 * andere sein als die eben gezeigte.
 */
export function wuerfle(
  liste: Gitarre[],
  random: () => number,
  optionen: { nurSieben?: boolean; nicht?: string } = {},
): string | null {
  const pool = (optionen.nurSieben ? liste.filter((gitarre) => gitarre.sieben) : liste).map(
    (gitarre) => gitarre.name,
  )
  if (pool.length < 2) return null
  const kandidaten = pool.filter((name) => name !== optionen.nicht)
  return kandidaten[Math.min(Math.floor(random() * kandidaten.length), kandidaten.length - 1)]
}
