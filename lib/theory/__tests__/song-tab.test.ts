import { describe, expect, it } from "vitest"
import { SONGS } from "../songs"
import { songTab } from "../song-tab"
import type { Dauer, Song, SongNote } from "../song"

const note = (saite: SongNote["griff"]["saite"], bund: number, start: number, dauer: Dauer = 2): SongNote => ({
  griff: { saite, bund },
  start,
  dauer,
  artikulation: "normal",
})

const lernziel = { toene: ["A"] as Song["lernziel"]["toene"], abstaende: [], notenwerte: [2] as Dauer[] }
const song = (noten: SongNote[], takte = 1): Song => ({ grundton: "A", takte, noten, lernziel })

describe("songTab", () => {
  it("setzt jeden Bund auf Saite und Spalte seiner Note", () => {
    // „Drei Töne", erster Takt: A3 (D-Saite 7) auf Achtel 0, C4 (G-Saite 5) auf 4, D4 (G-Saite 7) auf 6.
    const [erster] = songTab(SONGS[0].song).split("\n\n")
    expect(erster).toBe(
      [
        "e|----------------|",
        "B|----------------|",
        "G|---------5---7--|",
        "D|-7--------------|",
        "A|----------------|",
        "E|----------------|",
      ].join("\n"),
    )
  })

  it("lässt jede Zeile gleich lang sein", () => {
    for (const e of SONGS) {
      for (const zeile of songTab(e.song).split("\n").filter(Boolean)) {
        expect(zeile.length).toBe(songTab(e.song).split("\n")[0].length)
      }
    }
  })

  it("bricht um, wo es aufs Handy nicht mehr passt: ein Takt je System bei einstelligen Bünden", () => {
    // 2 + 8 Spalten zu zwei Zeichen + 1 = 19 Zeichen für einen Takt, 36 für zwei.
    expect(songTab(SONGS[0].song).split("\n\n")).toHaveLength(2)
    expect(songTab(SONGS[2].song).split("\n\n")).toHaveLength(4)
  })

  it("hält jede Zeile auf dem Handy", () => {
    for (const e of SONGS) {
      for (const zeile of songTab(e.song).split("\n").filter(Boolean)) expect(zeile.length).toBeLessThanOrEqual(33)
    }
  })

  it("macht die Spalten breiter, sobald ein zweistelliger Bund vorkommt", () => {
    const [zeile] = songTab(song([note(1, 12, 0)])).split("\n")
    // Drei Zeichen je Spalte: 2 + 8 · 3 + 1.
    expect(zeile.length).toBe(2 + 8 * 3 + 1)
    expect(zeile).toContain("-12")
  })

  it("zeigt jede Note einmal", () => {
    for (const e of SONGS) {
      const ziffern = songTab(e.song).split("\n").map((z) => z.slice(2)).join("").replace(/[-|]/g, "")
      expect(ziffern.length).toBe(e.song.noten.reduce((s, n) => s + `${n.griff.bund}`.length, 0))
    }
  })

  it("lässt Pausen leer", () => {
    // Nur Achtel 0 gespielt: alle anderen Spalten bleiben Striche.
    const zeilen = songTab(song([note(1, 5, 0)])).split("\n")
    expect(zeilen[0]).toBe("e|-5--------------|")
  })
})
