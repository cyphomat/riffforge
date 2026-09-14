"use client"

import { useEffect, useRef, useState } from "react"
import { buildBackup, previewBackup, type BackupPreview } from "@/lib/backup"
import { dayKey, practiceDays, totalMinutes } from "@/lib/session/progress"
import {
  clearLog,
  exportFilename,
  hasStoredLog,
  importLog,
  loadLog,
} from "@/lib/storage/practice-log"
import { clearProfile } from "@/lib/storage/profile"
import {
  clearTheoryLog,
  hasStoredTheoryLog,
  importTheoryLog,
  loadTheoryLog,
} from "@/lib/storage/theory-log"
import { EMPTY_THEORY_LOG, type TheoryLog } from "@/lib/theory/types"
import { EMPTY_LOG, type PracticeLog } from "@/lib/session/types"
import { SyncPanel } from "@/components/session/sync-panel"
import { UpdatePanel } from "@/components/session/update-panel"
import { InstallPanel } from "@/components/session/install-panel"
import { clearLokal, merkeSicherung, zuletztGesichert } from "@/lib/storage/lokal"
import { sollErinnern, tageSeit } from "@/lib/backup-erinnerung"
import { MdFileDownload, MdFileUpload } from "react-icons/md"

type Notice = { tone: "ok" | "err"; text: string } | null

export function DataManager() {
  const [log, setLog] = useState<PracticeLog>(EMPTY_LOG)
  const [theorie, setTheorie] = useState<TheoryLog>(EMPTY_THEORY_LOG)
  const [pending, setPending] = useState<(BackupPreview & { name: string }) | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  // Ein Log, der das Schema reisst, zählt null Einträge — der Knopf muss
  // trotzdem angehen, sonst kommt man an genau diese Daten nicht mehr heran.
  const [stored, setStored] = useState(false)
  const [gesichert, setGesichert] = useState<Date | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setLog(loadLog())
    setTheorie(loadTheoryLog())
    setStored(hasStoredLog() || hasStoredTheoryLog())
    setGesichert(zuletztGesichert())
  }, [])

  const days = practiceDays(log)

  const download = () => {
    const inhalt = JSON.stringify(buildBackup(loadLog(), loadTheoryLog()), null, 2)
    const blob = new Blob([inhalt], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = exportFilename()
    link.click()
    // Erst freigeben, wenn der Browser den Download übernommen hat.
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    // Ab jetzt gibt es eine Datei. Das ist die einzige Stelle, an der das
    // stimmt — der Abgleich zählt nicht, er liegt auf demselben Konto.
    merkeSicherung()
    setGesichert(new Date())
    const eintraege = `${log.results.length} ${log.results.length === 1 ? "Eintrag" : "Einträge"}`
    const antworten = `${theorie.answers.length} ${theorie.answers.length === 1 ? "Antwort" : "Antworten"}`
    setNotice({
      tone: "ok",
      text:
        theorie.answers.length > 0
          ? `${eintraege} und ${antworten} gesichert.`
          : `${eintraege} gesichert.`,
    })
  }

  const choose = async (file: File | undefined) => {
    setNotice(null)
    setPending(null)
    if (!file) return

    const result = previewBackup(await file.text(), log, theorie)
    if (!result.ok) {
      setNotice({ tone: "err", text: result.reason })
      return
    }
    setPending({ ...result, name: file.name })
  }

  const apply = () => {
    if (!pending) return
    setLog(importLog(pending.merged))
    setTheorie(importTheoryLog(pending.mergedTheory))
    setStored(true)
    const teile = [
      pending.added > 0 && `${pending.added} ${pending.added === 1 ? "Eintrag" : "Einträge"}`,
      pending.addedTheory > 0 &&
        `${pending.addedTheory} ${pending.addedTheory === 1 ? "Antwort" : "Antworten"}`,
    ].filter(Boolean)
    setNotice({
      tone: "ok",
      text:
        teile.length === 0
          ? "Nichts Neues dabei — der Log war schon vollständig."
          : `${teile.join(" und ")} übernommen.`,
    })
    setPending(null)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div className="zwei-spalten">
      <div className="spalte">
      <section>
        <h2 className="rule mb-3 mt-8">Was drinsteht</h2>
        <div className="grid grid-cols-3 gap-[9px]">
          <div className="stat">
            <div className="n">Einträge</div>
            <div className="v">{log.results.length}</div>
          </div>
          <div className="stat">
            <div className="n">Übungstage</div>
            <div className="v">{days.length}</div>
          </div>
          <div className="stat">
            <div className="n">Minuten</div>
            <div className="v">{totalMinutes(log)}</div>
          </div>
        </div>
        {days.length > 0 && (
          <p className="mt-2 font-mono text-[11.5px] text-dim">
            seit {days[0]} · zuletzt {days[days.length - 1]}
            {days[days.length - 1] === dayKey(new Date()) && " (heute)"}
          </p>
        )}
      </section>

      <InstallPanel />

      <UpdatePanel />

      </div>

      <div className="spalte">
      <section>
        <h2 className="rule mb-1 mt-8">Sichern</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Eine JSON-Datei mit allem — Übungs-Log und beantwortete Wissensfragen. Leg sie
          irgendwohin, wo sie einen Browserwechsel überlebt.
        </p>

        {/* Die Erinnerung steht über dem Knopf, nicht als Banner quer durch
            die App: hier ist sie handlungsnah, anderswo wäre sie Nörgeln.
            Und sie kommt erst, wenn es wirklich etwas zu verlieren gibt —
            siehe `backup-erinnerung.ts`. */}
        {sollErinnern({
          eintraege: log.results.length,
          gesichert,
          aeltester: log.results.length > 0
            ? new Date(Math.min(...log.results.map((r) => new Date(r.at).getTime())))
            : null,
        }) && (
          <>
            <div className="warnstreifen mb-2" aria-hidden />
            <p className="mb-3 text-[13.5px] leading-relaxed text-rost">
              {gesichert
                ? `Zuletzt vor ${tageSeit(gesichert)} Tagen gesichert.`
                : "Noch nie gesichert."}{" "}
              Der Log liegt nur in diesem Browser — wer ihn aufräumt, räumt ihn mit auf.
            </p>
          </>
        )}

        <button onClick={download} disabled={log.results.length === 0} className="btn w-full">
          <MdFileDownload className="h-[18px] w-[18px]" /> Exportieren
        </button>
        {gesichert && (
          <p className="mt-2 font-mono text-[11.5px] text-dim">
            zuletzt gesichert: {gesichert.toLocaleDateString("de-DE")}
          </p>
        )}
      </section>

      <section>
        <h2 className="rule mb-1">Einlesen</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Wird <b className="text-muted">dazugelegt</b>, nicht ersetzt. Was hier schon steht,
          bleibt — auch wenn die Datei älter ist.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={(event) => void choose(event.target.files?.[0])}
          className="hidden"
        />
        <button onClick={() => fileRef.current?.click()} className="btn btn-ghost w-full">
          <MdFileUpload className="h-[18px] w-[18px]" /> Datei wählen
        </button>

        {pending && (
          <div className="card mt-3">
            <span className="kicker">Vorschau</span>
            <p className="mt-1 font-mono text-[13px] text-fg">{pending.name}</p>
            <p className="mt-2 text-[14px] text-muted">
              {pending.incoming} {pending.incoming === 1 ? "Eintrag" : "Einträge"} in der Datei,
              davon <b className="text-akzent">{pending.added} neu</b>. Danach stehen{" "}
              {pending.merged.results.length} im Log.
            </p>
            {pending.incomingTheory > 0 && (
              <p className="mt-1 text-[14px] text-muted">
                Dazu {pending.incomingTheory}{" "}
                {pending.incomingTheory === 1 ? "Antwort" : "Antworten"} auf Wissensfragen, davon{" "}
                <b className="text-akzent">{pending.addedTheory} neu</b>.
              </p>
            )}
            <div className="mt-3 flex gap-[9px]">
              <button onClick={apply} className="btn flex-1">
                Übernehmen
              </button>
              <button onClick={() => setPending(null)} className="btn btn-ghost btn-small px-4">
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </section>

      {notice && (
        <p
          className={`border-l-2 py-2 pl-3 font-mono text-[12.5px] ${
            notice.tone === "ok" ? "border-gruen text-gruen" : "border-rot text-rot"
          }`}
        >
          {notice.text}
        </p>
      )}

      <section>
        <h2 className="rule mb-1 mt-9">Löschen</h2>
        <p className="mb-3 text-[13px] leading-relaxed text-dim">
          Setzt alles zurück: Tempi, Serien, Bestwerte, die beantworteten
          Wissensfragen — und die beiden Antworten vom ersten Start. Danach ist die App wieder wie frisch installiert. Vorher
          exportieren.
        </p>
        {confirmClear ? (
          <div className="flex gap-[9px]">
            <button
              onClick={() => {
                clearLog()
                clearProfile()
                clearTheoryLog()
                clearLokal()
                setGesichert(null)
                setTheorie(EMPTY_THEORY_LOG)
                setLog(EMPTY_LOG)
                setStored(false)
                setConfirmClear(false)
                setNotice({ tone: "ok", text: "Alles gelöscht." })
              }}
              className="btn flex-1 border-rot bg-transparent text-rot"
            >
              Wirklich löschen
            </button>
            <button onClick={() => setConfirmClear(false)} className="btn btn-ghost btn-small px-4">
              Abbrechen
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmClear(true)}
            disabled={!stored}
            className="btn btn-ghost w-full"
          >
            Alles löschen
          </button>
        )}
      </section>

      {/* Der Abgleich ist die Ausnahme, nicht der Weg. Die App läuft
          vollständig ohne ihn: alles liegt lokal, und mitgenommen wird über
          die Datei oben. Wer zwei Geräte hat, klappt hier auf — alle anderen
          sehen von GitHub nie etwas. */}
      <details className="info mt-9">
        <summary>Mehrere Geräte · Abgleich über GitHub</summary>
        <div className="border-t border-line px-[15px] py-[15px]">
          <p className="mb-3 text-[13px] leading-relaxed text-dim">
            Optional. Wer auf Handy und Rechner übt, kann beide Stände über ein eigenes,
            privates GitHub-Repo abgleichen. Ohne das läuft alles Übrige unverändert.
          </p>
          <SyncPanel onChanged={() => setLog(loadLog())} />
        </div>
      </details>
      </div>
    </div>
  )
}
