import { describe, expect, it } from "vitest"
import { sattigung } from "@/lib/audio/board"
import { EFFEKTE_BY_ID, reihenfolge } from "@/lib/theory/effekte"
import { AMPS, PEDALE, ampSchema, pedalSchema } from "../board-daten"
import { STANDARD_WAHL, alsKlang, gewaehlterAmp, kette, pedaleGeordnet, startBesitz, umschalten, type Besitz } from "../board"

/** Alles hier ist erfunden; es gibt kein Gerät und keinen Log. */

const alles = (): Besitz => ({ pedale: new Set(PEDALE.map((p) => p.id)), amps: new Set(AMPS.map((a) => a.id)) })

describe("Die Daten des Boards", () => {
  it("haben gültige Schemas und eindeutige Kennungen", () => {
    for (const p of PEDALE) pedalSchema.parse(p)
    for (const a of AMPS) ampSchema.parse(a)
    const ids = [...PEDALE.map((p) => p.id), ...AMPS.map((a) => a.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("führen jedes Pedal im Effektlexikon, dort liegt sein Platz in der Kette", () => {
    for (const p of PEDALE) expect(EFFEKTE_BY_ID[p.id], p.id).toBeDefined()
  })

  it("tragen keine Marken im Namen", () => {
    const marken = /boss|ibanez|marshall|fender|orange|mesa|peavey|maxon|dunlop|electro|tc |line 6/i
    for (const x of [...PEDALE, ...AMPS]) expect(`${x.name} ${x.wirkung}`, x.id).not.toMatch(marken)
  })
})

describe("Die Reihenfolge", () => {
  it("folgt dem Effektlexikon, vom Gitarrenausgang zur Box", () => {
    const index = (id: string) => reihenfolge().findIndex((e) => e.id === id)
    const ids = pedaleGeordnet(alles()).map((p) => p.id)
    expect(ids.map(index)).toEqual([...ids.map(index)].sort((a, b) => a - b))
  })

  it("stellt Verzerrer vor den Amp und Hall und Delay dahinter", () => {
    const k = kette(alles(), STANDARD_WAHL)
    expect(k.vor.map((p) => p.id)).toContain("fx-distortion")
    expect(k.vor.map((p) => p.id)).toContain("fx-overdrive")
    expect(k.nach.map((p) => p.id)).toEqual(expect.arrayContaining(["fx-delay", "fx-reverb", "fx-chorus", "fx-tremolo"]))
    expect(k.vor.map((p) => p.id)).not.toContain("fx-reverb")
  })
})

describe("Besitz und Wahl", () => {
  it("fängt mit einem Pedal und dem Übungscombo an", () => {
    const k = kette(startBesitz(), STANDARD_WAHL)
    expect(k.vor.map((p) => p.id)).toEqual(["fx-overdrive"])
    expect(k.nach).toEqual([])
    expect(k.amp.id).toBe("amp-uebungscombo")
  })

  it("zeigt nur, was an ist; ein neues Pedal ist von selbst an", () => {
    const aus = umschalten(STANDARD_WAHL, "fx-overdrive")
    expect(kette(startBesitz(), aus).vor).toEqual([])
    expect(umschalten(aus, "fx-overdrive")).toEqual(STANDARD_WAHL)
    expect(kette(alles(), STANDARD_WAHL).vor.length).toBeGreaterThan(1)
  })

  it("lässt eine Wahl, die man nicht besitzt, auf den Übungscombo fallen", () => {
    expect(gewaehlterAmp(startBesitz(), { aus: [], amp: "amp-saegewerk" }).id).toBe("amp-uebungscombo")
    expect(gewaehlterAmp(alles(), { aus: [], amp: "amp-saegewerk" }).id).toBe("amp-saegewerk")
  })

  it("ignoriert eine unbekannte Kennung beim Umschalten", () => {
    expect(umschalten(STANDARD_WAHL, "fx-gibt-es-nicht")).toEqual(STANDARD_WAHL)
  })

  it("gibt der Wiedergabe nur Klang, keine Namen", () => {
    const klang = alsKlang(kette(alles(), STANDARD_WAHL))
    expect(klang.amp).toEqual({ gain: 4, hoehen: 4500, mitten: 0 })
    expect(klang.vor.every((k) => "art" in k)).toBe(true)
  })
})

describe("Die Sättigung", () => {
  it("bleibt zwischen −1 und 1 und geht durch die Mitte", () => {
    for (const drive of [1, 6, 40, 120]) {
      const kurve = sattigung(drive)
      expect(Math.max(...kurve), String(drive)).toBeLessThanOrEqual(1)
      expect(Math.min(...kurve), String(drive)).toBeGreaterThanOrEqual(-1)
      expect(Math.abs(kurve[Math.floor(kurve.length / 2)]), String(drive)).toBeLessThan(0.01)
    }
  })

  it("wird mit mehr Gain eckiger: bei halber Aussteuerung näher an 1", () => {
    const wert = (drive: number) => {
      const k = sattigung(drive)
      return k[Math.floor(k.length * 0.75)]
    }
    expect(wert(40)).toBeGreaterThan(wert(4))
  })
})
