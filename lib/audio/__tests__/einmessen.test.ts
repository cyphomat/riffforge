import { describe, expect, it } from "vitest"
import { EINMESS_KLICKS, EINMESS_VORLAUF, auswerten } from "../einmessen"
import { analyseTiming } from "../timing"

/** Mulberry32, −1 bis 1 — siehe `tonhoehe.test.ts`, warum kein einfacher LCG. */
function zufallsquelle(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return (((t ^ (t >>> 14)) >>> 0) / 4294967296) * 2 - 1
  }
}

/** Klicks wie beim Einmessen: 80 BPM, ab Sekunde 1. */
const KLICKS = Array.from({ length: EINMESS_KLICKS }, (_, i) => 1 + i * 0.75)

/** Ein Spieler oder Lautsprecher mit fester Latenz und etwas Rauschen. */
function gehoert(latenzMs: number, streuungMs: number, seed = 7): number[] {
  const zufall = zufallsquelle(seed)
  return KLICKS.map((k) => k + (latenzMs + zufall() * streuungMs) / 1000)
}

describe("Einmessen über den Lautsprecher", () => {
  it("findet die Latenz der Kette", () => {
    const e = auswerten(KLICKS, gehoert(46, 1), "lautsprecher")
    expect(e.ok && e.ms).toBe(46)
    expect(e.ok && e.gezaehlt).toBe(EINMESS_KLICKS - EINMESS_VORLAUF)
  })

  it("kommt auch mit Bluetooth-Latenz zurecht", () => {
    const e = auswerten(KLICKS, gehoert(280, 1), "lautsprecher")
    expect(e.ok && e.ms).toBe(280)
  })

  it("nimmt den Klick, nicht sein Echo", () => {
    const mitEcho = gehoert(30, 1).flatMap((t) => [t, t + 0.09])
    const e = auswerten(KLICKS, mitEcho, "lautsprecher")
    expect(e.ok && e.ms).toBe(30)
  })

  it("ignoriert den Vorlauf, in dem die Kette erst aufwacht", () => {
    const ohneErste = gehoert(40, 1).slice(EINMESS_VORLAUF)
    expect(auswerten(KLICKS, ohneErste, "lautsprecher").ok).toBe(true)
  })

  it("lehnt ab, wenn zu wenig gehört wurde", () => {
    const e = auswerten(KLICKS, gehoert(40, 1).slice(0, 8), "lautsprecher")
    expect(e.ok).toBe(false)
    expect(!e.ok && e.grund).toMatch(/Kopfhörern/)
  })

  it("lehnt ab, was für eine Maschine zu unruhig ist", () => {
    // Ein Lautsprecher, der sich um mehr als ein paar Millisekunden
    // widerspricht, ist nicht der Lautsprecher — sondern der Raum.
    expect(auswerten(KLICKS, gehoert(40, 30), "lautsprecher").ok).toBe(false)
  })

  it("lehnt ab, was vor dem Klick kommt", () => {
    expect(auswerten(KLICKS, gehoert(-3, 0.5), "lautsprecher").ok).toBe(false)
  })
})

describe("Einmessen per Anschlag", () => {
  it("lässt einem Menschen mehr Streuung als einer Maschine", () => {
    const e = auswerten(KLICKS, gehoert(60, 25), "anschlag")
    expect(e.ok).toBe(true)
  })

  it("nimmt auch einen Anschlag vor dem Klick", () => {
    const e = auswerten(KLICKS, gehoert(-40, 5), "anschlag")
    expect(e.ok && e.ms).toBe(-40)
  })
})

/**
 * Wozu das alles: bei schnellen Klicks ist der Versatz ohne Einmessung nur bis
 * auf ganze Klickabstände bestimmt. Nachgemessen vor dem Bau: Achtel bei 190
 * BPM (158 ms Abstand) mit 80 ms Latenz meldeten −72 ms — „du spielst vorne",
 * obwohl der Spieler genau auf dem Klick lag.
 */
describe("Der Versatz mit und ohne Einmessung", () => {
  const abstand = 60 / 190 / 2
  const klicks = Array.from({ length: 64 }, (_, i) => 1 + i * abstand)
  const toleranz = abstand * 0.4
  const zufall = zufallsquelle(3)
  const rauschen = () => zufall() * 0.006
  const spiel = (latenzMs: number, lageMs = 0) => klicks.map((k) => k + (latenzMs + lageMs) / 1000 + rauschen())

  it("weiss ohne Einmessung, dass er bei diesem Tempo nicht eindeutig ist", () => {
    const a = analyseTiming(spiel(80), klicks, { toleranceSeconds: toleranz })
    expect(a.offsetMs).toBeLessThan(0) // genau der Irrtum von vorher
    expect(a.versatzEindeutig).toBe(false)
    expect(a.lageMs).toBeNull()
  })

  it("ist bei langsamen Klicks auch ohne Einmessung eindeutig", () => {
    const langsam = Array.from({ length: 16 }, (_, i) => 1 + i * 0.75)
    const a = analyseTiming(langsam.map((k) => k + 0.08), langsam)
    expect(a.versatzEindeutig).toBe(true)
  })

  it("findet mit Einmessung den richtigen Versatz und die echte Lage", () => {
    const a = analyseTiming(spiel(80, -12), klicks, {
      toleranceSeconds: toleranz,
      einmessung: { sekunden: 0.08, art: "lautsprecher" },
    })
    expect(a.einmessung).toBe("passt")
    expect(a.versatzEindeutig).toBe(true)
    expect(a.offsetMs).toBeGreaterThan(60)
    expect(a.lageMs).toBeGreaterThanOrEqual(-16)
    expect(a.lageMs).toBeLessThanOrEqual(-8)
    expect(a.score).toBeGreaterThan(85)
  })

  it("sagt per Anschlag eingemessen nichts über die Lage", () => {
    // Die eigene Gewohnheit steckt dann schon in der Einmessung.
    const a = analyseTiming(spiel(80), klicks, {
      toleranceSeconds: toleranz,
      einmessung: { sekunden: 0.08, art: "anschlag" },
    })
    expect(a.einmessung).toBe("passt")
    expect(a.lageMs).toBeNull()
  })

  it("merkt, wenn die Einmessung nicht mehr zur Kette passt", () => {
    // Eingemessen mit Lautsprecher (20 ms), gespielt mit Bluetooth (240 ms),
    // langsam genug, dass sich das nicht in einen Nachbarklick versteckt.
    const viertel = Array.from({ length: 32 }, (_, i) => 1 + i * 0.75)
    const a = analyseTiming(
      viertel.map((k) => k + 0.24),
      viertel,
      { einmessung: { sekunden: 0.02, art: "lautsprecher" } },
    )
    expect(a.einmessung).toBe("passt-nicht")
    expect(a.lageMs).toBeNull()
    expect(a.score).toBeGreaterThan(85) // die Messung selbst bleibt brauchbar
  })
})
