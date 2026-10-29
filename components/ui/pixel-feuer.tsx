"use client"

import { useEffect, useRef } from "react"
import { feld, PALETTE, schritt } from "@/lib/ui/feuer"

/** Kantenlänge eines Feuerpixels. Ganzzahlig, wie alle Pixelkunst hier. */
export const ZELLE = 4

/**
 * Feuer auf dem oberen Rand der Elternfläche: es steigt aus der Kante nach
 * oben in den Raum davor. Die Elternfläche muss `relative` sein und oben
 * `reihen * ZELLE` Pixel Platz lassen.
 *
 * Nur auf *Heute*, nie in der Session — dort sind die Hände beschäftigt und
 * die Augen auf dem Block. Wer im System „Bewegung reduzieren" eingestellt
 * hat, bekommt kein Feuer; es hält an, solange die Seite verborgen ist.
 */
export function PixelFeuer({ reihen }: { reihen: number }) {
  const huelle = useRef<HTMLDivElement>(null)
  const leinwand = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const box = huelle.current
    const canvas = leinwand.current
    const ctx = canvas?.getContext("2d")
    if (!box || !canvas || !ctx) return
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return

    const zellen = Math.max(1, Math.floor((box.parentElement?.clientWidth ?? 320) / ZELLE))
    canvas.width = zellen
    canvas.height = reihen
    canvas.style.width = `${zellen * ZELLE}px`
    canvas.style.height = `${reihen * ZELLE}px`

    const f = feld(zellen, reihen)
    // Setlists Kühlung ist für ~34 Reihen gestimmt. Bei weniger Reihen müsste
    // die Hitze auf kürzerem Weg abfallen, sonst steht oben eine gelbe Wand:
    // die Flamme soll bei etwa neun Zehnteln der Höhe auslaufen.
    const kuehlung = Math.max(2, Math.round(80 / reihen))
    const bild = ctx.createImageData(zellen, reihen)
    let zuletzt = 0
    let frame = 0
    const male = () => {
      for (let i = 0; i < f.px.length; i += 1) bild.data.set(PALETTE[f.px[i]], i * 4)
      ctx.putImageData(bild, 0, 0)
    }
    const lauf = (zeit: number) => {
      if (document.hidden) {
        frame = 0
        return
      }
      if (zeit - zuletzt > 40) {
        zuletzt = zeit
        schritt(f, true, kuehlung)
        male()
      }
      frame = requestAnimationFrame(lauf)
    }
    const los = () => {
      if (!frame) frame = requestAnimationFrame(lauf)
    }
    const sichtbar = () => {
      if (!document.hidden) los()
    }
    document.addEventListener("visibilitychange", sichtbar)
    los()
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener("visibilitychange", sichtbar)
    }
  }, [reihen])

  return (
    <div ref={huelle} aria-hidden className="pointer-events-none absolute bottom-full left-0 right-0 flex justify-center">
      <canvas ref={leinwand} className="pixel block" />
    </div>
  )
}
