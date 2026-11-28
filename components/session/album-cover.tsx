import { asset } from "@/lib/base-path"
import { COVER_GROESSE, COVER_SCHAEDEL, type CoverPixel } from "@/lib/session/album"

/**
 * Das Cover als SVG aus Rechtecken, mit dem Totenkopf der Marke darauf.
 * 64 Pixel Kante, gezeigt in ganzen Vielfachen: 192, ab breiterem Schirm 256.
 */
export function AlbumCover({ pixel, klein = false }: { pixel: CoverPixel[]; klein?: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${COVER_GROESSE} ${COVER_GROESSE}`}
      shapeRendering="crispEdges"
      aria-hidden
      className={klein ? "block h-16 w-16 flex-none" : "mx-auto mt-4 block h-48 w-48 sm:h-64 sm:w-64"}
    >
      {pixel.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={p.breite} height={p.hoehe} fill={p.farbe} />
      ))}
      <image
        href={asset("/icons/totenkopf.svg")}
        x={COVER_SCHAEDEL.x}
        y={COVER_SCHAEDEL.y}
        width={COVER_SCHAEDEL.groesse}
        height={COVER_SCHAEDEL.groesse}
      />
    </svg>
  )
}
