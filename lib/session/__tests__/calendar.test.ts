import { describe, expect, it } from "vitest"
import { practiceCalendar, weeksFor } from "../calendar"
import type { DrillResult, PracticeLog } from "../types"

/** Dienstag, 10. März 2026. */
const NOW = new Date(2026, 2, 10, 21, 0, 0)

function on(day: string, seconds = 300): DrillResult {
  return {
    drillId: "tech-gallop",
    technique: "gallop",
    bpm: 100,
    rating: 3,
    seconds,
    at: new Date(`${day}T20:00:00`).toISOString(),
  }
}

function log(...results: DrillResult[]): PracticeLog {
  return { version: 1, results }
}

describe("practiceCalendar", () => {
  it("fills a whole rectangle of weeks", () => {
    expect(practiceCalendar(log(), { weeks: 16, now: NOW })).toHaveLength(112)
  })

  it("starts on a Monday so the rows are weekdays", () => {
    const days = practiceCalendar(log(), { weeks: 4, now: NOW })
    expect(days[0].date.getDay()).toBe(1)
  })

  it("runs to the Sunday of the current week, not to today", () => {
    // Sonst franst die letzte Spalte aus.
    const days = practiceCalendar(log(), { weeks: 4, now: NOW })
    expect(days[days.length - 1].date.getDay()).toBe(0)
  })

  it("marks today exactly once", () => {
    const days = practiceCalendar(log(), { weeks: 8, now: NOW })
    expect(days.filter((day) => day.isToday)).toHaveLength(1)
    expect(days.find((day) => day.isToday)!.key).toBe("2026-03-10")
  })

  it("marks the rest of the current week as future", () => {
    const days = practiceCalendar(log(), { weeks: 4, now: NOW })
    // Dienstag ist heute, also sind Mittwoch bis Sonntag Zukunft.
    expect(days.filter((day) => day.isFuture)).toHaveLength(5)
  })

  it("sums the minutes of a day across its blocks", () => {
    const days = practiceCalendar(log(on("2026-03-09"), on("2026-03-09"), on("2026-03-09")), {
      weeks: 4,
      now: NOW,
    })
    expect(days.find((day) => day.key === "2026-03-09")!.minutes).toBe(15)
  })

  it("leaves days without practice at zero", () => {
    const days = practiceCalendar(log(on("2026-03-09")), { weeks: 4, now: NOW })
    expect(days.filter((day) => day.minutes > 0)).toHaveLength(1)
  })

  it("ignores entries older than the window", () => {
    const days = practiceCalendar(log(on("2025-01-01")), { weeks: 4, now: NOW })
    expect(days.every((day) => day.minutes === 0)).toBe(true)
  })

  it("counts a late session for that calendar day", () => {
    const days = practiceCalendar(log(on("2026-03-09", 600)), { weeks: 4, now: NOW })
    const monday = days.find((day) => day.key === "2026-03-09")!
    expect(monday.minutes).toBe(10)
    expect(monday.date.getDay()).toBe(1)
  })
})

/**
 * Der Rückblick wächst mit dem Log.
 *
 * Der Anlass war ein Screenshot: ein Wiedereinsteiger sah hundertzwölf leere
 * Kästchen und darunter „0 von 112 Tagen". Ein Raster, das die halbe Spalte
 * einnimmt, um nichts zu sagen, ist schlimmer als kein Raster.
 */
describe("weeksFor", () => {
  it("zeigt den kleinsten Rahmen, solange nichts im Log steht", () => {
    expect(weeksFor(log(), NOW)).toBe(4)
  })

  it("bleibt beim kleinsten Rahmen, wenn erst diese Woche geübt wurde", () => {
    expect(weeksFor(log(on("2026-03-09")), NOW)).toBe(4)
  })

  it("wächst mit dem ältesten Eintrag", () => {
    // 2026-01-26 ist ein Montag, sechs Wochen vor der laufenden — das Raster
    // muss beide Wochen zeigen, also sieben.
    expect(weeksFor(log(on("2026-01-26")), NOW)).toBe(7)
  })

  it("nimmt den ältesten Eintrag, nicht den ersten in der Liste", () => {
    // Der Log ist append-only, aber nicht garantiert sortiert.
    expect(weeksFor(log(on("2026-03-09"), on("2026-01-26")), NOW)).toBe(7)
  })

  it("deckelt bei vier Monaten", () => {
    expect(weeksFor(log(on("2024-01-01")), NOW)).toBe(16)
  })

  it("zeigt dann auch nur die gewachsenen Kästchen", () => {
    const days = practiceCalendar(log(on("2026-03-09")), { now: NOW })
    expect(days).toHaveLength(4 * 7)
  })
})
