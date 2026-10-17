import { dayKey } from "./progress"
import type { PracticeLog } from "./types"

export interface CalendarDay {
  /** YYYY-MM-DD, lokale Zeit. */
  key: string
  date: Date
  /** Gespielte Minuten an diesem Tag. 0 heisst: nicht geübt. */
  minutes: number
  isToday: boolean
  /** Tage nach heute in der laufenden Woche — das Raster ist immer voll. */
  isFuture: boolean
}

export interface CalendarOptions {
  weeks?: number
  now?: Date
}

/** Weniger ergibt kein Muster — eine Woche Kästchen ist keine Auskunft. */
const MIN_WOCHEN = 4
/** Vier Monate. Mehr wird auf dem Handy ein Streifen. */
const MAX_WOCHEN = 16

/**
 * Wie weit der Rückblick reicht: so weit, wie es Verlauf gibt.
 *
 * Ein fester Rahmen von sechzehn Wochen zeigt einem Wiedereinsteiger
 * hundertzwölf leere Kästchen und darunter „0 von 112 Tagen" — ein Raster,
 * das die halbe Spalte einnimmt, um nichts zu sagen. Das Raster wächst
 * deshalb mit dem Log und steht erst nach vier Monaten wieder voll da.
 */
export function weeksFor(log: PracticeLog, now = new Date()): number {
  if (log.results.length === 0) return MIN_WOCHEN

  const aeltester = log.results.reduce(
    (bisher, result) => Math.min(bisher, new Date(result.at).getTime()),
    Infinity,
  )
  if (!Number.isFinite(aeltester)) return MIN_WOCHEN

  const wochen = weeksBetween(new Date(aeltester), now) + 1
  return Math.min(MAX_WOCHEN, Math.max(MIN_WOCHEN, wochen))
}

/** Volle Kalenderwochen zwischen zwei Tagen, beide auf ihren Montag gelegt. */
function weeksBetween(von: Date, bis: Date): number {
  const montag = (datum: Date) => {
    const d = new Date(datum)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - mondayIndex(d))
    return d.getTime()
  }
  // Gerundet, nicht abgeschnitten: eine Zeitumstellung verschiebt die
  // Differenz um eine Stunde, und das darf keine Woche kosten.
  return Math.max(0, Math.round((montag(bis) - montag(von)) / (7 * 24 * 3600 * 1000)))
}

/**
 * Das Raster für den Übungskalender.
 *
 * Sieben Zeilen (Montag oben), eine Spalte je Woche — die Reihenfolge ist
 * deshalb spaltenweise, passend zu `grid-auto-flow: column`. Die laufende
 * Woche wird bis Sonntag aufgefüllt, damit das Raster nicht ausfranst; die
 * Tage danach sind als Zukunft markiert.
 */
export function practiceCalendar(log: PracticeLog, options: CalendarOptions = {}): CalendarDay[] {
  const now = options.now ?? new Date()
  const weeks = options.weeks ?? weeksFor(log, now)

  const minutesByDay = new Map<string, number>()
  for (const result of log.results) {
    const key = dayKey(new Date(result.at))
    minutesByDay.set(key, (minutesByDay.get(key) ?? 0) + result.seconds / 60)
  }

  // Montag der laufenden Woche, dann so viele Wochen zurück wie gefordert.
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - mondayIndex(start) - (weeks - 1) * 7)

  const todayKey = dayKey(now)
  const days: CalendarDay[] = []

  for (let offset = 0; offset < weeks * 7; offset += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + offset)
    const key = dayKey(date)

    days.push({
      key,
      date,
      minutes: Math.round(minutesByDay.get(key) ?? 0),
      isToday: key === todayKey,
      isFuture: key > todayKey,
    })
  }

  return days
}

/** 0 = Montag … 6 = Sonntag. `getDay()` zählt ab Sonntag. */
function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7
}

export interface MonatsMarke {
  /** The week column, from 0. */
  spalte: number
  /** 0 = January. */
  monat: number
}

/** Columns closer than this would print one month name over the next. */
const MARKEN_ABSTAND = 3

/**
 * Where the month names go above the grid: over the week that holds the
 * first of a month. Without them the grid is a block of squares — you can
 * see that something happened, but not when. The first column gets its
 * month too, unless a new month starts so close that the names would
 * collide.
 */
export function monatsMarken(days: CalendarDay[]): MonatsMarke[] {
  const marken: MonatsMarke[] = []
  for (let spalte = 0; spalte * 7 < days.length; spalte += 1) {
    const ersterImMonat = days.slice(spalte * 7, spalte * 7 + 7).find((day) => day.date.getDate() === 1)
    if (ersterImMonat) marken.push({ spalte, monat: ersterImMonat.date.getMonth() })
  }
  if (days.length > 0 && marken[0]?.spalte !== 0 && (marken[0]?.spalte ?? Infinity) >= MARKEN_ABSTAND) {
    marken.unshift({ spalte: 0, monat: days[0].date.getMonth() })
  }
  return marken
}

/** Days since the last day with practice — 0 is today, null is never. */
export function tageSeitZuletzt(log: PracticeLog, now = new Date()): number | null {
  const tage = log.results.map((r) => new Date(r.at)).filter((d) => !Number.isNaN(d.getTime()))
  if (tage.length === 0) return null
  const letzter = dayKey(new Date(Math.max(...tage.map((d) => d.getTime()))))
  const mittag = (key: string) => new Date(`${key}T12:00:00`).getTime()
  return Math.max(0, Math.round((mittag(dayKey(now)) - mittag(letzter)) / (24 * 3600 * 1000)))
}
