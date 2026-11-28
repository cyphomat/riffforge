"use client"

import { useId, useState, type FormEvent, type ReactNode } from "react"
import { technikTagSchema, uebetempoBpm, type Abschnitt, type RepertoireSong } from "@/lib/session/repertoire"
import {
  SPUREN,
  STIMMUNGEN,
  abschnittAusEntwurf,
  abschnittEntfernen,
  abschnittEntwurf,
  abschnittVorschlaege,
  entwurfAusGp,
  gitarrenStimmungen,
  mitVorschlaegen,
  songAusEntwurf,
  songEntwurf,
  stimmungAusText,
  type SoundEntwurf,
} from "@/lib/session/repertoire-formular"
import { TECHNIQUE_LABELS } from "@/lib/session/types"
import type { GpSong } from "@/lib/session/repertoire-gp"
import { merkeSong } from "@/lib/storage/lokal"
import { GpDatei } from "./repertoire-gp"
import { Meldungen } from "./repertoire-meldungen"
import { takteText } from "./repertoire-teile"

export const NICHT_GESPEICHERT =
  "Speichern hat nicht geklappt. Der Speicher dieses Browsers ist voll oder gesperrt — die Änderung ist nicht gesichert."

const kennung = () => crypto.randomUUID()

/** A delete button that asks first. `onLoeschen` says whether it worked. */
export function Loeschen({ knopf, frage, onLoeschen }: { knopf: string; frage: string; onLoeschen: () => boolean }) {
  const [sicher, setSicher] = useState(false)
  const [fehler, setFehler] = useState<string[]>([])

  if (!sicher) {
    return (
      <button type="button" onClick={() => setSicher(true)} className="btn btn-ghost w-full">
        {knopf}
      </button>
    )
  }
  return (
    <div>
      <p className="mb-3 text-[14px] leading-relaxed text-fg">{frage}</p>
      <Meldungen fehler={fehler} />
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setFehler(onLoeschen() ? [] : [NICHT_GESPEICHERT])}
          className="btn flex-1 border-2 border-rot bg-transparent text-rot"
        >
          Wirklich löschen
        </button>
        <button type="button" onClick={() => setSicher(false)} className="btn btn-ghost btn-small px-4">
          Abbrechen
        </button>
      </div>
    </div>
  )
}

function Feld({
  label,
  wert,
  onChange,
  zahl,
  platzhalter,
  children,
}: {
  label: string
  wert: string
  onChange: (wert: string) => void
  zahl?: boolean
  platzhalter?: string
  children?: ReactNode
}) {
  const id = useId()
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="kicker text-dim">
        {label}
      </label>
      <input
        id={id}
        type="text"
        inputMode={zahl ? "decimal" : undefined}
        autoComplete="off"
        value={wert}
        placeholder={platzhalter}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border border-line bg-sunken px-3 py-2.5 text-[16px] text-fg outline-hidden focus:border-akzent"
      />
      {children}
    </div>
  )
}

/** Small choices that fill a field or toggle a tag. */
function Wahl({ aktiv, onClick, children }: { aktiv: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={aktiv}
      onClick={onClick}
      className={`min-h-10 cursor-pointer px-3 font-mono text-[13px] uppercase tracking-[0.04em] ${
        aktiv ? "bg-(--tint-akzent) text-akzent shadow-(--pix-akzent)" : "text-muted shadow-(--pix-line)"
      }`}
    >
      {children}
    </button>
  )
}

function Knoepfe({ onAbbrechen }: { onAbbrechen: () => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 pt-2">
      <button type="submit" className="btn">
        Speichern
      </button>
      <button type="button" onClick={onAbbrechen} className="btn btn-ghost">
        Abbrechen
      </button>
    </div>
  )
}

const REGLER: Array<{ feld: keyof SoundEntwurf; label: string }> = [
  { feld: "gainVon", label: "Gain von" },
  { feld: "gainBis", label: "Gain bis" },
  { feld: "bass", label: "Bass" },
  { feld: "mitten", label: "Mitten" },
  { feld: "hoehen", label: "Höhen" },
  { feld: "praesenz", label: "Präsenz" },
]

export function SongFormular({
  song,
  onGespeichert,
  onAbbrechen,
}: {
  song?: RepertoireSong
  onGespeichert: (id: string) => void
  onAbbrechen: () => void
}) {
  const [entwurf, setEntwurf] = useState(() => songEntwurf(song))
  const [fehler, setFehler] = useState<string[]>([])
  const setze = (feld: Exclude<keyof typeof entwurf, "sound">) => (wert: string) =>
    setEntwurf((alt) => ({ ...alt, [feld]: wert }))
  const setzeSound = (feld: keyof SoundEntwurf) => (wert: string) =>
    setEntwurf((alt) => ({ ...alt, sound: { ...alt.sound, [feld]: wert } }))
  const stimmung = stimmungAusText(entwurf.stimmung).join(" ")
  // What a chosen file offers beyond the fields: tunings and sections.
  const [gp, setGp] = useState<GpSong | null>(null)
  const [abgewaehlt, setAbgewaehlt] = useState<number[]>([])
  const stimmungen = gp ? gitarrenStimmungen(gp) : []
  const vorschlaege = gp ? abschnittVorschlaege(gp) : []

  const ausDatei = (gelesen: GpSong, dateiname: string) => {
    setEntwurf((alt) => entwurfAusGp(alt, gelesen, dateiname))
    setGp(gelesen)
    setAbgewaehlt([])
    setFehler([])
  }

  const speichern = (event: FormEvent) => {
    event.preventDefault()
    let ergebnis = songAusEntwurf(entwurf, song?.id ?? kennung(), song)
    const gewaehlt = vorschlaege.filter((v) => !abgewaehlt.includes(v.von))
    if (ergebnis.ok && gewaehlt.length > 0) ergebnis = mitVorschlaegen(ergebnis.song, gewaehlt, kennung)
    if (!ergebnis.ok) return setFehler(ergebnis.fehler)
    if (!merkeSong(ergebnis.song)) return setFehler([NICHT_GESPEICHERT])
    onGespeichert(ergebnis.song.id)
  }

  return (
    <form onSubmit={speichern} noValidate className="mt-6 space-y-4">
      <h1 className="display text-[40px] text-fg">{song ? "Song bearbeiten" : "Neuer Song"}</h1>
      {!song && <GpDatei onGelesen={ausDatei} />}
      <Feld label="Titel" wert={entwurf.titel} onChange={setze("titel")} />
      <Feld label="Band" wert={entwurf.band} onChange={setze("band")} />
      <div className="grid grid-cols-2 gap-3">
        <Feld label="Tempo (BPM)" wert={entwurf.tempo} onChange={setze("tempo")} zahl />
        <Feld label="Takte" wert={entwurf.takte} onChange={setze("takte")} zahl />
      </div>
      <Feld label="Stimmung, tief nach hoch" wert={entwurf.stimmung} onChange={setze("stimmung")}>
        <div className="mt-3 flex flex-wrap gap-2 px-[2px]">
          {STIMMUNGEN.map((s) => (
            <Wahl key={s.name} aktiv={stimmung === s.saiten} onClick={() => setze("stimmung")(s.saiten)}>
              {s.name}
            </Wahl>
          ))}
        </div>
        {stimmungen.length > 1 && (
          <div className="mt-3 grid gap-2 px-[2px]">
            <p className="text-[13px] text-dim">Die Datei hat verschiedene Gitarrenstimmungen:</p>
            {stimmungen.map((s) => (
              <Wahl key={s.saiten} aktiv={stimmung === s.saiten} onClick={() => setze("stimmung")(s.saiten)}>
                {s.spur ? `${s.spur}: ` : ""}
                {/* Note names keep their small b. */}
                <span className="normal-case">{s.saiten}</span>
              </Wahl>
            ))}
          </div>
        )}
        {gp && stimmungen.length === 0 && (
          <p className="mt-2 text-[13px] text-dim">Keine Gitarrenstimmung in der Datei gefunden.</p>
        )}
      </Feld>
      <Feld label="Taktarten" wert={entwurf.taktarten} onChange={setze("taktarten")} platzhalter="4/4, 7/8" />
      <Feld label="Dateiname der Guitar-Pro-Datei" wert={entwurf.quelle} onChange={setze("quelle")} platzhalter="song.gp5" />

      <details open={Object.values(entwurf.sound).some(Boolean) || undefined}>
        <summary className="kicker cursor-pointer py-2 text-stahl">Sound — alles freiwillig</summary>
        <div className="mt-2 space-y-4">
          <Feld label="Amp" wert={entwurf.sound.amp} onChange={setzeSound("amp")} />
          <Feld label="Kanal" wert={entwurf.sound.kanal} onChange={setzeSound("kanal")} />
          <p className="text-[13px] text-dim">Regler von 0 bis 10.</p>
          <div className="grid grid-cols-2 gap-3">
            {REGLER.map(({ feld, label }) => (
              <Feld key={feld} label={label} wert={entwurf.sound[feld]} onChange={setzeSound(feld)} zahl />
            ))}
          </div>
          <Feld label="Boost" wert={entwurf.sound.boost} onChange={setzeSound("boost")} />
        </div>
      </details>

      {vorschlaege.length > 0 && (
        <fieldset>
          <legend className="kicker text-dim">Abschnitte aus der Datei</legend>
          <p className="mt-1 text-[13px] leading-relaxed text-dim">
            Sie werden mitgespeichert. Antippen wählt ab; ändern lassen sie sich danach.
          </p>
          <div className="mt-3 grid gap-2 px-[2px]">
            {vorschlaege.map((v) => {
              const aktiv = !abgewaehlt.includes(v.von)
              return (
                <Wahl
                  key={v.von}
                  aktiv={aktiv}
                  onClick={() => setAbgewaehlt((alt) => (aktiv ? [...alt, v.von] : alt.filter((von) => von !== v.von)))}
                >
                  <span className="break-words">
                    {aktiv ? "✓ " : ""}
                    {v.name} · {takteText(v.von, v.bis)}
                  </span>
                </Wahl>
              )
            })}
          </div>
        </fieldset>
      )}

      <Meldungen fehler={fehler} />
      <Knoepfe onAbbrechen={onAbbrechen} />
    </form>
  )
}

export function AbschnittFormular({
  song,
  abschnitt,
  onGespeichert,
  onAbbrechen,
}: {
  song: RepertoireSong
  abschnitt?: Abschnitt
  onGespeichert: () => void
  onAbbrechen: () => void
}) {
  const [entwurf, setEntwurf] = useState(() => abschnittEntwurf(song, abschnitt))
  const [fehler, setFehler] = useState<string[]>([])
  const setze = (feld: Exclude<keyof typeof entwurf, "technikTags">) => (wert: string) =>
    setEntwurf((alt) => ({ ...alt, [feld]: wert }))
  const prozent = Number(entwurf.uebetempo)

  const speichern = (event: FormEvent) => {
    event.preventDefault()
    const ergebnis = abschnittAusEntwurf(song, entwurf, abschnitt?.id ?? kennung(), abschnitt)
    if (!ergebnis.ok) return setFehler(ergebnis.fehler)
    if (!merkeSong(ergebnis.song)) return setFehler([NICHT_GESPEICHERT])
    onGespeichert()
  }

  return (
    <form onSubmit={speichern} noValidate className="mt-6 space-y-4">
      <div>
        <span className="kicker">
          {song.titel} · {song.takte} Takte
        </span>
        <h1 className="display mt-1 text-[40px] text-fg">{abschnitt ? "Abschnitt ändern" : "Neuer Abschnitt"}</h1>
      </div>
      <Feld label="Name" wert={entwurf.name} onChange={setze("name")} platzhalter="z. B. Refrain" />
      <div className="grid grid-cols-2 gap-3">
        <Feld label="Von Takt" wert={entwurf.von} onChange={setze("von")} zahl />
        <Feld label="Bis Takt" wert={entwurf.bis} onChange={setze("bis")} zahl />
      </div>
      <Feld label="Spur" wert={entwurf.spur} onChange={setze("spur")}>
        <div className="mt-3 flex flex-wrap gap-2 px-[2px]">
          {SPUREN.map((spur) => (
            <Wahl key={spur} aktiv={entwurf.spur.trim() === spur} onClick={() => setze("spur")(spur)}>
              {spur}
            </Wahl>
          ))}
        </div>
      </Feld>
      <Feld label="Übetempo in Prozent" wert={entwurf.uebetempo} onChange={setze("uebetempo")} zahl>
        <p className="mt-1.5 font-mono text-[13px] text-muted">
          {prozent >= 30 && prozent <= 120
            ? `= ${uebetempoBpm(song.tempoHeader, prozent)} BPM (Datei: ${song.tempoHeader})`
            : "30 bis 120 Prozent"}
        </p>
      </Feld>
      <fieldset>
        <legend className="kicker text-dim">Technik</legend>
        <div className="mt-3 flex flex-wrap gap-3 px-[2px]">
          {technikTagSchema.options.map((tag) => {
            const aktiv = entwurf.technikTags.includes(tag)
            return (
              <Wahl
                key={tag}
                aktiv={aktiv}
                onClick={() =>
                  setEntwurf((alt) => ({
                    ...alt,
                    technikTags: aktiv ? alt.technikTags.filter((t) => t !== tag) : [...alt.technikTags, tag],
                  }))
                }
              >
                {TECHNIQUE_LABELS[tag]}
              </Wahl>
            )
          })}
        </div>
      </fieldset>

      <Meldungen fehler={fehler} />
      <Knoepfe onAbbrechen={onAbbrechen} />

      {abschnitt && (
        <div className="pt-6">
          <Loeschen
            knopf="Abschnitt löschen"
            frage={`„${abschnitt.name}“ mit seinem Lernstand löschen? Das lässt sich nicht zurückholen.`}
            onLoeschen={() => {
              const ok = merkeSong(abschnittEntfernen(song, abschnitt.id))
              if (ok) onGespeichert()
              return ok
            }}
          />
        </div>
      )}
    </form>
  )
}
