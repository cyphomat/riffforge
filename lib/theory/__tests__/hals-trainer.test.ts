import { describe, expect, it } from "vitest"
import { aufnaeher } from "@/lib/session/merch"
import { EMPTY_LOG } from "@/lib/session/types"
import { THEORY_CARDS } from "@/lib/theory/cards"
import { noteAt } from "@/lib/theory/fretboard"
import { BUENDE } from "@/lib/theory/hals"
import {
  benannt,
  FLINK_MS,
  gefunden,
  HALS_PREFIX,
  HALS_STELLEN,
  halsBericht,
  halsId,
  halskarte,
  halsNote,
  halsRunde,
  istHalsAntwort,
  NAMEN_WAHL,
  SAITEN_WAHL,
  ZAEH_MS,
} from "@/lib/theory/hals-trainer"
import { theorieStand } from "@/lib/theory/progress"
import type { Griff, TheoryAnswer, TheoryLog } from "@/lib/theory/types"

const g = (saite: number, bund: number) => ({ saite, bund }) as Griff
const JETZT = new Date("2026-10-14T18:00:00Z")
const vor = (tage: number) => new Date(JETZT.getTime() - tage * 86400e3).toISOString()
const antwort = (cardId: string, grade: 1 | 2 | 3 | 4, tage: number): TheoryAnswer => ({
  cardId,
  grade,
  correct: grade > 1,
  at: vor(tage),
})
const log = (answers: TheoryAnswer[]): TheoryLog => ({ version: 1, answers })

describe("Der Hals als Karten", () => {
  it("kennt zweiundsiebzig Stellen, alle auf dem gezeichneten Hals, ohne Leersaiten", () => {
    expect(HALS_STELLEN).toHaveLength(72)
    expect(new Set(HALS_STELLEN.map((s) => `${s.saite}-${s.bund}`)).size).toBe(72)
    for (const stelle of HALS_STELLEN) {
      expect(stelle.bund).toBeGreaterThanOrEqual(1)
      expect(stelle.bund).toBeLessThanOrEqual(BUENDE)
    }
  })

  it("hat auf jeder Saite jeden Ton genau einmal — eine Frage, eine Stelle", () => {
    for (const saite of [1, 2, 3, 4, 5, 6]) {
      const toene = HALS_STELLEN.filter((s) => s.saite === saite).map(noteAt)
      expect(new Set(toene).size, `Saite ${saite}`).toBe(12)
    }
  })

  it("benennt seine Karten so, dass keine Wissenskarte darunter fällt", () => {
    expect(halsId("finden", g(5, 3))).toBe(`${HALS_PREFIX}finden-5-3`)
    expect(istHalsAntwort({ cardId: halsId("benennen", g(1, 12)) })).toBe(true)
    for (const card of THEORY_CARDS) expect(card.id.startsWith(HALS_PREFIX), card.id).toBe(false)
  })

  it("bietet die Saitenwahl von E und A bis Alle", () => {
    expect(SAITEN_WAHL[0].saiten).toEqual([6, 5])
    expect(SAITEN_WAHL.at(-1)!.saiten).toEqual([6, 5, 4, 3, 2, 1])
    expect(NAMEN_WAHL).toHaveLength(12)
    expect(NAMEN_WAHL.find((n) => n.ton === "A#")?.auch).toBe("Bb")
  })
})

describe("Bewertet über die Zeit", () => {
  it("macht aus Treffer und Sekunden eine Note", () => {
    expect(halsNote(false, 500)).toBe(1)
    expect(halsNote(true, FLINK_MS)).toBe(4)
    expect(halsNote(true, FLINK_MS + 1)).toBe(3)
    expect(halsNote(true, ZAEH_MS)).toBe(3)
    expect(halsNote(true, ZAEH_MS + 1)).toBe(2)
  })

  it("nimmt beim Finden nur die gefragte Saite und den gefragten Ton", () => {
    expect(gefunden(g(5, 3), g(5, 3))).toBe(true)
    // Dasselbe C auf einer anderen Saite ist nicht die Antwort auf „C auf der A-Saite".
    expect(noteAt(g(4, 10))).toBe("C")
    expect(gefunden(g(5, 3), g(4, 10))).toBe(false)
    expect(gefunden(g(5, 3), g(5, 4))).toBe(false)
    expect(benannt(g(6, 6), "A#")).toBe(true)
    expect(benannt(g(6, 6), "B")).toBe(false)
  })
})

describe("Eine Runde", () => {
  it("fängt bei leerem Log mit Stammtönen in tiefen Bünden an", () => {
    const runde = halsRunde(log([]), "finden", [6], 7, { now: JETZT, startwert: 7 })
    expect(runde).toHaveLength(7)
    for (const stelle of runde) expect(stelle.saite).toBe(6)
    // Auf der tiefen E-Saite: F G A B C D E auf 1 3 5 7 8 10 12.
    expect(new Set(runde.map((s) => s.bund))).toEqual(new Set([1, 3, 5, 7, 8, 10, 12]))
  })

  it("mischt die Reihenfolge, damit sie den Hals nicht hinaufläuft", () => {
    const runde = halsRunde(log([]), "finden", [6], 7, { now: JETZT, startwert: 7 })
    const buende = runde.map((s) => s.bund)
    expect(buende).not.toEqual([...buende].sort((a, b) => a - b))
  })

  it("nimmt Fälliges vor Neuem", () => {
    // Vor dreissig Tagen danebengelegen: längst wieder dran.
    const runde = halsRunde(log([antwort(halsId("finden", g(6, 6)), 1, 30)]), "finden", [6], 3, {
      now: JETZT,
      startwert: 3,
    })
    expect(runde).toContainEqual(g(6, 6))
  })

  it("lässt Sitzendes weg, solange es Neues gibt", () => {
    const frisch = [1, 3, 5].map((bund) => antwort(halsId("finden", g(6, bund)), 4, 0))
    const runde = halsRunde(log(frisch), "finden", [6], 5, { now: JETZT })
    for (const bund of [1, 3, 5]) expect(runde).not.toContainEqual(g(6, bund))
  })

  it("trennt die Richtungen — wer findet, kann noch nicht benennen", () => {
    const frisch = [antwort(halsId("finden", g(6, 1)), 4, 0)]
    expect(halskarte(log(frisch), "finden").get("6-1")).toBe("sitzt")
    expect(halskarte(log(frisch), "benennen").get("6-1")).toBe("neu")
    expect(halskarte(log([antwort(halsId("finden", g(6, 1)), 1, 0)]), "finden").get("6-1")).toBe("wackelt")
  })
})

describe("Der Bericht", () => {
  it("zählt Treffer, nimmt den Median und nennt erst Fehler, dann Zähes", () => {
    const bericht = halsBericht([
      { stelle: g(6, 1), richtig: true, ms: 1000 },
      { stelle: g(6, 3), richtig: false, ms: 3000 },
      { stelle: g(6, 5), richtig: true, ms: 9000 },
      { stelle: g(6, 7), richtig: true, ms: 2000 },
    ])
    expect(bericht.richtig).toBe(3)
    expect(bericht.gesamt).toBe(4)
    expect(bericht.medianMs).toBe(2500)
    expect(bericht.nochmal).toEqual([g(6, 3), g(6, 5)])
    expect(halsBericht([]).medianMs).toBeNull()
  })
})

describe("Der Hals zählt nicht als Wissen", () => {
  const hals = HALS_STELLEN.slice(0, 30).map((stelle) => antwort(halsId("finden", stelle), 4, 1))

  it("verdient keinen Wissens-Aufnäher", () => {
    const verdient = aufnaeher(EMPTY_LOG, log(hals), THEORY_CARDS).filter((a) => a.verdient)
    expect(verdient.map((a) => a.id).filter((id) => id.startsWith("wissen"))).toEqual([])
    // Gegenprobe: dieselbe Menge echter Karten verdient ihn.
    const karten = THEORY_CARDS.slice(0, 30).map((card) => antwort(card.id, 4, 1))
    expect(aufnaeher(EMPTY_LOG, log(karten), THEORY_CARDS).some((a) => a.id === "wissen-10" && a.verdient)).toBe(true)
  })

  it("verschiebt die Trefferquote der Wissenskarten nicht", () => {
    const karte = [antwort(THEORY_CARDS[0].id, 1, 1)]
    expect(theorieStand(THEORY_CARDS, log([...karte, ...hals]), JETZT).trefferquote).toBe(0)
    expect(theorieStand(THEORY_CARDS, log(hals), JETZT).trefferquote).toBeNull()
  })
})

describe("Der Hals auf der Kutte", () => {
  const sitzt = (richtung: "finden" | "benennen", stellen: Griff[], tage = 1) =>
    stellen.map((stelle) => antwort(halsId(richtung, stelle), 4, tage))
  const verdient = (antworten: TheoryAnswer[]) =>
    new Set(aufnaeher(EMPTY_LOG, log(antworten), THEORY_CARDS).filter((a) => a.verdient).map((a) => a.id))

  it("zählt zwölf Stellen, die beim Finden eine Woche halten", () => {
    expect(verdient(sitzt("finden", HALS_STELLEN.slice(0, 11))).has("hals-12")).toBe(false)
    expect(verdient(sitzt("finden", HALS_STELLEN.slice(0, 12))).has("hals-12")).toBe(true)
  })

  it("zählt fürs Finden nur das Finden", () => {
    expect(verdient(sitzt("benennen", HALS_STELLEN.slice(0, 20))).has("hals-12")).toBe(false)
  })

  it("verlangt für den Aufnäher nicht nur einen Treffer, sondern eine Woche Halt", () => {
    // Richtig, aber zäh: Note 2 hält noch keine Woche.
    const zaeh = HALS_STELLEN.slice(0, 12).map((stelle) => antwort(halsId("finden", stelle), 2, 1))
    expect(verdient(zaeh).has("hals-12")).toBe(false)
  })

  it("gibt den ganzen Hals und „In- und auswendig“ erst mit allen Stellen", () => {
    const finden = sitzt("finden", HALS_STELLEN)
    const ohneBenennen = verdient(finden)
    expect(ohneBenennen.has("hals-72")).toBe(true)
    expect(ohneBenennen.has("hals-beide")).toBe(false)
    expect(verdient([...finden, ...sitzt("benennen", HALS_STELLEN)]).has("hals-beide")).toBe(true)
    // Und nichts davon wandert ins Wissen.
    expect([...verdient([...finden, ...sitzt("benennen", HALS_STELLEN)])].some((id) => id.startsWith("wissen"))).toBe(false)
  })
})
