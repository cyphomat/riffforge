import { TECHNIK_ZEICHEN, ZEICHEN_GROESSE } from "@/lib/session/technik-zeichen"
import type { Technique } from "@/lib/session/types"

/**
 * Das Pixelzeichen einer Technik. Ein Farbton in zwei Stufen: der Strich voll,
 * die Füllung (`b`) gedämpft — das Zeichen ist Stahlblau und damit zweitrangig
 * wie der Rest der Zeile. Vorher zwei Farben (Text und Stahl) je Zeichen, und
 * jedes sah anders aus. Die Raster stehen in `lib/session/technik-zeichen.ts`.
 */
export function TechnikZeichen({ technique, groesse = 32 }: { technique: Technique; groesse?: number }) {
  const raster = TECHNIK_ZEICHEN[technique]
  return (
    <svg
      viewBox={`0 0 ${ZEICHEN_GROESSE} ${ZEICHEN_GROESSE}`}
      width={groesse}
      height={groesse}
      shapeRendering="crispEdges"
      aria-hidden
      className="shrink-0 text-stahl"
    >
      {raster.flatMap((zeile, y) =>
        [...zeile].map((zeichen, x) =>
          zeichen === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill="currentColor"
              fillOpacity={zeichen === "a" ? 1 : 0.45}
            />
          ),
        ),
      )}
    </svg>
  )
}
