import { ALLE_DRILLS_BY_ID } from "./drills"
import { SIEBEN_DRILLS_BY_ID } from "./drills-sieben"
import { hash } from "./gurt"
import { dayKey, SAUBER_AB, weekKey } from "./progress"
import { kalenderwoche } from "./rueckblick"
import { TECHNIQUES, type DrillResult, type PracticeLog, type Technique } from "./types"
import { GEGNER_HP, gegnerName, wochenTreffer } from "./wochengegner"
import type { TheoryLog } from "@/lib/theory/types"
import { SONGS } from "@/lib/theory/songs"

/**
 * Das Jahresalbum, aus Roadie: jede Woche mit Gitarre ist ein Track.
 *
 * Wie die Kutte wird nichts gespeichert — das Album fällt aus Log und
 * Wissens-Log. Roadie presst am Jahresende ein festes Dokument; hier braucht
 * es das nicht, weil beide Logs nur wachsen. Eine Woche ohne Übung ist kein
 * leerer Track, sie kommt schlicht nicht aufs Vinyl.
 *
 * Eine Woche gehört zu dem Jahr, in dem ihr Donnerstag liegt, wie die
 * Kalenderwoche. KW 53 2026 läuft bis zum 3. Januar 2027: Silvester zählt
 * noch zum alten Album.
 */

/** Ab so vielen Tracks heisst die Platte so. Absteigend gesucht, aufsteigend notiert. */
export const FORMATE = [
  { ab: 1, name: "Demo" },
  { ab: 4, name: "EP" },
  { ab: 12, name: "LP" },
] as const

/** Der erste Teil eines Tracktitels: die Technik, die die Woche geprägt hat. */
export const TITEL_KOPF: Record<Technique, string> = {
  warmup: "Cold Start",
  "power-chords": "Wall",
  "palm-mute": "Choke",
  downpicking: "Downstroke",
  gallop: "Gallop",
  "alternate-picking": "Blur",
  pentatonic: "Box",
  bending: "Bend",
  legato: "Serpent",
  slides: "Slide",
  "dead-notes": "Rattle",
  tremolo: "Swarm",
}

const TITEL_WIE = [
  "Molten", "Rusted", "Midnight", "Savage", "Frozen", "Hollow",
  "Burning", "Iron", "Crooked", "Silent", "Feral", "Ashen",
]
const TITEL_WAS = [
  "Forge", "Anvil", "Valve", "Basement", "Wolf", "Furnace",
  "Cellar", "Cable", "Moth", "Foundry", "Kettle", "Static",
]

export interface Bestwert {
  drill: string
  bpm: number
}

export interface Track {
  nr: number
  /** Montag der Woche, `JJJJ-MM-TT`. */
  woche: string
  kw: number
  titel: string
  tage: number
  bloecke: number
  sauber: number
  /** Titel der Songs, die in dieser Woche gespielt wurden. */
  songs: string[]
  /** Drills, bei denen das saubere Tempo alles Frühere übertroffen hat. */
  bestwerte: Bestwert[]
  /** Name des Wochengegners, wenn er in dieser Woche gefallen ist. */
  gegner: string | null
}

export interface Album {
  jahr: number
  titel: string
  /** Neueste Woche zuletzt, wie auf der Platte. */
  tracks: Track[]
  format: (typeof FORMATE)[number]["name"]
  /** Letzter Tag, der noch zählt. */
  bis: string
  erschienen: boolean
  /** Das nächste Format, solange die restlichen Wochen dafür noch reichen. */
  naechstes: { name: string; fehlt: number } | null
  tage: number
  sauber: number
  gegner: number
}

const drillFuer = (id: string) => ALLE_DRILLS_BY_ID[id] ?? SIEBEN_DRILLS_BY_ID[id]

function verschoben(tag: string, tage: number): Date {
  const d = new Date(`${tag}T12:00:00`)
  d.setDate(d.getDate() + tage)
  return d
}

/** Das Album-Jahr einer Woche: das ihres Donnerstags. */
export const albumJahr = (woche: string) => verschoben(woche, 3).getFullYear()

/** Der 28. Dezember liegt immer in der letzten Kalenderwoche. */
const letzteWoche = (jahr: number) => weekKey(new Date(jahr, 11, 28, 12))

/** Die Technik mit den meisten Blöcken; das Warm-up nur, wenn sonst nichts war. */
function praegend(ergebnisse: DrillResult[]): Technique {
  let beste: Technique = "warmup"
  let meiste = 0
  for (const t of TECHNIQUES) {
    if (t === "warmup") continue
    const n = ergebnisse.filter((r) => r.technique === t).length
    if (n > meiste) [beste, meiste] = [t, n]
  }
  return beste
}

/**
 * Der Titel fällt aus Technik und Woche, auf jedem Gerät gleich. Ist er auf
 * dieser Platte schon vergeben, rückt die spätere Woche weiter — frühere
 * Tracks ändern sich dadurch nie.
 */
export function trackTitel(technik: Technique, woche: string, vergeben: Set<string>): string {
  const h = hash(`album-${woche}`)
  const felder = TITEL_WIE.length * TITEL_WAS.length
  for (let i = 0; i < felder; i += 1) {
    const n = (h + i) % felder
    const titel = `${TITEL_KOPF[technik]} of the ${TITEL_WIE[n % TITEL_WIE.length]} ${TITEL_WAS[Math.floor(n / TITEL_WIE.length)]}`
    if (!vergeben.has(titel)) return titel
  }
  return `${TITEL_KOPF[technik]} (KW ${kalenderwoche(woche)})`
}

/** Alle Alben mit mindestens einem Track, das neueste zuerst. */
export function alben(log: PracticeLog, theorie: TheoryLog, jetzt: Date = new Date()): Album[] {
  const aktuell = weekKey(jetzt)

  const jeWoche = new Map<string, DrillResult[]>()
  for (const r of log.results) {
    const t = Date.parse(r.at)
    if (Number.isNaN(t)) continue
    const woche = weekKey(new Date(t))
    // Eine falsch gestellte Uhr auf einem anderen Gerät presst nichts voraus.
    if (woche > aktuell) continue
    jeWoche.set(woche, [...(jeWoche.get(woche) ?? []), r])
  }

  // Bestwerte laufen über Jahresgrenzen: gemessen wird an allem Früheren.
  const sauberstes = new Map<string, number>()
  const jeJahr = new Map<number, Track[]>()

  for (const woche of [...jeWoche.keys()].sort()) {
    const ergebnisse = jeWoche.get(woche)!
    const jahr = albumJahr(woche)
    const tracks = jeJahr.get(jahr) ?? []
    jeJahr.set(jahr, tracks)

    const dieseWoche = new Map<string, number>()
    for (const r of ergebnisse) {
      if (r.rating >= SAUBER_AB) dieseWoche.set(r.drillId, Math.max(r.bpm, dieseWoche.get(r.drillId) ?? 0))
    }
    const bestwerte: Bestwert[] = []
    for (const [id, bpm] of dieseWoche) {
      const vorher = sauberstes.get(id)
      const drill = drillFuer(id)
      // Das erste saubere Mal ist ein Anfang, noch kein Bestwert.
      if (drill && vorher !== undefined && bpm > vorher) bestwerte.push({ drill: drill.title, bpm })
      sauberstes.set(id, Math.max(bpm, vorher ?? 0))
    }

    const gespielt = new Set(ergebnisse.map((r) => r.drillId))
    tracks.push({
      nr: tracks.length + 1,
      woche,
      kw: kalenderwoche(woche),
      titel: trackTitel(praegend(ergebnisse), woche, new Set(tracks.map((t) => t.titel))),
      tage: new Set(ergebnisse.map((r) => dayKey(new Date(r.at)))).size,
      bloecke: ergebnisse.length,
      sauber: ergebnisse.filter((r) => r.rating >= SAUBER_AB).length,
      songs: SONGS.filter((s) => gespielt.has(s.id)).map((s) => s.titel),
      bestwerte,
      gegner: wochenTreffer(log, theorie, woche).summe >= GEGNER_HP ? gegnerName(woche) : null,
    })
  }

  return [...jeJahr.entries()]
    .sort(([a], [b]) => b - a)
    .map(([jahr, tracks]) => {
      const ende = letzteWoche(jahr)
      const erschienen = aktuell > ende
      // Wochen, die noch einen Track bringen können: die laufende nur, solange sie leer ist.
      let offen = 0
      for (let w = aktuell; w <= ende; w = weekKey(verschoben(w, 7))) if (!jeWoche.has(w)) offen += 1
      const hoeher = FORMATE.find((f) => f.ab > tracks.length)
      const fehlt = hoeher ? hoeher.ab - tracks.length : 0
      return {
        jahr,
        titel: `Live aus dem Proberaum ${jahr}`,
        tracks,
        format: [...FORMATE].reverse().find((f) => tracks.length >= f.ab)!.name,
        bis: dayKey(verschoben(ende, 6)),
        erschienen,
        naechstes: hoeher && fehlt <= offen ? { name: hoeher.name, fehlt } : null,
        tage: tracks.reduce((n, t) => n + t.tage, 0),
        sauber: tracks.reduce((n, t) => n + t.sauber, 0),
        gegner: tracks.filter((t) => t.gegner).length,
      }
    })
}

/* ─────────────────────────────── Cover ──────────────────────────────── */

/** Kantenlänge des Covers in Pixeln. */
export const COVER_GROESSE = 64
/** Wo der Totenkopf sitzt: doppelt so gross wie gezeichnet, ganzzahlig. */
export const COVER_SCHAEDEL = { x: 12, y: 3, groesse: 40 }
const PEGEL_BODEN = 61

// Pappe und Druckfarben gehören zum Bild wie der Stoff zum Shirt, nicht zur App-Palette.
const PAPPE = ["#1c1418", "#121a22", "#161c14", "#1f1710"]
const RAHMEN = "#3a343f"
const BALKEN = "#6f93ad"
const BALKEN_GEGNER = "#e8a23d"

export interface CoverPixel {
  x: number
  y: number
  breite: number
  hoehe: number
  farbe: string
}

/**
 * Das Cover: ein Pegel unter dem Schädel, ein Balken je Track, so hoch wie
 * die Übungstage der Woche, Bernstein, wo der Wochengegner fiel. Jedes Jahr
 * sieht dadurch anders aus.
 */
export function coverPixel(album: Pick<Album, "jahr" | "tracks">): CoverPixel[] {
  const g = COVER_GROESSE
  const rechteck = (x: number, y: number, breite: number, hoehe: number, farbe: string) => ({
    x, y, breite, hoehe, farbe,
  })
  const n = album.tracks.length
  const platz = g - 8
  // Mit Lücke, solange sie passt; ein volles Jahr rückt zusammen.
  const luecke = n * 2 - 1 <= platz ? 1 : 0
  const breite = Math.max(1, Math.min(4, Math.floor((platz + luecke) / Math.max(1, n)) - luecke))
  const start = Math.floor((g - (n * (breite + luecke) - luecke)) / 2)
  return [
    rechteck(0, 0, g, g, PAPPE[hash(`cover-${album.jahr}`) % PAPPE.length]),
    rechteck(1, 1, g - 2, 1, RAHMEN),
    rechteck(1, g - 2, g - 2, 1, RAHMEN),
    rechteck(1, 2, 1, g - 4, RAHMEN),
    rechteck(g - 2, 2, 1, g - 4, RAHMEN),
    ...album.tracks.map((t, i) => {
      const hoehe = Math.min(7, t.tage) * 2
      return rechteck(start + i * (breite + luecke), PEGEL_BODEN - hoehe, breite, hoehe, t.gegner ? BALKEN_GEGNER : BALKEN)
    }),
  ]
}
