import { describe, expect, it } from "vitest"
import { songTab } from "@/lib/theory/song-tab"
import { SONGS } from "@/lib/theory/songs"
import { buildDrillSession, rangfolge } from "../builder"
import { ALLE_DRILLS_BY_ID, DRILLS } from "../drills"
import { SONG_DRILLS } from "../drills-songs"
import { EMPTY_LOG } from "../types"

/**
 * Die Songs als Drills: dass sie im Katalog stehen, wo der Scheduler sie
 * findet, und dass nichts doppelt oder abweichend geführt wird.
 */

describe("SONG_DRILLS", () => {
  it("gibt jedem Song einen Drill mit derselben Nummer", () => {
    expect(SONG_DRILLS.map((d) => d.id)).toEqual(SONGS.map((s) => s.id))
  })

  it("steht im Hauptkatalog, nicht daneben", () => {
    for (const drill of SONG_DRILLS) expect(DRILLS).toContain(drill)
  })

  it("vergibt keine Nummer, die es schon gibt", () => {
    const nummern = DRILLS.map((d) => d.id)
    expect(new Set(nummern).size).toBe(nummern.length)
    for (const drill of SONG_DRILLS) expect(ALLE_DRILLS_BY_ID[drill.id]).toBe(drill)
  })

  it("ist ein Riff der Pentatonik", () => {
    for (const drill of SONG_DRILLS) {
      expect(drill.kind).toBe("riff")
      expect(drill.technique).toBe("pentatonic")
    }
  })

  it("rechnet die Tabulatur aus den Noten, statt sie zu tippen", () => {
    for (const drill of SONG_DRILLS) {
      expect(drill.song).toBeDefined()
      expect(drill.tab).toBe(songTab(drill.song!))
    }
  })

  it("übernimmt Ziel, Hinweise, Erklärung und Tempo aus dem Eintrag", () => {
    SONGS.forEach((eintrag, i) => {
      const drill = SONG_DRILLS[i]
      expect(drill.title).toBe(eintrag.titel)
      expect(drill.goal).toBe(eintrag.ziel)
      expect(drill.cues).toEqual(eintrag.cues)
      expect(drill.why).toBe(eintrag.why)
      expect([drill.startBpm, drill.targetBpm]).toEqual([eintrag.startBpm, eintrag.targetBpm])
    })
  })

  it("lässt das Metronom Achtel klicken, wenn der Song Achtel hat, sonst Viertel", () => {
    expect(SONG_DRILLS.map((d) => d.subdivision)).toEqual([1, 2, 2])
    expect(SONG_DRILLS.every((d) => d.beatsPerBar === 4)).toBe(true)
  })

  it("kann der Scheduler als Riff ziehen", () => {
    const rang = rangfolge(DRILLS, "riff", EMPTY_LOG, new Date("2026-10-23"), () => 0, null)
    for (const drill of SONG_DRILLS) expect(rang).toContain(drill)
  })

  it("lässt sich einzeln üben, mit dem Song am Block", () => {
    const plan = buildDrillSession(EMPTY_LOG, "song-drei-toene")
    expect(plan?.blocks[0].drill.song).toBe(SONGS[0].song)
  })
})
