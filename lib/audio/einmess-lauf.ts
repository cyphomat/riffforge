import type { AudioEngine } from "./audio-engine"
import { auswerten, EINMESS_BPM, EINMESS_KLICKS, type Einmessart, type Einmessergebnis } from "./einmessen"
import { Metronome } from "./metronome"
import { OnsetDetector } from "./onset-detector"

const warte = (ms: number) => new Promise((fertig) => setTimeout(fertig, ms))

/**
 * One calibration run: clicks out, onsets in, both on the one shared clock.
 *
 * Must start from a user gesture — it creates or resumes the AudioContext and
 * asks for the microphone. The evaluation itself lives in `einmessen.ts`,
 * where it can be tested without a browser; this only does the plumbing.
 */
export async function einmessen(
  engine: AudioEngine,
  art: Einmessart,
  onFortschritt?: (klick: number, gesamt: number) => void,
): Promise<Einmessergebnis> {
  const anschlaege: number[] = []
  let mikrofonGrund: string | undefined
  const detector = new OnsetDetector(engine, {
    onOnset: (time) => anschlaege.push(time),
    onStatus: (_status, grund) => {
      if (grund) mikrofonGrund = grund
    },
  })

  if (!(await detector.start())) {
    return { ok: false, grund: mikrofonGrund ?? "Kein Zugriff aufs Mikrofon." }
  }

  const klicks: number[] = []
  const metronome = new Metronome(engine, {
    bpm: EINMESS_BPM,
    // Speaker mode needs the microphone to hear the click across the room;
    // with headphones on, the player only needs to hear it.
    lautstaerke: art === "lautsprecher" ? 3 : 1,
    onTick: (tick) => {
      klicks.push(tick.time)
      onFortschritt?.(klicks.length, EINMESS_KLICKS)
    },
  })

  try {
    // Let the microphone settle before the first click; its first buffers
    // are often silence or a pop.
    await warte(300)
    await metronome.start()
    while (klicks.length < EINMESS_KLICKS) await warte(50)
    metronome.stop()
    // The last click needs its own window to be heard in.
    await warte(600)
  } finally {
    metronome.dispose()
    detector.stop()
  }

  return auswerten(klicks.slice(0, EINMESS_KLICKS), anschlaege, art)
}
