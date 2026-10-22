# Architektur — Datei für Datei

- **Gilt für:** Alle Pfade des Projekts mit ihrer Rolle.
- **Lies, wenn** du eine Datei suchst, nicht weißt, wo etwas hingehört, oder eine neue anlegst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Architektur

| Pfad | Rolle |
|---|---|
| `lib/audio/audio-engine.ts` | Besitzt den **einen** AudioContext der App |
| `lib/audio/metronome.ts` | Web-Audio-Lookahead-Scheduler. Framework-frei, kein React. |
| `lib/audio/onset-detector.ts` | Mikrofon → AudioWorklet → Anschlag-Zeitstempel |
| `public/worklets/onset-processor.js` | Onset-Erkennung im Audio-Thread (2,7 ms Auflösung) |
| `lib/audio/timing.ts` | Bewertet Gehörtes gegen Geklicktes. Rein, getestet. |
| `lib/audio/einmessen.ts` | Die Latenz einmal messen: Auswertung, rein, getestet |
| `lib/audio/einmess-lauf.ts` | Der Lauf dazu — Klicks raus, Anschläge rein, auf der einen Uhr |
| `components/session/einmessen-panel.tsx` | *Mikrofon einmessen* auf *Daten* |
| `lib/audio/tonhoehe.ts` | YIN: Tonhöhe aus einem Stück Audio. Rein, gemessen. |
| `lib/audio/stimmen.ts` | Das Stimmgerät als Rechnung: Saite, Cent, Glättung |
| `lib/audio/stimmgeraet.ts` | Mikrofon → AnalyserNode, für das Stimmgerät |
| `components/session/stimmgeraet.tsx` | Der vierte Eingang: das Stimmgerät, `/stimmen` |
| `lib/session/saiten.ts` | Wann die Saiten fällig sind: Übungstage aus dem Log, Tage seit dem Wechsel |
| `lib/session/types.ts` | Domänen-Typen + Zod-Schemas für alles Persistierte |
| `lib/session/drills.ts` | Der Übungs-Katalog (reine Daten) |
| `lib/session/progress.ts` | Auswertung des Logs: Tempo-Fortschreibung, Streak, Mastery |
| `lib/session/builder.ts` | Wählt aus, was heute drankommt |
| `lib/session/profile.ts` | Die zwei Antworten vom ersten Start: Starttempo und Gewichtung |
| `lib/session/briefing.ts` | Die Ansage: der Ton des Tages, aus dem Log |
| `lib/session/theory-slots.ts` | Wo die Wissensfragen zwischen die Blöcke gehören |
| `lib/session/calendar.ts` | Das Raster für den Übungskalender |
| `lib/session/merge.ts` | Logs verschmelzen — für Import und später den Abgleich |
| `lib/storage/practice-log.ts` | localStorage, einziger Zugriffspunkt aufs Log |
| `lib/storage/profile.ts` | localStorage, einziger Zugriffspunkt aufs Profil |
| `lib/sync/store.ts` | Abgleich-Logik, unabhängig von GitHub — deshalb testbar |
| `lib/theory/merge.ts` | Antwort-Logs verschmelzen — dieselbe Bauart wie der Übungs-Log |
| `lib/backup.ts` | Die Sicherungsdatei: beide Logs in einem Dokument |
| `lib/sync/github.ts` | GitHub-API als Ablageort, einziger Netz-Zugriff |
| `lib/sync/settings.ts` | Konto, Repo, Token und letzter Abgleich — localStorage |
| `lib/sync/run.ts` | Ein Abgleich beider Logs, von Hand oder im Hintergrund |
| `lib/storage/loeschen.ts` | *Alles löschen* — die eine Liste, gegen den Quelltext getestet |
| `components/session/*` | UI der Session |
| `lib/theory/fsrs.ts` | FSRS-6, portiert aus der Referenz. Rein, gegengeprüft. |
| `lib/theory/types.ts` | Karten, Fragen und der Antwort-Log |
| `lib/theory/progress.ts` | Kartenstand aus dem Antwort-Log, Auswahl fürs Abfragen |
| `lib/theory/fretboard.ts` | Griffbrett als Rechnung: Töne, Intervalle, Lagen |
| `lib/theory/hals.ts` | Die Maße des Halses — für das antippbare Griffbrett |
| `lib/theory/caged.ts` | CAGED als Rechnung: fünf offene Griffe, in jede Tonart verschoben |
| `lib/theory/dreiklaenge.ts` | Dreiklänge in enger Lage auf drei benachbarten Saiten |
| `lib/theory/gehoer.ts` | Hörfragen: Reihenfolge, Auswahl, die gewürfelten Tonpaare |
| `lib/audio/zupfen.ts` | Ein gezupfter Ton aus Obertönen — rein, auf den Cent gemessen |
| `components/theory/intervall-hoeren.tsx` | Spielt die zwei Töne einer Hörfrage |
| `lib/theory/hals-trainer.ts` | Der Griffbrett-Trainer als Rechnung: 72 Stellen × 2 Richtungen, FSRS |
| `lib/theory/hals-id.ts` | Das Präfix `hals-` — damit der Trainer nicht als Wissen zählt |
| `components/theory/hals-trainer.tsx` | Der fünfte Eingang: Griffbrett-Trainer, `/griffbrett` |
| `lib/theory/lick.ts` | Lead-Licks als Grammatik: Motiv, Entwicklung, Anlauf, Auflösung |
| `lib/session/lead.ts` | Hängt das gerechnete Lick an einen Drill mit fester Nummer |
| `lib/theory/sieben.ts` | Die Siebensaitige als Rechnung: B Standard, Abstände, Frequenzen |
| `lib/session/drills-sieben.ts` | Der Sieben-Saiter-Katalog (reine Daten, eigene Nummern) |
| `lib/session/sieben.ts` | Der Sieben-Saiter-Modus: drei Blöcke, eigener Vorrat |
| `components/session/lick-runner.tsx` | Der zweite Eingang: ein Lick allein, ohne Session |
| `components/session/sieben-runner.tsx` | Der dritte Eingang: zehn Minuten Siebensaitige |
| `lib/session/merch.ts` | Der Merch-Stand: Rang, Aufnäher, Tourshirts — alles aus den Logs |
| `components/session/merch-stand.tsx` | Rang, Kutte und Tourshirts als Bildschirm |
| `lib/session/shirt.ts` | Tourshirts als Pixelbild: Schnitt, Stofffarbe, Druck — gerechnet |
| `lib/session/technik-zeichen.ts` | Ein 16 × 16 Pixelzeichen je Technik — für die Drill-Liste und gestickt als Technik-Wappen |
| `public/merch/`, `public/bilder/` | Pixelkunst: Rangszenen, Aufnäher, Willkommens-Szene |
| `lib/session/rueckblick.ts` | Der Rückblick: Wochen, Tempo und Streuung je Drill — aus dem Log |
| `components/session/rueckblick.tsx` | Säulen und Linien dazu, jede Grafik auch als Tabelle |
| `lib/ui/kontrast.ts` | WCAG-Kontrast als Rechnung — Grundlage des Lesbarkeitstests |
| `lib/ui/darstellung.ts` | Hell, dunkel oder Auto: die Regel, und das Skript, das sie vor dem ersten Anstrich setzt |
| `components/session/darstellung-panel.tsx` | Die Wahl dazu, auf *Daten* |
| `lib/backup-erinnerung.ts` | Wann eine Sicherung fällig ist. Rein, getestet. |
| `lib/storage/lokal.ts` | Was das Gerät über sich weiss: letzte Sicherung, Willkommen |
| `hooks/use-install.ts` | `beforeinstallprompt` — und der iOS-Fall, der keines hat |
| `landing/index.html` | Startseite zum Ablegen auf einer fremden Seite. Eine Datei. |
| `assets/logo/plektrum.txt` | Das Zeichen als Pixelraster, 32 × 32. Quelle für alle Icons und den Banner. |
| `tools/icons.mjs` | Erzeugt `public/icons/` daraus — von Hand gepflegt laufen sie auseinander |
| `tools/readme-bilder.mjs` | Banner, Rangleiter und Kutte der READMEs, aus derselben Pixelkunst |
| `tools/pixel.mjs` | PNG lesen und schreiben, ganzzahlig vergrössern, SVG aus Rechtecken — ohne Browser |
| `lib/theory/cards.ts` | Der Wissenskatalog (reine Daten) |
| `lib/theory/rhythm.ts` | Rhythmusfiguren als Zeitpunkte, und ihre Bewertung |
| `lib/storage/theory-log.ts` | localStorage, einziger Zugriffspunkt auf die Antworten |
| `components/theory/*` | Griffbrett, Fragekarte, Übersicht |
| `lib/update/version.ts` | Bau-Stempel vergleichen: eigene Fassung, Server, Original |
| `lib/update/check.ts` | Holt Stempel und Original-Commits, leert den Cache |
| `tools/version.mjs` | Schreibt den Bau-Stempel — läuft vor jedem Build |
| `tools/shots.mjs` | Die README-Bildschirme, aus echten Seiten mit Beispieldaten |
| `.github/workflows/audit.yml` | `pnpm audit` einmal die Woche, unabhängig von Commits |
| `lib/base-path.ts` | Präfix für Laufzeit-Pfade unter GitHub Pages |
| `public/sw.js`, `public/manifest.json` | PWA: offline und installierbar |
