import { afterEach, beforeEach, describe, expect, it } from "vitest"
import {
  LEERES_REPERTOIRE,
  repertoireAusText,
  repertoireSongSchema,
  songEntfernen,
  songSpeichern,
  statusSetzen,
  type Abschnitt,
  type RepertoireSong,
} from "../repertoire"
import { merkeAbschnittStatus, merkeSong, repertoire, vergissSong } from "@/lib/storage/lokal"
import { allesLoeschen } from "@/lib/storage/loeschen"

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

const gilt = (s: RepertoireSong) => repertoireSongSchema.safeParse(s).success
const mit = (...abschnitte: Abschnitt[]) => gilt(song({ abschnitte }))

const MAI = new Date("2026-05-01T10:00:00Z")
const JUNI = new Date("2026-06-01T10:00:00Z")
const JULI = new Date("2026-07-01T10:00:00Z")

describe("Abschnitte", () => {
  it("liegen innerhalb der Takte", () => {
    expect(mit(abschnitt({ von: 25, bis: 32 }))).toBe(true)
    expect(mit(abschnitt({ von: 25, bis: 33 }))).toBe(false)
    expect(mit(abschnitt({ von: 0, bis: 4 }))).toBe(false)
  })

  it("haben von <= bis", () => {
    expect(mit(abschnitt({ von: 4, bis: 4 }))).toBe(true)
    expect(mit(abschnitt({ von: 5, bis: 4 }))).toBe(false)
  })

  it("überlappen nicht auf derselben Spur, auch nicht an einem Takt", () => {
    const zweiter = (von: number, spur = "Rhythmus") => abschnitt({ id: "a2", name: "Refrain", von, bis: 16, spur })
    expect(mit(abschnitt(), zweiter(9))).toBe(true)
    expect(mit(abschnitt(), zweiter(8))).toBe(false)
    expect(mit(abschnitt(), zweiter(8, "rhythmus "))).toBe(false)
    expect(mit(zweiter(8), abschnitt())).toBe(false)
  })

  it("dürfen auf verschiedenen Spuren dieselben Takte belegen", () => {
    expect(mit(abschnitt(), abschnitt({ id: "a2", name: "Solo", spur: "Lead" }))).toBe(true)
  })

  it("brauchen eine eigene Kennung", () => {
    expect(mit(abschnitt(), abschnitt({ von: 9, bis: 16 }))).toBe(false)
  })

  it("nehmen nur Techniken aus dem Drill-Katalog, ohne Warm-up", () => {
    expect(mit(abschnitt({ technikTags: ["gallop", "tremolo"] }))).toBe(true)
    expect(mit(abschnitt({ technikTags: ["sweep" as never] }))).toBe(false)
    expect(mit(abschnitt({ technikTags: ["warmup" as never] }))).toBe(false)
  })
})

describe("Song", () => {
  it("merkt sich nur den Dateinamen, keinen Pfad", () => {
    expect(gilt(song({ quelle: "/Users/jemand/testlied.gp5" }))).toBe(false)
    expect(gilt(song({ quelle: "ordner\\testlied.gp5" }))).toBe(false)
  })

  it("prüft Stimmung, Taktarten und Sound", () => {
    expect(gilt(song({ stimmung: ["B", "E", "A", "D", "G", "B", "E"], taktarten: ["4/4", "7/8"] }))).toBe(true)
    expect(gilt(song({ stimmung: ["E", "A", "D"] }))).toBe(false)
    expect(gilt(song({ taktarten: ["4/3"] }))).toBe(false)
    expect(gilt(song({ sound: {} }))).toBe(true)
    expect(gilt(song({ sound: { amp: "Testamp", gain: { von: 4, bis: 6 }, eq: { mitten: 7 } } }))).toBe(true)
    expect(gilt(song({ sound: { gain: { von: 6, bis: 4 } } }))).toBe(false)
  })
})

describe("Statuswechsel", () => {
  const anfang = songSpeichern(LEERES_REPERTOIRE, song(), MAI)
  const stand = (r: typeof anfang) => r.songs[0].abschnitte[0]

  it("behält das erste Datum, auch hin und zurück", () => {
    let r = statusSetzen(anfang, "testlied", "a1", "langsam", MAI)
    r = statusSetzen(r, "testlied", "a1", "sitzt", JUNI)
    r = statusSetzen(r, "testlied", "a1", "langsam", JULI)
    r = statusSetzen(r, "testlied", "a1", "sitzt", JULI)
    expect(stand(r).erstmals).toEqual({ langsam: MAI.toISOString(), sitzt: JUNI.toISOString() })
    expect(stand(statusSetzen(r, "testlied", "a1", "neu", JULI)).erstmals).toEqual(stand(r).erstmals)
  })

  it("behält die Daten, wenn der Song neu gespeichert wird", () => {
    const r = statusSetzen(anfang, "testlied", "a1", "sitzt", MAI)
    const neu = songSpeichern(r, song({ titel: "Testlied (live)", abschnitte: [abschnitt({ status: "sitzt" })] }), JUNI)
    expect(neu.songs).toHaveLength(1)
    expect(neu.songs[0].titel).toBe("Testlied (live)")
    expect(stand(neu).erstmals.sitzt).toBe(MAI.toISOString())
  })

  it("datiert einen Abschnitt, der schon mit Status angelegt wird", () => {
    const r = songSpeichern(LEERES_REPERTOIRE, song({ abschnitte: [abschnitt({ status: "langsam" })] }), MAI)
    expect(stand(r).erstmals).toEqual({ langsam: MAI.toISOString() })
  })

  it("ändert nichts bei unbekannter Kennung, gleichem Status oder ungültigem Song", () => {
    expect(statusSetzen(anfang, "nichts", "a1", "sitzt")).toBe(anfang)
    expect(statusSetzen(anfang, "testlied", "nichts", "sitzt")).toBe(anfang)
    expect(statusSetzen(anfang, "testlied", "a1", "neu")).toBe(anfang)
    expect(songSpeichern(anfang, song({ takte: 4 }))).toBe(anfang)
    expect(songEntfernen(anfang, "nichts")).toBe(anfang)
    expect(songEntfernen(anfang, "testlied").songs).toEqual([])
  })
})

describe("Kaputte Daten", () => {
  it("fallen auf ein leeres Repertoire zurück", () => {
    const doppelt = JSON.stringify({ songs: [song(), song()] })
    const ungueltig = JSON.stringify({ songs: [song({ takte: 4 })] })
    for (const roh of ["kein JSON", "null", "{}", doppelt, ungueltig]) {
      expect(repertoireAusText(roh)).toEqual({ repertoire: LEERES_REPERTOIRE, kaputt: true })
    }
    expect(repertoireAusText(null)).toEqual({ repertoire: LEERES_REPERTOIRE, kaputt: false })
  })
})

describe("Das Repertoire auf dem Gerät", () => {
  const KEY = "mga.repertoire.v1"
  const werte = new Map<string, string>()
  let voll = false
  const global = globalThis as { window?: unknown }

  beforeEach(() => {
    werte.clear()
    voll = false
    global.window = {
      localStorage: {
        getItem: (k: string) => werte.get(k) ?? null,
        setItem: (k: string, v: string) => {
          if (voll) throw new Error("QuotaExceededError")
          werte.set(k, v)
        },
        removeItem: (k: string) => void werte.delete(k),
      },
    }
  })
  afterEach(() => {
    delete global.window
  })

  it("speichert, ändert und entfernt", () => {
    expect(merkeSong(song(), MAI)).toBe(true)
    expect(merkeAbschnittStatus("testlied", "a1", "sitzt", JUNI)).toBe(true)
    expect(repertoire().songs[0].abschnitte[0].erstmals.sitzt).toBe(JUNI.toISOString())
    expect(vergissSong("testlied")).toBe(true)
    expect(repertoire()).toEqual(LEERES_REPERTOIRE)
  })

  it("meldet, wenn nichts gespeichert wurde", () => {
    expect(merkeSong(song({ takte: 4 }))).toBe(false)
    voll = true
    expect(merkeSong(song())).toBe(false)
  })

  it("legt Kaputtes beiseite, bevor es überschrieben wird", () => {
    werte.set(KEY, "kein JSON")
    expect(repertoire()).toEqual(LEERES_REPERTOIRE)
    expect(merkeSong(song())).toBe(true)
    expect(werte.get(`${KEY}.broken`)).toBe("kein JSON")
  })

  it("überschreibt Kaputtes nicht, wenn das Beiseitelegen scheitert", () => {
    werte.set(KEY, "kein JSON")
    voll = true
    expect(merkeSong(song())).toBe(false)
    expect(werte.get(KEY)).toBe("kein JSON")
  })

  it("verschwindet beim Löschen, samt beiseitegelegter Kopie", () => {
    werte.set(KEY, "kein JSON")
    merkeSong(song())
    allesLoeschen()
    expect([...werte.keys()]).toEqual([])
  })
})
