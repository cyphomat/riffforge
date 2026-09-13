import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { BREITE, EINLAGEN, HOEHE, KACHEL, OKTAVBUND, bundMitte, saitenLage } from "../hals"

/**
 * Der Hintergrund der App ist derselbe Hals, den `fretboard.tsx` zeichnet —
 * nur in CSS statt in SVG. Damit stehen dieselben Zahlen an zwei Stellen,
 * und genau davor warnt die Griffbrett-Regel in CLAUDE.md: eine Tabelle mit
 * hundert Zahlen lügt irgendwann, ohne dass es jemandem auffällt.
 *
 * Also wird nachgerechnet statt nachgeschaut. Dieser Test liest das
 * Stylesheet und prüft, dass die Einlagen dort an den Stellen sitzen, die
 * sich aus `hals.ts` ergeben.
 */

const css = readFileSync(join(__dirname, "../../../app/globals.css"), "utf8")

/** Der Wert einer CSS-Variablen aus `:root`, roh. */
function variable(name: string): string {
  // Bis zum Semikolon, das die Deklaration schliesst — Klammern in
  // Farbwerten sind dabei kein Problem, weil dort keins vorkommt.
  const treffer = css.match(new RegExp(`--${name}:([^;]*);`, "s"))
  expect(treffer, `--${name} fehlt in globals.css`).not.toBeNull()
  return treffer![1]
}

describe("Der Hals im Hintergrund", () => {
  it("setzt die Einlagen auf die gerechneten Bundmitten", () => {
    const einlagen = variable("einlagen")

    // "circle 8px at 110px 155px" → [110, 155]
    const stellen = [...einlagen.matchAll(/at\s+([\d.]+)px\s+([\d.]+)px/g)].map(
      ([, x, y]) => ({ x: Number(x), y: Number(y) }),
    )

    const mitte = saitenLage(3.5)
    const erwartet = [
      ...EINLAGEN.map((bund) => ({ x: bundMitte(bund), y: mitte })),
      // Die Oktave trägt zwei, ober- und unterhalb der Mitte.
      { x: bundMitte(OKTAVBUND), y: saitenLage(2.3) },
      { x: bundMitte(OKTAVBUND), y: saitenLage(4.7) },
    ]

    expect(stellen).toEqual(erwartet)
  })

  it("kachelt die Einlagen mit dem ganzen Hals", () => {
    const kachel = css.match(/background-size:\s*([\d.]+)px\s+([\d.]+)px/)
    expect(kachel).not.toBeNull()
    expect(Number(kachel![1])).toBe(KACHEL.breite)
    expect(Number(kachel![2])).toBe(KACHEL.hoehe)
  })

  it("legt die Saiten auf den Saitenabstand", () => {
    const saiten = variable("saiten")
    const kanten = [...saiten.matchAll(/transparent\s+[\d.]+px\s+([\d.]+)px/g)].map(([, wert]) =>
      Number(wert),
    )

    // Jede Saite beginnt dort, wo der transparente Abschnitt davor endet:
    // 62, 124, 186, 248, 310 — und die Periode schliesst bei 372.
    expect(kanten).toEqual([1, 2, 3, 4, 5, 6].map((saite) => saitenLage(saite + 1)))
  })

  it("hält die Saiten über dem Sichtbarkeitsboden", () => {
    const saiten = variable("saiten")
    const weiss = [...saiten.matchAll(/rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/g)].map(([, a]) =>
      Number(a),
    )
    expect(weiss).toHaveLength(6)

    // Weiss auf dem Grund #0c0c0e: der Zuwachs je Kanal ist alpha · (255−12).
    const zuwachs = weiss.map((alpha) => alpha * (255 - 12))

    // Diese Prüfung hat schon zweimal in beide Richtungen ausgeschlagen.
    // Erst lagen die Saiten im Register von `--raster` — und das hat die
    // Aufgabe, nicht aufzufallen. Dann zog ich sie auf +26 und dazu noch
    // Bünde und Einlagen hoch, alle drei zugleich: auf einem OLED war das
    // Unruhe statt Tiefe. Die Zahlen hier sind ein Korridor, kein Ziel —
    // der Regler `--hals` nimmt den Rest.
    for (const wert of zuwachs) expect(wert).toBeGreaterThanOrEqual(5)
    for (const wert of zuwachs) expect(wert).toBeLessThanOrEqual(17)

    // Dick nach dünn, wie am echten Hals — die tiefe E zuerst.
    expect([...zuwachs].sort((a, b) => b - a)).toEqual(zuwachs)
  })

  it("hält Bundbreite und Saitenabstand ungleich", () => {
    // Erst die Ungleichheit macht den Grund zum Hals statt zum Rechenkaro.
    expect(BREITE).not.toBe(HOEHE)
    expect(css).toContain(`${BREITE}px ${BREITE}px`)
    expect(css).toContain(`100% ${KACHEL.hoehe}px`)
  })
})
