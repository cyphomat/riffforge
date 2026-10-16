"use client"

import { z } from "zod"
import { BOX_STANDARD, GRUNDTOENE, LAGEN, type LickBox } from "@/lib/session/lead"

/**
 * Was die App über sich selbst weiss, nicht über das Üben.
 *
 * Zwei Kleinigkeiten, die kein Log sind und deshalb auch nicht verschmolzen
 * werden: wann zuletzt gesichert wurde, und ob der Willkommens-Schirm schon
 * gelaufen ist. Beides gehört diesem Gerät und nur diesem — ein Abgleich
 * müsste sich sonst einigen, wessen Sicherung „die letzte" ist, und das ist
 * keine Frage mit einer richtigen Antwort.
 *
 * Wie überall gilt: der Löschen-Weg muss beides wieder loswerden. `clearLokal`
 * steht deshalb in derselben Liste wie `clearLog` und `clearProfile`.
 */

const GESICHERT_KEY = "mga.zuletzt-gesichert.v1"
const WILLKOMMEN_KEY = "mga.willkommen.v1"
const LICK_KEY = "mga.lick-seed.v1"
const BOX_KEY = "mga.lick-box.v1"
const EINMESS_KEY = "mga.einmessung.v1"
const SAITEN_KEY = "mga.saiten.v1"

/** Alle Schlüssel dieses Moduls. `clearLokal` muss jeden erwischen. */
const OWN_KEYS = [GESICHERT_KEY, WILLKOMMEN_KEY, LICK_KEY, BOX_KEY, EINMESS_KEY, SAITEN_KEY]

function lesen(key: string): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Privater Modus oder volle Ablage: kein Grund, die App anzuhalten.
    return null
  }
}

function schreiben(key: string, wert: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, wert)
  } catch {
    /* Nicht schlimm — die Erinnerung kommt dann eben wieder. */
  }
}

/** Wann zuletzt eine Sicherungsdatei heruntergeladen wurde. */
export function zuletztGesichert(): Date | null {
  const roh = lesen(GESICHERT_KEY)
  if (!roh) return null
  const zeit = Date.parse(roh)
  return Number.isNaN(zeit) ? null : new Date(zeit)
}

export function merkeSicherung(now: Date = new Date()): void {
  schreiben(GESICHERT_KEY, now.toISOString())
}

/** Hat dieses Gerät den Willkommens-Schirm schon gesehen? */
export function willkommenGesehen(): boolean {
  return lesen(WILLKOMMEN_KEY) !== null
}

export function merkeWillkommen(): void {
  schreiben(WILLKOMMEN_KEY, new Date().toISOString())
}

/**
 * Welches Lick gerade dran ist.
 *
 * Gehört diesem Gerät: es ist kein Übungsergebnis, sondern ein Lesezeichen.
 * Ein Abgleich müsste sich sonst einigen, welches Lick „das aktuelle" ist,
 * und das ist keine Frage mit einer richtigen Antwort.
 */
export function lickSeed(): number {
  const roh = lesen(LICK_KEY)
  const zahl = roh === null ? NaN : Number(roh)
  return Number.isFinite(zahl) && zahl > 0 ? zahl : 1
}

export function merkeLickSeed(seed: number): void {
  schreiben(LICK_KEY, `${seed}`)
}

/**
 * In welcher Box die Licks gebaut werden: Grundton und Lage.
 *
 * Auch das ist ein Lesezeichen und kein Übungsergebnis — es gehört diesem
 * Gerät. Wer auf dem Handy an Lage 2 arbeitet und am Rechner an Lage 4, will
 * keinen Abgleich, der sich für eine entscheidet.
 *
 * Geprüft wird gegen die Aufzählungen, nicht nur auf den Typ: aus einem
 * `lage: 9` käme sonst eine leere Box und daraus ein Lick ohne Töne. Was
 * nicht passt, fällt auf den Standard zurück — hier ist Wegwerfen richtig,
 * anders als beim Log, wo ein kaputter Stand beiseitegelegt wird.
 */
export function lickBox(): LickBox {
  const roh = lesen(BOX_KEY)
  if (!roh) return BOX_STANDARD
  try {
    const wert = JSON.parse(roh) as Partial<LickBox>
    const grundton = GRUNDTOENE.find((ton) => ton === wert.grundton)
    const lage = LAGEN.find((l) => l === wert.lage)
    if (!grundton || !lage) return BOX_STANDARD
    return { grundton, lage }
  } catch {
    return BOX_STANDARD
  }
}

export function merkeLickBox(box: LickBox): void {
  schreiben(BOX_KEY, JSON.stringify(box))
}


/**
 * Wann die Saiten zuletzt neu aufgezogen wurden, als `YYYY-MM-DD`.
 *
 * Gehört dem Gerät, nicht dem Log: ein Wartungsdatum ist keine Übung, und im
 * Log würde es als Gig gezählt. Die Übungstage seither kommen trotzdem aus dem
 * Log — `lib/session/saiten.ts` rechnet beides zusammen.
 */
const saitenSchema = z.object({ gewechselt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) })

export function saitenGewechselt(): string | null {
  const roh = lesen(SAITEN_KEY)
  if (!roh) return null
  try {
    const geprueft = saitenSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data.gewechselt : null
  } catch {
    return null
  }
}

export function merkeSaitenwechsel(tag: string): void {
  schreiben(SAITEN_KEY, JSON.stringify({ gewechselt: tag }))
}

/**
 * Die eingemessene Latenz dieses Geräts.
 *
 * Gehört diesem Gerät und nur diesem — sie *ist* das Gerät: Lautsprecher,
 * Mikrofon, Puffer. Ein Abgleich, der die Latenz vom Rechner aufs iPhone
 * trüge, machte die Messung dort falsch statt besser. Deshalb weder im
 * Datenrepo noch in der Sicherungsdatei.
 *
 * Kaputtes wird hier verworfen, nicht beiseitegelegt: eine Einmessung ist in
 * zwanzig Sekunden neu gemacht, und eine falsche wäre schlimmer als keine.
 */
export const einmessungSchema = z.object({
  ms: z.number().int().min(-200).max(600),
  art: z.enum(["lautsprecher", "anschlag"]),
  streuungMs: z.number().min(0),
  at: z.string(),
})

export type Einmessung = z.infer<typeof einmessungSchema>

export function einmessung(): Einmessung | null {
  const roh = lesen(EINMESS_KEY)
  if (!roh) return null
  try {
    const geprueft = einmessungSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : null
  } catch {
    return null
  }
}

export function merkeEinmessung(wert: Einmessung): void {
  schreiben(EINMESS_KEY, JSON.stringify(einmessungSchema.parse(wert)))
}

export function vergissEinmessung(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(EINMESS_KEY)
  } catch {
    /* Nichts zu vergessen. */
  }
}

export function clearLokal(): void {
  if (typeof window === "undefined") return
  try {
    for (const key of OWN_KEYS) window.localStorage.removeItem(key)
  } catch {
    /* Nichts Lesbares zu löschen. */
  }
}
