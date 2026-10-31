import { describe, expect, it } from "vitest"
import { EFFEKTE, EFFEKTE_BY_ID, KATEGORIEN, ORTE, effektSchema, eintraegeAm, kette, reihenfolge } from "../effekte"

/**
 * Was das Effektlexikon einhalten muss.
 *
 * Die Einträge sind Text, aber die Reihenfolge ist eine Aussage: Wer ein Pedal
 * ergänzt oder verschiebt, soll an den Tests merken, wenn die Kette nicht mehr
 * stimmt. Hier stehen deshalb die Regeln, die jeder Gitarrist unterschreibt,
 * und nicht die, über die man streiten kann (die stehen als `ausnahme` am Eintrag).
 */

/** Position eines Eintrags in der ganzen Kette. */
const stelle = (id: string) => reihenfolge().findIndex((e) => e.id === id)

describe("Katalog", () => {
  it("hat Einträge und vergibt jede Id nur einmal", () => {
    expect(EFFEKTE.length).toBeGreaterThanOrEqual(20)
    expect(new Set(EFFEKTE.map((e) => e.id)).size).toBe(EFFEKTE.length)
    expect(Object.keys(EFFEKTE_BY_ID)).toHaveLength(EFFEKTE.length)
  })

  it.each(EFFEKTE.map((e) => [e.id, e] as const))("%s besteht das Schema", (_id, eintrag) => {
    expect(effektSchema.safeParse(eintrag).success).toBe(true)
  })

  it("belegt jeden Platz in einer Station nur einmal", () => {
    for (const ort of ORTE) {
      const plaetze = eintraegeAm(ort.value).map((e) => e.platz)
      expect(new Set(plaetze).size).toBe(plaetze.length)
    }
  })

  it("füllt jede Station und jede Kategorie", () => {
    for (const ort of ORTE) expect(eintraegeAm(ort.value).length).toBeGreaterThan(0)
    for (const kat of KATEGORIEN) expect(EFFEKTE.some((e) => e.kategorie === kat.value)).toBe(true)
  })

  it("schreibt ohne ß, wie der Rest der App", () => {
    for (const e of EFFEKTE) {
      const text = [e.name, e.wofuer, e.metal, e.einstellung, e.fallstrick, e.ausnahme ?? ""].join(" ")
      expect(text).not.toContain("ß")
    }
  })
})

describe("die Kette", () => {
  it("läuft vom Amp-Eingang zur Box, Station für Station", () => {
    expect(kette().map((s) => s.value)).toEqual(["vorne", "amp", "loop", "hinten"])
  })

  it("führt reihenfolge() in derselben Ordnung, ohne Lücke und ohne Doppel", () => {
    expect(reihenfolge()).toHaveLength(EFFEKTE.length)
    expect(new Set(reihenfolge().map((e) => e.id)).size).toBe(EFFEKTE.length)
  })

  it("beginnt mit dem Stimmgerät und endet an der Box", () => {
    expect(reihenfolge()[0].id).toBe("fx-stimmgeraet")
    expect(reihenfolge()[reihenfolge().length - 1].id).toBe("fx-box")
  })

  it("stellt das Wah vor die Verzerrer", () => {
    for (const id of ["fx-distortion", "fx-overdrive"]) expect(stelle("fx-wah")).toBeLessThan(stelle(id))
  })

  it("stellt Tonhöhe und Kompressor vor die Verzerrer: sie brauchen ein sauberes Signal", () => {
    for (const vorher of ["fx-whammy", "fx-octaver", "fx-kompressor"]) {
      for (const nachher of ["fx-fuzz", "fx-distortion", "fx-overdrive"]) {
        expect(stelle(vorher)).toBeLessThan(stelle(nachher))
      }
    }
  })

  it("stellt den Overdrive vor Distortion und Fuzz: er drückt sie härter an", () => {
    for (const id of ["fx-distortion", "fx-fuzz"]) expect(stelle("fx-overdrive")).toBeLessThan(stelle(id))
  })

  it("stellt die Verzerrer vor den Amp und Delay, Hall und Modulation dahinter", () => {
    const amp = stelle("fx-amp")
    for (const id of ["fx-fuzz", "fx-distortion", "fx-overdrive", "fx-booster", "fx-eq"]) {
      expect(stelle(id)).toBeLessThan(amp)
    }
    for (const id of ["fx-chorus", "fx-phaser", "fx-flanger", "fx-tremolo", "fx-delay", "fx-reverb"]) {
      expect(stelle(id)).toBeGreaterThan(amp)
    }
  })

  it("stellt das Gate vor Delay und Hall, damit es deren Ausklang nicht abschneidet", () => {
    expect(stelle("fx-gate")).toBeLessThan(stelle("fx-delay"))
    expect(stelle("fx-gate")).toBeLessThan(stelle("fx-reverb"))
  })

  it("stellt Modulation vor Delay und Delay vor den Hall", () => {
    for (const id of ["fx-chorus", "fx-phaser", "fx-flanger", "fx-tremolo"]) {
      expect(stelle(id)).toBeLessThan(stelle("fx-delay"))
    }
    expect(stelle("fx-delay")).toBeLessThan(stelle("fx-reverb"))
  })

  it("stellt den Loop vor alles, was in ihm steht", () => {
    for (const e of eintraegeAm("loop").filter((x) => x.id !== "fx-loop")) {
      expect(stelle("fx-loop")).toBeLessThan(stelle(e.id))
    }
  })
})

describe("die Ausnahmen", () => {
  it("nennen sie bei den Pedalen, über die man streitet", () => {
    // Wer hier nichts stehen hat, behauptet, es gäbe keinen Streit.
    for (const id of [
      "fx-wah",
      "fx-fuzz",
      "fx-eq",
      "fx-gate",
      "fx-phaser",
      "fx-flanger",
      "fx-delay",
      "fx-booster",
      "fx-whammy",
      "fx-kompressor",
    ]) {
      expect(EFFEKTE_BY_ID[id].ausnahme, id).toBeTruthy()
    }
  })

  it("rechnet das Delay-Beispiel richtig: 120 BPM sind 500 ms je Viertel, 375 ms je punktierte Achtel", () => {
    const viertel = 60_000 / 120
    expect(viertel).toBe(500)
    expect(viertel * 0.75).toBe(375)
    expect(EFFEKTE_BY_ID["fx-delay"].einstellung).toContain("500 ms")
    expect(EFFEKTE_BY_ID["fx-delay"].einstellung).toContain("375 ms")
  })
})
