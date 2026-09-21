import { describe, expect, it } from "vitest"
import { DRILLS } from "../drills"
import { SIEBEN_DRILLS } from "../drills-sieben"
import { buildSession } from "../builder"
import { STIMMUNG, buildSiebenSession, naechsterSiebenBlock } from "../sieben"
import { EMPTY_LOG, type BlockKind, type Drill, type PracticeLog } from "../types"
import {
  HOECHSTER_BUND_SIEBEN,
  SAITENNAMEN_SIEBEN,
  midiSieben,
  tonSieben,
  type Saite7,
} from "@/lib/theory/sieben"
import { TOENE, type Ton } from "@/lib/theory/fretboard"

/**
 * Der Sieben-Saiter-Modus.
 *
 * Zwei Sorten Prüfung: dass der Katalog wirklich siebensaitig ist — eine
 * Übung, die die neue Saite nie benutzt, wäre eine Sechssaiter-Übung im
 * falschen Regal —, und dass er der täglichen Viertelstunde nie in die Quere
 * kommt.
 */

/** Die Tonzeilen einer Tabulatur, ohne die Anmerkungen darunter. */
function saitenZeilen(tab: string): string[] {
  return tab.split("\n").filter((zeile) => /^[eBGDAE]\|/.test(zeile))
}

/** Alle Griffe einer Tabulatur — Saite 1 ist die oberste Zeile. */
function griffeAus(tab: string): Array<{ saite: Saite7; bund: number }> {
  return saitenZeilen(tab).flatMap((zeile, i) =>
    [...zeile.matchAll(/\d+/g)].map((treffer) => ({
      saite: (i + 1) as Saite7,
      bund: Number(treffer[0]),
    })),
  )
}

/** Die Töne einer Tonleiter ab einem Grundton, als Namen. */
function leiter(grundton: Ton, stufen: number[]): Ton[] {
  const wurzel = TOENE.indexOf(grundton)
  return stufen.map((stufe) => TOENE[(wurzel + stufe) % 12])
}

const MOLL = [0, 2, 3, 5, 7, 8, 10]
const MOLL_PENTATONIK = [0, 3, 5, 7, 10]

/** Worin jede Übung steht — Grundlage der Prüfung, dass nichts danebenliegt. */
const TONART: Record<string, Ton[]> = {
  "7-tech-chug-b": leiter("B", MOLL),
  "7-tech-stille": leiter("B", MOLL),
  "7-tech-powerchords-b": leiter("B", MOLL),
  "7-tech-gallop-b": leiter("B", MOLL),
  "7-tech-pentatonik-keller": leiter("A", MOLL_PENTATONIK),
  "7-riff-tieferlegung": leiter("B", MOLL),
  "7-riff-wechselbad": leiter("B", MOLL),
  "7-riff-erdgeschoss": leiter("A", MOLL_PENTATONIK),
}

describe("Sieben-Saiter-Katalog", () => {
  it("trägt eigene Nummern und überschneidet sich nirgends mit dem Hauptkatalog", () => {
    const ids = SIEBEN_DRILLS.map((drill) => drill.id)
    expect(new Set(ids).size, "doppelte Nummer").toBe(ids.length)
    for (const id of ids) {
      expect(id.startsWith("7-"), `${id} ohne Präfix`).toBe(true)
      expect(DRILLS.some((drill) => drill.id === id), `${id} steht in beiden`).toBe(false)
    }
  })

  it("hat von jeder Sorte genug, dass der Scheduler etwas zu wählen hat", () => {
    for (const kind of ["warmup", "technique", "riff"] as BlockKind[]) {
      const wie_viele = SIEBEN_DRILLS.filter((drill) => drill.kind === kind).length
      expect(wie_viele, `${kind}`).toBeGreaterThanOrEqual(2)
    }
  })

  it("schreibt jede Tabulatur mit sieben gleich langen Saiten", () => {
    for (const drill of SIEBEN_DRILLS) {
      const zeilen = saitenZeilen(drill.tab ?? "")
      expect(zeilen, drill.id).toHaveLength(7)
      expect(zeilen.map((zeile) => zeile[0])).toEqual([...SAITENNAMEN_SIEBEN])
      expect(new Set(zeilen.map((zeile) => zeile.length)).size, `${drill.id} verrutscht`).toBe(1)
    }
  })

  it("benutzt in jeder Übung wirklich die siebte Saite", () => {
    // Sonst wäre es eine Sechssaiter-Übung mit einer leeren Zeile darunter —
    // und der ganze Modus eine Behauptung.
    for (const drill of SIEBEN_DRILLS) {
      const unten = saitenZeilen(drill.tab ?? "")[6] ?? ""
      const inhalt = unten.slice(2, -1).replace(/-/g, "")
      expect(inhalt.length, `${drill.id} rührt die tiefe Saite nicht an`).toBeGreaterThan(0)
    }
  })

  it("bleibt auf dem Griffbrett", () => {
    for (const drill of SIEBEN_DRILLS) {
      for (const griff of griffeAus(drill.tab ?? "")) {
        expect(griff.bund, `${drill.id}`).toBeLessThanOrEqual(HOECHSTER_BUND_SIEBEN)
        expect(griff.bund).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it("spielt in jeder Übung nur Töne, die zur Tonart gehören", () => {
    // Gerechnet statt geglaubt: eine Tabulatur, in der ein Ton danebenliegt,
    // klingt falsch und niemand weiss warum.
    for (const drill of SIEBEN_DRILLS) {
      const erlaubt = TONART[drill.id]
      if (!erlaubt) continue
      for (const griff of griffeAus(drill.tab ?? "")) {
        const ton = tonSieben(griff)
        expect(erlaubt, `${drill.id}: ${ton} auf Saite ${griff.saite}, Bund ${griff.bund}`)
          .toContain(ton)
      }
    }
  })

  it("greift die Power Chords als Quinten", () => {
    // Die Übung behauptet „zwei Bünde weiter auf der nächsthöheren Saite sind
    // sieben Halbtöne". Das ist nachrechenbar.
    const drill = SIEBEN_DRILLS.find((d) => d.id === "7-tech-powerchords-b")!
    const zeilen = saitenZeilen(drill.tab ?? "")
    const grundtoene = [...zeilen[6].matchAll(/\d+/g)].map((t) => Number(t[0]))
    const quinten = [...zeilen[5].matchAll(/\d+/g)].map((t) => Number(t[0]))
    expect(grundtoene).toHaveLength(quinten.length)
    grundtoene.forEach((bund, i) => {
      const abstand =
        midiSieben({ saite: 6, bund: quinten[i] }) - midiSieben({ saite: 7, bund })
      expect(abstand, `Akkord ${i + 1}`).toBe(7)
    })
  })

  it("nennt die Stimmung so, wie sie klingt", () => {
    expect(STIMMUNG.saiten).toHaveLength(7)
    // Von der tiefsten zur höchsten — und das ist genau die Stimmung, aus der
    // `lib/theory/sieben.ts` rechnet.
    const gerechnet = ([7, 6, 5, 4, 3, 2, 1] as Saite7[]).map((saite) =>
      tonSieben({ saite, bund: 0 }),
    )
    expect(gerechnet).toEqual([...STIMMUNG.saiten])
  })
})

describe("Sieben-Saiter-Modus", () => {
  const festerZufall = () => 0.5

  it("baut drei Blöcke: Aufwärmen, Technik, Riff", () => {
    const plan = buildSiebenSession(EMPTY_LOG, { random: festerZufall })
    expect(plan.blocks.map((block) => block.drill.kind)).toEqual(["warmup", "technique", "riff"])
    expect(plan.totalSeconds).toBe(120 + 180 + 180)
  })

  it("zieht ausschliesslich aus dem eigenen Katalog", () => {
    const plan = buildSiebenSession(EMPTY_LOG, { random: festerZufall })
    for (const block of plan.blocks) {
      expect(SIEBEN_DRILLS, block.drill.id).toContain(block.drill)
    }
  })

  it("bringt die tägliche Viertelstunde nie durcheinander", () => {
    // Die eigentliche Trennlinie: für diese Übungen braucht es eine zweite
    // Gitarre. Eine davon im Tagesplan wäre ein Block, den man nicht spielen
    // kann.
    const siebenIds = new Set(SIEBEN_DRILLS.map((drill) => drill.id))
    const log: PracticeLog = {
      version: 1,
      results: SIEBEN_DRILLS.map((drill, i) => ({
        drillId: drill.id,
        technique: drill.technique,
        bpm: drill.startBpm,
        rating: 1 as const,
        seconds: 180,
        at: new Date(Date.now() - i * 86_400_000).toISOString(),
      })),
    }
    // Mit lauter zähen Sieben-Saiter-Einträgen im Log wären sie, stünden sie
    // im Hauptkatalog, die dringendsten überhaupt.
    for (let lauf = 0; lauf < 25; lauf += 1) {
      for (const block of buildSession(log, { minutes: 15 }).blocks) {
        expect(siebenIds.has(block.drill.id), `${block.drill.id} im Tagesplan`).toBe(false)
      }
    }
  })

  it("verlängert mit etwas, das noch nicht dran war", () => {
    const plan = buildSiebenSession(EMPTY_LOG, { random: festerZufall })
    const gespielt = plan.blocks.map((block) => block.drill.id)
    const weiter = naechsterSiebenBlock(EMPTY_LOG, gespielt, { random: festerZufall })
    expect(gespielt).not.toContain(weiter.drill.id)
    expect(weiter.drill.kind).not.toBe("warmup")
  })

  it("gibt auch dann einen Block, wenn schon alles gespielt wurde", () => {
    const alle = SIEBEN_DRILLS.map((drill: Drill) => drill.id)
    const weiter = naechsterSiebenBlock(EMPTY_LOG, alle, { random: festerZufall })
    expect(weiter.drill).toBeDefined()
  })
})
