import { describe, expect, it } from "vitest"
import {
  abschnittGeuebt,
  repertoireSchema,
  songSpeichern,
  statusSetzen,
  type Abschnitt,
  type Repertoire,
  type RepertoireSong,
} from "../repertoire"
import { dateiInhalt, dateiLesen, dateiName, zusammenfuehren } from "../repertoire-datei"

/** All songs here are made up: real song data never goes into this repository. */

function abschnitt(teil: Partial<Abschnitt> = {}): Abschnitt {
  return {
    id: "a1",
    name: "Strophe",
    von: 1,
    bis: 8,
    spur: "Rhythmus",
    status: "neu",
    uebetempoProzent: 70,
    technikTags: ["palm-mute"],
    erstmals: {},
    ...teil,
  }
}

function song(teil: Partial<RepertoireSong> = {}): RepertoireSong {
  return {
    id: "testlied",
    titel: "Testlied",
    band: "Die Platzhalter",
    tempoHeader: 120,
    stimmung: ["E", "A", "D", "G", "B", "E"],
    takte: 32,
    taktarten: ["4/4"],
    quelle: "testlied.gp5",
    abschnitte: [abschnitt()],
    ...teil,
  }
}

const mit = (...songs: RepertoireSong[]): Repertoire => ({ songs })
const MAI = new Date("2026-05-01T10:00:00Z")
const JUNI = new Date("2026-06-01T10:00:00Z")
const JULI = new Date("2026-07-01T10:00:00Z")
const erster = (r: Repertoire) => r.songs[0].abschnitte[0]

describe("Die Datei", () => {
  it("heißt nach dem Tag, ohne Song und Band", () => {
    expect(dateiName(new Date(2026, 4, 1))).toBe("riffforge-repertoire-2026-05-01.json")
  })

  it("kommt so zurück, wie sie geschrieben wurde", () => {
    const bestand = statusSetzen(mit(song({ sound: { amp: "Testamp", eq: { mitten: 6 } } })), "testlied", "a1", "sitzt", MAI)
    const gelesen = dateiLesen(dateiInhalt(bestand, JUNI))
    expect(gelesen).toEqual({ ok: true, repertoire: bestand, exportiert: JUNI.toISOString() })
  })

  const gut = JSON.parse(dateiInhalt(mit(song()), MAI))
  const grund = (inhalt: unknown) => {
    const gelesen = dateiLesen(typeof inhalt === "string" ? inhalt : JSON.stringify(inhalt))
    return gelesen.ok ? "" : gelesen.grund
  }

  it("sagt, warum eine Datei nicht taugt", () => {
    expect(grund("{ abgeschnitten")).toMatch(/lässt sich nicht lesen/)
    expect(grund("")).toMatch(/lässt sich nicht lesen/)
    expect(grund(null)).toMatch(/keine Repertoire-Datei/)
    expect(grund([1, 2])).toMatch(/keine Repertoire-Datei/)
    expect(grund({ songs: [] })).toMatch(/keine Repertoire-Datei/)
    expect(grund({ ...gut, app: "andere" })).toMatch(/keine Repertoire-Datei/)
    expect(grund({ version: 1, results: [] })).toMatch(/Sicherung des Übungs-Logs/)
    expect(grund({ ...gut, version: 2 })).toMatch(/neueren Version/)
    expect(grund({ ...gut, version: "1" })).toMatch(/beschädigt/)
    expect(grund({ ...gut, exportiert: "gestern" })).toMatch(/beschädigt/)
    expect(grund({ ...gut, songs: "keine" })).toMatch(/Songliste/)
  })

  it("nimmt nichts aus einer Datei mit einem kaputten Song", () => {
    expect(grund({ ...gut, songs: [song(), { id: "zwei" }] })).toMatch(/Song 2/)
    expect(grund({ ...gut, songs: [song({ abschnitte: [abschnitt({ bis: 99 })] })] })).toMatch(/nur 32 Takte/)
  })
})

describe("Import legt dazu", () => {
  it("ändert nichts, wenn die Datei der eigene Stand ist", () => {
    const bestand = abschnittGeuebt(mit(song({ sound: { gain: { von: 4, bis: 6 } } })), "testlied", "a1", "sitzt", MAI)
    const ergebnis = zusammenfuehren(bestand, bestand)
    expect(ergebnis.aendert).toBe(false)
    expect(ergebnis.repertoire).toBe(bestand)
    expect(ergebnis.songs).toEqual([])
  })

  it("füllt ein leeres Gerät vollständig", () => {
    const datei = statusSetzen(mit(song()), "testlied", "a1", "langsam", MAI)
    const ergebnis = zusammenfuehren(mit(), datei)
    expect(ergebnis.repertoire).toEqual(datei)
    expect(ergebnis.songs[0]).toMatchObject({ neu: true, titel: "Testlied" })
  })

  it("behält Songs und Abschnitte, die die Datei nicht kennt", () => {
    const hier = mit(song({ abschnitte: [abschnitt(), abschnitt({ id: "a2", name: "Solo", von: 9, bis: 16 })] }), song({ id: "x", titel: "Nur hier" }))
    const ergebnis = zusammenfuehren(hier, mit(song({ abschnitte: [] }), song({ id: "y", titel: "Nur dort" })))
    expect(ergebnis.repertoire.songs.map((s) => s.titel)).toEqual(["Testlied", "Nur hier", "Nur dort"])
    expect(ergebnis.repertoire.songs[0].abschnitte).toHaveLength(2)
  })

  it("erkennt denselben Song an Titel und Band und behält die Kennung", () => {
    const datei = mit(song({ id: "anders", titel: " testlied ", abschnitte: [abschnitt({ id: "b9" })] }))
    const ergebnis = zusammenfuehren(mit(song()), datei)
    expect(ergebnis.repertoire.songs).toHaveLength(1)
    expect(ergebnis.repertoire.songs[0].id).toBe("testlied")
    expect(ergebnis.repertoire.songs[0].abschnitte.map((a) => a.id)).toEqual(["a1"])
  })

  it("hängt neue Abschnitte an und zieht die Taktzahl mit", () => {
    const datei = mit(song({ takte: 40, abschnitte: [abschnitt(), abschnitt({ id: "a2", name: "Bridge", von: 33, bis: 40 })] }))
    const ergebnis = zusammenfuehren(mit(song()), datei)
    expect(ergebnis.repertoire.songs[0].takte).toBe(40)
    expect(ergebnis.repertoire.songs[0].abschnitte.map((a) => a.name)).toEqual(["Strophe", "Bridge"])
    expect(ergebnis.songs[0].aenderungen).toContain("Neuer Abschnitt: Bridge (Takt 33–40, Rhythmus, neu)")
  })

  it("überspringt einen neuen Abschnitt, der einen hiesigen überlappt, und sagt es", () => {
    const datei = mit(song({ abschnitte: [abschnitt({ id: "a2", name: "Refrain", von: 5, bis: 12 })] }))
    const ergebnis = zusammenfuehren(mit(song()), datei)
    expect(ergebnis.aendert).toBe(false)
    expect(ergebnis.songs[0].hinweise).toEqual(["Übersprungen: Refrain (Takt 5–12, Rhythmus) überlappt Strophe"])
  })

  it("ordnet gleichnamige Abschnitte nach ihren Takten zu", () => {
    const zwei = (a: string, b: string) => [
      abschnitt({ id: a, name: "Refrain", von: 1, bis: 8 }),
      abschnitt({ id: b, name: "Refrain", von: 17, bis: 24 }),
    ]
    const ergebnis = zusammenfuehren(mit(song({ abschnitte: zwei("a", "b") })), mit(song({ abschnitte: zwei("c", "d").reverse() })))
    expect(ergebnis.aendert).toBe(false)
  })
})

describe("Konflikte beim Übungsstand", () => {
  const basis = mit(song())
  const mai = abschnittGeuebt(basis, "testlied", "a1", "langsam", MAI)
  const juni = abschnittGeuebt(mai, "testlied", "a1", "sitzt", JUNI)

  it("übernimmt den neueren Stand aus der Datei", () => {
    const ergebnis = zusammenfuehren(mai, juni)
    expect(erster(ergebnis.repertoire)).toMatchObject({ status: "sitzt", zuletzt: JUNI.toISOString() })
    expect(ergebnis.songs[0].aenderungen).toContain("Strophe: Status langsam → sitzt")
  })

  it("lässt den neueren Stand hier stehen und sagt es", () => {
    const ergebnis = zusammenfuehren(juni, mai)
    expect(ergebnis.aendert).toBe(false)
    expect(ergebnis.songs[0].hinweise).toContain("Strophe: Hier bleibt Status sitzt (Datei: langsam)")
  })

  it("zählt auch einen Rückschritt von Hand als neuer", () => {
    const zurueck = statusSetzen(juni, "testlied", "a1", "langsam", JULI)
    expect(erster(zusammenfuehren(juni, zurueck).repertoire).status).toBe("langsam")
    expect(erster(zusammenfuehren(zurueck, juni).repertoire).status).toBe("langsam")
  })

  it("lässt einen unberührten, später angelegten Abschnitt nicht gewinnen", () => {
    const frisch = songSpeichern(mit(), song({ id: "anders" }), JULI)
    expect(erster(zusammenfuehren(frisch, mai).repertoire).status).toBe("langsam")
    expect(erster(zusammenfuehren(mai, frisch).repertoire).status).toBe("langsam")
  })

  it("nimmt Status und Übetempo zusammen von derselben Seite", () => {
    const schneller = songSpeichern(mai, { ...mai.songs[0], abschnitte: [{ ...erster(mai), uebetempoProzent: 90 }] }, JULI)
    expect(erster(zusammenfuehren(juni, schneller).repertoire)).toMatchObject({ status: "langsam", uebetempoProzent: 90 })
  })

  it("behält das erste Datum und das letzte Üben von beiden Seiten", () => {
    const spaet = statusSetzen(basis, "testlied", "a1", "langsam", JULI)
    const stand = erster(zusammenfuehren(spaet, mai).repertoire)
    expect(stand.erstmals.langsam).toBe(MAI.toISOString())
    expect(stand.zuletzt).toBe(MAI.toISOString())
    expect(stand.standAm).toBe(JULI.toISOString())
  })

  it("entscheidet bei alten Daten ohne Änderungsdatum nach Übungs- und Erreicht-Daten", () => {
    const alt = mit(song({ abschnitte: [abschnitt({ status: "sitzt", erstmals: { sitzt: JUNI.toISOString() } })] }))
    expect(erster(zusammenfuehren(mai, alt).repertoire).status).toBe("sitzt")
    expect(erster(zusammenfuehren(alt, mai).repertoire).status).toBe("sitzt")
  })

  it("behält ohne jedes Datum den Stand von hier", () => {
    const ergebnis = zusammenfuehren(basis, mit(song({ abschnitte: [abschnitt({ uebetempoProzent: 90 })] })))
    expect(erster(ergebnis.repertoire).uebetempoProzent).toBe(70)
    expect(ergebnis.songs[0].hinweise).toEqual(["Strophe: Hier bleibt Übetempo 70 % (Datei: 90 %)"])
  })

  it("ändert beim zweiten Einlesen nichts mehr", () => {
    const spaet = statusSetzen(basis, "testlied", "a1", "langsam", JULI)
    for (const [a, b] of [[mai, juni], [juni, mai], [spaet, mai], [mai, spaet]]) {
      const einmal = zusammenfuehren(a, b).repertoire
      expect(zusammenfuehren(einmal, b).aendert).toBe(false)
    }
  })
})

describe("Konflikte bei den Songdaten", () => {
  const basis = mit(song())
  const geaendert = (r: Repertoire, teil: Partial<RepertoireSong>, am: Date) => songSpeichern(r, { ...r.songs[0], ...teil }, am)

  it("nimmt die neuere Änderung, in beide Richtungen", () => {
    const mai = geaendert(basis, { tempoHeader: 128 }, MAI)
    const juni = geaendert(basis, { tempoHeader: 132 }, JUNI)
    expect(zusammenfuehren(mai, juni).repertoire.songs[0].tempoHeader).toBe(132)
    expect(zusammenfuehren(juni, mai).repertoire.songs[0].tempoHeader).toBe(132)
    expect(zusammenfuehren(basis, mai).songs[0].aenderungen).toContain("Tempo 120 BPM → 128 BPM")
  })

  it("behält ohne Änderungsdatum, was hier steht", () => {
    const ergebnis = zusammenfuehren(basis, mit(song({ tempoHeader: 140 })))
    expect(ergebnis.repertoire).toBe(basis)
    expect(ergebnis.songs[0].hinweise).toEqual(["Hier bleibt Tempo 120 BPM (Datei: 140 BPM)"])
  })

  it("entfernt keinen Sound, auch wenn die neuere Seite keinen hat", () => {
    const hier = mit(song({ sound: { amp: "Testamp", eq: { bass: 5 } } }))
    const datei = geaendert(basis, { tempoHeader: 130 }, JUNI)
    expect(zusammenfuehren(hier, datei).repertoire.songs[0].sound).toEqual({ amp: "Testamp", eq: { bass: 5 } })
  })

  it("ergänzt fehlende Sound-Angaben Feld für Feld", () => {
    const hier = mit(song({ sound: { amp: "Testamp", eq: { bass: 5 } } }))
    const datei = mit(song({ sound: { amp: "Anderer", eq: { mitten: 7 } } }))
    const ergebnis = zusammenfuehren(hier, datei)
    expect(ergebnis.repertoire.songs[0].sound).toEqual({ amp: "Testamp", eq: { bass: 5, mitten: 7 } })
    expect(ergebnis.songs[0].hinweise.join()).toMatch(/Sound/)
  })

  it("verschiebt Takte nur, wenn dabei nichts zusammenstößt", () => {
    const hier = mit(song({ abschnitte: [abschnitt(), abschnitt({ id: "a2", name: "Refrain", von: 9, bis: 16 })] }))
    const datei = mit(song({ abschnitte: [abschnitt({ bis: 12, geaendert: JUNI.toISOString() })] }))
    const ergebnis = zusammenfuehren(hier, datei)
    expect(erster(ergebnis.repertoire)).toMatchObject({ von: 1, bis: 8 })
    expect(ergebnis.songs[0].hinweise.join()).toMatch(/Hier bleibt Bereich Takt 1–8/)
    expect(repertoireSchema.safeParse(ergebnis.repertoire).success).toBe(true)
  })

  it("verschiebt mehrere Abschnitte gemeinsam", () => {
    const paar = (versatz: number, am?: string) =>
      [1, 9].map((von, i) => abschnitt({ id: `a${i}`, name: `Teil ${i}`, von: von + versatz, bis: von + versatz + 7, geaendert: am }))
    const ergebnis = zusammenfuehren(mit(song({ abschnitte: paar(0) })), mit(song({ abschnitte: paar(4, JUNI.toISOString()) })))
    expect(ergebnis.repertoire.songs[0].abschnitte.map((a) => a.von)).toEqual([5, 13])
  })

  it("stempelt nur echte Änderungen", () => {
    expect(songSpeichern(basis, basis.songs[0], JUNI).songs[0].geaendert).toBeUndefined()
    const umbenannt = songSpeichern(basis, { ...basis.songs[0], abschnitte: [{ ...erster(basis), name: "Vers" }] }, JUNI)
    expect(erster(umbenannt).geaendert).toBe(JUNI.toISOString())
    expect(erster(umbenannt).standAm).toBeUndefined()
    expect(umbenannt.songs[0].geaendert).toBeUndefined()
  })
})
