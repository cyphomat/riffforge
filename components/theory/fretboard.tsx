"use client"

import { noteAt, SAITENNAMEN } from "@/lib/theory/fretboard"
import { BUENDE, BREITE, EINLAGEN, HOEHE, OKTAVBUND, bundMitte, saitenLage } from "@/lib/theory/hals"
import type { Griff } from "@/lib/theory/types"

/**
 * Ein antippbares Griffbrett.
 *
 * Die Antwort wird gezeigt statt gewählt — auf der Gitarre ist das der
 * natürliche Weg, und Produzieren behält sich besser als Ankreuzen.
 *
 * Gezeichnet statt gerastert, weil die Punkte an rechnerisch bestimmten
 * Stellen sitzen müssen: ein Ton gehört *hinter* das Bundstäbchen, nicht
 * darauf.
 */

/**
 * Zwölf Bünde müssen aufs Handy passen: wer zum Antworten seitlich scrollen
 * muss, findet die richtige Stelle nicht.
 *
 * Auf 390 px bleiben damit rund 28 px je Bund — schmaler geht ein Finger
 * nicht. Breiter geht es nicht, ohne Bünde wegzulassen, also wird die
 * Trefferfläche in der Höhe gross: 6 Saiten auf reichlich Platz statt eines
 * gedrungenen Halses. Ein Vergreifen trifft dann den Nachbarbund, nicht die
 * Nachbarsaite — und die Saite ist die Auskunft, auf die es ankommt.
 */
const RAND_LINKS = 20
const RAND_OBEN = 20

const x = (bund: number) => RAND_LINKS + bundMitte(bund)
const y = (saite: number) => RAND_OBEN + saitenLage(saite)

export interface FretboardProps {
  /** Was von Anfang an markiert ist — etwa der Grundton einer Frage. */
  gegeben?: Griff[]
  /** Was angetippt wurde. */
  gewaehlt?: Griff | null
  /**
   * Wird nach dem Auflösen gesetzt: alle richtigen Stellen. Ihr Vorhandensein
   * ist zugleich das Zeichen, dass aufgelöst wurde — vorher trägt keine
   * Markierung einen Tonnamen.
   */
  loesung?: Griff[]
  /** Null schaltet das Antippen ab — nach dem Auflösen. */
  onPick?: ((griff: Griff) => void) | null
}

export function Fretboard({ gegeben = [], gewaehlt, loesung, onPick }: FretboardProps) {
  const breite = RAND_LINKS + BUENDE * BREITE + 12
  const hoehe = RAND_OBEN + 6 * HOEHE + 6

  /**
   * Vor dem Auflösen steht in einer Markierung kein Tonname.
   *
   * Sonst beantwortet das Griffbrett die Frage im Moment des Antippens selbst:
   * man tippt irgendwohin, liest ab, korrigiert — und hat nichts abgerufen.
   * Der gegebene Grundton ist die Ausnahme, er gehört zur Frage.
   */
  const aufgeloest = loesung !== undefined
  const trifft = (liste: Griff[] | undefined, saite: number, bund: number) =>
    liste?.some((stelle) => stelle.saite === saite && stelle.bund === bund) ?? false

  return (
    <div className="-mx-1 overflow-x-auto px-1 py-1">
      <svg
        viewBox={`0 0 ${breite} ${hoehe}`}
        className="block w-full"
        role="group"
        aria-label="Griffbrett, erster bis zwölfter Bund"
      >
        {/* Einlagen zuerst, damit alles andere darüber liegt. */}
        {EINLAGEN.map((bund) => (
          <circle key={bund} cx={x(bund)} cy={y(3.5)} r={8} fill="var(--panel2)" />
        ))}
        <circle cx={x(OKTAVBUND)} cy={y(2.3)} r={7} fill="var(--panel2)" />
        <circle cx={x(OKTAVBUND)} cy={y(4.7)} r={7} fill="var(--panel2)" />

        {/* Sattel dick, Bundstäbchen dünn. */}
        <line
          x1={RAND_LINKS}
          y1={y(1) - 4}
          x2={RAND_LINKS}
          y2={y(6) + 4}
          stroke="var(--muted)"
          strokeWidth={4}
        />
        {Array.from({ length: BUENDE }, (_, i) => i + 1).map((bund) => (
          <line
            key={bund}
            x1={RAND_LINKS + bund * BREITE}
            y1={y(1) - 4}
            x2={RAND_LINKS + bund * BREITE}
            y2={y(6) + 4}
            stroke="var(--line)"
            strokeWidth={2}
          />
        ))}

        {/* Saiten: tief dick, hoch dünn. */}
        {[1, 2, 3, 4, 5, 6].map((saite) => (
          <line
            key={saite}
            x1={RAND_LINKS}
            y1={y(saite)}
            x2={RAND_LINKS + BUENDE * BREITE}
            y2={y(saite)}
            stroke="var(--dim)"
            strokeWidth={1 + (saite - 1) * 0.3}
          />
        ))}

        {[1, 2, 3, 4, 5, 6].map((saite) => (
          <text
            key={saite}
            x={RAND_LINKS - 9}
            y={y(saite) + 4}
            textAnchor="end"
            className="fill-[--dim] font-mono text-[13px]"
          >
            {SAITENNAMEN[saite - 1]}
          </text>
        ))}

        {[...EINLAGEN, OKTAVBUND].map((bund) => (
          <text
            key={bund}
            x={x(bund)}
            y={hoehe - 2}
            textAnchor="middle"
            className="fill-[--dim] font-mono text-[13px]"
          >
            {bund}
          </text>
        ))}

        {/* Trefferflächen: gross genug für einen Daumen, unsichtbar. */}
        {[1, 2, 3, 4, 5, 6].map((saite) =>
          Array.from({ length: BUENDE }, (_, i) => i + 1).map((bund) => {
            const griff = { saite, bund } as Griff
            const istGegeben = trifft(gegeben, saite, bund)
            const istGewaehlt = gewaehlt?.saite === saite && gewaehlt?.bund === bund
            const istLoesung = trifft(loesung, saite, bund)

            return (
              <g key={`${saite}-${bund}`}>
                {(istGegeben || istGewaehlt || istLoesung) && (
                  <>
                    <circle
                      cx={x(bund)}
                      cy={y(saite)}
                      r={15}
                      fill={
                        istGegeben
                          ? "var(--akzent)"
                          : istGewaehlt && !aufgeloest
                            ? "var(--tint-stahl)"
                            : "var(--sunken)"
                      }
                      stroke={
                        istGegeben
                          ? "var(--akzent)"
                          : istLoesung
                            ? "var(--gruen)"
                            : "var(--stahl)"
                      }
                      strokeWidth={2}
                    />
                    {(istGegeben || aufgeloest) && (
                      <text
                        x={x(bund)}
                        y={y(saite) + 4}
                        textAnchor="middle"
                        className={`font-mono text-[12px] ${
                          istGegeben
                            ? "fill-[--bg] font-bold"
                            : istLoesung
                              ? "fill-[--gruen]"
                              : "fill-[--stahl]"
                        }`}
                      >
                        {noteAt(griff)}
                      </text>
                    )}
                  </>
                )}
                {onPick && (
                  <rect
                    x={x(bund) - BREITE / 2}
                    y={y(saite) - HOEHE / 2}
                    width={BREITE}
                    height={HOEHE}
                    fill="transparent"
                    className="cursor-pointer"
                    onClick={() => onPick(griff)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Saite ${SAITENNAMEN[saite - 1]}, Bund ${bund}`}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault()
                        onPick(griff)
                      }
                    }}
                  />
                )}
              </g>
            )
          }),
        )}
      </svg>
    </div>
  )
}
