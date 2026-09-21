import { HOECHSTER_BUND, PENTATONIK, TOENE, midiAt, pentatonikLage, type Lage, type Ton } from "./fretboard"
import type { Griff } from "./types"

/**
 * Lead-Licks, gerechnet statt getippt.
 *
 * Der naheliegende Bau wäre: Töne aus der Pentatonik würfeln. Das ergibt
 * Tonsalat. Unmusikalisch ist dabei noch das kleinere Problem — man lernt
 * daran vor allem *keine Phrasierung*, und Übungsmaterial, das nichts lehrt,
 * ist schlimmer als keines.
 *
 * Ein Lick, das etwas taugt, hat eine Grammatik, und die ist erstaunlich
 * knapp:
 *
 *   1. Ein **Motiv** — drei bis vier Töne mit einer Richtung, nicht mehr.
 *   2. Eine **Entwicklung** — dasselbe Motiv wiederholt, sequenziert (um eine
 *      Stufe versetzt) oder umgekehrt. Das ist der Unterschied zwischen einer
 *      Phrase und einer Tonfolge: der Hörer erkennt etwas wieder.
 *   3. Ein **Zielton** auf schwerer Zählzeit, und zwar ein stabiler —
 *      Grundton oder Quinte. Alles andere klingt, als wäre man mittendrin
 *      abgebrochen.
 *   4. Ein **Ausklang**: der Zielton wird gehalten, mit Vibrato.
 *
 * Das ist die Form AA'AB, und sie steckt in den meisten Rocklicks, die man je
 * gehört hat.
 *
 * Gespielt wird ausschliesslich in *einer* Pentatonik-Lage. Das ist keine
 * Einschränkung, sondern der Punkt: Lagenwechsel sind ein eigenes Thema, und
 * ein Lick, für das man den Hals hinaufrutschen muss, ist als Übung nicht
 * dasselbe. `pentatonikLage` rechnet die zwölf Griffe aus; hier wird nur noch
 * ausgewählt.
 *
 * Alles hängt an einem Startwert. Dasselbe Lick lässt sich damit später
 * wieder herstellen — nötig, weil im Übungs-Log nur die Nummer steht und
 * nicht die Tabulatur.
 */

/** Wohin ein Motiv läuft. */
export type Kontur = "aufwaerts" | "abwaerts" | "bogen" | "zickzack"

/** Was im zweiten Takt mit dem Motiv passiert. */
export type Entwicklung = "wiederholung" | "sequenz" | "umkehrung"

export type Artikulation = "normal" | "hammer" | "pull" | "vibrato"

export interface LickNote {
  griff: Griff
  /** Achtel-Position ab Lick-Anfang, 0-basiert. */
  achtel: number
  artikulation: Artikulation
}

export interface Lick {
  seed: number
  grundton: Ton
  lage: Lage
  /** Immer zwei Takte 4/4 auf Achteln — sechzehn Plätze. */
  achtelGesamt: number
  noten: LickNote[]
  /** Woraus es gebaut ist. Steht unter dem Lick, damit es etwas erklärt. */
  bauplan: {
    kontur: Kontur
    entwicklung: Entwicklung
    /** „Grundton" oder „Quinte" — worauf es auflöst. */
    zielton: "Grundton" | "Quinte"
  }
}

/** Zwei Takte 4/4, auf Achteln gezählt. */
export const ACHTEL_GESAMT = 16

/** Der Zielton sitzt auf der Drei des zweiten Takts und wird gehalten. */
const ZIEL_ACHTEL = 12

/**
 * Kleiner, reiner Zufall mit Startwert (mulberry32).
 *
 * `Math.random()` ginge nicht: ein Lick muss aus seiner Nummer wieder
 * herstellbar sein, sonst steht im Log ein Eintrag zu einer Tabulatur, die
 * niemand mehr sehen kann.
 */
function wuerfel(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const KONTUREN: Record<Kontur, number[]> = {
  // Schritte im Tonvorrat, nicht in Halbtönen: die Pentatonik ist die Leiter.
  aufwaerts: [1, 1, 1],
  abwaerts: [-1, -1, -1],
  bogen: [1, 1, -1],
  zickzack: [1, -1, 2],
}

/**
 * Rhythmuszellen für eine halbe Taktlänge — welche der vier Achtel klingen.
 *
 * Das ist der Unterschied zwischen einem Lick und einer Übung. Zwölf gerade
 * Achtel am Stück sind eine Tonleiter mit Extraschritten; eine Phrase atmet,
 * und die Pause gehört dazu. Alle Zellen beginnen auf der Eins: eine
 * Phrase, die nicht auf der schweren Zählzeit anfängt, ist ein eigenes
 * Thema und für den Einstieg ins Lead-Spiel das falsche.
 */
const ZELLEN = [
  [0, 1, 2, 3], // durchlaufend
  [0, 1, 3], // Lücke auf der Drei
  [0, 2, 3], // Lücke auf der Zwei
  [0, 1, 2], // hört früher auf und lässt Luft
  [0, 2], // weit
] as const

/** Die Griffe der Lage, von tief nach hoch — das ist der Tonvorrat. */
function tonvorrat(grundton: Ton, lage: Lage): Griff[] {
  return pentatonikLage(grundton, lage, 0, HOECHSTER_BUND).sort((a, b) => midiAt(a) - midiAt(b))
}

/** Liegt an dieser Stelle der Grundton oder die Quinte? */
function istStabil(griff: Griff, grundton: Ton): "Grundton" | "Quinte" | null {
  const abstand = (((midiAt(griff) - TOENE.indexOf(grundton)) % 12) + 12) % 12
  if (abstand === 0) return "Grundton"
  if (abstand === PENTATONIK[3]) return "Quinte"
  return null
}

/**
 * Wie zwei aufeinanderfolgende Töne verbunden werden.
 *
 * Auf derselben Saite und nah beieinander wird gebunden — aufwärts
 * Hammer-on, abwärts Pull-off. Das ist keine Verzierung, sondern wie Leads
 * tatsächlich gespielt werden: jeder Ton einzeln angeschlagen klingt gehackt.
 * Über einen Saitenwechsel geht es nicht, deshalb dort normal. Nach einer
 * Pause auch nicht: gebunden wird, was zusammenhängt.
 */
function bindung(vorher: Griff | null, jetzt: Griff, luecke: boolean): Artikulation {
  if (!vorher || luecke || vorher.saite !== jetzt.saite) return "normal"
  const weite = Math.abs(jetzt.bund - vorher.bund)
  if (weite === 0 || weite > 3) return "normal"
  return jetzt.bund > vorher.bund ? "hammer" : "pull"
}

/**
 * Baut ein Lick aus seinem Startwert.
 *
 * Die Form ist immer dieselbe: **Motiv, Entwicklung, Anlauf, Auflösung.**
 *
 * Der Anlauf ist der Teil, der am meisten ausmacht und am wenigsten auffällt.
 * Ein drittes Mal dasselbe Motiv wäre Leiern — stattdessen läuft die Phrase
 * von dort, wo die Entwicklung endet, auf den Zielton zu und kommt bei ihm
 * *an*. Das ist der Unterschied zwischen einem Schluss und einem Abbruch.
 *
 * Was sich je Startwert ändert: Kontur, Entwicklung, Einstieg, Zielton und
 * drei Rhythmuszellen. Genug für Abwechslung, wenig genug, dass jedes
 * Ergebnis eine Phrase bleibt.
 */
export function baueLick(seed: number, grundton: Ton = "A", lage: Lage = 1): Lick {
  const rnd = wuerfel(seed)
  const waehle = <T,>(aus: readonly T[]): T => aus[Math.floor(rnd() * aus.length)]
  const vorrat = tonvorrat(grundton, lage)

  const kontur = waehle(Object.keys(KONTUREN) as Kontur[])
  const entwicklung = waehle(["wiederholung", "sequenz", "umkehrung"] as const)
  const schritte = KONTUREN[kontur]

  // Der Zielton steht zuerst fest: von ihm aus wird zurückgerechnet, damit
  // die Phrase auf ihm *ankommt*, statt zufällig dort vorbeizukommen.
  const stabile = vorrat
    .map((griff, i) => ({ griff, i, art: istStabil(griff, grundton) }))
    .filter((k) => k.art !== null)
  const ziel = waehle(stabile)

  /** Ein Motiv ab einem Platz im Tonvorrat, entlang der Kontur. */
  const motiv = (start: number, richtung: 1 | -1, laenge: number): number[] => {
    const plaetze = [start]
    for (const schritt of schritte.slice(0, laenge - 1)) {
      const naechster = plaetze[plaetze.length - 1] + schritt * richtung
      // Am Rand des Vorrats umkehren statt abschneiden: ein Motiv, dem
      // unterwegs die Töne ausgehen, ist kein Motiv.
      plaetze.push(
        naechster < 0 || naechster >= vorrat.length
          ? plaetze[plaetze.length - 1] - schritt * richtung
          : naechster,
      )
    }
    return plaetze
  }

  const spanne = schritte.reduce((s, x) => s + Math.abs(x), 0)
  const obergrenze = Math.max(0, vorrat.length - 1 - spanne)
  const start = Math.max(0, Math.min(ziel.i - 2 + Math.floor(rnd() * 3) - 1, obergrenze))

  const zelleA = waehle(ZELLEN)
  const zelleB = waehle(ZELLEN)
  const zelleC = waehle(ZELLEN)

  const a = motiv(start, 1, zelleA.length)
  const b =
    entwicklung === "wiederholung"
      ? motiv(start, 1, zelleB.length)
      : entwicklung === "sequenz"
        ? motiv(Math.min(start + 1, obergrenze), 1, zelleB.length)
        : motiv(Math.min(start + spanne, vorrat.length - 1), -1, zelleB.length)

  // Der Anlauf: schrittweise vom Ende der Entwicklung auf den Zielton zu,
  // sodass die letzte Note davor unmittelbar daneben liegt.
  const anlauf = (() => {
    const von = b[b.length - 1]
    const schritt = ziel.i >= von ? 1 : -1
    const nachbar = ziel.i - schritt
    const plaetze: number[] = []
    for (let i = zelleC.length - 1; i >= 0; i -= 1) {
      const platz = nachbar - i * schritt
      plaetze.push(Math.max(0, Math.min(platz, vorrat.length - 1)))
    }
    return plaetze
  })()

  const phrasen = [
    { zelle: zelleA, plaetze: a, ab: 0 },
    { zelle: zelleB, plaetze: b, ab: 4 },
    { zelle: zelleC, plaetze: anlauf, ab: 8 },
  ]

  const noten: LickNote[] = []
  let vorige: Griff | null = null
  let vorigesAchtel = -1

  for (const { zelle, plaetze, ab } of phrasen) {
    zelle.forEach((versatz, i) => {
      const griff = vorrat[plaetze[i]]
      if (!griff) return
      const achtel = ab + versatz
      noten.push({
        griff,
        achtel,
        artikulation: bindung(vorige, griff, achtel !== vorigesAchtel + 1),
      })
      vorige = griff
      vorigesAchtel = achtel
    })
  }

  // Der Ausklang: der Zielton kommt auf die schwere Zählzeit und bleibt
  // stehen. Ohne Vibrato klingt ein gehaltener Ton auf der Gitarre tot.
  noten.push({ griff: ziel.griff, achtel: ZIEL_ACHTEL, artikulation: "vibrato" })

  return {
    seed,
    grundton,
    lage,
    achtelGesamt: ACHTEL_GESAMT,
    noten,
    bauplan: { kontur, entwicklung, zielton: ziel.art as "Grundton" | "Quinte" },
  }
}

/**
 * Das Lick als ASCII-Tabulatur, in derselben Form wie die Drills im Katalog.
 *
 * Zwei Dinge halten sie schmal genug, um auf ein Handy zu passen — und das
 * ist kein Schönheitsproblem: eine Tabulatur, für die man beim Spielen nach
 * rechts wischen muss, ist keine Hilfe.
 *
 * Erstens ist die Spalte so breit wie nötig und nicht breiter: zwei Zeichen
 * reichen für `-5` und `h8`, drei braucht es erst ab dem zehnten Bund.
 * Zweitens wird der leere Schwanz abgeschnitten — nach dem Zielton klingt
 * nichts mehr, und sechs Spalten Striche sagen das nicht besser als eine.
 *
 * Die Bindungen stehen *vor* dem Bund, wie in jeder Tabulatur: `h8` heisst,
 * die 8 wird gehämmert. Das Vibrato am Schluss als `~`.
 */
export function tabOf(lick: Lick): string {
  const zeichen: Record<Artikulation, string> = {
    normal: "-",
    hammer: "h",
    pull: "p",
    vibrato: "-",
  }

  const breiteste = Math.max(...lick.noten.map((n) => `${n.griff.bund}`.length))
  const spalte = breiteste + 1
  // Bis zum letzten klingenden Achtel, plus eins für den gehaltenen Ton.
  const letzte = Math.max(...lick.noten.map((n) => n.achtel))
  const spalten = Math.min(letzte + 2, lick.achtelGesamt)

  const zeilen = [1, 2, 3, 4, 5, 6].map((saite) => {
    const felder: string[] = Array.from({ length: spalten }, () => "-".repeat(spalte))
    for (const note of lick.noten) {
      if (note.griff.saite !== saite) continue
      const kopf = zeichen[note.artikulation]
      felder[note.achtel] = (kopf + note.griff.bund).padStart(spalte, "-").slice(-spalte)
      // Der Zielton wird gehalten — das Vibrato läuft in die nächste Spalte.
      if (note.artikulation === "vibrato" && note.achtel + 1 < spalten) {
        felder[note.achtel + 1] = "~".repeat(spalte)
      }
    }
    return felder
  })

  const namen = ["e", "B", "G", "D", "A", "E"]
  return zeilen.map((felder, i) => `${namen[i]}|${felder.join("")}|`).join("\n")
}

/**
 * Ein Satz zum Lick, aus dem Bauplan — keine Behauptung, sondern Auskunft
 * darüber, was da tatsächlich gebaut wurde.
 */
export function erklaerungOf(lick: Lick): string {
  const kontur: Record<Kontur, string> = {
    aufwaerts: "läuft aufwärts",
    abwaerts: "läuft abwärts",
    bogen: "steigt und fällt wieder",
    zickzack: "geht im Zickzack",
  }
  const entwicklung: Record<Entwicklung, string> = {
    wiederholung: "kommt unverändert wieder",
    sequenz: "kommt eine Stufe höher wieder",
    umkehrung: "kommt rückwärts wieder",
  }
  return (
    `Das Motiv ${kontur[lick.bauplan.kontur]} und ${entwicklung[lick.bauplan.entwicklung]}. ` +
    `Aufgelöst wird auf ${lick.bauplan.zielton === "Grundton" ? "den Grundton" : "die Quinte"} — ` +
    `deshalb klingt der Schluss wie ein Schluss und nicht wie ein Abbruch. ` +
    `Alles liegt in Lage ${lick.lage} der ${lick.grundton}-Moll-Pentatonik.`
  )
}
