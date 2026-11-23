import { midiVon, type Figur } from "../theory/drill-spiel"

/**
 * Wann was erklingt — für einen Durchgang durch die Figur eines Drills, in
 * Sekunden. Rein wie `song-ablauf.ts`: der Player (`drill-player.ts`) schiebt
 * diese Zeiten nur noch auf die Uhr des AudioContext.
 *
 * BPM zählt Schläge. Ein Schritt der Figur ist `1 / raster` davon.
 */

/** Ein Schlag je Klick; vier Schläge sind ein Takt, wie überall in der App. */
export const SCHLAEGE_JE_TAKT = 4

/** Ein Palm Mute klingt nur kurz: länger als das ist es ein offener Ton. */
export const DUMPF_S = 0.11
/** Ein toter Anschlag ist ein Klacken, kein Ton. */
export const TOT_S = 0.05
/** Wie lange ein Slide unterwegs ist, höchstens, und wie lange ein Bending. */
export const SLIDE_S = 0.12
export const BEND_S = 0.3

export interface DrillTon {
  start: number
  /** Wann die Note abgedämpft wird; was danach ausklingt, ist Nachklang. */
  ende: number
  /** Die klingenden Töne (MIDI); bei einem toten Anschlag leer. */
  midis: number[]
  tot: boolean
  dumpf: boolean
  /** 1 = voller Anschlag. Schläge sind lauter als Zwischenschritte — daran hört man den Takt. */
  laut: number
  /** Slide oder Bending: ab wann und wie lange, und um wie viele Halbtöne die Note wandert. */
  gleiten?: { ab: number; dauer: number; halbtoene: number }
}

export interface DrillKlick {
  zeit: number
  betont: boolean
  /** Ein Klick zwischen den Schlägen: leiser, wie im Metronom des Blocks. */
  nebenschlag: boolean
}

export interface DrillAblauf {
  /** Länge eines Durchgangs: ganze Schritte der Figur, damit eine Schleife nahtlos anschließt. */
  dauer: number
  toene: DrillTon[]
  /** Die Klicks des Blocks: je Schlag so viele, wie der Drill `subdivision` hat. */
  klicks: DrillKlick[]
}

/** Sekunden je Schritt der Figur. */
export function schrittSekunden(bpm: number, raster: number): number {
  return 60 / bpm / raster
}

/**
 * Die Klicks für ganze Schläge, so dicht wie das Metronom im Block: bei
 * `subdivision` 2 klickt es auf jedem Achtel. Wer sich das Gehörte danach im
 * Block zum Klick spielt, hört denselben Klick; ein Klick nur auf den Vierteln
 * ließe ein Achtel-Drill doppelt so schnell wirken, als er im Block läuft.
 */
export function klickzeiten(schlaege: number, bpm: number, subdivision: number): DrillKlick[] {
  const proTakt = SCHLAEGE_JE_TAKT * subdivision
  return Array.from({ length: schlaege * subdivision }, (_, k) => ({
    zeit: (k * schrittSekunden(bpm, 1)) / subdivision,
    betont: k % proTakt === 0,
    nebenschlag: k % subdivision !== 0,
  }))
}

export function bauDrillAblauf(figur: Figur, bpm: number, subdivision = 1): DrillAblauf {
  const schritt = schrittSekunden(bpm, figur.raster)
  const dauer = figur.schritte * schritt
  const toene: DrillTon[] = []
  const anschlaege = figur.anschlaege

  anschlaege.forEach((a, i) => {
    if (a.folge) {
      // Ein Slide oder Bending ist kein Anschlag: die Note davor wandert zum neuen Griff.
      // Das Ziel rechnet immer vom Anschlag der Note, auch nach einer Kette.
      const davor = toene[toene.length - 1]
      const nach = midiVon(a.griffe[0])
      if (davor && davor.midis.length > 0 && nach !== null) {
        davor.gleiten = {
          ab: a.schritt * schritt,
          dauer: Math.min(a.folge === "bend" ? BEND_S : SLIDE_S, schritt),
          halbtoene: nach - davor.midis[0],
        }
      }
      return
    }

    const midis = a.griffe.map(midiVon).filter((m): m is number => m !== null)
    const tot = midis.length === 0
    const start = a.schritt * schritt
    // Bis zum nächsten Anschlag klingt die Note weiter — auch über leere Schritte —,
    // und ein Slide oder Bending dazwischen gehört noch zu ihr.
    const naechster = anschlaege.slice(i + 1).find((n) => !n.folge)
    const bis = naechster ? naechster.schritt * schritt : dauer
    let ende = bis
    if (tot) ende = Math.min(bis, start + TOT_S)
    else if (a.dumpf) ende = Math.min(bis, start + DUMPF_S)

    const aufSchlag = a.schritt % figur.raster === 0
    toene.push({
      start,
      ende,
      midis,
      tot,
      dumpf: a.dumpf,
      laut: tot ? 0.55 : a.gebunden ? 0.6 : aufSchlag ? 1 : 0.78,
    })
  })

  const schlaege = Math.round(figur.schritte / figur.raster)
  return {
    dauer,
    toene,
    klicks: klickzeiten(schlaege, bpm, subdivision),
  }
}
