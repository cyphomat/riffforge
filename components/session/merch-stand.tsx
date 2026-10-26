"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MdArrowBack } from "react-icons/md"
import { asset } from "@/lib/base-path"
import {
  festivalPixel,
  GROSS_BREITE,
  GROSS_HOEHE,
  grossesShirt,
  MOTIV_GROESSE,
  type Pixel,
  SHIRT_GROESSE,
  tourDruck,
  tourZeilen,
} from "@/lib/session/shirt"
import { AUFNAEHER_GROESSE, technikAufnaeher } from "@/lib/session/technik-zeichen"
import {
  type Aufnaeher,
  aufnaeher as berechneAufnaeher,
  aufnaeherBild,
  type FestivalShirt,
  festivalShirts as berechneFestivalShirts,
  type GigArt,
  gitarreBild,
  kutte,
  touren as berechneTouren,
  RAENGE,
  type Rang,
  rang as berechneRang,
  rangBild,
  rangTage as berechneRangTage,
  REIHEN,
  type Tour,
} from "@/lib/session/merch"
import { loadLog } from "@/lib/storage/practice-log"
import { loadTheoryLog } from "@/lib/storage/theory-log"
import { THEORY_CARDS } from "@/lib/theory/cards"

/** `2026-06-15` → `15.6.2026` — wie man ein Datum auf einen Aufnäher stickt. */
export function datum(tag: string): string {
  const [jahr, monat, tagZahl] = tag.split("-").map(Number)
  return `${tagZahl}.${monat}.${jahr}`
}

/**
 * Ein neuer Rang, mit seiner Bühne. Kommt alle paar Monate einmal — am
 * Abschluss einer Session und nach einem Lick, überall dort, wo der Log
 * gerade gewachsen ist.
 */
export function RangAufstieg({ rang }: { rang: Rang }) {
  const shirt = `${rang.titel.replace(/ /g, "-")}-Shirt`
  return (
    <>
      <h2 className="rule mb-3 mt-9">Neuer Rang</h2>
      <div className="border border-akzent bg-panel p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
        <img
          src={asset(rangBild(rang.id))}
          alt={`Bühne: ${rang.titel}`}
          width={288}
          height={144}
          className="pixel mx-auto block h-auto w-[288px] max-w-full"
        />
        <p className="display mt-3 text-center text-[28px] leading-none text-fg">{rang.titel}</p>
        <p className="mt-2 text-center text-[13.5px] text-muted">
          {rang.wochen} Wochen mit mindestens einer Session. Der Rang fällt nie.
        </p>
        <div className="mt-3 flex items-center justify-center gap-3 border-t border-line pt-3">
          <FestivalShirtBild id={rang.id} name={shirt} groesse={64} />
          <p className="text-[13.5px] text-muted">
            Dazu das <span className="text-fg">{shirt}</span> — liegt jetzt am Merch-Stand.
          </p>
        </div>
      </div>
    </>
  )
}

/**
 * Ein Tourshirt als Pixelbild. Gezeichnet als SVG aus Rechtecken: scharf in
 * jeder Grösse, und die Rechnung dahinter steht in `lib/session/shirt.ts`.
 */
/** So viele Daten passen hinten aufs Shirt, in drei Spalten. Der Rest steht in der Liste darunter. */
const SHIRT_DATEN = 33
const GIG_ART: Record<GigArt, string> = { session: "Session", lick: "Lick", sieben: "Sieben Saiten" }
const kurz = (tag: string) => datum(tag).replace(/\d{4}$/, "")

/** Eine Seite des grossen Shirts, ohne Druck — der liegt als Text darüber. */
function ShirtStoff({ stoff, hinten }: { stoff: string; hinten: boolean }) {
  return (
    <svg viewBox={`0 0 ${GROSS_BREITE} ${GROSS_HOEHE}`} shapeRendering="crispEdges" aria-hidden>
      {grossesShirt(stoff, hinten).map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.farbe} />
      ))}
    </svg>
  )
}

/** Das Emblem auf der Brust: das Motiv zum zweiten Wort des Tournamens, zweifarbig wie ein Siebdruck. */
function Emblem({ motiv, tinte, zweite }: { motiv: string[]; tinte: string; zweite: string }) {
  return (
    <svg className="emblem" viewBox={`0 0 ${MOTIV_GROESSE} ${MOTIV_GROESSE}`} shapeRendering="crispEdges" aria-hidden>
      {motiv.flatMap((zeile, y) =>
        [...zeile].map((z, x) =>
          z === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={z === "a" ? tinte : zweite} />,
        ),
      )}
    </svg>
  )
}

/**
 * Ein Tourshirt, wie es am Merch-Stand hängt — aus Setlist übernommen.
 *
 * Vorne Wortmarke, Emblem, Tourname und Quartal, die laufende Tour mit
 * „Live"-Sticker; hinten die Tourdaten, wie auf jedem echten Tourshirt. Der
 * Knopf dreht es um. Die volle Liste mit dem, was an jedem Tag gespielt
 * wurde, steht darunter zum Aufklappen.
 */
export function TourShirtKarte({ tour }: { tour: Tour }) {
  const [gewendet, setGewendet] = useState(false)
  const druck = tourDruck(tour.name)
  const [oben, unten] = tourZeilen(tour.name)
  const zeit = `Q${tour.quartal} ${tour.jahr}`
  const hinten = tour.gigs.slice(0, SHIRT_DATEN)
  const rest = tour.gigs.length - hinten.length

  return (
    <article
      className={`tourshirt ${gewendet ? "gewendet" : ""} ${tour.laufend ? "laufend" : ""}`}
      // Die Tinte gehört zum Bild wie der Stoff — siehe lib/session/shirt.ts.
      style={{ "--druck": druck.tinte } as React.CSSProperties}
    >
      <div className="shirt-buehne">
        <div className="shirt-dreh">
          <div className="shirt-seite vorne" role="img" aria-label={`Tourshirt ${tour.name}, ${zeit}`}>
            <ShirtStoff stoff={druck.stoff} hinten={false} />
            <div className="druck" aria-hidden>
              <span className="marke">
                Riff<span className="fuge">forge</span>
              </span>
              <Emblem motiv={druck.motiv} tinte={druck.tinte} zweite={druck.zweite} />
              <span className="tname">
                {oben}
                <br />
                {unten}
              </span>
              <span className="tzeit">Tour · {zeit}</span>
            </div>
            {tour.laufend && (
              <span className="sticker" aria-hidden>
                Live
              </span>
            )}
          </div>
          <div className="shirt-seite hinten" aria-hidden>
            <ShirtStoff stoff={druck.stoff} hinten />
            <div className="druck">
              <span className="tkopf">Tourdaten</span>
              <ol className="daten">
                {hinten.map((tag) => (
                  <li key={tag}>{kurz(tag)}</li>
                ))}
              </ol>
              {rest > 0 && <span className="mehr">+ {rest} weitere</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-w-0 flex-col gap-[2px]">
        <b className="display text-[17px] leading-tight text-fg [overflow-wrap:anywhere]">{tour.name}</b>
        <span className="text-[13px] text-muted">
          {zeit}
          {tour.laufend && <span className="text-akzent"> · läuft</span>}
        </span>
        <span className="text-[13px] text-muted">
          {tour.gigs.length} {tour.gigs.length === 1 ? "Gig" : "Gigs"} · {tour.minuten} Min
          {tour.siebenGigs > 0 && ` · ${tour.siebenGigs} auf sieben Saiten`}
          {tour.aufnaeher > 0 && ` · ${tour.aufnaeher} Aufnäher`}
        </span>
        <button
          type="button"
          className="shirt-wenden mt-[6px]"
          aria-pressed={gewendet}
          onClick={() => setGewendet((w) => !w)}
        >
          {gewendet ? "Vorderseite zeigen" : "Rückseite zeigen"} ↻
        </button>
      </div>

      <details>
        <summary className="kicker cursor-pointer py-[6px] text-muted">Alle Termine</summary>
        <ol className="termine">
          {tour.termine.map((t) => (
            <li key={t.tag}>
              <span className="font-mono text-akzent">{kurz(t.tag)}</span>
              <span className="text-fg">{t.arten.map((a) => GIG_ART[a]).join(" + ")}</span>
            </li>
          ))}
        </ol>
      </details>
    </article>
  )
}

/** Ein Festival-Shirt: Langarm, Druck zum Rang. Die Rechnung steht in `lib/session/shirt.ts`. */
export function FestivalShirtBild({ id, name, groesse = 96 }: { id: string; name: string; groesse?: number }) {
  return <PixelBild pixel={festivalPixel(id)} seite={SHIRT_GROESSE} groesse={groesse} label={name} />
}

/** Rechtecke statt einer Datei — scharf in jeder Grösse. */
function PixelBild({
  pixel,
  seite,
  groesse,
  label,
  className = "mx-auto block",
}: {
  pixel: Pixel[]
  seite: number
  groesse: number
  label?: string
  className?: string
}) {
  return (
    <svg
      viewBox={`0 0 ${seite} ${seite}`}
      width={groesse}
      height={groesse}
      shapeRendering="crispEdges"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={className}
    >
      {pixel.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={1} height={1} fill={p.farbe} />
      ))}
    </svg>
  )
}

export function AufnaeherKachel({ a }: { a: Aufnaeher }) {
  return (
    <div className={`aufnaeher ${a.verdient ? "verdient" : "offen"} min-w-0`}>
      {/* 24 Pixel, doppelt gezeichnet: ganzzahlig, damit kein Pixel verschwimmt.
          Über dem Text statt daneben — daneben blieben auf 320 px zwei Spalten
          mit kaum fünfzig Pixeln für „Gitarrensolo". */}
      {a.technik ? (
        // Technik-Aufnäher sind gerechnet: das Zeichen aus der Drill-Liste, gestickt.
        <PixelBild
          pixel={technikAufnaeher(a.technik)}
          seite={AUFNAEHER_GROESSE}
          groesse={48}
          className="pixel mb-2 block"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer
        <img src={asset(aufnaeherBild(a.gruppe))} alt="" width={48} height={48} className="pixel mb-2" />
      )}
      <div className="[overflow-wrap:anywhere]">
        <div className={`display text-[17px] leading-tight ${a.verdient ? "text-fg" : "text-muted"}`}>
          {a.titel}
        </div>
        <p className={`mt-1 text-[13px] leading-snug ${a.verdient ? "text-muted" : "text-dim"}`}>
          {a.verdient ? `seit ${datum(a.verdient)}` : a.text}
        </p>
      </div>
    </div>
  )
}

/**
 * Der Merch-Stand: Rang, Kutte, Tourshirts.
 *
 * Alles wird beim Öffnen aus den beiden Logs gerechnet — es gibt hier nichts
 * zu speichern und nichts, das zwischen zwei Geräten auseinanderlaufen
 * könnte. Warum es so gebaut ist, steht in `lib/session/merch.ts`.
 */
export function MerchStand() {
  const [stand, setStand] = useState<{
    rang: Rang
    liste: Aufnaeher[]
    touren: Tour[]
    festival: FestivalShirt[]
    rangTage: Array<string | null>
  } | null>(null)
  // Welche Bühne gross steht: die aktuelle, oder eine schon erreichte aus der Leiste.
  const [gezeigt, setGezeigt] = useState<number | null>(null)

  useEffect(() => {
    const log = loadLog()
    const liste = berechneAufnaeher(log, loadTheoryLog(), THEORY_CARDS)
    setStand({
      rang: berechneRang(log),
      liste,
      touren: berechneTouren(log, liste),
      festival: berechneFestivalShirts(log),
      rangTage: berechneRangTage(log),
    })
  }, [])

  if (!stand) return null
  const { rang, liste, touren, festival, rangTage } = stand
  const stufe = gezeigt ?? rang.stufe
  const buehne = RAENGE[stufe]
  const frueher = stufe !== rang.stufe
  // Verdiente und das nächste als Umriss — wie an der Kutte, keine Reihe leerer Bügel.
  const festivalHier = [...festival.filter((f) => f.verdient), ...festival.filter((f) => !f.verdient).slice(0, 1)]
  const { verdient, naechste } = kutte(liste)

  return (
    <div className="huelle-breit zwei-spalten">
      <div className="spalte">
        <header className="mt-6">
          <span className="kicker">Merch</span>
          <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Merch-Stand</h1>
          <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
            Alles hier wird aus deinem Log berechnet. Belohnt wird Regelmässigkeit, nicht Menge.
          </p>
        </header>

        <h2 className="tape">Rang</h2>
        {/* Der Rang ist die eine Auskunft dieses Bildschirms — deshalb die
            Winkel hier und nirgends sonst. */}
        <section className="card winkel @container">
          <span className="kicker text-dim" aria-live="polite">
            {frueher
              ? `Erreicht am ${datum(rangTage[stufe]!)}`
              : `${rang.wochen} ${rang.wochen === 1 ? "Woche" : "Wochen"} auf Tour`}
          </span>
          <h2 className={`display mt-1 text-[44px] leading-none ${frueher ? "text-muted" : "text-fg"}`}>
            {buehne.titel}
          </h2>

          {/* Die Bühne zum Rang — 96 × 48 Pixel, dreifach gezeichnet, ab
              breiterem Schirm vierfach: ganzzahlig, sonst verschwimmt Pixelkunst. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
          <img
            src={asset(rangBild(buehne.id))}
            alt={`Bühne: ${buehne.titel}`}
            width={288}
            height={144}
            className="pixel mt-4 block h-auto w-[288px] max-w-full border border-line sm:w-[384px]"
          />

          {/* Die ganze Tour als Bildleiste, aus Setlist: wo man war, wo man ist,
              was kommt. Verkleinert statt vergrössert — dafür gilt die
              Ganzzahl-Regel nicht, weichgezeichnet wird hier nichts.
              Erreichte Bühnen sind Knöpfe: man darf noch einmal in den
              Proberaum schauen. Was noch kommt, bleibt dunkel und stumm. */}
          <div className="tour-leiste mt-3">
            {RAENGE.map((r, i) => {
              const zustand = i < rang.stufe ? "erreicht" : i === rang.stufe ? "jetzt" : "kommt"
              const bild = (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
                  <img src={asset(rangBild(r.id))} alt="" width={96} height={48} className="pixel" />
                  <figcaption>{r.titel}</figcaption>
                </>
              )
              return (
                <figure key={r.id} className={`${zustand} ${i === stufe ? "gezeigt" : ""}`}>
                  {i <= rang.stufe ? (
                    <button
                      type="button"
                      onClick={() => setGezeigt(i === rang.stufe ? null : i)}
                      aria-pressed={i === stufe}
                      aria-label={`Bühne ${r.titel} zeigen`}
                      title={i === rang.stufe ? `${r.titel} · jetzt` : `${r.titel} · erreicht am ${datum(rangTage[i]!)}`}
                    >
                      {bild}
                    </button>
                  ) : (
                    <div title={`${r.titel} · ab ${r.wochen} Wochen`}>{bild}</div>
                  )}
                </figure>
              )
            })}
          </div>
          {frueher && (
            <button type="button" className="shirt-wenden mt-3" onClick={() => setGezeigt(null)}>
              Zurück zu {rang.titel} ↩
            </button>
          )}
          {rang.naechster && (
            <div className="bar mt-2 h-[4px]">
              <i style={{ width: `${Math.round(rang.anteil * 100)}%` }} />
            </div>
          )}

          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            {rang.naechster
              ? `Noch ${rang.naechster.fehlt} ${rang.naechster.fehlt === 1 ? "Woche" : "Wochen"} bis ${rang.naechster.titel}. `
              : "Ganz oben angekommen. "}
            Gezählt werden Wochen mit mindestens einer Session, nicht Sessions. Der Rang fällt nie.
          </p>
        </section>

        <h2 className="tape">Gitarrenrack</h2>
        {/* Eine Gitarre je Rang, wie die Festival-Shirts: die verdienten und die
            nächste als Umriss. Gezeichnet in Roadie, hier aus `tools/gitarren.mjs`. */}
        <section className="card">
          <div className="rack">
            {RAENGE.slice(0, rang.stufe + 2).map((r, i) => {
              const erreicht = i <= rang.stufe
              return (
                <figure key={r.id} className={erreicht ? "erreicht" : "kommt"}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- statischer Export, kein Optimizer */}
                  <img
                    src={asset(gitarreBild(r.id))}
                    alt={erreicht ? r.gitarre : `Nächste Gitarre ab ${r.titel}`}
                    title={erreicht ? `${r.gitarre}${rangTage[i] ? ` · seit ${datum(rangTage[i])}` : ""}` : `Ab ${r.titel}`}
                    width={24}
                    height={56}
                    className="pixel"
                  />
                </figure>
              )
            })}
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-muted">
            Jetzt: <span className="text-fg">{buehne.gitarre}</span>
            {rang.naechster && ` · als Nächstes hängt hier ab ${rang.naechster.titel} eine neue Gitarre`}. Mit jedem
            Rang kommt eine dazu; verloren geht keine.
          </p>
        </section>

        <h2 className="tape schief">Die Kutte</h2>
        {/* Die Kutte als eine Fläche, wie in Setlist: Aufnäher gehören auf
            Stoff, nicht auf den Seitengrund. */}
        <section className="card">
          <p className="mb-1 text-[12.5px] text-dim">
            {verdient.length} Aufnäher verdient. Je Reihe steht der nächste als
            Umriss da.
          </p>
          {REIHEN.map((reihe) => {
            const hier = [
              ...verdient.filter((a) => a.reihe === reihe.id),
              ...naechste.filter((a) => a.reihe === reihe.id),
            ]
            if (hier.length === 0) return null
            return (
              <div key={reihe.id}>
                <p className="kicker mb-2 mt-5 text-dim">{reihe.titel}</p>
                <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[9px]">
                  {hier.map((a) => (
                    <AufnaeherKachel key={a.id} a={a} />
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      </div>

      <div className="spalte">
        <h2 className="tape schief">Tourshirts</h2>
        {touren.length === 0 ? (
          <p className="text-[14px] text-dim">Die erste Tour beginnt mit der ersten Session.</p>
        ) : (
          <div className="shirt-wand">
            {touren.map((tour) => (
              <TourShirtKarte key={`${tour.jahr}-${tour.quartal}`} tour={tour} />
            ))}
          </div>
        )}

        <h2 className="tape">Festival-Shirts</h2>
        <p className="mb-3 text-[12.5px] text-dim">
          Eins für jeden Rang. Langarm, damit man sie von den Tourshirts unterscheidet.
        </p>
        <div className="grid grid-cols-[repeat(2,minmax(0,1fr))] gap-[9px]">
          {festivalHier.map((f) => (
            <div key={f.id} className={`aufnaeher ${f.verdient ? "verdient" : "offen"} min-w-0`}>
              <div className="pixel">
                <FestivalShirtBild id={f.id} name={f.titel} />
              </div>
              <p
                className={`display mt-2 text-[15px] leading-tight [overflow-wrap:anywhere] ${
                  f.verdient ? "text-fg" : "text-muted"
                }`}
              >
                {f.titel}
              </p>
              <p className={`mt-1 text-[13px] leading-snug ${f.verdient ? "text-muted" : "text-dim"}`}>
                {f.verdient
                  ? `seit ${datum(f.verdient)}`
                  : `Ab ${f.wochen} Wochen — noch ${f.wochen - rang.wochen}.`}
              </p>
            </div>
          ))}
        </div>
        <Link href="/" className="btn btn-ghost btn-small mt-9 w-full py-3">
          <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
        </Link>
      </div>
    </div>
  )
}
