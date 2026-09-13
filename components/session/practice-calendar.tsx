import { practiceCalendar } from "@/lib/session/calendar"
import type { PracticeLog } from "@/lib/session/types"

const WEEKDAY = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const MONTH = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

/**
 * Übungskalender: eine Zelle je Tag, sieben Zeilen, eine Spalte je Woche.
 *
 * Bewusst binär statt nach Minuten abgestuft. Eine Session ist per
 * Konstruktion rund eine Viertelstunde lang — die Minuten pro Tag schwanken
 * kaum, und sie als Farbverlauf zu zeigen hiesse, Rauschen als Signal
 * auszugeben. Was hier zählt, ist das Muster: Serien und Lücken.
 *
 * Der genaue Wert steht im Titel jeder Zelle, damit die Farbe nicht die
 * einzige Auskunft ist.
 */
export function PracticeCalendar({ log, weeks }: { log: PracticeLog; weeks?: number }) {
  // Ohne Angabe wächst das Raster mit dem Log — siehe `weeksFor`.
  const days = practiceCalendar(log, { weeks })
  const played = days.filter((day) => day.minutes > 0).length
  const past = days.filter((day) => !day.isFuture).length

  return (
    // Schrumpft auf das Raster statt auf die Spalte: ein Rückblick über vier
    // Wochen soll nicht so breit dastehen wie einer über sechzehn.
    <div className="inline-block border border-line bg-panel p-[14px]">
      <div
        className="grid grid-flow-col grid-rows-7 gap-[3px]"
        // `1fr` allein bläst die Zellen auf, sobald das Raster mitwächst:
        // vier Wochen auf voller Breite ergaben Kacheln von 165 px. Die
        // Deckelung lässt sie auf dem Handy weiter schrumpfen, aber nicht
        // über Daumennagelgrösse hinauswachsen.
        style={{ gridAutoColumns: "1fr", maxWidth: `${days.length / 7 * 40}px` }}
        role="img"
        aria-label={`Übungskalender: ${played} von ${past} Tagen geübt`}
      >
        {days.map((day) => (
          <div
            key={day.key}
            title={`${WEEKDAY[(day.date.getDay() + 6) % 7]}, ${day.date.getDate()}. ${
              MONTH[day.date.getMonth()]
            } — ${day.minutes > 0 ? `${day.minutes} Min` : "nicht geübt"}`}
            className={`aspect-square border ${
              day.minutes > 0 ? "border-akzent bg-akzent" : "border-line bg-sunken"
            } ${day.isFuture ? "opacity-25" : ""} ${day.isToday ? "outline outline-1 outline-offset-1 outline-fg" : ""}`}
          />
        ))}
      </div>

      <div className="mt-[11px] flex flex-wrap items-center gap-3 font-mono text-[11.5px] uppercase tracking-[0.1em] text-muted">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-[9px] w-[9px] bg-akzent" /> geübt
        </span>
        <span className="ml-auto text-fg">
          {played} von {past} Tagen
        </span>
      </div>
    </div>
  )
}
