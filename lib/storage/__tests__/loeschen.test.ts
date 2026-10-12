import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import { allesLoeschen } from "../loeschen"

/**
 * Löschen heisst löschen — als Prüfung statt als Vorsatz.
 *
 * Der Anlass: „Alles löschen" versprach „wie frisch installiert" und liess
 * den GitHub-Token liegen. Hier wird jeder `mga.*`-Schlüssel eingesammelt, der
 * irgendwo im Quelltext steht, gesetzt, und danach muss der Speicher leer sein.
 */

const WURZEL = join(__dirname, "../../..")
const ORDNER = ["lib", "components", "hooks", "app"]

function quelltexte(ordner: string): string[] {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name)
    if (statSync(pfad).isDirectory()) return name === "__tests__" ? [] : quelltexte(pfad)
    return /\.tsx?$/.test(name) ? [pfad] : []
  })
}

function alleSchluessel(): string[] {
  const gefunden = new Set<string>()
  for (const ordner of ORDNER) {
    for (const datei of quelltexte(join(WURZEL, ordner))) {
      for (const treffer of readFileSync(datei, "utf8").matchAll(/["'`](mga\.[\w.-]+)["'`]/g)) {
        gefunden.add(treffer[1])
      }
    }
  }
  return [...gefunden]
}

function speicher(): Storage {
  const werte: Record<string, string> = {}
  // Methoden nicht aufzählbar, damit `Object.keys(localStorage)` wie im
  // Browser nur die Schlüssel liefert — `clearLog` verlässt sich darauf.
  Object.defineProperties(werte, {
    getItem: { value: (k: string) => (k in werte ? werte[k] : null) },
    setItem: { value: (k: string, v: string) => void (werte[k] = String(v)) },
    removeItem: { value: (k: string) => void delete werte[k] },
    key: { value: (i: number) => Object.keys(werte)[i] ?? null },
    clear: { value: () => Object.keys(werte).forEach((k) => delete werte[k]) },
    length: { get: () => Object.keys(werte).length },
  })
  return werte as unknown as Storage
}

const global = globalThis as { window?: { localStorage: Storage } }
afterEach(() => {
  delete global.window
})

describe("Alles löschen", () => {
  it("findet überhaupt Schlüssel — sonst prüfte der Test nichts", () => {
    const schluessel = alleSchluessel()
    expect(schluessel).toContain("mga.practice-log.v1")
    expect(schluessel).toContain("mga.sync.token")
    expect(schluessel.length).toBeGreaterThanOrEqual(10)
  })

  it("hinterlässt keinen einzigen Schlüssel der App", () => {
    const localStorage = speicher()
    global.window = { localStorage }
    for (const k of alleSchluessel()) localStorage.setItem(k, "x")
    // Beiseitegelegte Kopien kaputter Logs, auch die älteren mit Zeitstempel.
    localStorage.setItem("mga.practice-log.v1.broken", "x")
    localStorage.setItem("mga.practice-log.v1.broken.2026-03-01", "x")
    localStorage.setItem("mga.theory-log.v1.broken", "x")

    allesLoeschen()

    expect(Object.keys(localStorage)).toEqual([])
  })

  it("nimmt den Token mit", () => {
    const localStorage = speicher()
    global.window = { localStorage }
    localStorage.setItem("mga.sync.token", "x")
    allesLoeschen()
    expect(localStorage.getItem("mga.sync.token")).toBeNull()
  })

  it("lässt fremde Schlüssel stehen", () => {
    // Alle Seiten unter github.io teilen sich den Speicher — was einer
    // anderen App gehört, geht uns nichts an.
    const localStorage = speicher()
    global.window = { localStorage }
    localStorage.setItem("setlist.irgendwas", "x")
    allesLoeschen()
    expect(localStorage.getItem("setlist.irgendwas")).toBe("x")
  })
})
