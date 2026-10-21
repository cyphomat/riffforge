import { describe, expect, it } from "vitest"
import { alsDarstellung, DARSTELLUNG_KEY, DARSTELLUNG_SKRIPT, fassungFuer, STATUSLEISTE } from "../darstellung"

describe("Darstellung", () => {
  it("folgt dem System, solange nichts gewählt ist", () => {
    expect(fassungFuer("auto", true)).toBe("hell")
    expect(fassungFuer("auto", false)).toBe("dunkel")
  })

  it("hält eine ausdrückliche Wahl gegen das System", () => {
    expect(fassungFuer("hell", false)).toBe("hell")
    expect(fassungFuer("dunkel", true)).toBe("dunkel")
  })

  it("liest Unbekanntes und Fehlendes als Auto", () => {
    expect(alsDarstellung(null)).toBe("auto")
    expect(alsDarstellung("light")).toBe("auto")
    expect(alsDarstellung("hell")).toBe("hell")
  })

  // Das Skript läuft vor React und kann `fassungFuer` nicht aufrufen — es
  // muss dieselbe Regel selbst sprechen. Hier wird es mit einem nachgebauten
  // Browser ausgeführt und gegen die Regel gehalten.
  it.each([
    [null, true],
    [null, false],
    ["hell", false],
    ["dunkel", true],
    ["kaputt", true],
  ] as const)("setzt im Kopf der Seite dieselbe Fassung wie die Regel (%s, System hell: %s)", (gespeichert, systemHell) => {
    const attribute: Record<string, string> = {}
    const meta = { content: "", setAttribute: (_: string, w: string) => void (meta.content = w) }
    const umgebung = {
      matchMedia: () => ({ matches: systemHell, addEventListener: () => {} }),
      localStorage: { getItem: (k: string) => (k === DARSTELLUNG_KEY ? gespeichert : null) },
      addEventListener: () => {},
      document: {
        documentElement: { setAttribute: (k: string, w: string) => void (attribute[k] = w), style: {} },
        querySelectorAll: () => [meta],
        addEventListener: () => {},
      },
    }
    new Function(...Object.keys(umgebung), DARSTELLUNG_SKRIPT)(...Object.values(umgebung))
    const erwartet = fassungFuer(alsDarstellung(gespeichert), systemHell)
    expect(attribute["data-theme"]).toBe(erwartet)
    expect(meta.content).toBe(STATUSLEISTE[erwartet])
  })
})
