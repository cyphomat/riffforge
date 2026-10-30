"use client"

import Link from "next/link"
import { asset } from "@/lib/base-path"
import { usePathname } from "next/navigation"

const navItems = [
  { href: "/", label: "Heute" },
  { href: "/drills", label: "Drills" },
  { href: "/wissen", label: "Wissen" },
  { href: "/daten", label: "Daten" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-20 border-b-2 border-akzent bg-bg pt-[env(safe-area-inset-top)]">
      {/* Vier Knöpfe und ein Schriftzug werden auf schmalen Geräten eng.
          Der Schriftzug ist Pixel-Blackletter und braucht bei 24 px rund 110 px
          — er erscheint deshalb erst ab 430 px; darunter steht der Totenkopf
          allein und bleibt der Weg nach Hause. "Heute" führt ohnehin dorthin. */}
      <div className="mx-auto flex h-14 max-w-[640px] items-center justify-end gap-1.5 px-3 sm:gap-3 sm:px-4 wide:max-w-[1080px]">
        {/* Der Totenkopf steht immer da, 20 × 20 Pixel in doppelter Grösse.
            Pixelkunst nur ganzzahlig. Vorher stand hier ein Plektrum, das sich
            als Herz las — siehe docs/marke-und-merch.md. */}
        <Link href="/" aria-label="Riffforge — Heute" className="flex min-w-0 flex-1 items-center gap-[9px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
          <img src={asset("/icons/totenkopf.svg")} alt="" width={40} height={40} className="shrink-0" />
          <span className="metal hidden truncate text-[24px] text-akzent min-[430px]:block sm:text-[48px]">
            Riffforge
          </span>
        </Link>

        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 flex-none items-center px-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors sm:px-2.5 sm:text-[12px] sm:tracking-widest ${
                active
                  ? "bg-(--tint-akzent) text-akzent shadow-(--pix-akzent)"
                  : "text-muted shadow-(--pix-line) hover:text-stahl hover:shadow-(--pix-stahl)"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
      {/* Die Zackenkante: eine Reihe Fänge unter der Leiste. Reine Kante, kein
          Inhalt — sie sitzt ausserhalb der Leiste und fängt keine Klicks. */}
      <span aria-hidden className="zacken" />
    </nav>
  )
}
