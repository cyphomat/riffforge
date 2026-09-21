import { describe, expect, it } from "vitest"
import { midiAt } from "../fretboard"
import type { Griff } from "../types"
import {
  LEERSAITEN_SIEBEN,
  SAITENNAMEN_SIEBEN,
  abstandSieben,
  gleicherTonAuf,
  hertzSieben,
  midiSieben,
  tonSieben,
} from "../sieben"

/**
 * Die siebte Saite als Rechnung.
 *
 * Was die Übungen über sie behaupten, steht hier auf dem Prüfstand — sonst
 * wäre es eine Tabelle mit Zahlen, die irgendwann unbemerkt lügt.
 */
describe("B Standard", () => {
  it("lässt die sechs bekannten Saiten unverändert", () => {
    // Das ist der ganze Grund, warum man nicht umlernen muss: oben ändert
    // sich nichts, unten kommt etwas dazu.
    for (let saite = 1; saite <= 6; saite += 1) {
      const griff = { saite, bund: 7 } as Griff
      expect(midiSieben({ saite: griff.saite, bund: 7 }), `Saite ${saite}`).toBe(midiAt(griff))
    }
  })

  it("hängt unten eine Quarte an", () => {
    // B1 unter E2 — fünf Halbtöne, derselbe Abstand wie zwischen E und A.
    expect(abstandSieben({ saite: 7, bund: 0 }, { saite: 6, bund: 0 })).toBe(5)
    expect(tonSieben({ saite: 7, bund: 0 })).toBe("B")
    expect(LEERSAITEN_SIEBEN).toHaveLength(7)
    expect(SAITENNAMEN_SIEBEN[6]).toBe("B")
  })

  it("legt den alten tiefsten Ton in den fünften Bund", () => {
    // Die Auskunft, die einem Umsteiger fehlt.
    expect(tonSieben({ saite: 7, bund: 5 })).toBe("E")
    expect(midiSieben({ saite: 7, bund: 5 })).toBe(midiSieben({ saite: 6, bund: 0 }))
    expect(gleicherTonAuf({ saite: 6, bund: 0 }, 7)).toEqual({ saite: 7, bund: 5 })
  })

  it("hält die eine Ausnahme fest: G nach B sind vier Bünde", () => {
    // Bund 5 klingt wie die nächsthöhere Leersaite — ausser bei G/B.
    for (const saite of [7, 6, 5, 4] as const) {
      expect(midiSieben({ saite, bund: 5 }), `Saite ${saite}`).toBe(
        midiSieben({ saite: (saite - 1) as 6 | 5 | 4 | 3, bund: 0 }),
      )
    }
    expect(midiSieben({ saite: 3, bund: 4 })).toBe(midiSieben({ saite: 2, bund: 0 }))
    expect(midiSieben({ saite: 3, bund: 5 })).not.toBe(midiSieben({ saite: 2, bund: 0 }))
  })

  it("rechnet den Saitensprung nach", () => {
    // Eine Saite überspringen sind zwei Quarten — ausser über die B-Saite
    // hinweg, dort schluckt der Versatz einen Halbton.
    expect(abstandSieben({ saite: 7, bund: 7 }, { saite: 5, bund: 7 })).toBe(10)
    expect(abstandSieben({ saite: 5, bund: 7 }, { saite: 3, bund: 7 })).toBe(10)
    expect(abstandSieben({ saite: 3, bund: 7 }, { saite: 1, bund: 7 })).toBe(9)
  })

  it("gibt der tiefen Saite ihre Frequenz", () => {
    // Die Zahl, mit der die Dämpfungs-Übung argumentiert: knapp 62 gegen gut
    // 82 Hz. Wer sie ändert, soll hier auffallen.
    expect(hertzSieben({ saite: 7, bund: 0 })).toBeCloseTo(61.74, 1)
    expect(hertzSieben({ saite: 6, bund: 0 })).toBeCloseTo(82.41, 1)
  })

  it("findet keinen Ton jenseits des Halses", () => {
    expect(gleicherTonAuf({ saite: 1, bund: 12 }, 7)).toBeNull()
  })
})
