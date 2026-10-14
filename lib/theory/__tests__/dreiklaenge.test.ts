import { describe, expect, it } from "vitest"
import { cagedForm, FORMEN } from "@/lib/theory/caged"
import { cardById } from "@/lib/theory/cards"
import { dreiklang, dreiklangTon, SAITENGRUPPEN, type Geschlecht, type Umkehrung } from "@/lib/theory/dreiklaenge"
import { midiAt, noteAt, TOENE } from "@/lib/theory/fretboard"
import type { Griff } from "@/lib/theory/types"

const g = (saite: number, bund: number) => ({ saite, bund }) as Griff
const UMKEHRUNGEN = [0, 1, 2] as const

describe("Dreiklänge auf drei Saiten", () => {
  it("stapelt in enger Lage: drei Töne aufsteigend, alle innerhalb einer Oktave", () => {
    for (const akkord of TOENE) {
      for (const geschlecht of ["dur", "moll"] as Geschlecht[]) {
        const terz = geschlecht === "dur" ? 4 : 3
        for (const gruppe of SAITENGRUPPEN) {
          for (const umkehrung of UMKEHRUNGEN) {
            const griffe = dreiklang(akkord, geschlecht, gruppe, umkehrung, 24)
            expect(griffe.length, `${akkord} ${geschlecht} ${gruppe} U${umkehrung}`).toBeGreaterThan(0)
            for (const griff of griffe) {
              const hoehen = griff.map(midiAt)
              expect(hoehen[1]).toBeGreaterThan(hoehen[0])
              expect(hoehen[2]).toBeGreaterThan(hoehen[1])
              expect(hoehen[2] - hoehen[0]).toBeLessThan(12)
              expect(new Set(griff.map((ton) => ton.stufe))).toEqual(new Set([0, terz, 7]))
              // Die Stufe stimmt mit dem Ton auf dem Hals überein.
              for (const ton of griff) {
                expect((TOENE.indexOf(noteAt(ton)) - TOENE.indexOf(akkord) + 12) % 12).toBe(ton.stufe)
              }
              // Und es passt unter eine Hand.
              const buende = griff.map((ton) => ton.bund)
              expect(Math.max(...buende) - Math.min(...buende)).toBeLessThanOrEqual(3)
            }
          }
        }
      }
    }
  })

  it("legt in jeder Umkehrung den richtigen Ton nach unten", () => {
    const unten = [0, 4, 7]
    for (const umkehrung of UMKEHRUNGEN) {
      for (const griff of dreiklang("E", "dur", [4, 3, 2], umkehrung, 24)) expect(griff[0].stufe).toBe(unten[umkehrung])
    }
    // Erste Umkehrung: der Grundton oben — das behauptet die Karte.
    expect(dreiklang("C", "dur", [3, 2, 1], 1)[0][2].stufe).toBe(0)
    expect(cardById("a-dreiklang-oben")!.frage.richtig).toEqual(["der Grundton"])
  })

  it("hat je Saitengruppe genau drei Griffe in einer Oktave", () => {
    for (const akkord of TOENE) {
      for (const gruppe of SAITENGRUPPEN) {
        const alle = UMKEHRUNGEN.flatMap((u: Umkehrung) => dreiklang(akkord, "dur", gruppe, u, 30))
        // Direkt am Sattel fehlt manchmal einer: er läge unter dem Bund null.
        // Ein Stück den Hals hinauf sind es immer drei — das sagt die Karte.
        expect(alle.filter((griff) => griff[0].bund < 12).length).toBeLessThanOrEqual(3)
        for (let ab = 5; ab < 17; ab += 1) {
          const imFenster = alle.filter((griff) => griff[0].bund >= ab && griff[0].bund < ab + 12)
          expect(imFenster, `${akkord} ${gruppe} ab ${ab}`).toHaveLength(3)
        }
      }
    }
    expect(cardById("a-dreiklang-lagen")!.frage.richtig).toEqual(["drei"])
  })

  it("nennt die Griffe aus den Karten so, wie der Text sie beschreibt", () => {
    expect(dreiklang("C", "dur", [3, 2, 1], 0)[0].map((t) => t.bund)).toEqual([5, 5, 3])
    expect(dreiklang("C", "dur", [3, 2, 1], 1)[0].map((t) => t.bund)).toEqual([9, 8, 8])
    expect(dreiklang("G", "dur", [3, 2, 1], 2)[0].map((t) => t.bund)).toEqual([7, 8, 7])
    expect(dreiklang("A", "moll", [4, 3, 2], 0)[0].map((t) => t.bund)).toEqual([7, 5, 5])
    expect(dreiklangTon("C", "dur", [3, 2, 1], 0, 4)).toEqual([g(2, 5)])
    expect(dreiklangTon("C", "dur", [3, 2, 1], 1, 0)).toEqual([g(1, 8)])
    expect(dreiklangTon("G", "dur", [3, 2, 1], 2, 0)).toEqual([g(2, 8)])
    expect(dreiklangTon("A", "moll", [4, 3, 2], 0, 3)).toEqual([g(3, 5)])
    // Der gegebene Ton jeder Karte ist wirklich der unterste ihres Griffs.
    for (const [id, akkord, geschlecht, gruppe, umkehrung] of [
      ["a-dreiklang-grundstellung", "C", "dur", [3, 2, 1], 0],
      ["a-dreiklang-erste", "C", "dur", [3, 2, 1], 1],
      ["a-dreiklang-zweite", "G", "dur", [3, 2, 1], 2],
      ["a-dreiklang-moll", "A", "moll", [4, 3, 2], 0],
    ] as const) {
      const unten = dreiklang(akkord, geschlecht, gruppe, umkehrung)[0][0]
      expect(cardById(id)!.frage.gegeben, id).toEqual([g(unten.saite, unten.bund)])
    }
  })

  it("findet jeden Dur-Dreiklang auf G-, B- und e-Saite in einer CAGED-Form", () => {
    // Nur auf dieser Gruppe behauptet die Karte das — auf den tiefen Saiten
    // stimmt es nicht immer, weil die C- und die A-Form die tiefe E-Saite
    // nicht greifen.
    const inForm = (griff: Griff[], akkord: (typeof TOENE)[number]) =>
      FORMEN.filter((form) =>
        [0, 12].some((oktave) =>
          griff.every((ton) => cagedForm(form, akkord).some((c) => c.saite === ton.saite && c.bund + oktave === ton.bund)),
        ),
      )
    for (const akkord of TOENE) {
      for (const umkehrung of UMKEHRUNGEN) {
        for (const griff of dreiklang(akkord, "dur", [3, 2, 1], umkehrung)) {
          expect(inForm(griff, akkord).length, `${akkord} U${umkehrung}`).toBeGreaterThan(0)
        }
      }
    }
    // Die Beispiele aus dem Text.
    expect(inForm(dreiklang("C", "dur", [3, 2, 1], 0)[0], "C")).toContain("A")
    expect(inForm(dreiklang("C", "dur", [3, 2, 1], 1)[0], "C")).toContain("E")
    expect(inForm(dreiklang("C", "dur", [3, 2, 1], 2)[0], "C")).toContain("C")
    // Und auf der tiefsten Gruppe gilt es nicht durchweg — deshalb sagt die Karte es dort nicht.
    const tief = TOENE.flatMap((akkord) =>
      UMKEHRUNGEN.flatMap((u) => dreiklang(akkord, "dur", [6, 5, 4], u).map((griff) => inForm(griff, akkord).length)),
    )
    expect(tief).toContain(0)
  })
})
