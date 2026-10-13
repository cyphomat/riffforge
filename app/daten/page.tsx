import { DataManager } from "@/components/session/data-manager"
import { UeberPanel } from "@/components/session/ueber-panel"

export const metadata = { title: "Daten · Riffforge" }

export default function DatenPage() {
  return (
    <div className="huelle-breit">
      <header className="mt-6">
        <span className="kicker">Sicherung</span>
        <h1 className="display mt-1 text-[38px] text-fg">Daten</h1>
        <p className="mt-2 text-[14.5px] leading-relaxed text-muted">
          Dein Übungs-Log liegt nur in diesem Browser. Kein Konto, kein Server — aber auch
          kein Netz, das ihn auffängt. Hier holst du ihn raus und wieder rein.
        </p>
      </header>
      <DataManager />
      {/* Unter beiden Spalten: auf dem Handy stünde es links sonst mitten
          zwischen Fassung und Sichern. */}
      <div className="wide:max-w-[527px]">
        <UeberPanel />
      </div>
    </div>
  )
}
