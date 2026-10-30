import { LINIE, OBEN, baueNotensatz, type Kopf, type PauseZeichen } from "@/lib/theory/notensatz"
import { toeneOf, type Song } from "@/lib/theory/song"
import { songTabSysteme } from "@/lib/theory/song-tab"

/**
 * Die Notenschrift eines Songs, als SVG.
 *
 * Gemalt wird nur, was `baueNotensatz` ausgerechnet hat — hier steht keine
 * Musik, nur Zeichnung. Farben kommen aus den Variablen der App: Linien in
 * Stahlblau als das Zweitrangige, Noten in der Schriftfarbe, damit sie sich
 * davon abheben.
 */

/** Der Violinschlüssel, mit einem Strich gezeichnet. Ursprung: oberste Linie, x von 0 bis 24. */
const SCHLUESSEL =
  "M14 24 C16 21 20 22 20 26 C20 31 14 34 10 30 C5 26 8 16 14 8 C19 2 18 -8 15 -13 " +
  "C12 -8 14 0 14 12 L14 36 C14 42 8 43 8 39 C8 36 12 36 12 39"

function KopfZeichen({ kopf, mitNamen, namenY }: { kopf: Kopf; mitNamen: boolean; namenY: number }) {
  const { x, y } = kopf
  const ganze = kopf.dauer === 8
  return (
    <g>
      {kopf.hilfslinien.map((ly) => (
        <line key={ly} x1={x - 8} x2={x + 8} y1={ly} y2={ly} className="stroke-fg" strokeWidth={1.3} />
      ))}
      {kopf.hals && (
        <line
          x1={kopf.hals.x}
          x2={kopf.hals.x}
          y1={kopf.hals.von}
          y2={kopf.hals.bis}
          className="stroke-fg"
          strokeWidth={1.4}
        />
      )}
      {kopf.fahne && kopf.hals && (
        <path
          d={
            kopf.richtung === "auf"
              ? `M${kopf.hals.x} ${kopf.hals.bis} C${kopf.hals.x + 1} ${kopf.hals.bis + 8} ${kopf.hals.x + 9} ${kopf.hals.bis + 10} ${kopf.hals.x + 8} ${kopf.hals.bis + 21}`
              : `M${kopf.hals.x} ${kopf.hals.bis} C${kopf.hals.x + 1} ${kopf.hals.bis - 8} ${kopf.hals.x + 9} ${kopf.hals.bis - 10} ${kopf.hals.x + 8} ${kopf.hals.bis - 21}`
          }
          fill="none"
          className="stroke-fg"
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      )}
      <ellipse
        cx={x}
        cy={y}
        rx={ganze ? 6.4 : 5.2}
        ry={ganze ? 4.3 : 3.8}
        transform={ganze ? undefined : `rotate(-20 ${x} ${y})`}
        className={kopf.gefuellt ? "fill-fg" : "stroke-fg"}
        fill={kopf.gefuellt ? undefined : "none"}
        strokeWidth={kopf.gefuellt ? undefined : 2}
      />
      {kopf.kreuz && (
        <text x={x - 14} y={y + 4} fontSize={13} className="fill-fg" textAnchor="middle">
          ♯
        </text>
      )}
      {mitNamen && (
        // Tiefe Töne mit Hilfslinien würden sonst in ihrem Namen stehen.
        <text x={x} y={Math.max(namenY, y + 16)} fontSize={12} className="fill-muted font-mono" textAnchor="middle">
          {kopf.name}
        </text>
      )}
    </g>
  )
}

function PausenZeichen({ pause }: { pause: PauseZeichen }) {
  const { x, y } = pause
  switch (pause.dauer) {
    case 8:
      return <rect x={x - 6} y={y} width={12} height={4} className="fill-fg" />
    case 4:
      return <rect x={x - 6} y={y - 4} width={12} height={4} className="fill-fg" />
    case 2:
      return (
        <path
          d={`M${x - 1.5} ${y - 11} L${x + 3} ${y - 5} L${x - 2.5} ${y + 0.5} L${x + 3} ${y + 7} C${x - 2} ${y + 6} ${x - 4} ${y + 10} ${x + 0.5} ${y + 12}`}
          fill="none"
          className="stroke-fg"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )
    default:
      return (
        <g>
          <circle cx={x - 3.5} cy={y - 4.5} r={2.2} className="fill-fg" />
          <path
            d={`M${x - 3.5} ${y - 4} Q${x + 1} ${y - 3} ${x + 3.5} ${y - 7} L${x - 2.5} ${y + 9}`}
            fill="none"
            className="stroke-fg"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )
  }
}

function NotenSvg({
  song,
  takteProZeile,
  mitNamen,
  className,
  nurSystem,
}: {
  song: Song
  takteProZeile: number
  mitNamen: boolean
  className: string
  /** Zeigt nur dieses System (der Ausschnitt kommt aus dem viewBox), damit die Tabulatur direkt darunter stehen kann. */
  nurSystem?: number
}) {
  const satz = baueNotensatz(song, takteProZeile)
  const unten = OBEN + 4 * LINIE
  const systemHoehe = satz.hoehe / satz.systeme.length
  const sichtbar = nurSystem === undefined ? satz.systeme : [satz.systeme[nurSystem]]
  const ausschnittY = nurSystem === undefined ? 0 : sichtbar[0].y0
  const ausschnittH = nurSystem === undefined ? satz.hoehe : systemHoehe

  return (
    <svg
      viewBox={`-1 ${ausschnittY} ${satz.breite + 2} ${ausschnittH}`}
      role="img"
      aria-label={`Notenschrift, ${song.takte} Takte, Töne ${toeneOf(song).join(" ")}`}
      className={className}
      style={{ maxWidth: satz.breite * 2 }}
    >
      {sichtbar.map((system) => (
        <g key={system.y0} transform={`translate(0 ${system.y0})`}>
          <g className="stroke-stahl" strokeWidth={1}>
            {satz.linien.map((ly) => (
              <line key={ly} x1={0} x2={system.breite} y1={ly} y2={ly} />
            ))}
            <line x1={0.5} x2={0.5} y1={OBEN} y2={unten} />
          </g>

          <path
            d={SCHLUESSEL}
            transform={`translate(3 ${OBEN})`}
            fill="none"
            className="stroke-muted"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {system.taktart && (
            <g className="fill-muted font-display" fontSize={22} fontWeight={700} textAnchor="middle">
              <text x={42} y={OBEN + 2 * LINIE}>4</text>
              <text x={42} y={OBEN + 4 * LINIE}>4</text>
            </g>
          )}

          {system.takte.map((takt) => (
            <g key={takt.index}>
              <g className="stroke-stahl">
                <line
                  x1={takt.x + takt.breite}
                  x2={takt.x + takt.breite}
                  y1={OBEN}
                  y2={unten}
                  strokeWidth={takt.schluss ? 3.5 : 1}
                  transform={takt.schluss ? "translate(-1.75 0)" : undefined}
                />
                {takt.schluss && (
                  <line x1={takt.x + takt.breite - 6} x2={takt.x + takt.breite - 6} y1={OBEN} y2={unten} strokeWidth={1} />
                )}
              </g>
              {takt.pausen.map((pause) => (
                <PausenZeichen key={pause.x} pause={pause} />
              ))}
              {takt.koepfe.map((kopf) => (
                <KopfZeichen key={kopf.note} kopf={kopf} mitNamen={mitNamen} namenY={satz.namenY} />
              ))}
              {takt.balken.map((balken) => (
                <line
                  key={balken.x1}
                  x1={balken.x1}
                  y1={balken.y1}
                  x2={balken.x2}
                  y2={balken.y2}
                  className="stroke-fg"
                  strokeWidth={4}
                />
              ))}
            </g>
          ))}
        </g>
      ))}
    </svg>
  )
}

/**
 * @param takteProZeile Wie viele Takte auf eine Zeile kommen. Ohne Angabe: einer,
 *   solange der Platz unter 28 rem (448 px) liegt, sonst zwei. Gefragt wird der
 *   Platz der Notenschrift selbst und nicht der Bildschirm, damit es auch in
 *   einer schmalen Spalte auf dem Desktop stimmt. Zwei Takte auf 320 px machen
 *   die Notenköpfe so klein, dass man sie nicht mehr trifft — die
 *   Linienabstände lägen bei gut sechs Pixeln.
 * @param mitNamen Schreibt den Tonnamen unter jede Note — fürs Lernen der Namen.
 */
export function NotenView({
  song,
  takteProZeile,
  mitNamen = false,
}: {
  song: Song
  takteProZeile?: number
  mitNamen?: boolean
}) {
  return (
    <div className="@container border border-line bg-sunken p-4">
      {takteProZeile ? (
        <NotenSvg song={song} takteProZeile={takteProZeile} mitNamen={mitNamen} className="mx-auto block h-auto w-full" />
      ) : (
        // Beide Fassungen stehen im Dokument, eine ist immer `display: none` und
        // damit auch für Vorleseprogramme unsichtbar. Das spart Skript und
        // verhindert, dass beim Laden erst die falsche Breite aufblitzt.
        <>
          <NotenSvg song={song} takteProZeile={1} mitNamen={mitNamen} className="mx-auto block h-auto w-full @md:hidden" />
          <NotenSvg song={song} takteProZeile={2} mitNamen={mitNamen} className="mx-auto hidden h-auto w-full @md:block" />
        </>
      )}
    </div>
  )
}

/**
 * Noten und Tabulatur im Wechsel: unter jedem System die Takte, die darin
 * stehen. Wer beim Spielen liest, vergleicht Zeile für Zeile; zuerst alle
 * Noten und dann alle Tabs hiess auf dem Handy zwei Bildschirme scrollen.
 * Zeilenbreite wie bei `NotenView`: ein Takt je Zeile unter 28 rem, sonst zwei.
 */
export function NotenMitTab({ song, mitNamen = false }: { song: Song; mitNamen?: boolean }) {
  const fassung = (proZeile: number, klasse: string) => {
    const satz = baueNotensatz(song, proZeile)
    const tabs = songTabSysteme(song, proZeile)
    return (
      <div className={`space-y-5 ${klasse}`}>
        {satz.systeme.map((system, i) => (
          <div key={system.y0}>
            <NotenSvg
              song={song}
              takteProZeile={proZeile}
              mitNamen={mitNamen}
              nurSystem={i}
              className="mx-auto block h-auto w-full"
            />
            <pre className="mt-1 overflow-x-auto font-mono text-[12.5px] leading-[1.6] text-muted sm:text-[13px]">
              {tabs[i]}
            </pre>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="@container border border-line bg-sunken p-4">
      {fassung(1, "@md:hidden")}
      {fassung(2, "hidden @md:block")}
    </div>
  )
}
