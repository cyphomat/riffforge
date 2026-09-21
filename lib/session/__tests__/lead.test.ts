import { describe, expect, it } from "vitest"
import { DRILLS } from "../drills"
import {
  BOX_STANDARD,
  GRUNDTOENE,
  LAGEN,
  LEAD_DRILL_ID,
  SITZT_AB,
  boxBeschreibung,
  boxVorhanden,
  istLead,
  mitLick,
  naechsterSeed,
} from "../lead"
import { baueLick } from "@/lib/theory/lick"
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

/**
 * Jede wählbare Box muss am Hals auch existieren.
 *
 * Zwölf Grundtöne mal fünf Lagen sind sechzig Kombinationen — die Sorte
 * Menge, in der eine kaputte niemandem auffiele, bis sie jemand wählt und
 * ein Lick ohne Töne bekommt.
 */
describe("Boxen", () => {
  const alle = GRUNDTOENE.flatMap((grundton) => LAGEN.map((lage) => ({ grundton, lage })))

  it("deckt zwölf Grundtöne mal fünf Lagen ab", () => {
    expect(alle).toHaveLength(60)
  })

  it.each(alle)("$grundton Lage $lage liegt am Hals", (box) => {
    expect(boxVorhanden(box)).toBe(true)
  })

  it.each(alle)("$grundton Lage $lage ergibt ein spielbares Lick", (box) => {
    const lick = baueLick(7, box.grundton, box.lage)
    expect(lick.noten.length).toBeGreaterThan(4)
    const buende = lick.noten.map((n) => n.griff.bund)
    // Dieselbe Griffweite wie überall: eine Box, die vier Bünde überschreitet,
    // wäre keine Lage mehr.
    expect(Math.max(...buende) - Math.min(...buende)).toBeLessThanOrEqual(4)
  })

  it("nennt in der Beschreibung den tiefsten Bund", () => {
    // Das ist die Auskunft, die beim Greifen zählt — „Lage 3" sagt nichts.
    expect(boxBeschreibung({ grundton: "A", lage: 1 })).toContain("ab Bund 5")
    // Die Lagen laufen im Kreis: bei A-Moll liegt Lage 4 zuunterst.
    expect(boxBeschreibung({ grundton: "A", lage: 4 })).toContain("ab Bund 0")
  })

  it("schreibt die Box in den Titel", () => {
    const drill = DRILLS.find((d) => d.id === LEAD_DRILL_ID)!
    const titel = mitLick(drill, 1, { grundton: "D", lage: 3 }).title
    // Ausgeschrieben: `.display` versalisiert, und „DM" ist keine Tonart.
    expect(titel).toContain("D-Moll")
    expect(titel).not.toContain("Dm")
    expect(titel).toContain("Lage 3")
  })

  it("baut in verschiedenen Boxen verschiedene Licks", () => {
    const drill = DRILLS.find((d) => d.id === LEAD_DRILL_ID)!
    const a = mitLick(drill, 1, { grundton: "A", lage: 1 }).tab
    const e = mitLick(drill, 1, { grundton: "E", lage: 1 }).tab
    expect(a).not.toBe(e)
  })

  it("nimmt A-Moll Lage 1 als Standard", () => {
    expect(BOX_STANDARD).toEqual({ grundton: "A", lage: 1 })
  })
})
