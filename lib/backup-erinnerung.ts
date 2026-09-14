/**
 * Wann es Zeit für eine Sicherung ist.
 *
 * Rein und ohne Browser, damit die Regel geprüft werden kann statt geraten.
 *
 * Die Frage ist heikler, als sie aussieht: eine Erinnerung, die zu früh oder
 * grundlos kommt, wird weggeklickt und danach nie wieder gelesen. Deshalb
 * zwei Bedingungen zugleich — es muss *etwas zu verlieren* geben, und es muss
 * *lange her* sein. Wer zwei Sessions gespielt hat, wird nicht behelligt.
 */

/** Ab so vielen ungesicherten Einträgen lohnt sich die Erinnerung. */
export const EINTRAEGE_MINDESTENS = 12

/** Und erst, wenn die letzte Sicherung so lange her ist. */
export const TAGE_MINDESTENS = 14

export interface ErinnerungsLage {
  /** Wie viele Einträge im Log stehen. */
  eintraege: number
  /** Wann zuletzt gesichert wurde — null heisst: noch nie. */
  gesichert: Date | null
  /** Der älteste Eintrag im Log; ohne Sicherung zählt ab hier die Zeit. */
  aeltester: Date | null
  now?: Date
}

/**
 * Soll erinnert werden?
 *
 * Ohne je gesicherte Datei zählt die Zeit ab dem ältesten Eintrag — sonst
 * bekäme jemand, der seit einem Jahr übt und nie exportiert hat, nie einen
 * Hinweis, weil „zuletzt gesichert" leer bleibt.
 */
export function sollErinnern(lage: ErinnerungsLage): boolean {
  if (lage.eintraege < EINTRAEGE_MINDESTENS) return false

  const now = lage.now ?? new Date()
  const seit = lage.gesichert ?? lage.aeltester
  if (!seit) return false

  const tage = (now.getTime() - seit.getTime()) / (24 * 3600 * 1000)
  return tage >= TAGE_MINDESTENS
}

/** Wie viele Tage her, gerundet — für den Text der Erinnerung. */
export function tageSeit(seit: Date, now: Date = new Date()): number {
  return Math.max(0, Math.floor((now.getTime() - seit.getTime()) / (24 * 3600 * 1000)))
}
