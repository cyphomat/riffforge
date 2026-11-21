import { describe, expect, it } from "vitest"
import { ACHTEL_JE_TAKT } from "@/lib/theory/song"
import { SONGS } from "@/lib/theory/songs"
import { bassAblauf, grundtonMidi, schlagzeugAblauf } from "../band-ablauf"
import { bauAblauf } from "../song-ablauf"

const song = SONGS[0].song
const BPM = 120 // 0,25 s je Achtel

describe("Das Schlagzeug", () => {
  const schlaege = schlagzeugAblauf(song, BPM)
  const art = (a: string) => schlaege.filter((s) => s.art === a)

  it("spielt je Takt zwei Kicks, zwei Snares und acht Hi-Hats", () => {
    expect(art("kick")).toHaveLength(2 * song.takte)
    expect(art("snare")).toHaveLength(2 * song.takte)
    expect(art("hat")).toHaveLength(ACHTEL_JE_TAKT * song.takte)
  })

  it("setzt die Kick auf Eins und Drei, die Snare auf Zwei und Vier", () => {
    expect(art("kick").slice(0, 2).map((s) => s.zeit)).toEqual([0, 1])
    expect(art("snare").slice(0, 2).map((s) => s.zeit)).toEqual([0.5, 1.5])
  })

  it("bleibt im Durchgang, damit die Schleife nahtlos anschließt", () => {
    const dauer = bauAblauf(song, BPM).dauer
    for (const s of schlaege) {
      expect(s.zeit).toBeGreaterThanOrEqual(0)
      expect(s.zeit).toBeLessThan(dauer)
      expect(s.laut).toBeGreaterThan(0)
      expect(s.laut).toBeLessThanOrEqual(1)
    }
  })

  it("folgt dem Tempo", () => {
    const langsam = schlagzeugAblauf(song, 60)
    expect(langsam.find((s) => s.art === "snare")!.zeit).toBeCloseTo(1)
  })
})

describe("Der Bass", () => {
  it("spielt den Grundton auf jedem Schlag, eine Note je Viertel", () => {
    const noten = bassAblauf(song, BPM)
    expect(noten).toHaveLength(4 * song.takte)
    expect(new Set(noten.map((n) => n.midi))).toEqual(new Set([grundtonMidi(song.grundton)]))
    expect(noten.slice(0, 3).map((n) => n.zeit)).toEqual([0, 0.5, 1])
  })

  it("lässt zwischen zwei Noten Luft und bleibt im Durchgang", () => {
    const dauer = bauAblauf(song, BPM).dauer
    const noten = bassAblauf(song, BPM)
    for (const [i, n] of noten.entries()) {
      if (noten[i + 1]) expect(n.zeit + n.dauer).toBeLessThan(noten[i + 1].zeit)
      expect(n.zeit).toBeLessThan(dauer)
    }
  })

  it("liegt in der Oktave von C2 bis H2: E ist 40", () => {
    expect(grundtonMidi("C")).toBe(36)
    expect(grundtonMidi("E")).toBe(40)
    expect(grundtonMidi("A")).toBe(45)
  })
})
