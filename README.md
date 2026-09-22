<p align="center">
  <img src="assets/banner.svg" alt="Riffforge" width="100%">
</p>

<p align="center">
  <a href="https://cyphomat.github.io/riffforge/"><img alt="App öffnen" src="https://img.shields.io/badge/App-öffnen-e8a23d?style=for-the-badge&labelColor=17161b"></a>
  <img alt="Tests" src="https://img.shields.io/badge/Tests-666%20grün-7fa65c?style=for-the-badge&labelColor=17161b">
  <img alt="Offline" src="https://img.shields.io/badge/Offline-läuft-6f93ad?style=for-the-badge&labelColor=17161b">
  <img alt="Abhängigkeiten" src="https://img.shields.io/badge/Abhängigkeiten-6-a7a3ab?style=for-the-badge&labelColor=17161b">
</p>

<p align="center">
  <b>Eine Übungs-App für eine Person.</b><br>
  Kein Kurskatalog, eine Werkbank. Starten, fünfzehn Minuten spielen, fertig — morgen wieder.
</p>

<p align="center">
  <sub>100% vibe coded. Nutzung auf eigene Gefahr. Featurewünsche gerne gesehen.</sub>
</p>

<p align="center">
  <b>Deutsch</b> · <a href="README.en.md">English</a>
</p>

---

## So sieht es aus

<table>
<tr>
<td width="33%"><img src="assets/screens/heute.png" alt="Startbildschirm mit der Ansage"></td>
<td width="33%"><img src="assets/screens/block.png" alt="Ein Block während der Session"></td>
<td width="33%"><img src="assets/screens/timing.png" alt="Timing-Auswertung nach dem Block"></td>
</tr>
<tr>
<td align="center"><b>Die Ansage</b><br><sub>Was heute dran ist, und warum</sub></td>
<td align="center"><b>Im Block</b><br><sub>Uhr, Tempo, Tab, Metronom</sub></td>
<td align="center"><b>Danach</b><br><sub>Was das Mikrofon gehört hat</sub></td>
</tr>
</table>

**Auf dem Mac wird daraus eine Übersicht** — Ansage, Übungskalender, Kennzahlen
und Tempi nebeneinander statt untereinander:

<img src="assets/screens/heute-desktop.png" alt="Startbildschirm auf dem Mac, breite Ansicht">

**Und im Block liegen Uhr und Tab nebeneinander**, damit beim Spielen nichts
gescrollt werden muss:

<img src="assets/screens/session-desktop.png" alt="Ein Block auf dem Mac, Uhr links, Tab rechts">

<sub>Echte Bildschirme mit Beispieldaten, aufgenommen über <code>tools/shots.mjs</code>. Keine Mockups — die Timing-Werte oben stammen aus einer echten Messung.</sub>

---

## Beim ersten Start

<p align="center">
  <img src="assets/screens/erster-start.png" alt="Die zwei Fragen beim ersten Start" width="300">
</p>

Zwei Fragen, danach nie wieder: **wo du stehst** und **was dich zuerst
interessiert**. Beide ändern etwas Echtes — die erste setzt die Starttempi
aller Drills, die zweite gewichtet, was zuerst drankommt.

Ein Schwerpunkt ist dabei kein Filter: wer Lead wählt, kommt trotzdem an die
rechte Hand, nur später. Und beides betrifft nur den *Anfang* — sobald ein Log
da ist, schreibt sich das Tempo daraus fort und die Antwort spielt keine Rolle
mehr.

## Wie eine Session abläuft

Immer dieselbe Form, damit sie keine Entscheidung kostet:

```
Warm-up     2 min    Finger wach kriegen
2 Fragen    ~40 s    zu dem, was gleich kommt
Technik     ~3 min   eine Sache isoliert, mit Metronom
Riff        ~3 min   dieselbe Technik im musikalischen Kontext
2 Fragen    ~40 s    quer durch alles, was fällig ist
Technik     ~3 min   zweite Runde, mit Abstand dazwischen
Riff        ~3 min   zweite Runde
Abschluss            Selbsteinschätzung — landet im Log
```

Am Ende: **Feierabend** oder **+5 Minuten**. Die Form ist fix, der Inhalt passt
sich an. Die Fragen sind [überspringbar](#in-der-session) und lassen die
Session nicht wachsen.

## Was sie dir sagt

Der Unterschied zu einem Metronom mit Tab-Bildern: sie hat eine Meinung zum
heutigen Tag — aus dem Log, nicht aus dem Bauch.

- **Die Ansage** liest die letzte Session, die laufende Serie und die Pause davor
  und entscheidet zwischen `START`, `PAUSE`, `TECHNIK`, `SOLIDE` und `HART`. Jede
  Zeile ist im Log nachprüfbar:

  > **TECHNIK** — Heute sauber, nicht schnell.
  > *Gallop war zuletzt wackelig bei 95 BPM. Das Tempo bleibt, bis es sitzt.*

- **Ein wackeliger Block wiegt schwerer als drei saubere.** Was nicht sitzt,
  bestimmt den Ton — nicht der Durchschnitt.
- **Das Tempo schreibt sich fort.** Sauber durchgekommen heisst nächstes Mal
  schneller, gequält heisst langsamer. Wackelig heisst: dasselbe Tempo nochmal,
  denn genau dort passiert die Konsolidierung.
- **Was drankommt**, wählt der Scheduler nach zwei Kräften: was am schwächsten
  sitzt, und was am längsten her ist.
- **Ein Drill, den du kennst, kommt zweimal dran** — mit etwas anderem
  dazwischen. Das ist der [Kontextinterferenz-Effekt](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4989027/):
  verteilte Wiederholung behält sich messbar besser als eine lange am Stück,
  obwohl sie sich schlechter anfühlt. Ein **neuer** Drill bekommt seinen Block
  am Stück — beim Erlernen einer Bewegung ist das die bessere Reihenfolge.
- **Erst das Geschaffte, dann der Bericht.** Neue Bestwerte stehen nach der
  Session ganz oben.
- **Der Übungskalender** zeigt sechzehn Wochen am Stück. Bewusst nur geübt oder
  nicht, ohne Abstufung nach Minuten: eine Session ist per Konstruktion rund
  eine Viertelstunde: die Minuten pro Tag als Farbverlauf zu zeigen hiesse,
  Rauschen als Signal auszugeben. Was hier zählt, sind Serien und Lücken.

## Die Übungen

Zwanzig Stück. Das Tempo rechts ist Start → Ziel; wo du tatsächlich anfängst,
hängt an deiner Antwort beim ersten Start, und wie es weitergeht an dem, was du
spielst.

**Warm-up**

| Drill | Technik | Ziel | BPM |
|---|---|---|---|
| Chromatic 1-2-3-4 | — | Finger unabhängig machen und die Hand aufwärmen | 60 → 120 |
| String Skipping | — | Anschlaghand treffsicher machen, ohne hinzusehen | 60 → 130 |

**Technik**

| Drill | Technik | Ziel | BPM |
|---|---|---|---|
| Downpicking Endurance | Downpicking | Ausdauer im reinen Abschlag — der Kern des Thrash-Sounds | 90 → 190 |
| Chug Control | Palm Muting | Gleichmässige Palm Mutes — jeder Chug gleich laut, gleich kurz | 80 → 170 |
| Gallop | Gallop | Das Achtel-plus-zwei-Sechzehntel-Muster sauber und stabil | 70 → 150 |
| Power Chord Shifts | Power Chords | Lagenwechsel ohne Lücke und ohne Nebengeräusch | 70 → 160 |
| Alternate Picking | Alternate Picking | Gleichmässiger Wechselschlag auf einer Saite | 60 → 140 |
| Pentatonik Box 1 | Pentatonic | A-Moll-Pentatonik in der 5. Lage, hoch und runter | 60 → 150 |
| Bending & Vibrato | Bending | Ganztonziehen auf Tonhöhe treffen und halten | 50 → 100 |
| Hammer-on und Pull-off | Legato | Töne mit der Greifhand erzeugen, ohne die Anschlaghand | 55 → 130 |
| Slides | Slides | Lagenwechsel im Tempo, ohne den Ton zu verlieren | 55 → 120 |
| Dead Notes | Dead Notes | Anschläge ohne Ton — die Lücken füllen, ohne den Klang zu trüben | 60 → 140 |
| Tremolo Picking | Tremolo | Sehr schneller Wechselschlag auf einer Saite, gleichmässig | 70 → 180 |

**Riff**

| Drill | Technik | Ziel | BPM |
|---|---|---|---|
| Ironclad | Gallop | Gallop plus Lagenwechsel — das erste richtige Riff | 70 → 145 |
| Chromatic Crawl | Palm Muting | Offene Chugs gegen chromatische Zielnoten — Timing unter Druck | 80 → 160 |
| Downpicked Dirge | Downpicking | Langsam, schwer, alles Abschlag — Timing ohne Versteck | 60 → 130 |
| Escape Lick | Pentatonic | Erstes Lead-Lick: Pentatonik mit Bending am Ende | 55 → 120 |
| Ghost Machine | Dead Notes | Dead Notes im Riff — Sechzehntel, von denen nur die Hälfte klingt | 60 → 150 |
| Hammer Down | Legato | Legato aus der Leersaite heraus, im Riff-Kontext | 55 → 130 |
| Lick-Schmiede | Pentatonic | Ein neues Lead-Lick aus der Pentatonik — bleibt, bis es sitzt | 50 → 130 |

## Ein Lick

Neben der Viertelstunde gibt es einen zweiten Eingang: **Ein Lick**, der
Geisterknopf unter dem Startknopf — oder direkt `/lick`. Drei Minuten Lead,
ohne Session drumherum, für den, der gerade Lust darauf hat.

Das Lick wird **gerechnet**, nicht aus einer Liste gezogen. Töne aus der
Pentatonik zu würfeln ergäbe Tonsalat, und daran lernt man vor allem *keine
Phrasierung*. Deshalb hat jedes Lick dieselbe Form — zwei Takte 4/4 auf
Achteln:

```
Motiv        drei bis vier Töne mit einer Richtung: auf, ab, Bogen, Zickzack
Entwicklung  dasselbe Motiv wiederholt, sequenziert oder umgekehrt
Anlauf       schrittweise auf den Zielton zu
Auflösung    Grundton oder Quinte, auf der Drei, gehalten mit Vibrato
```

Der Zielton ist stabil, weil ein Lick, das auf der kleinen Terz aufhört,
abgebrochen klingt statt offen.

Wählbar sind **alle zwölf Grundtöne in fünf Lagen** — sechzig Boxen. Die
Auswahl nennt dabei den tiefsten Bund statt nur die Lagennummer: „Lage 3" sagt
beim Greifen nichts, „ab Bund 8" schon. Die Lagen laufen im Kreis, und welche
zuunterst liegt, hängt am Grundton: bei A-Moll ist es Lage 4, nicht Lage 1.

Ein Lick **bleibt, bis du es mit _Sauber_ abhakst** — dann kommt das nächste.
Es schreibt in denselben Log und unter dieselbe Drill-Nummer wie die
Lick-Schmiede in der Session: der Generator ist der Drill, das Lick ist der
Inhalt. Eine Tempokurve über lauter verschiedene Licks wäre nicht deutbar, und
zwei Hälften, die nichts voneinander wissen, wären es auch nicht.

Das Mikrofon hört dabei nur den **Rhythmus**. Ob die *Töne* sassen, kann die
App nicht wissen und behauptet es auch nicht — das ändert sich erst mit einer
[Tonhöhen-Erkennung](#was-noch-kommt).

## Sieben Saiten

Ein eigener Modus für die Siebensaitige — **/sieben**, der zweite
Geisterknopf auf *Heute*. Zehn Minuten, drei Blöcke aus einem eigenen
Katalog: Aufwärmen, Technik, Riff. Kein Teil der täglichen Viertelstunde,
und das ist kein Geschmacksurteil: für diese Übungen brauchst du eine andere
Gitarre, und ein Block, den man nicht spielen kann, weil sie im Koffer liegt,
wäre ein kaputter Tagesplan.

Gestimmt wird **B Standard** — `B – E – A – D – G – B – E`. Sechs Saiten
bleiben, wie sie waren, die tiefe B kommt unten dazu, eine Quarte unter der
tiefen E. Das ist die Auskunft, die einem Umsteiger fehlt: **im fünften Bund
der neuen Saite liegt genau der Ton, den deine bisher tiefste Leersaite
gibt.** Alle Griffbilder gelten unverändert weiter, weil der Abstand zwischen
zwei Saiten überall derselbe ist — ausser zwischen G und B, wie eh und je.

Drop A gibt es bewusst nicht: das ist eine andere Orientierung auf der
tiefsten Saite und wäre ein zweiter Katalog, kein Umschalter.

| Drill | Sorte | Ziel | BPM |
|---|---|---|---|
| Alle Sieben | Warm-up | Die Anschlaghand lernt, dass der Hals unten weitergeht | 60 → 120 |
| Quartensprung | Warm-up | Jede zweite Saite treffen, ohne hinzusehen | 55 → 120 |
| Chug auf B | Technik | Die tiefe Saite trocken bekommen statt dumpf | 70 → 160 |
| Stille auf der Sieben | Technik | Die tiefe Saite zum Schweigen bringen, während oben gespielt wird | 55 → 120 |
| Power Chords auf der Sieben | Technik | Grundton auf der tiefsten Saite, ohne Nebengeräusch | 60 → 150 |
| Gallop auf B | Technik | Die Gallop-Figur unten, ohne dass sie verschmiert | 60 → 140 |
| Pentatonik in den Keller | Technik | Die vertraute Box um die siebte Saite verlängern | 55 → 140 |
| Tieferlegung | Riff | Gedämpfte Chugs unten gegen offene Power Chords | 60 → 140 |
| Wechselbad | Riff | Zwischen tiefster Saite und Mittellage springen, ohne Gebrumm | 55 → 130 |
| Erdgeschoss | Riff | Eine Lead-Figur, die unten aus der Box herausfällt | 50 → 120 |

Die Übungen landen im **selben** Übungs-Log wie alles andere, jede mit
eigener Nummer und eigener Tempokurve. Getrennt sind nur die Kataloge, und
zwar für die Auswahl: im *Drills*-Verzeichnis stehen sie unten für sich und
lassen sich einzeln antippen. Wissensfragen gibt es hier keine — das ist ein
Handwerks-Modus, und was es über die tiefe Saite zu wissen gibt, steht am
Drill.

## Wissen

<p align="center">
  <img src="assets/screens/wissen.png" alt="Eine aufgelöste Griffbrett-Frage mit Erklärung" width="300">
</p>

Fünfzehn Minuten Spielen und Theorie schlagen sich schlecht, wenn die Theorie
ein zweiter Bildschirm zum Lesen ist. Deshalb ist hier die **Frage der
Normalzustand** und der Text das, was danach kommt: Abfragen behält sich
messbar besser als Nachlesen, und für Musik ist das kaum umgesetzt.

Siebenundachtzig Begriffe in sechs Stufen — vom Halbton bis zum Riff-Bau. Jeder
mit zwei, drei Sätzen und einer Frage:

- **Auf dem Griffbrett zeigen**, wo das geht. Antworten produzieren bringt mehr
  als aus vier Kästchen wählen, und die Gitarre ist das Instrument, auf dem
  sich Theorie zeigen lässt, ohne sie aufzuschreiben. Derselbe Ton liegt an
  mehreren Stellen: wer eine davon trifft, hat recht.
- **Nach jeder Antwort steht die richtige da**, mit dem Satz, warum sie richtig
  ist. Ohne Rückmeldung kehrt sich der Vorteil des Abfragens bei niedriger
  Trefferquote sogar um.
- **Wann etwas wiederkommt**, entscheidet [FSRS-6](https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler) —
  drei Zahlen je Karte statt einer Faustregel. Portiert aus der
  Referenzimplementierung und gegen 76 ihrer Ergebnisse geprüft, nicht
  nachempfunden.
- **Der Kartenstand wird abgespielt, nicht gespeichert.** Antworten sind
  unveränderlich; zwei Geräte verschmelzen ihre Antworten und kommen von selbst
  auf denselben Stand.

Die Töne stehen englisch, wie in jeder Tabulatur: der Ton über A heisst **B**,
nicht H. Wer aus deutschen Noten kommt und trotzdem H tippt, bekommt genau
diesen Hinweis statt eines „leider falsch" — gemeint war ja das Richtige.

### In der Session

Die Fragen warten nicht auf dem Wissens-Bildschirm, sie kommen mitten im Üben —
in den Übergängen, wo das Plektrum ohnehin abgesetzt wird. Vier Stück, rund
achtzig Sekunden. Die Session wächst dadurch nicht, und
blockieren kann sie nichts: **Überspringen, weiterspielen** steht immer da, und
die Karten bleiben fällig. Ist gerade nichts fällig, fällt die Portion lautlos
aus.

Die erste Portion **grundiert**: sie fragt zu der Technik, die im nächsten Block
drankommt. Das ist der Bezug zum Gespielten — Theorie ohne ihn bleibt ein
eigenes Hobby.

### Eine Frage, die man spielt

Sieben Karten fragen keinen Begriff ab, sondern eine Figur: **Spiel zwei Takte
Gallop.** Das Mikrofon hört mit, und die Bewertung ist gemessen statt geraten —
das kann kein Karteikartenprogramm, und es fällt hier heraus, weil die
Anschlagserkennung ohnehin da ist.

Zuerst zwei Takte Einzähler mit je einem Ton auf den Schlag. Daraus kommt die
Verzögerung der Signalkette; erst danach zählt die Figur. Ohne diesen Anker
ginge es nicht: eine Figur ist ungleichmässig, und eine Verzögerung in der
Grössenordnung ihrer Abstände sieht aus wie eine *andere* Figur — nachgemessen
passt ein umgekehrter Gallop um 125 ms verschoben zu über achtzig Prozent auf
einen Gallop. Auf gleichmässigen Schlägen ist der Versatz dagegen eindeutig.

Gezählt wird dabei zweierlei: ob die verlangten Anschläge kamen — und ob
*nur* die kamen. Ohne die zweite Zahl bestünde stures Dauerspiel jede
Figurfrage, denn die Zeitpunkte eines Gallops liegen alle auf dem
Sechzehntelraster. Aus demselben Grund gibt es keine Frage nach Sechzehnteln:
sie sind das feinste Raster, jede andere Figur ist eine Teilmenge davon, und
die Frage wäre mit fast allem zu bestehen.

Eine Figur darf auch länger sein als ein Schlag. Dreiergruppen — punktierte
Achtel — schliessen erst nach drei Schlägen wieder auf den Schlag; die Frage
läuft deshalb drei Takte statt zwei.

Bei einer Karte zählt zusätzlich die Lautstärke: **Dead Notes** sind im
Zeitraster von geraden Sechzehnteln nicht zu unterscheiden, der Unterschied
steckt allein darin, wie leise die gedämpften Anschläge sind. Nachgemessen
trennen sie sich auch bei starker Verzerrung noch um Faktor 1,5 vom Rauschen.
Akzente tun das nicht — sie bleiben bei 1,15 bis 1,24 und liegen damit im
Rauschen. Deshalb werden sie erklärt und nicht gemessen.

Ohne Mikrofon blockiert nichts: die Auflösung lässt sich auch so zeigen. Das
gilt dann als *nicht gemessen*, nicht als danebengespielt — die App weiss an
der Stelle schlicht zu wenig für ein Urteil.

## Was das Mikrofon hört

Zuschaltbar in jedem Block. Sie hört **Anschläge, keine Tonhöhen** — bei
verzerrter Gitarre ist Pitch-Tracking unzuverlässig, Transienten dagegen sind
eindeutig, und für Rhythmusarbeit ist der Einsatzzeitpunkt ohnehin die ganze
Frage.

Zwei Zahlen, die man nicht verwechseln darf:

| | |
|---|---|
| **Streuung** | Wie gleichmässig du bist. **Das** ist die Spielqualität, darauf baut der Score. |
| **Versatz** | Der konstante Abstand zum Klick. Steckt voller Laufzeit — Saite → Luft → Mikrofon → Puffer. Zählt **nicht** gegen dich. |

Der Versatz wird geschätzt, **bevor** zugeordnet wird. Ohne diesen Schritt
verfehlt bei Bluetooth-Kopfhörern (150–300 ms Latenz) jeder Ton seinen Klick,
und die Messung liest sich still als „nichts gehört".

Ein **negativer** Versatz ist übrigens kein Latenz-Artefakt: Laufzeit kann einen
Ton nur später machen, nie früher. Wer vorne liegt, spielt wirklich vorne — und
das sagt sie dann auch so.

Danach schlägt sie die Einschätzung selbst vor. Du kannst sie überstimmen.

> **Kopfhörer benutzen.** Über Lautsprecher hört das Mikrofon das Metronom mit
> und zählt es als Anschlag.

Es wird nichts aufgenommen und nichts hochgeladen — nur der Zeitpunkt jedes
Anschlags ausgewertet.

---

## Als App installieren

**iPhone / iPad** — in **Safari** öffnen (Chrome auf iOS kann das nicht),
Teilen → *Zum Home-Bildschirm*.

**Mac** — Safari 17+: *Ablage → Zum Dock hinzufügen*. In Chrome: Symbol in der
Adressleiste → *Installieren*.

Danach startet sie ohne Browserleiste, hat ein eigenes Icon und **läuft
offline** — nach dem ersten Aufruf liegt alles im Cache, eine Session braucht
kein Netz mehr.

Installieren lohnt auch aus einem weniger offensichtlichen Grund: Safari räumt
den Speicher normaler Webseiten nach sieben Tagen ohne Besuch auf. Für
Home-Screen-Apps gilt das nicht — dein Übungs-Log überlebt also nur, wenn du
sie wirklich installierst.

### Zwei iOS-Eigenheiten

- **Der Klingelschalter muss an sein.** iOS schaltet Web-Audio stumm, wenn das
  Gerät auf lautlos steht — das Metronom bleibt still, ohne Fehlermeldung. Das
  ist eine iOS-Eigenheit, kein Fehler der App.
- **Mikrofon braucht iOS 14.3 oder neuer.** Davor gab Safari im
  Home-Screen-Modus keinen Mikrofonzugriff frei.

## Daten

Der Übungsfortschritt liegt in `localStorage` auf dem Gerät. Kein Konto, kein
Server — solange du nichts anderes einrichtest, verlässt nichts den Browser.

Unter **Daten** holst du ihn als JSON heraus und wieder herein — Übungs-Log und
beantwortete Wissensfragen in einer Datei. Ein Import **legt dazu, statt zu
ersetzen**: Einträge sind unveränderlich und tragen Drill und Zeitstempel, also
ist die Vereinigung beider Seiten die richtige Antwort — zwei Geräte, die
unabhängig geübt haben, haben beide recht. Vor dem Übernehmen zeigt die App,
wie viel davon wirklich neu ist.

### Abgleich zwischen Geräten

Dort lässt sich auch ein **privates Datenrepo** verbinden. Die App legt den Log
dann zusätzlich als eine Datei dorthin, und iPhone und Mac ziehen sich
gegenseitig nach — nach jeder Session automatisch, oder von Hand.

Es gewinnt dabei keine Seite. Beim Schreibkonflikt wird neu gelesen, erneut
verschmolzen und noch einmal geschrieben; dieselbe Vereinigung wie beim Import.
Ein Abgleich ohne Neuigkeiten erzeugt keinen Commit.

Zwei Dateien liegen dort: `uebungen.json` und `theorie.json`. Getrennt aus
einem konkreten Grund — ein Gerät mit älterem Stand kennt ein neueres Feld
nicht, streift es beim Einlesen ab und schriebe es beim nächsten Abgleich weg.
Zwei Dateien können sich nicht gegenseitig löschen.

Was du brauchst: ein privates Repo (etwa `riffforge-data`) und einen
**fein granulierten** Token, der ausschliesslich darauf zeigt, mit
*Contents: Read and write*. Eng gefasst aus einem konkreten Grund — alle Seiten
unter `github.io` teilen sich denselben Browser-Speicher, und ein Token, der
nur ein Datenrepo öffnen kann, begrenzt den Schaden, falls irgendeine dieser
Seiten einmal eine Lücke hat.

Steht das Datenrepo auf öffentlich, sagt die App das deutlich: sie funktioniert
dann genauso, nur liest jeder mit.

### Fassung und Updates

Unter *Daten* steht, welcher Stand gerade läuft — Commit und Datum — und ob auf
dem Server ein neuerer liegt. Das ist auf einem Handy kein Luxus: eine
installierte PWA behält ihre Hülle im Speicher, und ohne diesen Vergleich merkt
niemand, dass er seit Wochen eine alte Fassung startet. **Jetzt aktualisieren**
leert den Offline-Speicher und lädt neu; Übungs-Log, Profil und Abgleich bleiben
unberührt.

Der Vergleich braucht kein Netz nach draussen: der Bau-Stempel liegt als
`version.json` neben der App, und derselbe Stempel steckt im Bündel. Weichen
sie ab, hält der Browser eine alte Fassung fest.

**Wenn dies ein Fork ist**, sagt die App das — und bietet an, beim Original
nachzusehen, wie viel sich dort seitdem getan hat. Diese eine Anfrage geht an
`api.github.com` und läuft nur auf Knopfdruck; die Auslieferung des Originals
stellt sie nie.

### Löschen heisst löschen

**Alles löschen** unter *Daten* räumt den Log, eine eventuell beiseitegelegte
Kopie davon und die beiden Antworten vom ersten Start weg. Danach ist die App
wieder wie frisch installiert. **Trennen** löscht Konto, Repo und Token aus dem
Browser-Speicher.

### Was die App nicht tut

Keine Analyse-Dienste, keine Schriften von fremden Servern, keine Einbettungen —
nachgemessen, nicht behauptet: beim Laden aller Seiten und einer vollständigen
Session geht **keine einzige Anfrage** an einen anderen Host. `api.github.com`
ist die einzige fremde Adresse überhaupt, und auch die nur zweimal: beim
Abgleich, wenn du ihn eingerichtet hast, und auf Knopfdruck beim Blick zum
Original — Letzteres nur in einem Fork.

Das Mikrofon verlässt den Rechner nicht: der Audio-Thread meldet ausschliesslich
**Zeitstempel und einen Pegelwert** nach vorne, kein Ton wird aufgenommen,
gespeichert oder verschickt. Nach jedem Block wird die Aufnahme wieder
freigegeben.

Weil auf GitHub Pages keine eigenen Kopfzeilen gehen, steht die
Content-Security-Policy als Meta-Tag in der Seite. Der wichtige Teil ist
`connect-src`: Anfragen dürfen nur an die eigene Adresse und an GitHub gehen.
Käme über irgendeinen Weg fremdes Skript in die Seite, könnte es Token und Log
nirgendwohin schicken.

---

## Entwicklung

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

```bash
pnpm test         # Vitest — die Logik in lib/session und lib/audio
pnpm check        # Typen, Tests und Lint in einem Rutsch
pnpm build        # statischer Export nach out/
```

Die Logik in `lib/session/` und `lib/audio/timing.ts` ist rein: kein React,
keine Browser-APIs. Deshalb ist sie testbar, und deshalb liegen dort die Tests.
Neue Regeln zu Tempo, Auswahl oder Bewertung gehören dorthin, nicht in eine
Komponente.

Das Mikrofon braucht einen sicheren Kontext. `localhost` zählt als sicher, die
IP im Heimnetz **nicht** — zum Testen auf dem Handy also über die
veröffentlichte Seite gehen, nicht über `http://192.168.…`.

Neue Bildschirme für diese Seite:

```bash
pnpm build && (cd out && python3 -m http.server 3100 &)
node tools/shots.mjs
```

Architektur und Konventionen stehen in [CLAUDE.md](./CLAUDE.md).

## Deployment

Push auf `main` → GitHub Actions baut den statischen Export und veröffentlicht
ihn auf GitHub Pages ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)).
Der Workflow lässt nichts durch, was `pnpm check` reisst.

Pages liefert unter `/<repo>/` aus, deshalb setzt der Workflow
`NEXT_PUBLIC_BASE_PATH`. Pfade, die zur Laufzeit entstehen — das Audio-Worklet,
der Service Worker — müssen durch `asset()` aus `lib/base-path.ts`, sonst
greifen sie im Unterverzeichnis daneben.

## Inhalte

Alle Drills und Riffs sind **eigene** Übungen im jeweiligen Stil. Keine
abgeschriebenen Tabs, kein Audio urheberrechtlich geschützter Aufnahmen.

## Was noch kommt

- **Stimmgerät.** Autokorrelation reicht dafür, und man braucht es vor jeder
  Session ohnehin.
- **Kalibrierung**: den Versatz einmal messen und behalten, statt ihn pro Block
  neu zu schätzen. `AudioContext.outputLatency` gäbe es dafür — nur Safari
  liefert es nicht, weder auf dem Mac noch auf dem iPhone.
- **Der iOS-Klingelschalter.** Es gibt einen bekannten Kniff, um Web-Audio
  trotz Stummschaltung klingen zu lassen. Ungetestet, deshalb noch nicht drin.

## Danke

Design-Sprache, Ton und die Idee der Ansage kommen von
[Setlist](https://github.com/cyphomat/setlist) — dem Schwesterprojekt fürs
Training. Kein Neon: ein Röhrenamp glimmt, er strahlt nicht.
