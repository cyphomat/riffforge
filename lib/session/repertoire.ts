import { z } from "zod"
import { TECHNIQUES } from "./types"

/**
 * Das Repertoire: echte Songs, die du mit deiner eigenen Guitar-Pro-Datei lernst.
 *
 * The app only keeps track of the learning state — no notes, no tabs, no files.
 * The data lives on this device (see `lib/storage/lokal.ts`) and is neither
 * synced nor part of the backup file; it travels in a file of its own
 * (`repertoire-datei.ts`). The repository is public: real song data
 * never goes into it, not even as a test fixture.
 *
 * This is not the catalogue in `songs.ts`: those are our own riffs with a
 * checked learning goal. Nothing here touches it.
 */

export const ABSCHNITT_STATUS = ["neu", "langsam", "sitzt"] as const
export type AbschnittStatus = (typeof ABSCHNITT_STATUS)[number]

/** Technique tags come from the drill catalogue. A warm-up is not something a song asks for. */
export const technikTagSchema = z.enum(TECHNIQUES).exclude(["warmup"])
export type TechnikTag = z.infer<typeof technikTagSchema>

// Every check carries a German message: the form shows them as they are.
const text = z.string().trim().min(1, "fehlt")
const datum = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "kein Datum")
const zahl = () => z.number("Zahl fehlt")
const takt = zahl().int("nur ganze Takte").min(1, "mindestens 1")
const regler = zahl().min(0, "nur 0 bis 10").max(10, "nur 0 bis 10")

export const abschnittSchema = z.object({
  id: text,
  name: text,
  von: takt,
  bis: takt,
  spur: text,
  status: z.enum(ABSCHNITT_STATUS),
  uebetempoProzent: zahl().int("nur ganze Prozent").min(30, "mindestens 30 Prozent").max(120, "höchstens 120 Prozent"),
  technikTags: z.array(technikTagSchema),
  /** When the section first reached a status. Never overwritten, never removed. */
  erstmals: z.object({ langsam: datum.optional(), sitzt: datum.optional() }),
  /** When the section was last practised in a session. */
  zuletzt: datum.optional(),
  /** When it was last practised while already in place: the last repetition. */
  wiederholt: datum.optional(),
  /** When status or practice tempo last changed. Decides which file wins on import. */
  standAm: datum.optional(),
  /** When name, bars, track or tags were last edited. */
  geaendert: datum.optional(),
})
export type Abschnitt = z.infer<typeof abschnittSchema>

/** Everything optional: a song without a dialled-in sound is normal. */
export const soundSchema = z.object({
  amp: text.optional(),
  kanal: text.optional(),
  gain: z
    .object({ von: regler, bis: regler })
    .refine((g) => g.von <= g.bis, "Gain: von liegt über bis")
    .optional(),
  eq: z.object({ bass: regler.optional(), mitten: regler.optional(), hoehen: regler.optional(), praesenz: regler.optional() }).optional(),
  boost: text.optional(),
})
export type Sound = z.infer<typeof soundSchema>

type Lage = { spur: string; von: number; bis: number }

/** Rhythm and lead may cover the same bars; one track may not cover a bar twice. */
export function ueberlappt(a: Lage, b: Lage): boolean {
  return a.spur.toLowerCase() === b.spur.toLowerCase() && a.von <= b.bis && b.von <= a.bis
}

export const repertoireSongSchema = z
  .object({
    id: text,
    titel: text,
    band: text,
    /** The tempo in the file's header, in BPM. */
    tempoHeader: zahl().int("nur ganze BPM").min(20, "mindestens 20 BPM").max(400, "höchstens 400 BPM"),
    /** Open strings, low to high, e.g. `["D", "A", "D", "G", "B", "E"]`. */
    stimmung: z
      .array(z.string().regex(/^[A-H](#|b)?[0-8]?$/, { error: (issue) => `„${String(issue.input)}“ ist kein Ton` }))
      .min(6, "6 bis 8 Saiten angeben")
      .max(8, "6 bis 8 Saiten angeben"),
    takte: takt,
    /** The time signatures that occur in the song. */
    taktarten: z
      .array(z.string().regex(/^[1-9]\d?\/(1|2|4|8|16)$/, { error: (issue) => `„${String(issue.input)}“ ist keine Taktart` }))
      .min(1, "mindestens eine, zum Beispiel 4/4"),
    /** Only the file name, as a reminder. A path would leak the home directory into the data. */
    quelle: text.regex(/^[^/\\]*$/, "nur der Dateiname, kein Pfad"),
    abschnitte: z.array(abschnittSchema),
    sound: soundSchema.optional(),
    /** When the song's own data or sound was last edited. */
    geaendert: datum.optional(),
  })
  .superRefine((song, ctx) => {
    const melden = (index: number, message: string) => ctx.addIssue({ code: "custom", path: ["abschnitte", index], message })
    song.abschnitte.forEach((a, i) => {
      if (a.von > a.bis) melden(i, `${a.name}: von liegt hinter bis`)
      if (a.bis > song.takte) melden(i, `${a.name}: der Song hat nur ${song.takte} Takte`)
      const davor = song.abschnitte.slice(0, i)
      if (davor.some((b) => b.id === a.id)) melden(i, `${a.name}: Kennung doppelt`)
      const doppelt = davor.find((b) => ueberlappt(a, b))
      if (doppelt) melden(i, `${a.name} überlappt ${doppelt.name}`)
    })
  })
export type RepertoireSong = z.infer<typeof repertoireSongSchema>

export const repertoireSchema = z.object({
  songs: z.array(repertoireSongSchema).refine((songs) => new Set(songs.map((s) => s.id)).size === songs.length, "Kennung doppelt"),
})
export type Repertoire = z.infer<typeof repertoireSchema>

export const LEERES_REPERTOIRE: Repertoire = { songs: [] }

/** How many sections are in place. */
export function fortschritt(song: Pick<RepertoireSong, "abschnitte">): { sitzt: number; gesamt: number; anteil: number } {
  const gesamt = song.abschnitte.length
  const sitzt = song.abschnitte.filter((a) => a.status === "sitzt").length
  return { sitzt, gesamt, anteil: gesamt === 0 ? 0 : sitzt / gesamt }
}

/** The practice tempo in BPM, rounded to a number a metronome can be set to. */
export function uebetempoBpm(tempoHeader: number, prozent: number): number {
  return Math.round((tempoHeader * prozent) / 100)
}

/**
 * Reads a stored string. `kaputt` says that there was something which could not
 * be read — the caller has to set it aside before writing over it.
 */
export function repertoireAusText(roh: string | null): { repertoire: Repertoire; kaputt: boolean } {
  if (roh === null) return { repertoire: LEERES_REPERTOIRE, kaputt: false }
  try {
    const geprueft = repertoireSchema.safeParse(JSON.parse(roh))
    if (geprueft.success) return { repertoire: geprueft.data, kaputt: false }
  } catch {
    /* Not even JSON. */
  }
  return { repertoire: LEERES_REPERTOIRE, kaputt: true }
}

/** Stamps the date for the current status, unless that status already has one. */
function datiert(a: Abschnitt, jetzt: Date): Abschnitt {
  if (a.status === "neu" || a.erstmals[a.status]) return a
  return { ...a, erstmals: { ...a.erstmals, [a.status]: jetzt.toISOString() } }
}

const gleich = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)

/** What the song says about itself, without its sections and dates. */
export function songDaten(s: RepertoireSong) {
  return [s.titel, s.band, s.tempoHeader, s.stimmung, s.takte, s.taktarten, s.quelle, s.sound ?? null]
}

/** What a section is, as opposed to how far it has been learned. */
export function abschnittDaten(a: Abschnitt) {
  return [a.name, a.von, a.bis, a.spur, a.technikTags]
}

/**
 * Adds a song or replaces the one with the same id. An invalid song changes
 * nothing (ask `repertoireSongSchema` for the reasons). Dates a section already
 * has survive the replacement, even if the incoming song does not carry them.
 * Edits of existing data are stamped; a newly added song or section is not, so
 * an untouched section never counts as newer than a practised one.
 */
export function songSpeichern(repertoire: Repertoire, song: RepertoireSong, jetzt: Date = new Date()): Repertoire {
  const geprueft = repertoireSongSchema.safeParse(song)
  if (!geprueft.success) return repertoire
  const alt = repertoire.songs.find((s) => s.id === geprueft.data.id)
  const am = jetzt.toISOString()
  const songGeaendert = alt && !gleich(songDaten(alt), songDaten(geprueft.data)) ? am : alt?.geaendert
  const neu: RepertoireSong = {
    ...geprueft.data,
    ...(songGeaendert ? { geaendert: songGeaendert } : {}),
    abschnitte: geprueft.data.abschnitte.map((a) => {
      const bisher = alt?.abschnitte.find((b) => b.id === a.id)
      const standNeu = bisher && (bisher.status !== a.status || bisher.uebetempoProzent !== a.uebetempoProzent)
      const standAm = standNeu ? am : bisher?.standAm
      const geaendert = bisher && !gleich(abschnittDaten(bisher), abschnittDaten(a)) ? am : bisher?.geaendert
      const gemerkt = {
        ...a,
        erstmals: { ...a.erstmals, ...bisher?.erstmals },
        ...(bisher?.zuletzt ? { zuletzt: bisher.zuletzt } : {}),
        ...(bisher?.wiederholt ? { wiederholt: bisher.wiederholt } : {}),
        ...(standAm ? { standAm } : {}),
        ...(geaendert ? { geaendert } : {}),
      }
      return datiert(gemerkt, jetzt)
    }),
  }
  return { songs: alt ? repertoire.songs.map((s) => (s.id === neu.id ? neu : s)) : [...repertoire.songs, neu] }
}

export function songEntfernen(repertoire: Repertoire, songId: string): Repertoire {
  if (!repertoire.songs.some((s) => s.id === songId)) return repertoire
  return { songs: repertoire.songs.filter((s) => s.id !== songId) }
}

/** Sets a section's status. Going back keeps every date. Unknown ids change nothing. */
export function statusSetzen(
  repertoire: Repertoire,
  songId: string,
  abschnittId: string,
  status: AbschnittStatus,
  jetzt: Date = new Date(),
): Repertoire {
  const abschnitt = repertoire.songs.find((s) => s.id === songId)?.abschnitte.find((a) => a.id === abschnittId)
  if (!abschnitt || abschnitt.status === status) return repertoire
  const neu = datiert({ ...abschnitt, status, standAm: jetzt.toISOString() }, jetzt)
  return {
    songs: repertoire.songs.map((s) =>
      s.id === songId ? { ...s, abschnitte: s.abschnitte.map((a) => (a.id === abschnittId ? neu : a)) } : s,
    ),
  }
}

/**
 * A section was played in a session: sets the status the player tapped and
 * remembers the date. Playing a section that was already in place counts as its
 * repetition. Unknown ids change nothing.
 */
export function abschnittGeuebt(
  repertoire: Repertoire,
  songId: string,
  abschnittId: string,
  status: AbschnittStatus,
  jetzt: Date = new Date(),
): Repertoire {
  const abschnitt = repertoire.songs.find((s) => s.id === songId)?.abschnitte.find((a) => a.id === abschnittId)
  if (!abschnitt) return repertoire
  const am = jetzt.toISOString()
  const neu = datiert(
    { ...abschnitt, status, zuletzt: am, standAm: am, ...(abschnitt.status === "sitzt" ? { wiederholt: am } : {}) },
    jetzt,
  )
  return {
    songs: repertoire.songs.map((s) =>
      s.id === songId ? { ...s, abschnitte: s.abschnitte.map((a) => (a.id === abschnittId ? neu : a)) } : s,
    ),
  }
}
