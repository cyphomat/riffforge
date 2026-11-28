import Link from "next/link"
import { DrillLibrary } from "@/components/session/drill-library"

export const metadata = { title: "Drills · Riffforge" }

export default function DrillsPage() {
  return (
    <div className="huelle-breit">
      <header className="mt-6">
        <span className="kicker">Der Katalog</span>
        <h1 className="display mt-1 text-[40px] text-fg">Drills</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Alles, was die Session ziehen kann. Einzeln üben, wenn du weisst, was du brauchst —
          sonst nimm die Session, die sucht selbst aus.
        </p>
      </header>
      <Link href="/drills/repertoire" className="btn mt-4 w-full wide:max-w-[527px]">
        Repertoire — deine echten Songs
      </Link>
      <DrillLibrary />
    </div>
  )
}
