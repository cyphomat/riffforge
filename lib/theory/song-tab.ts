import type { Song } from "./song"
import { ACHTEL_JE_TAKT } from "./song"

/**
 * Die Tabulatur eines Songs, aus denselben Noten wie die Notenschrift.
 *
 * Gleiche Bauart wie `tabOf` beim Lick: eine Spalte je Achtel, die Bünde
 * stehen dort, wo die Note beginnt. Wie lang sie klingt, zeigt eine Tabulatur
 * nicht — dafür gibt es daneben die Notenschrift. Pausen bleiben leer.
 *
 * Auf das Handy passen rund 33 Zeichen (im Browser bei 320 px gemessen, siehe
 * `lick.ts`). Deshalb steht ein Takt auf einer Zeile, sobald zwei nicht mehr
 * passen — mit zweistelligen Bünden schon bei einem halben Takt weniger.
 */

const PASST_AUFS_HANDY = 33
const SAITEN = ["e", "B", "G", "D", "A", "E"]

/**
 * Die Tabulatur als eine Zeichenfolge je System, in der Reihenfolge der
 * Notenschrift. `proZeile` zwingt eine Zeilenbreite auf — der Notensatz setzt
 * je nach Platz einen oder zwei Takte, und jedes System soll genau seine Takte
 * darunter haben. Ohne Angabe rechnet die Funktion, wie viele aufs Handy passen.
 */
export function songTabSysteme(song: Song, proZeile?: number): string[] {
  const breiteste = Math.max(...song.noten.map((n) => `${n.griff.bund}`.length))
  const spalte = breiteste + 1

  // Je Saite und Takt eine Zeichenfolge aus acht Spalten.
  const takt = (index: number): string[] => {
    const anfang = index * ACHTEL_JE_TAKT
    return [1, 2, 3, 4, 5, 6].map((saite) => {
      const felder = Array.from({ length: ACHTEL_JE_TAKT }, () => "-".repeat(spalte))
      for (const note of song.noten) {
        if (note.griff.saite !== saite) continue
        if (note.start < anfang || note.start >= anfang + ACHTEL_JE_TAKT) continue
        felder[note.start - anfang] = `${note.griff.bund}`.padStart(spalte, "-")
      }
      return felder.join("")
    })
  }

  const breiteJeTakt = ACHTEL_JE_TAKT * spalte + 1
  const jeZeile = proZeile ?? Math.max(1, Math.floor((PASST_AUFS_HANDY - 2) / breiteJeTakt))

  const systeme: string[] = []
  for (let ab = 0; ab < song.takte; ab += jeZeile) {
    const takte = Array.from({ length: Math.min(jeZeile, song.takte - ab) }, (_, i) => takt(ab + i))
    systeme.push(SAITEN.map((name, saite) => `${name}|${takte.map((t) => t[saite]).join("|")}|`).join("\n"))
  }
  return systeme
}

export function songTab(song: Song): string {
  return songTabSysteme(song).join("\n\n")
}
