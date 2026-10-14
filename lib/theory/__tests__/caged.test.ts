import { describe, expect, it } from "vitest"
import { cagedForm, FORMEN, formenAmHals, stufeInForm, tiefsterBund, verschiebung, type Form } from "@/lib/theory/caged"
import { noteAt, TOENE } from "@/lib/theory/fretboard"

/** A shape as frets from string 6 to string 1, "x" for not played — the way chord charts write it. */
function alsGriffbild(form: Form, akkord: (typeof TOENE)[number]): string {
  const toene = cagedForm(form, akkord)
  return [6, 5, 4, 3, 2, 1]
    .map((saite) => toene.find((ton) => ton.saite === saite)?.bund ?? "x")
    .join(" ")
}

describe("CAGED", () => {
  it("kennt die offenen Griffe, wie sie in jedem Akkordbuch stehen", () => {
    // Der Prüfstein: unverschoben muss jede Form der offene Akkord sein.
    expect(alsGriffbild("C", "C")).toBe("x 3 2 0 1 0")
    expect(alsGriffbild("A", "A")).toBe("x 0 2 2 2 0")
    expect(alsGriffbild("G", "G")).toBe("3 2 0 0 0 3")
    expect(alsGriffbild("E", "E")).toBe("0 2 2 1 0 0")
    expect(alsGriffbild("D", "D")).toBe("x x 0 2 3 2")
  })

  it("baut jede Form in jeder Tonart nur aus Grundton, grosser Terz und Quinte", () => {
    for (const akkord of TOENE) {
      for (const form of FORMEN) {
        const toene = cagedForm(form, akkord)
        for (const ton of toene) expect([0, 4, 7], `${form}-Form ${akkord}`).toContain(ton.stufe)
        // Und alle drei kommen vor — sonst wäre es kein Dreiklang.
        expect(new Set(toene.map((ton) => ton.stufe)), `${form}-Form ${akkord}`).toEqual(new Set([0, 4, 7]))
        // Die Grundtöne tragen wirklich den Namen des Akkords.
        for (const stelle of stufeInForm(form, akkord, 0)) expect(noteAt(stelle)).toBe(akkord)
      }
    }
  })

  it("bleibt auf dem Hals, den das Griffbrett zeigt", () => {
    for (const akkord of TOENE) {
      for (const form of FORMEN) {
        for (const ton of cagedForm(form, akkord)) expect(ton.bund).toBeLessThanOrEqual(15)
      }
    }
  })

  it("verschiebt das A-Barré für C um drei Bünde", () => {
    expect(verschiebung("A", "C")).toBe(3)
    expect(alsGriffbild("A", "C")).toBe("x 3 5 5 5 3")
    expect(alsGriffbild("E", "G")).toBe("3 5 5 4 3 3")
  })

  it("lässt die Formen in jeder Tonart im Kreis C A G E D aufeinander folgen", () => {
    const kreis = "CAGEDCAGED"
    for (const akkord of TOENE) {
      const folge = formenAmHals(akkord).join("")
      expect(kreis, `${akkord}: ${folge}`).toContain(folge)
      // Keine zwei Formen auf demselben Bund — sonst wäre die Reihenfolge Zufall.
      const buende = FORMEN.map((form) => tiefsterBund(form, akkord))
      expect(new Set(buende).size).toBe(5)
    }
    expect(formenAmHals("C")).toEqual(["C", "A", "G", "E", "D"])
  })
})
