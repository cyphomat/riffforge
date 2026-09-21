import { describe, expect, it } from "vitest"
import { DRILLS } from "../drills"
import { LEAD_DRILL_ID, SITZT_AB, istLead, mitLick, naechsterSeed } from "../lead"
import { RATINGS } from "../types"

/**
 * Der Generator ist der Drill, das Lick ist der Inhalt.
 *
 * Aller Fortschritt hängt an `drillId` — wäre jedes Lick ein eigener Drill,
 * hätte keines eine Tempokurve. Diese Prüfungen halten die Teilung fest.
 */
describe("Lick-Schmiede", () => {
  const katalog = DRILLS.find((drill) => drill.id === LEAD_DRILL_ID)!

  it("steht als Drill im Katalog", () => {
    expect(katalog, `${LEAD_DRILL_ID} fehlt`).toBeDefined()
    expect(istLead(katalog)).toBe(true)
    expect(DRILLS.filter(istLead)).toHaveLength(1)
  })

  it("behauptet im Katalog nichts über das Lick", () => {
    // Eine Tabulatur im Katalog wäre eine Aussage über ein Lick, das es zu
    // diesem Zeitpunkt noch gar nicht gibt.
    expect(katalog.tab).toBeUndefined()
    expect(katalog.why).toBeUndefined()
  })

  it("füllt Tabulatur und Erklärung erst beim Einsetzen", () => {
    const gefuellt = mitLick(katalog, 7)
    expect(gefuellt.tab).toContain("e|")
    expect(gefuellt.why).toContain("Pentatonik")
    // Alles andere bleibt, wie es war — vor allem die Nummer, an der der
    // Fortschritt hängt.
    expect(gefuellt.id).toBe(katalog.id)
    expect(gefuellt.startBpm).toBe(katalog.startBpm)
    expect(gefuellt.targetBpm).toBe(katalog.targetBpm)
  })

  it("gibt zu jedem Startwert dasselbe Lick", () => {
    expect(mitLick(katalog, 42).tab).toBe(mitLick(katalog, 42).tab)
    expect(mitLick(katalog, 42).tab).not.toBe(mitLick(katalog, 43).tab)
  })

  it("zählt den Startwert nachvollziehbar weiter", () => {
    // Fortlaufend statt zufällig: wer ein Lick noch einmal sehen will,
    // zählt zurück.
    expect(naechsterSeed(7)).toBe(8)
  })

  it("hängt die Schwelle an eine Note, die es wirklich gibt", () => {
    const note = RATINGS.find((r) => r.value === SITZT_AB)
    expect(note, `Bewertung ${SITZT_AB} fehlt in RATINGS`).toBeDefined()
    // Und sie muss die untere Grenze von „ging gut" sein, nicht die oberste:
    // sonst käme das nächste Lick erst, wenn dieses mühelos ist.
    expect(SITZT_AB).toBeLessThan(Math.max(...RATINGS.map((r) => r.value)))
  })
})
