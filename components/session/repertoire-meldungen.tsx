"use client"

import { useEffect, useRef } from "react"

/** What went wrong, in German, where it cannot be missed. */
export function Meldungen({ fehler }: { fehler: string[] }) {
  const ref = useRef<HTMLDivElement>(null)
  // The messages may sit below the fold on a phone; bring them into view.
  useEffect(() => {
    if (fehler.length > 0) ref.current?.scrollIntoView({ block: "nearest" })
  }, [fehler])
  if (fehler.length === 0) return null
  return (
    <div ref={ref} role="alert" className="my-3 border border-rot bg-sunken px-3 py-2.5">
      <ul className="space-y-1 text-[14px] leading-relaxed text-fg">
        {fehler.map((meldung) => (
          <li key={meldung}>{meldung}</li>
        ))}
      </ul>
    </div>
  )
}
