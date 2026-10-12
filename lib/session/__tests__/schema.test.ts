import { describe, expect, it } from "vitest"
import { backupSchema } from "@/lib/backup"
import { profileSchema } from "../profile"
import { practiceLogSchema } from "../types"
import { theoryLogSchema } from "@/lib/theory/types"

/**
 * Das gespeicherte Format, festgehalten gegen die Bibliothek darunter.
 *
 * Was hier steht, liegt auf echten Geräten und in echten Datenrepos — es wurde
 * mit einer älteren Fassung von Zod geschrieben und muss mit jeder neueren
 * genauso gelesen werden. Angelegt beim Sprung von Zod 3 auf 4: die
 * Schemas haben die Umstellung ohne Änderung überstanden, und dieser Test
 * sorgt dafür, dass das beim nächsten Sprung nicht nur zufällig so ist.
 */

const eintrag = {
  drillId: "tech-downpicking",
  technique: "downpicking",
  bpm: 132,
  rating: 3,
  seconds: 312.5,
  at: "2026-07-02T18:04:11.000Z",
  timing: { hits: 46, expected: 48, spreadMs: 14.2, offsetMs: -6, score: 81, trend: "rushing" },
}
const ohneMikro = {
  drillId: "7-chug-b",
  technique: "palm-mute",
  bpm: 90,
  rating: 2,
  seconds: 180,
  at: "2026-07-03T19:00:00.000Z",
}
const log = { version: 1, results: [eintrag, ohneMikro] }
const theorie = {
  version: 1,
  answers: [{ cardId: "m-f-erster", grade: 3, correct: true, at: "2026-07-02T18:10:00.000Z" }],
}

describe("Der gespeicherte Log", () => {
  it("liest sich unverändert zurück", () => {
    expect(practiceLogSchema.parse(log)).toEqual(log)
    expect(theoryLogSchema.parse(theorie)).toEqual(theorie)
    expect(backupSchema.parse({ ...log, theory: theorie })).toEqual({ ...log, theory: theorie })
  })

  it("streift ein unbekanntes Feld ab, statt den Log abzulehnen", () => {
    // Darauf beruht die Aufteilung in zwei Dateien im Datenrepo: ein Gerät
    // mit älterem Stand verliert das neue Feld, aber nicht den Eintrag — und
    // erst recht nicht den ganzen Log. Wäre das Schema streng, landete beim
    // ersten Abgleich mit einem neueren Gerät alles beiseite.
    const neuer = { ...log, results: [{ ...eintrag, neuesFeld: "x" }, ohneMikro], kopfzeile: 1 }
    const gelesen = practiceLogSchema.parse(neuer)
    expect(gelesen).toEqual(log)
    expect(gelesen.results[0]).not.toHaveProperty("neuesFeld")
  })

  it("lehnt ab, was nicht stimmen kann", () => {
    const kaputt = (aenderung: object) =>
      practiceLogSchema.safeParse({ version: 1, results: [{ ...eintrag, ...aenderung }] }).success
    expect(kaputt({ rating: 5 })).toBe(false)
    expect(kaputt({ bpm: 400 })).toBe(false)
    expect(kaputt({ bpm: 120.5 })).toBe(false)
    expect(kaputt({ seconds: -1 })).toBe(false)
    expect(kaputt({ at: undefined })).toBe(false)
    expect(kaputt({ timing: { ...eintrag.timing, trend: "irgendwie" } })).toBe(false)
    expect(practiceLogSchema.safeParse({ version: 2, results: [] }).success).toBe(false)
  })

  it("liest das Profil vom ersten Start", () => {
    const profil = { version: 1, experience: "wieder", focus: "beides", at: "2026-07-01T10:00:00.000Z" }
    expect(profileSchema.parse(profil)).toEqual(profil)
    expect(profileSchema.safeParse({ ...profil, focus: "jazz" }).success).toBe(false)
  })
})
