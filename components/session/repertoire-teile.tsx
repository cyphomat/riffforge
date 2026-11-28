import type { AbschnittStatus, Sound } from "@/lib/session/repertoire"

/** What the repertoire pages and the session block both show. */

/** Green is "in place", amber is the one being worked on. */
export const STATUS_AKTIV: Record<AbschnittStatus, string> = {
  neu: "bg-(--tint-stahl) text-stahl shadow-(--pix-stahl)",
  langsam: "bg-(--tint-akzent) text-akzent shadow-(--pix-akzent)",
  sitzt: "bg-(--tint-gruen) text-gruen shadow-(--pix-gruen)",
}

export function takteText(von: number, bis: number): string {
  return von === bis ? `Takt ${von}` : `Takt ${von}–${bis}`
}

export function SoundNotizen({ sound }: { sound?: Sound }) {
  if (!sound) return null
  const zahl = (wert: number) => String(wert).replace(".", ",")
  const eq = [
    ["Bass", sound.eq?.bass],
    ["Mitten", sound.eq?.mitten],
    ["Höhen", sound.eq?.hoehen],
    ["Präsenz", sound.eq?.praesenz],
  ].flatMap(([name, wert]) => (typeof wert === "number" ? [`${name} ${zahl(wert)}`] : []))
  const zeilen = [
    ["Amp", sound.amp],
    ["Kanal", sound.kanal],
    ["Gain", sound.gain && (sound.gain.von === sound.gain.bis ? zahl(sound.gain.von) : `${zahl(sound.gain.von)} bis ${zahl(sound.gain.bis)}`)],
    ["EQ", eq.join(" · ") || undefined],
    ["Boost", sound.boost],
  ].filter((zeile): zeile is [string, string] => Boolean(zeile[1]))

  return (
    <section>
      <h2 className="rule mb-3 mt-9">Sound</h2>
      <dl className="space-y-2">
        {zeilen.map(([name, wert]) => (
          <div key={name} className="flex gap-3">
            <dt className="kicker w-20 flex-none text-dim">{name}</dt>
            <dd className="min-w-0 break-words text-[14.5px] text-fg">{wert}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
