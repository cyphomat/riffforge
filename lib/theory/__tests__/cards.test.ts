import { describe, expect, it } from "vitest"
import { DRILLS } from "@/lib/session/drills"
import { cagedForm, FORMEN, formenAmHals, stufeInForm } from "@/lib/theory/caged"
import { cardById, cardsOfStufe, THEORY_CARDS } from "@/lib/theory/cards"
import {
  INTERVALLE,
  intervalBetween,
  intervallOf,
  midiAt,
  noteAt,
  PENTATONIK,
  pentatonikLage,
  sameGriff,
  TOENE,
  TOENE_B,
  type Lage,
} from "@/lib/theory/fretboard"
import { BUENDE, EINLAGEN, OKTAVBUND } from "@/lib/theory/hals"
import { LEERSAITEN_SIEBEN, SAITENNAMEN_SIEBEN } from "@/lib/theory/sieben"
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

  it("hat zu jeder Technik, die ein Drill spielt, mindestens eine Karte", () => {
    // Die erste Portion grundiert auf den nächsten Block. Ohne passende Karte
    // fragt sie zu etwas anderem — und bei sechs Techniken war das lange so,
    // ohne dass es jemand gemerkt hätte. Das Warm-up steht nie vor einer
    // Portion und braucht deshalb keine.
    const mitKarte = new Set(THEORY_CARDS.map((card) => card.technique))
    const gespielt = new Set(DRILLS.filter((drill) => drill.kind !== "warmup").map((drill) => drill.technique))
    for (const technik of gespielt) expect(mitKarte.has(technik), technik).toBe(true)
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
    // Das Griffbrett zeichnet zwölf Bünde. Eine Antwort darüber hinaus lässt
    // sich nicht antippen — die Karte „Über dem 12. Bund“ fragte zuerst nach
    // dem 15. und war damit unbeantwortbar, ohne dass ein Test es merkte.
    expect(stellen.some((stelle) => stelle.bund <= BUENDE), "keine Antwort auf dem Hals").toBe(true)
    for (const stelle of card.frage.gegeben ?? []) expect(stelle.bund).toBeLessThanOrEqual(BUENDE)
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
describe("Hörfragen im Katalog", () => {
  const gehoert = THEORY_CARDS.filter((card) => card.frage.art === "gehoert")

  it("gibt es zu jedem Intervall aufwärts und abwärts", () => {
    expect(gehoert).toHaveLength(24)
    for (const richtung of ["auf", "ab"] as const) {
      const halbtoene = gehoert.filter((c) => c.frage.hoeren!.richtung === richtung).map((c) => c.frage.hoeren!.halbtoene)
      expect(new Set(halbtoene).size, richtung).toBe(12)
    }
  })

  it.each(gehoert.map((card) => [card.id, card] as const))("%s nennt als Antwort genau das gespielte Intervall", (_id, card) => {
    const { halbtoene } = card.frage.hoeren!
    expect(card.frage.richtig).toEqual([INTERVALLE[halbtoene].name])
    expect(card.frage.auswahl).toContain(INTERVALLE[halbtoene].name)
    // Jede Hörkarte bietet dieselben zwölf Namen an — sonst verriete die
    // Auswahl, welche Karte gerade dran ist.
    expect(card.frage.auswahl).toEqual(gehoert[0].frage.auswahl)
  })

  it("nennt die Halbtonzahl in der Erklärung richtig", () => {
    const zahlen = ["", "Ein Halbton", "Ein Ganzton", "Drei", "Vier", "Fünf", "Sechs", "Sieben", "Acht", "Neun", "Zehn", "Elf", "Zwölf"]
    for (const card of gehoert) expect(card.erklaerung.startsWith(zahlen[card.frage.hoeren!.halbtoene]), card.id).toBe(true)
  })

  it("bringt aufwärts vor abwärts", () => {
    const erstesAb = THEORY_CARDS.findIndex((c) => c.frage.hoeren?.richtung === "ab")
    const letztesAuf = THEORY_CARDS.findLastIndex((c) => c.frage.hoeren?.richtung === "auf")
    expect(letztesAuf).toBeLessThan(erstesAb)
  })
})

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

describe("Was die neuen Griffbrett-Karten behaupten, stimmt auch", () => {
  it("G-Saite: 2. Bund A, 5. Bund C, 7. Bund D", () => {
    expect(noteAt(g(3, 2))).toBe("A")
    expect(noteAt(g(3, 5))).toBe("C")
    expect(noteAt(g(3, 7))).toBe("D")
    const stellen = cardById("m-g-saite")!.frage.richtig as Griff[]
    expect(stellen).toEqual([g(3, 5)])
  })

  it("B-Saite: 1. Bund C, 3. Bund D, 5. Bund wie die leere e-Saite", () => {
    expect(noteAt(g(2, 1))).toBe("C")
    expect(noteAt(g(2, 3))).toBe("D")
    expect(midiAt(g(2, 5))).toBe(midiAt(g(1, 0)))
    for (const stelle of cardById("m-b-saite")!.frage.richtig as Griff[]) expect(stelle.saite).toBe(2)
  })

  it("legt das C aus dem 3. Bund der A-Saite eine Oktave höher in den 15.", () => {
    expect(midiAt(g(5, 15)) - midiAt(g(5, 3))).toBe(12)
    expect(cardById("m-ueber-zwoelf")!.frage.richtig).toContain("15")
  })

  it("setzt die siebte Saite eine Quarte unter die tiefe E", () => {
    expect(SAITENNAMEN_SIEBEN[6]).toBe("B")
    expect(LEERSAITEN_SIEBEN[5] - LEERSAITEN_SIEBEN[6]).toBe(5)
    expect(cardById("m-siebte-saite")!.frage.richtig).toEqual(["B"])
    // Im 5. Bund der B-Saite klingt die leere E-Saite.
    expect(LEERSAITEN_SIEBEN[6] + 5).toBe(LEERSAITEN_SIEBEN[5])
    expect(cardById("x-sieben-stimmen")!.frage.richtig).toContain("5")
  })

  it("findet Quarte und kleine Septime im selben Bund, eine und zwei Saiten höher", () => {
    expect(cardById("i-quartform")!.frage.richtig).toEqual([g(5, 5)])
    expect(intervalBetween(g(6, 5), g(5, 5)).name).toBe("Quarte")
    expect(cardById("i-septime-form")!.frage.richtig).toEqual([g(4, 5)])
    expect(intervalBetween(g(6, 5), g(4, 5)).name).toBe("kleine Septime")
    expect(cardById("i-ganzton-saite")!.frage.richtig).toEqual([g(6, 7)])
    expect(intervalBetween(g(6, 5), g(6, 7)).name).toBe("grosse Sekunde")
  })

  it("zählt Sexte, gestapelte Intervalle und None richtig", () => {
    expect(intervallOf(9).name).toBe("grosse Sexte")
    expect(12 - 3).toBe(9) // Umkehrung der kleinen Terz
    expect(cardById("i-grosse-sexte")!.frage.richtig).toContain("9")
    expect(intervallOf(7 + 5 - 12).name).toBe("Prime")
    expect(INTERVALLE[7 + 5].name).toBe("Oktave")
    expect(12 + 2).toBe(14)
    expect(cardById("i-none")!.frage.richtig).toContain("14")
  })

  it("setzt die Oktave des G5 auf die D-Saite im 5. Bund", () => {
    expect(cardById("a-powerchord-oktave")!.frage.richtig).toEqual([g(4, 5)])
    expect(midiAt(g(4, 5)) - midiAt(g(6, 3))).toBe(12)
  })

  it("nennt den Powerchord ab dem 7. Bund der A-Saite E5", () => {
    expect(noteAt(g(5, 7))).toBe("E")
    expect(intervalBetween(g(5, 7), g(4, 9)).name).toBe("Quinte")
    expect(cardById("a-powerchord-name")!.frage.richtig).toContain("E5")
  })

  it("legt die Stufen von E-Moll so auf die tiefe E-Saite, wie die Karte sagt", () => {
    const moll = [0, 2, 3, 5, 7, 8, 10]
    expect(moll.map((bund) => noteAt(g(6, bund)))).toEqual(["E", "F#", "G", "A", "B", "C", "D"])
    expect(cardById("a-stufen-e-saite")!.frage.richtig).toEqual([g(6, 8)])
  })

  it("lässt das Bending vom 7. Bund der G-Saite im 9. ankommen", () => {
    expect(noteAt(g(3, 7))).toBe("D")
    expect(noteAt(g(3, 9))).toBe("E")
    expect(cardById("x-bending-ziel")!.frage.richtig).toEqual([g(3, 9)])
  })

  it("nennt den Tritonus über E richtig — auf der E-Saite im 6. Bund", () => {
    expect(noteAt(g(6, 6))).toBe("A#")
    expect(intervalBetween(g(6, 0), g(6, 6)).name).toBe("Tritonus")
    expect(cardById("x-tritonus-e")!.frage.richtig).toContain("A#")
  })
})

describe("Was die neuen Tonleiter-Karten behaupten, stimmt auch", () => {
  /** Die Stufen eines Modus der Dur-Tonleiter, ab ihrer `ab`-ten Stufe gezählt. */
  const modus = (ab: number) => {
    const dur = [0, 2, 4, 5, 7, 9, 11]
    return dur.map((_, i) => (dur[(i + ab) % 7] - dur[ab] + 12) % 12)
  }
  const moll = [0, 2, 3, 5, 7, 8, 10]

  it("trennt Dorisch von Moll allein an der grossen Sexte", () => {
    const dorisch = modus(1)
    expect(dorisch).toEqual([0, 2, 3, 5, 7, 9, 10])
    const anders = dorisch.filter((ton, i) => ton !== moll[i])
    expect(anders).toEqual([9])
    expect(intervallOf(9).name).toBe("grosse Sexte")
  })

  it("gibt nur Lokrisch eine verminderte Quinte", () => {
    for (let ab = 0; ab < 7; ab += 1) {
      const leiter = modus(ab)
      expect(leiter.includes(7), `Modus ab Stufe ${ab + 1}`).toBe(ab !== 6)
    }
    expect(modus(6)).toEqual([0, 1, 3, 5, 6, 8, 10])
  })

  it("baut die E-Moll-Pentatonik aus E G A B D", () => {
    const e = TOENE.indexOf("E")
    expect(PENTATONIK.map((stufe) => TOENE[(e + stufe) % 12]).join(" ")).toBe("E G A B D")
    expect(cardById("s-e-pentatonik")!.frage.richtig).toContain("E G A B D")
  })

  it("lässt die kleine Terz in Lage 1 von A-Moll dort liegen, wo die Karte sagt", () => {
    const stellen = cardById("s-lage-terz")!.frage.richtig as Griff[]
    for (const stelle of stellen) expect(noteAt(stelle)).toBe("C")
    expect(stellen).toEqual(expect.arrayContaining([g(6, 8), g(3, 5), g(1, 8)]))
    expect(stellen).toHaveLength(3)
  })

  it("gibt A-Moll- und C-Dur-Pentatonik dieselben Töne", () => {
    const a = TOENE.indexOf("A")
    const c = TOENE.indexOf("C")
    const mollToene = new Set(PENTATONIK.map((stufe) => (a + stufe) % 12))
    const durToene = new Set([0, 2, 4, 7, 9].map((stufe) => (c + stufe) % 12))
    expect(mollToene).toEqual(durToene)
  })

  it("macht in harmonisch Moll die fünfte Stufe zu Dur, mit dem Leitton darin", () => {
    const harmonisch = [0, 2, 3, 5, 7, 8, 11]
    const terzDerFuenften = harmonisch[6] - harmonisch[4]
    expect(terzDerFuenften).toBe(4)
    expect(TOENE[(TOENE.indexOf("A") + harmonisch[4]) % 12]).toBe("E")
    expect(TOENE[(TOENE.indexOf("A") + harmonisch[6]) % 12]).toBe("G#")
    expect(cardById("s-leitton")!.frage.richtig).toEqual([g(6, 4)])
    expect(cardById("a-dominante-moll")!.frage.richtig).toEqual(["E-Dur"])
  })

  it("zieht in der Pentatonik von der Quarte auf die Quinte", () => {
    // D einen Ganzton hoch ist E — und E ist die Quinte über A.
    const d = TOENE.indexOf("D")
    expect(TOENE[(d + 2) % 12]).toBe("E")
    expect(intervallOf(TOENE.indexOf("E") - TOENE.indexOf("A") + 12).name).toBe("Quinte")
    // Und die kleine Septime G einen Ganzton hoch ist der Grundton.
    expect(TOENE[(TOENE.indexOf("G") + 2) % 12]).toBe("A")
  })

  it("stimmt Drop C einen Ganzton unter Drop D", () => {
    const standard = [40, 45, 50, 55, 59, 64]
    const dropC = standard.map((ton, i) => ton - 2 - (i === 0 ? 2 : 0))
    expect(dropC.map((ton) => TOENE[ton % 12]).join(" ")).toBe("C G C F A D")
    expect(cardById("x-drop-c")!.frage.richtig).toEqual(["C G C F A D"])
  })
})

describe("Was die neuen Rhythmus-Karten behaupten, stimmt auch", () => {
  /** Ob der n-te Anschlag im Wechselschlag ein Abschlag ist — gezählt ab null. */
  const abschlag = (n: number) => n % 2 === 0

  it("legt bei Sechzehnteln jeden Schlag auf einen Abschlag", () => {
    for (let schlag = 0; schlag < 8; schlag += 1) expect(abschlag(schlag * 4)).toBe(true)
    expect(cardById("r-wechselschlag-sechzehntel")!.frage.richtig).toEqual(["immer mit einem Abschlag"])
  })

  it("lässt bei Triolen Ab- und Aufschlag auf dem Schlag wechseln", () => {
    expect([0, 1, 2, 3].map((schlag) => abschlag(schlag * 3))).toEqual([true, false, true, false])
  })

  it("zählt bei 150 BPM in Sechzehnteln zehn Anschläge je Sekunde", () => {
    expect((150 / 60) * 4).toBe(10)
    expect(cardById("r-tremolo-gezaehlt")!.frage.richtig).toContain("10")
  })

  it("teilt einen Schlag in acht Zweiunddreissigstel", () => {
    expect(32 / 4).toBe(8)
  })
})

describe("Was die CAGED-Karten behaupten, stimmt auch", () => {
  it("nennt für C-Dur die Formen in der Reihenfolge und an den Bünden aus dem Text", () => {
    expect(formenAmHals("C")).toEqual(["C", "A", "G", "E", "D"])
    const tiefster = (form: (typeof FORMEN)[number]) => Math.min(...cagedForm(form, "C").map((ton) => ton.bund))
    expect(FORMEN.map(tiefster)).toEqual([0, 3, 5, 8, 10])
  })

  it("lässt A- und G-Form von C-Dur sich den Grundton auf der G-Saite teilen", () => {
    expect(stufeInForm("A", "C", 0)).toEqual(expect.arrayContaining([g(3, 5)]))
    expect(stufeInForm("G", "C", 0)).toEqual(expect.arrayContaining([g(3, 5), g(6, 8), g(1, 8)]))
  })

  it("legt die Grundtöne der D-Form von E-Dur auf D- und B-Saite", () => {
    expect(stufeInForm("D", "E", 0)).toEqual([g(4, 2), g(2, 5)])
  })

  it("legt die Terz der E-Form einen Bund über das Barré, auf die G-Saite", () => {
    const terz = stufeInForm("E", "G", 4)
    expect(terz).toEqual([g(3, 4)])
    expect(noteAt(terz[0])).toBe("B")
    // Einen Bund tiefer ist es die kleine Terz — Moll.
    expect(intervalBetween(g(6, 3), g(3, 3)).name).toBe("kleine Terz")
  })

  it("hängt E- und G-Form an die tiefe E-Saite, A und C an die A-Saite, D an die D-Saite", () => {
    const anker = (form: (typeof FORMEN)[number]) =>
      Math.max(...stufeInForm(form, "C", 0).map((stelle) => stelle.saite))
    expect(FORMEN.filter((form) => anker(form) === 6).sort()).toEqual(["E", "G"])
    expect(FORMEN.filter((form) => anker(form) === 5).sort()).toEqual(["A", "C"])
    expect(FORMEN.filter((form) => anker(form) === 4)).toEqual(["D"])
    expect(cardById("a-caged-anker")!.frage.richtig).toEqual(["E-Form und G-Form"])
  })
})

describe("Was die Karten aus Dreiklang und Tonleiter behaupten, stimmt auch", () => {
  const dur = [0, 2, 4, 5, 7, 9, 11]

  it("legt jede CAGED-Form in genau eine Pentatonik-Lage, in jeder Tonart dieselbe", () => {
    const zuordnung: Record<string, number> = { G: 1, E: 2, D: 3, C: 4, A: 5 }
    for (const akkord of TOENE) {
      const moll = TOENE[(TOENE.indexOf(akkord) + 9) % 12]
      for (const form of FORMEN) {
        const toene = cagedForm(form, akkord)
        // Eine Lage kommt zweimal auf den Hals, eine Oktave versetzt.
        const lagen = ([1, 2, 3, 4, 5] as const).filter((lage) =>
          [0, 12].some((ab) => toene.every((ton) => pentatonikLage(moll, lage, ab).some((stelle) => sameGriff(stelle, ton)))),
        )
        expect(lagen, `${akkord} ${form}-Form`).toEqual([zuordnung[form]])
      }
    }
    expect(cardById("a-caged-pentatonik")!.frage.richtig).toEqual(["Lage 1"])
  })

  it("harmonisiert Dur zu Dur, Moll, Moll, Dur, Dur, Moll, vermindert", () => {
    const art = dur.map((_, i) => {
      const terz = (dur[(i + 2) % 7] - dur[i] + 12) % 12
      const quinte = (dur[(i + 4) % 7] - dur[i] + 12) % 12
      if (terz === 4 && quinte === 7) return "Dur"
      if (terz === 3 && quinte === 7) return "Moll"
      if (terz === 3 && quinte === 6) return "vermindert"
      return "?"
    })
    expect(art.join(", ")).toBe((cardById("a-harmonisiert")!.frage.richtig as string[])[0])
  })

  it("baut Dreiklang, Dur-Pentatonik und Dur-Tonleiter auseinander auf", () => {
    const stufe = (n: number) => dur[n - 1]
    const dreiklang = [1, 3, 5].map(stufe)
    const pentatonik = [1, 2, 3, 5, 6].map(stufe)
    expect(pentatonik).toEqual([0, 2, 4, 7, 9])
    expect(pentatonik.filter((ton) => !dreiklang.includes(ton))).toEqual([stufe(2), stufe(6)])
    expect(dur.filter((ton) => !pentatonik.includes(ton))).toEqual([stufe(4), stufe(7)])
    expect(cardById("s-dreiklang-tonleiter")!.frage.richtig).toEqual(["2 und 6"])
  })
})
