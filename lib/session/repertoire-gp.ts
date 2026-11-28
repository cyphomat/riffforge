/**
 * Reads what a Guitar Pro file (.gp3, .gp4, .gp5) says about a song: title,
 * band, tempo, bars, time signatures, markers and tunings.
 *
 * All of that stands in front of the notes, so reading stops after the last
 * track and never touches a note. The file stays on the device. The newer
 * formats (.gpx, .gp) are built differently and are turned away by name.
 */

export interface GpSpur {
  name: string
  schlagzeug: boolean
  /** Open strings, low to high. */
  saiten: string[]
}

export interface GpSong {
  titel: string
  band: string
  /** The tempo in the file's header, in BPM. */
  tempo: number
  takte: number
  /** The time signatures that occur, in order of appearance. */
  taktarten: string[]
  /** Named places in the song, usually its parts. */
  marken: { takt: number; name: string }[]
  /** Empty or shortened when the track list could not be read to its end. */
  spuren: GpSpur[]
}

export type GpGelesen =
  | { ok: true; song: GpSong; /** The first byte that was not read. */ ende: number }
  | { ok: false; grund: string }

export const MAX_GP_BYTES = 10_000_000

const MAX_TAKTE = 4000
const MAX_SPUREN = 100
// Guitars are mostly tuned down, so the black keys carry their flat names.
const TOENE = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"]

const KEINE = "Das ist keine Guitar-Pro-Datei."
const NEUER = "Dieses neuere Guitar-Pro-Format kann die App nicht lesen. Gelesen werden .gp3, .gp4 und .gp5."
const KAPUTT = "Die Datei ist beschädigt oder anders aufgebaut als erwartet."

/** Walks through the file. Every step past the end throws. */
function leser(bytes: Uint8Array) {
  const text = new TextDecoder("windows-1252")
  let stelle = 0
  const nimm = (anzahl: number) => {
    if (anzahl < 0 || stelle + anzahl > bytes.length) throw new RangeError("Datei zu kurz")
    stelle += anzahl
    return bytes.subarray(stelle - anzahl, stelle)
  }
  const byte = () => nimm(1)[0]
  const int = () => {
    const [a, b, c, d] = nimm(4)
    return a | (b << 8) | (c << 16) | (d << 24)
  }
  /** A length byte in a field of fixed width. */
  const feld = (breite: number) => {
    const laenge = byte()
    return text.decode(nimm(breite).subarray(0, laenge))
  }
  /** The usual string: field width plus one as int, then length byte and field. */
  const wort = () => feld(int() - 1)
  return { nimm, byte, int, feld, wort, stelle: () => stelle }
}

type Leser = ReturnType<typeof leser>

function bereich(wert: number, von: number, bis: number): number {
  if (wert < von || wert > bis) throw new RangeError("Wert außerhalb")
  return wert
}

/** Everything between the version string and the number of bars. */
function kopf(l: Leser, version: number) {
  const titel = l.wort()
  l.wort() // subtitle
  const band = l.wort()
  // Album, words, (music since 5), copyright, tab author, instructions.
  for (let i = 0; i < (version >= 500 ? 6 : 5); i++) l.wort()
  for (let zeilen = bereich(l.int(), 0, 1000); zeilen > 0; zeilen--) l.wort()
  if (version < 500) l.byte() // triplet feel
  if (version >= 400) {
    l.int() // lyrics track
    for (let i = 0; i < 5; i++) {
      l.int()
      l.nimm(l.int())
    }
  }
  if (version >= 500) {
    if (version > 500) l.nimm(19) // master effect
    l.nimm(30) // page setup
    for (let i = 0; i < 10; i++) l.wort()
    l.wort() // tempo name
  }
  const tempo = l.int()
  if (version > 500) l.byte() // hide tempo
  if (version >= 500) l.nimm(5) // key and octave
  else l.nimm(version >= 400 ? 5 : 4)
  l.nimm(64 * 12) // MIDI channels
  if (version >= 500) l.nimm(19 * 2 + 4) // directions and reverb
  return { titel: titel.trim(), band: band.trim(), tempo }
}

function taktKoepfe(l: Leser, version: number, takte: number) {
  const taktarten = new Set<string>()
  const marken: GpSong["marken"] = []
  let zaehler = 4
  let nenner = 4
  for (let takt = 1; takt <= takte; takt++) {
    if (version >= 500 && takt > 1) l.byte()
    const flags = l.byte()
    if (flags & 0x01) zaehler = bereich(l.byte(), 1, 64)
    if (flags & 0x02) nenner = bereich(l.byte(), 1, 64)
    if (flags & 0x08) l.byte() // end of repeat
    // Version 5 moved the alternate ending behind the marker.
    if (version < 500 && flags & 0x10) l.byte()
    if (flags & 0x20) {
      marken.push({ takt, name: l.wort().trim() })
      l.nimm(4) // colour
    }
    if (version >= 500 && flags & 0x10) l.byte()
    if (flags & 0x40) l.nimm(2) // key signature
    if (version >= 500) {
      if (flags & 0x03) l.nimm(4) // beaming
      if (!(flags & 0x10)) l.byte()
      l.byte() // triplet feel
    }
    taktarten.add(`${zaehler}/${nenner}`)
  }
  return { taktarten: [...taktarten], marken }
}

function spur(l: Leser, version: number, nummer: number): GpSpur {
  if (version >= 500 && (nummer === 0 || version === 500)) l.byte()
  const flags = l.byte()
  const name = l.feld(40).trim()
  const anzahl = bereich(l.int(), 1, 7)
  // Seven slots, highest string first.
  const stimmung = Array.from({ length: 7 }, () => l.int()).slice(0, anzahl)
  const saiten = stimmung.reverse().map((ton) => TOENE[bereich(ton, 0, 127) % 12])
  l.nimm(5 * 4 + 4) // port, channels, frets, capo, colour
  return { name, schlagzeug: Boolean(flags & 0x01), saiten }
}

/** What version 5 appends to every track: sound engine settings. */
function spurAnhang(l: Leser, version: number) {
  l.nimm(4) // display flags, accentuation, bank
  l.nimm(1 + 3 * 4 + 12) // humanising
  l.nimm(3 * 4) // instrument
  l.nimm(version === 500 ? 3 : 4)
  if (version > 500) {
    l.nimm(4) // equaliser
    l.wort()
    l.wort()
  }
}

export function gpLesen(bytes: Uint8Array): GpGelesen {
  const anfang = new TextDecoder("windows-1252").decode(bytes.subarray(0, 31))
  if (anfang.startsWith("PK") || anfang.startsWith("BCF")) return { ok: false, grund: NEUER }
  const treffer = /^FICHIER GUITAR PRO v(\d)\.(\d\d)/.exec(anfang.slice(1))
  if (!treffer) return { ok: false, grund: KEINE }
  const version = Number(treffer[1]) * 100 + Number(treffer[2])
  if (version < 300 || version >= 600) {
    return { ok: false, grund: "Diese Guitar-Pro-Version kann die App nicht lesen. Gelesen werden .gp3, .gp4 und .gp5." }
  }
  const l = leser(bytes)
  try {
    l.feld(30)
    const { titel, band, tempo } = kopf(l, version)
    bereich(tempo, 1, 1000)
    const takte = bereich(l.int(), 1, MAX_TAKTE)
    const anzahlSpuren = bereich(l.int(), 1, MAX_SPUREN)
    const { taktarten, marken } = taktKoepfe(l, version, takte)
    const spuren: GpSpur[] = []
    // A track list that breaks off costs the tuning, not the rest of the song.
    try {
      for (let i = 0; i < anzahlSpuren; i++) {
        spuren.push(spur(l, version, i))
        if (version >= 500) spurAnhang(l, version)
      }
    } catch (fehler) {
      if (!(fehler instanceof RangeError)) throw fehler
    }
    return { ok: true, song: { titel, band, tempo, takte, taktarten, marken, spuren }, ende: l.stelle() }
  } catch (fehler) {
    if (!(fehler instanceof RangeError)) throw fehler
    return { ok: false, grund: KAPUTT }
  }
}
