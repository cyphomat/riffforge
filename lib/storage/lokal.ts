"use client"

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

/** Alle Schlüssel dieses Moduls. `clearLokal` muss jeden erwischen. */
const OWN_KEYS = [GESICHERT_KEY, WILLKOMMEN_KEY, LICK_KEY]

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

export function clearLokal(): void {
  if (typeof window === "undefined") return
  try {
    for (const key of OWN_KEYS) window.localStorage.removeItem(key)
  } catch {
    /* Nichts Lesbares zu löschen. */
  }
}
