import { dayKey } from "./progress"
import {
  abschnittDaten,
  repertoireSchema,
  repertoireSongSchema,
  songDaten,
  ueberlappt,
  type Abschnitt,
  type Repertoire,
  type RepertoireSong,
  type Sound,
} from "./repertoire"
import { TECHNIQUE_LABELS } from "./types"

/**
 * The repertoire as a file of its own: the way to keep it safe and to carry it
 * from one device to another.
 *
 * Importing only ever adds. Nothing that is here disappears, and an older state
 * of practice never replaces a newer one. The file holds real song data: it
 * stays with the player and never goes into a repository.
 */

export const DATEI_VERSION = 1
/** Far above any real repertoire; anything larger is something else. */
export const MAX_DATEI_BYTES = 5_000_000

/** Carries the date only, no song or band. */
export function dateiName(jetzt: Date = new Date()): string {
  return `riffforge-repertoire-${dayKey(jetzt)}.json`
}

export function dateiInhalt(repertoire: Repertoire, jetzt: Date = new Date()): string {
  const datei = { app: "riffforge", art: "repertoire", version: DATEI_VERSION, exportiert: jetzt.toISOString(), songs: repertoire.songs }
  return JSON.stringify(datei, null, 2)
}

export type Gelesen = { ok: true; repertoire: Repertoire; exportiert: string } | { ok: false; grund: string }

const nein = (grund: string): Gelesen => ({ ok: false, grund })

/** Reads an exported file as a whole: either all of it is sound or none of it counts. */
export function dateiLesen(roh: string): Gelesen {
  let inhalt: unknown
  try {
    inhalt = JSON.parse(roh)
  } catch {
    return nein("Die Datei lässt sich nicht lesen. Sie ist beschädigt, abgeschnitten oder keine Repertoire-Datei.")
  }
  const datei = (typeof inhalt === "object" && inhalt !== null ? inhalt : {}) as Record<string, unknown>
  if (datei.app !== "riffforge" || datei.art !== "repertoire") {
    return nein(
      Array.isArray(datei.results)
        ? "Das ist eine Sicherung des Übungs-Logs. Die liest du unter „Daten“ ein."
        : "Das ist keine Repertoire-Datei von Riffforge.",
    )
  }
  if (typeof datei.version === "number" && datei.version > DATEI_VERSION) {
    return nein("Die Datei stammt aus einer neueren Version von Riffforge. Aktualisiere die App und versuche es noch einmal.")
  }
  const { exportiert } = datei
  if (datei.version !== DATEI_VERSION || typeof exportiert !== "string" || Number.isNaN(Date.parse(exportiert))) {
    return nein("Die Datei ist beschädigt: Version oder Datum fehlen.")
  }
  const geprueft = repertoireSchema.safeParse({ songs: datei.songs })
  if (!geprueft.success) {
    const issue = geprueft.error.issues[0]
    const nummer = issue.path[1]
    if (typeof nummer !== "number") return nein("Die Datei ist beschädigt: Die Songliste ist nicht lesbar.")
    const genauer = issue.code === "custom" ? ` (${issue.message})` : ""
    return nein(`Die Datei ist beschädigt: Song ${nummer + 1} ist unvollständig oder falsch${genauer}.`)
  }
  return { ok: true, repertoire: geprueft.data, exportiert }
}

/** What an import would do to one song. */
export interface SongBericht {
  id: string
  titel: string
  band: string
  neu: boolean
  /** What would be added or changed here. */
  aenderungen: string[]
  /** Where the file says something else and it is not taken over. */
  hinweise: string[]
}

export interface Zusammenfuehrung {
  /** The same object as before when the file changes nothing. */
  repertoire: Repertoire
  /** Only songs there is something to say about. */
  songs: SongBericht[]
  aendert: boolean
}

const zeit = (iso: string | undefined) => (iso ? Date.parse(iso) : 0)
const spaetestes = (...daten: (string | undefined)[]) =>
  daten.reduce<string | undefined>((a, b) => (zeit(b) > zeit(a) ? b : a), undefined)
const fruehestes = (a: string | undefined, b: string | undefined) => (!a || (b && zeit(b) < zeit(a)) ? b : a)
const gleich = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b)
const norm = (text: string) => text.trim().toLowerCase()
const vereint = <T>(a: T[], b: T[]) => [...new Set([...a, ...b])]

/**
 * When the learning state of a section was last touched. Data from before
 * `standAm` existed only has the practice and first-reached dates.
 */
export function standZeit(a: Abschnitt): string | undefined {
  return spaetestes(a.standAm, a.zuletzt, a.erstmals.langsam, a.erstmals.sitzt)
}

/**
 * One section from here and one from the file. Learning state (status and
 * practice tempo) and description (name, bars, track) are decided separately:
 * each goes to the side that touched it last, and to this device on a tie.
 */
function abschnittVerschmelzen(hier: Abschnitt, datei: Abschnitt): Abschnitt {
  const [vorn, hinten] = zeit(datei.geaendert) > zeit(hier.geaendert) ? [datei, hier] : [hier, datei]
  const stand = zeit(standZeit(datei)) > zeit(standZeit(hier)) ? datei : hier
  const gleicherStand = hier.status === datei.status && hier.uebetempoProzent === datei.uebetempoProzent
  const neu: Abschnitt = {
    id: hier.id,
    name: vorn.name,
    von: vorn.von,
    bis: vorn.bis,
    spur: vorn.spur,
    technikTags: vereint(vorn.technikTags, hinten.technikTags),
    status: stand.status,
    uebetempoProzent: stand.uebetempoProzent,
    erstmals: {
      langsam: fruehestes(hier.erstmals.langsam, datei.erstmals.langsam),
      sitzt: fruehestes(hier.erstmals.sitzt, datei.erstmals.sitzt),
    },
    zuletzt: spaetestes(hier.zuletzt, datei.zuletzt),
    wiederholt: spaetestes(hier.wiederholt, datei.wiederholt),
    standAm: gleicherStand ? spaetestes(hier.standAm, datei.standAm) : stand.standAm,
    geaendert: gleich(abschnittDaten(hier), abschnittDaten(datei)) ? spaetestes(hier.geaendert, datei.geaendert) : vorn.geaendert,
  }
  // Taking the earlier first-reached date must not make the winning state look older.
  const soll = gleicherStand ? spaetestes(standZeit(hier), standZeit(datei)) : standZeit(stand)
  return zeit(standZeit(neu)) < zeit(soll) ? { ...neu, standAm: soll } : neu
}

/**
 * Which section in the file is which one here: by id, otherwise by name and
 * track — same bars first, then overlapping ones, then the only one of its name.
 */
function zuordnen(hier: Abschnitt[], datei: Abschnitt[]): Map<Abschnitt, Abschnitt> {
  const paare = new Map<Abschnitt, Abschnitt>()
  const vergeben = new Set<Abschnitt>()
  const name = (a: Abschnitt) => `${norm(a.name)}|${norm(a.spur)}`
  const einzig = (liste: Abschnitt[], a: Abschnitt) => liste.filter((b) => name(b) === name(a)).length === 1
  const regeln: ((h: Abschnitt, d: Abschnitt) => boolean)[] = [
    (h, d) => h.id === d.id,
    (h, d) => name(h) === name(d) && h.von === d.von && h.bis === d.bis,
    (h, d) => name(h) === name(d) && ueberlappt(h, d),
    (h, d) => name(h) === name(d) && einzig(hier, h) && einzig(datei, d),
  ]
  for (const passt of regeln) {
    for (const d of datei) {
      if (paare.has(d)) continue
      const h = hier.find((kandidat) => !vergeben.has(kandidat) && passt(kandidat, d))
      if (!h) continue
      paare.set(d, h)
      vergeben.add(h)
    }
  }
  return paare
}

/** The sound of both, field by field; `vorn` wins where both say something. */
function soundVerschmelzen(vorn: Sound | undefined, hinten: Sound | undefined): Sound | undefined {
  if (!vorn || !hinten) return vorn ?? hinten
  const eq = vorn.eq || hinten.eq ? { eq: { ...hinten.eq, ...vorn.eq } } : {}
  return { ...hinten, ...vorn, ...eq }
}

type Feld = [name: string, wert: string]

const zahl = (wert: number) => String(wert).replace(".", ",")

function soundText(sound: Sound | undefined): string {
  if (!sound) return "keiner"
  const { amp, kanal, gain, eq, boost } = sound
  const regler = (name: string, wert: number | undefined) => wert !== undefined && `${name} ${zahl(wert)}`
  return [
    amp,
    kanal,
    gain && `Gain ${zahl(gain.von)}–${zahl(gain.bis)}`,
    regler("Bass", eq?.bass),
    regler("Mitten", eq?.mitten),
    regler("Höhen", eq?.hoehen),
    regler("Präsenz", eq?.praesenz),
    boost,
  ]
    .filter(Boolean)
    .join(", ")
}

const takteText = (von: number, bis: number) => (von === bis ? `Takt ${von}` : `Takt ${von}–${bis}`)

const songFelder = (s: RepertoireSong): Feld[] => [
  ["Titel", s.titel],
  ["Band", s.band],
  ["Tempo", `${s.tempoHeader} BPM`],
  ["Stimmung", s.stimmung.join(" ")],
  ["Takte", String(s.takte)],
  ["Taktarten", s.taktarten.join(", ")],
  ["Dateiname", s.quelle],
]

const abschnittFelder = (a: Abschnitt): Feld[] => [
  ["Name", a.name],
  ["Bereich", takteText(a.von, a.bis)],
  ["Spur", a.spur],
  ["Status", a.status],
  ["Übetempo", `${a.uebetempoProzent} %`],
  ["Technik", a.technikTags.map((t) => TECHNIQUE_LABELS[t]).join(", ") || "keine"],
]

/** The fields that differ, as `[name, here, there]`. */
function unterschiede(hier: Feld[], dort: Feld[]): [string, string, string][] {
  return hier.flatMap(([name, wert], i) => (wert === dort[i][1] ? [] : [[name, wert, dort[i][1]]]))
}

const wechsel = ([name, alt, neu]: [string, string, string]) => `${name} ${alt} → ${neu}`
const bleibt = ([name, hier, datei]: [string, string, string]) => `Hier bleibt ${name} ${hier} (Datei: ${datei})`

function songVerschmelzen(hier: RepertoireSong, datei: RepertoireSong): { song: RepertoireSong; bericht: SongBericht } {
  const aenderungen: string[] = []
  const hinweise: string[] = []
  const paare = zuordnen(hier.abschnitte, datei.abschnitte)

  const abschnitte = hier.abschnitte.map((h) => {
    const d = datei.abschnitte.find((kandidat) => paare.get(kandidat) === h)
    return d ? abschnittVerschmelzen(h, d) : h
  })
  // Moved bars may not collide. What is here never overlaps, so putting moved
  // sections back always ends in a valid list.
  const verschoben = (i: number) => {
    const [a, h] = [abschnitte[i], hier.abschnitte[i]]
    return a.von !== h.von || a.bis !== h.bis || a.spur !== h.spur
  }
  const kollidiert = (i: number) => abschnitte.some((b, j) => j !== i && ueberlappt(abschnitte[i], b))
  for (let i = abschnitte.findIndex((_, k) => verschoben(k) && kollidiert(k)); i >= 0; ) {
    const { von, bis, spur, geaendert } = hier.abschnitte[i]
    abschnitte[i] = { ...abschnitte[i], von, bis, spur, geaendert }
    i = abschnitte.findIndex((_, k) => verschoben(k) && kollidiert(k))
  }

  hier.abschnitte.forEach((h, i) => {
    const d = datei.abschnitte.find((kandidat) => paare.get(kandidat) === h)
    if (!d) return
    const neu = abschnitte[i]
    const zeilen = unterschiede(abschnittFelder(h), abschnittFelder(neu)).map(wechsel)
    if (neu.zuletzt && neu.zuletzt !== h.zuletzt) zeilen.push(`zuletzt geübt am ${new Date(neu.zuletzt).toLocaleDateString("de-DE")}`)
    if (zeilen.length === 0 && !gleich(repertoireAbschnitt(h), repertoireAbschnitt(neu))) zeilen.push("Übungsdaten ergänzt")
    aenderungen.push(...zeilen.map((zeile) => `${h.name}: ${zeile}`))
    hinweise.push(
      ...unterschiede(abschnittFelder(neu), abschnittFelder(d))
        // Tags are united, so nothing from the file is left out there.
        .filter(([name]) => name !== "Technik")
        .map((u) => `${neu.name}: ${bleibt(u)}`),
    )
  })

  for (const d of datei.abschnitte) {
    if (paare.has(d)) continue
    const im = abschnitte.find((a) => ueberlappt(a, d))
    const lage = `${takteText(d.von, d.bis)}, ${d.spur}`
    if (im) {
      hinweise.push(`Übersprungen: ${d.name} (${lage}) überlappt ${im.name}`)
    } else {
      abschnitte.push(d)
      aenderungen.push(`Neuer Abschnitt: ${d.name} (${lage}, ${d.status})`)
    }
  }

  const [vorn, hinten] = zeit(datei.geaendert) > zeit(hier.geaendert) ? [datei, hier] : [hier, datei]
  const sound = soundVerschmelzen(vorn.sound, hinten.sound)
  const kandidat: RepertoireSong = {
    ...vorn,
    id: hier.id,
    takte: Math.max(vorn.takte, ...abschnitte.map((a) => a.bis)),
    abschnitte,
    sound,
    geaendert: gleich(songDaten(hier), songDaten(datei)) ? spaetestes(hier.geaendert, datei.geaendert) : vorn.geaendert,
  }
  const geprueft = repertoireSongSchema.safeParse(kandidat)
  const bericht = { id: hier.id, titel: hier.titel, band: hier.band, neu: false }
  if (!geprueft.success) {
    return { song: hier, bericht: { ...bericht, aenderungen: [], hinweise: ["Passt nicht zusammen, hier bleibt alles, wie es ist."] } }
  }
  const song = geprueft.data

  const songZeilen = unterschiede(songFelder(hier), songFelder(song)).map(wechsel)
  if (!gleich(hier.sound, song.sound)) songZeilen.push(`Sound ${soundText(hier.sound)} → ${soundText(song.sound)}`)
  aenderungen.unshift(...songZeilen)
  const songHinweise = unterschiede(songFelder(song), songFelder(datei)).map(bleibt)
  // Only where the file's sound says something that is not taken over.
  if (datei.sound && !gleich(soundText(soundVerschmelzen(datei.sound, song.sound)), soundText(song.sound))) {
    songHinweise.push(bleibt(["Sound", soundText(song.sound), soundText(datei.sound)]))
  }
  hinweise.unshift(...songHinweise)

  const unveraendert = gleich(repertoireSongSchema.parse(hier), song)
  if (!unveraendert && aenderungen.length === 0) aenderungen.push("Änderungsdaten ergänzt")
  return {
    song: unveraendert ? hier : song,
    bericht: { ...bericht, titel: song.titel, band: song.band, aenderungen, hinweise },
  }
}

/** A section in the schema's field order, so two of them can be compared as text. */
function repertoireAbschnitt(a: Abschnitt) {
  return [...abschnittDaten(a), a.status, a.uebetempoProzent, a.erstmals.langsam, a.erstmals.sitzt, a.zuletzt, a.wiederholt, a.standAm, a.geaendert]
}

/**
 * Lays the file over what is here. Songs are matched by id, otherwise by title
 * and band; what has no match is new. Nothing is removed.
 */
export function zusammenfuehren(hier: Repertoire, datei: Repertoire): Zusammenfuehrung {
  const paare = new Map<RepertoireSong, RepertoireSong>()
  const vergeben = new Set<RepertoireSong>()
  const regeln: ((h: RepertoireSong, d: RepertoireSong) => boolean)[] = [
    (h, d) => h.id === d.id,
    (h, d) => norm(h.titel) === norm(d.titel) && norm(h.band) === norm(d.band),
  ]
  for (const passt of regeln) {
    for (const d of datei.songs) {
      if (paare.has(d)) continue
      const h = hier.songs.find((kandidat) => !vergeben.has(kandidat) && passt(kandidat, d))
      if (!h) continue
      paare.set(d, h)
      vergeben.add(h)
    }
  }

  const ersetzt = new Map<RepertoireSong, RepertoireSong>()
  const neue: RepertoireSong[] = []
  const berichte: SongBericht[] = []
  for (const d of datei.songs) {
    const h = paare.get(d)
    if (!h) {
      neue.push(d)
      const anzahl = `${d.abschnitte.length} ${d.abschnitte.length === 1 ? "Abschnitt" : "Abschnitte"}`
      berichte.push({ id: d.id, titel: d.titel, band: d.band, neu: true, aenderungen: [anzahl], hinweise: [] })
      continue
    }
    const { song, bericht } = songVerschmelzen(h, d)
    if (song !== h) ersetzt.set(h, song)
    if (bericht.aenderungen.length > 0 || bericht.hinweise.length > 0) berichte.push(bericht)
  }

  const aendert = neue.length > 0 || ersetzt.size > 0
  return {
    repertoire: aendert ? { songs: [...hier.songs.map((s) => ersetzt.get(s) ?? s), ...neue] } : hier,
    songs: berichte,
    aendert,
  }
}
