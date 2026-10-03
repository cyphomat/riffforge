import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { BREITE, BUENDE, EINLAGEN, HOEHE, OKTAVBUND, bundMitte, saitenLage } from "../hals"

/**
 * Die Masse des Halses — heute nur noch für das antippbare Griffbrett.
 *
 * Bis Oktober zeichnete dasselbe Modul auch den Seitenhintergrund, und
 * dieser Test rechnete die Einlagen im Stylesheet gegen die Zahlen hier nach.
 * Der Hintergrund ist weg (warum, steht in `globals.css` unter „Der Grund
 * ist matt"); geblieben ist das Griffbrett, und für das gelten die Zahlen
 * weiter.
 */
describe("Die Masse des Halses", () => {
  it("legt die Einlagen dorthin, wo sie am echten Hals sitzen", () => {
    expect(EINLAGEN).toEqual([3, 5, 7, 9])
    expect(OKTAVBUND).toBe(12)
    for (const bund of [...EINLAGEN, OKTAVBUND]) expect(bund).toBeLessThanOrEqual(BUENDE)
  })

  it("setzt einen Ton hinter das Bundstäbchen, nicht darauf", () => {
    // Die Mitte des ersten Bundes liegt eine halbe Bundbreite vom Sattel.
    expect(bundMitte(1)).toBe(BREITE / 2)
    expect(bundMitte(12) - bundMitte(11)).toBe(BREITE)
    expect(saitenLage(1)).toBe(0)
    expect(saitenLage(6)).toBe(5 * HOEHE)
  })

  it("hält Bundbreite und Saitenabstand ungleich", () => {
    // Auf dem Handy wird die Trefferfläche in der Höhe gross, damit ein
    // Vergreifen den Nachbarbund trifft und nicht die Nachbarsaite.
    expect(HOEHE).toBeGreaterThan(BREITE)
  })
})

describe("Der Grund", () => {
  it("bleibt matt", () => {
    // Der Hals als Hintergrund ist dreimal gescheitert, jedes Mal an einer
    // anderen Stelle — zuletzt schien er durch das Griffbrett und setzte
    // falsche Punkte zwischen die Bünde. Wer ihn zurückholen will, liest
    // erst, warum er gegangen ist.
    const css = readFileSync(join(__dirname, "../../../app/globals.css"), "utf8")
    expect(css).not.toMatch(/body::before\s*\{/)
    expect(css).not.toMatch(/--einlagen\s*:/)
    expect(css).not.toMatch(/--saiten\s*:/)
  })
})
