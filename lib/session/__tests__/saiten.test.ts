import { describe, expect, it } from "vitest"
import { dayKey } from "../progress"
import {
  LEERES_SAITENBUCH,
  SAITEN_TAGE,
  SAITEN_UEBUNGSTAGE,
  aufgezogen,
  gespielt,
  saitenBuchSchema,
  saitenStand,
  saitenZeilen,
} from "../saiten"
import type { DrillResult, PracticeLog } from "../types"

// Freitag, 16. Oktober 2026, abends.
const HEUTE = new Date(2026, 9, 16, 21, 0, 0)

function vor(tage: number, stunde = 20): Date {
  const d = new Date(HEUTE)
  d.setDate(d.getDate() - tage)
  d.setHours(stunde, 0, 0, 0)
  return d
}

function block(vorTagen: number, stunde = 20): DrillResult {
  return {
    drillId: "tech-downpicking",
    technique: "downpicking",
    bpm: 120,
    rating: 3,
    seconds: 180,
    at: vor(vorTagen, stunde).toISOString(),
  }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("saitenStand", () => {
  it("says nothing without a noted change", () => {
    expect(saitenStand(log(block(1)), null, HEUTE)).toBeNull()
  })

  it("counts distinct practice days from the change day on, the day itself included", () => {
    const seit = dayKey(vor(10))
    const stand = saitenStand(
      log(block(12), block(11), block(10, 8), block(10, 21), block(4), block(0)),
      seit,
      HEUTE,
    )!
    // Day 10 twice is one day; days 12 and 11 were the old set.
    expect(stand.uebungstage).toBe(3)
    expect(stand.tage).toBe(10)
    expect(stand.faellig).toBe(false)
    expect(stand.grund).toBeNull()
  })

  it("is due after the practice days, however short the time", () => {
    const seit = dayKey(vor(SAITEN_UEBUNGSTAGE))
    const knapp = Array.from({ length: SAITEN_UEBUNGSTAGE - 1 }, (_, i) => block(i))
    expect(saitenStand(log(...knapp), seit, HEUTE)!.faellig).toBe(false)

    const genug = [...knapp, block(SAITEN_UEBUNGSTAGE - 1)]
    const stand = saitenStand(log(...genug), seit, HEUTE)!
    expect(stand.uebungstage).toBe(SAITEN_UEBUNGSTAGE)
    expect(stand.faellig).toBe(true)
    expect(stand.grund).toBe("gespielt")
  })

  it("is due after the calendar days, even when nobody played", () => {
    expect(saitenStand(log(), dayKey(vor(SAITEN_TAGE - 1)), HEUTE)!.faellig).toBe(false)
    const stand = saitenStand(log(), dayKey(vor(SAITEN_TAGE)), HEUTE)!
    expect(stand.tage).toBe(SAITEN_TAGE)
    expect(stand.faellig).toBe(true)
    expect(stand.grund).toBe("alt")
  })

  it("names playing as the reason when both limits are past", () => {
    const viel = Array.from({ length: SAITEN_UEBUNGSTAGE }, (_, i) => block(i * 4))
    const stand = saitenStand(log(...viel), dayKey(vor(SAITEN_TAGE + 20)), HEUTE)!
    expect(stand.grund).toBe("gespielt")
  })

  it("does not count a change noted for a future day as negative age", () => {
    const morgen = new Date(HEUTE)
    morgen.setDate(morgen.getDate() + 1)
    expect(saitenStand(log(block(0)), dayKey(morgen), HEUTE)!.tage).toBe(0)
  })
})

describe("Saiten je Gitarre", () => {
  const rack = ["Wolfgang", "Arrow"]
  const spielLog = log(block(3), block(2), block(1))

  it("liest den Eintrag von früher ohne Gitarre", () => {
    const alt = saitenBuchSchema.parse({ gewechselt: dayKey(vor(2)) })
    expect(alt).toEqual({ gewechselt: dayKey(vor(2)), je: {}, tage: {} })
    const zeilen = saitenZeilen(spielLog, alt, rack, HEUTE)
    expect(zeilen.map((z) => z.gitarre)).toEqual([null, "Wolfgang", "Arrow"])
    expect(zeilen[0].stand!.uebungstage).toBe(2)
  })

  it("löst ihn mit dem ersten Eintrag einer Gitarre ab", () => {
    const buch = aufgezogen({ ...LEERES_SAITENBUCH, gewechselt: dayKey(vor(9)) }, "Wolfgang", dayKey(vor(2)))
    const zeilen = saitenZeilen(spielLog, buch, rack, HEUTE)
    expect(zeilen.map((z) => z.gitarre)).toEqual(rack)
    expect(zeilen[0].stand!.seit).toBe(dayKey(vor(2)))
    expect(zeilen[1].stand).toBeNull()
  })

  it("zählt ab zwei Gitarren nur die Tage, an denen diese dran war", () => {
    let buch = aufgezogen(LEERES_SAITENBUCH, "Wolfgang", dayKey(vor(3)))
    buch = aufgezogen(buch, "Arrow", dayKey(vor(3)))
    buch = gespielt(gespielt(buch, "Wolfgang", dayKey(vor(2))), "Wolfgang", dayKey(vor(2)))
    const [wolfgang, arrow] = saitenZeilen(spielLog, buch, rack, HEUTE)
    expect(wolfgang.stand!.uebungstage).toBe(1)
    expect(arrow.stand!.uebungstage).toBe(0)
  })

  it("zählt mit einer einzigen Gitarre jeden Übungstag", () => {
    const buch = aufgezogen(LEERES_SAITENBUCH, "Wolfgang", dayKey(vor(3)))
    expect(saitenZeilen(spielLog, buch, ["Wolfgang"], HEUTE)[0].stand!.uebungstage).toBe(3)
  })

  it("vergisst beim Wechsel die Tage des alten Satzes", () => {
    let buch = gespielt(LEERES_SAITENBUCH, "Wolfgang", dayKey(vor(5)))
    buch = gespielt(buch, "Wolfgang", dayKey(vor(1)))
    expect(aufgezogen(buch, "Wolfgang", dayKey(vor(1))).tage.Wolfgang).toEqual([dayKey(vor(1))])
  })

  it("kommt ohne Rack mit dem einen Eintrag aus", () => {
    const buch = aufgezogen(LEERES_SAITENBUCH, null, dayKey(vor(2)))
    const zeilen = saitenZeilen(spielLog, buch, [], HEUTE)
    expect(zeilen).toHaveLength(1)
    expect(zeilen[0].stand!.uebungstage).toBe(2)
  })
})
