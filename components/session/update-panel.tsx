"use client"

import { useEffect, useState } from "react"
import { MdDownloading, MdRefresh } from "react-icons/md"
import { applyUpdate, fetchDeployed, fetchUpstreamCommits } from "@/lib/update/check"
import {
  compareBuilds,
  isFork,
  runningBuild,
  shortCommit,
  UPSTREAM,
  upstreamNews,
  type UpdateState,
  type UpstreamNews,
} from "@/lib/update/version"

function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "unbekannt"
  return date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
}

const ZUSTAND: Record<UpdateState, { text: string; klasse: string }> = {
  aktuell: { text: "Aktuell", klasse: "text-gruen border-gruen" },
  "neuer-da": { text: "Update da", klasse: "text-akzent border-akzent" },
  zurueckgerollt: { text: "Zurückgerollt", klasse: "text-akzent border-akzent" },
  unbekannt: { text: "Unbekannt", klasse: "text-dim border-line" },
}

export function UpdatePanel() {
  const running = runningBuild()
  const [state, setState] = useState<UpdateState>("unbekannt")
  const [busy, setBusy] = useState(false)
  const [gesucht, setGesucht] = useState(false)
  const [original, setOriginal] = useState<UpstreamNews | null>(null)
  const [originalFehler, setOriginalFehler] = useState(false)
  const [originalBusy, setOriginalBusy] = useState(false)

  // Beim Öffnen einmal nachsehen. Die Anfrage geht an die eigene Adresse,
  // kostet nichts und niemanden — der Blick zum Original dagegen wartet auf
  // einen Knopfdruck.
  useEffect(() => {
    let abgemeldet = false
    void fetchDeployed().then((deployed) => {
      if (abgemeldet) return
      setState(compareBuilds(running, deployed))
      setGesucht(true)
    })
    return () => {
      abgemeldet = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const suchen = async () => {
    setBusy(true)
    setState(compareBuilds(running, await fetchDeployed()))
    setGesucht(true)
    setBusy(false)
  }

  const beimOriginalNachsehen = async () => {
    setOriginalBusy(true)
    setOriginalFehler(false)
    const commits = await fetchUpstreamCommits(running?.committedAt ?? "")
    if (commits === null) {
      setOriginalFehler(true)
    } else {
      setOriginal(upstreamNews(commits, running))
    }
    setOriginalBusy(false)
  }

  const zustand = ZUSTAND[state]
  const veraltet = state === "neuer-da" || state === "zurueckgerollt"

  return (
    <section>
      <h2 className="rule mb-1 mt-9">Fassung</h2>

      <div className="flex items-center gap-3">
        <span className={`kicker border px-2 py-[3px] ${zustand.klasse}`}>{zustand.text}</span>
        {running ? (
          <span className="font-mono text-[12px] text-dim">
            {shortCommit(running.commit)} · {formatDate(running.committedAt)}
          </span>
        ) : (
          <span className="font-mono text-[12px] text-dim">lokal gebaut, ohne Stempel</span>
        )}
      </div>

      {veraltet && (
        <p className="mt-3 border-l-2 border-akzent py-2 pl-3 text-[13.5px] leading-relaxed text-fg">
          {state === "neuer-da"
            ? "Auf dem Server liegt eine neuere Fassung. Der Browser hält noch die alte fest — einmal neu laden holt sie."
            : "Auf dem Server liegt ein älterer Stand als hier. Neu laden holt ihn; der Übungs-Log bleibt davon unberührt."}
        </p>
      )}

      {state === "unbekannt" && gesucht && (
        <p className="mt-3 text-[13px] leading-relaxed text-dim">
          Diese Fassung trägt keinen Bau-Stempel — das ist bei einem lokalen
          Entwicklungslauf normal. Ein Vergleich ist dann nicht möglich.
        </p>
      )}

      <div className="mt-3 flex gap-[9px]">
        <button onClick={suchen} disabled={busy} className="btn btn-ghost flex-1">
          <MdRefresh className={`h-[18px] w-[18px] ${busy ? "animate-spin" : ""}`} />
          {busy ? "Sehe nach…" : "Nach Updates suchen"}
        </button>
        {veraltet && (
          <button onClick={() => void applyUpdate()} className="btn flex-1">
            <MdDownloading className="h-[18px] w-[18px]" /> Jetzt aktualisieren
          </button>
        )}
      </div>

      <p className="mt-2 font-mono text-[11.5px] leading-relaxed text-dim">
        Aktualisieren leert den Offline-Speicher und lädt neu. Übungs-Log,
        Profil und Abgleich bleiben, wo sie sind.
      </p>

      {isFork(running) && running && (
        <div className="mt-4 border-l-2 border-stahl bg-[--tint-stahl] py-3 pl-3 pr-3">
          <p className="kicker mb-1 text-stahl">Fork</p>
          <p className="text-[13.5px] leading-relaxed text-muted">
            Diese Auslieferung läuft aus <b className="font-mono text-fg">{running.repo}</b>, nicht
            aus <b className="font-mono text-fg">{UPSTREAM}</b>. Updates am Original kommen hier
            nicht von allein an — dein Fork müsste sie erst übernehmen.
          </p>

          {original && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-fg">
              {original.commits === 0
                ? "Das Original hat seit diesem Stand nichts Neues."
                : `Das Original hat seitdem ${original.capped ? "mindestens " : ""}${original.commits} ${
                    original.commits === 1 ? "Commit" : "Commits"
                  }, zuletzt am ${original.newest ? formatDate(original.newest) : "unbekannt"}.`}
            </p>
          )}

          {originalFehler && <div className="warnstreifen mt-3" aria-hidden />}
          {originalFehler && (
            <p className="mt-2 text-[13.5px] leading-relaxed text-rost">
              GitHub hat nicht geantwortet. Ohne Anmeldung sind sechzig Anfragen
              pro Stunde und Adresse erlaubt — vielleicht später nochmal.
            </p>
          )}

          <button
            onClick={() => void beimOriginalNachsehen()}
            disabled={originalBusy}
            className="btn btn-ghost btn-small mt-3"
          >
            {originalBusy ? "Frage nach…" : "Beim Original nachsehen"}
          </button>
          <p className="mt-2 font-mono text-[12px] leading-relaxed text-dim">
            Fragt api.github.com — die einzige Stelle, an der diese App ohne
            eingerichteten Abgleich nach draussen spricht, und nur auf diesen
            Knopf hin.
          </p>
        </div>
      )}
    </section>
  )
}
