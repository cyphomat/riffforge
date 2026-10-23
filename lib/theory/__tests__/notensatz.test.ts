import { describe, expect, it } from "vitest"
import { LINIE, OBEN, TAKT_BREITE, baueNotensatz, notenPosition, yVon } from "../notensatz"
import type { Dauer, Song, SongNote } from "../song"
import { SONGS } from "../songs"

/**
 * Wo im Bild was steht — geprüft ohne Bild.
 *
 * Die Rechnung ist rein, deshalb lässt sich nachweisen, was bei Noten
 * ausgerechnet schiefgeht: der falsche Platz auf der Linie, die fehlende
 * Hilfslinie, der Balken, der in die Luft zeigt.
 */

/** Die offenen Saiten, klingend: e4 = 64, h3 = 59, g3 = 55, d3 = 50, A2 = 45, E2 = 40. */
const KLINGEND = (name: "e" | "h" | "g" | "d" | "A" | "E") => ({ e: 64, h: 59, g: 55, d: 50, A: 45, E: 40 })[name]

describe("notenPosition", () => {
  it("setzt die Gitarre eine Oktave höher, als sie klingt", () => {
    // Offene hohe e-Saite klingt E4, geschrieben steht sie als E5: vierter Raum.
    expect(notenPosition(KLINGEND("e")).pos).toBe(7)
  })

  it("setzt die tiefe E-Saite unter das System, auf drei Hilfslinien", () => {
    // Klingend E2, geschrieben E3: Raum unter der dritten Hilfslinie.
    expect(notenPosition(KLINGEND("E")).pos).toBe(-7)
  })

  it("trifft die Linien des Violinschlüssels", () => {
    // Geschrieben E4 (unterste Linie), G4, B4 (mittlere), D5, F5 (oberste).
    expect([52, 55, 59, 62, 65].map((m) => notenPosition(m).pos)).toEqual([0, 2, 4, 6, 8])
  })

  it("trifft die Töne der Songs", () => {
    // A3, C4, D4, E4, G4 klingend → A4, C5, D5, E5, G5 geschrieben.
    expect([57, 60, 62, 64, 67].map((m) => notenPosition(m).pos)).toEqual([3, 5, 6, 7, 9])
  })

  it("schreibt ein Kreuz auf den Buchstaben darunter", () => {
    const ais = notenPosition(58)
    expect(ais.kreuz).toBe(true)
    expect(ais.pos).toBe(notenPosition(57).pos)
    expect(notenPosition(57).kreuz).toBe(false)
  })
})

describe("yVon", () => {
  it("liegt die oberste Linie auf OBEN und jede Position eine halbe Linie auseinander", () => {
    expect(yVon(8)).toBe(OBEN)
    expect(yVon(0)).toBe(OBEN + 4 * LINIE)
    expect(yVon(1) - yVon(2)).toBe(LINIE / 2)
  })
})

function note(klingend: number, start: number, dauer: Dauer): SongNote {
  // Auf der hohen e-Saite spielbar gemacht, damit der Griff zur Tonhöhe passt.
  return { griff: { saite: 1, bund: klingend - 64 }, start, dauer, artikulation: "normal" }
}

function song(noten: SongNote[], takte = 1): Song {
  return {
    grundton: "A",
    takte,
    noten,
    // Das Lernziel spielt für den Satz keine Rolle.
    lernziel: { toene: ["A"], abstaende: [], notenwerte: [1] },
  }
}

describe("Hilfslinien", () => {
  const kopfVon = (klingend: number) => baueNotensatz(song([note(klingend, 0, 2)])).systeme[0].takte[0].koepfe[0]

  it("braucht keine im System und nicht direkt darunter oder darüber", () => {
    // Geschrieben D4 (Raum unter der untersten Linie) und G5 (Raum über der obersten).
    expect(kopfVon(50).hilfslinien).toEqual([])
    expect(kopfVon(67).hilfslinien).toEqual([])
  })

  it("setzt eine, wenn der Kopf auf der ersten sitzt, und eine, wenn er darunter im Raum steht", () => {
    // Geschrieben C4 sitzt auf der Hilfslinie, H3 steht im Raum darunter.
    expect(kopfVon(48).hilfslinien).toEqual([yVon(-2)])
    expect(kopfVon(47).hilfslinien).toEqual([yVon(-2)])
  })

  it("setzt alle Linien zwischen System und Kopf", () => {
    // Geschrieben E3 (die tiefe E-Saite): drei Hilfslinien.
    expect(kopfVon(KLINGEND("E")).hilfslinien).toEqual([yVon(-2), yVon(-4), yVon(-6)])
  })

  it("setzt sie auch oberhalb des Systems", () => {
    // Geschrieben A5 auf der ersten, C6 auf der zweiten.
    expect(kopfVon(69).hilfslinien).toEqual([yVon(10)])
    expect(kopfVon(72).hilfslinien).toEqual([yVon(10), yVon(12)])
  })
})

describe("Köpfe und Hälse", () => {
  const takt = (noten: SongNote[]) => baueNotensatz(song(noten)).systeme[0].takte[0]

  it("füllt Viertel und Achtel, lässt Halbe und Ganze hohl", () => {
    const [v, h, g] = takt([note(57, 0, 2), note(57, 2, 4), note(57, 8 - 8, 8)]).koepfe
    expect(v.gefuellt).toBe(true)
    expect(h.gefuellt).toBe(false)
    expect(g.gefuellt).toBe(false)
  })

  it("gibt der Ganzen keinen Hals", () => {
    expect(takt([note(57, 0, 8)]).koepfe[0].hals).toBeNull()
  })

  it("lässt Hälse unterhalb der Mittellinie nach oben zeigen und ab ihr nach unten", () => {
    // Geschrieben A4 (pos 3) → auf, H4 (pos 4, Mittellinie) → ab, D5 (pos 6) → ab.
    const [a, h, d] = takt([note(57, 0, 2), note(59, 2, 2), note(62, 4, 2)]).koepfe
    expect([a.richtung, h.richtung, d.richtung]).toEqual(["auf", "ab", "ab"])
  })

  it("setzt den Hals rechts vom Kopf, wenn er nach oben zeigt, und links, wenn nach unten", () => {
    const [auf, ab] = takt([note(57, 0, 2), note(62, 2, 2)]).koepfe
    expect(auf.hals?.x).toBeGreaterThan(auf.x)
    expect(ab.hals?.x).toBeLessThan(ab.x)
  })

  it("macht Hälse mindestens dreieinhalb Linienabstände lang, und bis zur Mittellinie bei weit entfernten Köpfen", () => {
    const [normal, tief, hoch] = takt([note(57, 0, 2), note(KLINGEND("E"), 2, 2), note(72, 4, 2)]).koepfe
    const laenge = (k: typeof normal) => Math.abs((k.hals?.bis ?? 0) - (k.hals?.von ?? 0))
    expect(laenge(normal)).toBeGreaterThanOrEqual(3.5 * LINIE)
    // Der tiefste Ton zeigt nach oben und reicht mindestens bis an die Mittellinie.
    expect(tief.hals?.bis).toBeLessThanOrEqual(yVon(4))
    expect(hoch.hals?.bis).toBeGreaterThanOrEqual(yVon(4))
  })

  it("rückt die Köpfe proportional zur Zeit auseinander", () => {
    const [eins, drei] = takt([note(57, 0, 4), note(60, 4, 4)]).koepfe
    // Vier Achtel Abstand, sechzehn Einheiten je Achtel.
    expect(drei.x - eins.x).toBe(4 * 16)
  })
})

describe("Balken und Fähnchen", () => {
  const takt = (noten: SongNote[]) => baueNotensatz(song(noten)).systeme[0].takte[0]

  it("verbindet zwei Achtel auf einem Schlag", () => {
    const t = takt([note(57, 0, 1), note(60, 1, 1)])
    expect(t.balken).toHaveLength(1)
    expect(t.koepfe.every((k) => !k.fahne)).toBe(true)
  })

  it("verbindet nicht über den Schlag hinweg", () => {
    // Achtel auf 1 und 2 liegen in zwei verschiedenen Schlägen.
    const t = takt([note(57, 1, 1), note(60, 2, 1)])
    expect(t.balken).toHaveLength(0)
    expect(t.koepfe.every((k) => k.fahne)).toBe(true)
  })

  it("gibt einem einzelnen Achtel ein Fähnchen", () => {
    const t = takt([note(57, 0, 1), note(60, 2, 2)])
    expect(t.balken).toHaveLength(0)
    expect(t.koepfe[0].fahne).toBe(true)
    expect(t.koepfe[1].fahne).toBe(false)
  })

  it("lässt die Hälse eines Paares am Balken enden", () => {
    const t = takt([note(57, 0, 1), note(62, 1, 1)])
    const [a, b] = t.koepfe
    expect(t.balken[0]).toEqual({ x1: a.hals?.x, y1: a.hals?.bis, x2: b.hals?.x, y2: b.hals?.bis })
  })

  it("lässt beide Hälse eines Paares in dieselbe Richtung zeigen", () => {
    // A4 (unter der Mitte) mit D5 (darüber): D5 ist weiter weg und gewinnt.
    const [a, b] = takt([note(57, 0, 1), note(62, 1, 1)]).koepfe
    expect(a.richtung).toBe(b.richtung)
    expect(a.richtung).toBe("ab")
  })

  it("hält den Balken flach, auch wenn die Töne weit auseinander liegen", () => {
    const t = takt([note(57, 0, 1), note(67, 1, 1)])
    const { y1, y2 } = t.balken[0]
    expect(Math.abs(y2 - y1)).toBeLessThanOrEqual(0.75 * LINIE)
  })

  it("lässt keinen Hals kürzer als verlangt, wenn der Balken flach gedrückt wird", () => {
    const [a, b] = takt([note(57, 0, 1), note(67, 1, 1)]).koepfe
    for (const kopf of [a, b]) {
      const hals = kopf.hals
      expect(hals).not.toBeNull()
      if (!hals) continue
      // Richtung ist nach unten: die Spitze liegt unter dem Kopf.
      expect(kopf.richtung).toBe("ab")
      expect(hals.bis - hals.von).toBeGreaterThanOrEqual(Math.min(3.5 * LINIE, yVon(4) - kopf.y))
    }
  })
})

describe("Pausen", () => {
  it("setzt sie an den Platz, an dem die Note stünde", () => {
    const satz = baueNotensatz(song([note(57, 0, 2), note(57, 4, 4)]))
    const takt = satz.systeme[0].takte[0]
    expect(takt.pausen).toEqual([{ x: takt.x + 10 + 2 * 16 + 6, y: yVon(4), dauer: 2 }])
  })

  it("hängt die ganze Pause an die vierte Linie", () => {
    const satz = baueNotensatz(song([note(57, 8, 1)], 2))
    const [pause] = satz.systeme[0].takte[0].pausen
    expect(pause.dauer).toBe(8)
    expect(pause.y).toBe(yVon(6))
  })

  it("setzt die ganze Pause in die Mitte des Takts", () => {
    const satz = baueNotensatz(song([note(57, 8, 1)], 2))
    const takt = satz.systeme[0].takte[0]
    // Der Inhalt des Takts läuft von RAND_LINKS (10) über acht Achtel zu je 16.
    expect(takt.pausen[0].x).toBe(takt.x + 10 + 4 * 16)
  })
})

describe("Systeme", () => {
  const satz2 = baueNotensatz(song([note(57, 0, 8)], 2))
  const satz4 = baueNotensatz(song([note(57, 0, 8)], 4))

  it("setzt zwei Takte auf ein System, wenn nichts anderes gesagt ist", () => {
    expect(satz2.systeme).toHaveLength(1)
    expect(satz4.systeme).toHaveLength(2)
    expect(satz4.systeme.map((s) => s.takte.length)).toEqual([2, 2])
  })

  it("kann auch einen Takt je Zeile setzen", () => {
    expect(baueNotensatz(song([note(57, 0, 8)], 4), 1).systeme).toHaveLength(4)
  })

  it("zeigt die Taktangabe nur im ersten System", () => {
    expect(satz4.systeme.map((s) => s.taktart)).toEqual([true, false])
  })

  it("stapelt die Systeme untereinander", () => {
    expect(satz4.systeme[0].y0).toBe(0)
    expect(satz4.systeme[1].y0).toBeGreaterThan(0)
    expect(satz4.hoehe).toBeGreaterThan(satz4.systeme[1].y0)
  })

  it("macht das Bild so breit wie das breiteste System", () => {
    expect(satz4.breite).toBe(Math.max(...satz4.systeme.map((s) => s.breite)))
  })

  it("legt die Takte lückenlos nebeneinander", () => {
    const [eins, zwei] = satz4.systeme[0].takte
    expect(zwei.x - eins.x).toBe(TAKT_BREITE)
  })

  it("gibt nur dem letzten Takt den Schlussstrich", () => {
    const flach = satz4.systeme.flatMap((s) => s.takte)
    expect(flach.map((t) => t.schluss)).toEqual([false, false, false, true])
  })
})

describe.each(SONGS.map((e) => [e.id, e.song] as const))("%s", (_id, eintrag) => {
  const satz = baueNotensatz(eintrag)
  const koepfe = satz.systeme.flatMap((s) => s.takte.flatMap((t) => t.koepfe))

  it("setzt jede Note genau einmal", () => {
    expect(koepfe.map((k) => k.note).sort((a, b) => a - b)).toEqual(eintrag.noten.map((_, i) => i))
  })

  it("bleibt im Bild", () => {
    for (const system of satz.systeme) {
      for (const kopf of system.takte.flatMap((t) => t.koepfe)) {
        expect(kopf.x).toBeGreaterThan(0)
        expect(kopf.x).toBeLessThan(system.breite)
        expect(kopf.y).toBeGreaterThan(0)
        expect(kopf.hals?.bis ?? 0).toBeGreaterThanOrEqual(0)
      }
    }
    expect(satz.hoehe).toBeGreaterThan(satz.namenY)
  })

  it("braucht keine Hilfslinien", () => {
    expect(koepfe.every((k) => k.hilfslinien.length === 0)).toBe(true)
  })

  it("benennt jeden Kopf nach seinem Ton", () => {
    expect(koepfe.every((k) => /^[A-G]$/.test(k.name))).toBe(true)
  })
})
