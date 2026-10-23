import { midiAt, noteAt } from "./fretboard"
import { ACHTEL_JE_TAKT, pausenOf, type Dauer, type Pause, type Song } from "./song"

/**
 * Der Notensatz: wo im Bild was steht.
 *
 * Die Rechnung ist rein, die Zeichnung dünn. Was hier herauskommt, sind
 * Koordinaten — Köpfe, Hälse, Balken, Hilfslinien, Pausen —, und
 * `noten-view.tsx` malt sie nur noch. Deshalb lässt sich prüfen, ob ein D
 * auf der vierten Linie sitzt, ohne einen Browser zu öffnen.
 *
 * Eingerichtet ist es für eine Stimme in 4/4 mit Ganzen bis Achteln, wie die
 * Songs sie haben. Die Abstände sind **proportional**: ein Achtel nimmt einen
 * Platz, eine Viertel zwei, eine Halbe vier. Das ist nicht die Art, wie
 * gedruckte Noten gesetzt werden, aber hier ist die Länge selbst der
 * Lernstoff — man sieht sie.
 *
 * Alle Koordinaten sind in Einheiten der Notenlinien: der Abstand zweier
 * Linien ist `LINIE`. Die Zeichnung skaliert über die `viewBox`.
 */

/** Abstand zweier Notenlinien. */
export const LINIE = 8
const HALB = LINIE / 2

/** Breite eines Achtels. Mehr braucht ein Notenkopf mit Balken nicht, weniger passt nicht aufs Handy. */
const ACHTEL_BREITE = 16
const RAND_LINKS = 10
const RAND_RECHTS = 6
export const TAKT_BREITE = RAND_LINKS + ACHTEL_JE_TAKT * ACHTEL_BREITE + RAND_RECHTS

const SCHLUESSEL_BREITE = 34
const TAKTART_BREITE = 18

/** Luft über der obersten Linie: hier enden die Hälse hoher Töne. */
export const OBEN = 36
/** Wo die Notennamen stehen, von oben im System gemessen. */
const NAMEN_Y = OBEN + 4 * LINIE + 34
/** Unter dem Namen bleibt Platz für den tiefsten Ton der Gitarre: E3 sitzt unter drei Hilfslinien. */
const SYSTEM_HOEHE = NAMEN_Y + 18

/** Der Mittelpunkt eines Kopfes liegt so weit vom Anfang seines Platzes. */
const KOPF_MITTE = 6
/** Halber Kopf, so weit sitzt der Hals neben der Mitte. */
const KOPF_RADIUS = 5
const HALS_LAENGE = 3.5 * LINIE

/**
 * Die unterste Linie im Violinschlüssel ist E4. Gezählt wird in Stufen
 * (Buchstaben), nicht in Halbtönen: auf der Notenlinie liegt jeder
 * Buchstabe eine halbe Linie über dem vorigen.
 */
const UNTERSTE_LINIE = 4 * 7 + 2

/** Der Buchstabe je Halbton ab C; Kreuz-Töne tragen den Buchstaben darunter. */
const BUCHSTABE = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6] as const
const KREUZ = new Set([1, 3, 6, 8, 10])

/**
 * Wo ein Ton auf dem Notensystem steht.
 *
 * Die Gitarre klingt eine Oktave tiefer, als sie geschrieben wird. Die offene
 * hohe e-Saite ist E4 und steht als E5 auf der Linie darüber — würde hier
 * nicht transponiert, lernte man falsche Notennamen, und zwar jeder
 * Gitarrist, der je Noten gelesen hat, ausgerechnet an dieser Stelle.
 *
 * `pos` zählt in halben Linienabständen von der untersten Linie: 0 ist die
 * unterste Linie, 1 der Raum darüber, 8 die oberste Linie, −2 die erste
 * Hilfslinie darunter.
 */
export function notenPosition(klingendMidi: number): { pos: number; kreuz: boolean } {
  const geschrieben = klingendMidi + 12
  const stufe = (Math.floor(geschrieben / 12) - 1) * 7 + BUCHSTABE[geschrieben % 12]
  return { pos: stufe - UNTERSTE_LINIE, kreuz: KREUZ.has(geschrieben % 12) }
}

/** Die y-Koordinate einer Position, von oben im System gemessen. */
export function yVon(pos: number): number {
  return OBEN + 4 * LINIE - pos * HALB
}

export type Richtung = "auf" | "ab"

export interface Kopf {
  /** Index der Note im Song. */
  note: number
  x: number
  y: number
  dauer: Dauer
  /** Ganze und Halbe sind hohl, Viertel und Achtel gefüllt. */
  gefuellt: boolean
  kreuz: boolean
  /** Der Buchstabe, wie der Ton heißt (ohne Kreuz). */
  name: string
  /** y-Koordinaten der Hilfslinien, die zu diesem Kopf gehören. */
  hilfslinien: number[]
  /** Null bei der Ganzen. `bis` ist die Spitze, bei Balkennoten der Balken. */
  hals: { x: number; von: number; bis: number } | null
  richtung: Richtung
  /** Ein einzelnes Achtel bekommt ein Fähnchen; zwei verbundene bekommen einen Balken. */
  fahne: boolean
}

export interface Balken {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface PauseZeichen {
  x: number
  /** Der Bezugspunkt der Form; die Zeichnung weiß, wie sie dort sitzt. */
  y: number
  dauer: Dauer
}

export interface Takt {
  /** Nummer im Song, 0-basiert. */
  index: number
  x: number
  breite: number
  /** Der letzte Takt des Songs bekommt den Schlussstrich. */
  schluss: boolean
  koepfe: Kopf[]
  balken: Balken[]
  pausen: PauseZeichen[]
}

export interface System {
  /** Wie weit unten im Bild dieses System beginnt. */
  y0: number
  /** Nur das erste System zeigt die Taktangabe. */
  taktart: boolean
  /** Breite dieses Systems; die Linien reichen so weit. */
  breite: number
  takte: Takt[]
}

export interface Notensatz {
  breite: number
  hoehe: number
  /** y der fünf Linien im System, von oben nach unten. */
  linien: number[]
  namenY: number
  systeme: System[]
}

/**
 * Die Hilfslinien, die ein Kopf auf `pos` braucht: alle, die zwischen dem
 * System und dem Kopf liegen, und seine eigene, wenn er auf einer sitzt. Im
 * Raum direkt unter der untersten oder über der obersten Linie braucht es
 * keine.
 */
function hilfslinienFuer(pos: number): number[] {
  const ys: number[] = []
  for (let p = -2; p >= pos; p -= 2) ys.push(yVon(p))
  for (let p = 10; p <= pos; p += 2) ys.push(yVon(p))
  return ys
}

/** Wo die Hälse eines Kopfes enden, ohne Balken. Sehr hohe und tiefe Töne reichen bis zur Mittellinie. */
function halsEnde(y: number, richtung: Richtung): number {
  const mitte = yVon(4)
  return richtung === "auf" ? Math.min(y - HALS_LAENGE, mitte) : Math.max(y + HALS_LAENGE, mitte)
}

/** Hälse zeigen nach unten, sobald der Kopf auf oder über der Mittellinie sitzt. */
function richtungFuer(pos: number): Richtung {
  return pos >= 4 ? "ab" : "auf"
}

function baueTakt(song: Song, pausen: Pause[], index: number, x: number): Takt {
  const anfang = index * ACHTEL_JE_TAKT
  const ende = anfang + ACHTEL_JE_TAKT
  const platz = (start: number) => x + RAND_LINKS + (start - anfang) * ACHTEL_BREITE + KOPF_MITTE

  const imTakt = song.noten
    .map((note, i) => ({ note, i }))
    .filter(({ note }) => note.start >= anfang && note.start < ende)

  const koepfe: Kopf[] = imTakt.map(({ note, i }) => {
    const { pos, kreuz } = notenPosition(midiAt(note.griff))
    const richtung = richtungFuer(pos)
    const kopfX = platz(note.start)
    const y = yVon(pos)
    const hatHals = note.dauer < 8
    return {
      note: i,
      x: kopfX,
      y,
      dauer: note.dauer,
      gefuellt: note.dauer <= 2,
      kreuz,
      name: noteAt(note.griff).replace("#", ""),
      hilfslinien: hilfslinienFuer(pos),
      hals: hatHals
        ? {
            x: richtung === "auf" ? kopfX + KOPF_RADIUS : kopfX - KOPF_RADIUS,
            von: y,
            bis: halsEnde(y, richtung),
          }
        : null,
      richtung,
      fahne: note.dauer === 1,
    }
  })

  // Zwei Achtel, die zusammen auf einen Schlag fallen, werden verbunden.
  const balken: Balken[] = []
  for (let k = 0; k < koepfe.length - 1; k += 1) {
    const a = koepfe[k]
    const b = koepfe[k + 1]
    const noteA = song.noten[a.note]
    const noteB = song.noten[b.note]
    if (noteA.dauer !== 1 || noteB.dauer !== 1) continue
    if (noteA.start % 2 !== 0 || noteB.start !== noteA.start + 1) continue
    if (!a.hals || !b.hals) continue

    // Beide Hälse zeigen dorthin, wo der weiter von der Mittellinie
    // entfernte Kopf es verlangt. Gleichstand: nach unten.
    const mitte = yVon(4)
    const abstandA = Math.abs(a.y - mitte)
    const abstandB = Math.abs(b.y - mitte)
    const richtung: Richtung = abstandA === abstandB ? "ab" : abstandA > abstandB ? a.richtung : b.richtung

    const halsX = (kopf: Kopf) => (richtung === "auf" ? kopf.x + KOPF_RADIUS : kopf.x - KOPF_RADIUS)
    const eA = halsEnde(a.y, richtung)
    const eB = halsEnde(b.y, richtung)

    // Der Balken darf nicht steiler fallen als dreiviertel Linienabstand, sonst
    // sieht es nach Treppe aus. Dafür rückt er vom Kopf weg, nie auf ihn zu:
    // jeder Hals bleibt so lang wie verlangt oder länger.
    const gefaelle = Math.max(-LINIE * 0.75, Math.min(LINIE * 0.75, eB - eA))
    const y1 = richtung === "auf" ? Math.min(eA, eB - gefaelle) : Math.max(eA, eB - gefaelle)
    const y2 = y1 + gefaelle

    a.richtung = richtung
    b.richtung = richtung
    a.hals = { x: halsX(a), von: a.y, bis: y1 }
    b.hals = { x: halsX(b), von: b.y, bis: y2 }
    a.fahne = false
    b.fahne = false
    balken.push({ x1: a.hals.x, y1, x2: b.hals.x, y2 })
    k += 1
  }

  const pausenImTakt: PauseZeichen[] = pausen
    .filter((pause) => pause.start >= anfang && pause.start < ende)
    .map((pause) => ({
      // Die ganze Pause steht in der Mitte des Takts, alle anderen am Platz
      // der Note, die dort stünde.
      x: pause.dauer === 8 ? x + RAND_LINKS + 4 * ACHTEL_BREITE : platz(pause.start),
      // Ganze hängt an der vierten, Halbe sitzt auf der dritten Linie;
      // Viertel und Achtel sind um die Mitte gezeichnet.
      y: pause.dauer === 8 ? yVon(6) : yVon(4),
      dauer: pause.dauer,
    }))

  return {
    index,
    x,
    breite: TAKT_BREITE,
    schluss: index === song.takte - 1,
    koepfe,
    balken,
    pausen: pausenImTakt,
  }
}

/**
 * Setzt einen Song. `takteProZeile` Takte kommen auf ein System; auf dem Handy
 * passen zwei, ohne dass die Notenköpfe zu klein werden.
 */
export function baueNotensatz(song: Song, takteProZeile = 2): Notensatz {
  const pausen = pausenOf(song)
  const systeme: System[] = []

  for (let ab = 0; ab < song.takte; ab += takteProZeile) {
    const erstes = ab === 0
    const x0 = SCHLUESSEL_BREITE + (erstes ? TAKTART_BREITE : 0)
    const anzahl = Math.min(takteProZeile, song.takte - ab)
    systeme.push({
      y0: systeme.length * SYSTEM_HOEHE,
      taktart: erstes,
      breite: x0 + anzahl * TAKT_BREITE,
      takte: Array.from({ length: anzahl }, (_, i) => baueTakt(song, pausen, ab + i, x0 + i * TAKT_BREITE)),
    })
  }

  return {
    breite: Math.max(...systeme.map((system) => system.breite)),
    hoehe: systeme.length * SYSTEM_HOEHE,
    linien: [0, 1, 2, 3, 4].map((i) => OBEN + i * LINIE),
    namenY: NAMEN_Y,
    systeme,
  }
}
