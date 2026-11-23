import { describe, expect, it } from "vitest"
import { DRILLS, getDrill } from "../../session/drills"
import { SCHLAEGE_JE_TAKT } from "../../audio/drill-ablauf"
import { SPIELWEISEN, figurVon, liesFigur, midiVon } from "../drill-spiel"

/**
 * Der Klang und die Tabulatur eines Drills sind zwei Texte, die dasselbe
 * sagen sollen. Dieser Test hält sie gegeneinander: dieselben Griffe, in
 * derselben Reihenfolge. Wer an einem der beiden dreht, muss den anderen
 * mitnehmen, sonst hört man etwas anderes, als man liest.
 */

const SAITE_ZEICHEN: Record<string, number> = { e: 1, B: 2, G: 3, D: 4, A: 5, E: 6 }

/** Die Griffe einer Tabulatur, nach Zeit geordnet und je Spalte zu einer Gruppe zusammengefasst. */
function tabGruppen(tab: string): string[] {
  const treffer: { system: number; spalte: number; schluessel: string }[] = []
  tab.split(/\n\s*\n/).forEach((system, s) => {
    for (const zeile of system.split("\n")) {
      const m = /^([eBGDAE])\|(.*)\|?$/.exec(zeile)
      if (!m) continue
      const saite = SAITE_ZEICHEN[m[1]]
      for (const g of m[2].matchAll(/1[0-5]|\d|x/g)) {
        treffer.push({ system: s, spalte: g.index ?? 0, schluessel: `${saite}:${g[0]}` })
      }
    }
  })
  treffer.sort((a, b) => a.system - b.system || a.spalte - b.spalte)

  const gruppen: string[][] = []
  let letzte = ""
  for (const t of treffer) {
    const ort = `${t.system}/${t.spalte}`
    if (ort !== letzte) gruppen.push([])
    gruppen[gruppen.length - 1].push(t.schluessel)
    letzte = ort
  }
  return gruppen.map((g) => g.sort().join(","))
}

function figurGruppen(id: string): string[] {
  const figur = figurVon(id)
  if (!figur) throw new Error(`${id} hat keine Figur`)
  return figur.anschlaege.map((a) =>
    a.griffe
      .map((g) => `${g.saite}:${g.bund}`)
      .sort()
      .join(","),
  )
}

describe("Figuren der Drills", () => {
  it("gibt jedem Drill mit Tabulatur einen Klang, ausser Songs und der Lick-Schmiede", () => {
    const ohne = DRILLS.filter((d) => d.tab && !d.song && !SPIELWEISEN[d.id]).map((d) => d.id)
    expect(ohne).toEqual([])
  })

  it("gehört zu Drills, die es gibt und die eine Tabulatur haben", () => {
    for (const id of Object.keys(SPIELWEISEN)) {
      const drill = getDrill(id)
      expect(drill, id).toBeDefined()
      expect(drill?.tab, id).toBeTruthy()
    }
  })

  for (const id of Object.keys(SPIELWEISEN)) {
    it(`${id}: Griffe wie in der Tabulatur, in derselben Reihenfolge`, () => {
      expect(figurGruppen(id)).toEqual(tabGruppen(getDrill(id)?.tab ?? ""))
    })

    it(`${id}: füllt ganze Takte, damit die Schleife im Takt bleibt`, () => {
      const figur = figurVon(id)!
      expect(figur.schritte % (figur.raster * SCHLAEGE_JE_TAKT)).toBe(0)
    })

    it(`${id}: spielt im Raster des Drills`, () => {
      // Ein Drill mit Achtelklick klingt in Achteln oder feiner, nie gröber als der Klick.
      const drill = getDrill(id)!
      expect(SPIELWEISEN[id].raster).toBeGreaterThanOrEqual(drill.subdivision)
    })
  }
})

describe("liesFigur", () => {
  it("lässt die Saite weitergelten, bis eine neue genannt wird", () => {
    const figur = liesFigur({ raster: 1, figur: "6:1 2 3 5:1 2" })
    expect(figur.anschlaege.map((a) => `${a.griffe[0].saite}:${a.griffe[0].bund}`)).toEqual([
      "6:1",
      "6:2",
      "6:3",
      "5:1",
      "5:2",
    ])
  })

  it("baut einen Powerchord aus Grundton, Quinte und Oktave", () => {
    const [akkord] = liesFigur({ raster: 1, figur: "P6:3 . . ." }).anschlaege
    expect(akkord.griffe).toEqual([
      { saite: 6, bund: 3 },
      { saite: 5, bund: 5 },
      { saite: 4, bund: 5 },
    ])
    // G, D, G: Grundton, Quinte, Oktave.
    expect(akkord.griffe.map(midiVon)).toEqual([43, 50, 55])
  })

  it("kennt tote Noten, Legato, Slide und Bending", () => {
    const figur = liesFigur({ raster: 2, figur: "m6:0 x l3 /5 b7" })
    expect(figur.anschlaege.map((a) => [a.dumpf, a.griffe[0].bund, a.gebunden, a.folge])).toEqual([
      [true, 0, false, undefined],
      [false, "x", false, undefined],
      [false, 3, true, undefined],
      [false, 5, false, "slide"],
      [false, 7, false, "bend"],
    ])
  })

  it("zählt leere Schritte mit", () => {
    expect(liesFigur({ raster: 2, figur: "6:0 . . ." }).schritte).toBe(4)
  })

  it("wirft bei Unsinn, statt still etwas anderes zu spielen", () => {
    expect(() => liesFigur({ raster: 1, figur: "6:0 q" })).toThrow()
    expect(() => liesFigur({ raster: 1, figur: "5" })).toThrow(/Saite/)
    expect(() => liesFigur({ raster: 1, figur: "/7 6:0" })).toThrow()
    expect(() => liesFigur({ raster: 1, figur: "P3:2" })).toThrow(/Powerchord/)
    expect(() => liesFigur({ raster: 1, figur: "" })).toThrow()
  })
})
