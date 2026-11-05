import { describe, expect, it } from "vitest"
import { DROPS } from "../drops-daten"
import {
  FREISCHALTUNG,
  dropSchema,
  dropStand,
  dropStaende,
  sichtbar,
  sichtbareDrops,
  uebungstage,
  type Drop,
} from "../drops"
import { GRUND_SPRUECHE, heuteSpruch, uebungsSpruch } from "../roadie"
import { ALLE_DRILLS_BY_ID } from "../drills"
import type { DrillResult, PracticeLog } from "../types"

/**
 * Drops sind Daten. Was hier durchfällt, kommt nicht auf die Seite —
 * wie bei den Songs. Alle Logs sind erfunden.
 */

const RIFF = ALLE_DRILLS_BY_ID["riff-ironclad"]

function tage(...t: string[]): PracticeLog {
  return {
    version: 1,
    results: t.map((tag) => ({ drillId: RIFF.id, technique: RIFF.technique, bpm: 80, rating: 3, seconds: 150, at: `${tag}T12:00:00` })),
  }
}

const ersteTage = (n: number) => Array.from({ length: n }, (_, i) => `2026-11-${String(i + 1).padStart(2, "0")}`)

describe("die Drop-Daten", () => {
  it("jeder Drop erfüllt das Schema", () => {
    for (const d of DROPS) expect(dropSchema.safeParse(d).success, d.id).toBe(true)
  })

  it("IDs sind überall eindeutig", () => {
    const ids = DROPS.flatMap((d) => d.plektren.map((p) => p.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(DROPS.map((d) => d.id)).size).toBe(DROPS.length)
  })

  it("selten und episch tragen Fakt und Quelle", () => {
    for (const d of DROPS)
      for (const p of d.plektren.filter((x) => x.stufe !== "g")) {
        expect(p.fakt, p.id).toBeTruthy()
        expect(p.quelle, p.id).toMatch(/^https:\/\//)
      }
  })

  it("der November hat von jeder Stufe etwas und genau eine Zugabe", () => {
    const d = DROPS.find((x) => x.id === "2026-11")!
    for (const stufe of ["g", "s", "e"] as const) expect(d.plektren.some((p) => p.stufe === stufe)).toBe(true)
    expect(d.plektren.filter((p) => p.zugabe)).toHaveLength(1)
  })
})

describe("Schema", () => {
  const gut = DROPS[0]
  const mit = (aenderung: (d: Drop) => Drop) => dropSchema.safeParse(aenderung(structuredClone(gut))).success

  it("lehnt selten ohne Quelle ab", () => {
    expect(mit((d) => ({ ...d, plektren: d.plektren.map((p) => (p.id === "s-mesa" ? { ...p, quelle: undefined } : p)) }))).toBe(false)
  })
  it("lehnt Quellen ohne https ab", () => {
    expect(mit((d) => ({ ...d, plektren: d.plektren.map((p) => (p.id === "s-mesa" ? { ...p, quelle: "http://x.de" } : p)) }))).toBe(false)
  })
  it("lehnt ein Datum ausserhalb des Monats ab", () => {
    expect(mit((d) => ({ ...d, datum: "2026-12-01" }))).toBe(false)
  })
  it("lehnt doppelte Plektrum-IDs und zwei Zugaben ab", () => {
    expect(mit((d) => ({ ...d, plektren: [...d.plektren, d.plektren[0]] }))).toBe(false)
    expect(mit((d) => ({ ...d, plektren: d.plektren.map((p) => (p.stufe === "e" ? { ...p, zugabe: true } : p)) }))).toBe(false)
  })
  it("lehnt eine kaputte Farbe ab", () => {
    expect(mit((d) => ({ ...d, plektren: d.plektren.map((p, i) => (i === 0 ? { ...p, farbe: "rot" } : p)) }))).toBe(false)
  })
})

describe("Sichtbarkeit", () => {
  it("ein Drop erscheint ab seinem Datum", () => {
    const d = DROPS[0]
    expect(sichtbar(d, "2026-10-31")).toBe(false)
    expect(sichtbar(d, "2026-11-01")).toBe(true)
    expect(sichtbareDrops(DROPS, "2026-10-31")).toHaveLength(0)
  })
})

describe("Freischaltung", () => {
  const drop = DROPS[0]
  const anzahl = (n: number) => dropStand(drop, tage(...ersteTage(n))).verdient

  it("zählt Übungstage im Monat, nicht Einträge", () => {
    expect(uebungstage(tage("2026-11-02", "2026-11-02", "2026-11-03"), "2026-11")).toBe(2)
    expect(uebungstage(tage("2026-10-30", "2026-12-01"), "2026-11")).toBe(0)
  })

  it("schaltet gewöhnlich, selten und episch an ihren Schwellen frei", () => {
    const gewoehnlich = drop.plektren.filter((p) => p.stufe === "g").length
    const selten = drop.plektren.filter((p) => p.stufe === "s").length
    const episch = drop.plektren.filter((p) => p.stufe === "e" && !p.zugabe).length
    expect(anzahl(FREISCHALTUNG.g - 1)).toBe(0)
    expect(anzahl(FREISCHALTUNG.g)).toBe(gewoehnlich)
    expect(anzahl(FREISCHALTUNG.s)).toBe(gewoehnlich + selten)
    expect(anzahl(FREISCHALTUNG.e)).toBe(gewoehnlich + selten + episch)
  })

  it("die Zugabe zählt nicht mit und erscheint erst nach allen anderen", () => {
    const fast = dropStand(drop, tage(...ersteTage(FREISCHALTUNG.e - 1)))
    expect(fast.zugabe).toBeNull()
    expect(fast.gesamt).toBe(drop.plektren.length - 1)
    const alle = dropStand(drop, tage(...ersteTage(FREISCHALTUNG.e)))
    expect(alle.verdient).toBe(alle.gesamt)
    expect(alle.zugabe?.zugabe).toBe(true)
  })

  it("ein vergangener Monat bleibt, wie er war", () => {
    const l = tage(...ersteTage(5), "2026-12-05", "2026-12-06")
    expect(dropStand(drop, l).tage).toBe(5)
    expect(dropStaende(DROPS, l, "2027-03-01")).toHaveLength(1)
  })
})

describe("Roadie", () => {
  const drops = DROPS
  const lauf = (bpm: number, rating: 1 | 2 | 3 | 4): DrillResult[] => [
    { drillId: RIFF.id, technique: RIFF.technique, bpm, rating, seconds: 150, at: "2026-11-05T12:00:00" },
  ]

  it("wählt am selben Tag denselben Satz", () => {
    expect(uebungsSpruch(lauf(80, 3), "2026-11-05", drops)).toBe(uebungsSpruch(lauf(80, 3), "2026-11-05", drops))
    expect(heuteSpruch(tage("2026-11-05"), "2026-11-06", drops)).toBe(heuteSpruch(tage("2026-11-05"), "2026-11-06", drops))
  })

  it("liefert immer einen kurzen Satz, auch ohne Daten", () => {
    expect(heuteSpruch({ version: 1, results: [] }, "2026-11-06", [])).toBeTruthy()
    expect(uebungsSpruch([], "2026-11-06", [])).toBeTruthy()
  })

  it("nennt das Riff und das Tempo, wenn der Kommentar zur Übung passt", () => {
    const saetze = new Set<string>()
    for (let i = 1; i <= 28; i += 1) {
      saetze.add(uebungsSpruch(lauf(RIFF.targetBpm, 4), `2026-11-${String(i).padStart(2, "0")}`, drops))
    }
    expect([...saetze].some((s) => s.includes(RIFF.title) && s.includes(`${RIFF.targetBpm} BPM`))).toBe(true)
    expect([...saetze].every((s) => s.length <= 160)).toBe(true)
  })

  it("sagt bei zähen Runden nichts Schönes", () => {
    for (let i = 1; i <= 28; i += 1) {
      const s = uebungsSpruch(lauf(60, 1), `2026-11-${String(i).padStart(2, "0")}`, [])
      if (s.includes(RIFF.title)) expect(s).toContain("zäh")
    }
  })

  it("alle Grundsprüche sind kurz", () => {
    for (const s of GRUND_SPRUECHE) expect(s.length).toBeLessThanOrEqual(160)
  })
})
