"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MdArrowBack } from "react-icons/md"
import { ALLE_DRILLS_BY_ID } from "@/lib/session/drills"
import {
  drillVerlaeufe,
  entwicklung,
  kalenderwoche,
  pultKanaele,
  wochen as berechneWochen,
  type DrillVerlauf,
  type Kanal,
  type Punkt,
  type Woche,
} from "@/lib/session/rueckblick"
import { TECHNIQUE_LABELS, type Technique } from "@/lib/session/types"
import { loadLog } from "@/lib/storage/practice-log"
import { loadProfile } from "@/lib/storage/profile"

const kw = (woche: string) => `KW ${kalenderwoche(woche)}`

function Stat({ value, label, sub }: { value: number; label: string; sub: string }) {
  return (
    <div className="stat">
      <div className="n">{label}</div>
      <div className="v">{value}</div>
      <div className="font-mono text-[11.5px] text-dim">{sub}</div>
    </div>
  )
}

/**
 * Übungstage je Woche als Säulen.
 *
 * Die laufende Woche in Bernstein, alle anderen in Stahlblau — es geht um
 * diese Woche, die übrigen sind der Hintergrund, vor dem man sie liest. Die
 * Säulen haben eine feste Breite statt eines Anteils der Fläche: bei drei
 * Wochen Log wären es sonst drei Klötze über die ganze Karte.
 */
function WochenSaeulen({ wochen }: { wochen: Woche[] }) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const SLOT = 26
  const SAEULE = 16
  const HOCH = 64
  const OBEN = 16
  const breite = wochen.length * SLOT
  const aktuell = wochen.length - 1
  const zeige = wochen[gewaehlt ?? aktuell]

  return (
    <div>
      <p className="ziffern mb-2 text-[12.5px] text-muted" aria-live="polite">
        {kw(zeige.woche)} · {zeige.tage} {zeige.tage === 1 ? "Tag" : "Tage"} · {zeige.minuten} Min ·{" "}
        {zeige.bloecke} {zeige.bloecke === 1 ? "Block" : "Blöcke"}
      </p>
      <svg
        width={breite}
        height={OBEN + HOCH + 22}
        viewBox={`0 0 ${breite} ${OBEN + HOCH + 22}`}
        className="block max-w-full"
        role="img"
        aria-label="Übungstage je Woche"
        onPointerLeave={() => setGewaehlt(null)}
      >
        {/* Die Sieben als Haarlinie: eine volle Woche reicht bis hierher. */}
        <line x1={0} x2={breite} y1={OBEN} y2={OBEN} stroke="var(--line)" strokeWidth={1} />
        <line x1={0} x2={breite} y1={OBEN + HOCH} y2={OBEN + HOCH} stroke="var(--line)" strokeWidth={1} />
        {wochen.map((w, i) => {
          const h = (w.tage / 7) * HOCH
          const x = i * SLOT + (SLOT - SAEULE) / 2
          const y = OBEN + HOCH - h
          const istAktuell = i === aktuell
          const istGewaehlt = i === (gewaehlt ?? aktuell)
          return (
            <g key={w.woche} onPointerEnter={() => setGewaehlt(i)} onClick={() => setGewaehlt(i)}>
              {/* Die Trefferfläche ist der ganze Streifen, nicht die Säule —
                  eine Woche mit null Tagen hat sonst nichts zum Antippen. */}
              <rect x={i * SLOT} y={0} width={SLOT} height={OBEN + HOCH + 22} fill="transparent" />
              {h > 0 && (
                <path
                  d={`M${x},${OBEN + HOCH} V${y + 2} Q${x},${y} ${x + 2},${y} H${x + SAEULE - 2} Q${x + SAEULE},${y} ${x + SAEULE},${y + 2} V${OBEN + HOCH} Z`}
                  fill={istAktuell ? "var(--akzent)" : "var(--stahl)"}
                  opacity={istGewaehlt || istAktuell ? 1 : 0.55}
                />
              )}
              {istAktuell && w.tage > 0 && (
                <text
                  x={x + SAEULE / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-(--fg) font-mono text-[11.5px] font-bold"
                >
                  {w.tage}
                </text>
              )}
              <text
                x={i * SLOT + SLOT / 2}
                y={OBEN + HOCH + 16}
                textAnchor="middle"
                className={`font-mono text-[11.5px] ${istGewaehlt ? "fill-(--fg)" : "fill-(--dim)"}`}
              >
                {kalenderwoche(w.woche)}
              </text>
              <title>{`${kw(w.woche)}: ${w.tage} Tage, ${w.minuten} Minuten`}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/**
 * Eine Grösse über die Wochen, als Linie mit Lücken.
 *
 * Eine Woche ohne Wert bricht die Linie: dort steht nichts im Log, und eine
 * durchgezogene Linie behauptete einen Verlauf, den es nicht gab. Tempo und
 * Streuung stehen als zwei Linien nebeneinander statt in einer Grafik mit
 * zwei Achsen — zwei Skalen in einem Bild liest jeder anders.
 */
function Linie({
  punkte,
  titel,
  einheit,
  farbe,
}: {
  punkte: Punkt[]
  titel: string
  einheit: string
  farbe: string
}) {
  const [gewaehlt, setGewaehlt] = useState<number | null>(null)
  const B = 150
  const H = 56
  const RAND = 6
  const werte = punkte.flatMap((p) => (p.wert === null ? [] : [p.wert]))
  const letzter = [...punkte].reverse().find((p) => p.wert !== null)

  if (werte.length === 0) {
    return (
      <div>
        <div className="kicker text-dim">{titel}</div>
        <p className="mt-2 font-mono text-[12px] text-dim">nichts im Fenster</p>
      </div>
    )
  }

  const min = Math.min(...werte)
  const max = Math.max(...werte)
  const spanne = max - min || 1
  const x = (i: number) => (punkte.length === 1 ? B / 2 : RAND + (i * (B - 2 * RAND)) / (punkte.length - 1))
  const y = (v: number) => (max === min ? H / 2 : RAND + ((max - v) / spanne) * (H - 2 * RAND))

  // Zusammenhängende Strecken, getrennt an jeder Lücke.
  const strecken: number[][] = []
  punkte.forEach((p, i) => {
    if (p.wert === null) return
    const vorher = strecken.at(-1)
    if (vorher && vorher.at(-1) === i - 1) vorher.push(i)
    else strecken.push([i])
  })

  const zeige = gewaehlt !== null && punkte[gewaehlt].wert !== null ? punkte[gewaehlt] : letzter!
  const naechster = (px: number) => {
    let best = -1
    let abstand = Infinity
    punkte.forEach((p, i) => {
      if (p.wert === null) return
      const d = Math.abs(x(i) - px)
      if (d < abstand) {
        abstand = d
        best = i
      }
    })
    return best
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="kicker text-dim">{titel}</span>
        <span className="ziffern whitespace-nowrap text-[13px] text-fg">
          {zeige.wert}
          <span className="text-dim"> {einheit}</span>
        </span>
      </div>
      <div className="ziffern text-[11.5px] text-dim">{kw(zeige.woche)}</div>
      <svg
        viewBox={`0 0 ${B} ${H}`}
        className="mt-1 block w-full"
        role="img"
        aria-label={`${titel} über die Wochen`}
        onPointerMove={(e) => {
          const box = e.currentTarget.getBoundingClientRect()
          setGewaehlt(naechster(((e.clientX - box.left) / box.width) * B))
        }}
        onPointerLeave={() => setGewaehlt(null)}
      >
        <line x1={0} x2={B} y1={H - 0.5} y2={H - 0.5} stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        {gewaehlt !== null && punkte[gewaehlt].wert !== null && (
          <line x1={x(gewaehlt)} x2={x(gewaehlt)} y1={0} y2={H} stroke="var(--line)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        )}
        {/* Über eine Lücke führt nur eine Haarlinie: sie sagt „hier ging es
            weiter", ohne für die Woche dazwischen einen Wert zu behaupten.
            Ohne sie zerfiel eine Linie mit Lücken in Stücke, die wie eine
            gestrichelte Prognose aussahen. */}
        {strecken.slice(1).map((s, k) => {
          const a = strecken[k].at(-1)!
          const b = s[0]
          return (
            <line
              key={`luecke-${b}`}
              x1={x(a)}
              y1={y(punkte[a].wert!)}
              x2={x(b)}
              y2={y(punkte[b].wert!)}
              stroke={farbe}
              strokeWidth={1}
              opacity={0.35}
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
        {strecken.map((s) =>
          s.length > 1 ? (
            <polyline
              key={s[0]}
              points={s.map((i) => `${x(i)},${y(punkte[i].wert!)}`).join(" ")}
              fill="none"
              stroke={farbe}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ) : null,
        )}
        {punkte.map((p, i) => {
          if (p.wert === null) return null
          // Ein Punkt ohne Nachbarn bekommt seinen Ring, sonst wäre er nur
          // das Ende einer Haarlinie.
          const allein = strecken.some((s) => s.length === 1 && s[0] === i)
          const betont = p === zeige || allein
          if (!betont) return null
          return (
            <circle key={p.woche} cx={x(i)} cy={y(p.wert)} r={4} fill={farbe} stroke="var(--panel)" strokeWidth={2} />
          )
        })}
      </svg>
    </div>
  )
}

function Entwicklungszeile({ punkte, einheit }: { punkte: Punkt[]; einheit: string }) {
  const e = entwicklung(punkte)
  if (!e) return <span className="text-dim">erst eine Woche mit Wert</span>
  return (
    <span>
      <span className="block whitespace-nowrap">
        {e.von} → {e.bis} {einheit}
      </span>
      <span className="block text-dim">seit {kw(e.vonWoche)}</span>
    </span>
  )
}

function DrillKarte({ verlauf }: { verlauf: DrillVerlauf }) {
  const drill = ALLE_DRILLS_BY_ID[verlauf.drillId]
  const gemessen = verlauf.streuung.some((p) => p.wert !== null)
  return (
    <div className="border border-line bg-panel px-[15px] py-[13px]">
      <div className="flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="display truncate text-[17px] text-fg">{drill?.title ?? verlauf.drillId}</div>
          {drill && (
            <div className="kicker mt-0.5 text-dim">{TECHNIQUE_LABELS[drill.technique as Technique]}</div>
          )}
        </div>
        <span className="ziffern flex-none text-[12px] text-muted">
          {verlauf.bloecke} {verlauf.bloecke === 1 ? "Block" : "Blöcke"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-[14px]">
        <Linie punkte={verlauf.tempo} titel="Tempo" einheit="BPM" farbe="var(--akzent)" />
        {gemessen ? (
          <Linie punkte={verlauf.streuung} titel="Streuung" einheit="ms" farbe="var(--stahl)" />
        ) : (
          <div>
            <div className="kicker text-dim">Streuung</div>
            <p className="mt-2 text-[12.5px] leading-snug text-dim">ohne Mikrofon gespielt — nichts gemessen</p>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-[14px] font-mono text-[12px] text-muted">
        <Entwicklungszeile punkte={verlauf.tempo} einheit="BPM" />
        {gemessen ? <Entwicklungszeile punkte={verlauf.streuung} einheit="ms" /> : <span />}
      </div>
    </div>
  )
}

/** Höhe der Bahn minus Regler — so weit fährt er. Steht so in `.kanal` in globals.css. */
const HUB = 104 - 12

/**
 * Das Pult: je Drill ein Kanalzug. Der Fader zeigt dieselbe Zahl, die
 * darüber steht — er ist die Stellung zwischen Start und Ziel, nicht ein
 * zweiter Wert. Für Screenreader steht alles im Etikett des Kanals; die
 * Zeichnung ist stumm.
 */
function Pult({ kanaele }: { kanaele: Kanal[] }) {
  return (
    <ul className="pult" aria-label="Pult: Tempo je Drill zwischen Start und Ziel">
      {kanaele.map((k) => {
        const titel = ALLE_DRILLS_BY_ID[k.drillId]?.title ?? k.drillId
        const oben = (stellung: number) => (1 - stellung) * HUB
        return (
          <li
            key={k.drillId}
            className="kanal"
            aria-label={`${titel}: ${k.jetzt} BPM sauber, Ziel ${k.ziel}${
              k.bewegt ? `, im Rückblick ab ${k.anfang}` : ""
            }`}
          >
            <div aria-hidden className="display num text-[20px] leading-none text-fg">
              {k.jetzt}
            </div>
            <div aria-hidden className="ziffern -mt-1 text-[11.5px] text-dim">
              / {k.ziel}
            </div>
            <div aria-hidden className="bahn">
              {k.bewegt && <i className="kerbe" style={{ top: oben(k.stellungAnfang) + 6 }} />}
              <i className="regler" style={{ top: oben(k.stellung) }} />
            </div>
            <div
              aria-hidden
              className="line-clamp-3 w-full font-mono text-[11.5px] uppercase leading-tight text-muted [overflow-wrap:anywhere]"
            >
              {titel}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Der Rückblick über die Wochen. Alles wird beim Öffnen aus dem Log
 * gerechnet; was das heisst und was bewusst nicht da steht, erklärt
 * `lib/session/rueckblick.ts`.
 */
export function Rueckblick() {
  const [stand, setStand] = useState<{ wochen: Woche[]; drills: DrillVerlauf[]; kanaele: Kanal[] } | null>(null)

  useEffect(() => {
    const log = loadLog()
    const drills = drillVerlaeufe(log)
    setStand({ wochen: berechneWochen(log), drills, kanaele: pultKanaele(drills, loadProfile()) })
  }, [])

  if (!stand) return null
  const { wochen, drills, kanaele } = stand
  const diese = wochen.at(-1)!
  const vorige = wochen.length > 1 ? wochen.at(-2)! : null

  return (
    <div className="huelle-breit zwei-spalten">
      <div className="spalte">
        <header className="mt-6">
          <span className="kicker">Rückblick</span>
          <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Die Wochen</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            {diese.tage === 0
              ? "Diese Woche noch nichts — sie ist aber auch noch nicht vorbei."
              : `Diese Woche an ${diese.tage} ${diese.tage === 1 ? "Tag" : "Tagen"} geübt.`}{" "}
            Was hier steht, kommt aus deinem Log. Wo nichts steht, steht auch nichts darin.
          </p>
        </header>

        <div className="mt-6 grid grid-cols-3 gap-[9px]">
          <Stat value={diese.tage} label="Tage" sub={vorige ? `Vorwoche ${vorige.tage}` : "diese Woche"} />
          <Stat value={diese.minuten} label="Minuten" sub={vorige ? `Vorwoche ${vorige.minuten}` : "diese Woche"} />
          <Stat value={diese.bloecke} label="Blöcke" sub={vorige ? `Vorwoche ${vorige.bloecke}` : "diese Woche"} />
        </div>

        <h2 className="rule mb-3 mt-9">Übungstage je Woche</h2>
        <section className="card plain">
          <WochenSaeulen wochen={wochen} />
        </section>

        <details className="info mt-3">
          <summary>Als Tabelle</summary>
          <div className="overflow-x-auto px-[15px] pb-[15px]">
            <table className="ziffern w-full text-left text-[12.5px] text-muted">
              <thead className="text-dim">
                <tr>
                  <th className="py-1 pr-3 font-normal">Woche</th>
                  <th className="py-1 pr-3 text-right font-normal">Tage</th>
                  <th className="py-1 pr-3 text-right font-normal">Min</th>
                  <th className="py-1 text-right font-normal">Blöcke</th>
                </tr>
              </thead>
              <tbody>
                {[...wochen].reverse().map((w) => (
                  <tr key={w.woche} className="border-t border-line">
                    <td className="py-1 pr-3">{kw(w.woche)}</td>
                    <td className="py-1 pr-3 text-right">{w.tage}</td>
                    <td className="py-1 pr-3 text-right">{w.minuten}</td>
                    <td className="py-1 text-right">{w.bloecke}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <div className="spalte">
        {kanaele.length > 0 && (
          <>
            <h2 className="rule mb-3 mt-9">Am Pult</h2>
            <Pult kanaele={kanaele} />
            <p className="mt-2 text-[12.5px] leading-relaxed text-dim">
              Der Fader steht auf dem letzten sauberen Tempo, die Bahn reicht von deinem Starttempo
              bis zum Ziel. Die <span className="text-stahl">Kerbe</span> zeigt, wo es am Anfang
              des Rückblicks stand.
            </p>
          </>
        )}

        <h2 className="rule mb-1 mt-9">Je Drill</h2>
        <p className="mb-3 text-[12.5px] leading-relaxed text-dim">
          Tempo heisst: das höchste, das in der Woche mit <i>sauber</i> oder besser abgehakt wurde.
          Streuung ist die gemessene Schwankung um den Klick — weniger ist besser.
        </p>
        {drills.length === 0 ? (
          <p className="text-[14px] text-dim">Noch nichts gespielt.</p>
        ) : (
          <div className="flex flex-col gap-[9px]">
            {drills.map((v) => (
              <DrillKarte key={v.drillId} verlauf={v} />
            ))}
          </div>
        )}

        {drills.length > 0 && (
          <details className="info mt-3">
            <summary>Als Tabelle</summary>
            <div className="overflow-x-auto px-[15px] pb-[15px]">
              <table className="ziffern w-full text-left text-[12.5px] text-muted">
                <thead className="text-dim">
                  <tr>
                    <th className="py-1 pr-3 font-normal">Drill</th>
                    <th className="py-1 pr-3 font-normal">Woche</th>
                    <th className="py-1 pr-3 text-right font-normal">BPM</th>
                    <th className="py-1 text-right font-normal">ms</th>
                  </tr>
                </thead>
                <tbody>
                  {drills.flatMap((v) =>
                    v.tempo
                      .map((t, i) => ({ woche: t.woche, bpm: t.wert, ms: v.streuung[i].wert }))
                      .filter((z) => z.bpm !== null || z.ms !== null)
                      .reverse()
                      .map((z) => (
                        <tr key={`${v.drillId}-${z.woche}`} className="border-t border-line">
                          <td className="max-w-[140px] truncate py-1 pr-3">
                            {ALLE_DRILLS_BY_ID[v.drillId]?.title ?? v.drillId}
                          </td>
                          <td className="py-1 pr-3">{kw(z.woche)}</td>
                          <td className="py-1 pr-3 text-right">{z.bpm ?? "–"}</td>
                          <td className="py-1 text-right">{z.ms ?? "–"}</td>
                        </tr>
                      )),
                  )}
                </tbody>
              </table>
            </div>
          </details>
        )}

        <Link href="/" className="btn btn-ghost btn-small mt-9 w-full py-3">
          <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
        </Link>
      </div>
    </div>
  )
}
