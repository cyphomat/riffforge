import { describe, expect, it } from "vitest"
import {
  abstaendeOf,
  pausenOf,
  pruefeSong,
  notenwerteOf,
  songSchema,
  spruenge,
  toeneOf,
  type Dauer,
  type Song,
  type SongNote,
} from "../song"

/**
 * Ein Song von Hand gebaut, an dem sich alles nachrechnen lässt.
 *
 * Alles auf der hohen e-Saite: A4 (Bund 5), C5 (8), D5 (10), E5 (12). Die
 * Sprünge sind damit Kopfrechnen, und die Töne die A-Moll-Pentatonik ohne G.
 *
 *   Takt 1:  A(Viertel) C(Viertel) A(Achtel) C(Achtel) Pause(Viertel)
 *   Takt 2:  D(Halbe) E(Halbe)
 */
function note(bund: number, start: number, dauer: Dauer, artikulation: SongNote["artikulation"] = "normal"): SongNote {
  return { griff: { saite: 1, bund }, start, dauer, artikulation }
}

const NOTEN: SongNote[] = [note(5, 0, 2), note(8, 2, 2), note(5, 4, 1), note(8, 5, 1), note(10, 8, 4), note(12, 12, 4)]

const SONG: Song = {
  grundton: "A",
  takte: 2,
  noten: NOTEN,
  lernziel: { toene: ["A", "C", "D", "E"], abstaende: [2, 3], notenwerte: [4, 2, 1] },
}

const mit = (aenderung: Partial<Song>): Song => ({ ...SONG, ...aenderung })

describe("Auswertung", () => {
  it("findet die Töne, geordnet ab C", () => {
    expect(toeneOf(SONG)).toEqual(["C", "D", "E", "A"])
  })

  it("findet die Notenwerte, groß nach klein", () => {
    expect(notenwerteOf(SONG)).toEqual([4, 2, 1])
  })

  it("rechnet die Sprünge in Halbtönen, ohne Richtung", () => {
    // A→C 3, C→A 3, A→C 3, C→D 2, D→E 2
    expect(spruenge(SONG)).toEqual([3, 3, 3, 2, 2])
  })

  it("nennt jeden vorkommenden Abstand einmal, aufsteigend", () => {
    expect(abstaendeOf(SONG)).toEqual([2, 3])
  })

  it("zählt über Saiten hinweg nach Tonhöhe, nicht nach Bund", () => {
    // e-Saite Bund 5 = A4, H-Saite Bund 10 = A4 — derselbe Ton, Sprung null.
    const song = mit({
      noten: [note(5, 0, 2), { griff: { saite: 2, bund: 10 }, start: 2, dauer: 2, artikulation: "normal" }],
    })
    expect(spruenge(song)).toEqual([0])
  })
})

describe("pausenOf", () => {
  it("findet die Lücke zwischen zwei Noten", () => {
    expect(pausenOf(SONG)).toEqual([{ start: 6, dauer: 2 }])
  })

  it("füllt ungerade Lücken mit Werten, die auf ihrem Raster beginnen", () => {
    // Die Note beginnt auf Achtel 3: davor eine Viertel (0), dann eine Achtel (2).
    const song = mit({ takte: 1, noten: [note(5, 3, 1)] })
    expect(pausenOf(song).slice(0, 2)).toEqual([
      { start: 0, dauer: 2 },
      { start: 2, dauer: 1 },
    ])
  })

  it("setzt eine Halbe nur auf Eins oder Drei und nie über die Taktgrenze", () => {
    // Lücke von Achtel 2 bis 10: Viertel (2), Halbe (4), Viertel (8) — nichts über die 8 hinweg.
    const song = mit({ takte: 2, noten: [note(5, 0, 2), note(8, 10, 2), note(5, 12, 4)] })
    expect(pausenOf(song)).toEqual([
      { start: 2, dauer: 2 },
      { start: 4, dauer: 4 },
      { start: 8, dauer: 2 },
    ])
  })

  it("füllt auch den Rest des letzten Takts", () => {
    const song = mit({ takte: 1, noten: [note(5, 0, 2)] })
    expect(pausenOf(song)).toEqual([
      { start: 2, dauer: 2 },
      { start: 4, dauer: 4 },
    ])
  })

  it("hinterlässt zusammen mit den Noten keine Lücke im Takt", () => {
    const belegt = new Array(SONG.takte * 8).fill(0)
    for (const n of SONG.noten) for (let i = 0; i < n.dauer; i += 1) belegt[n.start + i] += 1
    for (const p of pausenOf(SONG)) for (let i = 0; i < p.dauer; i += 1) belegt[p.start + i] += 1
    expect(belegt.every((x) => x === 1)).toBe(true)
  })
})

describe("songSchema", () => {
  it("nimmt den Song an", () => {
    expect(songSchema.safeParse(SONG).success).toBe(true)
  })

  it("lehnt eine Dauer ab, die es nicht gibt", () => {
    const kaputt = { ...SONG, noten: [{ ...NOTEN[0], dauer: 3 }] }
    expect(songSchema.safeParse(kaputt).success).toBe(false)
  })

  it("lehnt Stellen ab, die es auf dem Hals nicht gibt", () => {
    expect(songSchema.safeParse({ ...SONG, noten: [{ ...NOTEN[0], griff: { saite: 7, bund: 3 } }] }).success).toBe(false)
    expect(songSchema.safeParse({ ...SONG, noten: [{ ...NOTEN[0], griff: { saite: 1, bund: 16 } }] }).success).toBe(false)
  })

  it("verlangt mindestens eine Note", () => {
    expect(songSchema.safeParse({ ...SONG, noten: [] }).success).toBe(false)
  })
})

describe("pruefeSong", () => {
  it("lässt den Song durch", () => {
    expect(pruefeSong(SONG)).toEqual([])
  })

  it("erkennt Noten, die sich überlappen", () => {
    const song = mit({ noten: [note(5, 0, 4), note(8, 2, 2)], lernziel: { toene: ["A", "C"], abstaende: [3], notenwerte: [4, 2] } })
    expect(pruefeSong(song)).toEqual(["Note 2: beginnt vor dem Ende der vorigen Note"])
  })

  it("erkennt Noten, die nicht auf ihrem Raster beginnen", () => {
    // Eine Halbe auf Achtel 2 würde über den Schlag hinweg klingen.
    const song = mit({ takte: 1, noten: [note(5, 0, 2), note(8, 2, 4)], lernziel: { toene: ["A", "C"], abstaende: [3], notenwerte: [4, 2] } })
    expect(pruefeSong(song)).toEqual(["Note 2: Halbe darf nicht auf Achtel 2 beginnen"])
  })

  it("erkennt Noten, die über den letzten Takt hinausragen", () => {
    const song = mit({ takte: 1, noten: [note(5, 4, 8)], lernziel: { toene: ["A"], abstaende: [], notenwerte: [8] } })
    expect(pruefeSong(song)).toEqual(["Note 1: Ganze darf nicht auf Achtel 4 beginnen", "Note 1: ragt über das Ende hinaus"])
  })

  it("lässt eine Ganze am Taktanfang zu", () => {
    const song = mit({ takte: 2, noten: [note(5, 0, 8), note(8, 8, 8)], lernziel: { toene: ["A", "C"], abstaende: [3], notenwerte: [8] } })
    expect(pruefeSong(song)).toEqual([])
  })

  it("verlangt, dass das Lernziel die Töne trifft", () => {
    const zuViele = mit({ lernziel: { ...SONG.lernziel, toene: ["A", "C", "D", "E", "G"] } })
    const zuWenige = mit({ lernziel: { ...SONG.lernziel, toene: ["A", "C", "D"] } })
    expect(pruefeSong(zuViele)).toHaveLength(1)
    expect(pruefeSong(zuWenige)).toHaveLength(1)
    expect(pruefeSong(zuViele)[0]).toContain("Lernziel nennt die Töne")
  })

  it("verlangt, dass das Lernziel die Abstände trifft", () => {
    expect(pruefeSong(mit({ lernziel: { ...SONG.lernziel, abstaende: [3, 5] } }))).toEqual([
      "Lernziel nennt die Abstände 3 5, gespielt werden 2 3",
    ])
  })

  it("verlangt auch den kleineren Abstand, nicht nur den größten", () => {
    expect(pruefeSong(mit({ lernziel: { ...SONG.lernziel, abstaende: [3] } }))).toHaveLength(1)
  })

  it("verlangt, dass das Lernziel die Notenwerte trifft", () => {
    const probleme = pruefeSong(mit({ lernziel: { ...SONG.lernziel, notenwerte: [2, 1] } }))
    expect(probleme).toHaveLength(1)
    expect(probleme[0]).toContain("Lernziel nennt die Notenwerte")
  })

  it("meldet alle Fehler eines Songs auf einmal", () => {
    const song = mit({ lernziel: { toene: ["A"], abstaende: [], notenwerte: [1] } })
    expect(pruefeSong(song)).toHaveLength(3)
  })

  describe("Bindungen", () => {
    const lernziel = { toene: ["A", "C"] as Song["lernziel"]["toene"], abstaende: [3], notenwerte: [2] as Dauer[] }
    const song = (zweite: SongNote): Song => mit({ takte: 1, noten: [note(5, 0, 2), zweite], lernziel })

    it("lässt einen Hammer-on aufwärts auf derselben Saite zu", () => {
      expect(pruefeSong(song(note(8, 2, 2, "hammer")))).toEqual([])
    })

    it("lässt einen Pull-off abwärts zu", () => {
      const abwaerts = mit({ takte: 1, noten: [note(8, 0, 2), note(5, 2, 2, "pull")], lernziel })
      expect(pruefeSong(abwaerts)).toEqual([])
    })

    it("lehnt einen Hammer-on abwärts ab", () => {
      const falsch = mit({ takte: 1, noten: [note(8, 0, 2), note(5, 2, 2, "hammer")], lernziel })
      expect(pruefeSong(falsch)).toHaveLength(1)
    })

    it("lehnt eine Bindung über einen Saitenwechsel ab", () => {
      const andereSaite: SongNote = { griff: { saite: 2, bund: 6 }, start: 2, dauer: 2, artikulation: "hammer" }
      expect(pruefeSong(mit({ takte: 1, noten: [note(5, 0, 2), andereSaite], lernziel: { ...lernziel, toene: ["A", "F"] } }))).toHaveLength(2)
    })

    it("lehnt eine Bindung über eine Pause ab", () => {
      const song2 = mit({ takte: 1, noten: [note(5, 0, 2), note(8, 4, 2, "hammer")], lernziel })
      expect(pruefeSong(song2)).toHaveLength(1)
    })

    it("lehnt eine Bindung auf der ersten Note ab", () => {
      const song3 = mit({ takte: 1, noten: [note(5, 0, 2, "pull")], lernziel: { toene: ["A"], abstaende: [], notenwerte: [2] } })
      expect(pruefeSong(song3)).toHaveLength(1)
    })
  })
})
