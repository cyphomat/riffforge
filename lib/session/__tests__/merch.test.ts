import { describe, expect, it } from "vitest"
import {
  AUF_DEN_PUNKT_AB,
  AUF_DEN_PUNKT_N,
  COMEBACK_PAUSE_TAGE,
  RAENGE,
  TIGHT_N,
  aufnaeher,
  katalog,
  kutte,
  neueAufnaeher,
  rang,
  touren,
  tourName,
} from "../merch"
import { DRILLS } from "../drills"
import { SIEBEN_DRILLS } from "../drills-sieben"
import { LEAD_DRILL_ID } from "../lead"
import type { DrillResult, PracticeLog, Rating } from "../types"
import { suggestRating } from "@/lib/audio/timing"
import { THEORY_CARDS } from "@/lib/theory/cards"
import type { TheoryLog } from "@/lib/theory/types"

/**
 * Der Merch-Stand. Spiel, aber ehrlich: was hier steht, muss aus dem Log
 * folgen, und belohnt wird Regelmässigkeit, nie Menge.
 */

const TECH = DRILLS.find((d) => d.kind === "technique")!

function r(
  tag: string,
  {
    drillId = TECH.id,
    rating = 3,
    bpm = TECH.startBpm,
    score,
  }: { drillId?: string; rating?: Rating; bpm?: number; score?: number } = {},
): DrillResult {
  return {
    drillId,
    technique: "gallop",
    bpm,
    rating,
    seconds: 180,
    at: new Date(`${tag}T20:00:00`).toISOString(),
    ...(score === undefined
      ? {}
      : {
          timing: { hits: 40, expected: 40, spreadMs: 10, offsetMs: 20, score, trend: "steady" as const },
        }),
  }
}

const log = (...results: DrillResult[]): PracticeLog => ({ version: 1, results })

/** `n` aufeinanderfolgende Tage ab einem Datum. */
function tage(ab: string, n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(`${ab}T12:00:00`)
    d.setDate(d.getDate() + i)
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`
  })
}

const verdient = (liste: ReturnType<typeof aufnaeher>, id: string) => liste.find((a) => a.id === id)?.verdient

describe("Aufnäher", () => {
  it("verdient mit leerem Log nichts", () => {
    expect(aufnaeher(log()).filter((a) => a.verdient)).toEqual([])
  })

  it("datiert das Debüt auf den ersten Tag", () => {
    const liste = aufnaeher(log(r("2026-03-04"), r("2026-03-02")))
    expect(verdient(liste, "debuet")).toBe("2026-03-02")
  })

  it("zählt Gigs als Tage, nicht als Blöcke", () => {
    // Fünfzehn Blöcke an einem Abend sind ein Gig — Menge zählt nicht.
    const einAbend = log(...Array.from({ length: 15 }, () => r("2026-03-02")))
    expect(verdient(aufnaeher(einAbend), "gigs-10")).toBeNull()

    const zehnTage = log(...tage("2026-03-01", 10).map((t) => r(t)))
    expect(verdient(aufnaeher(zehnTage), "gigs-10")).toBe("2026-03-10")
  })

  it("verleiht die Serie für Wochen am Stück, und behält sie nach einem Riss", () => {
    // Je ein Abend pro Woche, vier Wochen lang — dann eine Lücke.
    const vierWochen = ["2026-03-02", "2026-03-11", "2026-03-18", "2026-03-27"]
    const liste = aufnaeher(log(...vierWochen.map((t) => r(t)), r("2026-05-01")))
    expect(verdient(liste, "serie-4")).toBe("2026-03-27")
    expect(verdient(liste, "serie-12")).toBeNull()
  })

  it("zählt eine Lücke von einer Woche als Riss", () => {
    const mitLuecke = ["2026-03-02", "2026-03-09", "2026-03-23", "2026-03-30"]
    expect(verdient(aufnaeher(log(...mitLuecke.map((t) => r(t)))), "serie-4")).toBeNull()
  })

  it("feiert ein Comeback erst nach einer echten Pause", () => {
    const knapp = new Date("2026-03-02T12:00:00")
    knapp.setDate(knapp.getDate() + COMEBACK_PAUSE_TAGE - 1)
    const tagKnapp = knapp.toISOString().slice(0, 10)
    expect(verdient(aufnaeher(log(r("2026-03-02"), r(tagKnapp))), "comeback")).toBeNull()
    expect(verdient(aufnaeher(log(r("2026-03-02"), r("2026-03-20"))), "comeback")).toBe("2026-03-20")
  })

  it("macht Tight an lauter sauberen Tagen fest — ein wackeliger Block kostet den Tag", () => {
    const zehn = tage("2026-03-01", TIGHT_N).map((t) => r(t))
    expect(verdient(aufnaeher(log(...zehn)), "tight")).toBe(tage("2026-03-01", TIGHT_N).at(-1))

    const einerWackelt = [...zehn, r("2026-03-05", { rating: 2 })]
    expect(verdient(aufnaeher(log(...einerWackelt)), "tight")).toBeNull()
  })

  it('hängt „Auf den Punkt“ an dieselbe Schwelle wie den Vorschlag „Locker“', () => {
    const analyse = (score: number) => ({ hits: 40, expected: 40, spreadMs: 10, offsetMs: 0, score, trend: "steady" as const })
    expect(suggestRating(analyse(AUF_DEN_PUNKT_AB) as never)).toBe(4)
    expect(suggestRating(analyse(AUF_DEN_PUNKT_AB - 1) as never)).toBe(3)

    const knapp = tage("2026-03-01", AUF_DEN_PUNKT_N).map((t) => r(t, { score: AUF_DEN_PUNKT_AB - 1 }))
    expect(verdient(aufnaeher(log(...knapp)), "auf-den-punkt")).toBeNull()
    const genau = tage("2026-03-01", AUF_DEN_PUNKT_N).map((t) => r(t, { score: AUF_DEN_PUNKT_AB }))
    expect(verdient(aufnaeher(log(...genau)), "auf-den-punkt")).not.toBeNull()
  })

  it("zählt das Zieltempo nur sauber gespielt, und je Drill einmal", () => {
    const schnellAberZaeh = r("2026-03-02", { bpm: TECH.targetBpm, rating: 1 })
    expect(verdient(aufnaeher(log(schnellAberZaeh)), "zieltempo-1")).toBeNull()

    const sauber = r("2026-03-03", { bpm: TECH.targetBpm })
    expect(verdient(aufnaeher(log(sauber)), "zieltempo-1")).toBe("2026-03-03")
    // Derselbe Drill dreimal ist ein Drill, nicht drei.
    const dreimal = [sauber, r("2026-03-04", { bpm: TECH.targetBpm }), r("2026-03-05", { bpm: TECH.targetBpm })]
    expect(verdient(aufnaeher(log(...dreimal)), "zieltempo-3")).toBeNull()
  })

  it("verleiht das Gitarrensolo für das erste abgehakte Lick", () => {
    const wackelig = r("2026-03-02", { drillId: LEAD_DRILL_ID, rating: 2 })
    const sauber = r("2026-03-03", { drillId: LEAD_DRILL_ID, rating: 3 })
    expect(verdient(aufnaeher(log(wackelig)), "licks-1")).toBeNull()
    expect(verdient(aufnaeher(log(wackelig, sauber)), "licks-1")).toBe("2026-03-03")
  })

  it("zeigt die Sieben-Saiter-Reihe nur dem, der auf sieben Saiten geübt hat", () => {
    // Wer keine Siebensaitige hat, soll sie nicht als Lücke auf der Kutte sehen.
    expect(aufnaeher(log(r("2026-03-02"))).some((a) => a.reihe === "sieben")).toBe(false)
    const mit = aufnaeher(log(r("2026-03-02", { drillId: SIEBEN_DRILLS[0].id })))
    expect(verdient(mit, "sieben-1")).toBe("2026-03-02")
  })

  it("zählt Karten, die eine Woche halten — und behält den Aufnäher, wenn eine wieder wackelt", () => {
    // Zehn Karten, je dreimal gut beantwortet mit wachsendem Abstand.
    const karten = THEORY_CARDS.slice(0, 10)
    const antworten: TheoryLog["answers"] = []
    for (const karte of karten) {
      for (const tag of ["2026-03-01", "2026-03-04", "2026-03-14"]) {
        antworten.push({ cardId: karte.id, grade: 3, correct: true, at: `${tag}T20:00:00.000Z` })
      }
    }
    const gut: TheoryLog = { version: 1, answers: antworten }
    expect(verdient(aufnaeher(log(), gut, THEORY_CARDS), "wissen-10")).not.toBeNull()

    // Danach eine vergessen: der Aufnäher sagt, was erreicht wurde.
    const vergessen: TheoryLog = {
      version: 1,
      answers: [...antworten, { cardId: karten[0].id, grade: 1, correct: false, at: "2026-04-20T20:00:00.000Z" }],
    }
    expect(verdient(aufnaeher(log(), vergessen, THEORY_CARDS), "wissen-10")).not.toBeNull()
  })

  it("verleiht Taktgefühl nur für eine richtig gespielte Frage", () => {
    const gespielt = THEORY_CARDS.find((k) => k.frage.art === "gespielt")!
    const getippt = THEORY_CARDS.find((k) => k.frage.art === "eingabe")!
    const antwort = (cardId: string, correct: boolean) => ({
      version: 1 as const,
      answers: [{ cardId, grade: 3 as const, correct, at: "2026-03-02T20:00:00.000Z" }],
    })
    expect(verdient(aufnaeher(log(), antwort(getippt.id, true), THEORY_CARDS), "taktgefuehl")).toBeNull()
    expect(verdient(aufnaeher(log(), antwort(gespielt.id, false), THEORY_CARDS), "taktgefuehl")).toBeNull()
    expect(verdient(aufnaeher(log(), antwort(gespielt.id, true), THEORY_CARDS), "taktgefuehl")).toBe("2026-03-02")
  })

  it("belohnt keine Menge", () => {
    // Die Leitregel als Prüfung: kein Aufnäher spricht von Minuten, Blöcken
    // oder Stunden am Stück.
    for (const a of katalog({ mitSieben: true })) {
      expect(`${a.titel} ${a.text}`, a.id).not.toMatch(/Minute|Stunde|Blöcke am Stück|Sessions am Tag/)
    }
  })
})

describe("Kutte", () => {
  it("zeigt je Leiter nur den nächsten fehlenden Aufnäher", () => {
    const liste = aufnaeher(log(...tage("2026-03-01", 10).map((t) => r(t))))
    const { verdient: an, naechste } = kutte(liste)
    expect(an.map((a) => a.id)).toContain("gigs-10")
    const gigs = naechste.filter((a) => a.gruppe === "gigs")
    expect(gigs.map((a) => a.id)).toEqual(["gigs-25"])
    // Keine Gruppe taucht doppelt auf.
    expect(new Set(naechste.map((a) => a.gruppe)).size).toBe(naechste.length)
  })

  it("feiert nach einer Session nur, was sie neu gebracht hat", () => {
    const vorher = aufnaeher(log(r("2026-03-02")))
    const nachher = aufnaeher(log(r("2026-03-02"), r("2026-03-02")))
    // Zweite Session am selben Tag: kein zweites Debüt.
    expect(neueAufnaeher(vorher, nachher)).toEqual([])
    expect(neueAufnaeher(aufnaeher(log()), vorher).map((a) => a.id)).toEqual(["debuet"])
  })
})

describe("Rang", () => {
  it("zählt Wochen, nicht Sessions", () => {
    const siebenmalEineWoche = log(...tage("2026-03-02", 7).map((t) => r(t)))
    expect(rang(siebenmalEineWoche).wochen).toBe(1)
    expect(rang(siebenmalEineWoche).titel).toBe("Garagenband")
  })

  it("steigt nach vier Wochen in den Proberaum und nennt, was fehlt", () => {
    const vier = log(...["2026-03-02", "2026-03-09", "2026-03-16", "2026-03-23"].map((t) => r(t)))
    const jetzt = rang(vier)
    expect(jetzt.titel).toBe("Proberaum")
    expect(jetzt.naechster).toEqual({ titel: "Vorband", wochen: 12, fehlt: 8 })
  })

  it("fällt nie — auch nicht nach einer langen Pause", () => {
    const vier = ["2026-03-02", "2026-03-09", "2026-03-16", "2026-03-23"].map((t) => r(t))
    expect(rang(log(...vier, r("2027-01-10"))).stufe).toBeGreaterThanOrEqual(rang(log(...vier)).stufe)
  })

  it("hat aufsteigende Schwellen", () => {
    for (let i = 1; i < RAENGE.length; i += 1) expect(RAENGE[i].wochen).toBeGreaterThan(RAENGE[i - 1].wochen)
  })
})

describe("Tourshirts", () => {
  it("gibt jedem Quartal einen festen Namen", () => {
    expect(tourName(2026, 4)).toBe(tourName(2026, 4))
    expect(tourName(2026, 4)).toMatch(/ Tour$/)
    const namen = new Set([1, 2, 3, 4].flatMap((q) => [2026, 2027].map((j) => tourName(j, q))))
    expect(namen.size).toBeGreaterThan(4)
  })

  it("macht aus jedem Quartal mit Übung eine Tour, die neueste zuerst", () => {
    const liste = touren(
      log(r("2026-02-10"), r("2026-02-11"), r("2026-02-11"), r("2026-08-01")),
      [],
      new Date("2026-08-15T12:00:00"),
    )
    expect(liste.map((t) => `${t.jahr}-Q${t.quartal}`)).toEqual(["2026-Q3", "2026-Q1"])
    expect(liste[0].laufend).toBe(true)
    // Zwei Blöcke am selben Tag sind ein Gig.
    expect(liste[1].gigs).toEqual(["2026-02-10", "2026-02-11"])
    expect(liste[1].minuten).toBe(9)
  })
})
