import { TECHNIK_ZEICHEN, ZEICHEN_GROESSE } from "@/lib/session/technik-zeichen"
import type { Technique } from "@/lib/session/types"

/**
 * Das Pixelzeichen einer Technik. Strich in der Textfarbe, Akzent in Stahl —
 * so folgt es der Zeile, in der es steht. Die Raster stehen in
 * `lib/session/technik-zeichen.ts`.
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
      className="shrink-0"
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
              fill={zeichen === "a" ? "currentColor" : "var(--stahl)"}
            />
          ),
        ),
      )}
    </svg>
  )
}
