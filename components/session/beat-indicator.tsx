/**
 * Der Taktzähler — und zwar gross genug, um ihn zu benutzen.
 *
 * Er war zehn Pixel breit und sass in der Knopfreihe. Das genügt, um im
 * Stehen den Takt abzulesen, aber nicht als *Hilfe beim Spielen*: wer das
 * Gerät auf dem Notenständer hat und dabei auf die Griffhand schaut, nimmt
 * im Augenwinkel nur Fläche und Helligkeitswechsel wahr, keine Formen. Also
 * über die ganze Breite und hoch genug, dass der Wechsel dort ankommt — und
 * weg aus der Knopfreihe, denn dorthin sieht man, wenn man drücken will.
 *
 * Gezählt werden **Schläge, nicht Klicks**. Bei einem Drill mit Klick auf
 * Achteln blinkte er sonst achtmal je Takt, und acht Wechsel je Takt sind im
 * Augenwinkel ein Flackern statt eines Pulses. Der Puls ist die Auskunft;
 * die Unterteilung hört man ohnehin.
 *
 * Die Eins ist auch im Ruhezustand markiert. Wer den Blick kurz abwendet,
 * muss beim Zurückschauen wissen, wo der Takt anfängt — ein Feld, das nur
 * beim Aufleuchten anders aussieht, sagt das nicht.
 */
export function BeatIndicator({ beatInBar, beatsPerBar }: { beatInBar: number; beatsPerBar: number }) {
  return (
    <div
      className="grid gap-[6px]"
      style={{ gridTemplateColumns: `repeat(${beatsPerBar}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {Array.from({ length: beatsPerBar }, (_, index) => {
        const active = index === beatInBar
        const eins = index === 0
        return (
          <span
            key={index}
            className={`ziffern flex h-[42px] items-center justify-center border text-[14px] transition-colors duration-75 ${
              active
                ? eins
                  ? "border-akzent bg-akzent font-bold text-bg"
                  : "border-akzent bg-[--tint-akzent-stark] text-akzent"
                : eins
                  ? "border-stahl bg-sunken text-muted"
                  : "border-line bg-sunken text-dim"
            }`}
          >
            {index + 1}
          </span>
        )
      })}
    </div>
  )
}
