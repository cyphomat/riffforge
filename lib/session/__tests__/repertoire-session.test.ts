import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { briefingFor } from "../briefing"
import { buildSession, MAX_AM_STUECK, tagesZufall } from "../builder"
import { aufnaeher, TIGHT_N } from "../merch"
import {
  abschnittGeuebt,
  songSpeichern,
  type Abschnitt,
  type Repertoire,
  type RepertoireSong,
} from "../repertoire"
import {
  mitRepertoire,
  repertoireEintrag,
  schlaegeJeTakt,
  waehleAbschnitt,
} from "../repertoire-session"
import { drillVerlaeufe } from "../rueckblick"
import { sessionStandSchema } from "../session-stand"
import { drillResultSchema, EMPTY_LOG, type DrillResult, type PracticeLog } from "../types"
import { combo, wochenTreffer } from "../wochengegner"
import { merkeAbschnittGeuebt, merkeSong, repertoire } from "@/lib/storage/lokal"
import { THEORY_CARDS } from "@/lib/theory/cards"
import { EMPTY_THEORY_LOG } from "@/lib/theory/types"

/** All songs here are made up: real song data never goes into this repository. */

const JETZT = new Date(2026, 10, 20, 19, 0, 0)
const vor = (tage: number) => new Date(2026, 10, 20 - tage, 19, 0, 0).toISOString()

function abschnitt(id: string, teil: Partial<Abschnitt> = {}): Abschnitt {
  const nr = Number(id.replace(/\D/g, "")) || 1
  return {
    id,
    name: `Teil ${id}`,
    von: nr,
    bis: nr,
    spur: "Rhythmus",
    status: "neu",
    uebetempoProzent: 70,
    technikTags: ["gallop"],
    erstmals: {},
    ...teil,
  }
}

function song(abschnitte: Abschnitt[], teil: Partial<RepertoireSong> = {}): RepertoireSong {
  return {
    id: "testlied",
    titel: "Testlied",
    band: "Die Platzhalter",
    tempoHeader: 120,
    stimmung: ["D", "A", "D", "G", "B", "E"],
    takte: 32,
    taktarten: ["4/4"],
    quelle: "testlied.gp5",
    abschnitte,
    ...teil,
  }
}

const rep = (...abschnitte: Abschnitt[]): Repertoire => ({ songs: [song(abschnitte)] })
const gewaehlt = (r: Repertoire) => waehleAbschnitt(r, JETZT)?.abschnittId ?? null

describe("Auswahl", () => {
  it("wählt nichts ohne Repertoire oder ohne Abschnitte", () => {
    expect(gewaehlt({ songs: [] })).toBeNull()
    expect(gewaehlt(rep())).toBeNull()
  })

  it("nimmt neue Abschnitte in Listenreihenfolge, bis drei in Arbeit sind", () => {
    const r = rep(abschnitt("a1", { zuletzt: vor(2) }), abschnitt("a2", { zuletzt: vor(1) }), abschnitt("a3"), abschnitt("a4"))
    expect(gewaehlt(r)).toBe("a3")
  })

  it("nimmt bei drei begonnenen den am längsten nicht geübten und keinen neuen", () => {
    const r = rep(
      abschnitt("a1", { zuletzt: vor(2) }),
      abschnitt("a2", { status: "langsam", zuletzt: vor(5) }),
      abschnitt("a3", { zuletzt: vor(1) }),
      abschnitt("a4"),
    )
    expect(gewaehlt(r)).toBe("a2")
  })

  it("zieht Offenes dem vor, was sitzt und noch nicht fällig ist", () => {
    expect(gewaehlt(rep(abschnitt("a1", { status: "sitzt", zuletzt: vor(13) }), abschnitt("a2")))).toBe("a2")
  })

  it("wiederholt nach 14 Tagen vor allem Offenen", () => {
    expect(gewaehlt(rep(abschnitt("a1"), abschnitt("a2", { status: "sitzt", zuletzt: vor(14) })))).toBe("a2")
  })

  it("wiederholt höchstens einmal in 7 Tagen", () => {
    const faellig = abschnitt("a2", { status: "sitzt", zuletzt: vor(30) })
    const gerade = (tage: number) => abschnitt("a3", { status: "sitzt", zuletzt: vor(tage), wiederholt: vor(tage) })
    expect(gewaehlt(rep(abschnitt("a1"), faellig, gerade(6)))).toBe("a1")
    expect(gewaehlt(rep(abschnitt("a1"), faellig, gerade(7)))).toBe("a2")
    expect(gewaehlt(rep(faellig, gerade(6)))).toBeNull()
  })

  it("lässt die Session in Ruhe, wenn alles sitzt und nichts fällig ist", () => {
    expect(gewaehlt(rep(abschnitt("a1", { status: "sitzt", zuletzt: vor(3) })))).toBeNull()
  })
})

describe("Üben merken", () => {
  it("setzt Stand und Datum", () => {
    const r = abschnittGeuebt(rep(abschnitt("a1")), "testlied", "a1", "langsam", JETZT)
    const a = r.songs[0].abschnitte[0]
    expect(a.status).toBe("langsam")
    expect(a.zuletzt).toBe(JETZT.toISOString())
    expect(a.erstmals.langsam).toBe(JETZT.toISOString())
    expect(a.wiederholt).toBeUndefined()
  })

  it("zählt als Wiederholung nur, was vorher schon saß", () => {
    const neu = abschnittGeuebt(rep(abschnitt("a1")), "testlied", "a1", "sitzt", JETZT)
    expect(neu.songs[0].abschnitte[0].wiederholt).toBeUndefined()
    const alt = abschnittGeuebt(rep(abschnitt("a1", { status: "sitzt" })), "testlied", "a1", "langsam", JETZT)
    expect(alt.songs[0].abschnitte[0].wiederholt).toBe(JETZT.toISOString())
  })

  it("ändert bei unbekannter Kennung nichts", () => {
    const r = rep(abschnitt("a1"))
    expect(abschnittGeuebt(r, "testlied", "weg", "sitzt", JETZT)).toBe(r)
  })

  it("behält die Daten, wenn der Song bearbeitet wird", () => {
    const geuebt = abschnittGeuebt(rep(abschnitt("a1")), "testlied", "a1", "neu", JETZT)
    const bearbeitet = songSpeichern(geuebt, song([abschnitt("a1", { name: "Anders" })]), JETZT)
    expect(bearbeitet.songs[0].abschnitte[0].zuletzt).toBe(JETZT.toISOString())
  })
})

describe("Platz im Plan", () => {
  const plan = buildSession(EMPTY_LOG, { minutes: 15, random: tagesZufall(JETZT) }).blocks
  const wahl = { songId: "testlied", abschnittId: "a1" }
  const r = rep(abschnitt("a1"))

  it("ersetzt die letzte Riff-Runde, ohne die Form zu ändern", () => {
    const neu = mitRepertoire(plan, r, wahl)
    expect(neu).toHaveLength(plan.length)
    expect(neu.at(-1)!.repertoire?.abschnittId).toBe("a1")
    expect(neu.at(-1)!.seconds).toBe(plan.at(-1)!.seconds)
    expect(neu.at(-1)!.seconds).toBeLessThanOrEqual(MAX_AM_STUECK)
    expect(neu.at(-1)!.bpm).toBe(84)
    expect(neu.filter((b) => b.repertoire)).toHaveLength(1)
  })

  it("macht die verbliebene Runde des Katalog-Riffs zur letzten, damit sie bewertet wird", () => {
    const riff = plan.at(-1)!.drill.id
    const uebrig = mitRepertoire(plan, r, wahl).filter((b) => b.drill.id === riff)
    expect(uebrig.map((b) => [b.round, b.rounds])).toEqual([[1, 1]])
  })

  it("lässt den Plan ohne Wahl, bei gelöschtem Abschnitt und bei nur einer Riff-Runde stehen", () => {
    expect(mitRepertoire(plan, r, null)).toBe(plan)
    expect(mitRepertoire(plan, r, { songId: "testlied", abschnittId: "weg" })).toBe(plan)
    const kurz = buildSession(EMPTY_LOG, { minutes: 5, random: tagesZufall(JETZT) }).blocks
    expect(mitRepertoire(kurz, r, wahl)).toBe(kurz)
  })

  it("hält das Tempo in den Grenzen des Logs", () => {
    const schnell: Repertoire = { songs: [song([abschnitt("a1", { uebetempoProzent: 120 })], { tempoHeader: 400 })] }
    const block = mitRepertoire(plan, schnell, wahl).at(-1)!
    expect(block.bpm).toBe(300)
    expect(block.repertoire!.uebetempo).toBe(480)
  })

  it("betont den Takt nur bei genau einer x/4-Taktart", () => {
    expect(schlaegeJeTakt(["3/4"])).toBe(3)
    expect(schlaegeJeTakt(["7/8"])).toBe(1)
    expect(schlaegeJeTakt(["4/4", "3/4"])).toBe(1)
  })
})

describe("Log", () => {
  const eintrag = repertoireEintrag(84, 180, JETZT)
  const sauber = (minute: number): DrillResult => ({
    drillId: "tech-downpicking",
    technique: "downpicking",
    bpm: 100,
    rating: 3,
    seconds: 180,
    at: new Date(2026, 10, 20, 18, minute).toISOString(),
  })
  const log = (...results: DrillResult[]): PracticeLog => ({ version: 1, results })

  it("nimmt den Eintrag an und nennt weder Song noch Abschnitt", () => {
    expect(drillResultSchema.parse(eintrag)).toEqual(eintrag)
    expect(Object.keys(eintrag).sort()).toEqual(["at", "bpm", "drillId", "rating", "seconds", "technique"])
    expect(JSON.stringify(eintrag)).not.toMatch(/testlied|platzhalter|teil|gp5/i)
  })

  it("zählt als Übungstag, aber nicht als sauberer Block", () => {
    const t = wochenTreffer(log(eintrag), EMPTY_THEORY_LOG, "2026-11-16")
    expect(t.tage).toBe(1)
    expect(t.sauber).toBe(0)
  })

  it("bricht weder die Combo noch den sauberen Tag", () => {
    const spaet = { ...sauber(50), at: new Date(2026, 10, 20, 19, 30).toISOString() }
    expect(combo([sauber(1), sauber(2), eintrag, spaet])).toBe(3)
    const tight = (l: PracticeLog) => aufnaeher(l, EMPTY_THEORY_LOG, THEORY_CARDS).find((a) => a.id === "tight")!
    const tage = (n: number, ...je: ((at: Date) => DrillResult)[]) =>
      log(...Array.from({ length: n }, (_, i) => je.map((f) => f(new Date(2026, 9, 1 + i, 19)))).flat())
    const gut = (at: Date) => ({ ...sauber(1), at: at.toISOString() })
    const song = (at: Date) => repertoireEintrag(84, 180, at)
    expect(tight(tage(TIGHT_N, gut, song)).verdient).toBeTruthy()
    expect(tight(tage(TIGHT_N, song)).verdient).toBeFalsy()
  })

  it("bestimmt nicht die Ansage", () => {
    const ansage = briefingFor(log(sauber(1), eintrag), JETZT)
    expect(ansage.tone).toBe("solide")
    expect(ansage.reason).not.toContain("Repertoire")
    expect(briefingFor(log(eintrag), JETZT).reason).toBe("Zuletzt Repertoire geübt. Da machen wir weiter.")
  })

  it("hat keinen Tempoverlauf", () => {
    expect(drillVerlaeufe(log(eintrag), JETZT)).toEqual([])
  })
})

describe("Speicher", () => {
  const werte = new Map<string, string>()
  const global = globalThis as { window?: unknown }
  beforeEach(() => {
    werte.clear()
    global.window = {
      localStorage: {
        getItem: (k: string) => werte.get(k) ?? null,
        setItem: (k: string, v: string) => void werte.set(k, v),
        removeItem: (k: string) => void werte.delete(k),
      },
    }
  })
  afterEach(() => {
    delete global.window
  })

  it("merkt Üben auf dem Gerät", () => {
    merkeSong(song([abschnitt("a1")]), JETZT)
    expect(merkeAbschnittGeuebt("testlied", "a1", "langsam", JETZT)).toBe(true)
    expect(repertoire().songs[0].abschnitte[0].zuletzt).toBe(JETZT.toISOString())
  })

  it("hält im Session-Stand nur Kennungen", () => {
    const stand = {
      version: 1,
      tag: "2026-11-20",
      minutes: 15,
      startedAt: JETZT.toISOString(),
      current: 2,
      erledigteEinschuebe: [],
      beantworteteFragen: 0,
      carried: {},
      repertoire: { songId: "testlied", abschnittId: "a1", titel: "Testlied" },
    }
    expect(sessionStandSchema.parse(stand).repertoire).toEqual({ songId: "testlied", abschnittId: "a1" })
  })
})
