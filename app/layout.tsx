import type React from "react"
import type { Metadata, Viewport } from "next"
import { Anton, Oswald } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ServiceWorker } from "@/components/service-worker"
import { asset } from "@/lib/base-path"

// Kondensiert und versal — trägt Tempi, Zahlen und Drill-Namen.
// next/font lädt sie beim Build herunter und liefert sie selbst aus, damit
// die App offline genauso aussieht wie online.
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-display" })

// Nur für die Wortmarke, sonst nirgends. Schwer, schmal, plakathaft — ein
// Aufdruck, kein Fliesstext. Überschriften und Zahlen bleiben Oswald, damit
// die App nicht überall schreit.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-marke" })

/**
 * Content-Security-Policy als Meta-Tag.
 *
 * GitHub Pages liefert keine eigenen Kopfzeilen aus, ein Meta-Tag ist also der
 * einzige Weg. Das wichtigste Stück ist `connect-src`: im Speicher dieses
 * Browsers liegt ein GitHub-Token, und alle Seiten unter github.io teilen sich
 * denselben Speicher. Käme über irgendeinen Weg fremdes Skript in die Seite,
 * könnte es Token und Log damit nirgendwohin schicken — ausser zu GitHub
 * selbst.
 *
 * `unsafe-inline` bei Skripten ist unvermeidbar: Next legt die Hydrationsdaten
 * als Inline-Skript in die Seite. Die Sperre liegt deshalb bewusst auf dem
 * Abfluss, nicht auf der Ausführung.
 *
 * `frame-ancestors` fehlt, weil es in einem Meta-Tag laut Spezifikation
 * ignoriert wird — dagegen hilft nur eine echte Kopfzeile, die Pages nicht
 * anbietet.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "media-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "connect-src 'self' https://api.github.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ")

export const metadata: Metadata = {
  title: "Riffforge",
  description: "15 Minuten Metal-Gitarre am Tag — aufwärmen, eine Technik, ein Riff.",
  manifest: asset("/manifest.json"),
  appleWebApp: {
    capable: true,
    title: "Riffforge",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: asset("/icons/icon-192.png"),
    apple: asset("/icons/icon-180.png"),
  },
  other: {
    // Next 15 emits only the standard `mobile-web-app-capable`, which is the
    // Chrome spelling. Safari on iOS before 16.4 reads the apple-prefixed one
    // and without it the home-screen icon opens in a browser view instead of
    // standalone.
    "apple-mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  themeColor: "#0c0c0e",
  // Fills the notch area on iPhone; the safe-area padding below keeps content
  // out from under it.
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`dark ${oswald.variable} ${anton.variable}`}>
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
      </head>
      <body className="min-h-screen">
        <ServiceWorker />
        <Navigation />
        <main className="pb-[env(safe-area-inset-bottom)]">{children}</main>
      </body>
    </html>
  )
}
