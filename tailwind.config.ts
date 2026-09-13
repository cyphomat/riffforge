import type { Config } from "tailwindcss"

/**
 * Farben und Kanten kommen aus Setlists Design-Sprache: matte Flächen,
 * Bernstein nur auf dem, was zählt, und harte Rechtecke mit 2 px.
 * Die Werte selbst stehen als CSS-Variablen in globals.css.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        // Wie bei Setlist: unter 900 px ist die schmale Spalte richtig,
        // darüber wird daraus sonst eine Handy-App mit Leere daneben.
        wide: "900px",
      },
      colors: {
        bg: "var(--bg)",
        panel: "var(--panel)",
        panel2: "var(--panel2)",
        sunken: "var(--sunken)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        dim: "var(--dim)",
        line: "var(--line)",
        akzent: "var(--akzent)",
        stahl: "var(--stahl)",
        gruen: "var(--gruen)",
        rost: "var(--rost)",
        rot: "var(--rot)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        marke: ["var(--font-marke)", "var(--font-display)", "Helvetica Neue", "sans-serif"],
        mono: ["ui-monospace", "SF Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      borderRadius: {
        // Road-Case, kein HUD: eine Kante, kein Radius.
        none: "0",
        DEFAULT: "2px",
        sm: "2px",
        md: "2px",
        lg: "2px",
        full: "9999px",
      },
    },
  },
  plugins: [],
}

export default config
