"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { MdArrowBack, MdMic, MdMicOff } from "react-icons/md"
import { useAudioEngine } from "@/hooks/use-audio-engine"
import { Stimmgeraet as Mikrofon } from "@/lib/audio/stimmgeraet"
import {
  geglaettet,
  naechsteSaite,
  saitenVon,
  type Anzeige,
  type Stimmung,
} from "@/lib/audio/stimmen"
import type { Tonhoehe } from "@/lib/audio/tonhoehe"
import { dayKey } from "@/lib/session/progress"
import { SAITEN_TAGE, SAITEN_UEBUNGSTAGE, saitenStand, type SaitenStand } from "@/lib/session/saiten"
import { loadLog } from "@/lib/storage/practice-log"
import { merkeSaitenwechsel, saitenGewechselt } from "@/lib/storage/lokal"

/** How often the needle asks for a new estimate, in ms. */
const TAKT_MS = 80
/** Estimates the needle is smoothed over — about 400 ms. */
const FENSTER = 5
/** How long a string has to sit in tune before it is ticked off, in ms. */
const HALTEN_MS = 600

/**
 * Das Stimmgerät. Eine Saite anschlagen und klingen lassen — mehr nicht.
 *
 * Es hört Tonhöhe, aber nur hier: was im Block gespielt wird, bewertet die
 * App weiterhin nur nach dem Rhythmus. Warum, steht in
 * `lib/audio/__tests__/tonhoehe.test.ts`, mit den Zahlen.
 */
export function Stimmgeraet() {
  const engine = useAudioEngine()
  const mikro = useRef<Mikrofon | null>(null)
  const verlauf = useRef<Array<Tonhoehe | null>>([])
  const imTonSeit = useRef<number | null>(null)

  const [stimmung, setStimmung] = useState<Stimmung>("sechs")
  const [hoert, setHoert] = useState(false)
  const [grund, setGrund] = useState<string | null>(null)
  const [anzeige, setAnzeige] = useState<Anzeige | null>(null)
  const [gestimmt, setGestimmt] = useState<Set<number>>(new Set())

  // `/stimmen?saiten=7` kommt aus dem Sieben-Saiter-Modus.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("saiten") === "7") setStimmung("sieben")
  }, [])

  useEffect(() => {
    if (!hoert) return
    const takt = setInterval(() => {
      const neu = mikro.current?.lesen() ?? null
      verlauf.current = [...verlauf.current, neu].slice(-FENSTER)
      const hz = geglaettet(verlauf.current)
      if (hz === null) {
        setAnzeige(null)
        imTonSeit.current = null
        return
      }
      const a = naechsteSaite(hz, stimmung)
      setAnzeige(a)
      // Abgehakt wird eine Saite erst, wenn sie eine Weile im Ton bleibt —
      // ein einzelner Durchgang der Nadel durch die Mitte ist kein Stimmen.
      if (a.imTon) {
        const seit = imTonSeit.current ?? Date.now()
        imTonSeit.current = seit
        if (Date.now() - seit >= HALTEN_MS) {
          setGestimmt((vorher) => (vorher.has(a.saite.nummer) ? vorher : new Set(vorher).add(a.saite.nummer)))
        }
      } else {
        imTonSeit.current = null
      }
    }, TAKT_MS)
    return () => clearInterval(takt)
  }, [hoert, stimmung])

  useEffect(() => () => mikro.current?.stop(), [])

  const an = async () => {
    setGrund(null)
    const m = mikro.current ?? new Mikrofon(engine)
    mikro.current = m
    const fehler = await m.start()
    if (fehler) {
      setGrund(fehler)
      return
    }
    setHoert(true)
  }

  const aus = () => {
    mikro.current?.stop()
    setHoert(false)
    setAnzeige(null)
    verlauf.current = []
  }

  const saiten = saitenVon(stimmung)
  const zustand = !anzeige ? null : anzeige.imTon ? "sitzt" : anzeige.cent < 0 ? "zu tief" : "zu hoch"
  // ±50 Cent füllen die Skala; was darüber liegt, steht am Rand an.
  const nadel = anzeige ? 50 + Math.max(-50, Math.min(50, anzeige.cent)) : 50

  return (
    <div className="huelle">
      <header className="mt-6">
        <span className="kicker">Stimmen</span>
        <h1 className="display mt-1 text-[34px] text-fg sm:text-[38px]">Stimmgerät</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Eine Saite anschlagen und klingen lassen. Die App hört hier die Tonhöhe — nur zum Stimmen;
          was du im Block spielst, bewertet sie weiter nur nach dem Rhythmus.
        </p>
      </header>

      <div className="mt-5 flex gap-[9px]" role="group" aria-label="Stimmung">
        {(["sechs", "sieben"] as const).map((s) => (
          <button
            key={s}
            onClick={() => {
              setStimmung(s)
              setGestimmt(new Set())
            }}
            aria-pressed={stimmung === s}
            className={`border px-3 py-2 font-mono text-[12px] uppercase tracking-[0.1em] ${
              stimmung === s ? "border-akzent bg-(--tint-akzent) text-akzent" : "border-line text-muted"
            }`}
          >
            {s === "sechs" ? "6 Saiten · E" : "7 Saiten · B"}
          </button>
        ))}
      </div>

      <section className="card winkel mt-5" aria-live="polite">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="kicker text-dim">
              {anzeige ? `Saite ${anzeige.saite.nummer}` : hoert ? "Hört zu" : "Mikrofon aus"}
            </span>
            <div className={`display mt-1 text-[64px] leading-none ${anzeige ? "text-fg" : "text-dim"}`}>
              {anzeige ? anzeige.saite.name.replace(/\d/, "") : "–"}
              {anzeige && <span className="ml-1 text-[28px] text-dim">{anzeige.saite.name.match(/\d/)}</span>}
            </div>
          </div>
          <div className="text-right">
            <span className="kicker block">Cent</span>
            {/* Die eine Zahl dieses Bildschirms. */}
            <div className="platte mt-1 inline-block">
              <div
                className={`display num text-[40px] leading-none ${
                  !anzeige ? "text-dim" : anzeige.imTon ? "glimmt text-gruen" : "text-rost"
                }`}
              >
                {anzeige ? `${anzeige.cent > 0 ? "+" : ""}${anzeige.cent}` : "–"}
              </div>
            </div>
          </div>
        </div>

        {/* Die Skala: Mitte ist der Ton, links zu tief, rechts zu hoch. */}
        <div className="relative mt-5 h-10 border border-line bg-sunken" aria-hidden>
          <div className="absolute inset-y-0 left-1/2 w-px bg-gruen opacity-60" />
          {[-40, -30, -20, -10, 10, 20, 30, 40].map((c) => (
            <div
              key={c}
              className="absolute bottom-0 w-px bg-line"
              style={{ left: `${50 + c}%`, height: c % 20 === 0 ? "40%" : "22%" }}
            />
          ))}
          {anzeige && (
            <div
              className={`absolute inset-y-1 w-[4px] -translate-x-1/2 transition-[left] duration-100 ${
                anzeige.imTon ? "bg-gruen" : "bg-akzent"
              }`}
              style={{ left: `${nadel}%` }}
            />
          )}
        </div>
        <div className="mt-1 flex justify-between font-mono text-[11.5px] text-dim">
          <span>zu tief</span>
          <span>zu hoch</span>
        </div>

        <p className="mt-3 flex items-center gap-2 text-[14px]">
          <span
            className={`jewel ${zustand === "sitzt" ? "text-gruen" : zustand ? "text-rost" : "text-dim"}`}
            aria-hidden
          />
          <span className={zustand === "sitzt" ? "text-gruen" : zustand ? "text-rost" : "text-dim"}>
            {zustand === "sitzt"
              ? "Sitzt."
              : zustand
                ? `${zustand === "zu tief" ? "Zu tief" : "Zu hoch"} — ${zustand === "zu tief" ? "anziehen" : "nachlassen"}.`
                : hoert
                  ? "Schlag eine Saite an und lass sie klingen."
                  : "Mikrofon einschalten, dann eine Saite anschlagen."}
          </span>
        </p>
      </section>

      <div className={`mt-3 grid gap-[6px] ${stimmung === "sieben" ? "grid-cols-7" : "grid-cols-6"}`}>
        {[...saiten].reverse().map((s) => {
          const aktiv = anzeige?.saite.nummer === s.nummer
          const fertig = gestimmt.has(s.nummer)
          return (
            <div
              key={s.nummer}
              className={`border py-2 text-center font-mono text-[12px] ${
                aktiv ? "border-akzent text-akzent" : fertig ? "border-gruen text-gruen" : "border-line text-muted"
              }`}
            >
              {s.name}
              {fertig && <span className="sr-only"> gestimmt</span>}
            </div>
          )
        })}
      </div>

      <div className="mt-5">
        {hoert ? (
          <button onClick={aus} className="btn btn-ghost w-full">
            <MdMicOff className="h-[18px] w-[18px]" /> Mikrofon aus
          </button>
        ) : (
          <button onClick={() => void an()} className="btn w-full">
            <MdMic className="h-[18px] w-[18px]" /> Mikrofon an
          </button>
        )}
      </div>

      {grund && (
        <>
          <div className="warnstreifen mt-3" aria-hidden />
          <p className="mt-2 text-[13.5px] leading-relaxed text-rost">{grund}</p>
        </>
      )}

      <p className="mt-4 text-[12.5px] leading-relaxed text-dim">
        Am besten clean oder leise verzerrt, eine Saite allein, die anderen gedämpft. Gemessen genau
        auf unter drei Cent — bei voller Verzerrung und mehreren klingenden Saiten wird es unruhig.
      </p>

      <SaitenPanel />

      <Link href="/" className="btn btn-ghost btn-small mt-9 w-full py-3">
        <MdArrowBack className="h-[16px] w-[16px]" /> Zurück
      </Link>
    </div>
  )
}

/**
 * Die Saiten: wann zuletzt neu aufgezogen, und wie viel seither gespielt.
 * Steht beim Stimmgerät, weil man nach dem Aufziehen ohnehin hier landet.
 */
function SaitenPanel() {
  const [stand, setStand] = useState<SaitenStand | null>(null)
  const [geladen, setGeladen] = useState(false)

  useEffect(() => {
    setStand(saitenStand(loadLog(), saitenGewechselt()))
    setGeladen(true)
  }, [])

  if (!geladen) return null

  const neu = () => {
    merkeSaitenwechsel(dayKey(new Date()))
    setStand(saitenStand(loadLog(), saitenGewechselt()))
  }

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Saiten</h2>
      <p className="mb-3 text-[13px] leading-relaxed text-dim">
        Saiten sterben am Spielen mehr als an der Zeit. Nach {SAITEN_UEBUNGSTAGE} Übungstagen oder{" "}
        {SAITEN_TAGE} Tagen erinnert dich <b className="text-muted">Heute</b> daran. Gilt für dieses Gerät.
      </p>
      <p className={`mb-3 font-mono text-[12.5px] ${stand?.faellig ? "text-rost" : "text-muted"}`}>
        {stand
          ? `Neu seit ${new Date(`${stand.seit}T12:00:00`).toLocaleDateString("de-DE")} · ${stand.uebungstage} ${
              stand.uebungstage === 1 ? "Übungstag" : "Übungstage"
            } · ${stand.tage} ${stand.tage === 1 ? "Tag" : "Tage"}${stand.faellig ? " · neue fällig" : ""}`
          : "Noch nicht eingetragen."}
      </p>
      <button onClick={neu} className="btn btn-ghost w-full">
        Heute neu aufgezogen
      </button>
    </section>
  )
}
