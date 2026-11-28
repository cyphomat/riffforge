import { describe, expect, it } from "vitest"
import { COVER_GROESSE, TITEL_KOPF, alben, albumJahr, coverPixel, trackTitel } from "../album"
import { ALLE_DRILLS_BY_ID } from "../drills"
import { TECHNIQUES, type DrillResult, type PracticeLog } from "../types"
import type { TheoryLog } from "@/lib/theory/types"
import { SONGS } from "@/lib/theory/songs"

/** Alle Logs hier sind erfunden. */

const RIFF = ALLE_DRILLS_BY_ID["riff-ironclad"]
const SPAETER = new Date("2026-11-28T12:00:00")

function ergebnis(tag: string, rating: 1 | 2 | 3 | 4 = 3, bpm = 80, id = RIFF.id, uhr = "12:00:00"): DrillResult {
  const technique = ALLE_DRILLS_BY_ID[id]?.technique ?? RIFF.technique
  return { drillId: id, technique, bpm, rating, seconds: 150, at: `${tag}T${uhr}` }
}
const log = (...r: DrillResult[]): PracticeLog => ({ version: 1, results: r })
const LEER: TheoryLog = { version: 1, answers: [] }

/** `n` aufeinanderfolgende Montage ab dem 5. Januar 2026. */
const montage = (n: number) =>
  Array.from({ length: n }, (_, i) => {
    const d = new Date(2026, 0, 5 + 7 * i, 12)
    return `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, "0")}-${`${d.getDate()}`.padStart(2, "0")}`
  })

describe("Jahresalbum", () => {
  it("ohne Log gibt es keine Platte", () => {
    expect(alben(log(), LEER, SPAETER)).toEqual([])
  })

  it("jede Woche mit Übung ist ein Track, Pausen fehlen", () => {
    const [a] = alben(log(ergebnis("2026-10-05"), ergebnis("2026-10-06"), ergebnis("2026-11-23", 2)), LEER, SPAETER)
    expect(a.tracks.map((t) => [t.nr, t.woche, t.kw])).toEqual([
      [1, "2026-10-05", 41],
      [2, "2026-11-23", 48],
    ])
    expect(a.tracks[0]).toMatchObject({ tage: 2, bloecke: 2, sauber: 2, gegner: null })
    expect(a).toMatchObject({ jahr: 2026, tage: 3, sauber: 2, gegner: 0, format: "Demo" })
  })

  it("derselbe Log ergibt dieselbe Platte, in jeder Reihenfolge", () => {
    const r = montage(20).map((t) => ergebnis(t))
    expect(alben(log(...[...r].reverse()), LEER, SPAETER)).toEqual(alben(log(...r), LEER, SPAETER))
  })

  it("kein Titel steht doppelt auf einem vollen Jahr", () => {
    const [a] = alben(log(...montage(52).map((t) => ergebnis(t))), LEER, new Date("2027-02-01T12:00:00"))
    expect(new Set(a.tracks.map((t) => t.titel)).size).toBe(a.tracks.length)
  })

  it("ein vergebener Titel rückt weiter", () => {
    const erster = trackTitel("gallop", "2026-10-05", new Set())
    expect(trackTitel("gallop", "2026-10-05", new Set([erster]))).not.toBe(erster)
  })

  it("der Titel beginnt mit der prägenden Technik, nicht mit dem Warm-up", () => {
    const warm = { ...ergebnis("2026-10-05"), technique: "warmup" }
    const gallop = { ...ergebnis("2026-10-05"), technique: "gallop" }
    expect(alben(log(warm, warm, gallop), LEER, SPAETER)[0].tracks[0].titel).toMatch(/^Gallop of the /)
    expect(alben(log(warm), LEER, SPAETER)[0].tracks[0].titel).toMatch(/^Cold Start of the /)
    for (const t of TECHNIQUES) expect(TITEL_KOPF[t]).toBeTruthy()
  })

  it("spätere Wochen ändern frühere Tracks nicht", () => {
    const frueh = montage(6).map((t) => ergebnis(t))
    const vorher = alben(log(...frueh), LEER, SPAETER)[0].tracks
    const nachher = alben(log(...frueh, ergebnis("2026-11-23", 4, 200)), LEER, SPAETER)[0].tracks
    expect(nachher.slice(0, vorher.length)).toEqual(vorher)
  })

  it("Bestwert erst, wenn das saubere Tempo Früheres übertrifft", () => {
    const [a] = alben(
      log(
        ergebnis("2026-10-05", 3, 80),
        ergebnis("2026-10-12", 3, 80),
        ergebnis("2026-10-19", 2, 120),
        ergebnis("2026-10-26", 4, 90),
      ),
      LEER,
      SPAETER,
    )
    expect(a.tracks.map((t) => t.bestwerte)).toEqual([[], [], [], [{ drill: RIFF.title, bpm: 90 }]])
  })

  it("nennt die gespielten Songs", () => {
    const song = SONGS[0]
    const [a] = alben(log(ergebnis("2026-10-05", 2, 70, song.id)), LEER, SPAETER)
    expect(a.tracks[0].songs).toEqual([song.titel])
  })

  it("der gefällte Wochengegner steht am Track", () => {
    // Vier Tage, acht saubere Blöcke, ein Riff im Zieltempo und sechs Antworten sind 20 Treffer.
    const r = ["2026-10-05", "2026-10-06", "2026-10-07", "2026-10-08"].flatMap((t) => [
      ergebnis(t, 3, RIFF.targetBpm),
      ergebnis(t, 3, RIFF.targetBpm, RIFF.id, "12:10:00"),
    ])
    const theorie = {
      version: 1,
      answers: Array.from({ length: 6 }, (_, i) => ({ cardId: `k${i}`, grade: 3, correct: true, at: `2026-10-05T10:00:0${i}` })),
    } as TheoryLog
    const [a] = alben(log(...r), theorie, SPAETER)
    expect(a.tracks[0].gegner).toBeTruthy()
    expect(a.gegner).toBe(1)
  })

  it("die Woche gehört zum Jahr ihres Donnerstags: Silvester zählt noch", () => {
    expect(albumJahr("2026-12-28")).toBe(2026)
    expect(albumJahr("2025-12-29")).toBe(2026)
    const [a] = alben(log(ergebnis("2027-01-02")), LEER, new Date("2027-01-03T20:00:00"))
    expect(a).toMatchObject({ jahr: 2026, bis: "2027-01-03", erschienen: false })
  })

  it("erscheint am Montag nach der letzten Woche, das neue Jahr steht davor", () => {
    const r = log(ergebnis("2026-12-29"), ergebnis("2027-01-05"))
    const liste = alben(r, LEER, new Date("2027-01-06T12:00:00"))
    expect(liste.map((a) => [a.jahr, a.erschienen])).toEqual([
      [2027, false],
      [2026, true],
    ])
  })

  it("Einträge aus der Zukunft werden nicht gepresst", () => {
    expect(alben(log(ergebnis("2026-12-14")), LEER, SPAETER)).toEqual([])
  })

  it("Formate: Demo bis 3, EP bis 11, LP ab 12", () => {
    const format = (n: number) => alben(log(...montage(n).map((t) => ergebnis(t))), LEER, SPAETER)[0].format
    expect([format(1), format(3), format(4), format(11), format(12)]).toEqual(["Demo", "Demo", "EP", "EP", "LP"])
  })

  it("verspricht das nächste Format nur, solange die Wochen reichen", () => {
    const neun = montage(9).map((t) => ergebnis(t))
    // Ab dem 28.11. sind KW 48 bis 53 offen: sechs Wochen.
    expect(alben(log(...neun), LEER, SPAETER)[0].naechstes).toEqual({ name: "LP", fehlt: 3 })
    // Ab dem 21.12. nur noch zwei.
    expect(alben(log(...neun), LEER, new Date("2026-12-21T12:00:00"))[0].naechstes).toBeNull()
    // Die laufende Woche zählt nicht mehr, wenn sie schon ein Track ist.
    const mitLaufender = [...neun, ergebnis("2026-12-21")]
    expect(alben(log(...mitLaufender), LEER, new Date("2026-12-21T20:00:00"))[0].naechstes).toBeNull()
  })

  it.each([1, 9, 28, 29, 53])("das Cover fasst %i Tracks", (n) => {
    const [a] = alben(log(...montage(Math.min(n, 52)).map((t) => ergebnis(t))), LEER, new Date("2027-02-01T12:00:00"))
    const tracks = Array.from({ length: n }, (_, i) => a.tracks[i % a.tracks.length])
    const pixel = coverPixel({ jahr: 2026, tracks })
    expect(pixel).toHaveLength(5 + n)
    for (const p of pixel) {
      expect(p.x).toBeGreaterThanOrEqual(0)
      expect(p.x + p.breite).toBeLessThanOrEqual(COVER_GROESSE)
      expect(p.y + p.hoehe).toBeLessThanOrEqual(COVER_GROESSE)
      expect(Number.isInteger(p.x) && p.breite >= 1).toBe(true)
    }
  })
})
