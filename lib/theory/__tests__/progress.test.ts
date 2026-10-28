import { describe, expect, it } from "vitest"
import {
  answersFor,
  cardStates,
  dueCards,
  istScheinwissen,
  kalibrierung,
  pickCards,
  scheinwissenKarten,
  theorieStand,
} from "@/lib/theory/progress"
import { theoryLogSchema, type Sicherheit, type TheoryAnswer, type TheoryCard, type TheoryLog } from "@/lib/theory/types"
import type { Grade } from "@/lib/theory/fsrs"

function karte(id: string, extra: Partial<TheoryCard> = {}): TheoryCard {
  return {
    id,
    stufe: 1,
    begriff: id,
    erklaerung: "…",
    frage: { art: "eingabe", text: "?", richtig: ["x"] },
    ...extra,
  }
}

function antwort(cardId: string, grade: Grade, at: string, correct = grade > 1): TheoryAnswer {
  return { cardId, grade, at, correct }
}

function sicher(cardId: string, sure: Sicherheit, correct: boolean, at: string): TheoryAnswer {
  return { cardId, grade: correct ? 3 : 1, correct, sure, at }
}

function log(...answers: TheoryAnswer[]): TheoryLog {
  return { version: 1, answers }
}

const JETZT = new Date("2026-09-10T12:00:00.000Z")

describe("cardStates", () => {
  it("ist ohne Antworten leer", () => {
    expect(cardStates(log()).size).toBe(0)
  })

  it("spielt Antworten in Zeitreihenfolge ab, nicht in Listenreihenfolge", () => {
    // Genau der Fall nach einem Abgleich: zwei Geräte, deren Einträge
    // verschmolzen wurden und dabei durcheinandergeraten sind.
    const geordnet = log(
      antwort("a", 3, "2026-09-01T10:00:00Z"),
      antwort("a", 1, "2026-09-03T10:00:00Z"),
      antwort("a", 3, "2026-09-05T10:00:00Z"),
    )
    const gemischt = log(
      antwort("a", 3, "2026-09-05T10:00:00Z"),
      antwort("a", 3, "2026-09-01T10:00:00Z"),
      antwort("a", 1, "2026-09-03T10:00:00Z"),
    )
    expect(cardStates(gemischt).get("a")).toEqual(cardStates(geordnet).get("a"))
  })

  it("überspringt einen unlesbaren Zeitstempel, statt alles zu verlieren", () => {
    const stand = cardStates(
      log(antwort("a", 3, "kaputt"), antwort("b", 3, "2026-09-01T10:00:00Z")),
    )
    expect(stand.has("a")).toBe(false)
    expect(stand.has("b")).toBe(true)
  })

  it("hält Karten auseinander", () => {
    const stand = cardStates(
      log(antwort("a", 4, "2026-09-01T10:00:00Z"), antwort("b", 1, "2026-09-01T10:00:00Z")),
    )
    expect(stand.get("a")!.stability).toBeGreaterThan(stand.get("b")!.stability!)
  })
})

describe("dueCards", () => {
  const karten = [karte("a"), karte("b"), karte("c")]

  it("gibt neue Karten zurück, wenn nichts beantwortet wurde", () => {
    const faellig = dueCards(karten, log(), JETZT)
    expect(faellig).toHaveLength(3)
    expect(faellig.every((eintrag) => eintrag.state === null)).toBe(true)
  })

  it("lässt weg, was noch nicht dran ist", () => {
    // Gerade eben mit "Leicht" beantwortet — kommt so schnell nicht wieder.
    const faellig = dueCards(karten, log(antwort("a", 4, JETZT.toISOString())), JETZT)
    expect(faellig.map((eintrag) => eintrag.card.id)).toEqual(["b", "c"])
  })

  it("stellt Fälliges vor Neues", () => {
    // Sonst sammelt man Neues an, während der Rückstand wächst.
    const vorWochen = "2026-08-01T10:00:00Z"
    const faellig = dueCards(karten, log(antwort("c", 1, vorWochen)), JETZT)
    expect(faellig[0].card.id).toBe("c")
    expect(faellig[0].state).not.toBeNull()
  })

  it("sortiert Fälliges nach dem, was am schlechtesten sitzt", () => {
    const faellig = dueCards(
      karten,
      log(antwort("a", 3, "2026-08-20T10:00:00Z"), antwort("b", 3, "2026-09-08T10:00:00Z")),
      JETZT,
    )
    const ids = faellig.filter((eintrag) => eintrag.state).map((eintrag) => eintrag.card.id)
    // a liegt länger zurück, sitzt also schlechter und kommt zuerst.
    expect(ids[0]).toBe("a")
  })
})

describe("pickCards", () => {
  const karten = [
    karte("rhythmus-1", { technique: "gallop" }),
    karte("lead-1", { technique: "bending" }),
    karte("allgemein-1"),
  ]

  it("nimmt höchstens so viele wie verlangt", () => {
    expect(pickCards(karten, log(), 2)).toHaveLength(2)
  })

  it("zieht passendes Thema vor, ohne den Rest auszuschliessen", () => {
    const gewaehlt = pickCards(karten, log(), 3, { now: JETZT, technique: "bending" })
    expect(gewaehlt[0].id).toBe("lead-1")
    expect(gewaehlt).toHaveLength(3)
  })

  it("ist kein Filter: ohne passende Karte kommt trotzdem etwas", () => {
    const gewaehlt = pickCards(karten, log(), 2, { now: JETZT, technique: "downpicking" })
    expect(gewaehlt).toHaveLength(2)
  })

  it("gibt nichts zurück, wenn alles frisch beantwortet ist", () => {
    const alle = log(...karten.map((k) => antwort(k.id, 4, JETZT.toISOString())))
    expect(pickCards(karten, alle, 4, { now: JETZT })).toHaveLength(0)
  })
})

describe("theorieStand", () => {
  const karten = [karte("a"), karte("b"), karte("c")]

  it("meldet ohne Antworten nichts, statt null Prozent zu behaupten", () => {
    expect(theorieStand(karten, log(), JETZT)).toEqual({
      angefangen: 0,
      sitzen: 0,
      faellig: 0,
      trefferquote: null,
    })
  })

  it("zählt Angefangenes und Fälliges", () => {
    const stand = theorieStand(
      karten,
      log(antwort("a", 3, JETZT.toISOString()), antwort("b", 3, "2026-07-01T10:00:00Z")),
      JETZT,
    )
    expect(stand.angefangen).toBe(2)
    expect(stand.faellig).toBe(1)
  })

  it("nennt eine gerade danebengegangene Karte nicht 'sitzt'", () => {
    // Der Fehler, den die Abrufbarkeit gemacht hätte: unmittelbar nach dem
    // Antworten ist sie immer nahe 100 %, auch nach fünf Reinfällen.
    const gerade = JETZT.toISOString()
    const stand = theorieStand(karten, log(antwort("a", 1, gerade, false)), JETZT)
    expect(stand.angefangen).toBe(1)
    expect(stand.sitzen).toBe(0)
  })

  it("zählt als 'sitzt', was eine Woche überstehen würde", () => {
    // Mehrfach mit Leicht beantwortet, mit wachsenden Abständen.
    const stand = theorieStand(
      karten,
      log(
        antwort("a", 4, "2026-08-01T10:00:00Z"),
        antwort("a", 4, "2026-08-10T10:00:00Z"),
        antwort("a", 4, "2026-08-28T10:00:00Z"),
      ),
      JETZT,
    )
    expect(stand.sitzen).toBe(1)
  })

  it("rechnet die Trefferquote aus den Antworten, nicht aus den Noten", () => {
    const stand = theorieStand(
      karten,
      log(
        antwort("a", 1, "2026-09-01T10:00:00Z", false),
        antwort("a", 3, "2026-09-02T10:00:00Z", true),
        antwort("b", 2, "2026-09-03T10:00:00Z", true),
        antwort("c", 3, "2026-09-04T10:00:00Z", true),
      ),
      JETZT,
    )
    expect(stand.trefferquote).toBe(0.75)
  })
})

describe("answersFor", () => {
  it("gibt die Antworten einer Karte, älteste zuerst", () => {
    const gemischt = log(
      antwort("a", 3, "2026-09-05T10:00:00Z"),
      antwort("b", 3, "2026-09-01T10:00:00Z"),
      antwort("a", 1, "2026-09-02T10:00:00Z"),
    )
    expect(answersFor(gemischt, "a").map((eintrag) => eintrag.at)).toEqual([
      "2026-09-02T10:00:00Z",
      "2026-09-05T10:00:00Z",
    ])
  })
})

describe("Scheinwissen", () => {
  const karten = [karte("a"), karte("b"), karte("c")]
  const jetzt = JETZT.toISOString()

  it("ist nur 'sicher und falsch'", () => {
    expect(istScheinwissen(sicher("a", 3, false, jetzt))).toBe(true)
    expect(istScheinwissen(sicher("a", 3, true, jetzt))).toBe(false)
    expect(istScheinwissen(sicher("a", 2, false, jetzt))).toBe(false)
    expect(istScheinwissen(sicher("a", 1, false, jetzt))).toBe(false)
    // Ohne Angabe wusste die App nichts über die Sicherheit.
    expect(istScheinwissen(antwort("a", 1, jetzt))).toBe(false)
  })

  it("holt die Karte sofort zurück, obwohl FSRS sie auf später gelegt hat", () => {
    const ohne = dueCards(karten, log(sicher("a", 2, false, jetzt)), JETZT)
    expect(ohne.some((eintrag) => eintrag.card.id === "a")).toBe(false)

    const mit = dueCards(karten, log(sicher("a", 3, false, jetzt)), JETZT)
    expect(mit[0].card.id).toBe("a")
    expect(mit[0].state).not.toBeNull()
  })

  it("steht vor dem, was FSRS ohnehin fällig hält", () => {
    const faellig = dueCards(
      karten,
      log(antwort("b", 3, "2026-08-01T10:00:00Z"), sicher("a", 3, false, jetzt)),
      JETZT,
    )
    expect(faellig.map((eintrag) => eintrag.card.id).slice(0, 2)).toEqual(["a", "b"])
  })

  it("endet mit der nächsten Antwort", () => {
    const danach = log(
      sicher("a", 3, false, "2026-09-10T11:00:00Z"),
      sicher("a", 3, true, "2026-09-10T11:30:00Z"),
    )
    expect(dueCards(karten, danach, JETZT).some((eintrag) => eintrag.card.id === "a")).toBe(false)
  })

  it("zählt die letzte Antwort nach Zeit, nicht nach Listenreihenfolge", () => {
    // Nach einem Abgleich liegen die Einträge durcheinander.
    const gemischt = log(
      sicher("a", 3, true, "2026-09-10T11:30:00Z"),
      sicher("a", 3, false, "2026-09-10T11:00:00Z"),
    )
    expect(scheinwissenKarten(karten, gemischt)).toHaveLength(0)
  })

  it("kommt über pickCards noch in derselben Session wieder", () => {
    const gewaehlt = pickCards(karten, log(sicher("b", 3, false, jetzt)), 2, { now: JETZT })
    expect(gewaehlt[0].id).toBe("b")
  })

  it("zählt Karten, nicht Antworten", () => {
    const stand = log(
      sicher("a", 3, false, "2026-09-10T10:00:00Z"),
      sicher("a", 3, false, "2026-09-10T11:00:00Z"),
      sicher("b", 3, false, "2026-09-10T11:00:00Z"),
    )
    expect(scheinwissenKarten(karten, stand).map((k) => k.id).sort()).toEqual(["a", "b"])
  })

  it("lässt die FSRS-Rechnung unberührt", () => {
    const mit = cardStates(log(sicher("a", 3, false, jetzt)))
    const ohne = cardStates(log(sicher("a", 2, false, jetzt)))
    expect(mit.get("a")).toEqual(ohne.get("a"))
  })
})

describe("kalibrierung", () => {
  const t = "2026-09-10T10:00:00Z"

  it("ist ohne Antworten überall null", () => {
    expect(kalibrierung(log())).toEqual({
      1: { n: 0, richtig: 0 },
      2: { n: 0, richtig: 0 },
      3: { n: 0, richtig: 0 },
    })
  })

  it("zählt je Stufe, wie oft es stimmte", () => {
    const k = kalibrierung(
      log(
        sicher("a", 3, true, t),
        sicher("b", 3, true, t),
        sicher("c", 3, false, t),
        sicher("d", 1, false, t),
        sicher("e", 2, true, t),
      ),
    )
    expect(k[3]).toEqual({ n: 3, richtig: 2 })
    expect(k[2]).toEqual({ n: 1, richtig: 1 })
    expect(k[1]).toEqual({ n: 1, richtig: 0 })
  })

  it("lässt Antworten ohne Angabe und den Griffbrett-Trainer draussen", () => {
    const k = kalibrierung(
      log(antwort("a", 3, t), { ...sicher("hals-finden-1-3", 3, true, t) }, sicher("b", 3, true, t)),
    )
    expect(k[3]).toEqual({ n: 1, richtig: 1 })
  })
})

describe("Antwort mit Sicherheit", () => {
  const roh = { cardId: "a", grade: 3, correct: true, at: "2026-09-10T10:00:00Z" }

  it("nimmt alte Logs ohne die Angabe an", () => {
    expect(theoryLogSchema.safeParse({ version: 1, answers: [roh] }).success).toBe(true)
  })

  it("behält die Angabe", () => {
    const geparst = theoryLogSchema.parse({ version: 1, answers: [{ ...roh, sure: 3 }] })
    expect(geparst.answers[0].sure).toBe(3)
  })

  it("weist eine Stufe ausserhalb von 1 bis 3 ab", () => {
    expect(theoryLogSchema.safeParse({ version: 1, answers: [{ ...roh, sure: 4 }] }).success).toBe(false)
  })
})
