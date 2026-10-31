import { describe, expect, it } from "vitest"
import { tonhoehe, midiAus } from "@/lib/audio/tonhoehe"
import { gezupft, hertzAus } from "@/lib/audio/zupfen"
import { ANKER_TON, HOECHSTER_TON, saitenTon, TIEFSTER_TON } from "@/lib/theory/gehoer"

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

  it("trifft auch jede Leersaite auf den Cent — die tiefe E liegt unter dem Hörbereich der Intervalle", () => {
    for (const saite of [1, 2, 3, 4, 5, 6] as const) {
      const midi = saitenTon(saite)
      const gefunden = tonhoehe(mitte(gezupft(hertzAus(midi), RATE)), RATE)
      expect(gefunden, `Saite ${saite}`).not.toBeNull()
      expect(Math.abs(midiAus(gefunden!.hz) - midi) * 100, `Saite ${saite}`).toBeLessThan(2)
    }
  })

  it("trifft jeden Ton der Ankerkarten auf den Cent, von der tiefen E bis eine Oktave darüber", () => {
    const [anker, hoechster] = [ANKER_TON, ANKER_TON + 12]
    for (let midi = anker; midi <= hoechster; midi += 1) {
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

  describe("mit längerem Nachklang", () => {
    const pegel = (samples: Float32Array, bei: number) => {
      const von = Math.round(bei * RATE)
      return Math.sqrt(samples.slice(von, von + 2048).reduce((s, x) => s + x * x, 0) / 2048)
    }

    it("klingt länger, ohne die Tonhöhe zu verschieben", () => {
      for (const midi of [45, 57, 62, 64, 67]) {
        const lang = gezupft(hertzAus(midi), RATE, 5, 2.2)
        const gefunden = tonhoehe(mitte(lang), RATE)
        expect(gefunden, `MIDI ${midi}`).not.toBeNull()
        expect(Math.abs(midiAus(gefunden!.hz) - midi) * 100, `MIDI ${midi}`).toBeLessThan(2)
      }
    })

    it("ist nach einer Sekunde deutlich lauter als der kurze Ton", () => {
      const kurz = gezupft(hertzAus(57), RATE)
      const lang = gezupft(hertzAus(57), RATE, 5, 2.2)
      // Beide auf dieselbe Spitze gebracht, also zählt nur, wie viel übrig bleibt.
      expect(pegel(lang, 1)).toBeGreaterThan(3 * pegel(kurz, 1))
    })

    it("lässt den Ton der Hörfragen unberührt, wenn nichts angegeben ist", () => {
      expect(Array.from(gezupft(hertzAus(57), RATE, 1.4, 1))).toEqual(Array.from(gezupft(hertzAus(57), RATE)))
    })

    it("knackt weder vorn noch hinten", () => {
      const samples = gezupft(hertzAus(57), RATE, 5, 2.2)
      expect(Math.abs(samples[0])).toBeLessThan(0.01)
      expect(Math.abs(samples[samples.length - 1])).toBeLessThan(0.01)
    })
  })

  it("trifft A4 bei 440 Hz", () => {
    expect(hertzAus(69)).toBe(440)
    expect(hertzAus(57)).toBeCloseTo(220, 6)
  })
})
