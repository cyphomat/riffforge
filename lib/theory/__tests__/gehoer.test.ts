import { describe, expect, it } from "vitest"
import { INTERVALLE } from "@/lib/theory/fretboard"
import {
  ANKER_REIHENFOLGE,
  ANKER_TON,
  ankerPaar,
  HOECHSTER_TON,
  HOER_AUSWAHL,
  HOER_REIHENFOLGE,
  hoerPaar,
  TIEFSTER_TON,
} from "@/lib/theory/gehoer"

describe("Hörfragen", () => {
  it("fragt jedes Intervall von der kleinen Sekunde bis zur Oktave genau einmal", () => {
    expect([...HOER_REIHENFOLGE].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it("bietet alle zwölf Namen an, kleinstes zuerst, ohne die Prime", () => {
    expect(HOER_AUSWAHL).toHaveLength(12)
    expect(HOER_AUSWAHL[0]).toBe("kleine Sekunde")
    expect(HOER_AUSWAHL[11]).toBe("Oktave")
    expect(HOER_AUSWAHL).not.toContain("Prime")
  })

  it("spielt den verlangten Abstand in die verlangte Richtung, und nur im Hörbereich", () => {
    for (const halbtoene of HOER_REIHENFOLGE) {
      for (const zufall of [0, 0.25, 0.5, 0.999999, 1]) {
        const [auf1, auf2] = hoerPaar(halbtoene, "auf", zufall)
        expect(auf2 - auf1).toBe(halbtoene)
        const [ab1, ab2] = hoerPaar(halbtoene, "ab", zufall)
        expect(ab1 - ab2).toBe(halbtoene)
        for (const ton of [auf1, auf2, ab1, ab2]) {
          expect(ton).toBeGreaterThanOrEqual(TIEFSTER_TON)
          expect(ton).toBeLessThanOrEqual(HOECHSTER_TON)
        }
      }
    }
  })

  it("wechselt die Töne mit dem Zufall — die Antwort ist der Abstand, nicht der Klang", () => {
    const unten = new Set(Array.from({ length: 50 }, (_, i) => hoerPaar(7, "auf", i / 50)[0]))
    expect(unten.size).toBeGreaterThan(15)
    // Der ganze Spielraum wird genutzt, auch die Ränder.
    expect(Math.min(...unten)).toBe(TIEFSTER_TON)
    expect(hoerPaar(7, "auf", 0.999999)[1]).toBe(HOECHSTER_TON)
  })

  it("spielt bei einer Ankerkarte immer zuerst die tiefe E, dann den Ton darüber", () => {
    expect(ANKER_TON).toBe(40)
    for (const halbtoene of ANKER_REIHENFOLGE) expect(ankerPaar(halbtoene)).toEqual([40, 40 + halbtoene])
  })

  it("fragt jeden Abstand von der Halbtonstufe bis zur Oktave genau einmal ab", () => {
    expect([...ANKER_REIHENFOLGE].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it("nennt dieselben Namen wie die Intervalltabelle", () => {
    for (const halbtoene of HOER_REIHENFOLGE) expect(HOER_AUSWAHL[halbtoene - 1]).toBe(INTERVALLE[halbtoene].name)
  })
})
