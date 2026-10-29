import type React from "react"
import type { Metadata, Viewport } from "next"
import { Anton, Jacquard_24, Jersey_10, Oswald, Permanent_Marker } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { ServiceWorker } from "@/components/service-worker"
import { asset } from "@/lib/base-path"
import { DARSTELLUNG_SKRIPT, STATUSLEISTE } from "@/lib/ui/darstellung"

// Pixel-Blackletter — der Name und das Wort des Tages, gross und nie klein
// gesetzt: unter 24 px ist Fraktur auch in Pixeln ein Rätsel. Sie ist für ein
// 24er-Raster gezeichnet und steht deshalb scharf bei 24, 48 und 72 px.
const jacquard = Jacquard_24({ subsets: ["latin"], weight: "400", variable: "--font-jacquard" })

// Pixelschrift für alles, was bisher Oswald war: Tempi, Zahlen, Drill-Namen.
// Schmal wie Oswald, damit kein Titel auf 320 px überläuft, und vor allem mit
// eindeutigen Ziffern: Pixelify Sans war die erste Wahl, und dort sieht die 5
// aus wie ein S und die 8 wie eine 6 mit Loch — bei einem Tempo ist das ein
// Fehler, kein Stil. Jersey ist für Trikotnummern gezeichnet.
const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey" })

// Bleibt als Rückfall und für den Druck der Shirts (siehe `.druck`).
// next/font lädt sie beim Build herunter und liefert sie selbst aus, damit
// die App offline genauso aussieht wie online.
const oswald = Oswald({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-oswald" })

// Nur für die Wortmarke, sonst nirgends. Schwer, schmal, plakathaft — ein
// Aufdruck, kein Fliesstext. Überschriften und Zahlen bleiben Oswald, damit
// die App nicht überall schreit.
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" })

// Nur auf dem Setlist-Zettel am Abschluss: der Edding, mit dem eine Setlist
// vor dem Gig geschrieben wird. Papier bekommt Handschrift, der Rest der App
// bleibt gedruckt.
const edding = Permanent_Marker({ subsets: ["latin"], weight: "400", variable: "--font-edding" })

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
    // 32 px für den Tab — das Pixelraster selbst, Punkt für Punkt — und 192
    // für alles, was grösser zeichnet.
    icon: [
      { url: asset("/icons/icon-32.png"), sizes: "32x32", type: "image/png" },
      { url: asset("/icons/icon-192.png"), sizes: "192x192", type: "image/png" },
    ],
    apple: asset("/icons/icon-180.png"),
  },
  other: {
    // Next (15 and 16) emits only the standard `mobile-web-app-capable`, which is the
    // Chrome spelling. Safari on iOS before 16.4 reads the apple-prefixed one
    // and without it the home-screen icon opens in a browser view instead of
    // standalone.
    "apple-mobile-web-app-capable": "yes",
  },
}

export const viewport: Viewport = {
  // Der Anfangswert. Das Skript im Kopf setzt ihn auf die gewählte Fassung —
  // siehe `lib/ui/darstellung.ts`.
  themeColor: STATUSLEISTE.dunkel,
  // Fills the notch area on iPhone; the safe-area padding below keeps content
  // out from under it.
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-theme` setzt das Skript, bevor React die Seite übernimmt —
    // deshalb weicht das Attribut absichtlich vom gebauten HTML ab.
    <html
      lang="de"
      data-theme="dunkel"
      className={`${oswald.variable} ${anton.variable} ${edding.variable} ${jacquard.variable} ${jersey.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta httpEquiv="Content-Security-Policy" content={CSP} />
        <script dangerouslySetInnerHTML={{ __html: DARSTELLUNG_SKRIPT }} />
      </head>
      <body className="min-h-screen">
        <ServiceWorker />
        <Navigation />
        <main className="pb-[env(safe-area-inset-bottom)]">{children}</main>
      </body>
    </html>
  )
}
