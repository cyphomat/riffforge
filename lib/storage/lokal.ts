"use client"

import { z } from "zod"
import { BOX_STANDARD, GRUNDTOENE, LAGEN, type LickBox } from "@/lib/session/lead"
import { STANDARD_GITARREN, gitarrenSchema, type Gitarre } from "@/lib/session/gitarren"
import { gehoert, LEERES_BUCH, riffbuchSchema, type Riffbuch } from "@/lib/session/riffbuch"
import {
  abschnittGeuebt,
  repertoireAusText,
  repertoireSchema,
  songEntfernen,
  songSpeichern,
  statusSetzen,
  type AbschnittStatus,
  type Repertoire,
  type RepertoireSong,
} from "@/lib/session/repertoire"
import { zusammenfuehren } from "@/lib/session/repertoire-datei"
import { boardWahlSchema, STANDARD_WAHL, type BoardWahl } from "@/lib/session/board"
import { sessionStandSchema, type SessionStand } from "@/lib/session/session-stand"
import { aufgezogen, gespielt, LEERES_SAITENBUCH, saitenBuchSchema, type SaitenBuch } from "@/lib/session/saiten"
import { alsDarstellung, DARSTELLUNG_EREIGNIS, DARSTELLUNG_KEY, type Darstellung } from "@/lib/ui/darstellung"

/**
 * Was die App über sich selbst weiss, nicht über das Üben.
 *
 * Zwei Kleinigkeiten, die kein Log sind und deshalb auch nicht verschmolzen
 * werden: wann zuletzt gesichert wurde, und ob der Willkommens-Schirm schon
 * gelaufen ist. Beides gehört diesem Gerät und nur diesem — ein Abgleich
 * müsste sich sonst einigen, wessen Sicherung „die letzte" ist, und das ist
 * keine Frage mit einer richtigen Antwort.
 *
 * Wie überall gilt: der Löschen-Weg muss beides wieder loswerden. `clearLokal`
 * steht deshalb in derselben Liste wie `clearLog` und `clearProfile`.
 */

const GESICHERT_KEY = "mga.zuletzt-gesichert.v1"
const WILLKOMMEN_KEY = "mga.willkommen.v1"
const LICK_KEY = "mga.lick-seed.v1"
const BOX_KEY = "mga.lick-box.v1"
const EINMESS_KEY = "mga.einmessung.v1"
const SAITEN_KEY = "mga.saiten.v1"
const SAISONAL_KEY = "mga.saisonal.v1"
const VERSTECKT_KEY = "mga.saisonal-versteckt.v1"
const SESSION_KEY = "mga.session-stand.v1"
const GITARREN_KEY = "mga.gitarren.v1"
const DROP_KEY = "mga.drop-gesehen.v1"
const BOARD_KEY = "mga.board.v1"
const RIFFBUCH_KEY = "mga.riffbuch.v1"
const REPERTOIRE_KEY = "mga.repertoire.v1"
const REPERTOIRE_KAPUTT_KEY = `${REPERTOIRE_KEY}.broken`

/** Alle Schlüssel dieses Moduls. `clearLokal` muss jeden erwischen. */
const OWN_KEYS = [GESICHERT_KEY, WILLKOMMEN_KEY, LICK_KEY, BOX_KEY, EINMESS_KEY, SAITEN_KEY, DARSTELLUNG_KEY, SAISONAL_KEY, VERSTECKT_KEY, SESSION_KEY, GITARREN_KEY, DROP_KEY, BOARD_KEY, RIFFBUCH_KEY, REPERTOIRE_KEY, REPERTOIRE_KAPUTT_KEY]

function lesen(key: string): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(key)
  } catch {
    // Privater Modus oder volle Ablage: kein Grund, die App anzuhalten.
    return null
  }
}

/** Says whether the write went through; most callers can do without knowing. */
function schreiben(key: string, wert: string): boolean {
  if (typeof window === "undefined") return false
  try {
    window.localStorage.setItem(key, wert)
    return true
  } catch {
    /* Nicht schlimm — die Erinnerung kommt dann eben wieder. */
    return false
  }
}

/** Wann zuletzt eine Sicherungsdatei heruntergeladen wurde. */
export function zuletztGesichert(): Date | null {
  const roh = lesen(GESICHERT_KEY)
  if (!roh) return null
  const zeit = Date.parse(roh)
  return Number.isNaN(zeit) ? null : new Date(zeit)
}

export function merkeSicherung(now: Date = new Date()): void {
  schreiben(GESICHERT_KEY, now.toISOString())
}

/** Hat dieses Gerät den Willkommens-Schirm schon gesehen? */
export function willkommenGesehen(): boolean {
  return lesen(WILLKOMMEN_KEY) !== null
}

export function merkeWillkommen(): void {
  schreiben(WILLKOMMEN_KEY, new Date().toISOString())
}

/**
 * Welches Lick gerade dran ist.
 *
 * Gehört diesem Gerät: es ist kein Übungsergebnis, sondern ein Lesezeichen.
 * Ein Abgleich müsste sich sonst einigen, welches Lick „das aktuelle" ist,
 * und das ist keine Frage mit einer richtigen Antwort.
 */
export function lickSeed(): number {
  const roh = lesen(LICK_KEY)
  const zahl = roh === null ? NaN : Number(roh)
  return Number.isFinite(zahl) && zahl > 0 ? zahl : 1
}

export function merkeLickSeed(seed: number): void {
  schreiben(LICK_KEY, `${seed}`)
}

/**
 * In welcher Box die Licks gebaut werden: Grundton und Lage.
 *
 * Auch das ist ein Lesezeichen und kein Übungsergebnis — es gehört diesem
 * Gerät. Wer auf dem Handy an Lage 2 arbeitet und am Rechner an Lage 4, will
 * keinen Abgleich, der sich für eine entscheidet.
 *
 * Geprüft wird gegen die Aufzählungen, nicht nur auf den Typ: aus einem
 * `lage: 9` käme sonst eine leere Box und daraus ein Lick ohne Töne. Was
 * nicht passt, fällt auf den Standard zurück — hier ist Wegwerfen richtig,
 * anders als beim Log, wo ein kaputter Stand beiseitegelegt wird.
 */
export function lickBox(): LickBox {
  const roh = lesen(BOX_KEY)
  if (!roh) return BOX_STANDARD
  try {
    const wert = JSON.parse(roh) as Partial<LickBox>
    const grundton = GRUNDTOENE.find((ton) => ton === wert.grundton)
    const lage = LAGEN.find((l) => l === wert.lage)
    if (!grundton || !lage) return BOX_STANDARD
    return { grundton, lage }
  } catch {
    return BOX_STANDARD
  }
}

export function merkeLickBox(box: LickBox): void {
  schreiben(BOX_KEY, JSON.stringify(box))
}


/**
 * Wann welche Gitarre neue Saiten bekam und an welchen Tagen sie dran war.
 *
 * Gehört dem Gerät, nicht dem Log: ein Wartungsdatum ist keine Übung, und im
 * Log würde es als Gig gezählt. `lib/session/saiten.ts` rechnet beides
 * zusammen; ein Eintrag von früher (nur `gewechselt`) bleibt lesbar.
 */
export function saitenBuch(): SaitenBuch {
  const roh = lesen(SAITEN_KEY)
  if (!roh) return LEERES_SAITENBUCH
  try {
    const geprueft = saitenBuchSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : LEERES_SAITENBUCH
  } catch {
    return LEERES_SAITENBUCH
  }
}

export function merkeSaitenwechsel(gitarre: string | null, tag: string): void {
  schreiben(SAITEN_KEY, JSON.stringify(aufgezogen(saitenBuch(), gitarre, tag)))
}

export function merkeGespielt(gitarre: string, tag: string): void {
  schreiben(SAITEN_KEY, JSON.stringify(gespielt(saitenBuch(), gitarre, tag)))
}

/**
 * Die eingemessene Latenz dieses Geräts.
 *
 * Gehört diesem Gerät und nur diesem — sie *ist* das Gerät: Lautsprecher,
 * Mikrofon, Puffer. Ein Abgleich, der die Latenz vom Rechner aufs iPhone
 * trüge, machte die Messung dort falsch statt besser. Deshalb weder im
 * Datenrepo noch in der Sicherungsdatei.
 *
 * Kaputtes wird hier verworfen, nicht beiseitegelegt: eine Einmessung ist in
 * zwanzig Sekunden neu gemacht, und eine falsche wäre schlimmer als keine.
 */
export const einmessungSchema = z.object({
  ms: z.number().int().min(-200).max(600),
  art: z.enum(["lautsprecher", "anschlag"]),
  streuungMs: z.number().min(0),
  at: z.string(),
})

export type Einmessung = z.infer<typeof einmessungSchema>

export function einmessung(): Einmessung | null {
  const roh = lesen(EINMESS_KEY)
  if (!roh) return null
  try {
    const geprueft = einmessungSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : null
  } catch {
    return null
  }
}

export function merkeEinmessung(wert: Einmessung): void {
  schreiben(EINMESS_KEY, JSON.stringify(einmessungSchema.parse(wert)))
}

export function vergissEinmessung(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(EINMESS_KEY)
  } catch {
    /* Nichts zu vergessen. */
  }
}

/**
 * Hell, dunkel, oder wie das System.
 *
 * Gehört dem Gerät: am Rechner im hellen Raum hell, auf dem Handy am Abend
 * dunkel — ein Abgleich, der das von einem aufs andere trüge, wäre falsch.
 * Gespeichert als blosses Wort, weil das Skript in `lib/ui/darstellung.ts`
 * es vor dem ersten Anstrich ohne Zod lesen muss; was dort nicht `hell` oder
 * `dunkel` heisst, ist Auto.
 */
export function darstellung(): Darstellung {
  return alsDarstellung(lesen(DARSTELLUNG_KEY))
}

/** Speichert die Wahl und sagt dem Skript im Kopf der Seite Bescheid, damit es sie gleich anwendet. */
export function merkeDarstellung(wert: Darstellung): void {
  if (typeof window === "undefined") return
  if (wert === "auto") {
    try {
      window.localStorage.removeItem(DARSTELLUNG_KEY)
    } catch {
      /* Dann bleibt es eben bei der letzten Wahl. */
    }
  } else schreiben(DARSTELLUNG_KEY, wert)
  window.dispatchEvent(new Event(DARSTELLUNG_EREIGNIS))
}

/**
 * Der Banner zu Weihnachten und anderen Anlässen (`lib/session/anlaesse.ts`).
 *
 * Gehört dem Gerät, wie die Darstellung: an, solange nicht ausdrücklich
 * abgeschaltet. Gespeichert wird nur das Abschalten — der Normalfall braucht
 * keinen Eintrag, und ein leerer Speicher heisst "an".
 */
export function saisonalAn(): boolean {
  return lesen(SAISONAL_KEY) !== "aus"
}

/** Wieder einschalten holt auch einen für heute ausgeblendeten Banner zurück. */
export function merkeSaisonal(an: boolean): void {
  if (typeof window === "undefined") return
  if (an) {
    try {
      window.localStorage.removeItem(SAISONAL_KEY)
      window.localStorage.removeItem(VERSTECKT_KEY)
    } catch {
      /* Dann bleibt es eben bei der letzten Wahl. */
    }
  } else schreiben(SAISONAL_KEY, "aus")
}

/** "Für heute ausblenden" gilt nur für diesen Kalendertag (`JJJJ-MM-TT`). */
export function anlassVersteckt(tag: string): boolean {
  return lesen(VERSTECKT_KEY) === tag
}

export function verstecke(tag: string): void {
  schreiben(VERSTECKT_KEY, tag)
}

/**
 * Die Gitarren für die Roulette (`lib/session/gitarren.ts`).
 *
 * Gehört dem Gerät, wie die Darstellung: das Rack zu Hause ist nicht das auf
 * dem Handy im Proberaum, und ein Abgleich müsste sich für eines entscheiden.
 * Kein Eintrag heisst Standardliste; ein gespeicherter leerer Stand heisst
 * ausdrücklich keine — dann würfelt die App nicht. Kaputtes fällt auf den
 * Standard zurück: eine Liste ist in einer halben Minute neu getippt.
 */
export function gitarren(): Gitarre[] {
  const roh = lesen(GITARREN_KEY)
  if (!roh) return STANDARD_GITARREN
  try {
    const geprueft = gitarrenSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : STANDARD_GITARREN
  } catch {
    return STANDARD_GITARREN
  }
}

export function merkeGitarren(liste: Gitarre[]): void {
  schreiben(GITARREN_KEY, JSON.stringify(gitarrenSchema.parse(liste)))
}

/** Zurück auf die Standardliste: der Eintrag wird entfernt, nicht überschrieben. */
export function vergissGitarren(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(GITARREN_KEY)
  } catch {
    /* Nichts zu vergessen. */
  }
}

/**
 * Welcher Drop (`lib/session/drops.ts`) auf *Heute* schon gesehen wurde.
 *
 * Gehört dem Gerät: ob die Karte noch auffällt, ist keine Frage für den
 * Abgleich, und der Gurt selbst fällt ohnehin aus dem Log.
 */
export function dropGesehen(): string | null {
  const roh = lesen(DROP_KEY)
  return roh && /^\d{4}-\d{2}$/.test(roh) ? roh : null
}

export function merkeDropGesehen(id: string): void {
  if (/^\d{4}-\d{2}$/.test(id)) schreiben(DROP_KEY, id)
}

export function clearLokal(): void {
  if (typeof window === "undefined") return
  try {
    for (const key of OWN_KEYS) window.localStorage.removeItem(key)
  } catch {
    /* Nichts Lesbares zu löschen. */
  }
}

/**
 * Wo die laufende Session steht (siehe `lib/session/session-stand.ts`).
 *
 * Gehört diesem Gerät und nur diesem, wird nicht abgeglichen. Kaputtes wird
 * verworfen: ein verlorener Stand heisst, dass die Session neu beginnt, wie
 * ohne ihn.
 */
export function sessionStand(): SessionStand | null {
  const roh = lesen(SESSION_KEY)
  if (!roh) return null
  try {
    const geprueft = sessionStandSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : null
  } catch {
    return null
  }
}

export function merkeSessionStand(stand: SessionStand): void {
  schreiben(SESSION_KEY, JSON.stringify(sessionStandSchema.parse(stand)))
}

export function vergissSessionStand(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    /* Nichts zu vergessen. */
  }
}

/**
 * Die Wahl am Board: was ausgeschaltet ist und welcher Amp steht.
 *
 * Gehört dem Gerät, wie das Rack — am Handy im Proberaum steht ein anderes
 * Board als zu Hause, und ein Abgleich müsste sich für eines entscheiden. Der
 * Besitz dagegen fällt aus dem Log. Kaputtes fällt auf die Standardwahl zurück.
 */
export function boardWahl(): BoardWahl {
  const roh = lesen(BOARD_KEY)
  if (!roh) return STANDARD_WAHL
  try {
    const geprueft = boardWahlSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : STANDARD_WAHL
  } catch {
    return STANDARD_WAHL
  }
}

export function merkeBoardWahl(wahl: BoardWahl): void {
  schreiben(BOARD_KEY, JSON.stringify(boardWahlSchema.parse(wahl)))
}

/**
 * Das Riffbuch: welche Riffe auf diesem Gerät schon ganz erklungen sind.
 *
 * Gehört dem Gerät und wird nicht abgeglichen (siehe `lib/session/riffbuch.ts`).
 * Kaputtes fällt auf ein leeres Buch zurück: es ist eine Hörliste, kein Verdienst.
 */
export function riffbuch(): Riffbuch {
  const roh = lesen(RIFFBUCH_KEY)
  if (!roh) return LEERES_BUCH
  try {
    const geprueft = riffbuchSchema.safeParse(JSON.parse(roh))
    return geprueft.success ? geprueft.data : LEERES_BUCH
  } catch {
    return LEERES_BUCH
  }
}

/** Trägt ein Riff ein, wenn es noch fehlt. */
export function merkeRiffGehoert(id: string, jetzt: Date = new Date()): void {
  const buch = riffbuch()
  const neu = gehoert(buch, id, jetzt)
  if (neu !== buch) schreiben(RIFFBUCH_KEY, JSON.stringify(riffbuchSchema.parse(neu)))
}

/**
 * Das Repertoire (`lib/session/repertoire.ts`): echte Songs und ihr Lernstand.
 *
 * Gehört dem Gerät, wird nicht abgeglichen und steht nicht in der Sicherung;
 * mitgenommen wird es als eigene Datei (`repertoire-datei.ts`).
 * Anders als beim Riffbuch ist das Handarbeit: Kaputtes wird beiseitegelegt,
 * und gelingt das nicht, wird auch nicht darübergeschrieben.
 */
function repertoireLesen(): { repertoire: Repertoire; schreibbar: boolean } {
  const roh = lesen(REPERTOIRE_KEY)
  const { repertoire, kaputt } = repertoireAusText(roh)
  const schreibbar = !kaputt || schreiben(REPERTOIRE_KAPUTT_KEY, roh as string)
  return { repertoire, schreibbar }
}

export function repertoire(): Repertoire {
  return repertoireLesen().repertoire
}

/** `false`: nothing changed, either because the change was refused or because storage failed. */
function repertoireAendern(aendern: (alt: Repertoire) => Repertoire): boolean {
  const { repertoire: alt, schreibbar } = repertoireLesen()
  const neu = aendern(alt)
  if (!schreibbar || neu === alt) return false
  return schreiben(REPERTOIRE_KEY, JSON.stringify(repertoireSchema.parse(neu)))
}

export function merkeSong(song: RepertoireSong, jetzt: Date = new Date()): boolean {
  return repertoireAendern((alt) => songSpeichern(alt, song, jetzt))
}

export function vergissSong(songId: string): boolean {
  return repertoireAendern((alt) => songEntfernen(alt, songId))
}

export function merkeAbschnittGeuebt(songId: string, abschnittId: string, status: AbschnittStatus, jetzt: Date = new Date()): boolean {
  return repertoireAendern((alt) => abschnittGeuebt(alt, songId, abschnittId, status, jetzt))
}

export function merkeAbschnittStatus(songId: string, abschnittId: string, status: AbschnittStatus, jetzt: Date = new Date()): boolean {
  return repertoireAendern((alt) => statusSetzen(alt, songId, abschnittId, status, jetzt))
}

/**
 * Lays an imported file over what is here. Merged again at this moment, so a
 * change made while the preview was open is not lost. A file that changes
 * nothing counts as done.
 */
export function importiereRepertoire(datei: Repertoire): boolean {
  if (!zusammenfuehren(repertoire(), datei).aendert) return true
  return repertoireAendern((alt) => zusammenfuehren(alt, datei).repertoire)
}
