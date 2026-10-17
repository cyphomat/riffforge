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
    <nav className="sticky top-0 z-20 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
      {/* Vier Knöpfe und ein Schriftzug werden auf schmalen Geräten eng.
          Enger gesetzt statt gekürzt — "RIF…" ist kein Name —, und unter
          360 px weicht der Schriftzug ganz. "Heute" führt ohnehin nach Hause. */}
      <div className="mx-auto flex h-14 max-w-[640px] items-center justify-end gap-2 px-3 sm:gap-3 sm:px-4 wide:max-w-[1080px]">
        {/* „Riffforge" ist als Kompositum richtig geschrieben, aber drei
            gleiche Buchstaben in versaler Schrift liest man nicht auseinander.
            Die Fuge gibt der Naht ein Haar Luft — siehe `.marke .fuge`. */}
        {/* Das Plektrum steht immer da — auch unter 360 px, wo die Wortmarke
            weichen muss, bleibt so ein Weg nach Hause. 20 Pixel, einfach
            gezeichnet: Pixelkunst nur ganzzahlig. */}
        <Link href="/" aria-label="Riffforge — Heute" className="flex min-w-0 flex-1 items-center gap-[9px]">
          {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
          <img src={asset("/icons/plektrum.svg")} alt="" width={20} height={20} className="shrink-0" />
          <span className="marke hidden truncate text-[19px] text-akzent min-[360px]:block sm:text-[23px]">
            Riff<span className="fuge">forge</span>
          </span>
        </Link>

        {navItems.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex-none border px-2 py-1.5 font-mono text-[11px] uppercase tracking-[0.06em] transition-colors sm:px-2.5 sm:text-[12px] sm:tracking-widest ${
                active
                  ? "border-akzent bg-(--tint-akzent) text-akzent"
                  : "border-line text-muted hover:border-stahl hover:text-stahl"
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
