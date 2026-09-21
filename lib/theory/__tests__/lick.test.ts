import { describe, expect, it } from "vitest"
import { ACHTEL_GESAMT, baueLick, erklaerungOf, tabOf } from "../lick"
import { PENTATONIK, TOENE, midiAt } from "../fretboard"

/**
 * Was ein Lick sein muss, damit es sich zu üben lohnt.
 *
 * Der erste Bau hat all diese Prüfungen bestanden und war trotzdem
 * unbrauchbar: zwölf gerade Achtel am Stück, dreimal dasselbe Motiv. Deshalb
 * steht hier auch, was sich *unterscheiden* muss — eine Grammatik, die immer
 * dasselbe ausspuckt, ist keine.
 */

const SEEDS = Array.from({ length: 400 }, (_, i) => i + 1)

describe("baueLick", () => {
  it("ist aus seinem Startwert wieder herstellbar", () => {
    // Ohne das stünde im Übungs-Log ein Eintrag zu einer Tabulatur, die
    // niemand mehr sehen kann.
    for (const seed of [1, 42, 9999]) {
      expect(baueLick(seed)).toEqual(baueLick(seed))
    }
  })

  it("löst immer auf einen stabilen Ton auf", () => {
    const quinte = PENTATONIK[3]
    for (const seed of SEEDS) {
      const lick = baueLick(seed)
      const letzte = lick.noten[lick.noten.length - 1]
      const abstand = (((midiAt(letzte.griff) - TOENE.indexOf(lick.grundton)) % 12) + 12) % 12
      expect([0, quinte], `seed ${seed}`).toContain(abstand)
      expect(letzte.artikulation).toBe("vibrato")
    }
  })

  it("setzt den Zielton auf eine schwere Zählzeit und lässt ihn stehen", () => {
    for (const seed of SEEDS) {
      const lick = baueLick(seed)
      const letzte = lick.noten[lick.noten.length - 1]
      // Achtel 12 ist die Drei des zweiten Takts; danach kommt nichts mehr.
      expect(letzte.achtel % 2, `seed ${seed}`).toBe(0)
      expect(letzte.achtel).toBeLessThan(ACHTEL_GESAMT)
      expect(lick.noten.every((n) => n.achtel <= letzte.achtel)).toBe(true)
    }
  })

  it("bleibt in einer Griffweite", () => {
    // Der Punkt der Lage: ein Lick, für das man den Hals hinaufrutschen muss,
    // ist eine andere Übung. Vier Bünde sind eine Hand.
    for (const seed of SEEDS) {
      const buende = baueLick(seed).noten.map((n) => n.griff.bund)
      expect(Math.max(...buende) - Math.min(...buende), `seed ${seed}`).toBeLessThanOrEqual(4)
    }
  })

  it("legt nie zwei Töne auf dasselbe Achtel und läuft vorwärts", () => {
    for (const seed of SEEDS) {
      const achtel = baueLick(seed).noten.map((n) => n.achtel)
      expect(new Set(achtel).size, `seed ${seed}`).toBe(achtel.length)
      expect([...achtel].sort((a, b) => a - b)).toEqual(achtel)
    }
  })

  it("bindet nur, was zusammenhängt", () => {
    // Hammer-on und Pull-off gehen nur auf derselben Saite, in Reichweite,
    // und nur von einem Ton, der unmittelbar davor klang.
    for (const seed of SEEDS) {
      const noten = baueLick(seed).noten
      noten.forEach((note, i) => {
        if (note.artikulation !== "hammer" && note.artikulation !== "pull") return
        const vor = noten[i - 1]
        expect(vor, `seed ${seed}`).toBeDefined()
        expect(vor.griff.saite).toBe(note.griff.saite)
        expect(note.achtel - vor.achtel).toBe(1)
        const weite = note.griff.bund - vor.griff.bund
        expect(Math.abs(weite)).toBeGreaterThan(0)
        expect(Math.abs(weite)).toBeLessThanOrEqual(3)
        expect(weite > 0 ? "hammer" : "pull").toBe(note.artikulation)
      })
    }
  })

  it("atmet — die Notenzahl ist nicht bei allen gleich", () => {
    // Der Fehler des ersten Baus, wörtlich: 400 Licks, alle mit exakt 13
    // Noten. Rhythmisch identisch heisst als Übung identisch.
    const zahlen = new Set(SEEDS.map((seed) => baueLick(seed).noten.length))
    expect(zahlen.size).toBeGreaterThanOrEqual(5)
  })

  it("verteilt die Konturen gleichmässig — auch bei den ersten Startwerten", () => {
    // Der Grund steht in `wuerfel`: mulberry32 lieferte bei kleinen,
    // fortlaufenden Startwerten korrelierte erste Werte. Über die ersten
    // vierzig Licks war neunzehnmal dieselbe Kontur dran statt zehnmal —
    // und die ersten vierzig sind die, die ein neuer Nutzer spielt.
    const ersten40 = Array.from({ length: 40 }, (_, i) => baueLick(i + 1).bauplan.kontur)
    const haeufigkeit: Record<string, number> = {}
    for (const k of ersten40) haeufigkeit[k] = (haeufigkeit[k] ?? 0) + 1
    // Vier Konturen auf vierzig Licks: zehn je Stück wären gleich verteilt.
    // Die Grenze lässt Zufall zu und schlägt bei echter Schieflage an.
    for (const [kontur, anzahl] of Object.entries(haeufigkeit)) {
      expect(anzahl, `${kontur} kam ${anzahl}× in den ersten 40`).toBeLessThanOrEqual(16)
    }
    expect(Object.keys(haeufigkeit)).toHaveLength(4)
  })

  it("wiederholt sich nicht von Startwert zu Startwert", () => {
    const formen = new Set(SEEDS.map((seed) => tabOf(baueLick(seed))))
    // Zufall darf Wiederholungen erzeugen; ein Generator, der aus
    // vierhundert Startwerten zwanzig Licks macht, wäre aber keiner.
    expect(formen.size).toBeGreaterThan(SEEDS.length / 2)
  })
})

describe("tabOf", () => {
  it("setzt sechs gleich lange Saiten", () => {
    for (const seed of [1, 42, 777]) {
      const zeilen = tabOf(baueLick(seed)).split("\n")
      expect(zeilen).toHaveLength(6)
      expect(new Set(zeilen.map((z) => z.length)).size, `seed ${seed}`).toBe(1)
      expect(zeilen.map((z) => z[0])).toEqual(["e", "B", "G", "D", "A", "E"])
      // Passt sie aufs Handy? Die Tabs im Katalog sind 33 Zeichen breit.
      expect(zeilen[0].length, `seed ${seed}`).toBeLessThanOrEqual(34)
    }
  })

  it("schreibt jeden Ton des Licks genau einmal", () => {
    for (const seed of SEEDS.slice(0, 50)) {
      const lick = baueLick(seed)
      const tab = tabOf(lick)
      // Bundzahlen aus der Tabulatur zurücklesen und zählen.
      const gefunden = (tab.match(/[hp-]\d+/g) ?? []).length
      expect(gefunden, `seed ${seed}`).toBe(lick.noten.length)
    }
  })
})

describe("erklaerungOf", () => {
  it("benennt, was tatsächlich gebaut wurde", () => {
    // Die Ansage behauptet nichts: was dasteht, muss aus dem Bauplan kommen.
    const lick = baueLick(42)
    const text = erklaerungOf(lick)
    expect(text).toContain(`Lage ${lick.lage}`)
    expect(text).toContain(lick.grundton)
    expect(text).toContain(lick.bauplan.zielton === "Grundton" ? "den Grundton" : "die Quinte")
  })
})
