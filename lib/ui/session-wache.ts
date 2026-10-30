/**
 * Ob gerade ein Block läuft, den ein Tipp auf die Navigation verwerfen würde.
 *
 * Ein kleiner Speicher ausserhalb von React, damit der Block ihn setzen und
 * die Navigation ihn lesen kann, ohne dass eine die andere kennt. Die Frage
 * stellt die Navigation in der Seite — `confirm()` gibt es in einer PWA auf
 * iOS nicht verlässlich.
 */
let laeuft = false
const hoerer = new Set<() => void>()

export function setBlockLaeuft(wert: boolean): void {
  if (laeuft === wert) return
  laeuft = wert
  hoerer.forEach((h) => h())
}

export function blockLaeuft(): boolean {
  return laeuft
}

export function abonniere(h: () => void): () => void {
  hoerer.add(h)
  return () => {
    hoerer.delete(h)
  }
}
