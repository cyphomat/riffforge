"use client"

import { useEffect, useState } from "react"
import { repoIsPublic } from "@/lib/sync/github"
import {
  clearSettings,
  EMPTY_SETTINGS,
  isConfigured,
  lastSynced,
  loadSettings,
  saveSettings,
  type SyncSettings,
} from "@/lib/sync/settings"
import { runSync } from "@/lib/sync/run"
import { MdSync } from "react-icons/md"

type Notice = { tone: "ok" | "err"; text: string } | null

function formatWhen(date: Date): string {
  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return "gerade eben"
  if (minutes < 60) return `vor ${minutes} Min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `vor ${hours} Std`
  return date.toLocaleDateString("de-DE")
}

export function SyncPanel({
  onChanged,
  onConfigured,
  kopf = true,
}: {
  onChanged?: () => void
  /** Meldet, ob ein Datenrepo eingerichtet ist — die Seite stellt den Abgleich danach um. */
  onConfigured?: (eingerichtet: boolean) => void
  /** Ohne eigene Überschrift, wenn schon eine aufklappbare Zeile darüber steht. */
  kopf?: boolean
}) {
  const [settings, setSettings] = useState<SyncSettings>(EMPTY_SETTINGS)
  const [ready, setReady] = useState(false)
  const [draft, setDraft] = useState<SyncSettings>({ owner: "", repo: "riffforge-data", token: "" })
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [last, setLast] = useState<Date | null>(null)
  const [publicRepo, setPublicRepo] = useState<boolean | null>(null)

  useEffect(() => {
    const stored = loadSettings()
    setSettings(stored)
    setLast(lastSynced())
    setReady(true)
    if (isConfigured(stored)) {
      void repoIsPublic(stored).then(setPublicRepo)
    }
  }, [])

  const connect = () => {
    saveSettings(draft)
    setSettings(draft)
    setNotice(null)
    void repoIsPublic(draft).then(setPublicRepo)
    onConfigured?.(true)
  }

  const disconnect = () => {
    clearSettings()
    setSettings(EMPTY_SETTINGS)
    setPublicRepo(null)
    setLast(null)
    setNotice(null)
    onConfigured?.(false)
  }

  const sync = async () => {
    setBusy(true)
    setNotice(null)
    const outcome = await runSync()
    setBusy(false)
    setLast(lastSynced())

    if (!outcome.ok) {
      setNotice({ tone: "err", text: outcome.reason ?? "Abgleich fehlgeschlagen." })
      return
    }
    setNotice({
      tone: "ok",
      text:
        outcome.pulled === 0 && outcome.pushed === 0
          ? "Alles schon gleich."
          : `${outcome.pulled} geholt, ${outcome.pushed} geschickt.`,
    })
    onChanged?.()
  }

  if (!ready) return null

  if (!isConfigured(settings)) {
    return (
      <section>
        {kopf && <h2 className="rule mb-1 mt-9">Abgleich</h2>}
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Der Log liegt dann zusätzlich in einem <b className="text-muted">privaten</b> Repo, und
          iPhone und Mac ziehen sich gegenseitig nach. Es gewinnt keine Seite — beide Stände
          werden vereinigt.
        </p>

        <div className="space-y-2">
          <label className="block">
            <span className="kicker text-dim">GitHub-Konto</span>
            <input
              type="text"
              value={draft.owner}
              onChange={(e) => setDraft({ ...draft, owner: e.target.value })}
              placeholder="dein-benutzername"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="mt-1 w-full border border-line bg-sunken px-3 py-2.5 font-mono text-[14px] text-fg outline-none focus:border-akzent"
            />
          </label>
          <label className="block">
            <span className="kicker text-dim">Datenrepo</span>
            <input
              type="text"
              value={draft.repo}
              onChange={(e) => setDraft({ ...draft, repo: e.target.value })}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="mt-1 w-full border border-line bg-sunken px-3 py-2.5 font-mono text-[14px] text-fg outline-none focus:border-akzent"
            />
          </label>
          <label className="block">
            <span className="kicker text-dim">Token</span>
            <input
              type="password"
              value={draft.token}
              onChange={(e) => setDraft({ ...draft, token: e.target.value })}
              placeholder="github_pat_…"
              autoComplete="off"
              className="mt-1 w-full border border-line bg-sunken px-3 py-2.5 font-mono text-[14px] text-fg outline-none focus:border-akzent"
            />
          </label>
        </div>

        <button
          onClick={connect}
          disabled={!draft.owner.trim() || !draft.repo.trim() || !draft.token.trim()}
          className="btn mt-3 w-full"
        >
          Verbinden
        </button>

        <details className="info mt-3">
          <summary>Was für ein Token</summary>
          <div className="space-y-2 px-[15px] pb-[15px] text-[13.5px] leading-relaxed text-muted">
            <p>
              Ein <b className="text-fg">fein granulierter</b> Token, der ausschliesslich auf
              dieses eine Datenrepo zeigt, mit <b className="text-fg">Contents: Read and write</b>.
              Anzulegen unter Settings → Developer settings → Personal access tokens →
              Fine-grained tokens.
            </p>
            <p>
              Er liegt danach im Speicher dieses Browsers. Warum eng gefasst: alle Seiten unter{" "}
              <span className="font-mono text-[12.5px]">github.io</span> teilen sich denselben
              Speicher — ein Token, der nur ein Datenrepo öffnen kann, begrenzt den Schaden, falls
              irgendeine dieser Seiten einmal eine Lücke hat.
            </p>
          </div>
        </details>
      </section>
    )
  }

  return (
    <section>
      {kopf && <h2 className="rule mb-1 mt-8">Abgleich</h2>}
      <p className="mb-3 font-mono text-[12px] text-dim">
        {settings.owner}/{settings.repo}
        {last && ` · zuletzt ${formatWhen(last)}`}
      </p>

      {publicRepo === true && (
        <p className="mb-3 border-l-2 border-rot py-2 pl-3 text-[13px] leading-relaxed text-rot">
          Dieses Repo ist <b>öffentlich</b>. Jede Session, jedes Tempo und jede Einschätzung liest
          damit jeder mit — die App funktioniert genauso, deshalb fällt es sonst nicht auf.
        </p>
      )}

      <div className="flex gap-[9px]">
        <button onClick={sync} disabled={busy} className="btn flex-1">
          <MdSync className={`h-[18px] w-[18px] ${busy ? "animate-spin" : ""}`} />
          {busy ? "Läuft…" : "Jetzt abgleichen"}
        </button>
        <button onClick={disconnect} className="btn btn-ghost btn-small px-4">
          Trennen
        </button>
      </div>

      {notice && (
        <p
          className={`mt-3 border-l-2 py-2 pl-3 font-mono text-[12.5px] ${
            notice.tone === "ok" ? "border-gruen text-gruen" : "border-rot text-rot"
          }`}
        >
          {notice.text}
        </p>
      )}
    </section>
  )
}
