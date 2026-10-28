import { describe, expect, it } from "vitest"
import {
  AUF_DEN_PUNKT_AB,
  AUF_DEN_PUNKT_N,
  AUF_DEN_PUNKT_STUFEN,
  COMEBACK_PAUSE_TAGE,
  RAENGE,
  TECHNIK_TAGE,
  TECHNIK_TITEL,
  TIGHT_N,
  TIGHT_STUFEN,
  aufnaeher,
  festivalShirts,
  rangTage,
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

  it("stuft Tight und Auf den Punkt, und die erste Stufe behält ihre Nummer", () => {
    const [, mitte, oben] = TIGHT_STUFEN
    const sauber = tage("2026-01-01", mitte).map((t) => r(t))
    const liste = aufnaeher(log(...sauber))
    expect(verdient(liste, "tight")).toBe(tage("2026-01-01", TIGHT_N).at(-1))
    expect(verdient(liste, `tight-${mitte}`)).toBe(tage("2026-01-01", mitte).at(-1))
    expect(verdient(liste, `tight-${oben}`)).toBeNull()

    const [, punktMitte] = AUF_DEN_PUNKT_STUFEN
    const gemessen = tage("2026-01-01", punktMitte).map((t) => r(t, { score: AUF_DEN_PUNKT_AB }))
    expect(verdient(aufnaeher(log(...gemessen)), `auf-den-punkt-${punktMitte}`)).toBe(
      tage("2026-01-01", punktMitte).at(-1),
    )
    // Eine Leiter, ein Bild: alle Stufen hängen an derselben Gruppe.
    expect(new Set(katalog({ mitSieben: false }).filter((a) => a.id.startsWith("tight")).map((a) => a.gruppe))).toEqual(
      new Set(["tight"]),
    )
  })

  it("gibt jeder Technik ihren Aufnäher — an verschiedenen Tagen sauber, nicht an einem langen Abend", () => {
    const id = `technik-${TECH.technique}`
    const fuenf = tage("2026-03-01", TECHNIK_TAGE).map((t) => r(t))
    expect(verdient(aufnaeher(log(...fuenf)), id)).toBe(tage("2026-03-01", TECHNIK_TAGE).at(-1))

    const einAbend = Array.from({ length: TECHNIK_TAGE * 2 }, () => r("2026-03-01"))
    expect(verdient(aufnaeher(log(...einAbend)), id)).toBeNull()

    const zaeh = tage("2026-03-01", TECHNIK_TAGE).map((t, i) => r(t, { rating: i === 0 ? 1 : 3 }))
    expect(verdient(aufnaeher(log(...zaeh)), id)).toBeNull()
  })

  it("hat für jede gespielte Technik einen Aufnäher, nur fürs Warm-up nicht", () => {
    const technik = katalog({ mitSieben: true }).filter((a) => a.technik)
    expect(technik.map((a) => a.technik)).not.toContain("warmup")
    for (const drill of [...DRILLS, ...SIEBEN_DRILLS].filter((d) => d.technique !== "warmup")) {
      expect(technik.some((a) => a.technik === drill.technique), drill.id).toBe(true)
    }
    expect(new Set(Object.values(TECHNIK_TITEL)).size).toBe(Object.keys(TECHNIK_TITEL).length)
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

  it("zeigt als nächsten Technik-Aufnäher den, der am nächsten ist, und sagt wie nah", () => {
    const andere = DRILLS.find((d) => d.kind === "technique" && d.technique !== TECH.technique)!
    const liste = aufnaeher(
      log(
        ...tage("2026-03-01", TECHNIK_TAGE - 1).map((t) => r(t)),
        r("2026-03-01", { drillId: andere.id }),
      ),
    )
    const naechster = kutte(liste).naechste.find((a) => a.gruppe === "technik")!
    expect(naechster.technik).toBe(TECH.technique)
    expect(naechster.text).toMatch(/Noch 1 Tag\.$/)
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

describe("Festival-Shirts", () => {
  it("kommen mit dem Rang, am Tag der Session, die ihn erreicht hat", () => {
    // Vier Wochen, je ein Montag und ein Donnerstag.
    const tageListe = ["2026-03-02", "2026-03-05", "2026-03-09", "2026-03-12", "2026-03-16", "2026-03-19", "2026-03-23"]
    const shirts = festivalShirts(log(...tageListe.map((t) => r(t))))
    expect(shirts.map((s) => s.id)).toEqual(RAENGE.slice(1).map((r) => r.id))
    expect(shirts[0]).toMatchObject({ id: "proberaum", titel: "Proberaum-Shirt", verdient: "2026-03-23" })
    expect(shirts[1].verdient).toBeNull()
    expect(rang(log(...tageListe.map((t) => r(t)))).id).toBe("proberaum")
    expect(shirts.at(-1)!.titel).toBe("Hall-of-Fame-Shirt")
  })

  it("datiert jeden erreichten Rang, die Garage auf die erste Session", () => {
    const tageListe = ["2026-03-04", "2026-03-05", "2026-03-09", "2026-03-16", "2026-03-23"]
    const tage = rangTage(log(...tageListe.map((t) => r(t))))
    expect(tage).toHaveLength(RAENGE.length)
    expect(tage[0]).toBe("2026-03-04")
    expect(tage[1]).toBe("2026-03-23")
    expect(tage.slice(2).every((t) => t === null)).toBe(true)
    expect(rangTage(log()).every((t) => t === null)).toBe(true)
  })

  it("gibt es für die Garage nicht — die hat jeder", () => {
    expect(festivalShirts(log()).every((s) => s.verdient === null)).toBe(true)
    expect(festivalShirts(log()).map((s) => s.id)).not.toContain("garage")
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

  it("sagt zu jedem Tourtag, was gespielt wurde", () => {
    const [tour] = touren(
      log(
        r("2026-08-03"),
        r("2026-08-04", { drillId: LEAD_DRILL_ID }),
        r("2026-08-05", { drillId: SIEBEN_DRILLS[0].id }),
        r("2026-08-05", { drillId: LEAD_DRILL_ID }),
        // Ein Lick innerhalb der Session macht aus ihr keinen Lick-Abend.
        r("2026-08-06"),
        r("2026-08-06", { drillId: LEAD_DRILL_ID }),
      ),
      [],
      new Date("2026-08-15T12:00:00"),
    )
    expect(tour.termine).toEqual([
      { tag: "2026-08-03", arten: ["session"] },
      { tag: "2026-08-04", arten: ["lick"] },
      { tag: "2026-08-05", arten: ["lick", "sieben"] },
      { tag: "2026-08-06", arten: ["session"] },
    ])
    expect(tour.termine.map((t) => t.tag)).toEqual(tour.gigs)
  })
})

describe("Aufnäher der Anlässe", () => {
  // Ein Anlass-Aufnäher steht erst da, wenn er verdient ist: Weihnachten und
  // zwei Gedenktage als leere Umrisse wären genau der Schmuck, den die App
  // sonst vermeidet — und eine Lücke, die es nur zwei Mal im Jahr zu füllen gibt.
  const anlass = (liste: ReturnType<typeof aufnaeher>) => liste.filter((a) => a.reihe === "anlaesse")

  it("gibt es ohne Treffer nicht, auch nicht als Umriss", () => {
    const liste = aufnaeher(log(r("2026-10-28")))
    expect(anlass(liste)).toEqual([])
    expect(kutte(liste).naechste.filter((a) => a.reihe === "anlaesse")).toEqual([])
    expect(katalog({ mitSieben: true }).filter((a) => a.reihe === "anlaesse")).toEqual([])
  })

  it("Weihnachten: eine Session zwischen dem 1. und 26.12., der erste Tag zählt", () => {
    expect(verdient(aufnaeher(log(r("2026-11-30"), r("2026-12-27"))), "anlass-weihnachten")).toBeUndefined()
    expect(verdient(aufnaeher(log(r("2026-12-05"), r("2026-12-24"))), "anlass-weihnachten")).toBe("2026-12-05")
  })

  it("Gedenktage: nur an dem einen Tag", () => {
    expect(verdient(aufnaeher(log(r("2026-07-21"), r("2026-07-23"))), "anlass-ozzy")).toBeUndefined()
    expect(verdient(aufnaeher(log(r("2026-07-22"))), "anlass-ozzy")).toBe("2026-07-22")
    expect(verdient(aufnaeher(log(r("2026-12-28"))), "anlass-lemmy")).toBe("2026-12-28")
  })

  it("liegt in der Reihe Anlässe, mit eigener Leiter je Anlass, und bleibt an der Kutte", () => {
    const liste = aufnaeher(log(r("2026-12-05")))
    const [w] = anlass(liste)
    expect(w).toMatchObject({ id: "anlass-weihnachten", reihe: "anlaesse", gruppe: "anlass-weihnachten" })
    expect(kutte(liste).verdient.map((a) => a.id)).toContain("anlass-weihnachten")
  })

  it("wird nur einmal gefeiert, auch im nächsten Jahr nicht noch einmal", () => {
    const vorher = aufnaeher(log(r("2026-12-05")))
    const nachher = aufnaeher(log(r("2026-12-05"), r("2027-12-05")))
    expect(verdient(nachher, "anlass-weihnachten")).toBe("2026-12-05")
    expect(neueAufnaeher(vorher, nachher).map((a) => a.id)).not.toContain("anlass-weihnachten")
  })

  it("belohnt keine Menge und sagt es auch nicht", () => {
    const liste = aufnaeher(log(r("2026-12-05"), r("2026-07-22"), r("2026-12-28")))
    expect(anlass(liste)).toHaveLength(3)
    for (const a of anlass(liste)) {
      expect(`${a.titel} ${a.text}`, a.id).not.toMatch(/Minute|Stunde|Blöcke am Stück|Sessions am Tag/)
    }
  })
})
