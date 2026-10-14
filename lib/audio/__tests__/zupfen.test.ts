import { describe, expect, it } from "vitest"
import { tonhoehe, midiAus } from "@/lib/audio/tonhoehe"
import { gezupft, hertzAus } from "@/lib/audio/zupfen"
import { HOECHSTER_TON, TIEFSTER_TON } from "@/lib/theory/gehoer"

const RATE = 48000

/** A window from the middle of the note — the attack is not where pitch is judged. */
function mitte(samples: Float32Array): Float32Array {
  const von = Math.round(0.15 * RATE)
  return samples.slice(von, von + 4096)
}

describe("Der gezupfte Ton", () => {
  it("klingt über den ganzen Hörbereich auf den Cent dort, wo er soll", () => {
    // Gemessen mit demselben YIN wie das Stimmgerät. Zwei Töne, die ein paar
    // Cent danebenliegen, wären eine andere Frage als die auf der Karte.
    for (let midi = TIEFSTER_TON; midi <= HOECHSTER_TON; midi += 1) {
      const gefunden = tonhoehe(mitte(gezupft(hertzAus(midi), RATE)), RATE)
      expect(gefunden, `MIDI ${midi}`).not.toBeNull()
      expect(Math.abs(midiAus(gefunden!.hz) - midi) * 100, `MIDI ${midi}`).toBeLessThan(2)
    }
  })

  it("bleibt unter Vollaussteuerung und knackt weder vorn noch hinten", () => {
    const samples = gezupft(hertzAus(57), RATE)
    const spitze = Math.max(...Array.from(samples, Math.abs))
    expect(spitze).toBeLessThanOrEqual(0.8 + 1e-6)
    expect(spitze).toBeGreaterThan(0.7)
    expect(Math.abs(samples[0])).toBeLessThan(0.01)
    expect(Math.abs(samples[samples.length - 1])).toBeLessThan(0.01)
  })

  it("klingt aus — die Mitte ist leiser als der Anfang", () => {
    const samples = gezupft(hertzAus(57), RATE)
    const pegel = (von: number) => Math.sqrt(samples.slice(von, von + 2048).reduce((s, x) => s + x * x, 0) / 2048)
    expect(pegel(Math.round(0.9 * RATE))).toBeLessThan(pegel(Math.round(0.02 * RATE)) / 3)
  })

  it("trifft A4 bei 440 Hz", () => {
    expect(hertzAus(69)).toBe(440)
    expect(hertzAus(57)).toBeCloseTo(220, 6)
  })
})
