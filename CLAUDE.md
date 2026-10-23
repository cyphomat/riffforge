# Riffforge

## Arbeitsweise

Ich arbeite mit einem privaten Abo, das Kontingent ist schnell leer. Ich neige dazu, überall Opus zu nehmen, weil ich es von der Arbeit gewohnt bin.

Sag mir deshalb zu Beginn jeder neuen Aufgabe in einem Satz, welches Modell dafür reicht (Haiku, Sonnet oder Opus). Standard ist Sonnet. Opus nur, wenn die Aufgabe wirklich schwer ist oder Sonnet schon zweimal gescheitert ist. Wenn ich gerade auf einem größeren Modell arbeite als nötig, sag es mir.

Wenn die Aufgabe mehrere Dateien oder mehrere Schritte betrifft oder schwer rückgängig zu machen wäre, schlag mir erst einen kurzen Plan vor. Ich gebe ihn frei, dann setzt du um. Bei einer kleinen Änderung an einer Datei brauchst du keinen Plan.

Spar Kontingent: Lies nur die Dateien, die du für die Aufgabe brauchst. Starte keine Subagents oder parallelen Aufgaben ohne meine Aufforderung. Sag mir, wenn die Unterhaltung so lang geworden ist, dass eine neue Session sinnvoll wäre.

Kommuniziere auf Deutsch, kurz und konkret.

Eine Übungs-App für Metal-Gitarre. Kein Kurskatalog — eine **Session-Maschine**:
starten, ~15 Minuten üben, fertig, morgen wieder.

## Das Produktmodell

Eine Session ist immer gleich aufgebaut, damit sie keine Entscheidung kostet:

```
Warm-up     2 min    Finger wach kriegen
2 Fragen    ~40 s    Wissen, grundiert auf den nächsten Block
Technik     ~3 min   eine Sache isoliert, mit Metronom
Riff        ~3 min   dieselbe Technik im musikalischen Kontext
2 Fragen    ~40 s    Wissen, quer durch alles Fällige
Technik     ~3 min   zweite Runde, mit Abstand dazwischen
Riff        ~3 min   zweite Runde
Abschluss            Selbsteinschätzung → landet im Log
```

Am Ende: *Feierabend* oder *+5 Minuten*. Was in den Blöcken steckt, entscheidet
der Scheduler aus dem Übungs-Log — die **Form** ist fix, der **Inhalt** passt
sich an.

Die zwei Runden mit Abstand sind kein Zufall: verteilte Wiederholung behält
sich besser als eine lange am Stück. Und **kein Drill läuft länger als drei
Minuten am Stück** (`MAX_AM_STUECK`), auch ein neuer nicht — siehe
`docs/session-und-bildschirme.md`.

## Architektur

Jede Datei und ihre Rolle: `docs/architektur.md`. Im Überblick:

- `lib/session/` — reine Logik: Scheduler, Fortschritt, Merch, Rückblick. Die Tests liegen dort.
- `lib/theory/` — Wissen: Karten, FSRS, Griffbrett, Lick-Grammatik, Sieben-Saiter-Rechnung.
- `lib/audio/` — Web Audio: der eine AudioContext, Metronom, Onset-Erkennung, Timing, YIN, Stimmgerät.
- `lib/storage/`, `lib/sync/` — localStorage als einziger Zugriffspunkt; GitHub-Abgleich als einziger Netz-Zugriff.
- `lib/ui/`, `lib/update/` — Kontrast und Hell/Dunkel; Bau-Stempel und Update-Erkennung.
- `components/`, `app/` — UI und Seiten; Farben als Variablen in `app/globals.css`.
- `tools/`, `public/`, `assets/` — Icons, README-Bilder, PWA, Pixelkunst.

**Kernregel:** Die Logik in `lib/session/` ist rein und ohne React oder
Browser-APIs. Deshalb ist sie testbar — und deshalb liegen dort die Tests.
Neue Regeln zu Tempo, Auswahl oder Fortschritt gehören dorthin, nicht in eine
Komponente.

## Konventionen

- **Persistenz nur über `lib/storage/practice-log.ts`.** Kein direkter
  `localStorage`-Zugriff sonst. Der Umzug auf IndexedDB oder einen Server soll
  eine Änderung an einer Stelle sein.
- **Alles Gespeicherte geht durch ein Zod-Schema.** Kaputte Daten werden
  beiseitegelegt, nie stillschweigend verworfen.
- **Kein `AudioContext` vor einer Nutzergeste.** Browser blockieren das, iOS
  lässt ihn sonst dauerhaft suspendiert.
- **Timer laufen gegen die Wanduhr**, nicht per Dekrement — sonst geht ein
  Hintergrund-Tab nach.
- **UI-Text ist deutsch, Code und Kommentare englisch.**
- **Ein AudioContext für alles.** Metronom und Mikrofon müssen auf derselben
  Uhr liegen, sonst ist jede Timing-Messung Rauschen. Nie einen zweiten anlegen.
- **Theorie gehört an den Drill** (`why`-Feld), nicht in einen eigenen Bereich.
- **Die Design-Sprache kommt aus Setlist.** Matte Flächen, Bernstein nur auf
  dem, was zählt, Stahlblau für alles Zweitrangige, harte Kanten mit 2 px.
  Farben stehen als CSS-Variablen in `app/globals.css`, nicht als Hex-Werte in
  Komponenten. Road-Case, kein HUD.
- **Beim Abgleich gewinnt keine Seite.** Konflikt heisst: neu lesen, erneut
  verschmelzen, noch einmal schreiben — und dann aufhören. Genau ein zweiter
  Versuch, sonst hängt es.
- **Der Log ist append-only.** Einträge sind unveränderlich und über
  `drillId` plus `at` identifiziert. Deshalb ist Verschmelzen die richtige
  Antwort auf zwei Stände, nicht "der neuere gewinnt" — nie überschreiben.
- **Songs sind Daten, ihr Lernziel wird nachgerechnet.** Ein Song gilt erst, wenn
  `songs.test.ts` ihn durchlässt (`pruefeSong`); Tabulatur, Notenschrift und
  Wiedergabe fallen aus denselben Noten.
- **TypeScript bleibt auf 6.** TypeScript 7 ist der Neubau in Go und hat
  keine JavaScript-Schnittstelle; `typescript-eslint` (über
  eslint-config-next) verlangt ausdrücklich unter 6.1, und Next ruft beim
  Bauen die Schnittstelle auf. Der Sprung auf 7 kommt, wenn beide so weit
  sind — nicht vorher.

## Veröffentlichen und Recht

- Neue Tests: die Testzahl im Abzeichen **beider** READMEs nachziehen. Katalog geändert: die Drill-Tabellen in beiden Sprachen. Beide READMEs haben dieselbe Gliederung.
- Alle Drills und Riffs sind **eigene** Übungen — keine abgeschriebenen Tabs, kein Audio geschützter Aufnahmen. Code unter **MIT**, Autor nur **@cyphomat** (kein Klarname, keine E-Mail).
- Ausführlich: `docs/lieferung-und-werkzeugkette.md`.

## Befehle

```bash
pnpm dev      # Entwicklung
pnpm test     # Vitest (Logik in lib/session und lib/audio)
pnpm check    # tsc --noEmit && vitest run && eslint .
pnpm build    # statischer Export nach out/
pnpm audit    # muss leer bleiben, siehe docs/lieferung-und-werkzeugkette.md
```

## Deployment

Statischer Export auf GitHub Pages, per Actions bei Push auf `main`. Pages
liefert unter `/<repo>/` aus:

- Pfade, die **Next erzeugt**, bekommen `basePath` automatisch.
- Pfade, die **zur Laufzeit** entstehen — `audioWorklet.addModule`,
  `serviceWorker.register` — müssen durch `asset()` aus `lib/base-path.ts`.
  Das ist die Stelle, an der es sonst still im Unterverzeichnis danebengreift.

`output: "export"` heißt: keine API-Routen, keine Server-Komponenten mit
Laufzeitlogik, kein `next/image`-Optimizer.

`next.config.mjs` unterdrückt **keine** Fehler mehr. TypeScript- und
ESLint-Fehler brechen den Build — bitte so lassen.

## Weiterlesen — nur bei Bedarf

Die langen Begründungen und Entstehungsgeschichten liegen in `docs/`. Nicht vorab lesen, sondern erst, wenn die Aufgabe das Thema berührt:

- `docs/architektur.md` — jede Datei und ihre Rolle. Lies, wenn du eine Datei suchst oder eine neue anlegst.
- `docs/design-und-themes.md` — Farben und Farbsemantik (Rost/Rot), Kontrast, hell/dunkel, Schriften, Flächen, Metal-Twist-Bauteile, Tailwind 4, Layout ab 900 px. Lies bei CSS, Farben, Schriften, Bauteilen.
- `docs/marke-und-merch.md` — Plektrum-Zeichen, Wortmarke, Pixelkunst, Merch-Stand, Aufnäher, Tourshirts. Lies bei Logo, Icons, Bildern und allem unter `/merch`.
- `docs/session-und-bildschirme.md` — Tempo, Profil, Drei-Minuten-Grenze, *Heute* und die Ansage, Kalender, Rückblick mit Pult, Abschluss-Zettel. Lies bei `lib/session/builder.ts`, `progress.ts` und diesen Bildschirmen.
- `docs/songs-und-notenschrift.md` — Songs mit Lernziel, Raster-Regel, Notensatz, Wiedergabe und Nachklang, Song-Blöcke, Klang prüfen ohne Browser. Lies bei `song*.ts`, `notensatz.ts`, `noten-view.tsx`, `song-ansicht.tsx`.
- `docs/lead-und-sieben-saiter.md` — Lick-Grammatik, Tabulatur-Umbruch, `/lick`, Sieben-Saiter-Modus. Lies bei `lick.ts`, `lead.ts`, `sieben*`.
- `docs/audio-und-timing.md` — Versatz und Streuung, Einmessen, Figuren, Stimmgerät, Saitenwechsel, offene Punkte. Lies bei allem in `lib/audio/`.
- `docs/wissen-und-theorie.md` — Wissenskarten, FSRS, Griffbrett-Trainer, CAGED, Hörfragen, Dreiklänge. Lies bei `lib/theory/` außer Lick, Songs und Sieben-Saiter.
- `docs/daten-und-abgleich.md` — localStorage, Zod, Abgleich, Löschen, Sicherung, Installieren, Netz-Regel. Lies bei `lib/storage/`, `lib/sync/`, `lib/backup*`.
- `docs/lieferung-und-werkzeugkette.md` — `pnpm audit`, Abhängigkeiten, TypeScript 6, Build-Rechte, Bau-Stempel, Linter, README-Pflege, Lizenz. Lies bei Abhängigkeiten, Workflows, Veröffentlichen.

Pflegeregel: Kommt eine Konvention hinzu, steht ihre Ein-Satz-Regel hier und die Begründung in der passenden docs-Datei.
