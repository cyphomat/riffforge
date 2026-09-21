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
| `components/session/*` | UI der Session |
| `lib/theory/fsrs.ts` | FSRS-6, portiert aus der Referenz. Rein, gegengeprüft. |
| `lib/theory/types.ts` | Karten, Fragen und der Antwort-Log |
| `lib/theory/progress.ts` | Kartenstand aus dem Antwort-Log, Auswahl fürs Abfragen |
| `lib/theory/fretboard.ts` | Griffbrett als Rechnung: Töne, Intervalle, Lagen |
| `lib/theory/hals.ts` | Die Maße des Halses — einmal für das SVG, einmal fürs CSS |
| `lib/theory/lick.ts` | Lead-Licks als Grammatik: Motiv, Entwicklung, Anlauf, Auflösung |
| `lib/session/lead.ts` | Hängt das gerechnete Lick an einen Drill mit fester Nummer |
| `components/session/lick-runner.tsx` | Der zweite Eingang: ein Lick allein, ohne Session |
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
- **Der Grund ist der Hals, nicht ein Muster, das so aussieht.** Die Maße
  stehen einmal in `lib/theory/hals.ts` — 44 px Bundbreite, 62 px
  Saitenabstand, Einlagen bei 3, 5, 7, 9 und doppelt am 12. Daraus zeichnet
  `fretboard.tsx` das antippbare Griffbrett *und* `globals.css` den
  Hintergrund, gekachelt mit 528 × 372 px. `__tests__/hals.test.ts` liest das
  Stylesheet und rechnet die Einlagen gegen das Modul nach; wer eine Zahl
  verschiebt, ohne sie zu rechnen, fällt dort auf. Dasselbe Prinzip wie bei
  den Tönen: eine Tabelle mit hundert Zahlen lügt irgendwann unbemerkt.
- **Der Hals hat einen Regler, und der heisst `--hals`.** Saiten, Bünde und
  Einlagen liegen zusammen auf `body::before`, nicht an drei Stellen verteilt.
  Der Grund dafür steht im Verlauf: erst lagen die Saiten im Register von
  `--raster` und waren unsichtbar — `--raster` hat die Aufgabe, nicht
  aufzufallen, eine Zahl zu treffen ist kein Ziel. Dann zog ich alle drei
  zugleich hoch, bis an die obere Kante meines eigenen Korridors. Auf einem
  OLED, wo Fast-Schwarz wirklich schwarz ist, war das Unruhe statt Tiefe —
  und mein Messwert aus einem sRGB-Screenshot hatte das nicht gesehen. Drei
  Stärken gleichzeitig zu verstellen heisst, keine davon beurteilen zu
  können. Deshalb ein Regler.
- **Ein Muster, das man nicht als Ganzes sieht, ist Unruhe.** Die Halskachel
  ist 528 px breit — auf einem Handy passt sie nicht aufs Bild, und was
  ankommt, sind Bruchstücke: Linien, die sich kreuzen, Punkte, die zu nichts
  gehören. `--hals` steht deshalb schmal auf 0,28 und erst ab 900 px auf 1.
  Dieselbe Schwelle wie `wide:`. Wer ein Flächenmuster hinzufügt, prüft es
  zuerst auf 390 px.
- **Vier Bauteile tragen den Metal-Twist, und jedes hat eine Grenze.**
  `.winkel` sind die Eckwinkel am Road-Case — **höchstens zwei je Bildschirm**,
  und nur auf dem, was gerade dran ist: die Ansage auf *Heute*, der laufende
  Block, der Wissens-Kopf. Ein Winkel an jeder Fläche wäre Dekoration.
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
- **Die Wortmarke hat eine eigene Schrift, sonst nichts.** Anton als
  `--font-marke`, ausschliesslich auf `.marke`. Überschriften, Zahlen und
  Tempo bleiben Oswald, damit die App nicht überall schreit.
- **`.num` gibt nur `tabular-nums`, `.ziffern` gibt die Monospace.** Beide
  stehen in `@layer components`, und `font-mono` in `.num` stach früher die
  Anzeigeschrift von `.display` aus — Timer und Tempo rendern dann in der
  System-Monospace. Wer eine grosse Zahl setzt, nimmt `display num`; die
  Monospace ist für Tabs und Log-Zeilen da.
- **Rost ist „nicht ganz", Rot ist „kaputt".** `--rost` trägt die zähe
  Bewertung, die überfällige Karte, die fehlende Bedingung. Bleibt Rot dafür
  frei, heisst Rot wirklich noch etwas.
- **Lokal ist der Normalfall, der Abgleich die Ausnahme.** Die App läuft
  vollständig ohne Datenrepo: alles liegt in `localStorage`, mitgenommen wird
  über eine Datei. Auf *Daten* steht deshalb zuerst Sichern, Einlesen und
  Löschen; der GitHub-Abgleich sitzt zugeklappt darunter unter *Mehrere
  Geräte*. Wer ihn nicht will, sieht von GitHub nie etwas — und `runSync`
  liefert ohne eingerichtetes Repo still `ok: false` statt eines Fehlers.
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
- **Der zweite Eingang ist ein Nebenweg, kein zweiter Hauptweg.**
  `/lick` gibt drei Minuten Lead ohne Session drumherum — für den, der
  gerade Lust darauf hat. Er schreibt in denselben Log und unter dieselbe
  Nummer: sonst hätte die Tempokurve zwei Hälften, die nichts voneinander
  wissen. Auf *Heute* steht er bewusst als Geisterknopf unter dem
  Startknopf; zweimal Bernstein wären zwei Hauptwege, und die Viertelstunde
  ist das Produkt.
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
- **Das Mikrofon hört beim Lick nur den Rhythmus.** Anschläge, keine
  Tonhöhen — ob die *Töne* sassen, kann die App nicht wissen und behauptet es
  auch nicht. Gemessen wird wie überall Streuung und Versatz, der Rest ist
  Selbsteinschätzung. Das ändert sich erst mit einer Tonhöhen-Erkennung.
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
  wieder loswerden — Log, beiseitegelegte Kopie und Profil. Ein neuer
  `localStorage`-Schlüssel gehört deshalb in dieselbe Liste wie sein Löschen.
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
  Server, aber `next dev` läuft auf diesem Rechner. Die geflickten Fassungen
  stehen als `pnpm.overrides` in `package.json`. Wer eine Abhängigkeit hebt,
  schaut danach in `pnpm audit` und räumt Overrides weg, die ins Leere zeigen.

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

## Befehle

```bash
pnpm dev      # Entwicklung
pnpm test     # Vitest (Logik in lib/session und lib/audio)
pnpm check    # tsc --noEmit && vitest run && next lint
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
später machen, nie früher. Wer vorne liegt, spielt wirklich vorne.

## Wo es weitergeht

- **Tonhöhen-Erkennung** für Skalen und Licks — sauber gespielt machbar
  (Autokorrelation/YIN), mit High-Gain deutlich unzuverlässiger.
- **Kalibrierung**: den Versatz einmal messen und speichern, statt ihn pro
  Block neu zu schätzen.
- **Rückblick über Zeit**: Streuung pro Drill über Wochen, statt nur den
  Bestwert.
