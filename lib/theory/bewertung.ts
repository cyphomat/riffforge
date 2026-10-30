import type { Grade } from "./fsrs"
import type { Sicherheit } from "./types"

/**
 * Welche Note die App nach einer Frage vorschlägt, und wann sie sie
 * stattdessen erfragt.
 *
 * Richtig und mindestens ziemlich sicher heisst: „Gut", ein Tap. Die
 * Selbsteinschätzung steckt dann schon in der Sicherheit, die vor der
 * Auflösung kam; sie noch einmal in vier Stufen zu verlangen, kostete bei
 * vier Fragen je Session ein Drittel aller Taps. Falsch, geraten oder
 * ungemessen lässt dagegen mehrere Antworten zu — dort bleibt die Wahl.
 * FSRS rechnet weiter nur mit der Note (siehe `fsrs.ts`).
 */
export interface Bewertungsvorschlag {
  /** Die Note, die ein einzelner Tap vergibt. Null: nichts vorschlagen. */
  vorschlag: Grade | null
  /** Wahr, wenn alle vier Noten gleich bedeutend zur Wahl stehen. */
  volleWahl: boolean
}

export function bewertungsvorschlag(
  richtig: boolean,
  sure: Sicherheit | undefined,
  ungemessen: boolean,
): Bewertungsvorschlag {
  if (ungemessen) return { vorschlag: null, volleWahl: true }
  if (!richtig) return { vorschlag: 1, volleWahl: true }
  // Ohne Angabe (Auflösen mit Enter, gespielte Frage) und bei „Geraten" ist
  // ein Treffer kein Wissen: dort entscheidet der Spieler.
  if (sure === undefined || sure === 1) return { vorschlag: 3, volleWahl: true }
  return { vorschlag: 3, volleWahl: false }
}
