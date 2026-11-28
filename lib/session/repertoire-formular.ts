import {
  repertoireSongSchema,
  type Abschnitt,
  type RepertoireSong,
  type Sound,
  type TechnikTag,
} from "./repertoire"
import type { GpSong } from "./repertoire-gp"

/**
 * Between the forms and the schema: a draft holds what was typed, as text.
 * Turning it into a song either works or says in German what is wrong. All rules
 * stay in `repertoire.ts`; this file only reads text and names the field.
 */

export const STIMMUNGEN = [
  { name: "E-Standard", saiten: "E A D G B E" },
  { name: "Drop D", saiten: "D A D G B E" },
] as const

export const SPUREN = ["Rhythmus", "Lead"] as const
/** The practice tempo, in percent, a new section starts with. */
export const UEBETEMPO_NEU = 70

export interface SoundEntwurf {
  amp: string
  kanal: string
  gainVon: string
  gainBis: string
  bass: string
  mitten: string
  hoehen: string
  praesenz: string
  boost: string
}

export interface SongEntwurf {
  titel: string
  band: string
  tempo: string
  stimmung: string
  takte: string
  taktarten: string
  quelle: string
  sound: SoundEntwurf
}

export interface AbschnittEntwurf {
  name: string
  von: string
  bis: string
  spur: string
  uebetempo: string
  technikTags: TechnikTag[]
}

export type Ergebnis = { ok: true; song: RepertoireSong } | { ok: false; fehler: string[] }

const alsText = (wert: number | undefined) => (wert === undefined ? "" : String(wert).replace(".", ","))

/** An empty field is "no number", not zero. A decimal comma counts. */
function alsZahl(eingabe: string): number {
  const text = eingabe.trim().replace(",", ".")
  return text === "" ? Number.NaN : Number(text)
}

const wahlweise = (eingabe: string) => (eingabe.trim() === "" ? undefined : eingabe.trim())

/** "e a d g b e", "E,A,D,G,B,E" — notes separated by space, comma or dash. */
export function stimmungAusText(eingabe: string): string[] {
  return eingabe
    .split(/[\s,;–-]+/)
    .filter(Boolean)
    .map((ton) => ton[0].toUpperCase() + ton.slice(1).toLowerCase())
}

export function taktartenAusText(eingabe: string): string[] {
  return [...new Set(eingabe.split(/[\s,;]+/).filter(Boolean))]
}

export function songEntwurf(song?: RepertoireSong): SongEntwurf {
  const sound = song?.sound
  return {
    titel: song?.titel ?? "",
    band: song?.band ?? "",
    tempo: alsText(song?.tempoHeader),
    stimmung: song?.stimmung.join(" ") ?? STIMMUNGEN[0].saiten,
    takte: alsText(song?.takte),
    taktarten: song?.taktarten.join(", ") ?? "4/4",
    quelle: song?.quelle ?? "",
    sound: {
      amp: sound?.amp ?? "",
      kanal: sound?.kanal ?? "",
      gainVon: alsText(sound?.gain?.von),
      gainBis: alsText(sound?.gain?.bis),
      bass: alsText(sound?.eq?.bass),
      mitten: alsText(sound?.eq?.mitten),
      hoehen: alsText(sound?.eq?.hoehen),
      praesenz: alsText(sound?.eq?.praesenz),
      boost: sound?.boost ?? "",
    },
  }
}

/** Only what was filled in; `undefined` when nothing was. */
function soundAusEntwurf(e: SoundEntwurf): Sound | undefined {
  const regler = (eingabe: string) => (eingabe.trim() === "" ? undefined : alsZahl(eingabe))
  const sound: Sound = {}
  if (wahlweise(e.amp)) sound.amp = wahlweise(e.amp)
  if (wahlweise(e.kanal)) sound.kanal = wahlweise(e.kanal)
  // One gain value alone means exactly that setting.
  const von = regler(e.gainVon) ?? regler(e.gainBis)
  const bis = regler(e.gainBis) ?? von
  if (von !== undefined && bis !== undefined) sound.gain = { von, bis }
  const eq = Object.fromEntries(
    (["bass", "mitten", "hoehen", "praesenz"] as const).flatMap((band) => {
      const wert = regler(e[band])
      return wert === undefined ? [] : [[band, wert]]
    }),
  )
  if (Object.keys(eq).length > 0) sound.eq = eq
  if (wahlweise(e.boost)) sound.boost = wahlweise(e.boost)
  return Object.keys(sound).length > 0 ? sound : undefined
}

const FELDNAMEN: Record<string, string> = {
  titel: "Titel",
  band: "Band",
  tempoHeader: "Tempo",
  stimmung: "Stimmung",
  takte: "Takte",
  taktarten: "Taktarten",
  quelle: "Dateiname",
  name: "Name",
  von: "Von Takt",
  bis: "Bis Takt",
  spur: "Spur",
  uebetempoProzent: "Übetempo",
  amp: "Amp",
  kanal: "Kanal",
  boost: "Boost",
  "gain.von": "Gain von",
  "gain.bis": "Gain bis",
  bass: "Bass",
  mitten: "Mitten",
  hoehen: "Höhen",
  praesenz: "Präsenz",
}

function pruefen(kandidat: unknown): Ergebnis {
  const geprueft = repertoireSongSchema.safeParse(kandidat)
  if (geprueft.success) return { ok: true, song: geprueft.data }
  const fehler = geprueft.error.issues.map((issue) => {
    // Rules across fields name their subject themselves.
    if (issue.code === "custom") return issue.message
    const pfad = issue.path.filter((teil) => typeof teil === "string")
    const letzte = pfad.slice(-2).join(".")
    const feld = FELDNAMEN[letzte] ?? FELDNAMEN[pfad[pfad.length - 1] ?? ""]
    return feld ? `${feld}: ${issue.message}` : issue.message
  })
  return { ok: false, fehler: [...new Set(fehler)] }
}

/** A new song (without `alt`) or the edited one; sections stay as they are. */
export function songAusEntwurf(entwurf: SongEntwurf, id: string, alt?: RepertoireSong): Ergebnis {
  const sound = soundAusEntwurf(entwurf.sound)
  return pruefen({
    id: alt?.id ?? id,
    titel: entwurf.titel,
    band: entwurf.band,
    tempoHeader: alsZahl(entwurf.tempo),
    stimmung: stimmungAusText(entwurf.stimmung),
    takte: alsZahl(entwurf.takte),
    taktarten: taktartenAusText(entwurf.taktarten),
    quelle: entwurf.quelle,
    abschnitte: alt?.abschnitte ?? [],
    ...(sound ? { sound } : {}),
  })
}

/**
 * An existing section, or a new one that starts where the last one on the first
 * track ends — usually the next thing to enter.
 */
export function abschnittEntwurf(song: RepertoireSong, abschnitt?: Abschnitt): AbschnittEntwurf {
  if (abschnitt) {
    return {
      name: abschnitt.name,
      von: String(abschnitt.von),
      bis: String(abschnitt.bis),
      spur: abschnitt.spur,
      uebetempo: String(abschnitt.uebetempoProzent),
      technikTags: abschnitt.technikTags,
    }
  }
  const letzter = song.abschnitte.at(-1)
  const spur = letzter?.spur ?? SPUREN[0]
  const belegtBis = Math.max(0, ...song.abschnitte.filter((a) => a.spur === spur).map((a) => a.bis))
  return {
    name: "",
    von: belegtBis < song.takte ? String(belegtBis + 1) : "",
    bis: "",
    spur,
    uebetempo: String(UEBETEMPO_NEU),
    technikTags: [],
  }
}

/** Puts the section into the song: in place of `alt`, otherwise at the end. */
export function abschnittAusEntwurf(
  song: RepertoireSong,
  entwurf: AbschnittEntwurf,
  id: string,
  alt?: Abschnitt,
): Ergebnis {
  const abschnitt = {
    id: alt?.id ?? id,
    status: alt?.status ?? "neu",
    erstmals: alt?.erstmals ?? {},
    name: entwurf.name,
    von: alsZahl(entwurf.von),
    bis: alsZahl(entwurf.bis),
    spur: entwurf.spur,
    uebetempoProzent: alsZahl(entwurf.uebetempo),
    technikTags: entwurf.technikTags,
  }
  return pruefen({
    ...song,
    abschnitte: alt ? song.abschnitte.map((a) => (a.id === alt.id ? abschnitt : a)) : [...song.abschnitte, abschnitt],
  })
}

export function abschnittEntfernen(song: RepertoireSong, abschnittId: string): RepertoireSong {
  return { ...song, abschnitte: song.abschnitte.filter((a) => a.id !== abschnittId) }
}

/**
 * The different tunings of the guitar tracks, each with the first track that
 * has it. Drums and basses (fewer than six strings) do not count.
 */
export function gitarrenStimmungen(gp: GpSong): { spur: string; saiten: string }[] {
  const gefunden = new Map<string, string>()
  for (const spur of gp.spuren) {
    const saiten = spur.saiten.join(" ")
    if (!spur.schlagzeug && spur.saiten.length >= 6 && !gefunden.has(saiten)) gefunden.set(saiten, spur.name)
  }
  return [...gefunden].map(([saiten, spur]) => ({ spur, saiten }))
}

/**
 * The song form as the file fills it. What the file does not say stays empty;
 * only the sound, which no file is asked for, is kept.
 */
export function entwurfAusGp(alt: SongEntwurf, gp: GpSong, dateiname: string): SongEntwurf {
  return {
    ...alt,
    titel: gp.titel,
    band: gp.band,
    tempo: String(gp.tempo),
    stimmung: gitarrenStimmungen(gp)[0]?.saiten ?? "",
    takte: String(gp.takte),
    taktarten: gp.taktarten.join(", "),
    quelle: dateiname,
  }
}

export interface AbschnittVorschlag {
  name: string
  von: number
  bis: number
}

/** Each marker starts a part that lasts to the next one, the last to the end. */
export function abschnittVorschlaege(gp: GpSong): AbschnittVorschlag[] {
  return gp.marken.map((marke, i) => ({
    name: marke.name || `Abschnitt ${i + 1}`,
    von: marke.takt,
    bis: (gp.marken[i + 1]?.takt ?? gp.takte + 1) - 1,
  }))
}

/** Adds the accepted proposals to a song, as new sections on the first track. */
export function mitVorschlaegen(song: RepertoireSong, vorschlaege: AbschnittVorschlag[], kennung: () => string): Ergebnis {
  const neue = vorschlaege.map((vorschlag) => ({
    ...vorschlag,
    id: kennung(),
    spur: SPUREN[0],
    status: "neu" as const,
    uebetempoProzent: UEBETEMPO_NEU,
    technikTags: [],
    erstmals: {},
  }))
  return pruefen({ ...song, abschnitte: [...song.abschnitte, ...neue] })
}
