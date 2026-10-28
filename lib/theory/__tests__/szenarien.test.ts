import { describe, expect, it } from "vitest"
import { THEORY_CARDS } from "@/lib/theory/cards"
import { INTERVALLE, midiAt, noteAt, TOENE } from "@/lib/theory/fretboard"
import { OKTAVBUND } from "@/lib/theory/hals"
import { SZENARIO_KARTEN } from "@/lib/theory/szenarien"
import { TRANSFER_AB, transferRunde } from "@/lib/theory/transfer"
import { STUFEN, type Griff, type Sicherheit, type Stufe, type TheoryAnswer, type TheoryCard, type TheoryLog } from "@/lib/theory/types"

const g = (saite: number, bund: number) => ({ saite, bund }) as Griff
const karteMit = (id: string) => SZENARIO_KARTEN.find((card) => card.id === id)!
const richtigeStelle = (card: TheoryCard) => card.frage.auswahl!.indexOf((card.frage.richtig as string[])[0])

describe("Szenario-Katalog", () => {
  it("hat zwölf Karten mit eindeutigen Kennungen", () => {
    expect(SZENARIO_KARTEN).toHaveLength(12)
    expect(new Set(SZENARIO_KARTEN.map((card) => card.id)).size).toBe(12)
  })

  it("kollidiert mit keiner Wissenskarte", () => {
    const wissen = new Set(THEORY_CARDS.map((card) => card.id))
    for (const card of SZENARIO_KARTEN) expect(wissen.has(card.id)).toBe(false)
  })

  it("hat in jeder Stufe genau zwei", () => {
    for (const stufe of STUFEN) {
      expect(SZENARIO_KARTEN.filter((card) => card.stufe === stufe.nummer)).toHaveLength(2)
    }
  })

  it.each(SZENARIO_KARTEN.map((card) => [card.id, card] as const))("%s ist vollständig", (_id, card) => {
    expect(card.begriff.length).toBeGreaterThan(2)
    // Wie bei den Wissenskarten: zwei, drei Sätze nach der Antwort.
    expect(card.erklaerung.length).toBeGreaterThan(80)
    expect(card.erklaerung.length).toBeLessThan(700)
    expect(card.frage.art).toBe("auswahl")
    expect(card.frage.auswahl).toHaveLength(4)
    expect(new Set(card.frage.auswahl).size).toBe(4)
    expect(card.frage.richtig).toHaveLength(1)
    expect(card.frage.auswahl).toContain((card.frage.richtig as string[])[0])
  })

  it("legt die richtige Antwort nicht immer an dieselbe Stelle", () => {
    // Roadie hatte sie überall an erster Stelle — die Antwort wäre erratbar.
    const stellen = SZENARIO_KARTEN.map(richtigeStelle)
    expect(new Set(stellen).size).toBeGreaterThanOrEqual(3)
    for (const stelle of [0, 1, 2, 3]) expect(stellen).toContain(stelle)
  })

  it("schreibt Töne englisch, wie die Tabulatur", () => {
    // B ist hier der Ton über A. Deutsche Namen (Fis, Es, H) würden dem
    // widersprechen, und "Es" ist zugleich ein Wort.
    const text = SZENARIO_KARTEN.flatMap((card) => [
      card.frage.text,
      card.erklaerung,
      ...(card.frage.auswahl ?? []),
    ]).join(" ")
    expect(text).not.toMatch(/\b(Fis|Gis|Cis|Dis|Ais)\b/)
    expect(text).not.toMatch(/\bH \(/)
  })

  it("schreibt wie der übrige Katalog: ss statt ß", () => {
    // "grosse Terz", wie in INTERVALLE und in allen Wissenskarten.
    const text = SZENARIO_KARTEN.flatMap((card) => [
      card.begriff,
      card.frage.text,
      card.erklaerung,
      ...(card.frage.auswahl ?? []),
    ]).join(" ")
    expect(text).not.toContain("ß")
  })
})

describe("Was die Szenario-Karten behaupten, stimmt auch", () => {
  it("rf-t01: der 5. Bund der D-Saite ist die leere G-Saite", () => {
    // Saite 4 ist die D-Saite, Saite 3 die G-Saite.
    expect(noteAt(g(4, 5))).toBe(noteAt(g(3, 0)))
    expect(noteAt(g(4, 5))).toBe("G")
    expect(karteMit("rf-t01").frage.richtig).toEqual(["5. Bund"])
  })

  it("rf-t02: derselbe Powerchord-Griff ergibt auf G/B nur sechs statt sieben Halbtöne", () => {
    const abstand = (tief: number, bund: number) => midiAt(g(tief - 1, bund + 2)) - midiAt(g(tief, bund))
    expect(abstand(5, 3)).toBe(7) // A/D-Saite
    expect(abstand(3, 3)).toBe(6) // G/B-Saite
    expect(INTERVALLE[6].name).toMatch(/tritonus/i)
    expect(karteMit("rf-t02").frage.richtig).toEqual(["Tritonus"])
  })

  it("rf-t06: in Drop D liegt E5 in einem Bund, in Standardstimmung nicht", () => {
    const dropD = (bund: number) => 38 + bund
    expect(TOENE[dropD(2) % 12]).toBe("E")
    expect(midiAt(g(5, 2)) - dropD(2)).toBe(7)
    expect(TOENE[dropD(0) % 12]).toBe("D")
    // Standardstimmung: leere E-Saite plus A-Saite im 2. Bund ist ebenfalls E5.
    expect(midiAt(g(5, 2)) - midiAt(g(6, 0))).toBe(7)
  })

  it("rf-t07: zwölf Bünde sind eine Oktave", () => {
    expect(OKTAVBUND).toBe(12)
    expect(midiAt(g(6, 12)) - midiAt(g(6, 0))).toBe(12)
    expect(karteMit("rf-t07").frage.richtig).toEqual(["Leere Saite"])
  })

  it("rf-t08: unter A liegt dieselbe Quinte E als Quarte", () => {
    expect(INTERVALLE[5].name).toMatch(/quarte/i)
    expect(INTERVALLE[7].name).toMatch(/quinte/i)
    expect(5 + 7).toBe(12)
    expect(karteMit("rf-t08").frage.richtig).toEqual(["Quarte"])
  })

  it("rf-t09: Eb ist die ♭5 zu A und liegt zwischen D und E", () => {
    const a = TOENE.indexOf("A")
    expect(TOENE[(a + 6) % 12]).toBe("D#") // = Eb
    expect((a + 6) % 12).toBe((TOENE.indexOf("D") + 1) % 12)
    expect(TOENE[(a + 3) % 12]).toBe("C")
    expect(TOENE[(a + 8) % 12]).toBe("F")
    expect(TOENE[(a + 9) % 12]).toBe("F#")
    expect(karteMit("rf-t09").frage.richtig).toEqual(["Eb (♭5)"])
  })

  it("rf-t12: G einen Ganzton hoch ist der Grundton A", () => {
    expect(TOENE[(TOENE.indexOf("G") + 2) % 12]).toBe("A")
    expect(TOENE[(TOENE.indexOf("D") + 2) % 12]).toBe("E")
    expect(karteMit("rf-t12").frage.richtig).toEqual(["G (♭7)"])
  })
})

// ── Transfer-Runde ────────────────────────────────────────────────────────

const JETZT = new Date("2026-10-28T12:00:00.000Z")
const T = "2026-10-20T10:00:00Z"

function wissen(id: string, stufe: Stufe): TheoryCard {
  return { id, stufe, begriff: id, erklaerung: "…", frage: { art: "eingabe", text: "?", richtig: ["x"] } }
}

function szenario(id: string, stufe: Stufe): TheoryCard {
  return {
    id,
    stufe,
    begriff: id,
    erklaerung: "…",
    frage: { art: "auswahl", text: "?", auswahl: ["a", "b", "c", "d"], richtig: ["a"] },
  }
}

function antwort(cardId: string, at = T, extra: Partial<TheoryAnswer> = {}): TheoryAnswer {
  return { cardId, grade: 3, correct: true, at, ...extra }
}

const log = (...answers: TheoryAnswer[]): TheoryLog => ({ version: 1, answers })

/** Je Stufe drei Wissenskarten, genug für die Schwelle. */
const WISSEN = ([1, 2, 3, 4, 5, 6] as Stufe[]).flatMap((stufe) =>
  [1, 2, 3].map((n) => wissen(`w${stufe}-${n}`, stufe)),
)
const SZENARIEN = ([1, 2, 3, 4, 5, 6] as Stufe[]).flatMap((stufe) => [
  szenario(`s${stufe}-a`, stufe),
  szenario(`s${stufe}-b`, stufe),
])
const alleBegonnen = log(...WISSEN.map((karte) => antwort(karte.id)))

describe("transferRunde", () => {
  it("bleibt leer, solange nichts gelernt ist", () => {
    expect(transferRunde(SZENARIEN, WISSEN, log(), JETZT)).toEqual([])
  })

  it("bietet je Stufe höchstens eine Frage an", () => {
    const runde = transferRunde(SZENARIEN, WISSEN, alleBegonnen, JETZT)
    expect(runde).toHaveLength(6)
    expect(new Set(runde.map((karte) => karte.stufe)).size).toBe(6)
  })

  it("nimmt nur Stufen, in denen genug begonnen ist", () => {
    // Zwei Karten sind zu wenig, drei reichen.
    const wenig = log(
      ...WISSEN.filter((k) => k.stufe === 1).slice(0, TRANSFER_AB - 1).map((k) => antwort(k.id)),
      ...WISSEN.filter((k) => k.stufe === 2).slice(0, TRANSFER_AB).map((k) => antwort(k.id)),
    )
    const runde = transferRunde(SZENARIEN, WISSEN, wenig, JETZT)
    expect(runde.map((karte) => karte.stufe)).toEqual([2])
  })

  it("lässt weg, was gerade frisch beantwortet ist", () => {
    const frisch = log(
      ...alleBegonnen.answers,
      ...SZENARIEN.filter((k) => k.stufe === 3).map((k) => antwort(k.id, JETZT.toISOString(), { grade: 4 })),
    )
    const runde = transferRunde(SZENARIEN, WISSEN, frisch, JETZT)
    expect(runde.some((karte) => karte.stufe === 3)).toBe(false)
    expect(runde).toHaveLength(5)
  })

  it("nimmt innerhalb einer Stufe zuerst das Scheinwissen", () => {
    const sicher: Sicherheit = 3
    const mitSchein = log(
      ...alleBegonnen.answers,
      // s4-b: sicher gewesen und falsch, auf später gelegt, aber sofort wieder dran.
      antwort("s4-b", JETZT.toISOString(), { grade: 1, correct: false, sure: sicher }),
    )
    const runde = transferRunde(SZENARIEN, WISSEN, mitSchein, JETZT)
    expect(runde.find((karte) => karte.stufe === 4)!.id).toBe("s4-b")
  })

  it("mischt, damit die Stufe nicht an der Reihenfolge abzulesen ist", () => {
    const aufsteigend = transferRunde(SZENARIEN, WISSEN, alleBegonnen, JETZT, () => 0.999999)
    const absteigend = transferRunde(SZENARIEN, WISSEN, alleBegonnen, JETZT, () => 0)
    const stufen = (runde: TheoryCard[]) => runde.map((karte) => karte.stufe)
    expect(stufen(aufsteigend)).not.toEqual([1, 2, 3, 4, 5, 6].reverse())
    expect([...stufen(aufsteigend)].sort()).toEqual([1, 2, 3, 4, 5, 6])
    expect([...stufen(absteigend)].sort()).toEqual([1, 2, 3, 4, 5, 6])
    expect(stufen(aufsteigend)).not.toEqual(stufen(absteigend))
  })

  it("ist mit festem Zufall stabil", () => {
    const eins = transferRunde(SZENARIEN, WISSEN, alleBegonnen, JETZT, () => 0.3)
    const zwei = transferRunde(SZENARIEN, WISSEN, alleBegonnen, JETZT, () => 0.3)
    expect(eins.map((k) => k.id)).toEqual(zwei.map((k) => k.id))
  })

  it("zählt den Griffbrett-Trainer nicht als gelernt", () => {
    const nurHals = log(...[1, 2, 3, 4].map((n) => antwort(`hals-finden-1-${n}`)))
    expect(transferRunde(SZENARIEN, WISSEN, nurHals, JETZT)).toEqual([])
  })
})
