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
| `components/session/stimmgeraet.tsx` | Der vierte Eingang: das Stimmgerät, `/stimmen`; eingebettet auch im Start-Schirm |
| `lib/session/saiten.ts` | Wann die Saiten je Gitarre fällig sind: Spieltage, Tage seit dem Wechsel |
| `lib/session/types.ts` | Domänen-Typen + Zod-Schemas für alles Persistierte |
| `lib/session/drills.ts` | Der Übungs-Katalog (reine Daten) |
| `lib/session/progress.ts` | Auswertung des Logs: Tempo-Fortschreibung, Streak, Mastery, `heuteGeuebt` |
| `lib/session/session-stand.ts` | Wo die laufende Session steht (Schema, `stehtNoch`, Log zu Beginn zurückgerechnet) |
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
| `lib/theory/bewertung.ts` | Welche Note nach einer Frage vorgeschlagen wird, und wann die volle Wahl bleibt |
| `lib/theory/fsrs.ts` | FSRS-6, portiert aus der Referenz. Rein, gegengeprüft. |
| `lib/theory/types.ts` | Karten, Fragen und der Antwort-Log |
| `lib/theory/progress.ts` | Kartenstand aus dem Antwort-Log, Auswahl fürs Abfragen |
| `lib/theory/fretboard.ts` | Griffbrett als Rechnung: Töne, Intervalle, Lagen |
| `lib/theory/hals.ts` | Die Maße des Halses — für das antippbare Griffbrett |
| `lib/theory/caged.ts` | CAGED als Rechnung: fünf offene Griffe, in jede Tonart verschoben |
| `lib/theory/dreiklaenge.ts` | Dreiklänge in enger Lage auf drei benachbarten Saiten |
| `lib/theory/gehoer.ts` | Hörfragen: Reihenfolge, Auswahl, die gewürfelten Tonpaare; dazu die sechs Leersaiten (Auswahl, Reihenfolge, Ton) und der Anker (die tiefe E, zwölf Töne darüber, ihre Stelle auf dem Hals) |
| `lib/audio/zupfen.ts` | Ein gezupfter Ton aus Obertönen — rein, auf den Cent gemessen |
| `lib/audio/song-ablauf.ts` | Wann in einem Song-Durchgang was erklingt, in Sekunden — rein, das Tempo nachgerechnet |
| `lib/audio/song-player.ts` | Spielt einen Song auf der einen Uhr: Durchgänge im Voraus planen, Schleife, Einzähler, Klick. Anhalten trennt den Master-Knoten |
| `lib/theory/drill-spiel.ts` | Wie ein Drill klingt: je Drill ein Raster und eine Figur in Wörtern (`6:0 . m0 x`), dazu der Leser `liesFigur`. Die Tabulatur ist Text und kein Zeitraster, deshalb steht der Klang daneben und `drill-spiel.test.ts` hält beide gegeneinander |
| `lib/audio/drill-ablauf.ts` | Wann was in einer Figur erklingt, in Sekunden: Akzent auf dem Schlag, Palm Mute und tote Note kurz, Slide und Bending als Gleiten. Rein |
| `lib/audio/drill-player.ts` | Spielt die Figur auf der einen Uhr ab, wie `SongPlayer`, aber mit Akkorden, Klacken, dumpfem Filter und Tonhöhen-Gleiten |
| `components/session/drill-bedienung.tsx` | Anhören, Schleife, Klick unter der Tabulatur im Block; nur vor dem Los und in der Pause |
| `components/session/song-bedienung.tsx` | Anhören, Tempo, Schleife und Klick für einen Song; den `AudioEngine` bringt der Aufrufer mit |
| `components/session/song-ansicht.tsx` | Was ein Song-Block zeigt: Notenschrift, Tonnamen auf Wunsch, Anhören — nicht während der Block läuft |
| `components/theory/intervall-hoeren.tsx` | Spielt die Töne einer Hörfrage: zwei bei einem Intervall (`IntervallHoeren`), einen bei einer Leersaite (`SaiteHoeren`), Anker plus Ton bei einer Ankerkarte (`AnkerHoeren`) |
| `lib/theory/hals-trainer.ts` | Der Griffbrett-Trainer als Rechnung: 72 Stellen × 2 Richtungen, FSRS |
| `lib/theory/hals-id.ts` | Das Präfix `hals-` — damit der Trainer nicht als Wissen zählt |
| `components/theory/effekt-lexikon.tsx` | Das Lexikon unter `/wissen/effekte`: Kette in vier Stationen, Filter, Einträge |
| `components/theory/hals-trainer.tsx` | Der fünfte Eingang: Griffbrett-Trainer, `/griffbrett` |
| `lib/theory/lick.ts` | Lead-Licks als Grammatik: Motiv, Entwicklung, Anlauf, Auflösung |
| `lib/session/lead.ts` | Hängt das gerechnete Lick an einen Drill mit fester Nummer |
| `lib/session/drills-songs.ts` | Die Songs als Drills: Riff, `pentatonic`, Tab aus den Noten — hängt am Hauptkatalog |
| `lib/theory/song.ts` | Songs mit Lernziel: Schema, Töne, Abstände, Notenwerte, Pausen — und `pruefeSong`, das das Lernziel nachrechnet |
| `lib/theory/songs.ts` | Der Song-Katalog (reine Daten, von der AI geschrieben, durch `songs.test.ts` geprüft) |
| `lib/theory/song-tab.ts` | Die Tabulatur eines Songs als Text (`drill.tab`, Export); im Song-Block zeichnet `TabSvg` sie aus `notensatz.ts` |
| `lib/theory/notensatz.ts` | Der Notensatz als Rechnung: Position auf der Linie, Hälse, Balken, Pausen, Systeme. Rein |
| `components/session/noten-view.tsx` | Zeichnet den Notensatz als SVG; ein Takt je Zeile auf schmalem Platz, zwei auf breitem. `NotenMitTab`: unter jedem System seine Tabulatur (`TabSvg`, selbe Spalten wie die Noten) |
| `lib/theory/sieben.ts` | Die Siebensaitige als Rechnung: B Standard, Abstände, Frequenzen |
| `lib/session/drills-sieben.ts` | Der Sieben-Saiter-Katalog (reine Daten, eigene Nummern) |
| `lib/session/sieben.ts` | Der Sieben-Saiter-Modus: drei Blöcke, eigener Vorrat |
| `components/session/lick-runner.tsx` | Der zweite Eingang: ein Lick allein, ohne Session |
| `components/session/sieben-runner.tsx` | Der dritte Eingang: zehn Minuten Siebensaitige |
| `lib/session/anlaesse.ts` | Anlässe: Regeln (fix, Ostern, n-ter Wochentag, Datum), Phasen, Rang, Sätze — rein. Port aus Setlist |
| `components/session/anlass-banner.tsx` | Der Streifen auf *Heute* unter der Ansage |
| `components/session/saisonal-panel.tsx` | Der Schalter dazu, auf *Daten* |
| `lib/session/letztes-tempo.ts` | Das Tempo des zuletzt gespielten Blocks aus dem Log, nach Zeitstempel; `null` außerhalb der Grenzen. Rein |
| `lib/theory/effekte.ts` | Das Pedal- und Effektlexikon: Einträge mit Platz in der Signalkette (reine Daten), geprüft von `effekte.test.ts` |
| `lib/theory/noten-karten.ts` | Wissenskarten mit Notenbild: Antwort aus dem Bild gerechnet, Bilder als echte `Song`-Daten |
| `lib/session/gitarren.ts` | Die Gitarrenroulette: Rack-Schema, Standardliste, Würfeln je Durchgang — rein |
| `components/session/gitarren-panel.tsx` | Das Rack bearbeiten, auf *Daten* |
| `components/session/start-gitarre.tsx` | Start-Schirm eines frischen Durchgangs: gewürfelte Gitarre, neu würfeln, Stimmgerät aufklappen |
| `lib/session/merch.ts` | Der Merch-Stand: Rang, Aufnäher, Tourshirts — alles aus den Logs |
| `components/session/merch-stand.tsx` | Rang, Kutte und Tourshirts als Bildschirm |
| `lib/session/gurt.ts` | Der Gurt: Riff-Plektren, Aussehen aus der Drill-ID, Patina und Staub — rein, alles aus dem Log |
| `lib/session/drops.ts` | Drop-Schema, Sichtbarkeit nach Datum, Freischaltung nach Übungstagen im Monat — rein |
| `lib/session/drops-daten.ts` | Die Drops, ein Datensatz je Monat; `drops.test.ts` prüft Fakt und Quelle |
| `lib/session/roadie.ts` | Die Sätze des Roadies: Grundsprüche, Drop-Sprüche, Satz zur Übung — der Tag wählt, nicht der Zufall |
| `components/session/plektrum.tsx` | Ein Plektrum als SVG: Form, Material, Patina, Staub |
| `components/session/gurt-ansicht.tsx` | Gurt und Drops auf dem Merch-Stand |
| `lib/session/wochengegner.ts` | Der Wochengegner: 20 Lebenspunkte, Treffer aus vier Quellen mit Deckel, Sieg durch eine Session, Combo — rein, alles aus Log und Wissens-Log |
| `components/session/wochengegner-karte.tsx` | Gegner der Woche mit Lebensleiste auf *Heute* |
| `components/ui/pixel-gegner.tsx` | Das Verstärker-Monster als Pixelbild aus Rechtecken |
| `lib/session/band.ts` | Die Band: wer nach dem Rang dabei ist und wer auf diesem Gerät mitspielt — rein |
| `lib/audio/band-ablauf.ts` | Was Schlagzeug und Bass in einem Durchgang spielen (Rock-Beat in Achteln, Grundton auf jedem Schlag) — rein, in Sekunden |
| `lib/audio/band.ts` | Die Klänge des Schlagzeugs (Kick, Snare, Hi-Hat), synthetisch |
| `lib/session/riffbuch.ts` | Das Riffbuch: Schema, Eintragen mit erstem Datum, Stand — rein; gespeichert wird in `lokal.ts` |
| `components/session/riffbuch-ansicht.tsx` | Das Riffbuch auf dem Merch-Stand |
| `lib/session/repertoire.ts` | Das Repertoire: echte Songs mit Abschnitten, Lernstand und Sound — Schema, Regeln, Fortschritt und Übetempo in BPM, rein, keine Noten; gespeichert wird in `lokal.ts` |
| `lib/session/repertoire-formular.ts` | Formulareingaben als Text: in einen Song oder Abschnitt wandeln, Fehler mit Feldnamen auf Deutsch — rein |
| `components/session/repertoire-ansicht.tsx` | `/drills/repertoire`: Liste mit Fortschritt, der offene Song steht in `?song=` |
| `components/session/repertoire-song.tsx` | Ein Song: Abschnitte, Status mit einem Tipp, Sound, Löschen |
| `components/session/repertoire-formulare.tsx` | Formulare für Song und Abschnitt, Löschen mit Rückfrage |
| `lib/session/board-daten.ts` | Pedale und Amps als Daten (eigene Namen, keine Marken), Schemas; jedes Pedal trägt die Kennung seines Lexikon-Eintrags |
| `lib/session/board.ts` | Das Board als Rechnung: Besitz, Wahl, Reihenfolge nach dem Effektlexikon, Kette für die Wiedergabe — rein |
| `lib/session/quests-daten.ts`, `quests.ts` | Quests mit Lohn fürs Board; Fortschritt und Besitz fallen aus beiden Logs — rein |
| `lib/session/zugabe.ts` | Welches Riff die Zugabe spielt: der zuletzt geübte Song, sonst ein Advents-Riff nach Tag |
| `lib/audio/board.ts` | Das Board als Web-Audio-Kette (Sättigung, Chorus, Tremolo, Delay, Hall, Amp-Filter) am einen AudioContext |
| `lib/storage/board.ts` | `aktivesBoard()`: Besitz aus den Logs, Wahl vom Gerät, als Klang für den Player |
| `components/session/board-ansicht.tsx` | Board und Quests auf dem Merch-Stand, mit Probe zum Hören |
| `components/session/zugabe-knopf.tsx` | Zugabe auf dem Abschluss-Zettel |
| `lib/session/album.ts` | Das Jahresalbum: Tracks, Titel, Format und Cover-Pixel aus beiden Logs — rein |
| `components/session/album-ansicht.tsx`, `app/album/page.tsx` | Die Seite `/album`: Cover, Trackliste, Rückseite |
| `components/session/album-cover.tsx`, `album-karte.tsx` | Das Cover als SVG; die Karte zum Album am Merch-Stand |
| `components/session/rampenlicht.tsx` | Eine Gitarre aus dem Rack groß unter dem Scheinwerfer, reine Anzeige |
| `components/session/advent-gurt.tsx` | Die Advents-Plektren am Gurt |
| `lib/session/advent.ts` | Der Advent: welche Türchen offen sind (Übungstage im Dezember), Tage der Aufnäher — rein, alles aus dem Log |
| `lib/session/advent-daten.ts` | Die 24 Türchen: Mini-Riffe, Plektren, Tipps, zwei Aufnäher; Schemas für Plektrum, Tipp und Riff |
| `components/session/advent-karte.tsx` | Karte auf *Heute* im Dezember |
| `components/session/advent-ansicht.tsx`, `app/advent/page.tsx` | Die Seite `/advent` mit den Türchen |
| `tools/advent.mjs` | Der Advents-Aufnäher nach `public/merch/aufnaeher-advent.png` |
| `components/session/roadie-heute.tsx` | Roadie-Satz und Karte des neuen Drops auf *Heute*; `RoadieBild` auch im Abschluss-Zettel |
| `tools/drops.mjs` | Die Drop-Bühnen nach `public/bilder/drop-*.png` und der Roadie nach `public/bilder/roadie.png` |
| `lib/session/shirt.ts` | Tourshirts als Pixelbild: Schnitt, Stofffarbe, Druck — gerechnet |
| `lib/session/technik-zeichen.ts` | Ein 16 × 16 Pixelzeichen je Technik — für die Drill-Liste und gestickt als Technik-Wappen |
| `public/merch/`, `public/bilder/` | Pixelkunst: Rangszenen, Aufnäher, Willkommens-Szene |
| `lib/session/rueckblick.ts` | Der Rückblick: Wochen, Tempo und Streuung je Drill — aus dem Log |
| `components/session/rueckblick.tsx` | Säulen und Linien dazu, jede Grafik auch als Tabelle |
| `lib/ui/kontrast.ts` | WCAG-Kontrast als Rechnung — Grundlage des Lesbarkeitstests |
| `lib/ui/feuer.ts` | Die Rechnung des Pixelfeuers: Palette, Feld, ein Schritt. Rein, der Zufall kommt von aussen. |
| `components/ui/pixel-feuer.tsx` | Zeichnet das Feuer auf eine Canvas; nur auf *Heute*, nicht bei „Bewegung reduzieren" |
| `lib/ui/session-wache.ts` | Ob ein Block läuft; die Navigation fragt dann vor dem Verlassen |
| `lib/ui/darstellung.ts` | Hell, dunkel oder Auto: die Regel, und das Skript, das sie vor dem ersten Anstrich setzt |
| `components/session/darstellung-panel.tsx` | Die Wahl dazu, auf *Daten* |
| `lib/backup-erinnerung.ts` | Wann eine Sicherung fällig ist. Rein, getestet. |
| `lib/storage/lokal.ts` | Was das Gerät über sich weiss: letzte Sicherung, Willkommen, Darstellung, Saisonales, Stand der laufenden Session |
| `hooks/use-install.ts` | `beforeinstallprompt` — und der iOS-Fall, der keines hat |
| `hooks/use-scroll-top.ts` | Springt nach oben, wenn ein Bildschirm den vorigen an Ort und Stelle ablöst |
| `landing/index.html` | Startseite zum Ablegen auf einer fremden Seite. Eine Datei. |
| `assets/logo/totenkopf.txt` | Das Zeichen (ein Totenkopf) als Pixelraster, 32 × 32. Quelle für alle Icons, `app/icon.svg` und den Banner. |
| `tools/icons.mjs` | Erzeugt `public/icons/` daraus — von Hand gepflegt laufen sie auseinander |
| `tools/readme-bilder.mjs` | Banner, Rangleiter und Kutte der READMEs, aus derselben Pixelkunst |
| `tools/anlaesse.mjs` | Die Anlass-Motive nach `public/bilder/anlass-*.png` und die Aufnäher nach `public/merch/aufnaeher-anlass-*.png` |
| `tools/gitarren.mjs` | Die Rack-Gitarren, je Rang eine, nach `public/merch/gitarre-*.png` |
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
