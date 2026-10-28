import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { allesLoeschen } from "../loeschen"
import { anlassVersteckt, merkeSaisonal, saisonalAn, verstecke } from "../lokal"

/**
 * Der Schalter für den Banner und das "Für heute ausblenden". Beides gehört
 * diesem Gerät, wie die Darstellung — nichts davon geht in den Abgleich.
 */

function speicher(): Storage {
  const werte: Record<string, string> = {}
  // Methoden nicht aufzählbar, damit `Object.keys(localStorage)` wie im
  // Browser nur die Schlüssel liefert.
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

describe("Saisonales", () => {
  it("ist ohne Wahl an", () => {
    expect(saisonalAn()).toBe(true)
  })

  it("lässt sich abschalten und wieder einschalten", () => {
    merkeSaisonal(false)
    expect(saisonalAn()).toBe(false)
    merkeSaisonal(true)
    expect(saisonalAn()).toBe(true)
  })

  it("speichert nur das Abschalten, nicht den Normalfall", () => {
    merkeSaisonal(false)
    expect(Object.keys(localStorage)).toHaveLength(1)
    merkeSaisonal(true)
    expect(Object.keys(localStorage)).toEqual([])
  })
})

describe("Für heute ausblenden", () => {
  it("gilt nur für den Tag, an dem es gewählt wurde", () => {
    expect(anlassVersteckt("2026-12-01")).toBe(false)
    verstecke("2026-12-01")
    expect(anlassVersteckt("2026-12-01")).toBe(true)
    expect(anlassVersteckt("2026-12-02")).toBe(false)
  })

  it("wird durch Wiedereinschalten zurückgeholt", () => {
    verstecke("2026-12-01")
    merkeSaisonal(false)
    merkeSaisonal(true)
    expect(anlassVersteckt("2026-12-01")).toBe(false)
  })
})

describe("Löschen", () => {
  it("nimmt beides mit", () => {
    merkeSaisonal(false)
    verstecke("2026-12-01")
    allesLoeschen()
    expect(Object.keys(localStorage)).toEqual([])
  })
})
