import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import {
  datum,
  finde,
  fuer,
  isoLokal,
  motivBild,
  MOTIV_KANTE,
  MOTIVE,
  ostern,
  plusTage,
  satzFuer,
  STANDARD,
  trifft,
  type Anlass,
} from "@/lib/session/anlaesse"

/**
 * Anlässe: welcher Banner gilt an welchem Tag. Reine Logik.
 *
 * Die Datumsregeln stehen zweimal, hier und in Setlist (`js/anlaesse.js`) —
 * die Repos teilen keinen Code. Dieselben Fälle in beiden Tests sind das, was
 * sie zusammenhält: ändert sich dort etwas, fällt es hier nicht erst im
 * Dezember auf.
 */

describe("Ostern (Gauss)", () => {
  it("rechnet den Ostersonntag", () => {
    expect(ostern(2026)).toBe("2026-04-05")
    expect(ostern(2027)).toBe("2027-03-28")
    expect(ostern(2028)).toBe("2028-04-16")
  })

  it("rechnet Tage davor und danach", () => {
    expect(datum({ ostern: -3 }, 2026)).toBe("2026-04-02")
    expect(datum({ ostern: 1 }, 2026)).toBe("2026-04-06")
    // Gründonnerstag liegt 2027 noch im März.
    expect(datum({ ostern: -3 }, 2027)).toBe("2027-03-25")
  })
})

describe("Regeln", () => {
  it("fix: ein festes Datum", () => {
    expect(datum({ fix: [12, 28] }, 2026)).toBe("2026-12-28")
  })

  it("fix: der 29.2. wird im Nichtschaltjahr zum 28.2.", () => {
    expect(datum({ fix: [2, 29] }, 2027)).toBe("2027-02-28")
    expect(datum({ fix: [2, 29] }, 2028)).toBe("2028-02-29")
  })

  it("nth: der n-te Wochentag im Monat, -1 für den letzten", () => {
    expect(datum({ nth: { monat: 10, wochentag: 5, n: -1 } }, 2026)).toBe("2026-10-30")
    expect(datum({ nth: { monat: 11, wochentag: 5, n: -1 } }, 2026)).toBe("2026-11-27")
    expect(datum({ nth: { monat: 3, wochentag: 1, n: 1 } }, 2026)).toBe("2026-03-02")
    expect(datum({ nth: { monat: 11, wochentag: 4, n: 4 } }, 2026)).toBe("2026-11-26")
  })

  it("nth: einen fünften Freitag gibt es nicht immer", () => {
    expect(datum({ nth: { monat: 2, wochentag: 5, n: 5 } }, 2026)).toBeNull()
  })

  it("datum: einmalig, nur im richtigen Jahr", () => {
    expect(datum({ datum: "2027-06-05" }, 2027)).toBe("2027-06-05")
    expect(datum({ datum: "2027-06-05" }, 2028)).toBeNull()
  })

  it("ohne oder mit unbekannter Regel gibt es nichts", () => {
    expect(datum(null, 2026)).toBeNull()
    expect(datum({ foo: 1 } as never, 2026)).toBeNull()
  })

  it("plusTage geht über den Monats- und Jahreswechsel", () => {
    expect(plusTage("2026-12-31", 1)).toBe("2027-01-01")
    expect(plusTage("2026-03-01", -1)).toBe("2026-02-28")
  })
})

describe("Phasen", () => {
  const weihnachten = finde("weihnachten")!

  it("Weihnachten läuft vom 1. bis zum 26.12.", () => {
    expect(trifft(weihnachten, "2026-11-30")).toBe(false)
    expect(trifft(weihnachten, "2026-12-01")).toBe(true)
    expect(trifft(weihnachten, "2026-12-24")).toBe(true)
    expect(trifft(weihnachten, "2026-12-26")).toBe(true)
    expect(trifft(weihnachten, "2026-12-27")).toBe(false)
  })

  it("darf über den Jahreswechsel laufen", () => {
    const wechsel: Anlass = {
      id: "x",
      typ: "phase",
      name: "x",
      saetze: ["x"],
      bild: ["tannenbaum"],
      von: { fix: [12, 20] },
      bis: { fix: [1, 5] },
    }
    expect(trifft(wechsel, "2026-12-19")).toBe(false)
    expect(trifft(wechsel, "2026-12-31")).toBe(true)
    expect(trifft(wechsel, "2027-01-03")).toBe(true)
    expect(trifft(wechsel, "2027-01-05")).toBe(true)
    expect(trifft(wechsel, "2027-01-06")).toBe(false)
  })

  it("darf an Ostern hängen, auch wenn Gründonnerstag im März liegt", () => {
    const osterzeit: Anlass = {
      id: "o",
      typ: "phase",
      name: "o",
      saetze: ["o"],
      bild: ["geschenk"],
      von: { ostern: -3 },
      bis: { ostern: 1 },
    }
    expect(trifft(osterzeit, "2026-04-01")).toBe(false)
    expect(trifft(osterzeit, "2026-04-02")).toBe(true)
    expect(trifft(osterzeit, "2026-04-06")).toBe(true)
    expect(trifft(osterzeit, "2026-04-07")).toBe(false)
    expect(trifft(osterzeit, "2027-03-25")).toBe(true)
  })

  it("trifft nie, wenn das Ende fehlt", () => {
    const halb: Anlass = { id: "k", typ: "phase", name: "k", saetze: ["k"], bild: ["kerze"], von: { fix: [1, 1] } }
    expect(trifft(halb, "2026-01-01")).toBe(false)
  })
})

describe("Rang", () => {
  const basis = { name: "n", saetze: ["s"], bild: ["kerze" as const] }
  const phase: Anlass = { ...basis, id: "p", typ: "phase", von: { fix: [12, 1] }, bis: { fix: [12, 31] } }
  const tag: Anlass = { ...basis, id: "t", typ: "tag", regel: { fix: [12, 28] } }
  const gedenk: Anlass = { ...basis, id: "g", typ: "gedenk", regel: { fix: [12, 28] } }

  it("nur Phase", () => {
    expect(fuer("2026-12-28", [phase])!.id).toBe("p")
  })

  it("Einzeltag vor Phase", () => {
    expect(fuer("2026-12-28", [phase, tag])!.id).toBe("t")
  })

  it("Gedenktag vor Einzeltag und Phase, in jeder Reihenfolge der Liste", () => {
    expect(fuer("2026-12-28", [phase, tag, gedenk])!.id).toBe("g")
    expect(fuer("2026-12-28", [gedenk, tag, phase])!.id).toBe("g")
  })

  it("an einem anderen Tag gilt wieder die Phase", () => {
    expect(fuer("2026-12-29", [phase, tag, gedenk])!.id).toBe("p")
  })

  it("nichts los, unbekannter Typ und leere Liste ergeben nichts", () => {
    expect(fuer("2026-10-28", [phase, tag, gedenk])).toBeNull()
    expect(fuer("2026-12-28", [{ ...basis, id: "z", typ: "quatsch", regel: { fix: [12, 28] } } as never])).toBeNull()
    expect(fuer("2026-12-28", [])).toBeNull()
  })
})

describe("Der Katalog", () => {
  it("zeigt am 28.10.2026 nichts und am 1.12.2026 Weihnachten", () => {
    expect(fuer("2026-10-28")).toBeNull()
    expect(fuer("2026-12-01")!.id).toBe("weihnachten")
  })

  it("macht Lemmy (28.12.) und Ozzy (22.7.) zu schlichten Gedenktagen", () => {
    expect(fuer("2026-12-28")!.id).toBe("lemmy")
    expect(fuer("2026-07-22")!.id).toBe("ozzy")
    expect(finde("lemmy")!.typ).toBe("gedenk")
    expect(finde("ozzy")!.typ).toBe("gedenk")
  })

  it("lässt Weihnachten nach dem 26.12. enden, Lemmy aber stehen", () => {
    expect(fuer("2026-12-27")).toBeNull()
    expect(fuer("2026-12-28")!.id).toBe("lemmy")
  })

  it("hat eindeutige Kennungen", () => {
    expect(new Set(STANDARD.map((a) => a.id)).size).toBe(STANDARD.length)
  })

  it("gibt jedem Anlass einen Namen, Sätze und Motive, die es gibt", () => {
    for (const a of STANDARD) {
      expect(a.name.length, a.id).toBeGreaterThan(2)
      expect(a.saetze.length, a.id).toBeGreaterThan(0)
      for (const satz of a.saetze) expect(satz.length, a.id).toBeGreaterThan(10)
      expect(a.bild.length, a.id).toBeGreaterThan(0)
      for (const motiv of a.bild) expect(MOTIVE, a.id).toContain(motiv)
    }
  })

  it("gibt jedem Anlass einen Aufnäher mit Titel und Satz", () => {
    for (const a of STANDARD) {
      expect(a.patch?.titel.length, a.id).toBeGreaterThan(2)
      expect(a.patch?.text.length, a.id).toBeGreaterThan(10)
    }
  })

  it("schreibt wie der übrige Text: ss statt ß", () => {
    const text = STANDARD.flatMap((a) => [a.name, a.patch?.titel, a.patch?.text, ...a.saetze]).join(" ")
    expect(text).not.toContain("ß")
  })

  it("hält Gedenktage schlicht: ein Satz und ein Motiv", () => {
    for (const a of STANDARD.filter((x) => x.typ === "gedenk")) {
      expect(a.saetze, a.id).toHaveLength(1)
      expect(a.bild, a.id).toHaveLength(1)
    }
  })
})

describe("Sätze", () => {
  const weihnachten = finde("weihnachten")!

  it("wechseln mit dem Tag des Monats", () => {
    expect(satzFuer(weihnachten, "2026-12-01")).toBe(weihnachten.saetze[1])
    expect(satzFuer(weihnachten, "2026-12-03")).toBe(weihnachten.saetze[0])
    expect(satzFuer(weihnachten, "2026-12-05")).toBe(weihnachten.saetze[2])
  })

  it("sind bei einem einzelnen Satz immer derselbe", () => {
    const lemmy = finde("lemmy")!
    expect(satzFuer(lemmy, "2026-12-28")).toBe(lemmy.saetze[0])
  })
})

describe("isoLokal", () => {
  it("nimmt den lokalen Tag, nicht UTC", () => {
    expect(isoLokal(new Date(2026, 11, 1, 0, 30))).toBe("2026-12-01")
    expect(isoLokal(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31")
  })
})

describe("Die Bilder der Anlässe", () => {
  /** Breite und Höhe aus dem PNG-Kopf — reicht, um zu sehen, dass das Bild so gross ist, wie es gezeichnet wird. */
  function groesse(pfad: string): [number, number] {
    const kopf = readFileSync(pfad)
    expect(kopf.subarray(1, 4).toString()).toBe("PNG")
    return [kopf.readUInt32BE(16), kopf.readUInt32BE(20)]
  }

  it.each(MOTIVE.map((id) => [id] as const))("%s liegt als Datei da, 15 × 15", (id) => {
    const pfad = join(process.cwd(), "public", motivBild(id))
    expect(existsSync(pfad), id).toBe(true)
    expect(groesse(pfad), id).toEqual([MOTIV_KANTE, MOTIV_KANTE])
  })
})
