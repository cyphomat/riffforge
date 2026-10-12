import { describe, expect, it } from "vitest"
import { geglaettet, IM_TON_CENT, MINDEST_SICHERHEIT, naechsteSaite, notenname, saitenVon } from "../stimmen"
import { midiAus, tonhoehe } from "../tonhoehe"

/**
 * Tonhöhe, gemessen statt angenommen.
 *
 * Synthetische gezupfte Saiten: Obertöne mit Zupfposition, hohe Anteile
 * klingen schneller ab, ein kurzes Anschlagrauschen, auf den tiefen Saiten
 * ein schwacher Grundton wie bei einem Tonabnehmer, dazu etwas Rauschen und
 * auf Wunsch Verzerrung als Sättigungskurve. Das ist nicht die Wirklichkeit —
 * aber es ist der Fall, an dem YIN zuerst scheitern würde, und der Fall, an
 * dem es tatsächlich scheitert, steht unten.
 */
const FS = 48000

/**
 * Mulberry32. Bewusst kein `(s * 1103515245 + 12345) % 2 ** 31`: das
 * überschreitet die Genauigkeit einer JavaScript-Zahl, wiederholt sich nach
 * 220 Werten — und eine Folge mit Periode 220 *ist* ein Ton von 218 Hz. Der
 * erste Lauf dieses Tests hielt YIN deshalb für leichtgläubig, dabei hatte
 * es recht.
 */
function zufallsquelle(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1
  }
}

function zupfen(
  midi: number,
  ms: number,
  { verzerrung = 0, seed = 1, cent = 0, vorher = null as number | null, vorherPegel = 0.7 } = {},
) {
  const f = 440 * 2 ** ((midi - 69 + cent / 100) / 12)
  const n = Math.round((FS * ms) / 1000)
  const x = new Float32Array(n)
  const zufall = zufallsquelle(seed)
  const p = 0.13 + 0.05 * ((seed % 5) / 5)
  const teiltoene = (grund: number, pegel: number, t0: number, schwach: boolean) => {
    for (let k = 1; k * grund < FS / 2.2 && k <= 30; k += 1) {
      let a = (pegel * Math.abs(Math.sin(Math.PI * k * p))) / k
      if (k === 1 && schwach) a *= 0.25
      const fk = k * grund * Math.sqrt(1 + 0.00005 * k * k)
      const phase = zufall() * Math.PI
      for (let i = 0; i < n; i += 1) {
        const t = i / FS + t0
        x[i] += a * Math.exp(-(1.5 + 0.8 * k) * t) * Math.sin(2 * Math.PI * fk * t + phase)
      }
    }
  }
  teiltoene(f, 1, 0, midi < 52)
  if (vorher !== null) teiltoene(440 * 2 ** ((vorher - 69) / 12), vorherPegel, 0.3, false)
  for (let i = 0; i < FS * 0.008; i += 1) x[i] += zufall() * 0.3 * (1 - i / (FS * 0.008))
  let max = 0
  for (const v of x) max = Math.max(max, Math.abs(v))
  for (let i = 0; i < n; i += 1) {
    let v = (x[i] / max) * 0.5
    if (verzerrung > 0) v = Math.tanh(verzerrung * v) / Math.tanh(verzerrung * 0.5)
    x[i] = v * 0.5 + zufall() * 0.005
  }
  return { x, f }
}

const fenster = (x: Float32Array, abMs: number) => x.subarray(Math.round((FS * abMs) / 1000), Math.round((FS * abMs) / 1000) + 2048)

describe("Tonhöhe eines Einzeltons", () => {
  it("trifft jeden Halbton von B1 bis E6, sauber wie mit High-Gain", () => {
    for (const verzerrung of [0, 40]) {
      for (let midi = 35; midi <= 88; midi += 1) {
        const { x, f } = zupfen(midi, 200, { verzerrung, seed: midi })
        const r = tonhoehe(fenster(x, 30), FS)
        expect(r, `MIDI ${midi}, Verzerrung ${verzerrung}`).not.toBeNull()
        expect(Math.abs(Math.round(midiAus(r!.hz) - midiAus(f))), `MIDI ${midi}, Verzerrung ${verzerrung}`).toBe(0)
      }
    }
  })

  it("ist genau genug für ein Stimmgerät", () => {
    // Offene Saiten von B1 bis e4, verstimmt bis ±20 Cent, 200 ms nach dem
    // Anschlag — so, wie man beim Stimmen eine Saite klingen lässt.
    for (const saite of saitenVon("sieben")) {
      for (const cent of [-20, -7, 0, 9, 20]) {
        const { x, f } = zupfen(saite.midi, 450, { cent, seed: saite.midi + cent + 50 })
        const r = tonhoehe(fenster(x, 200), FS)!
        const fehler = Math.abs((midiAus(r.hz) - midiAus(f)) * 100)
        expect(fehler, `${saite.name} ${cent} Cent`).toBeLessThan(IM_TON_CENT)
        expect(r.sicherheit).toBeGreaterThan(MINDEST_SICHERHEIT)
      }
    }
  })

  it("schweigt bei Stille", () => {
    expect(tonhoehe(new Float32Array(2048), FS)).toBeNull()
  })

  it("ist sich bei Rauschen nicht sicher", () => {
    const zufall = zufallsquelle(9)
    const rauschen = Float32Array.from({ length: 2048 }, () => zufall() * 0.1)
    const r = tonhoehe(rauschen, FS)
    expect(r === null || r.sicherheit < MINDEST_SICHERHEIT).toBe(true)
  })

  it("braucht zwei Perioden des tiefsten Tons", () => {
    expect(tonhoehe(new Float32Array(1000).fill(0.1), FS)).toBeNull()
  })
})

/**
 * Warum es keine Tonprüfung im Lick gibt.
 *
 * Klingt der vorige Ton nach — in einem Lick der Normalfall —, gehen zwei Töne
 * zusammen durch die Verzerrung. Liegt der vorige eine Quarte höher, haben
 * beide eine gemeinsame, tiefere Periode, und genau die findet YIN: eine
 * Oktave oder eine Duodezime zu tief. Gemessen vor dem Bau über 450 Fälle:
 * sauber 98 %, Crunch 97 %, High-Gain 70 % (beim Tonnamen 75 %). Eine App, die
 * bei jedem dritten verzerrten Lick-Ton „falscher Ton" sagt, lügt — also sagt
 * sie dazu nichts. Wird dieser Test einmal rot, weil die Erkennung besser
 * geworden ist, ist die Entscheidung neu zu treffen.
 */
describe("Die Grenze: zwei Töne durch High-Gain", () => {
  it("trifft mit lautem Nachklang deutlich zu selten für eine Bewertung", () => {
    let richtig = 0
    let n = 0
    for (let midi = 40; midi <= 76; midi += 2) {
      for (const schritt of [2, 3, 5]) {
        n += 1
        const { x, f } = zupfen(midi, 200, { verzerrung: 40, seed: midi + schritt, vorher: midi + schritt })
        const r = tonhoehe(fenster(x, 30), FS)
        if (r && Math.round(midiAus(r.hz) - midiAus(f)) === 0) richtig += 1
      }
    }
    expect(richtig / n).toBeLessThan(0.9)
  })

  it("trennt dagegen sauber gespielt", () => {
    let richtig = 0
    let n = 0
    for (let midi = 40; midi <= 76; midi += 2) {
      for (const schritt of [2, 3, 5]) {
        n += 1
        const { x, f } = zupfen(midi, 200, { seed: midi + schritt, vorher: midi + schritt, vorherPegel: 0.3 })
        const r = tonhoehe(fenster(x, 30), FS)
        if (r && Math.round(midiAus(r.hz) - midiAus(f)) === 0) richtig += 1
      }
    }
    expect(richtig / n).toBe(1)
  })
})

describe("Das Stimmgerät", () => {
  it("rechnet die Saiten aus denselben Tabellen wie die Übungen", () => {
    expect(saitenVon("sechs").map((s) => s.name)).toEqual(["E4", "B3", "G3", "D3", "A2", "E2"])
    expect(saitenVon("sieben").at(-1)).toEqual({ nummer: 7, midi: 35, name: "B1" })
  })

  it("ordnet nach Cent zu, nicht nach Hertz", () => {
    // 70 Hz liegt in Hertz näher am B1 (61,7) als am E2 (82,4) — in Cent auch.
    expect(naechsteSaite(70, "sieben").saite.name).toBe("B1")
    // Ohne siebte Saite ist es das tiefe E, zu tief gestimmt.
    const a = naechsteSaite(70, "sechs")
    expect(a.saite.name).toBe("E2")
    expect(a.cent).toBeLessThan(-200)
  })

  it("nennt eine gestimmte Saite gestimmt", () => {
    const a = naechsteSaite(110 * 2 ** (2 / 1200), "sechs")
    expect(a.saite.name).toBe("A2")
    expect(a.cent).toBe(2)
    expect(a.imTon).toBe(true)
    expect(naechsteSaite(110 * 2 ** (6 / 1200), "sechs").imTon).toBe(false)
  })

  it("lässt einen Ausreisser beim Anschlag nicht auf die Nadel durch", () => {
    const sicher = (hz: number) => ({ hz, sicherheit: 0.95 })
    expect(geglaettet([sicher(110), sicher(220), sicher(110.2), sicher(109.9), sicher(110.1)])).toBeCloseTo(110.1)
    expect(geglaettet([null, null, { hz: 110, sicherheit: 0.5 }, sicher(110)])).toBeNull()
  })

  it("schreibt Noten mit Oktave", () => {
    expect(notenname(40)).toBe("E2")
    expect(notenname(69)).toBe("A4")
  })
})
