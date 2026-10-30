import { describe, expect, it } from "vitest"
import { bewertungsvorschlag } from "../bewertung"

describe("bewertungsvorschlag", () => {
  it("richtig und sicher: ein Tap, kein Vierer-Block", () => {
    expect(bewertungsvorschlag(true, 3, false)).toEqual({ vorschlag: 3, volleWahl: false })
    expect(bewertungsvorschlag(true, 2, false)).toEqual({ vorschlag: 3, volleWahl: false })
  })

  it("falsch: Nochmal vorgeschlagen, aber die Wahl bleibt", () => {
    for (const sure of [1, 2, 3, undefined] as const) {
      expect(bewertungsvorschlag(false, sure, false)).toEqual({ vorschlag: 1, volleWahl: true })
    }
  })

  it("richtig geraten oder ohne Sicherheitsangabe: der Spieler entscheidet", () => {
    expect(bewertungsvorschlag(true, 1, false)).toEqual({ vorschlag: 3, volleWahl: true })
    expect(bewertungsvorschlag(true, undefined, false)).toEqual({ vorschlag: 3, volleWahl: true })
  })

  it("ungemessen: nichts vorgeschlagen, volle Wahl", () => {
    expect(bewertungsvorschlag(false, undefined, true)).toEqual({ vorschlag: null, volleWahl: true })
  })
})
