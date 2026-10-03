import { describe, expect, it } from "vitest"
import { cardById, cardsOfStufe, THEORY_CARDS } from "@/lib/theory/cards"
import {
  intervalBetween,
  intervallOf,
  midiAt,
  noteAt,
  pentatonikLage,
  sameGriff,
  TOENE,
  TOENE_B,
  type Lage,
} from "@/lib/theory/fretboard"
import { EINLAGEN, OKTAVBUND } from "@/lib/theory/hals"
import {
  beatSeconds,
  beatsFor,
  bewerteFigur,
  EINZAEHLER_SCHLAEGE,
  FIGUREN,
  figurById,
  patternMarks,
  patternTimes,
  periodeOf,
  toleranceSeconds,
} from "@/lib/theory/rhythm"
import { STUFEN, type Griff } from "@/lib/theory/types"

const g = (saite: number, bund: number) => ({ saite, bund }) as Griff

/** Kleinstes gemeinsames Vielfaches — für Längen, in denen zwei Figuren aufgehen. */
const ggt = (a: number, b: number): number => (b === 0 ? a : ggt(b, a % b))
const kgv = (a: number, b: number) => (a / ggt(a, b)) * b

describe("Katalog", () => {
  it("hat lauter eindeutige Kennungen", () => {
    const ids = THEORY_CARDS.map((card) => card.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("nennt nur Stufen, die es gibt", () => {
    const bekannt = STUFEN.map((stufe) => stufe.nummer)
    for (const card of THEORY_CARDS) expect(bekannt).toContain(card.stufe)
  })

  it("hat in jeder Stufe etwas", () => {
    for (const stufe of STUFEN) {
      expect(cardsOfStufe(stufe.nummer).length, `Stufe ${stufe.nummer}`).toBeGreaterThan(0)
    }
  })

  it("ordnet jede Karte genau einer Stufe zu", () => {
    const summe = STUFEN.reduce((zahl, stufe) => zahl + cardsOfStufe(stufe.nummer).length, 0)
    expect(summe).toBe(THEORY_CARDS.length)
  })

  it("findet eine Karte über ihre Kennung", () => {
    expect(cardById("i-tritonus")?.begriff).toBe("Tritonus")
    expect(cardById("gibt-es-nicht")).toBeUndefined()
  })
})

describe("Jede Karte", () => {
  it.each(THEORY_CARDS.map((card) => [card.id, card] as const))(
    "%s ist vollständig",
    (_id, card) => {
      expect(card.begriff.length).toBeGreaterThan(2)
      // Zwei bis drei Sätze — die Länge eines why-Feldes. Kürzer erklärt
      // nichts, viel länger sind meistens zwei Karten.
      expect(card.erklaerung.length).toBeGreaterThan(80)
      expect(card.erklaerung.length).toBeLessThan(700)
      expect(card.frage.text.length).toBeGreaterThan(5)
      expect(card.frage.richtig.length).toBeGreaterThan(0)
    },
  )

  it.each(THEORY_CARDS.filter((card) => card.frage.art === "auswahl").map((c) => [c.id, c] as const))(
    "%s hat die richtige Antwort unter den Möglichkeiten",
    (_id, card) => {
      expect(card.frage.auswahl).toBeDefined()
      expect(card.frage.auswahl!.length).toBeGreaterThanOrEqual(3)
      for (const richtig of card.frage.richtig as string[]) {
        expect(card.frage.auswahl).toContain(richtig)
      }
      expect(new Set(card.frage.auswahl).size).toBe(card.frage.auswahl!.length)
    },
  )

  it.each(
    THEORY_CARDS.filter((card) => card.frage.art === "griffbrett").map((c) => [c.id, c] as const),
  )("%s zeigt bei %s auf echte Stellen des Halses", (_id, card) => {
    const stellen = card.frage.richtig as Griff[]
    expect(stellen.length).toBeGreaterThan(0)
    for (const stelle of stellen) {
      expect(stelle.saite).toBeGreaterThanOrEqual(1)
      expect(stelle.saite).toBeLessThanOrEqual(6)
      expect(stelle.bund).toBeGreaterThanOrEqual(0)
      expect(stelle.bund).toBeLessThanOrEqual(15)
    }
    // Alle richtigen Stellen müssen denselben Ton tragen, sonst ist eine davon
    // schlicht falsch.
    const toene = new Set(stellen.map((stelle) => noteAt(stelle)))
    expect(toene.size).toBe(1)
  })
})

/**
 * Die Erklärungen behaupten Töne und Abstände. Was sich nachrechnen lässt,
 * wird nachgerechnet — ein falscher Bund im Fliesstext fällt sonst niemandem
 * auf, und Übungsmaterial, das lügt, ist schlimmer als keines.
 */
describe("Gespielte Fragen", () => {
  const gespielt = THEORY_CARDS.filter((card) => card.frage.art === "gespielt")

  it("gibt es", () => {
    expect(gespielt.length).toBeGreaterThan(0)
  })

  it.each(gespielt.map((card) => [card.id, card] as const))("%s nennt eine echte Figur", (_id, card) => {
    const rhythmus = card.frage.rhythmus
    expect(rhythmus).toBeDefined()
    expect(figurById(rhythmus!.figurId), rhythmus!.figurId).toBeDefined()
    expect(rhythmus!.bpm).toBeGreaterThanOrEqual(40)
    expect(rhythmus!.bpm).toBeLessThanOrEqual(200)
    expect(rhythmus!.takte).toBeGreaterThan(0)
  })

  it("bleibt bei einem Tempo, das die Figur noch trennbar macht", () => {
    // Die Toleranz darf nicht so gross werden, dass eine Nachbarnote
    // mitgezählt wird — sonst gilt jede Figur als jede andere.
    for (const card of gespielt) {
      const figur = figurById(card.frage.rhythmus!.figurId)!
      const jeSchlag = beatSeconds(card.frage.rhythmus!.bpm)
      // Zwei Perioden hintereinander, damit auch der Abstand über die
      // Wiederholungsgrenze zählt: bei einer Figur, die auf eine Lücke endet,
      // ist genau der der engste. Bewusst aus den Offsets gerechnet und nicht
      // über patternTimes — der Test soll unabhängig davon bleiben, was er prüft.
      const periode = periodeOf(figur)
      const zwei = [...figur.offsets, ...figur.offsets.map((offset) => offset + periode)]
      const engster = Math.min(...zwei.slice(1).map((offset, i) => (offset - zwei[i]) * jeSchlag))
      expect(toleranceSeconds(figur, jeSchlag), card.id).toBeLessThan(engster / 2)
    }
  })

  it("misst in ganzen Takten", () => {
    // Die Figur bestimmt die Länge, nicht die Taktzahl — und wenn sie im Takt
    // nicht aufgeht, steht auf dem Schirm „9 Schläge" statt „2 Takte". Das ist
    // ehrlich, aber sonderbar; deshalb hier gerade rücken statt dort.
    for (const card of gespielt) {
      const { figurId, takte } = card.frage.rhythmus!
      expect(beatsFor(figurById(figurId)!, takte) % 4, card.id).toBe(0)
    }
  })

  it("stellt keine Figur, die eine andere aus Versehen mitbeantwortet", () => {
    // Der Prüfstein für das ganze Verfahren: wer die gefragte Figur nicht
    // kann, darf sie nicht mit einer anderen bestehen. Gemessen wird mit
    // demselben Urteil wie in der App — Trefferquote *und* Genauigkeit.
    for (const card of gespielt) {
      const { figurId, bpm, takte } = card.frage.rhythmus!
      const figur = figurById(figurId)!
      const jeSchlag = beatSeconds(bpm)
      const toleranz = toleranceSeconds(figur, jeSchlag)

      for (const andere of FIGUREN) {
        if (andere.id === figur.id) continue
        // Genug Schläge, dass beide Figuren ganz aufgehen: eine abgeschnittene
        // Periode sähe fälschlich nach Unterscheidbarkeit aus.
        const laenge = kgv(beatsFor(figur, takte), periodeOf(andere))
        const einzaehler = Array.from({ length: EINZAEHLER_SCHLAEGE }, (_, i) => i * jeSchlag)
        const start = EINZAEHLER_SCHLAEGE * jeSchlag
        const schlaege = Array.from({ length: laenge }, (_, i) => start + i * jeSchlag)

        // Der falsche Spieler spielt die andere Figur gleichmässig laut — wer
        // die verlangte Figur nicht kennt, dämpft auch nicht gezielt. Genau so
        // trennt sich eine Dead-Note-Figur von ihrem ungedämpften Zwilling,
        // der im Zeitraster identisch ist.
        const gespieltZeiten = patternTimes(schlaege, andere, jeSchlag)
        const urteil = bewerteFigur({
          onsets: [...einzaehler, ...gespieltZeiten],
          anschlaege: [...einzaehler, ...gespieltZeiten].map((time) => ({ time, level: 0.5 })),
          marken: patternMarks(schlaege, figur, jeSchlag),
          einzaehler,
          erwartet: patternTimes(schlaege, figur, jeSchlag),
          toleranz,
        })
        expect(urteil.richtig, `${card.id} ← ${andere.id}`).toBe(false)
      }
    }
  })
})

describe("Was die Lagen-Karten behaupten, stimmt auch", () => {
  it("nennt für Lage 1 von A-Moll nur echte Grundtöne", () => {
    const karte = cardById("s-lage-grundton")!
    const stellen = karte.frage.richtig as Griff[]
    expect(stellen.length).toBeGreaterThan(1)
    for (const stelle of stellen) expect(noteAt(stelle)).toBe("A")
    // Und sie liegen wirklich in der Lage, nicht irgendwo auf dem Hals.
    for (const stelle of stellen) {
      expect(pentatonikLage("A", 1).some((g) => sameGriff(g, stelle)), JSON.stringify(stelle)).toBe(true)
    }
  })

  it("nennt für die Quinte in Lage 1 nur echte Quinten", () => {
    const stellen = cardById("s-lage-quinte")!.frage.richtig as Griff[]
    expect(stellen.length).toBeGreaterThan(1)
    // Die Quinte über A ist E — sieben Halbtöne.
    for (const stelle of stellen) expect(noteAt(stelle)).toBe("E")
  })

  it("bestätigt, dass in Lage 2 die kleine Terz zuunterst liegt", () => {
    const tiefste = pentatonikLage("A", 2).filter((g) => g.saite === 6)[0]
    expect(noteAt(tiefste)).toBe("C") // kleine Terz über A
    expect(cardById("s-lage-anker")!.frage.richtig).toEqual(["die kleine Terz"])
  })

  it("bestätigt die zwei Töne je Saite", () => {
    for (const saite of [1, 2, 3, 4, 5, 6]) {
      expect(pentatonikLage("A", 1).filter((g) => g.saite === saite)).toHaveLength(2)
    }
    expect(cardById("s-lage-zwei-toene")!.frage.richtig).toEqual(["2"])
  })

  it("bestätigt, dass bei A-Moll Lage 4 zuunterst liegt", () => {
    const tiefster = (lage: Lage) => Math.min(...pentatonikLage("A", lage).map((g) => g.bund))
    const unterste = ([1, 2, 3, 4, 5] as const).reduce((a, b) => (tiefster(a) <= tiefster(b) ? a : b))
    expect(unterste).toBe(4)
    expect(cardById("s-lage-kreis")!.frage.richtig).toEqual(["Lage 4"])
  })
})

describe("Was die Powerchord-Karten behaupten, stimmt auch", () => {
  // Die Intervallnamen kommen aus derselben Rechnung, die auch das Griffbrett
  // benutzt — abgeschrieben wäre hier ein Halbton schnell verrutscht.
  const nachNamen: Array<[string, number, string]> = [
    ["a-powerchord-b5", 6, "Tritonus"],
    ["a-powerchord-kreuz5", 8, "kleine Sexte"],
  ]

  it.each(nachNamen)("%s nennt bei %i Halbtönen das richtige Intervall", (id, halbtoene, name) => {
    expect(intervallOf(halbtoene).name).toBe(name)
    expect((cardById(id)!.frage.richtig as string[])[0].toLowerCase()).toContain(name.toLowerCase())
  })

  it("zählt die Halbtöne des Quartpowerchords richtig", () => {
    // Diese Karte fragt die Zahl statt den Namen — geprüft wird also die Zahl.
    expect(intervallOf(5).name).toBe("Quarte")
    expect(cardById("a-quartpowerchord")!.frage.richtig).toEqual(["5"])
  })

  it("misst den gewöhnlichen Powerchord bei sieben Halbtönen", () => {
    // Der Bezugspunkt, gegen den die drei Varianten überhaupt Varianten sind.
    expect(intervallOf(7).name).toBe("Quinte")
  })

  it("bestätigt den Knick zur B-Saite an echten Griffen", () => {
    // Auf jedem anderen Saitenpaar liegt die Quinte zwei Bünde höher; über die
    // B-Saite hinweg sind es drei. Genau das behauptet die Karte.
    expect(intervalBetween(g(5, 5), g(4, 7)).name).toBe("Quinte")
    expect(intervalBetween(g(3, 5), g(2, 8)).name).toBe("Quinte")
    expect(cardById("a-powerchord-hoch")!.frage.richtig).toEqual([
      "der obere Ton wandert einen Bund höher",
    ])
  })
})

describe("Fragen nach der Schreibweise", () => {
  it("werden wörtlich verglichen, sonst beantwortet die Frage sich selbst", () => {
    // "Wie heisst dieser Ton in einer Tabulatur" liesse sich mit dem H aus der
    // Frage beantworten, weil die Eingabe H und B als denselben Ton liest.
    const karte = cardById("m-h-oder-b")
    expect(karte?.frage.woertlich).toBe(true)
    expect(karte?.frage.richtig).toEqual(["B"])
  })
})

describe("Was im Text steht, stimmt auch", () => {
  it("tiefe E-Saite: 3. Bund G, 5. Bund A, 7. Bund B", () => {
    expect(noteAt(g(6, 3))).toBe("G")
    expect(noteAt(g(6, 5))).toBe("A")
    expect(noteAt(g(6, 7))).toBe("B")
  })

  it("A-Saite: 3. Bund C, 5. Bund D, 7. Bund E", () => {
    expect(noteAt(g(5, 3))).toBe("C")
    expect(noteAt(g(5, 5))).toBe("D")
    expect(noteAt(g(5, 7))).toBe("E")
  })

  it("d-Saite 5. Bund ist G", () => {
    expect(noteAt(g(4, 5))).toBe("G")
  })

  it("benachbarte Leersaiten sind Quarten — ausser G zu B", () => {
    expect(intervalBetween(g(6, 0), g(5, 0)).name).toBe("Quarte")
    expect(intervalBetween(g(5, 0), g(4, 0)).name).toBe("Quarte")
    expect(intervalBetween(g(4, 0), g(3, 0)).name).toBe("Quarte")
    expect(intervalBetween(g(3, 0), g(2, 0)).name).toBe("grosse Terz")
    expect(intervalBetween(g(2, 0), g(1, 0)).name).toBe("Quarte")
  })

  it("vom 3. zum 10. Bund derselben Saite ist eine Quinte", () => {
    expect(intervalBetween(g(6, 3), g(6, 10)).name).toBe("Quinte")
  })

  it("die Quinte liegt eine Saite höher und zwei Bünde weiter", () => {
    expect(intervalBetween(g(6, 5), g(5, 7)).name).toBe("Quinte")
  })

  it("die Oktave von der d-Saite braucht drei Bünde, nicht zwei", () => {
    // Genau der Knick: der Weg führt über die h-Saite.
    expect(intervalBetween(g(4, 5), g(2, 8)).name).toBe("Oktave")
    expect(noteAt(g(2, 8))).toBe(noteAt(g(4, 5)))
  })

  it("G# und Ab liegen auf demselben Bund", () => {
    // Die Karte "Zwei Namen, ein Bund" behauptet das.
    expect(noteAt(g(6, 4))).toBe("G#")
  })

  it("der Tritonus zur Quinte liegt einen Bund tiefer — die Blue Note", () => {
    expect(intervalBetween(g(6, 5), g(5, 6)).name).toBe("Tritonus")
    expect(intervalBetween(g(6, 5), g(5, 7)).name).toBe("Quinte")
  })
})

/**
 * Stufe 6 rechnet mit Physik und Stimmungen — beides lässt sich nachrechnen,
 * also wird es nachgerechnet. Eine Karte, die beim Flageolett den falschen
 * Bund nennt, schickt jemanden eine Woche lang an die falsche Stelle.
 */
describe("Was die Metal-Karten behaupten, stimmt auch", () => {
  /** Wo ein Bund die Saite teilt — als Anteil der Länge, vom Sattel aus. */
  const teilung = (bund: number) => 1 - 2 ** (-bund / 12)
  /** Welcher Oberton an dieser Stelle klingt, und wie viele Halbtöne über leer. */
  const oberton = (bund: number) => {
    const teile = Math.round(1 / teilung(bund))
    return { teile, halbtoene: Math.round(12 * Math.log2(teile)) }
  }

  it("legt das Oktav-Flageolett auf den 12. Bund", () => {
    expect(teilung(12)).toBeCloseTo(1 / 2, 5)
    expect(oberton(12).halbtoene).toBe(12)
    expect(cardById("x-flageolett-12")!.frage.richtig).toContain("12")
  })

  it("lässt den 7. Bund eine Oktave plus Quinte klingen, den 5. zwei Oktaven", () => {
    // „Fast genau ein Drittel" — die Bünde sind gleichstufig, die Obertöne
    // nicht. Der Unterschied liegt unter einem Prozent der Saitenlänge.
    expect(Math.abs(teilung(7) - 1 / 3)).toBeLessThan(0.01)
    expect(oberton(7).halbtoene).toBe(12 + 7)
    expect(intervallOf(oberton(7).halbtoene - 12).name).toBe("Quinte")
    expect(oberton(5).halbtoene).toBe(24)
    expect(cardById("x-flageolett-7")!.frage.richtig).toEqual(["eine Oktave plus Quinte"])
  })

  it("nennt die Stufen der Metal-Kadenz richtig", () => {
    // C und D über E: kleine Sexte und kleine Septime, also ♭VI und ♭VII.
    expect(intervalBetween(g(6, 0), g(6, 8)).name).toBe("kleine Sexte")
    expect(noteAt(g(6, 8))).toBe("C")
    expect(intervalBetween(g(6, 0), g(6, 10)).name).toBe("kleine Septime")
    expect(noteAt(g(6, 10))).toBe("D")
    expect(cardById("x-kadenz-moll")!.frage.richtig).toEqual(["♭VI – ♭VII – i"])
  })

  it("verteilt die Terzen in A-Moll so, wie die Karte sagt", () => {
    // Vier kleine über A, B, D, E — drei grosse über C, F, G.
    const moll = [0, 2, 3, 5, 7, 8, 10]
    const a = TOENE.indexOf("A")
    const kleine: string[] = []
    const grosse: string[] = []
    moll.forEach((stufe, i) => {
      const terz = (moll[(i + 2) % 7] - stufe + 12) % 12
      const ton = TOENE[(a + stufe) % 12]
      ;(terz === 3 ? kleine : grosse).push(ton)
      expect([3, 4]).toContain(terz)
    })
    expect(kleine).toEqual(["A", "B", "D", "E"])
    expect(grosse).toEqual(["C", "F", "G"])
  })

  it("setzt die zweite Stimme über A auf ein C", () => {
    const stellen = cardById("x-terzen-zweistimmig")!.frage.richtig as Griff[]
    expect(stellen.length).toBeGreaterThan(0)
    for (const stelle of stellen) {
      expect(noteAt(stelle)).toBe("C")
      expect(stelle.saite).toBe(5)
    }
  })

  it("greift F5 in Drop D im dritten Bund", () => {
    // Drop D: die tiefste Saite auf D2 (MIDI 38) statt E2 (40).
    const dropD = (bund: number) => 38 + bund
    expect(TOENE[dropD(3) % 12]).toBe("F")
    expect(TOENE[dropD(5) % 12]).toBe("G")
    // Die Quinte liegt im selben Bund auf der A-Saite — ein Finger reicht.
    expect(midiAt(g(5, 3)) - dropD(3)).toBe(7)
    // Und in Standardstimmung liegt F zwei Bünde tiefer.
    expect(noteAt(g(6, 1))).toBe("F")
    expect(cardById("x-drop-d-bund")!.frage.richtig).toContain("3")
  })

  it("rechnet den Spannungsverlust beim Tieferstimmen", () => {
    // Spannung wächst mit dem Quadrat der Frequenz.
    const verlust = 1 - (2 ** (-2 / 12)) ** 2
    expect(verlust).toBeGreaterThan(0.18)
    expect(verlust).toBeLessThan(0.23)
    expect(cardById("x-spannung")!.frage.richtig).toEqual(["etwa ein Fünftel"])
  })

  it("lässt den verminderten Septakkord alle drei Bünde auf sich selbst fallen", () => {
    const akkord = new Set([0, 3, 6, 9])
    const verschoben = new Set([...akkord].map((ton) => (ton + 3) % 12))
    expect(verschoben).toEqual(akkord)
    // Und zwei Bünde reichen nicht — die Drei ist keine Faustregel.
    const zwei = new Set([...akkord].map((ton) => (ton + 2) % 12))
    expect(zwei).not.toEqual(akkord)
    expect(cardById("x-vermindert-symmetrie")!.frage.richtig).toContain("3")
  })

  it("zählt bei 180 BPM in Achteln sechs Anschläge je Sekunde", () => {
    expect((180 / 60) * 2).toBe(6)
    expect(cardById("x-anschlaege-pro-sekunde")!.frage.richtig).toContain("6")
  })
})

describe("Was die Grundlagen- und Intervall-Karten behaupten, stimmt auch", () => {
  it("legt F direkt neben das leere E", () => {
    expect(noteAt(g(6, 1))).toBe("F")
    expect(intervalBetween(g(6, 0), g(6, 1)).name).toBe("kleine Sekunde")
  })

  it("D-Saite: 3. Bund F, 5. Bund G, 7. Bund A", () => {
    expect(noteAt(g(4, 3))).toBe("F")
    expect(noteAt(g(4, 5))).toBe("G")
    expect(noteAt(g(4, 7))).toBe("A")
  })

  it("lässt hohe und tiefe E-Saite in jedem Bund denselben Ton tragen", () => {
    for (let bund = 0; bund <= 15; bund += 1) {
      expect(noteAt(g(1, bund)), `Bund ${bund}`).toBe(noteAt(g(6, bund)))
    }
    // Zwei Oktaven auseinander, nicht eine.
    expect(midiAt(g(1, 0)) - midiAt(g(6, 0))).toBe(24)
    expect(noteAt(g(1, 3))).toBe("G")
    expect(noteAt(g(1, 5))).toBe("A")
    expect(noteAt(g(1, 7))).toBe("B")
  })

  it("stimmt im 5. Bund — ausser von G nach B", () => {
    // E→A, A→D, D→G und B→e im fünften Bund.
    for (const saite of [6, 5, 4, 2]) {
      expect(midiAt(g(saite, 5)), `Saite ${saite}`).toBe(midiAt(g(saite - 1, 0)))
    }
    // Die eine Ausnahme liegt einen Bund tiefer.
    expect(midiAt(g(3, 4))).toBe(midiAt(g(2, 0)))
    expect(midiAt(g(3, 5))).not.toBe(midiAt(g(2, 0)))
    expect(cardById("m-stimmen")!.frage.richtig).toContain("5")
    expect(cardById("m-stimmen-ausnahme")!.frage.richtig).toContain("4")
  })

  it("nennt die Einlagen so, wie der Hals sie zeichnet", () => {
    // Dieselben Zahlen, aus denen der Hintergrund und das Griffbrett gezeichnet
    // werden — sonst stünde in der Karte etwas anderes als auf dem Schirm.
    const erwartet = `${EINLAGEN.join(", ")} und ${OKTAVBUND}`
    expect(cardById("m-einlagen")!.frage.richtig).toEqual([erwartet])
  })

  it("legt Bb einen Bund unter B, auf A#", () => {
    const b = TOENE.indexOf("B")
    const bb = TOENE_B.indexOf("Bb")
    expect(bb).toBe(b - 1)
    expect(TOENE[bb]).toBe("A#")
  })

  it("findet die Terzformen eine Saite höher: klein zwei Bünde zurück, gross einen", () => {
    expect(intervalBetween(g(6, 5), g(5, 3)).name).toBe("kleine Terz")
    expect(intervalBetween(g(6, 5), g(5, 4)).name).toBe("grosse Terz")
    // Über den Knick hinweg stimmt die Form nicht mehr — die Karte sagt das.
    expect(intervalBetween(g(3, 5), g(2, 3)).name).not.toBe("kleine Terz")
    const stellen = cardById("i-kleine-terz-form")!.frage.richtig as Griff[]
    for (const stelle of stellen) expect(noteAt(stelle)).toBe("C")
  })

  it("setzt die grosse Terz über C auf ein E der D-Saite", () => {
    const stellen = cardById("i-grosse-terz")!.frage.richtig as Griff[]
    expect(stellen.length).toBeGreaterThan(0)
    for (const stelle of stellen) {
      expect(stelle.saite).toBe(4)
      expect(noteAt(stelle)).toBe("E")
    }
    expect(intervalBetween(g(5, 3), g(4, 2)).name).toBe("grosse Terz")
  })

  it("zählt Sexte und Septime richtig — und die Sexte als Umkehrung der Terz", () => {
    expect(intervallOf(8).name).toBe("kleine Sexte")
    expect(12 - 4).toBe(8)
    expect(cardById("i-kleine-sexte")!.frage.richtig).toEqual(["8"])
    expect(intervallOf(11).name).toBe("grosse Septime")
    expect(cardById("i-grosse-septime")!.frage.richtig).toContain("11")
  })

  it("findet unter A eine Quarte tiefer dasselbe E wie eine Quinte höher", () => {
    const a = TOENE.indexOf("A")
    expect(TOENE[(a - 5 + 12) % 12]).toBe("E")
    expect(TOENE[(a + 7) % 12]).toBe("E")
    expect(cardById("i-quarte-abwaerts")!.frage.richtig).toEqual(["E"])
  })
})
