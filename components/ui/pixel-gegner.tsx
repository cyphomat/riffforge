/**
 * Der Wochengegner als Pixelbild: ein Verstärker mit Augen, 16 × 12 Zellen,
 * aus Rechtecken gesetzt (`crispEdges`), Farben als Variablen. Er steht still.
 *
 * `M` Gehäuse (Stahl), `G` Gitter (dunkel), `A` Augen und Knöpfe (Akzent),
 * `Z` Zähne (hell). Angeschlagen (`wund`) sind die Augen aus.
 */
const BILD = [
  "..MMMMMMMMMMMM..",
  ".MMMMMMMMMMMMMM.",
  "MMMMMMMMMMMMMMMM",
  "MMAAMMMMMMMMAAMM",
  "MMAAMMMMMMMMAAMM",
  "MMMMMMMMMMMMMMMM",
  "MGGGGGGGGGGGGGGM",
  "MGZGZGZGZGZGZGGM",
  "MGGZGZGZGZGZGZGM",
  "MGGGGGGGGGGGGGGM",
  "MMMMMMMMMMMMMMMM",
  ".MM..........MM.",
]

const FARBE: Record<string, string> = {
  M: "var(--stahl)",
  G: "var(--sunken)",
  A: "var(--akzent)",
  Z: "var(--fg)",
}

export function PixelGegner({ zelle = 5, besiegt = false }: { zelle?: number; besiegt?: boolean }) {
  return (
    <svg
      width={16 * zelle}
      height={12 * zelle}
      viewBox="0 0 16 12"
      shapeRendering="crispEdges"
      role="img"
      aria-label={besiegt ? "Der Gegner liegt am Boden" : "Der Wochengegner"}
      className="flex-none"
    >
      {BILD.flatMap((reihe, y) =>
        [...reihe].map((zeichen, x) => {
          if (zeichen === ".") return null
          // Besiegt: die Augen gehen aus, die Zähne bleiben.
          const farbe = besiegt && zeichen === "A" ? "var(--stahl)" : FARBE[zeichen]
          return <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={farbe} />
        }),
      )}
    </svg>
  )
}
