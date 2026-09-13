/**
 * WCAG-Kontrast, gerechnet.
 *
 * Der Anlass: `--dim` stand auf #57535c und trug fünfundvierzig Textstellen —
 * 2,4 : 1 gegen eine Karte, bei einer Schwelle von 4,5. Die App war an
 * Dutzenden Stellen schlicht nicht lesbar, und keine Prüfung hat das gemerkt,
 * weil Lesbarkeit bis dahin Geschmack war statt einer Zahl.
 *
 * Rein und ohne Browser, damit `__tests__/kontrast.test.ts` das Stylesheet
 * dagegen rechnen kann.
 */

/** Ein Farbwert `#rrggbb` als Kanäle 0…255. */
export function kanaele(hex: string): [number, number, number] {
  const wert = hex.trim().replace("#", "")
  const voll = wert.length === 3 ? [...wert].map((z) => z + z).join("") : wert
  return [0, 2, 4].map((i) => parseInt(voll.slice(i, i + 2), 16)) as [number, number, number]
}

/** Relative Leuchtdichte nach WCAG 2.1. */
export function leuchtdichte(hex: string): number {
  const anteil = (k: number) => {
    const c = k / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  const [r, g, b] = kanaele(hex)
  return 0.2126 * anteil(r) + 0.7152 * anteil(g) + 0.0722 * anteil(b)
}

/** Kontrastverhältnis zweier Farben, immer ≥ 1. */
export function kontrast(vorne: string, hinten: string): number {
  const [hell, dunkel] = [leuchtdichte(vorne), leuchtdichte(hinten)].sort((a, b) => b - a)
  return (hell + 0.05) / (dunkel + 0.05)
}

/** Was WCAG AA für normalen Fliesstext verlangt. */
export const AA_TEXT = 4.5
/** Dasselbe für grossen oder fetten Text, und für Bedienelement-Ränder. */
export const AA_GROSS = 3
