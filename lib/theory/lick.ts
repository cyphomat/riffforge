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

/**
 * Wie viele Zeichen auf das schmalste Gerät passen.
 *
 * Im Browser bei 320 px gemessen: 254 px Platz, rund 7,5 px je Zeichen in der
 * Tabulaturschrift. Was darunter bleibt, braucht keinen Umbruch.
 */
const PASST_AUFS_HANDY = 33

/** Der Zielton sitzt auf der Drei des zweiten Takts und wird gehalten. */
const ZIEL_ACHTEL = 12

/**
 * Kleiner, reiner Zufall mit Startwert (mulberry32).
 *
 * `Math.random()` ginge nicht: ein Lick muss aus seiner Nummer wieder
 * herstellbar sein, sonst steht im Log ein Eintrag zu einer Tabulatur, die
 * niemand mehr sehen kann.
 *
 * Der Startwert wird vorher durchgerührt, und das ist nicht Kosmetik.
 * Mulberry32 liefert bei kleinen, *fortlaufenden* Startwerten korrelierte
 * erste Werte — und genau dort fängt jeder an: die Licks werden ab eins
 * durchgezählt. Nachgemessen über die ersten vierzig Startwerte war
 * neunzehnmal dieselbe Kontur dran, wo zehnmal zu erwarten gewesen wären.
 * Ab Startwert tausend verteilte es sich sauber. Ein neuer Nutzer hätte
 * also ausgerechnet die vierzig Licks bekommen, bei denen die Abwechslung
 * fehlt, und niemand spielt vierhundert, bevor ihm das auffällt.
 */
function wuerfel(seed: number): () => number {
  // Lawinenfunktion aus splitmix32: benachbarte Startwerte laufen danach
  // weit auseinander.
  let a = seed >>> 0
  a = Math.imul(a ^ (a >>> 16), 0x21f0aaad) >>> 0
  a = Math.imul(a ^ (a >>> 15), 0x735a2d97) >>> 0
  a = (a ^ (a >>> 15)) >>> 0

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

  /**
   * Der Bereich, in dem ein Motiv dieser Länge und Richtung *vollständig*
   * Platz hat.
   *
   * Ohne ihn stösst ein Motiv am Rand des Vorrats an und kehrt um — und eine
   * abwärts laufende Kontur, die bei Platz 0 anfängt, pendelt dann zwischen
   * zwei Tönen hin und her. Nachgemessen über 1500 Licks kam das in 4,8 %
   * heraus, und die sahen alle gleich aus: ein Triller auf einer Saite,
   * fünfmal wiederholt. Als Lick ist das keines.
   *
   * Die Schranke ist deshalb nicht die Gesamtstrecke, sondern der *weiteste
   * Ausschlag* der Kontur nach oben und nach unten — bei `bogen` (+1, +1, −1)
   * sind das zwei Plätze nach oben und keiner nach unten, bei `abwaerts`
   * drei nach unten und keiner nach oben.
   */
  const fenster = (richtung: 1 | -1, laenge: number) => {
    let hier = 0
    let tiefster = 0
    let hoechster = 0
    for (const schritt of schritte.slice(0, laenge - 1)) {
      hier += schritt * richtung
      tiefster = Math.min(tiefster, hier)
      hoechster = Math.max(hoechster, hier)
    }
    const unten = -tiefster
    const oben = vorrat.length - 1 - hoechster
    return { unten, oben: Math.max(unten, oben) }
  }

  const ins = (platz: number, grenzen: { unten: number; oben: number }) =>
    Math.max(grenzen.unten, Math.min(platz, grenzen.oben))

  const spanne = schritte.reduce((s, x) => s + Math.abs(x), 0)

  const zelleA = waehle(ZELLEN)
  const zelleB = waehle(ZELLEN)
  const zelleC = waehle(ZELLEN)

  // Der Einstieg liegt in der Nähe des Ziels, damit die Phrase nicht quer
  // durch die Lage laufen muss — aber immer so weit vom Rand, dass die
  // Kontur ganz hineinpasst.
  const gewuenscht = ziel.i - 2 + Math.floor(rnd() * 3) - 1
  const start = ins(gewuenscht, fenster(1, zelleA.length))

  const a = motiv(start, 1, zelleA.length)
  const b =
    entwicklung === "wiederholung"
      ? motiv(ins(start, fenster(1, zelleB.length)), 1, zelleB.length)
      : entwicklung === "sequenz"
        ? motiv(ins(start + 1, fenster(1, zelleB.length)), 1, zelleB.length)
        : motiv(ins(start + spanne, fenster(-1, zelleB.length)), -1, zelleB.length)

  // Der Anlauf: schrittweise vom Ende der Entwicklung auf den Zielton zu,
  // sodass die letzte Note davor unmittelbar daneben liegt.
  const anlauf = (() => {
    const von = b[b.length - 1]
    // Von welcher Seite herangelaufen wird, entscheidet zuerst die
    // Entwicklung — aber nur, solange auf dieser Seite überhaupt genug Töne
    // liegen. Sitzt der Zielton unten in der Lage, gibt es unter ihm nichts
    // mehr, und der geklemmte Anlauf trat dann auf der Stelle: drei Noten auf
    // demselben Ton, direkt vor der Auflösung. Über 1500 Licks in allen
    // sechzig Boxen sassen **alle** Stotterstellen genau dort. Von der
    // anderen Seite heranzulaufen kostet nichts — schrittweise bleibt
    // schrittweise, ob von oben oder von unten.
    const noetig = zelleC.length
    const unten = ziel.i
    const oben = vorrat.length - 1 - ziel.i
    let schritt: 1 | -1 = ziel.i >= von ? 1 : -1
    if (schritt === 1 && unten < noetig && oben >= noetig) schritt = -1
    else if (schritt === -1 && oben < noetig && unten >= noetig) schritt = 1

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
  let vorigesPlatz = -1
  let vorigesAchtel = -1

  for (const { zelle, plaetze, ab } of phrasen) {
    zelle.forEach((versatz, i) => {
      const achtel = ab + versatz
      let platz = plaetze[i]

      // Derselbe Ton zweimal hintereinander, ohne Bindung, liest sich in
      // einer Tabulatur wie ein Tippfehler. Das passierte an der
      // Phrasengrenze: ein Zickzack-Motiv (+1, −1, +2) endet nach drei Tönen
      // genau dort, wo es anfing, und die Wiederholung setzt denselben Ton
      // noch einmal an. Nachgemessen betraf das ein Drittel aller Licks.
      // Ein Platz weiter in Richtung des Vorrats behebt es, ohne die Kontur
      // zu verlieren — die Phrase geht dann weiter, statt zu stottern.
      //
      // Der zweite Fall ist der Zielton: er wird nach der Schleife angehängt,
      // also weiss die Schleife nichts von ihm. Kommt die letzte Note des
      // Anlaufs auf ihm zu liegen, steht derselbe Ton zweimal da — und zwar
      // ausgerechnet an der Auflösung. Über 1500 Licks in allen sechzig Boxen
      // sassen alle verbliebenen Stotterstellen genau dort (11→12). Deshalb
      // gilt der Platz des Ziels an der Stelle davor als belegt.
      const belegt = (kandidat: number, wann: number) =>
        (kandidat === vorigesPlatz && wann === vorigesAchtel + 1) ||
        (wann === ZIEL_ACHTEL - 1 && kandidat === ziel.i)

      if (belegt(platz, achtel)) {
        const hoeher = platz + 1
        const tiefer = platz - 1
        if (hoeher < vorrat.length && !belegt(hoeher, achtel)) platz = hoeher
        else if (tiefer >= 0 && !belegt(tiefer, achtel)) platz = tiefer
      }

      const griff = vorrat[platz]
      if (!griff) return
      noten.push({
        griff,
        achtel,
        artikulation: bindung(vorige, griff, achtel !== vorigesAchtel + 1),
      })
      vorige = griff
      vorigesPlatz = platz
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
 * Drei Dinge halten sie schmal genug, um auf ein Handy zu passen — und das
 * ist kein Schönheitsproblem: eine Tabulatur, für die man beim Spielen nach
 * rechts wischen muss, ist keine Hilfe.
 *
 * Erstens ist die Spalte so breit wie nötig und nicht breiter: zwei Zeichen
 * reichen für `-5` und `h8`, drei braucht es erst ab dem zehnten Bund.
 * Zweitens wird der leere Schwanz abgeschnitten — nach dem Zielton klingt
 * nichts mehr, und sechs Spalten Striche sagen das nicht besser als eine.
 *
 * Drittens steht **jeder Takt auf einer eigenen Zeile**. Das war der Fall,
 * den die erste Messung nicht sah: sie lief in der Standardbox, und dort
 * bleibt jeder Bund einstellig. Ab dem zehnten Bund braucht jede Spalte ein
 * Zeichen mehr, und aus 31 Zeichen werden 45 — nachgemessen betraf das 36 %
 * aller Licks über die sechzig Boxen. Im Browser bei 390 px gemessen:
 * 339 px Inhalt in einem 324 px breiten Feld, abgeschnitten wird rechts,
 * und rechts steht der Zielton. Zwei Systeme à einem Takt sind höchstens
 * 27 Zeichen breit und passen auch auf 320 px — und nebenbei sieht man dem
 * Lick jetzt seinen Bau an: Motiv und Entwicklung oben, Anlauf und
 * Auflösung unten.
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
  const system = (von: number, bis: number) =>
    zeilen
      .map((felder, i) => {
        const teil = felder.slice(von, bis)
        // Eine Bindung an den Anfang einer Zeile zu setzen liest sich wie ein
        // Tippfehler: `|p5` behauptet einen Pull-off von einem Ton, der in
        // dieser Zeile gar nicht steht. Der Ton bleibt, das Zeichen geht.
        teil[0] = teil[0].replace(/^[hp]/, "-")
        return `${namen[i]}|${teil.join("")}|`
      })
      .join("\n")

  // Ein Takt sind acht Achtel — aber umgebrochen wird nur, wenn es sein muss.
  //
  // Zwei Systeme sind die Antwort auf das Handy, nicht auf die Tabulatur: in
  // der Standardbox bleibt jeder Bund einstellig, die Zeile wird 31 Zeichen
  // lang und passt überall. Sie trotzdem zu zerlegen sieht auf einem breiten
  // Schirm nach Fehler aus — ein halber zweiter Takt neben einem ganzen
  // ersten, und das ohne Not. Gemessen passen auf 320 px rund 33 Zeichen;
  // was darüber liegt, wird in Takte zerlegt, der Rest bleibt eine Zeile.
  const TAKT = 8
  const breite = 2 + spalten * spalte + 1
  if (spalten <= TAKT || breite <= PASST_AUFS_HANDY) return system(0, spalten)

  // Beim Umbruch steht jeder Takt für sich, und zwar ganz: ein zweiter Takt,
  // der nach dem letzten Ton einfach aufhört, wäre eine Zeile in halber
  // Länge neben einer vollen. Deshalb wird hier wieder aufgefüllt, was die
  // Schwanzkürzung oben weggenommen hat.
  for (const felder of zeilen) {
    while (felder.length < 2 * TAKT) felder.push("-".repeat(spalte))
  }
  return `${system(0, TAKT)}\n\n${system(TAKT, 2 * TAKT)}`
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
