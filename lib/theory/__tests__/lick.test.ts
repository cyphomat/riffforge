import { describe, expect, it } from "vitest"
import { ACHTEL_GESAMT, baueLick, erklaerungOf, tabOf } from "../lick"
import { PENTATONIK, TOENE, midiAt, type Lage, type Ton } from "../fretboard"

/**
 * Was ein Lick sein muss, damit es sich zu üben lohnt.
 *
 * Der erste Bau hat all diese Prüfungen bestanden und war trotzdem
 * unbrauchbar: zwölf gerade Achtel am Stück, dreimal dasselbe Motiv. Deshalb
 * steht hier auch, was sich *unterscheiden* muss — eine Grammatik, die immer
 * dasselbe ausspuckt, ist keine.
 */

const SEEDS = Array.from({ length: 400 }, (_, i) => i + 1)

/**
 * Alle sechzig Boxen.
 *
 * Die Prüfungen liefen lange nur in der Standardbox (A-Moll, Lage 1) — und
 * die ist der freundlichste Fall: einstellige Bünde, der Zielton mitten im
 * Vorrat. Zwei Fehler haben dort nie gezuckt und sind erst beim Durchspielen
 * anderer Lagen aufgefallen.
 */
const BOXEN: Array<[Ton, Lage]> = TOENE.flatMap((grundton) =>
  ([1, 2, 3, 4, 5] as Lage[]).map((lage) => [grundton, lage] as [Ton, Lage]),
)

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

  it("stottert nicht — in keiner der sechzig Boxen", () => {
    // Derselbe Ton zweimal hintereinander, ohne Bindung, liest sich in einer
    // Tabulatur wie ein Tippfehler. Zwei Ursachen, beide am Rand des
    // Tonvorrats, beide erst beim Durchspielen anderer Lagen aufgefallen:
    //
    // 1. Die Phrasengrenze — ein Zickzack-Motiv (+1, −1, +2) endet nach drei
    //    Tönen dort, wo es anfing, und die Wiederholung setzt denselben Ton
    //    noch einmal an. Das betraf ein Drittel aller Licks.
    // 2. Der Anlauf, dem unter dem Zielton die Töne ausgingen: geklemmt
    //    stand er dreimal auf derselben Stelle, direkt vor der Auflösung.
    //    Nach der ersten Behebung waren das die verbliebenen 4,8 %.
    //
    // Mit dem Motivfenster und dem Anlauf, der sich die Seite mit Platz
    // sucht, ist es null — über 1500 Licks in allen sechzig Boxen gemessen.
    // Deshalb steht hier keine Schranke mehr, sondern die Null.
    for (const [grundton, lage] of BOXEN) {
      for (const seed of SEEDS.slice(0, 25)) {
        const noten = baueLick(seed, grundton, lage).noten
        const stotter = noten.find(
          (note, i) =>
            i > 0 &&
            note.achtel === noten[i - 1].achtel + 1 &&
            note.griff.saite === noten[i - 1].griff.saite &&
            note.griff.bund === noten[i - 1].griff.bund,
        )
        expect(stotter, `${grundton} Lage ${lage}, seed ${seed}`).toBeUndefined()
      }
    }
  })

  it("ist nie ein Triller auf zwei Tönen", () => {
    // Das war der andere Befund aus den höheren Lagen: 4,8 % der Licks
    // liefen auf einer einzigen Saite zwischen genau zwei Griffen hin und
    // her — fünfmal dieselbe Figur, weil eine abwärts laufende Kontur am
    // unteren Rand des Vorrats umkehrte statt weiterzulaufen. Spielbar,
    // prüfbar, und trotzdem kein Lick.
    //
    // Die Böden sind gemessen, nicht gewünscht: über 12 000 Licks in allen
    // sechzig Boxen liegt das Minimum bei drei verschiedenen Griffen auf
    // zwei Saiten.
    for (const [grundton, lage] of BOXEN) {
      for (const seed of SEEDS.slice(0, 25)) {
        const noten = baueLick(seed, grundton, lage).noten
        const griffe = new Set(noten.map((n) => `${n.griff.saite}-${n.griff.bund}`))
        const saiten = new Set(noten.map((n) => n.griff.saite))
        const wo = `${grundton} Lage ${lage}, seed ${seed}`
        expect(griffe.size, wo).toBeGreaterThanOrEqual(3)
        expect(saiten.size, wo).toBeGreaterThanOrEqual(2)
      }
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
  it("setzt je Takt ein System aus sechs gleich langen Saiten", () => {
    for (const seed of [1, 42, 777]) {
      for (const system of tabOf(baueLick(seed)).split("\n\n")) {
        const zeilen = system.split("\n")
        expect(zeilen).toHaveLength(6)
        expect(new Set(zeilen.map((z) => z.length)).size, `seed ${seed}`).toBe(1)
        expect(zeilen.map((z) => z[0])).toEqual(["e", "B", "G", "D", "A", "E"])
      }
    }
  })

  it("passt in jeder Box aufs Handy", () => {
    // Die alte Prüfung lief nur in der Standardbox — und dort bleibt jeder
    // Bund einstellig. Ab dem zehnten Bund braucht jede Spalte ein Zeichen
    // mehr: 36 % aller Licks waren 45 Zeichen breit und wurden im Browser
    // bei 390 px rechts abgeschnitten, samt dem Zielton. Auf 320 px passen
    // gemessen rund 33 Zeichen — das ist die Schranke.
    for (const [grundton, lage] of BOXEN) {
      for (const seed of SEEDS.slice(0, 25)) {
        const breit = Math.max(
          ...tabOf(baueLick(seed, grundton, lage))
            .split("\n")
            .map((zeile) => zeile.length),
        )
        expect(breit, `${grundton} Lage ${lage}, seed ${seed}`).toBeLessThanOrEqual(33)
      }
    }
  })

  it("bricht nur um, wenn es sein muss", () => {
    // Der Umbruch ist die Antwort auf das Handy, nicht auf die Tabulatur.
    // In der Standardbox bleibt alles einstellig, die Zeile wird 31 Zeichen
    // lang und passt überall — sie trotzdem zu zerlegen sah auf einem
    // breiten Schirm nach Fehler aus: ein halber zweiter Takt neben einem
    // ganzen ersten, ohne Not.
    for (const [grundton, lage] of BOXEN) {
      for (const seed of SEEDS.slice(0, 25)) {
        const tab = tabOf(baueLick(seed, grundton, lage))
        const systeme = tab.split("\n\n")
        const einzeilig = systeme.length === 1
        const breit = Math.max(...tab.split("\n").map((zeile) => zeile.length))
        const wo = `${grundton} Lage ${lage}, seed ${seed}`

        // Zweistellige Bünde brauchen eine Spalte mehr — und nur dann bricht es.
        const zweistellig = /\d\d/.test(tab)
        expect(einzeilig, wo).toBe(!zweistellig)

        if (!einzeilig) {
          // Beide Takte gleich lang, sonst steht eine halbe Zeile neben einer
          // vollen.
          expect(systeme, wo).toHaveLength(2)
          const laengen = systeme.map((system) => system.split("\n")[0].length)
          expect(new Set(laengen).size, wo).toBe(1)
        }
        expect(breit, wo).toBeLessThanOrEqual(33)
      }
    }
  })

  it("setzt keine Bindung an den Zeilenanfang", () => {
    // `|p5` behauptet einen Pull-off von einem Ton, der in dieser Zeile gar
    // nicht steht — in einer Tabulatur liest sich das wie ein Tippfehler.
    for (const [grundton, lage] of BOXEN) {
      for (const seed of SEEDS.slice(0, 25)) {
        const zeilen = tabOf(baueLick(seed, grundton, lage)).split("\n")
        const haenger = zeilen.find((zeile) => /^[eBGDAE]\|[hp]/.test(zeile))
        expect(haenger, `${grundton} Lage ${lage}, seed ${seed}`).toBeUndefined()
      }
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
