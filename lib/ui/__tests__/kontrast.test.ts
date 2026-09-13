import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { AA_GROSS, AA_TEXT, kontrast } from "../kontrast"

/**
 * Lesbarkeit ist eine Zahl, kein Geschmack.
 *
 * Der Anlass steht in `kontrast.ts`: `--dim` lag bei 2,4 : 1 gegen eine Karte
 * und trug trotzdem fünfundvierzig Textstellen. Aufgefallen ist es nicht in
 * einer Prüfung, sondern weil jemand die App auf dem Handy nicht lesen
 * konnte. Dieser Test schliesst die Lücke: er liest die echten Farben aus
 * `app/globals.css` und rechnet jede Paarung nach, die als Text vorkommt.
 */

const css = readFileSync(join(__dirname, "../../../app/globals.css"), "utf8")

function farbe(name: string): string {
  const treffer = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{3,8})\\s*;`))
  expect(treffer, `--${name} fehlt in globals.css oder ist kein Hex-Wert`).not.toBeNull()
  return treffer![1]
}

/** Die Gründe, auf denen Text tatsächlich steht. */
const GRUENDE = ["bg", "panel", "panel2", "sunken"] as const

describe("Farbkontrast", () => {
  it.each(["fg", "muted", "dim"])("%s trägt Fliesstext und schafft AA auf jedem Grund", (ton) => {
    for (const grund of GRUENDE) {
      const wert = kontrast(farbe(ton), farbe(grund))
      expect(wert, `--${ton} auf --${grund}: ${wert.toFixed(2)}`).toBeGreaterThanOrEqual(AA_TEXT)
    }
  })

  it.each(["akzent", "stahl", "gruen", "rost"])(
    "%s trägt Zahlen und Etiketten und schafft AA auf jedem Grund",
    (ton) => {
      for (const grund of GRUENDE) {
        const wert = kontrast(farbe(ton), farbe(grund))
        expect(wert, `--${ton} auf --${grund}: ${wert.toFixed(2)}`).toBeGreaterThanOrEqual(AA_TEXT)
      }
    },
  )

  it("hält Rot als Rand und grosse Schrift lesbar", () => {
    // `--rot` steht nur als Rahmen und als kurzes Wort in Versalien da —
    // dafür gilt die kleinere Schwelle. Es als Fliesstext zu setzen wäre der
    // Fehler, nicht die Farbe.
    for (const grund of GRUENDE) {
      expect(kontrast(farbe("rot"), farbe(grund))).toBeGreaterThanOrEqual(AA_GROSS)
    }
  })

  it("lässt die Abstufung bestehen", () => {
    // Drei Stufen müssen drei bleiben: wer `--dim` bis auf `--muted` anhebt,
    // macht sie lesbar und zugleich bedeutungslos.
    const auf = (ton: string) => kontrast(farbe(ton), farbe("panel"))
    expect(auf("fg")).toBeGreaterThan(auf("muted"))
    expect(auf("muted")).toBeGreaterThan(auf("dim"))
    expect(auf("muted") - auf("dim")).toBeGreaterThan(1.5)
  })

  it("hält die Trennlinie sichtbar, ohne sie als Text zu verlangen", () => {
    // `--line` ist ein Strich, kein Text. Drei zu eins wäre die Schwelle für
    // ein Bedienelement; eine Trennlinie darf leiser sein, aber sichtbar.
    expect(kontrast(farbe("line"), farbe("bg"))).toBeGreaterThan(1.3)
  })
})
