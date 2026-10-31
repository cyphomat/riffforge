import { describe, expect, it } from "vitest"
import { DRILLS } from "../drills"
import {
  MAX_GITARREN,
  STANDARD_GITARREN,
  gitarreDazu,
  gitarreWeg,
  gitarrenSchema,
  zuweisen,
} from "../gitarren"
import type { BlockKind, SessionBlock } from "../types"

function block(kind: BlockKind): SessionBlock {
  const drill = DRILLS.find((d) => d.kind === kind)
  if (!drill) throw new Error(`kein Drill vom Typ ${kind}`)
  return { drill, seconds: 180, bpm: 100, round: 1, rounds: 1 }
}

/** Die Form einer Session: Warm-up, dann zweimal Technik und Riff. */
const SESSION = [
  block("warmup"),
  block("technique"),
  block("riff"),
  block("technique"),
  block("riff"),
]

/** Ein Zufall, der reihum durch 0 … 1 läuft — deterministisch, aber nicht immer dasselbe. */
function reihum(werte: number[]): () => number {
  let i = 0
  return () => werte[i++ % werte.length]
}

describe("Gitarrenroulette", () => {
  it("gibt dem Warm-up keine Gitarre", () => {
    expect(zuweisen([], SESSION, STANDARD_GITARREN, Math.random)[0]).toBeNull()
  })

  it("lässt das Riff auf der Gitarre der Technik", () => {
    for (let versuch = 0; versuch < 50; versuch++) {
      const z = zuweisen([], SESSION, STANDARD_GITARREN, Math.random)
      expect(z[2]).toBe(z[1])
      expect(z[4]).toBe(z[3])
    }
  })

  it("nimmt in Runde zwei nie dieselbe Gitarre wie in Runde eins", () => {
    for (let versuch = 0; versuch < 200; versuch++) {
      const z = zuweisen([], SESSION, STANDARD_GITARREN, Math.random)
      expect(z[3]).not.toBe(z[1])
    }
  })

  it("würfelt auch mit zwei Gitarren sauber im Wechsel", () => {
    const zwei = STANDARD_GITARREN.slice(0, 2)
    const z = zuweisen([], SESSION, zwei, Math.random)
    expect(new Set([z[1], z[3]]).size).toBe(2)
  })

  it("bleibt mit zu wenig Gitarren still", () => {
    expect(zuweisen([], SESSION, [], Math.random).every((g) => g === null)).toBe(true)
    expect(zuweisen([], SESSION, STANDARD_GITARREN.slice(0, 1), Math.random).every((g) => g === null)).toBe(true)
  })

  it("erreicht jede Gitarre, auch bei Zufall nahe 1", () => {
    const gesehen = new Set<string | null>()
    for (const r of [0, 0.26, 0.51, 0.76, 0.999999]) {
      gesehen.add(zuweisen([], SESSION, STANDARD_GITARREN, () => r)[1])
    }
    expect(gesehen).toEqual(new Set(STANDARD_GITARREN.map((g) => g.name)))
  })

  it("lässt Gezeigtes beim Verlängern stehen", () => {
    const vorher = zuweisen([], SESSION, STANDARD_GITARREN, Math.random)
    const mehr = [...SESSION, block("technique"), block("riff")]
    const nachher = zuweisen(vorher, mehr, STANDARD_GITARREN, Math.random)
    expect(nachher.slice(0, SESSION.length)).toEqual(vorher)
    expect(nachher[5]).not.toBe(vorher[3])
    expect(nachher[6]).toBe(nachher[5])
  })

  it("würfelt bei einem Riff ohne Technik davor trotzdem", () => {
    const z = zuweisen([], [block("riff"), block("riff")], STANDARD_GITARREN, reihum([0.1]))
    expect(z[0]).not.toBeNull()
    expect(z[1]).toBe(z[0])
  })

  it("nimmt im Sieben-Saiter-Modus nur Siebensaitige — und würfelt bei einer nicht", () => {
    expect(zuweisen([], SESSION, STANDARD_GITARREN, Math.random, { nurSieben: true }).every((g) => g === null)).toBe(true)
    const zwei = [...STANDARD_GITARREN, { name: "Ibanez 7", sieben: true }]
    const z = zuweisen([], SESSION, zwei, Math.random, { nurSieben: true })
    expect(z.filter(Boolean).every((g) => g === "Solar H-Type 7 Saiter" || g === "Ibanez 7")).toBe(true)
    expect(z[1]).not.toBeNull()
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
