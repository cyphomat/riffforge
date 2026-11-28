import { describe, expect, it } from "vitest"
import { abschnittVorschlaege, entwurfAusGp, gitarrenStimmungen, mitVorschlaegen, songAusEntwurf, songEntwurf } from "../repertoire-formular"
import { gpLesen, type GpSong } from "../repertoire-gp"

/**
 * No Guitar Pro file goes into this repository. The files here are built byte by
 * byte, with made-up songs and without a single note.
 */

type Version = "3.00" | "4.06" | "5.00" | "5.10"

interface Takt {
  zaehler?: number
  nenner?: number
  marke?: string
  wiederholung?: boolean
  klammer?: boolean
  vorzeichen?: boolean
}

interface Spur {
  name: string
  /** MIDI numbers, highest string first. */
  toene: number[]
  schlagzeug?: boolean
}

const GITARRE: Spur = { name: "Gitarre", toene: [64, 59, 55, 50, 45, 40] }
const TIEF: Spur = { name: "Tiefe Gitarre", toene: [63, 58, 54, 49, 44, 37] }
const BASS: Spur = { name: "Bass", toene: [43, 38, 33, 28] }
const DRUMS: Spur = { name: "Schlagzeug", toene: [0, 0, 0, 0, 0, 0], schlagzeug: true }

interface Vorgabe {
  titel?: string
  band?: string
  tempo?: number
  takte?: Takt[]
  spuren?: Spur[]
}

function datei(version: Version, vorgabe: Vorgabe = {}): Uint8Array {
  const { titel = "Testlied", band = "Die Platzhalter", tempo = 132 } = vorgabe
  const takte = vorgabe.takte ?? [{ zaehler: 4, nenner: 4 }, {}]
  const spuren = vorgabe.spuren ?? [GITARRE]
  const v = Number(version.replace(".", ""))
  const bytes: number[] = []
  const byte = (...werte: number[]) => bytes.push(...werte)
  const leer = (anzahl: number) => byte(...Array<number>(anzahl).fill(0))
  const int = (wert: number) => byte(wert & 255, (wert >> 8) & 255, (wert >> 16) & 255, (wert >> 24) & 255)
  // Latin-1 is enough for what the tests write.
  const zeichen = (text: string) => [...text].map((z) => z.charCodeAt(0))
  const feld = (text: string, breite: number) => {
    byte(text.length, ...zeichen(text))
    leer(breite - text.length)
  }
  const wort = (text: string) => {
    int(text.length + 1)
    feld(text, text.length)
  }

  feld(`FICHIER GUITAR PRO v${version}`, 30)
  const angaben = [titel, "Untertitel", band, "Album", "Text", ...(v >= 500 ? ["Musik"] : []), "Rechte", "Tab", "Hinweis"]
  angaben.forEach(wort)
  int(2)
  wort("Erste Zeile")
  wort("")
  if (v < 500) byte(0)
  if (v >= 400) {
    int(1)
    for (let i = 0; i < 5; i++) {
      int(1)
      int(4)
      byte(...zeichen("lala"))
    }
  }
  if (v >= 500) {
    if (v > 500) leer(19)
    leer(30)
    for (let i = 0; i < 10; i++) wort("%TITLE%")
    wort("Schnell")
  }
  int(tempo)
  if (v > 500) byte(0)
  leer(v >= 500 ? 5 : v >= 400 ? 5 : 4)
  leer(768)
  if (v >= 500) leer(42)
  int(takte.length)
  int(spuren.length)
  takte.forEach((t, i) => {
    if (v >= 500 && i > 0) byte(0)
    const flags =
      (t.zaehler ? 0x01 : 0) |
      (t.nenner ? 0x02 : 0) |
      (t.wiederholung ? 0x08 : 0) |
      (t.klammer ? 0x10 : 0) |
      (t.marke !== undefined ? 0x20 : 0) |
      (t.vorzeichen ? 0x40 : 0)
    byte(flags)
    if (t.zaehler) byte(t.zaehler)
    if (t.nenner) byte(t.nenner)
    if (t.wiederholung) byte(2)
    if (v < 500 && t.klammer) byte(1)
    if (t.marke !== undefined) {
      wort(t.marke)
      byte(255, 0, 0, 0)
    }
    if (v >= 500 && t.klammer) byte(1)
    if (t.vorzeichen) byte(1, 0)
    if (v >= 500) {
      if (flags & 0x03) byte(2, 2, 2, 2)
      if (!t.klammer) byte(0)
      byte(0)
    }
  })
  spuren.forEach((s, i) => {
    if (v >= 500 && (i === 0 || v === 500)) byte(0)
    byte(s.schlagzeug ? 1 : 0)
    feld(s.name, 40)
    int(s.toene.length)
    for (let k = 0; k < 7; k++) int(s.toene[k] ?? -1)
    leer(24)
    if (v >= 500) {
      leer(4 + 25 + 12 + (v === 500 ? 3 : 4))
      if (v > 500) {
        leer(4)
        wort("Effekt")
        wort("Art")
      }
    }
  })
  return Uint8Array.from(bytes)
}

function gelesen(bytes: Uint8Array): GpSong {
  const ergebnis = gpLesen(bytes)
  if (!ergebnis.ok) throw new Error(ergebnis.grund)
  expect(ergebnis.ende).toBe(bytes.length)
  return ergebnis.song
}

const VOLL: Vorgabe = {
  takte: [
    { zaehler: 4, nenner: 4, marke: "Intro" },
    { wiederholung: true },
    { zaehler: 7, nenner: 8, marke: "Strophe", klammer: true, vorzeichen: true },
    { klammer: true },
    { zaehler: 4, nenner: 4, marke: "", vorzeichen: true },
  ],
  spuren: [DRUMS, BASS, TIEF, GITARRE, { ...GITARRE, name: "Zweite" }],
}

describe.each<Version>(["3.00", "4.06", "5.00", "5.10"])("Version %s", (version) => {
  it("liest Titel, Band, Tempo, Takte, Taktarten, Marken und Spuren", () => {
    const song = gelesen(datei(version, VOLL))
    expect(song).toMatchObject({ titel: "Testlied", band: "Die Platzhalter", tempo: 132, takte: 5, taktarten: ["4/4", "7/8"] })
    expect(song.marken).toEqual([
      { takt: 1, name: "Intro" },
      { takt: 3, name: "Strophe" },
      { takt: 5, name: "" },
    ])
    expect(song.spuren.map((s) => s.name)).toEqual(["Schlagzeug", "Bass", "Tiefe Gitarre", "Gitarre", "Zweite"])
    expect(song.spuren[3].saiten).toEqual(["E", "A", "D", "G", "B", "E"])
    expect(song.spuren[2].saiten).toEqual(["Db", "Ab", "Db", "Gb", "Bb", "Eb"])
  })

  it("erfindet bei einer abgeschnittenen Datei nichts", () => {
    const ganz = datei(version, VOLL)
    const voll = gelesen(ganz)
    for (let laenge = 0; laenge < ganz.length; laenge++) {
      const ergebnis = gpLesen(ganz.subarray(0, laenge))
      if (!ergebnis.ok) continue
      // Only the track list may break off; what is there matches the whole file.
      expect(ergebnis.song).toEqual({ ...voll, spuren: voll.spuren.slice(0, ergebnis.song.spuren.length) })
    }
  })
})

describe("Was nicht gelesen wird", () => {
  const grund = (bytes: Uint8Array) => {
    const ergebnis = gpLesen(bytes)
    return ergebnis.ok ? "" : ergebnis.grund
  }
  const text = (inhalt: string) => new TextEncoder().encode(inhalt)

  it("sagt bei neueren Formaten, was geht", () => {
    expect(grund(text("PK\u0003\u0004 irgendwas"))).toMatch(/neuere Guitar-Pro-Format.*\.gp5/)
    expect(grund(text("BCFZ irgendwas"))).toMatch(/neuere/)
  })

  it("erkennt fremde und leere Dateien", () => {
    expect(grund(text(""))).toMatch(/keine Guitar-Pro-Datei/)
    expect(grund(text('{"app":"riffforge"}'))).toMatch(/keine Guitar-Pro-Datei/)
  })

  it("lehnt fremde Versionen ab", () => {
    expect(grund(text("\u0018FICHIER GUITAR PRO v2.21      "))).toMatch(/Version/)
  })

  it("lehnt Unsinn hinter dem richtigen Anfang ab", () => {
    const bytes = datei("3.00")
    bytes.fill(0xff, 31)
    expect(grund(bytes)).toMatch(/beschädigt/)
    expect(grund(datei("3.00", { takte: [] }))).toMatch(/beschädigt/)
  })
})

describe("Aus der Datei ins Formular", () => {
  const gp = gelesen(datei("4.06", VOLL))
  const sound = { ...songEntwurf().sound, amp: "Testamp" }

  it("bietet jede Gitarrenstimmung einmal an, ohne Bass und Schlagzeug", () => {
    expect(gitarrenStimmungen(gp)).toEqual([
      { spur: "Tiefe Gitarre", saiten: "Db Ab Db Gb Bb Eb" },
      { spur: "Gitarre", saiten: "E A D G B E" },
    ])
  })

  it("füllt den Entwurf und lässt den Sound stehen", () => {
    expect(entwurfAusGp({ ...songEntwurf(), sound }, gp, "testlied.gp4")).toEqual({
      titel: "Testlied",
      band: "Die Platzhalter",
      tempo: "132",
      stimmung: "Db Ab Db Gb Bb Eb",
      takte: "5",
      taktarten: "4/4, 7/8",
      quelle: "testlied.gp4",
      sound,
    })
  })

  it("lässt leer, was die Datei nicht sagt", () => {
    const stumm = gelesen(datei("3.00", { titel: "", band: "", spuren: [BASS, DRUMS] }))
    expect(entwurfAusGp(songEntwurf(), stumm, "x.gp3")).toMatchObject({ titel: "", band: "", stimmung: "" })
  })

  it("macht aus Marken lückenlose Abschnitte bis zum Ende", () => {
    expect(abschnittVorschlaege(gp)).toEqual([
      { name: "Intro", von: 1, bis: 2 },
      { name: "Strophe", von: 3, bis: 4 },
      { name: "Abschnitt 3", von: 5, bis: 5 },
    ])
    expect(abschnittVorschlaege(gelesen(datei("3.00")))).toEqual([])
  })

  it("legt gewählte Vorschläge als neue Abschnitte an", () => {
    const song = songAusEntwurf(entwurfAusGp(songEntwurf(), gp, "testlied.gp4"), "neu")
    if (!song.ok) throw new Error(song.fehler.join())
    let nummer = 0
    const ergebnis = mitVorschlaegen(song.song, abschnittVorschlaege(gp).slice(1), () => `a${++nummer}`)
    expect(ergebnis.ok && ergebnis.song.abschnitte).toMatchObject([
      { id: "a1", name: "Strophe", von: 3, bis: 4, spur: "Rhythmus", status: "neu", uebetempoProzent: 70 },
      { id: "a2", name: "Abschnitt 3" },
    ])
  })

  it("sagt, wenn die Vorschläge nicht mehr zur Taktzahl passen", () => {
    const song = songAusEntwurf({ ...entwurfAusGp(songEntwurf(), gp, "testlied.gp4"), takte: "3" }, "neu")
    if (!song.ok) throw new Error(song.fehler.join())
    const ergebnis = mitVorschlaegen(song.song, abschnittVorschlaege(gp), () => crypto.randomUUID())
    expect(ergebnis.ok ? "" : ergebnis.fehler.join()).toMatch(/nur 3 Takte/)
  })
})
