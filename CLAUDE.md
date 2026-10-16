# Riffforge

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
sich besser als eine lange am Stück. Ein Drill **ohne** Vorgeschichte bekommt
seinen Block trotzdem am Stück — Erlernen und Behalten verlangen
Verschiedenes.

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
| `lib/session/technik-zeichen.ts` | Ein 16 × 16 Pixelzeichen je Technik, für die Drill-Liste |
| `public/merch/`, `public/bilder/` | Pixelkunst: Rangszenen, Aufnäher, Willkommens-Szene |
| `lib/session/rueckblick.ts` | Der Rückblick: Wochen, Tempo und Streuung je Drill — aus dem Log |
| `components/session/rueckblick.tsx` | Säulen und Linien dazu, jede Grafik auch als Tabelle |
| `lib/ui/kontrast.ts` | WCAG-Kontrast als Rechnung — Grundlage des Lesbarkeitstests |
| `lib/backup-erinnerung.ts` | Wann eine Sicherung fällig ist. Rein, getestet. |
| `lib/storage/lokal.ts` | Was das Gerät über sich weiss: letzte Sicherung, Willkommen |
| `hooks/use-install.ts` | `beforeinstallprompt` — und der iOS-Fall, der keines hat |
| `landing/index.html` | Startseite zum Ablegen auf einer fremden Seite. Eine Datei. |
| `assets/logo/plektrum.svg` | Das Zeichen. Quelle für alle Icons. |
| `tools/icons.mjs` | Erzeugt `public/icons/` daraus — von Hand gepflegt laufen sie auseinander |
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
- **Breit ab 900 px** (`wide:` in Tailwind), wie bei Setlist. Die Reihenfolge im
  Markup bleibt gleich — `.zwei-spalten` stapelt auf dem Handy einfach. Der
  Abschluss-Bildschirm bleibt schmal: er ist eine Entscheidung, keine Übersicht.
- **Die Design-Sprache kommt aus Setlist.** Matte Flächen, Bernstein nur auf
  dem, was zählt, Stahlblau für alles Zweitrangige, harte Kanten mit 2 px.
  Farben stehen als CSS-Variablen in `app/globals.css`, nicht als Hex-Werte in
  Komponenten. Road-Case, kein HUD.
- **Lesbarkeit ist eine Zahl.** `lib/ui/__tests__/kontrast.test.ts` liest die
  Farben aus `globals.css` und rechnet jede Paarung nach, die als Text
  vorkommt — AA, also 4,5 : 1. Der Anlass war kein Geschmacksurteil: `--dim`
  stand auf #57535c, das sind **2,4 : 1** gegen eine Karte, und trug trotzdem
  fünfundvierzig Textstellen in fünfzehn Dateien. Die App war an Dutzenden
  Stellen schlicht nicht lesbar, und gemerkt hat es niemand, weil Lesbarkeit
  bis dahin Geschmack war statt einer Prüfung. Der schwierigste Grund ist
  `--panel2`, das helle Ende des Kartenverlaufs — dort ist mein erster
  Kandidat mit 4,47 gescheitert, und der Test hat ihn beim ersten Lauf
  abgewiesen. Wer eine Farbe anfasst, lässt ihn laufen.
- **Klein und gesperrt ist zweimal schlecht.** Die Etiketten standen auf
  10,5 px mit 0,22 em Sperrung; Versalien in Monospace so weit auseinander
  zerlegen das Wortbild, und auf einem Handy kommt beides zusammen. Der Boden
  ist jetzt 11,5 px, die Sperrung höchstens 0,14 em. Wer ein Etikett setzt,
  nimmt `.kicker` statt eigener Pixelwerte — sonst wandert der Boden wieder
  nach unten.
- **Der Grund ist matt.** Bis Oktober lag ein ganzer Hals als Hintergrund
  auf der Seite — Saiten, Bünde, Einlagen, gekachelt aus `lib/theory/hals.ts`,
  mit einem Regler und einem Test, der die Einlagen im Stylesheet nachrechnete.
  Er ist in drei Anläufen an drei verschiedenen Stellen gescheitert: erst
  unsichtbar, weil er im Register von `--raster` lag; dann hochgezogen und
  auf einem OLED unruhig; dann schien er durch das antippbare Griffbrett und
  setzte fremde Punkte zwischen die Bünde, und zuletzt lag er hinter Listen,
  die selbst aus Linien bestehen. Daniels Urteil: stört mehr, als es hilft.
  Der Grund für alle drei Fehlschläge ist derselbe — **der Inhalt dieser App
  ist aus Linien und Punkten gemacht**: Tabulaturen, Griffbrett,
  Skalenstriche, Trennlinien. Ein Grund, der dieselbe Sprache spricht,
  konkurriert mit ihm, egal wie leise er gestellt ist. Textur gehört auf
  Flächen (Tolex auf `.card`), nicht auf den Grund; `hals.test.ts` hält fest,
  dass dort keiner mehr liegt. Wer ein Flächenmuster erwägt, prüft es zuerst
  hinter dem Griffbrett und hinter einer Liste — dort ist es gescheitert.
- **Ein Instrument zum Ablesen bekommt eine eigene Fläche.** Griffbrett und
  Tabulatur stehen auf `--sunken`, mit Rand. Das war zuerst die Antwort auf
  den durchscheinenden Hals, ist aber auch ohne ihn richtig: was man liest,
  während die Hände spielen, soll sich vom Rest des Bildschirms abheben.
- **Vier Bauteile tragen den Metal-Twist, und jedes hat eine Grenze.**
  `.winkel` sind die Eckwinkel am Road-Case — **höchstens zwei je Bildschirm**,
  und nur auf dem, was gerade dran ist: die Ansage auf *Heute*, der laufende
  Block, der Wissens-Kopf, der Rang im Merch-Stand. Ein Winkel an jeder Fläche wäre Dekoration.
  `.platte` ist das eingelassene Blech mit Skalenstrichen und Glimmen, und es
  trägt **die** Zahl, auf die es auf dem jeweiligen Bildschirm ankommt: das
  Tempo im Block, die drei Zahlen unter *Bisher*. Nicht jede Zahl — dann wäre
  keine mehr die Heldenzahl. `.jewel` ist die Kontrolllampe am Netzschalter;
  ihre Farbe kommt über `currentColor` von aussen, damit sie denselben Zustand
  zeigt, den das Wort daneben schon nennt, und keinen eigenen erfindet.
  `.warnstreifen` markiert **nur verletzte Bedingungen** — Mikrofon
  verweigert, Fassung zurückgerollt, Abgleich gescheitert —, nie einen Fehler
  und nie Schmuck.
- **Der Taktzähler ist eine Spielhilfe, kein Bedienelement.** Er stand als
  vier Quadrate von zehn Pixeln in der Knopfreihe — genug zum Ablesen, aber
  unbrauchbar für den, der das Gerät auf dem Notenständer hat: im Augenwinkel
  kommen Fläche und Helligkeitswechsel an, keine Formen. Jetzt über die volle
  Breite, 42 px hoch, und **über** den Knöpfen statt zwischen ihnen; in die
  Knopfreihe sieht man, wenn man drücken will. Gezählt werden **Schläge,
  nicht Klicks**: bei Klick auf Achteln blinkte er sonst achtmal je Takt, und
  acht Wechsel je Takt sind im Augenwinkel ein Flackern statt eines Pulses.
  Die Eins bleibt auch im Ruhezustand markiert, damit man nach einem Blick
  zur Griffhand wiederfindet, wo der Takt anfängt.
- **Der Twist gehört dorthin, wo der Nutzer ist.** Als die vier Bauteile
  fertig waren, sass genau eines davon auf *Heute* — dem Bildschirm, der
  täglich aufgeht; der Rest lag hinter dem Startknopf oder in Fehlzuständen,
  die man hoffentlich nie sieht. Beim Bauen fällt auf, woran man gerade baut.
  Wer ein Bauteil hinzufügt, prüft deshalb zuerst *Heute*.
- **Ein leeres Raster ist keine Auskunft.** Der Übungskalender zeigte feste
  sechzehn Wochen — einem Wiedereinsteiger also hundertzwölf leere Kästchen
  und darunter „0 von 112 Tagen". `weeksFor` lässt ihn mit dem Log wachsen.
  Dabei die Falle, in die ich prompt gelaufen bin: weniger Wochen heissen
  weniger Spalten, und `1fr` bläst die Zellen auf — das Raster wurde
  *grösser*. Die Zellgrösse ist deshalb gedeckelt und die Platte schrumpft
  aufs Raster statt auf die Spalte.
- **Das Zeichen ist ein Plektrum, und es wird bei 48 px entschieden.** Das
  alte Icon war ein Amboss mit einem Vierstrahl-Stern: „Forge" war drin,
  „Riff" nicht, der Funke las sich als KI-Glyph, und die liegende Silhouette
  wurde auf dem Homescreen ein Klumpen. Beim Neubau sind neun Entwürfe
  gescheitert — Kopfplatte, Griffbrett, zwei Plektren, Plektrum im Case —
  und zwar **alle an derselben Spalte**: bei 48 px überlebt nur eine fette,
  geschlossene Silhouette. Feine Linien zerfallen, dünne Formen werden
  Striche, mehrfarbige Bänder werden Candy Corn. Wer das Zeichen anfasst,
  prüft es zuerst klein. Die Quelle ist `assets/logo/plektrum.svg`, und
  `tools/icons.mjs` erzeugt daraus alle Grössen — samt einer **maskierbaren**
  Fassung, weil Android bis zu 20 % vom Rand wegschneidet und ein
  flächenfüllendes Zeichen dort seine Spitze verliert.
- **Die Wortfuge bekommt ein Haar Luft.** „Riff" + „forge" ergibt drei
  gleiche Buchstaben hintereinander — dasselbe Problem wie bei
  „Schifffahrt", und in versaler Anzeigeschrift liest man das als
  Tippfehler. `.marke .fuge` gibt der Naht 0,05 em. Zwei naheliegende
  Lösungen sind ausgeschieden: ein Farbwechsel, weil **Rost in dieser App
  „nicht ganz" heisst** und ein zweifarbiger Name ein gebrochenes Versprechen
  wäre; und ein Trennzeichen, weil „Riff · Forge" sich wie zwei Produkte
  liest. Mehr als ein Haar sind übrigens auch falsch: bei 0,09 em zerfiel der
  Name in zwei Wörter.
- **Die Wortmarke hat eine eigene Schrift, sonst nichts.** Anton,
  ausschliesslich auf `.marke`. Die einzige weitere ist der Edding
  (Permanent Marker, `--font-edding`) auf den Titeln des Setlist-Zettels —
  Handschrift gehört auf Papier und nirgends sonst hin. Überschriften, Zahlen und Tempo bleiben
  Oswald, damit die App nicht überall schreit. `next/font` legt beide als
  `--font-anton` und `--font-oswald` ab, das Theme baut daraus
  `--font-marke` und `--font-display` — die Namen müssen verschieden sein,
  sonst verweist der Theme-Wert unter Tailwind 4 auf sich selbst.
- **`.num` gibt nur `tabular-nums`, `.ziffern` gibt die Monospace.** Beide
  stehen in `@layer components`, und `font-mono` in `.num` stach früher die
  Anzeigeschrift von `.display` aus — Timer und Tempo rendern dann in der
  System-Monospace. Wer eine grosse Zahl setzt, nimmt `display num`; die
  Monospace ist für Tabs und Log-Zeilen da.
- **Tailwind 4 hat echte Kaskaden-Ebenen, und die Utility-Ebene gewinnt
  immer.** Unter Tailwind 3 war `@layer` nur eine Sortierung, und eine
  Komponenten-Regel wie `.spalte > :first-child` überstimmte ein `mt-8` am
  selben Element über die Spezifität. Unter 4 verliert sie, egal wie
  spezifisch — beim Umstieg rutschte so die linke Spalte auf jedem breiten
  Bildschirm um 32 px nach unten. Was ein Utility überstimmen *muss*, steht
  deshalb in `@layer utilities`. Zwei weitere Grenzen: `@apply` geht nur auf
  Utilities, nicht auf eigene Klassen (`.huelle`, `.display`, `.rule` stehen
  dort ausgeschrieben), und das Theme steht als `@theme` in `globals.css`,
  nicht mehr in einer `tailwind.config.ts`. Das offizielle Upgrade-Werkzeug
  hat beim Umzug zusammengesetzte Selektoren zerlegt (`details.info` und
  `.zettel li.sauber` wurden zu kaputten Utilities); `globals.css` ist von
  Hand umgestellt, Seite für Seite pixelgleich gegen den Stand davor
  verglichen. Tailwind 4 verlangt Safari 16.4 — die Untergrenze für iOS steht
  in beiden READMEs.
- **Rost ist „nicht ganz", Rot ist „kaputt".** `--rost` trägt die zähe
  Bewertung, die überfällige Karte, die fehlende Bedingung. Bleibt Rot dafür
  frei, heisst Rot wirklich noch etwas.
- **Lokal ist der Normalfall, der Abgleich die Ausnahme.** Die App läuft
  vollständig ohne Datenrepo: alles liegt in `localStorage`, mitgenommen wird
  über eine Datei. Auf *Daten* steht deshalb zuerst Sichern und Einlesen;
  der GitHub-Abgleich sitzt zugeklappt darunter. Wer ihn nicht will, sieht
  von GitHub nie etwas — und `runSync` liefert ohne eingerichtetes Repo still
  `ok: false` statt eines Fehlers.
  **Ist er eingerichtet, steht er oben und offen.** Zugeklappt unter
  *Löschen* hielt Daniel ihn auf dem iPhone für verschwunden — wer ein
  Datenrepo hat, benutzt es, und für den ist der Abgleich der Hauptweg und
  die Datei der Nebenweg. *Löschen* bleibt in beiden Fällen das Letzte.
- **Der Willkommens-Schirm kommt einmal und beantwortet drei Fragen.** Wo
  bleiben meine Daten, brauche ich ein Konto, wie komme ich wieder raus. Die
  dritte ist die, an der solche Apps scheitern: wer nicht weiss, dass sein
  Stand nur in diesem Browser liegt, verliert ihn beim ersten Aufräumen. Das
  gehört nicht ins Kleingedruckte. Er erscheint nur bei leerem Log — nach
  einem Import wäre er nur eine Hürde.
- **Erinnern, aber selten.** `sollErinnern` verlangt *beides*: mindestens
  zwölf Einträge und vierzehn Tage seit der letzten Sicherung. Ohne je
  gesicherte Datei zählt die Zeit ab dem ältesten Eintrag, sonst bekäme
  jemand, der seit einem Jahr übt und nie exportiert hat, nie einen Hinweis.
  Ein erfolgreicher Abgleich **zählt als Sicherung** (`letzteKopie` nimmt den
  jüngeren Zeitpunkt): die Warnung sagt, dass Aufräumen den Log mitnimmt, und
  ein privates Repo überlebt das wie eine Datei. Vorher las, wer täglich
  abglich, trotzdem „Noch nie gesichert" — und eine Warnung, die nachweislich
  nicht stimmt, glaubt man auch dann nicht mehr, wenn sie stimmt.
  Eine Erinnerung, die zu früh oder grundlos kommt, wird weggeklickt und
  danach nie wieder gelesen — deshalb steht sie an genau zwei Stellen: über
  dem Exportknopf und am Abschluss einer Session, also dort, wo man ohnehin
  stehen bleibt.
- **Installieren geht nur auf der Herkunft der App.** `beforeinstallprompt`
  feuert nicht für eine fremde Domain — eine Startseite auf einer anderen
  Adresse kann also keinen echten Installieren-Knopf haben, nur eine
  Attrappe. Der Knopf sitzt deshalb in der App unter *Daten*;
  `landing/index.html` verlinkt nur. Auf iOS gibt es das Ereignis gar nicht,
  dort steht die Anleitung über *Teilen → Zum Home-Bildschirm*. Und `.marke`
  ist in der Startseite ein Systemschrift-Stapel, weil eine Schrift
  nachzuladen hiesse, für eine Startseite einen fremden Host aufzumachen.
- **Ein Lick ist eine Grammatik, kein Würfel.** Töne aus der Pentatonik zu
  würfeln ergibt Tonsalat — unmusikalisch ist dabei das kleinere Problem, man
  lernt daran vor allem *keine Phrasierung*. `lib/theory/lick.ts` baut deshalb
  immer dieselbe Form: **Motiv, Entwicklung, Anlauf, Auflösung.** Das Motiv
  hat eine Kontur, die Entwicklung wiederholt oder sequenziert es, der Anlauf
  läuft schrittweise auf den Zielton zu, und der Zielton ist stabil —
  Grundton oder Quinte — und wird mit Vibrato gehalten. Ein Lick, das auf der
  kleinen Terz aufhört, klingt abgebrochen, nicht offen.
- **Der erste Bau hat alle Prüfungen bestanden und war trotzdem unbrauchbar.**
  Vierhundert Licks, alle mit exakt dreizehn Noten: zwölf gerade Achtel am
  Stück, dreimal dasselbe Motiv. Eine Grammatik, die immer dasselbe ausspuckt,
  ist keine. Die Rhythmuszellen und der Anlauf statt des dritten Motivs sind
  die Antwort darauf, und `lick.test.ts` prüft seither auch, was sich
  *unterscheiden* muss, nicht nur, was stimmen muss.
- **Sechzig Boxen, und jede muss tragen.** Zwölf Grundtöne mal fünf Lagen
  sind die Sorte Menge, in der eine kaputte niemandem auffiele, bis sie
  jemand wählt und ein Lick ohne Töne bekommt. `lead.test.ts` geht deshalb
  alle sechzig durch: Box vorhanden, Lick spielbar, Griffweite höchstens vier
  Bünde. Die Auswahl nennt den **tiefsten Bund**, nicht nur die Lagennummer —
  „Lage 3" sagt beim Greifen nichts, „ab Bund 8" schon, und weil die Lagen im
  Kreis laufen, liegt bei A-Moll Lage 4 zuunterst und nicht Lage 1.
- **Ein Lick darf nicht stottern, und es darf kein Triller sein.** Derselbe
  Ton zweimal hintereinander ohne Bindung liest sich in einer Tabulatur wie
  ein Tippfehler. Ursache war zuerst die Phrasengrenze: ein Zickzack-Motiv
  (+1, −1, +2) endet nach drei Tönen genau dort, wo es anfing, und die
  Wiederholung setzte denselben Ton noch einmal an — **ein Drittel** aller
  Licks, mit dem Ausweichen fünf Prozent. Die restlichen lagen am **Rand des
  Tonvorrats**, und dort lag auch der zweite, hässlichere Fall: eine abwärts
  laufende Kontur, die unten anstösst, kehrt um und pendelt zwischen zwei
  Tönen — 4,8 % der Licks waren ein Triller auf einer Saite, fünfmal
  dieselbe Figur. Beides sind Randfälle, und beide sind in der Standardbox
  nie aufgetreten: dort bleibt der Zielton in der Mitte des Vorrats. Die
  Antwort ist zweimal dieselbe — **Platz vorher rechnen statt hinterher
  klemmen**: das Motiv bekommt ein Fenster aus dem weitesten Ausschlag seiner
  Kontur, und der Anlauf sucht sich die Seite, auf der noch Töne liegen. Seit
  dem ist beides null, gemessen über 1500 Licks in allen sechzig Boxen, und
  `lick.test.ts` prüft es auch in allen sechzig statt nur in A-Moll Lage 1.
- **Das Stimmgerät läuft nicht im Audio-Thread.** Ein Stimmgerät will ein
  paar ruhige Werte je Sekunde, keinen Zeitstempel auf die Millisekunde:
  ein `AnalyserNode` hält die letzten 85 ms, und der Hauptthread holt sie
  alle 80 ms ab (YIN kostet dafür rund 1,5 ms). Der Audio-Thread ist auf dem
  Handy die eine Stelle, die nie stocken darf. Die Nadel ist der Median aus
  fünf Schätzungen, Schätzungen unter 0,85 Sicherheit stimmen nicht mit —
  sonst springt sie beim Anschlag. Eine Saite gilt als gestimmt, wenn sie
  600 ms im Ton bleibt, nicht bei einem Durchgang der Nadel durch die Mitte.
  Die Saiten kommen aus `LEERSAITEN_SIEBEN`, nicht aus einer zweiten Tabelle,
  und zugeordnet wird nach Cent, nicht nach Hertz. Im Browser geprüft mit
  einem Sägezahn in bekannter Höhe als „Mikrofon": +6, 0, −14 Cent und das
  tiefe B kamen genau so an.
- **Saiten zählen Übungstage, nicht Tage.** Unter dem Stimmgerät trägt man
  ein, wann neue drauf kamen; fällig sind sie nach **25 Übungstagen** aus dem
  Log oder spätestens nach **90 Kalendertagen**, und erst dann steht auf
  *Heute* eine Zeile — vorher nichts, weil eine Erinnerung, die immer dasteht,
  keine ist. Die 25 stammen aus Roadie, Daniels Orga-App, die dieselbe
  Erinnerung aus demselben Log rechnete; jetzt rechnet sie die App, die den
  Log aus erster Hand hat. Das Datum gehört **dem Gerät** (`lib/storage/lokal.ts`,
  wie die Einmessung), nicht dem Log: ein Saitenwechsel ist kein Gig, und im
  Log würde er als Eintrag ohne Drill den Kalender, die Serie und die
  Aufnäher verfälschen. Deshalb geht er weder in den Abgleich noch in die
  Sicherungsdatei — und das Format von `uebungen.json` bleibt, wie es ist,
  denn Roadie liest es mit.
- **Der zweite Eingang ist ein Nebenweg, kein zweiter Hauptweg.**
  `/lick` gibt drei Minuten Lead ohne Session drumherum — für den, der
  gerade Lust darauf hat. Er schreibt in denselben Log und unter dieselbe
  Nummer: sonst hätte die Tempokurve zwei Hälften, die nichts voneinander
  wissen. Auf *Heute* steht er bewusst als Geisterknopf unter dem
  Startknopf; zweimal Bernstein wären zwei Hauptwege, und die Viertelstunde
  ist das Produkt.
- **Der Sieben-Saiter-Modus ist getrennt, weil das Instrument getrennt ist.**
  `SIEBEN_DRILLS` steht bewusst *nicht* in `DRILLS`: ein Drill, den man nicht
  spielen kann, weil die andere Gitarre im Koffer liegt, hat in der täglichen
  Viertelstunde nichts verloren. Der Test dazu füttert den Log mit lauter
  zähen Sieben-Saiter-Einträgen — damit wären sie, stünden sie im
  Hauptkatalog, die dringendsten überhaupt — und prüft, dass der Tagesplan sie
  trotzdem nie zieht. Getrennt ist damit die **Auswahl**, nicht der Log: beide
  Kataloge schreiben in denselben, jede Übung mit eigener Nummer und eigener
  Tempokurve, und wer zu einer Nummer den Titel sucht, nimmt
  `ALLE_DRILLS_BY_ID` — sonst steht im Abschluss die nackte Nummer. Die
  Stimmung ist **B Standard**, und zwar nur die: Drop A ist eine andere
  Orientierung auf der tiefsten Saite und wäre ein zweiter Katalog, kein
  Umschalter. Die Tabulaturen haben sieben Zeilen, und was sie über Töne
  behaupten, rechnet `lib/theory/sieben.ts` nach — dieselbe Regel wie beim
  Griffbrett, und dieselbe Begründung: eine Tabelle mit Zahlen lügt
  irgendwann unbemerkt.
- **Gespielt wird um Regelmässigkeit, nicht um Menge.** Der Merch-Stand ist
  bei Setlist abgeschaut, samt seiner Leitregel. Der Rang zählt **Wochen** mit
  mindestens einer Session, nicht Sessions, und fällt nie; Gigs sind Tage,
  nicht Blöcke; es gibt keinen Aufnäher für Minuten. Belohnt wird nur, was die
  App wirklich misst — eigene Bewertung, Tempo gegen Zieltempo, gemessenes
  Timing, Kartenstand aus FSRS —, und nichts dafür, ob die Töne sassen.
  `AUF_DEN_PUNKT_AB` ist dieselbe Schwelle, ab der `suggestRating` *Locker*
  vorschlägt; der Test hält beide zusammen. Alles wird aus den Logs berechnet
  und nirgends gespeichert, und ein verdienter Aufnäher bleibt verdient, auch
  wenn die Karte später wieder wackelt — er sagt, was erreicht wurde. Was ein
  Gerät nicht hat (eine Siebensaitige), fehlt auf der Kutte, statt als
  verfehlt dazustehen. Neu Verdientes ist die Differenz zweier voller Läufe,
  vorher und nachher, damit die zweite Session am selben Tag nichts doppelt
  feiert. Der Eingang, die Rang-Zeile, steht auf *Heute* unter den
  Nebenwegen in der **linken** Spalte. Zuerst stand er rechts unter *Bisher*
  — und `.zwei-spalten` stapelt die rechte Spalte auf dem Handy unter den
  Kalender: über tausend Pixel tief, und Daniel hat ihn dort nicht gefunden.
  Was auf dem Handy gesehen werden soll, gehört in die linke Spalte.
- **Der Rückblick zeigt Verlauf, nicht Bestwert, und erfindet nichts.**
  `bestBpm` kann nur steigen und sagt deshalb nicht, ob es gerade vorangeht;
  der Rückblick zeigt je Woche das höchste *sauber* gespielte Tempo
  (`SAUBER_AB`, dieselbe Grenze wie der Bestwert) und den Median der
  gemessenen Streuung. Eine Woche ohne Wert ist eine **Lücke**, keine Null und
  keine Fortschreibung. Die Linie wird dort nur von einer blassen Haarlinie
  überbrückt — ohne sie zerfiel ein Verlauf mit Lücken in Stücke, die wie
  eine gestrichelte Prognose aussahen. Tempo und Streuung stehen als zwei
  Grafiken nebeneinander, nie mit zwei Achsen in einer. Eine Richtung
  („31 → 17 ms") steht nur da, wo es mindestens zwei Wochen mit Wert gibt.
  Das Fenster wächst mit dem Log bis zu einem Quartal, aus demselben Grund
  wie beim Kalender, und die Säulen haben eine feste Breite statt eines
  Anteils der Fläche. Der Eingang steht auf *Heute* unter dem Rang, in der
  linken Spalte.
- **Die Serie zählt Wochen.** In Tagen riss sie nach einem verpassten Abend,
  und wer einmal gerissen ist, hat einen Grund weniger, morgen anzufangen.
  `streakWeeks` zählt Wochen mit mindestens einer Session; die laufende Woche
  ist nicht verloren, solange sie nicht vorbei ist. Dieselbe Serie trägt die
  Ansage (*Hart* ab drei Wochen), *Heute*, den Abschluss und die Aufnäher.
- **Heute ist ein Plakat, und das Plakat sagt die Wahrheit.** Das Tageswort
  steht riesig in seiner Farbe, darunter ein Satz und *Als Nächstes* — die
  Drills mit Tempo, der Startknopf in derselben Karte. Damit die Vorschau
  stimmt, würfelt der Scheduler nicht mehr frei, sondern mit `tagesZufall`:
  gleicher Kalendertag und gleicher Log heissen gleicher Plan, auf *Heute* wie
  in der Session. Morgen ist ein anderer Tag, und die Abwechslung bleibt.
- **Der Abschluss ist ein Zettel.** Die Session klebt als Setlist mit
  Gaffa-Tape da: Sauberes durchgestrichen, Zähes mit Stempel *nochmal*, und
  daneben das Tempo fürs nächste Mal. Papier ist hell mit dunkler Tinte, also
  der umgekehrte Fall zum Rest der App — `--papier`, `--tinte`,
  `--tinte-blass` und `--stempel` stehen deshalb eigens im Kontrasttest. Der
  Stempel ist Rost, nicht Rot: „nochmal" heisst „nicht ganz". Die Titel
  stehen in Edding, und der Strich durch Gespieltes ist dünn und in
  `--tinte-blass`: in derselben Tinte lag er genau auf den Querbalken der
  Versalien und deckte das Wort zu.
- **Der Startwert wird durchgerührt, bevor er gewürfelt wird.** Mulberry32
  liefert bei kleinen, *fortlaufenden* Startwerten korrelierte erste Werte —
  und genau dort fängt jeder an, weil die Licks ab eins durchgezählt werden.
  Nachgemessen über die ersten vierzig Startwerte: neunzehnmal dieselbe
  Kontur, wo zehnmal zu erwarten gewesen wären (p ≈ 0,007). Ab Startwert
  tausend verteilte es sich sauber. Ein neuer Nutzer hätte also ausgerechnet
  die vierzig Licks bekommen, bei denen die Abwechslung fehlt. Eine
  Lawinenfunktion vor dem Generator behebt das; `lick.test.ts` hält es fest.
  Aufgefallen ist es nicht in einem Test, sondern beim Durchsehen von acht
  Licks am Stück.
- **Der Generator ist der Drill, das Lick ist der Inhalt.** Aller Fortschritt
  hängt an `drillId` — wäre jedes Lick ein eigener Drill, hätte keines eine
  Tempokurve und `masteryOf` nichts zu messen. Deshalb eine feste Nummer
  (`LEAD_DRILL_ID`) mit eigener Geschichte, und daneben ein Startwert, aus
  dem sich jedes gespielte Lick wieder herstellen lässt. Ein Lick bleibt, bis
  es mit *sauber* abgehakt ist: eine Tempokurve über lauter verschiedene
  Licks wäre nicht deutbar, und Wiederholung mit Abstand ist ohnehin das,
  woran diese App überall hängt. `tab` und `why` bleiben im Katalog leer —
  was dort stünde, wäre eine Behauptung über ein Lick, das es noch nicht gibt.
- **Eine Tabulatur, für die man wischen muss, ist keine Hilfe.** Die Spalte
  ist so breit wie nötig (zwei Zeichen, drei erst ab dem zehnten Bund), der
  leere Schwanz nach dem Zielton wird abgeschnitten — und **jeder Takt steht
  auf einer eigenen Zeile**. Der erste Wurf war 48 Zeichen breit und auf dem
  Handy rechts abgeschnitten, samt dem Zielton. Der Test nagelte die Breite
  danach fest, aber nur in der Standardbox, und die ist der freundlichste
  Fall: dort bleibt jeder Bund einstellig. Ab dem zehnten Bund braucht jede
  Spalte ein Zeichen mehr — **36 % aller Licks** über die sechzig Boxen waren
  wieder 45 Zeichen breit, im Browser bei 390 px gemessen 339 px Inhalt in
  einem 324 px breiten Feld. Zwei Systeme à einem Takt sind höchstens 27
  Zeichen und passen auch auf 320 px. Eine Breitenprüfung, die nur einen Fall
  kennt, prüft nicht die Breite, sondern diesen Fall.
  Umgebrochen wird aber **nur, wenn es sein muss**: der Umbruch ist die
  Antwort auf das Handy, nicht auf die Tabulatur. In der Standardbox bleibt
  jeder Bund einstellig, die Zeile wird 31 Zeichen lang und passt überall —
  sie trotzdem zu zerlegen sah auf einem breiten Schirm nach Fehler aus, ein
  halber zweiter Takt neben einem ganzen ersten. Gemessen passen auf 320 px
  rund 33 Zeichen; darunter bleibt es eine Zeile, darüber wird in **ganze**
  Takte zerlegt, beide gleich lang. Und eine Bindung rutscht nie an einen
  Zeilenanfang: `|p5` behauptet einen Pull-off von einem Ton, der in dieser
  Zeile gar nicht steht.
- **Das Mikrofon hört beim Lick nur den Rhythmus — auch jetzt, wo es Tonhöhe
  kann.** Anschläge, keine Tonhöhen: ob die *Töne* sassen, behauptet die App
  nicht. Die Tonhöhen-Erkennung gibt es inzwischen (`lib/audio/tonhoehe.ts`,
  YIN), und gemessen *bevor* sie irgendwo eingebaut wurde: ein Einzelton ist
  von B1 bis E6 auch mit High-Gain auf den Halbton richtig, eine offene Saite
  auf unter zwei Cent. Aber im Lick klingt der vorige Ton nach, zwei Töne
  gehen zusammen durch die Verzerrung, und ihre gemeinsame Periode liegt
  tiefer als beide — liegt der vorige eine Quarte höher, findet YIN eine
  Oktave oder Duodezime zu tief. Sauber 98 %, Crunch 97 %, High-Gain **70 %**
  (beim Tonnamen 75 %). Das trennt nicht, also wird es nicht gemessen; die
  Erkennung trägt nur das Stimmgerät, wo eine Saite allein klingt.
  `tonhoehe.test.ts` hält die Grenze als Test fest und wird rot, sobald sie
  fällt — dann ist die Entscheidung neu zu treffen.
  Eine Lehre aus dem Messen: der erste Testlauf hielt YIN für leichtgläubig,
  weil es in „Rauschen" sicher einen Ton fand. Das Rauschen kam aus
  `(s * 1103515245 + 12345) % 2 ** 31` — das überschreitet die Genauigkeit
  einer JavaScript-Zahl und wiederholt sich nach 220 Werten, und eine Folge
  mit Periode 220 *ist* ein Ton von 218 Hz. YIN hatte recht. Testzufall
  kommt aus Mulberry32 mit `Math.imul`; auch die ersten Messzahlen stammten
  aus dem kaputten Generator und sind mit dem richtigen neu erhoben.
- **Die Ansage behauptet nichts.** Jede Zeile in `briefing.ts` muss aus dem Log
  ableitbar sein, sonst gehört sie da nicht hin.
- **Beim Abgleich gewinnt keine Seite.** Konflikt heisst: neu lesen, erneut
  verschmelzen, noch einmal schreiben — und dann aufhören. Genau ein zweiter
  Versuch, sonst hängt es.
- **Antworten auf dem Griffbrett sind gerechnet, nicht getippt.** Der Katalog
  holt jede richtige Stelle aus `lib/theory/fretboard.ts`. Ein Tippfehler in
  einer Tabelle mit hundert Tönen fällt niemandem auf; ein Fehler in der
  Rechnung fällt in den Tests auf. Das gilt auch für die Pentatonik-Lagen:
  `pentatonikLage` leitet sie aus Grundton und Lagennummer ab, und der
  Prüfstein ist, dass Lage 1 von A-Moll aus der Rechnung auf genau die Form
  fällt, die im Lehrbuch steht. Nebenbei hält der Test fest, was leicht falsch
  angenommen wird: die Lagen laufen im Kreis, und welche zuunterst liegt, hängt
  am Grundton — bei A-Moll ist es Lage 4, nicht Lage 1. Und was die Erklärungen an Tönen und
  Abständen behaupten, prüft `__tests__/cards.test.ts` nach — Übungsmaterial,
  das lügt, ist schlimmer als keines.
- **Zwei Logs, zwei Dateien im Datenrepo.** `uebungen.json` und
  `theorie.json` liegen getrennt, weil ein Gerät mit älterem Stand ein
  unbekanntes Feld beim Einlesen abstreift und beim nächsten Abgleich
  wegschriebe. Die *Sicherungsdatei* ist dagegen eine — dort ist ein
  abgestreiftes Feld eine einmalige, sichtbare Handlung, und zwei Downloads
  wären Zumutung.
- **Die Konfliktbehandlung existiert einmal.** `syncLog` ist über die
  Log-Form parametrisiert (`LogShape`), nicht kopiert. Das ist die heikelste
  Stelle der App — zwei Fassungen davon wären zwei Gelegenheiten, Übung zu
  verlieren.
- **Eine gespielte Figur braucht einen Einzähler.** Den Versatz aus der Figur
  selbst zu schätzen geht nicht: sie ist ungleichmässig, und eine Verzögerung
  in der Grössenordnung ihrer Abstände sieht aus wie eine andere Figur —
  nachgemessen passt ein umgekehrter Gallop um 125 ms verschoben zu über
  achtzig Prozent auf einen Gallop. Auf gleichmässigen Schlägen ist der
  Versatz dagegen eindeutig. Deshalb zwei Takte zählen, dann spielen.
- **Treffen ist nicht genug.** Eine Figur wird auch an der *Genauigkeit*
  gemessen: welcher Anteil der gehörten Anschläge überhaupt verlangt war. Ohne
  sie besteht stures Dauerspiel jede Figurfrage — die erwarteten Zeitpunkte
  eines Gallops (0, ½, ¾) liegen alle auf dem Sechzehntelraster. Derselbe
  Fehler wie beim Einzähler, nur in der anderen Richtung. Und die Kehrseite:
  eine Frage nach dem *feinsten* Raster ist gar nicht stellbar, weil jede
  andere Figur eine Teilmenge davon ist. Deshalb gibt es die Sechzehntelfigur,
  aber keine Karte dazu — und einen Katalogtest, der jede gespielte Frage
  abweist, die eine andere Figur aus Versehen mitbeantwortet.
- **Eine Figur kann länger sein als ein Schlag.** `periodeSchlaege` sagt, nach
  wie vielen Schlägen sie sich wiederholt; ohne das wäre alles, was quer zum
  Schlag läuft, nicht aufschreibbar. Zwei Folgen daraus: `toleranceSeconds`
  braucht *zwei volle Perioden*, sonst bleibt der Abstand über die
  Wiederholungsgrenze ungesehen — bei der Synkope ist genau der der engste. Und
  `patternTimes` hängt jede Note an ihren eigenen gemessenen Klick, statt drei
  Schläge aus einem hochzurechnen; sonst liefe wieder eine zweite Uhr mit.
- **Nur messen, was sich trennt.** Dämpfung ja, Akzente nein. Nachgemessen
  gegen das echte Worklet: eine Dead Note trennt sich unter starker Verzerrung
  noch um Faktor 1,54 von einer normalen, bei 1,03 bis 1,13 Streuung innerhalb
  einer Gruppe. Ein Akzent bleibt bei 1,15 bis 1,24 und liegt damit im
  Rauschen. Wer eine neue Messung erwägt, misst erst und baut dann — mit
  Zahlen, damit die Entscheidung nachprüfbar bleibt statt Geschmack zu sein.
- **Der Katalog ist streng, der Log ist nachsichtig.** `drillResultSchema`
  prüft die Technik nicht gegen `TECHNIQUES`. Ein Log-Eintrag ist Vergangenheit
  und verweist auf einen Drill, den es auf diesem Gerät vielleicht noch nicht
  gibt; mit der Aufzählung geprüft verlöre ein Gerät auf älterem Stand beim
  Abgleich nicht diesen Eintrag, sondern den *ganzen* Log.
- **Tempo ist ein Anteil des Ziels.** `nextBpm` bewegt sich um Prozent von
  `targetBpm`, nicht um eine feste Zahl BPM — fünf Schritte heissen bei Ziel
  190 etwas anderes als bei Ziel 100, und der Drill mit der längsten Strecke
  kroch am langsamsten. Ebenso misst `masteryOf` ab dem Starttempo *dieses
  Spielers*: `startBpmFor` skaliert es mit dem Profil, und wer ab dem
  Katalogwert misst, schenkt einem Wiedereinsteiger ein Viertel Beherrschung.
  Das verzerrt nicht nur die Anzeige — `priorityOf` wählt darüber aus.
- **Die Fragen sitzen zwischen den Blöcken, nicht in ihnen.** Eine Frage hat
  kein Tempo, keine Bewertung und keinen Eintrag im Übungs-Log. Zwei Portionen
  à zwei Fragen, mehr nicht — die Viertelstunde ist das Produkt. Wer keine
  Lust hat, überspringt; die Karten bleiben fällig. Ist nichts fällig, fällt
  die Portion lautlos aus statt einen leeren Bildschirm zu zeigen.
- **Jede gespielte Technik hat Karten.** Die erste Portion grundiert auf den
  nächsten Block — aber nur, wenn es zu dessen Technik eine Karte gibt. Bis
  Oktober hatten sechs Techniken keine (Wechselschlag, Bending, Legato,
  Slides, Tremolo, Dead Notes, wobei die Dead-Note-Karten an *Palm Mute*
  hingen), und die Portion fragte dort still an ihnen vorbei. `cards.test.ts`
  verlangt seitdem zu jeder Technik eines Nicht-Warm-up-Drills mindestens
  eine Karte. Wer einen Drill mit neuer Technik hinzufügt, schreibt die Karte
  gleich mit.
- **CAGED ist gerechnet.** `lib/theory/caged.ts` hält nur die fünf offenen
  Dur-Griffe; jede Form in jeder Tonart ist dieselbe Tabelle plus eine
  Verschiebung, und der Test prüft die offenen Griffe gegen das Akkordbuch,
  jede Form in allen zwölf Tonarten auf Grundton, grosse Terz und Quinte und
  die Reihenfolge C A G E D am Hals. Moll ist keine zweite Tabelle, sondern
  die Terz einen Bund tiefer — und das ist eine Frage, keine Rechnung.
  Nachgerechnet und als Test festgehalten: jede Form liegt in genau einer
  Lage der parallelen Moll-Pentatonik (G→1, E→2, D→3, C→4, A→5), in allen
  zwölf Tonarten gleich.
  Angeregt von einem Magazinartikel; übernommen ist nur die allgemein
  bekannte Idee, Text und Fragen sind eigene.
- **Das Griffbrett hat zwölf Bünde, und eine Antwort muss darauf liegen.**
  Der Katalogtest liess Stellen bis zum 15. Bund zu, weil `positionsOf` so
  weit rechnet; die Karte „Über dem 12. Bund" fragte nach dem 15. und war
  damit nicht antippbar. Aufgefallen ist es erst im Browser. Seitdem
  verlangt der Test mindestens eine richtige Stelle bis `BUENDE`, und
  Vorgaben (`gegeben`) ganz darauf. Was darüber liegt, wird getippt.
- **Eine Hörfrage fragt den Abstand, nicht den Klang.** Die Töne werden bei
  jedem Zeigen neu gewürfelt (`hoerPaar`), *Nochmal* spielt dasselbe Paar;
  alle vierundzwanzig Karten bieten dieselben zwölf Namen an, damit die
  Auswahl nicht verrät, welche Karte dran ist. Der Ton entsteht aus
  Obertönen (`lib/audio/zupfen.ts`), nicht per Karplus-Strong: dessen
  Periode ist eine ganze Zahl Samples, und das sind oben im Bereich bis zu
  fünfzehn Cent — zwei Töne so daneben sind eine andere Frage als die auf
  der Karte. `zupfen.test.ts` misst jeden Ton von A2 bis E5 mit dem YIN des
  Stimmgeräts nach, unter zwei Cent. Abgespielt wird nur auf Tippen, aus
  demselben Grund wie überall: kein AudioContext vor einer Nutzergeste.
  Im Browser geprüft, indem die gespielten Puffer abgegriffen und ihre
  Tonhöhe nachgerechnet wurde — Quinte aufwärts kam als F#3 → C#4 an.
- **Dreiklänge sind gerechnet, und ihre Behauptungen sind eng gefasst.**
  `dreiklaenge.ts` stapelt in enger Lage und lässt den Knick zur B-Saite aus
  den Leersaiten fallen, ohne Sonderfall. Zwei Aussagen musste der Test
  zurechtstutzen: „drei Griffe je Oktave" gilt erst ein Stück vom Sattel
  weg, weil dort einer unter den Bund null fiele; und „jeder Dreiklang ist
  ein Stück einer CAGED-Form" gilt auf G-, B- und e-Saite, auf den tiefen
  Saiten nicht immer. Die Karten sagen deshalb genau das, und der Test hält
  auch fest, dass die weitere Fassung falsch wäre.
- **Der Griffbrett-Trainer schreibt in den Wissens-Log, zählt aber nicht als
  Wissen.** Jede Stelle (Bund 1–12, sechs Saiten) ist in jeder Richtung —
  *finden* und *benennen* — eine eigene FSRS-Karte. Im selben Log, weil
  Abgleich, Sicherung und Löschen dann ohne einen neuen Schlüssel
  mitkommen; der Preis ist, dass jede Zählung über den Theorie-Log die
  Einträge mit `hals-` auslassen muss (`istHalsAntwort`). Ohne das hätten
  dreissig gefundene Töne „10 Karten sitzen" verdient — `hals-trainer.test.ts`
  macht genau diese Gegenprobe, für die Aufnäher und die Trefferquote. Wer
  eine neue Zählung über `theorie.answers` schreibt, filtert dort auch.
  Die Note kommt von der Uhr, nicht vom Spieler: falsch 1, über sechs
  Sekunden 2, bis zweieinhalb 4, dazwischen 3 — eine Stelle, die man suchen
  muss, kennt man noch nicht gut genug, um sie zu spielen. Neues kommt in
  Lernreihenfolge (Stammtöne vor Kreuzen, tiefe Bünde zuerst), die Runde
  wird danach gemischt, sonst liefe sie den Hals hinauf und verriete die
  nächste Antwort. Falsches kommt am Ende der Runde noch einmal, ohne
  Wertung. Ein Treffer bleibt 1,6 s stehen, mit Stelle, Zeit und Wertung,
  und lässt sich wegtippen. Zuerst waren es 450 ms — ein Aufblitzen, das
  verschwunden war, bevor der Blick vom Hals hochkam. Die Pause kostet
  nichts, weil die Uhr der nächsten Frage erst beim Zeigen startet; der
  Zeitgeber wird beim Abbrechen gestoppt, sonst schaltete er eine
  geschlossene Runde weiter. Im Merch-Stand hat der Hals eine eigene Reihe *Griffbrett*
  (12, 36, 72 Stellen beim Finden; *In- und auswendig* mit allen 72 in
  beiden Richtungen), mit derselben Schwelle wie die Wissenskarten: eine
  Woche Halt, nicht ein Treffer. Weil eine Runde keine Session ist und
  keinen Abschluss hat, nennt der Rundenbericht neu Verdientes selbst —
  dieselbe Vorher-nachher-Differenz wie der Abschluss.
  Auf *Heute* stehen die Nebenwege seitdem zwei mal zwei: vier
  nebeneinander brachen die Wörter, auf 320 px und genauso in der linken
  Spalte am breiten Schirm.
- **Pixelkunst nur ganzzahlig.** Rangszenen (96 × 48) und Aufnäher (24 × 24)
  liegen in `public/merch/` und stammen aus Daniels eigener Orga-App, wo sie
  zuerst gezeichnet wurden; die Szene *Hall of Fame* fehlte dort und ist in
  derselben Palette dazugezeichnet. Ein Bild je **Leiter**, nicht je Stufe —
  die Stufe steht im Titel. Gezeichnet wird nur in ganzen Vielfachen
  (Aufnäher 2×, Szene 3× und ab `sm` 4×, auf *Heute* 1×) mit
  `image-rendering: pixelated` (`.pixel`); krumme Faktoren verschmieren
  Pixelkunst. Ein offener Aufnäher ist dasselbe Motiv grau und gedimmt.
  `merch-bilder.test.ts` verlangt für jede Leiter und jeden Rang die Datei in
  der richtigen Grösse. Das Bild steht in der Kachel **über** dem Text: daneben
  liess es auf 320 px kaum fünfzig Pixel für „Gitarrensolo", und die Seite lief
  über — das tat sie dort übrigens schon vorher um 8 px, weil `grid-cols-2`
  Spalten auf ihren längsten Inhalt aufbläst; die Kacheln stehen deshalb in
  `minmax(0,1fr)`-Spalten. Nicht übernommen aus der Orga-App: Pixelfeuer,
  Ansager, Konsole und die Endgegner — Schmuck und HUD, und die vier
  Bauteile mit Grenze sind hier schon vergeben.
  Die **Tourshirts** sind keine Dateien, sondern gerechnet
  (`lib/session/shirt.ts`): ein 32 × 32 Schnitt, gespiegelt aus einer halben
  Vorlage, Stofffarbe aus dem Adjektiv des Tournamens, 12 × 12 Druck aus dem
  Nomen — zwölf mal zwölf Kombinationen wären 144 Bilder. Gezeichnet als SVG
  aus Rechtecken (`TourShirt`), deshalb gilt die Ganzzahl-Regel dort nicht.
  `shirt.test.ts` geht fünfzig Jahre Tournamen durch und verlangt, dass jeder
  ohne Ausweichen auf Farbe und Motiv fällt — wer `ADJEKTIVE` oder `NOMEN` in
  `merch.ts` erweitert, zeichnet das Motiv mit. Die Farben dort sind Stoff,
  nicht App-Palette, und stehen deshalb als Hex-Werte im Bild.
  Steigt der Rang, zeigt `RangAufstieg` die neue Bühne — im Abschluss
  (`SessionSummary`, also Session und Sieben-Saiter-Modus) und nach einem
  Lick in `/lick`, beides als Vorher-nachher-Rechnung über den Log.
  Die **Technik-Zeichen** in der Drill-Liste (`lib/session/technik-zeichen.ts`,
  16 × 16) sind die eine Pixelkunst mit App-Farben statt eigener: Strich in
  `currentColor`, Akzent in `--stahl` — sie stehen in einer Bedienzeile und
  folgen ihr, statt ein Bild mitzubringen. Der Willkommens-Schirm hat eine
  eigene Szene (`public/bilder/willkommen.png`, Übungsecke am Abend, auf dem
  Notenständer eine 15), dazugezeichnet in der Palette der Rangszenen.
- **Gerade Achtel sind nicht abfragbar**, aus demselben Grund wie
  Sechzehntel: eine Synkope trifft drei der vier Anschläge und hat keinen zu
  viel. Die Figur steht in `rhythm.ts`, eine Karte dazu hat der Katalogtest
  beim ersten Lauf abgewiesen.
- **Die Karten werden erst an der Stelle gewählt**, nicht beim Bauen des
  Plans. Sonst käme in der zweiten Portion wieder, was in der ersten schon
  beantwortet wurde.
- **Tonnamen englisch.** `B` ist der Ton über A, `A#`/`Bb` der darunter — so
  steht es in jeder Tabulatur, und Metal-Repertoire kommt als Tabulatur.
  Deutsche Eingaben nimmt `parseTon` trotzdem an, und der Fall wird in der
  Rückmeldung benannt statt stillschweigend gewertet.
- **Das Griffbrett verrät die Antwort nicht.** Eine Markierung trägt ihren
  Tonnamen erst nach dem Auflösen; vorher beantwortete das Antippen die Frage
  von selbst. Ausnahme ist der gegebene Grundton — der gehört zur Frage.
- **Nach jeder Antwort steht die richtige da, mit Begründung.** Ohne
  Rückmeldung kehrt sich der Vorteil des Abfragens bei niedriger Trefferquote
  um: wer rät und nichts erfährt, lernt die falsche Antwort. Ein "leider
  falsch" ohne Auflösung gehört deshalb nicht in diese App.
- **Anzeigen müssen etwas messen.** Die Abrufbarkeit steht direkt nach dem
  Antworten immer nahe 100 % — als Anzeige taugt sie nichts, sie meldete sonst
  nach fünf Reinfällen "sitzt: 5". Was angezeigt wird, ist die Stabilität in
  Tagen.
- **Der Kartenstand wird abgespielt, nicht gespeichert.** Stabilität und
  Schwierigkeit einer Wissenskarte fallen aus dem Antwort-Log, jedes Mal neu.
  Das ist Bedingung für den Abgleich: ein gespeicherter Zustand wäre
  veränderlich, und zwei Geräte müssten sich einigen, wer gewinnt. Antworten
  sind unveränderlich und verschmelzen wie der Übungs-Log.
- **FSRS wird nicht nachempfunden.** `lib/theory/fsrs.ts` ist ein Port der
  Referenz und hängt an `__tests__/fsrs-referenz.json` — Prüfwerte, mit
  py-fsrs erzeugt. Wer eine Formel anfasst, erzeugt die Datei neu, statt die
  Erwartungen anzupassen. Ohne Lernschritte, weil hier niemand nach zehn
  Minuten wiederkommt; das entspricht `Scheduler(learning_steps=(),
  relearning_steps=())`.
- **Der Bau-Stempel wird nicht von Hand gepflegt.** `tools/version.mjs`
  schreibt ihn zweimal aus einer Quelle: als `public/version.json` (was auf dem
  Server liegt) und als `NEXT_PUBLIC_*` im Bündel (was gerade läuft). Der
  Vergleich der beiden *ist* die Update-Erkennung — wer eines von beiden
  anders befüllt, macht sie blind. Der Service Worker muss `version.json`
  deshalb ungecacht durchlassen.
- **Löschen heisst löschen.** Was die App speichert, muss der Löschen-Weg auch
  wieder loswerden — Log, beiseitegelegte Kopie, Profil und **der Abgleich
  samt Token**. Letzterer fehlte lange: *Alles löschen* versprach „wie frisch
  installiert" und liess den Token im Speicher, den sich alle
  `github.io`-Seiten teilen — und der nächste Hintergrund-Abgleich holte den
  gelöschten Log zurück. Seitdem gibt es eine Funktion, `allesLoeschen`, und
  `loeschen.test.ts` sammelt jeden `mga.*`-Schlüssel aus dem Quelltext ein und
  verlangt danach einen leeren Speicher. Ein neuer Schlüssel ohne Löschweg
  fällt dort auf, nicht erst bei jemandem, der sich auf das Löschen verlässt.
  Das Datenrepo bleibt dabei unberührt: gelöscht wird dieser Browser.
- **Kein dritter Host.** `api.github.com` ist die einzige fremde Adresse, und
  auch die nur zweimal: beim eingerichteten Abgleich, und auf Knopfdruck beim
  Blick zum Original — Letzteres ausschliesslich in einem Fork. Sonst spricht
  die App mit niemandem. Schriften liegen lokal (`next/font` lädt sie
  beim Build), es gibt keine Analyse-Dienste und keine Einbettungen. Die CSP in
  `app/layout.tsx` schreibt das fest: wer einen Host hinzufügt, muss dort
  `connect-src` erweitern — und sich fragen, warum.
- **Der Log ist append-only.** Einträge sind unveränderlich und über
  `drillId` plus `at` identifiziert. Deshalb ist Verschmelzen die richtige
  Antwort auf zwei Stände, nicht "der neuere gewinnt" — nie überschreiben.
- **Das Profil ist ein Startwert, kein Filter.** Die zwei Fragen beim ersten
  Start skalieren die Starttempi und gewichten die Auswahl leicht — sie
  schliessen nie einen Drill aus. Sobald ein Log da ist, schreibt sich das
  Tempo daraus fort und das Profil zählt für diesen Drill nicht mehr. Es darf
  deshalb auch fehlen: jede Funktion nimmt `Profile | null`.
- **Ein Drill über mehrere Runden ist ein Eintrag**, nicht drei. Der
  Session-Runner sammelt die Spielzeit und schreibt nach der letzten Runde.
- **`pnpm audit` bleibt leer.** Die Werkzeugkette schleppt DoS-Meldungen in
  ihren Transitiven mit — nichts davon geht an einen Besucher, es läuft kein
  Server, aber `next dev` läuft auf diesem Rechner. Wo eine Transitive hängt,
  kommt die geflickte Fassung als `pnpm.overrides` in `package.json`. Im
  Moment sind es **null**: nach dem Sprung auf Next 16, Tailwind 4 und
  Vitest 5 waren alle elf früheren Overrides überflüssig — geprüft ohne
  jeden Override und mit frisch aufgelöster Lockfile. Wer eine Abhängigkeit
  hebt, schaut danach in `pnpm audit` und räumt Overrides weg, die ins Leere
  zeigen.
  Die einzige Ausnahme steht in `pnpm.auditConfig.ignoreGhsas`:
  GHSA-vfj7-8cjw-p6xm in `braces`, für das es **keine** geflickte Fassung gibt
  und das nur über den Linter hereinkommt (`eslint-config-next` → `fast-glob`
  → `micromatch`). Die Muster dort stammen aus unserer eigenen Konfiguration,
  nicht von einem Besucher. Sobald es einen Fix gibt, fliegt die Ausnahme
  raus. Geprüft wird wöchentlich von `audit.yml`, weil neue Meldungen mit der
  Zeit kommen, nicht mit Commits — und bewusst nicht im Deploy, damit eine
  fremde Meldung keinen eiligen Fix aufhält.
  Zwei weitere Einträge in `pnpm` halten die Installation warnungsfrei, damit
  eine *neue* Warnung auffällt: `peerDependencyRules` erlaubt ESLint 10 für
  die drei Plugins aus eslint-config-next, die ihre Peer-Angabe noch nicht
  nachgezogen haben (sie laufen damit ohne Befund), und
  `ignoredBuiltDependencies` hält fest, dass die Installationsskripte von
  `msw` (über Vitest) und `unrs-resolver` (über den Linter) nicht laufen —
  pnpm 10 blockiert sie ohnehin, gebraucht werden sie nicht.
- **TypeScript bleibt auf 6.** TypeScript 7 ist der Neubau in Go und hat
  keine JavaScript-Schnittstelle; `typescript-eslint` (über
  eslint-config-next) verlangt ausdrücklich unter 6.1, und Next ruft beim
  Bauen die Schnittstelle auf. Der Sprung auf 7 kommt, wenn beide so weit
  sind — nicht vorher.
- **Der Bau hat keine Schreibrechte.** Im Deploy-Workflow gelten `pages:
  write` und `id-token: write` nur für den Deploy-Job; der Build-Job führt
  mit `pnpm install` fremden Code aus und bekommt nur `contents: read`.
  Actions hängen an Commit-Hashes mit der Fassung als Kommentar — ein Tag
  lässt sich nachträglich verschieben. Wer eine Action hebt, holt den Hash
  der neuen Fassung, statt auf den Tag zurückzufallen.
  Beim Heben die Eingaben alt gegen neu vergleichen, nicht nur die
  Versionsnummer: `upload-pages-artifact` v5 lässt versteckte Dateien weg,
  also auch die `.nojekyll`, an der `_next` hängen könnte — deshalb steht
  dort `include-hidden-files: true`.

## Beim Veröffentlichen

Die Testzahl steht als Abzeichen in **beiden** READMEs (`README.md` und
`README.en.md`) und zieht nicht von selbst mit. Wer Tests hinzufügt, zieht sie
dort nach — sonst steht dort irgendwann eine Zahl, die niemand mehr glaubt.
Dasselbe gilt für die Drill-Tabellen unter *Die Übungen* / *The drills*: sie
sind aus `lib/session/drills.ts` erzeugt, aber nicht generiert. Wer den Katalog
ändert, zieht sie nach — in beiden Sprachen.

Die beiden READMEs haben dieselbe Gliederung. Ein neuer Abschnitt gehört in
beide, sonst laufen sie auseinander.

## Inhalte und Recht

Alle Drills und Riffs sind **eigene** Übungen im jeweiligen Stil. Keine
abgeschriebenen Tabs, kein Audio urheberrechtlich geschützter Aufnahmen. Wenn
neue Inhalte dazukommen: bitte dabei bleiben.

Der Code steht unter **MIT** (`LICENSE`), Autor ist **@cyphomat** — nur der
GitHub-Name, kein Klarname und keine E-Mail-Adresse in App, READMEs oder
Lizenz. Ohne Lizenzdatei hiess es bis Oktober 2026 rechtlich „alle Rechte
vorbehalten": GitHub erlaubt den Fork-Knopf, aber anpassen und betreiben
durfte niemand, und ein „gerne forken" wäre eine Einladung ohne Boden
gewesen. Rückmeldungen gehen ans Original (Issues), der Quelltext-Link in
der App zeigt auf das, was gerade läuft — in einem Fork also auf den Fork.
Das steht in `components/session/ueber-panel.tsx`, am Ende von *Daten*.

## Befehle

```bash
pnpm dev      # Entwicklung
pnpm test     # Vitest (Logik in lib/session und lib/audio)
pnpm check    # tsc --noEmit && vitest run && eslint .
pnpm build    # statischer Export nach out/
pnpm audit    # muss leer bleiben, siehe Konventionen
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

Seit Next 16 gibt es `next lint` nicht mehr, und `next build` lintet nicht
mehr mit; der Linter läuft als `eslint .` in `pnpm check`, und der Workflow
lässt nichts durch, was `pnpm check` reisst. Die Konfiguration steht flach in
`eslint.config.mjs`. Drei Regeln aus `react-hooks` 7 sind dort bewusst aus:
`refs`, `set-state-in-effect` und `immutability` prüfen, ob der Code zum
React Compiler passt, und den benutzt die App nicht. Was sie anmahnen, sind
gewollte Muster — Laden aus `localStorage` nach dem ersten Anstrich (beim
statischen Export gibt es beim Bauen keinen Speicher), der jeweils neueste
Callback in einer Ref, der einmal festgehaltene Lick-Startwert. Wer den
Compiler einführt, schaltet sie wieder an und baut diese Stellen um — als
eigene Änderung, nicht nebenbei.

## Timing-Messung

Das Mikrofon hört **Anschläge**, nicht Tonhöhen. Bei verzerrter Gitarre ist
Pitch-Tracking unzuverlässig, Transienten dagegen sind eindeutig — und für
Rhythmusarbeit ist der Einsatzzeitpunkt ohnehin die ganze Frage.

Zwei Zahlen, die man nicht verwechseln darf:

- **Versatz** (`offsetMs`): konstante Verzögerung. Steckt voller Laufzeit —
  Saite → Luft → Mikrofon → Puffer, bei Bluetooth-Kopfhörern 150–300 ms. Zählt
  **nicht** in den Score. Wird vor dem Zuordnen geschätzt (Histogramm-Peak),
  sonst würde bei langsamer Signalkette gar nichts zugeordnet.
- **Streuung** (`spreadMs`): Schwankung um diesen Versatz. **Das** ist die
  Spielqualität, und der Score baut darauf auf.

Ein negativer Versatz ist kein Latenz-Artefakt: Laufzeit kann einen Ton nur
später machen, nie früher. Wer vorne liegt, spielt wirklich vorne — **aber nur,
wenn der Versatz eindeutig ist**, und das ist er bei dichten Klicks nicht. Die
Suche läuft um einen halben Klick herum; eine Kette, die langsamer ist als das,
landet beim *vorigen* Klick. Nachgemessen vor dem Bau: Achtel bei 190 BPM
(158 ms Abstand) mit 80 ms Laufzeit meldeten −72 ms, und der Bericht sagte
„du spielst also tatsächlich vorne" zu einem Spieler, der genau auf dem Klick
lag. Score und Treffer betrifft das nicht — die Zuordnung bleibt richtig, nur
um einen Klick verschoben —, die Aussage schon. `versatzEindeutig` hält fest,
wann sie stimmt: wenn ein halber Klick länger ist als jede denkbare Laufzeit
(300 ms), oder wenn eingemessen wurde.

**Einmessen** misst die Laufzeit einmal (`lib/audio/einmessen.ts`). Über den
Lautsprecher hört das Mikrofon die Klicks selbst — reine Maschine, deshalb ist
alles, was ein Block darüber hinaus zeigt, der Spieler (`lageMs`). Per
Anschlag, für Bluetooth-Kopfhörer, steckt die eigene Gewohnheit schon in der
Messung, und eine Lage wird nicht behauptet. Mit Einmessung sucht
`estimateOffset` um die gemessene Laufzeit statt um null. Liegt ein Block mehr
als 45 ms daneben, gilt die Einmessung als veraltet (andere Kopfhörer), wird
für diesen Block verworfen und der Bericht sagt es — **ohne Zahl**, denn dann
ist der Versatz wieder mehrdeutig, und „−39 ms hinter dem Klick" stand so
tatsächlich schon da. Die Einmessung gehört dem Gerät (`lib/storage/lokal.ts`),
nicht dem Log: sie geht weder in den Abgleich noch in die Sicherungsdatei.
Geprüft ist die ganze Kette im Browser mit einer künstlichen Rückführung —
Metronom-Ausgang über eine Verzögerung zurück als Mikrofon —, und die Messung
wandert mit der Verzögerung mit (0 → 21 ms, 150 → 172, 300 → 321; der Rest
ist der Browser selbst). Auf einem echten iPhone ist sie **ungetestet**: ob
Safari bei offenem Mikrofon auf den Hörer statt den Lautsprecher umschaltet,
weiss erst, wer es ausprobiert.

## Wo es weitergeht

- **Tonprüfung im Lick** — erst, wenn `tonhoehe.test.ts` an der festgehaltenen
  Grenze rot wird. Ansatz wäre, den Nachklang des vorigen Tons vor der
  Schätzung herauszurechnen; bis dahin bleibt es beim Rhythmus.
- **Stimmgerät mit echter Gitarre ausprobieren**, clean und verzerrt.
- **Einmessen auf dem iPhone ausprobieren** — siehe *Timing-Messung*.
