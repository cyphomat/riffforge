import { describe, expect, it } from "vitest"
import {
  MAX_GITARREN,
  STANDARD_GITARREN,
  gitarreDazu,
  gitarreWeg,
  gitarrenSchema,
  wuerfle,
} from "../gitarren"

/** Zufallswerte quer durch 0 … 1, bis knapp unter 1. */
const WERTE = [0, 0.26, 0.51, 0.76, 0.999999]

describe("Gitarrenroulette", () => {
  it("erreicht jede Gitarre, auch bei Zufall nahe 1", () => {
    const gesehen = new Set(WERTE.map((r) => wuerfle(STANDARD_GITARREN, () => r)))
    expect(gesehen).toEqual(new Set(STANDARD_GITARREN.map((g) => g.name)))
  })

  it("bleibt mit zu wenig Gitarren still", () => {
    expect(wuerfle([], Math.random)).toBeNull()
    const eine = STANDARD_GITARREN.slice(0, 1)
    expect(wuerfle(eine, Math.random)).toBeNull()
    expect(wuerfle(eine, Math.random, { nicht: eine[0].name })).toBeNull()
  })

  it("würfelt auf Wunsch neu und nimmt dann eine andere Gitarre", () => {
    for (const r of WERTE) {
      for (const gezeigt of STANDARD_GITARREN) {
        const neu = wuerfle(STANDARD_GITARREN, () => r, { nicht: gezeigt.name })
        expect(neu).not.toBeNull()
        expect(neu).not.toBe(gezeigt.name)
      }
    }
  })

  it("nimmt im Sieben-Saiter-Modus nur Siebensaitige — und würfelt bei einer nicht", () => {
    expect(wuerfle(STANDARD_GITARREN, Math.random, { nurSieben: true })).toBeNull()
    const zwei = [...STANDARD_GITARREN, { name: "Ibanez 7", sieben: true }]
    for (const r of WERTE) {
      expect(["Solar H-Type 7 Saiter", "Ibanez 7"]).toContain(wuerfle(zwei, () => r, { nurSieben: true }))
    }
  })
})

describe("Gitarrenliste", () => {
  it("nimmt die Standardliste an", () => {
    expect(gitarrenSchema.safeParse(STANDARD_GITARREN).success).toBe(true)
  })

  it("weist Kaputtes ab", () => {
    expect(gitarrenSchema.safeParse([{ name: "", sieben: false }]).success).toBe(false)
    expect(gitarrenSchema.safeParse([{ name: "x" }]).success).toBe(false)
    expect(gitarrenSchema.safeParse("Strat").success).toBe(false)
  })

  it("hängt an, ohne Doppelte, Leeres und ein volles Rack", () => {
    const mit = gitarreDazu(STANDARD_GITARREN, "  Les Paul ", false)
    expect(mit.at(-1)).toEqual({ name: "Les Paul", sieben: false })
    expect(gitarreDazu(mit, "les paul", false)).toBe(mit)
    expect(gitarreDazu(mit, "   ", false)).toBe(mit)
    let voll = STANDARD_GITARREN
    for (let i = 0; i < MAX_GITARREN + 3; i++) voll = gitarreDazu(voll, `G${i}`, false)
    expect(voll).toHaveLength(MAX_GITARREN)
  })

  it("nimmt eine heraus", () => {
    expect(gitarreWeg(STANDARD_GITARREN, "Solar S-Type").map((g) => g.name)).toEqual([
      "EVH Wolfgang Floyd Rose",
      "ESP Arrow V-Type",
      "Solar H-Type 7 Saiter",
    ])
  })
})
