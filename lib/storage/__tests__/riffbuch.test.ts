import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { allesLoeschen } from "../loeschen"
import { boardWahl, merkeBoardWahl, merkeRiffGehoert, riffbuch } from "../lokal"
import { ALLE_RIFFE } from "@/lib/session/riffbuch"

/** Riffbuch und Board-Wahl gehören dem Gerät: nichts davon geht in den Abgleich, beides geht beim Löschen mit. */

function speicher(): Storage {
  const werte: Record<string, string> = {}
  Object.defineProperties(werte, {
    getItem: { value: (k: string) => (k in werte ? werte[k] : null) },
    setItem: { value: (k: string, v: string) => void (werte[k] = String(v)) },
    removeItem: { value: (k: string) => void delete werte[k] },
    key: { value: (i: number) => Object.keys(werte)[i] ?? null },
    clear: { value: () => Object.keys(werte).forEach((k) => delete werte[k]) },
    length: { get: () => Object.keys(werte).length },
  })
  return werte as unknown as Storage
}

const global = globalThis as { window?: { localStorage: Storage } }
let localStorage: Storage
beforeEach(() => {
  localStorage = speicher()
  global.window = { localStorage }
})
afterEach(() => {
  delete global.window
})

const ID = ALLE_RIFFE[0].id

describe("Das Riffbuch auf dem Gerät", () => {
  it("ist am Anfang leer", () => {
    expect(riffbuch().gehoert).toEqual({})
  })

  it("trägt ein Riff mit dem ersten Datum ein und behält es", () => {
    merkeRiffGehoert(ID, new Date("2026-12-01T10:00:00Z"))
    merkeRiffGehoert(ID, new Date("2026-12-09T10:00:00Z"))
    expect(riffbuch().gehoert[ID]).toBe("2026-12-01T10:00:00.000Z")
  })

  it("nimmt keine unbekannte Kennung", () => {
    merkeRiffGehoert("riff-gibt-es-nicht")
    expect(riffbuch().gehoert).toEqual({})
    expect(Object.keys(localStorage)).toEqual([])
  })

  it("fällt bei Kaputtem auf ein leeres Buch zurück", () => {
    localStorage.setItem("mga.riffbuch.v1", "kein JSON")
    expect(riffbuch().gehoert).toEqual({})
    localStorage.setItem("mga.riffbuch.v1", JSON.stringify({ gehoert: { x: "kein Datum" } }))
    expect(riffbuch().gehoert).toEqual({})
  })

  it("verschwindet beim Löschen, ebenso die Wahl am Board", () => {
    merkeRiffGehoert(ID)
    merkeBoardWahl({ aus: ["fx-overdrive"], amp: null, bandAus: ["bass"] })
    expect(boardWahl().bandAus).toEqual(["bass"])
    allesLoeschen()
    expect(Object.keys(localStorage).filter((k) => k.startsWith("mga."))).toEqual([])
  })
})
