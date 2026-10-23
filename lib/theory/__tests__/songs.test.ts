import { describe, expect, it } from "vitest"
import { PENTATONIK, TOENE, midiAt, noteAt, pentatonikLage, sameGriff } from "../fretboard"
import { abstaendeOf, pausenOf, pruefeSong, toeneOf } from "../song"
import { SONGS, SONGS_BY_ID, songEintragSchema } from "../songs"

/**
 * Was jeder Song im Katalog einhalten muss.
 *
 * Die Songs schreibt die AI, und ein Skript, das nicht prüft, ist ein Wunsch.
 * Hier steht deshalb dreierlei: dass sie gültige Daten sind, dass sie üben,
 * was ihr Lernziel sagt, und dass sie zusammen den Weg bilden, den der
 * Katalog verspricht — wenige Töne zuerst, dann mehr, dann weitere Abstände.
 */

describe("Katalog", () => {
  it("hat Songs", () => {
    expect(SONGS.length).toBeGreaterThanOrEqual(3)
  })

  it("vergibt jede Id nur einmal", () => {
    expect(new Set(SONGS.map((s) => s.id)).size).toBe(SONGS.length)
    expect(Object.keys(SONGS_BY_ID)).toHaveLength(SONGS.length)
  })
})

describe.each(SONGS.map((eintrag) => [eintrag.id, eintrag] as const))("%s", (_id, eintrag) => {
  const { song } = eintrag

  it("besteht das Schema", () => {
    expect(songEintragSchema.safeParse(eintrag).success).toBe(true)
  })

  it("übt, was sein Lernziel sagt", () => {
    expect(pruefeSong(song)).toEqual([])
  })

  it("hat Hinweise und eine Erklärung, kurz genug für ein why-Feld", () => {
    expect(eintrag.cues.length).toBeGreaterThanOrEqual(2)
    // Zwei, drei Sätze, wie bei jedem Drill; was länger sein müsste, sind zwei Songs.
    expect(eintrag.why.split(/(?<=[.!?])\s+/).length).toBeLessThanOrEqual(4)
  })

  it("beginnt mit einem Tempo unter dem Zieltempo", () => {
    expect(eintrag.startBpm).toBeLessThan(eintrag.targetBpm)
  })

  it("hört auf dem Grundton auf", () => {
    const letzte = song.noten[song.noten.length - 1]
    expect(noteAt(letzte.griff)).toBe(song.grundton)
  })

  it("bleibt in Lage 1 der Moll-Pentatonik", () => {
    // Die Hand wandert nicht: das ist der Punkt dieser Songs, und ein Ton
    // außerhalb wäre ein Lagenwechsel, den niemand angekündigt hat.
    const lage = pentatonikLage(song.grundton, 1)
    for (const note of song.noten) {
      expect(lage.some((griff) => sameGriff(griff, note.griff))).toBe(true)
    }
  })

  it("enthält nur Töne der Moll-Pentatonik", () => {
    const wurzel = TOENE.indexOf(song.grundton)
    for (const note of song.noten) {
      const stufe = (((midiAt(note.griff) - wurzel) % 12) + 12) % 12
      expect(PENTATONIK).toContain(stufe)
    }
  })

  it("füllt jeden Takt lückenlos mit Noten und Pausen", () => {
    const belegt = new Array(song.takte * 8).fill(0)
    for (const n of song.noten) for (let i = 0; i < n.dauer; i += 1) belegt[n.start + i] += 1
    for (const p of pausenOf(song)) for (let i = 0; i < p.dauer; i += 1) belegt[p.start + i] += 1
    expect(belegt.every((x) => x === 1)).toBe(true)
  })
})

describe("der Weg durch den Katalog", () => {
  const [eins, zwei, drei] = SONGS.map((s) => s.song)

  it("fängt mit wenigen Tönen an und nimmt in jedem Song welche dazu", () => {
    expect(toeneOf(eins)).toHaveLength(3)
    expect(toeneOf(zwei).length).toBeGreaterThan(toeneOf(eins).length)
    expect(toeneOf(drei).length).toBeGreaterThan(toeneOf(zwei).length)
    for (const ton of toeneOf(eins)) expect(toeneOf(zwei)).toContain(ton)
    for (const ton of toeneOf(zwei)) expect(toeneOf(drei)).toContain(ton)
  })

  it("bleibt in den ersten beiden Songs bei kleinen Abständen", () => {
    // Sekunde und kleine Terz. Quarte und Quinte kommen erst im dritten.
    for (const song of [eins, zwei]) {
      for (const abstand of abstaendeOf(song)) expect([2, 3]).toContain(abstand)
    }
  })

  it("bringt im dritten Song Quarte und Quinte", () => {
    expect(abstaendeOf(drei)).toContain(5)
    expect(abstaendeOf(drei)).toContain(7)
  })

  it("führt die Pause im zweiten Song ein und in keinem anderen", () => {
    expect(pausenOf(eins)).toEqual([])
    expect(pausenOf(zwei).length).toBeGreaterThan(0)
    expect(pausenOf(drei)).toEqual([])
  })

  it("führt die Achtel im zweiten Song ein", () => {
    expect(eins.noten.some((n) => n.dauer === 1)).toBe(false)
    expect(zwei.noten.some((n) => n.dauer === 1)).toBe(true)
  })
})
