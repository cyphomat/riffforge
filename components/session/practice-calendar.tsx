import { monatsMarken, practiceCalendar, tageSeitZuletzt } from "@/lib/session/calendar"
import type { PracticeLog } from "@/lib/session/types"

const WEEKDAY = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"]
const MONTH = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]

/** Wochentage nur jede zweite Zeile — sieben Namen untereinander wären eine Spalte Lärm. */
const ZEILEN_NAMEN = [0, 2, 4]

/**
 * Eine Zelle wächst nicht über Daumennagelgrösse — siehe `weeksFor`. Bei 40
 * füllten sieben Wochen auf dem Handy die ganze Breite, und zwei geübte Tage
 * standen in einem Feld von fast dreihundert Pixeln Leere.
 */
const ZELLE_MAX = 32

function zuletzt(tage: number | null): string {
  if (tage === null) return "noch nie"
  if (tage === 0) return "heute"
  if (tage === 1) return "gestern"
  return `vor ${tage} Tagen`
}

/**
 * Übungskalender: eine Zelle je Tag, sieben Zeilen, eine Spalte je Woche.
 *
 * Bewusst binär statt nach Minuten abgestuft. Eine Session ist per
 * Konstruktion rund eine Viertelstunde lang — die Minuten pro Tag schwanken
 * kaum, und sie als Farbverlauf zu zeigen hiesse, Rauschen als Signal
 * auszugeben. Was hier zählt, ist das Muster: Serien und Lücken.
 *
 * Zuerst stand das Raster ohne Achsen da, als Kasten auf seine eigene Breite
 * geschrumpft — auf einem breiten Schirm ein Quadrat voller Kästchen, allein
 * in einer Spalte, ohne dass man sah, welche Zeile welcher Tag ist. Daniel:
 * „irgendwie lost". Jetzt trägt es Wochentage und Monate, und daneben steht,
 * was es sagt: wie viele Tage, und wann zuletzt.
 *
 * Der genaue Wert steht im Titel jeder Zelle, damit die Farbe nicht die
 * einzige Auskunft ist.
 */
export function PracticeCalendar({ log, weeks, now = new Date() }: { log: PracticeLog; weeks?: number; now?: Date }) {
  // Ohne Angabe wächst das Raster mit dem Log — siehe `weeksFor`.
  const days = practiceCalendar(log, { weeks, now })
  const wochen = days.length / 7
  const played = days.filter((day) => day.minutes > 0).length
  const past = days.filter((day) => !day.isFuture).length
  const marken = monatsMarken(days)

  return (
    <div className="@container border border-line bg-panel p-[14px]">
      <div className="flex flex-col gap-4 @md:flex-row @md:items-end @md:gap-6">
        <div
          className="grid w-full gap-[3px]"
          // Erste Spalte für die Wochentage, erste Zeile für die Monate. Die
          // Wochen dürfen schrumpfen, aber nicht über `ZELLE_MAX` wachsen.
          style={{
            gridTemplateColumns: `1.75rem repeat(${wochen}, minmax(0, ${ZELLE_MAX}px))`,
            maxWidth: `calc(1.75rem + ${wochen * (ZELLE_MAX + 3)}px)`,
          }}
          role="img"
          aria-label={`Übungskalender: ${played} von ${past} Tagen geübt`}
        >
          {marken.map(({ spalte, monat }) => (
            <span
              key={`m-${spalte}`}
              className="overflow-visible whitespace-nowrap pb-[2px] font-mono text-[11.5px] leading-none text-muted"
              style={{ gridColumn: spalte + 2, gridRow: 1 }}
            >
              {MONTH[monat]}
            </span>
          ))}
          {ZEILEN_NAMEN.map((zeile) => (
            <span
              key={`w-${zeile}`}
              className="self-center font-mono text-[11.5px] leading-none text-muted"
              style={{ gridColumn: 1, gridRow: zeile + 2 }}
            >
              {WEEKDAY[zeile]}
            </span>
          ))}
          {days.map((day, i) => (
            <div
              key={day.key}
              title={`${WEEKDAY[(day.date.getDay() + 6) % 7]}, ${day.date.getDate()}. ${
                MONTH[day.date.getMonth()]
              } — ${day.minutes > 0 ? `${day.minutes} Min` : "nicht geübt"}`}
              style={{ gridColumn: Math.floor(i / 7) + 2, gridRow: (i % 7) + 2 }}
              className={`aspect-square border ${
                day.minutes > 0 ? "border-akzent bg-akzent" : "border-line bg-sunken"
              } ${day.isFuture ? "opacity-25" : ""} ${day.isToday ? "outline-solid outline-1 outline-offset-1 outline-fg" : ""}`}
            />
          ))}
        </div>

        <dl className="flex shrink-0 flex-wrap gap-x-6 gap-y-3 @md:flex-col">
          <div>
            <dt className="kicker text-dim">Geübt</dt>
            <dd className="ziffern mt-1 text-[14px] text-fg">
              {played} von {past} Tagen
            </dd>
          </div>
          <div>
            <dt className="kicker text-dim">Zuletzt</dt>
            <dd className="ziffern mt-1 text-[14px] text-fg">{zuletzt(tageSeitZuletzt(log, now))}</dd>
          </div>
          <div className="flex items-center gap-1.5 self-end font-mono text-[11.5px] uppercase tracking-widest text-muted @md:self-start">
            <i className="inline-block h-[9px] w-[9px] bg-akzent" /> Übungstag
          </div>
        </dl>
      </div>
    </div>
  )
}
