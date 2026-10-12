import { median } from "./timing"

/**
 * Measuring the signal chain's latency once, instead of guessing it per block.
 *
 * What sits between a click and the note the microphone hears is the whole
 * chain: the click leaving the speaker (output latency), the air, and the
 * microphone's buffer (input latency). That sum is exactly the constant part
 * of the offset a block measures. Two ways to get at it:
 *
 * - `lautsprecher`: the microphone listens to the clicks themselves. Pure
 *   machine, no player involved, so whatever offset a block shows on top of
 *   it is the player's own lead or lag.
 * - `anschlag`: for headphones, where the microphone cannot hear the click.
 *   The player strikes along; the result then also holds their habit of
 *   playing slightly early or late, and a block can only be read against it.
 *
 * `AudioContext.outputLatency` would give part of this for free, but Safari
 * does not expose it — on the Mac or the iPhone.
 */

export type Einmessart = "lautsprecher" | "anschlag"

/** Clicks per run. The first few only wake the chain up and are not counted. */
export const EINMESS_KLICKS = 16
export const EINMESS_VORLAUF = 2
/** Slow on purpose: a full click period of room for even Bluetooth latency. */
export const EINMESS_BPM = 80

/** Share of counted clicks that must have been heard. */
const MINDESTENS_GEHOERT = 0.7
/**
 * How unsteady the result may be. A speaker heard by its own microphone is a
 * machine and should agree with itself within a few milliseconds — anything
 * looser is room noise or echo being picked up instead. A player is not a
 * machine; this is roughly the spread of a careful strike.
 */
const HOECHSTE_STREUUNG_MS: Record<Einmessart, number> = { lautsprecher: 5, anschlag: 30 }
/** Search window around each click, in seconds. A player may come early. */
const FENSTER: Record<Einmessart, [number, number]> = {
  lautsprecher: [-0.005, 0.5],
  anschlag: [-0.15, 0.5],
}

export type Einmessergebnis =
  | { ok: true; ms: number; streuungMs: number; gehoert: number; gezaehlt: number }
  | { ok: false; grund: string }

/**
 * Turns clicks and what the microphone heard into one latency, or a reason
 * why not. Pure, so it can be checked without a browser.
 */
export function auswerten(klicks: number[], anschlaege: number[], art: Einmessart): Einmessergebnis {
  const gezaehlt = klicks.slice(EINMESS_VORLAUF)
  if (gezaehlt.length === 0) return { ok: false, grund: "Keine Klicks gespielt." }

  const [vor, nach] = FENSTER[art]
  const sortiert = [...anschlaege].sort((a, b) => a - b)
  const abstaende: number[] = []
  for (const klick of gezaehlt) {
    // The first thing heard in the window belongs to this click; whatever
    // follows is the click's own echo or ring.
    const erster = sortiert.find((t) => t >= klick + vor && t <= klick + nach)
    if (erster !== undefined) abstaende.push(erster - klick)
  }

  if (abstaende.length < gezaehlt.length * MINDESTENS_GEHOERT) {
    return {
      ok: false,
      grund:
        art === "lautsprecher"
          ? `Nur ${abstaende.length} von ${gezaehlt.length} Klicks gehört. Lauter stellen — oder mit Kopfhörern per Anschlag einmessen.`
          : `Nur ${abstaende.length} von ${gezaehlt.length} Anschlägen gehört. Kräftiger anschlagen, oder näher ans Mikrofon.`,
    }
  }

  const mitte = median(abstaende)
  const streuung = median(abstaende.map((a) => Math.abs(a - mitte)))
  const streuungMs = streuung * 1000

  if (streuungMs > HOECHSTE_STREUUNG_MS[art]) {
    return {
      ok: false,
      grund:
        art === "lautsprecher"
          ? `Zu unruhig (±${Math.round(streuungMs)} ms) — vermutlich Hall oder Geräusche im Raum. Leiser Raum, Gerät nicht in der Hand.`
          : `Zu unruhig (±${Math.round(streuungMs)} ms). Noch einmal, und ganz ruhig auf den Klick.`,
    }
  }
  if (art === "lautsprecher" && mitte < 0) {
    return { ok: false, grund: "Das Mikrofon hat etwas vor dem Klick gehört — es lauscht nicht dem Lautsprecher." }
  }

  return {
    ok: true,
    ms: Math.round(mitte * 1000),
    streuungMs: Math.round(streuungMs * 10) / 10,
    gehoert: abstaende.length,
    gezaehlt: gezaehlt.length,
  }
}
