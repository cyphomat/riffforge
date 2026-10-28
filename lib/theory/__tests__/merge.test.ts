import { describe, expect, it } from "vitest"
import { mergeTheoryLogs } from "@/lib/theory/merge"
import { cardStates } from "@/lib/theory/progress"
import type { TheoryAnswer, TheoryLog } from "@/lib/theory/types"

const a = (cardId: string, at: string): TheoryAnswer => ({ cardId, grade: 3, correct: true, at })
const log = (...answers: TheoryAnswer[]): TheoryLog => ({ version: 1, answers })

describe("mergeTheoryLogs", () => {
  it("vereinigt beide Seiten", () => {
    const links = log(a("x", "2026-09-01T10:00:00Z"))
    const rechts = log(a("y", "2026-09-02T10:00:00Z"))
    expect(mergeTheoryLogs(links, rechts).answers).toHaveLength(2)
  })

  it("zählt dieselbe Antwort nur einmal", () => {
    const eine = a("x", "2026-09-01T10:00:00Z")
    expect(mergeTheoryLogs(log(eine), log(eine)).answers).toHaveLength(1)
  })

  it("hält zwei Anläufe an einem Tag auseinander", () => {
    const merged = mergeTheoryLogs(
      log(a("x", "2026-09-01T10:00:00Z")),
      log(a("x", "2026-09-01T18:30:00Z")),
    )
    expect(merged.answers).toHaveLength(2)
  })

  it("sortiert nach Zeit, unabhängig von der Reihenfolge der Seiten", () => {
    const merged = mergeTheoryLogs(
      log(a("x", "2026-09-05T10:00:00Z"), a("y", "2026-09-01T10:00:00Z")),
      log(a("z", "2026-09-03T10:00:00Z")),
    )
    expect(merged.answers.map((antwort) => antwort.cardId)).toEqual(["y", "z", "x"])
  })

  it("ist in beiden Richtungen dasselbe", () => {
    const links = log(a("x", "2026-09-01T10:00:00Z"), a("y", "2026-09-04T10:00:00Z"))
    const rechts = log(a("y", "2026-09-04T10:00:00Z"), a("z", "2026-09-02T10:00:00Z"))
    expect(mergeTheoryLogs(links, rechts)).toEqual(mergeTheoryLogs(rechts, links))
  })

  it("bringt zwei Geräte auf denselben Kartenstand", () => {
    // Der eigentliche Punkt: der Stand wird abgespielt, also fällt er nach dem
    // Verschmelzen auf beiden Seiten gleich aus — ohne dass jemand gewinnt.
    const handy = log(a("x", "2026-09-01T10:00:00Z"), a("x", "2026-09-04T10:00:00Z"))
    const mac = log(a("x", "2026-09-02T10:00:00Z"), a("y", "2026-09-03T10:00:00Z"))

    const aufDemHandy = cardStates(mergeTheoryLogs(handy, mac))
    const aufDemMac = cardStates(mergeTheoryLogs(mac, handy))

    expect(aufDemHandy.get("x")).toEqual(aufDemMac.get("x"))
    expect(aufDemHandy.get("y")).toEqual(aufDemMac.get("y"))
  })

  it("kommt mit einer leeren Seite klar", () => {
    const voll = log(a("x", "2026-09-01T10:00:00Z"))
    expect(mergeTheoryLogs({ version: 1, answers: [] }, voll)).toEqual(voll)
  })

  it("behält die Sicherheit einer Antwort", () => {
    const mit: TheoryAnswer = { cardId: "x", grade: 1, correct: false, sure: 3, at: "2026-09-01T10:00:00Z" }
    expect(mergeTheoryLogs(log(mit), log()).answers[0].sure).toBe(3)
    expect(mergeTheoryLogs(log(), log(mit)).answers[0].sure).toBe(3)
  })
})
