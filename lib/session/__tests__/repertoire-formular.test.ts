import { describe, expect, it } from "vitest"
import { fortschritt, uebetempoBpm, type RepertoireSong } from "../repertoire"
import {
  abschnittAusEntwurf,
  abschnittEntfernen,
  abschnittEntwurf,
  songAusEntwurf,
  songEntwurf,
  stimmungAusText,
  taktartenAusText,
  type AbschnittEntwurf,
  type Ergebnis,
  type SongEntwurf,
} from "../repertoire-formular"

/** All songs here are made up: real song data never goes into this repository. */

function entwurf(teil: Partial<SongEntwurf> = {}): SongEntwurf {
  return { ...songEntwurf(), titel: "Testlied", band: "Die Platzhalter", tempo: "120", takte: "32", quelle: "testlied.gp5", ...teil }
}

function song(ergebnis: Ergebnis): RepertoireSong {
  if (!ergebnis.ok) throw new Error(ergebnis.fehler.join("; "))
  return ergebnis.song
}

const fehler = (ergebnis: Ergebnis) => (ergebnis.ok ? [] : ergebnis.fehler)

const teil = (t: Partial<AbschnittEntwurf> = {}): AbschnittEntwurf => ({
  name: "Strophe",
  von: "1",
  bis: "8",
  spur: "Rhythmus",
  uebetempo: "70",
  technikTags: [],
  ...t,
})

const basis = () => song(songAusEntwurf(entwurf(), "testlied"))
const mitStrophe = () => song(abschnittAusEntwurf(basis(), teil(), "a1"))

describe("Fortschritt", () => {
  it("zählt nur, was sitzt", () => {
    expect(fortschritt(basis())).toEqual({ sitzt: 0, gesamt: 0, anteil: 0 })
    const s = song(abschnittAusEntwurf(mitStrophe(), teil({ name: "Refrain", von: "9", bis: "16" }), "a2"))
    s.abschnitte[0].status = "sitzt"
    s.abschnitte[1].status = "langsam"
    expect(fortschritt(s)).toEqual({ sitzt: 1, gesamt: 2, anteil: 0.5 })
  })
})

describe("Übetempo in BPM", () => {
  it("rechnet Prozent vom Tempo der Datei und rundet", () => {
    expect(uebetempoBpm(120, 70)).toBe(84)
    expect(uebetempoBpm(185, 70)).toBe(130)
    expect(uebetempoBpm(120, 100)).toBe(120)
    expect(uebetempoBpm(400, 120)).toBe(480)
    expect(uebetempoBpm(20, 30)).toBe(6)
  })
})

describe("Stimmung und Taktarten aus Text", () => {
  it("nimmt Leerzeichen, Komma und Strich", () => {
    expect(stimmungAusText(" e a d g b e ")).toEqual(["E", "A", "D", "G", "B", "E"])
    expect(stimmungAusText("Eb-Ab-Db-Gb-Bb-Eb")).toEqual(["Eb", "Ab", "Db", "Gb", "Bb", "Eb"])
    expect(stimmungAusText("C#, F#, B, E, G#, C#")).toEqual(["C#", "F#", "B", "E", "G#", "C#"])
    expect(stimmungAusText("")).toEqual([])
  })

  it("führt jede Taktart einmal", () => {
    expect(taktartenAusText("4/4, 7/8 4/4")).toEqual(["4/4", "7/8"])
  })
})

describe("Song aus dem Formular", () => {
  it("baut einen Song mit Vorgaben, ohne Sound", () => {
    expect(basis()).toEqual({
      id: "testlied",
      titel: "Testlied",
      band: "Die Platzhalter",
      tempoHeader: 120,
      stimmung: ["E", "A", "D", "G", "B", "E"],
      takte: 32,
      taktarten: ["4/4"],
      quelle: "testlied.gp5",
      abschnitte: [],
    })
  })

  it("nennt bei leerem Formular jedes fehlende Feld auf Deutsch", () => {
    expect(fehler(songAusEntwurf(songEntwurf(), "x"))).toEqual([
      "Titel: fehlt",
      "Band: fehlt",
      "Tempo: Zahl fehlt",
      "Takte: Zahl fehlt",
      "Dateiname: fehlt",
    ])
  })

  it.each([
    [{ tempo: "10" }, "Tempo: mindestens 20 BPM"],
    [{ tempo: "401" }, "Tempo: höchstens 400 BPM"],
    [{ tempo: "120,5" }, "Tempo: nur ganze BPM"],
    [{ tempo: "schnell" }, "Tempo: Zahl fehlt"],
    [{ takte: "0" }, "Takte: mindestens 1"],
    [{ stimmung: "E A D G B" }, "Stimmung: 6 bis 8 Saiten angeben"],
    [{ stimmung: "E A D G B X" }, "Stimmung: „X“ ist kein Ton"],
    [{ taktarten: "vier" }, "Taktarten: „vier“ ist keine Taktart"],
    [{ taktarten: "" }, "Taktarten: mindestens eine, zum Beispiel 4/4"],
    [{ quelle: "ordner/testlied.gp5" }, "Dateiname: nur der Dateiname, kein Pfad"],
  ])("erklärt %o", (aenderung, meldung) => {
    expect(fehler(songAusEntwurf(entwurf(aenderung), "x"))).toEqual([meldung])
  })

  it("behält beim Bearbeiten Kennung und Abschnitte", () => {
    const alt = mitStrophe()
    const neu = song(songAusEntwurf({ ...songEntwurf(alt), titel: "Anderes Lied" }, "neu", alt))
    expect(neu.id).toBe("testlied")
    expect(neu.abschnitte).toEqual(alt.abschnitte)
  })

  it("nennt den Abschnitt, wenn weniger Takte ihn abschneiden", () => {
    const alt = mitStrophe()
    expect(fehler(songAusEntwurf({ ...songEntwurf(alt), takte: "4" }, "x", alt))).toEqual([
      "Strophe: der Song hat nur 4 Takte",
    ])
  })
})

describe("Sound aus dem Formular", () => {
  const mitSound = (sound: Partial<SongEntwurf["sound"]>) =>
    songAusEntwurf(entwurf({ sound: { ...songEntwurf().sound, ...sound } }), "x")

  it("nimmt nur, was ausgefüllt ist, auch mit Dezimalkomma", () => {
    expect(song(mitSound({ amp: " Testamp ", mitten: "6,5", bass: "0" })).sound).toEqual({
      amp: "Testamp",
      eq: { bass: 0, mitten: 6.5 },
    })
  })

  it("liest einen einzelnen Gain-Wert als genau diese Stellung", () => {
    expect(song(mitSound({ gainVon: "6" })).sound?.gain).toEqual({ von: 6, bis: 6 })
    expect(song(mitSound({ gainBis: "7" })).sound?.gain).toEqual({ von: 7, bis: 7 })
  })

  it("übersteht den Weg zurück ins Formular", () => {
    const s = song(mitSound({ kanal: "Rot", gainVon: "5,5", gainBis: "7", praesenz: "4", boost: "Testpedal" }))
    expect(song(songAusEntwurf(songEntwurf(s), "x", s))).toEqual(s)
  })

  it("erklärt Werte ausserhalb der Regler", () => {
    expect(fehler(mitSound({ bass: "11" }))).toEqual(["Bass: nur 0 bis 10"])
    expect(fehler(mitSound({ gainVon: "8", gainBis: "3" }))).toEqual(["Gain: von liegt über bis"])
    expect(fehler(mitSound({ gainVon: "viel" }))).toEqual(["Gain von: Zahl fehlt", "Gain bis: Zahl fehlt"])
  })
})

describe("Abschnitt aus dem Formular", () => {
  it("beginnt neu und ohne Datum", () => {
    expect(mitStrophe().abschnitte[0]).toMatchObject({ id: "a1", status: "neu", erstmals: {}, uebetempoProzent: 70 })
  })

  it("schlägt den nächsten freien Takt derselben Spur vor", () => {
    expect(abschnittEntwurf(basis())).toMatchObject({ von: "1", spur: "Rhythmus", uebetempo: "70" })
    expect(abschnittEntwurf(mitStrophe())).toMatchObject({ von: "9", spur: "Rhythmus" })
    const voll = song(abschnittAusEntwurf(basis(), teil({ bis: "32" }), "a1"))
    expect(abschnittEntwurf(voll).von).toBe("")
  })

  it("behält beim Bearbeiten Status und Daten", () => {
    const s = mitStrophe()
    const alt = { ...s.abschnitte[0], status: "sitzt" as const, erstmals: { sitzt: "2026-05-01T10:00:00.000Z" } }
    const stand = { ...s, abschnitte: [alt] }
    const neu = song(abschnittAusEntwurf(stand, { ...abschnittEntwurf(stand, alt), name: "Vers" }, "neu", alt))
    expect(neu.abschnitte).toEqual([{ ...alt, name: "Vers" }])
  })

  it("erklärt Fehler auf Deutsch", () => {
    const s = mitStrophe()
    expect(fehler(abschnittAusEntwurf(s, teil({ name: "", von: "", bis: "12" }), "a2"))).toEqual([
      "Name: fehlt",
      "Von Takt: Zahl fehlt",
    ])
    expect(fehler(abschnittAusEntwurf(s, teil({ name: "Refrain", von: "8", bis: "12" }), "a2"))).toEqual([
      "Refrain überlappt Strophe",
    ])
    expect(fehler(abschnittAusEntwurf(s, teil({ von: "9", bis: "12", uebetempo: "20" }), "a2"))).toEqual([
      "Übetempo: mindestens 30 Prozent",
    ])
  })

  it("lässt sich entfernen", () => {
    expect(abschnittEntfernen(mitStrophe(), "a1").abschnitte).toEqual([])
    expect(abschnittEntfernen(mitStrophe(), "weg").abschnitte).toHaveLength(1)
  })
})
