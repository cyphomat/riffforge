<p align="center">
  <img src="assets/banner.svg" alt="Riffforge" width="100%">
</p>

<p align="center">
  <a href="https://cyphomat.github.io/riffforge/"><img alt="App öffnen" src="https://img.shields.io/badge/App-öffnen-e8a23d?style=for-the-badge&labelColor=17161b"></a>
  <img alt="Tests" src="https://img.shields.io/badge/Tests-1457%20grün-7fa65c?style=for-the-badge&labelColor=17161b">
  <a href="./LICENSE"><img alt="Lizenz" src="https://img.shields.io/badge/Lizenz-MIT-6f8fa6?style=for-the-badge&labelColor=17161b"></a>
  <img alt="Offline" src="https://img.shields.io/badge/Offline-läuft-6f93ad?style=for-the-badge&labelColor=17161b">
  <img alt="Abhängigkeiten" src="https://img.shields.io/badge/Abhängigkeiten-5-a7a3ab?style=for-the-badge&labelColor=17161b">
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

## Loslegen

<h3 align="center">
  <a href="https://cyphomat.github.io/riffforge/">▶ Riffforge öffnen — cyphomat.github.io/riffforge</a>
</h3>

1. **Öffnen.** Den Link oben, im Browser. Kein Konto, keine Anmeldung, nichts
   zu installieren.
2. **Auf den Home-Bildschirm legen** — empfohlen. iPhone: in **Safari**
   Teilen → *Zum Home-Bildschirm*. Mac und Android: *Installieren* in der
   Adressleiste. Danach läuft sie offline, und Safari räumt den Übungs-Log
   nicht nach sieben Tagen weg. [Mehr dazu](#als-app-installieren)
3. **Spielen.** Beim ersten Start zwei Fragen, dann *Session starten*. Die
   Gitarre reicht; das Mikrofon des Geräts ist freiwillig und misst, wenn du
   es erlaubst, das Timing mit.

Deine Daten bleiben in diesem Browser. Sichern und auf ein anderes Gerät
mitnehmen geht unter *Daten*.

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

**Bei Tageslicht gibt es eine helle Fassung**, aus Roadie: dasselbe
Road-Case in Grau statt Schwarz. Unter *Daten → Darstellung* stehen
**Auto**, **Hell** und **Dunkel**; Auto folgt dem Gerät. Die Wahl gilt nur
für diesen Browser und wird vor dem ersten Anstrich gesetzt, damit nichts
aufblitzt. Der Kontrasttest rechnet beide Fassungen nach — Bernstein ist im
Hellen deutlich dunkler, sonst trüge es auf hellem Grund keinen Text.

**Ein Streifen zu Weihnachten.** Vom 1. bis 26.12. steht auf *Heute* unter der
Ansage ein kleiner Streifen mit Pixel-Tannenbaum und einem Satz; an Lemmys und
Ozzys Todestag eine schlichte Kerze. Ohne Bewegung, nie in der Session, mit ✕
für den Tag. Unter *Daten → Saisonales* geht er ganz aus. Das ist der einzige
Schmuck der App und hat deshalb enge Grenzen (`docs/design-und-themes.md`).

**Eine Gitarre aus dem Rack.** Zu jeder Technik würfelt die Session eine deiner
Gitarren, das Riff dazu spielst du auf derselben; die zweite Runde nie auf
der ersten. Das Rack pflegst du unter *Daten → Gitarren*, es gilt nur für
diesen Browser. Ab zwei Gitarren, im Sieben-Saiter-Modus nur unter den
Siebensaitigen.

---

## Beim ersten Start

<p align="center">
  <img src="assets/screens/erster-start.png" alt="Die zwei Fragen beim ersten Start" width="300">
</p>

Davor kommt einmal der Willkommens-Schirm, mit einer Übungsecke am Abend als
Pixelbild — das Handy auf dem Notenständer zeigt 15 — und den drei Antworten,
die man vor dem ersten Tippen haben sollte: kein Konto, alles bleibt auf dem
Gerät, mitgenommen wird über eine Datei.

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
  obwohl sie sich schlechter anfühlt. Und **nichts läuft länger als drei
  Minuten am Stück**, auch ein neuer Drill nicht: sechs Minuten derselbe
  Palm-Mute-Chug machen kirre, und wer kirre ist, übt nicht mehr. *+5 Minuten*
  sind deshalb zwei verschiedene Drills zu je zweieinhalb.
- **Heute ist ein Plakat.** Das Tageswort steht riesig und in seiner Farbe da,
  darunter ein Satz — und dann, was gleich drankommt, mit Tempo, und der
  Startknopf in derselben Karte. Der Plan wird je Tag fest gewürfelt: was das
  Plakat ankündigt, ist genau das, was die Session spielt.
- **Die Serie zählt Wochen, nicht Tage.** Eine Woche mit mindestens einer
  Session hält sie am Leben. Ein verpasster Abend reisst nichts — belohnt wird
  Regelmässigkeit, nicht Lückenlosigkeit.
- **Erst das Geschaffte, dann der Bericht.** Neue Bestwerte stehen nach der
  Session ganz oben. Darunter klebt die Session als **Setlist-Zettel** mit
  Gaffa-Tape: sauber Gespieltes ist durchgestrichen, was zäh war, trägt den
  Stempel *nochmal*, und neben jedem Song steht, mit welchem Tempo es nächstes
  Mal weitergeht. Die Titel stehen in Edding-Schrift — die einzige
  Handschrift in der App, und nur auf Papier.
- **Der Übungskalender** steht unter *Bisher*, mit Wochentagen und Monaten an
  den Rändern und daneben, wie viele Tage es waren und wann zuletzt. Er wächst
  mit dem Log, bis zu sechzehn Wochen. Bewusst nur geübt oder
  nicht, ohne Abstufung nach Minuten: eine Session ist per Konstruktion rund
  eine Viertelstunde: die Minuten pro Tag als Farbverlauf zu zeigen hiesse,
  Rauschen als Signal auszugeben. Was hier zählt, sind Serien und Lücken.

## Die Übungen

Zwanzig Stück. Das Tempo rechts ist Start → Ziel; wo du tatsächlich anfängst,
hängt an deiner Antwort beim ersten Start, und wie es weitergeht an dem, was du
spielst. In der App trägt jede Technik ein eigenes Pixelzeichen — Flamme fürs
Warm-up, Hand für Palm Mute, das X der Dead Note.

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
| Drei Töne | Pentatonic | Drei Töne lesen und spielen: A, C und D, mit Halben und Vierteln | 50 → 80 |
| Achtel-Pendel | Pentatonic | Achtel und Pausen: eine Achtel ist eine halbe Viertel | 60 → 90 |
| Abstände | Pentatonic | Abstände hören und lesen: Quarte und Quinte über mehrere Saiten | 60 → 100 |
| Zwei Orte | Pentatonic | Lagen: derselbe Ton an zwei Orten, erst in Lage 1, dann in Lage 2 | 50 → 80 |

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

## Songs

Unter den Riffs stehen vier kurze Songs, die nicht nur eine Technik üben,
sondern **Noten lesen**: Töne, Abstände, Längen und Lagen. Jeder Song hat ein Lernziel,
und die App rechnet nach, dass er genau das übt — ein Song, der drei Töne
verspricht und zwei spielt, kommt nicht durch den Test.

| Song | Töne | Notenwerte | Abstände |
|---|---|---|---|
| Drei Töne | A C D | Halbe, Viertel | grosse Sekunde, kleine Terz |
| Achtel-Pendel | A C D E | Viertel, Achtel, Viertelpause | grosse Sekunde, kleine Terz |
| Abstände | A C D E G | Halbe, Viertel, Achtel | grosse Sekunde bis Quinte |
| Zwei Orte | A C D E G | Halbe, Viertel | grosse Sekunde, kleine Terz, Quarte; Lage 1 und 2 |

Der Block zeigt die Notenschrift mit den Tonnamen, darunter die Tabulatur, und
lässt dich den Song anhören — mit Einzähler, Klick und Schleife, im Tempo des
Blocks. Beim Anhören leuchtet die Note, die gerade klingt, in der
Notenschrift auf. Die Länge der Noten hörst du, weil jede dort abgedämpft wird,
wo ihr Wert endet. Ein Mikrofon-Timing gibt es bei Songs nicht: Pausen und lange Noten
liessen ein richtiges Spiel als schlecht erscheinen.

Zwölf Wissenskarten üben das Lesen selbst: eine Note benennen, den Abstand
zweier Noten, die Länge einer Note, den Wert einer Pause. Das Notenbild steht
in der Frage, und die Antwort wird aus ihm gerechnet statt dazugeschrieben.

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

## Der Merch-Stand

<p align="center">
  <img src="assets/screens/merch.png" alt="Der Merch-Stand: Rang und Kutte mit Aufnähern" width="300">
</p>

Ein bisschen Spiel, abgeschaut bei [Setlist](https://github.com/cyphomat/setlist) —
bis in die Gestaltung: Überschriften als Gaffa mit Edding, das Tourshirt zum
Wenden, die Bildleiste der Ränge —
mit derselben Leitregel: **belohnt wird Regelmässigkeit und Qualität, nie
Menge.** Alles wird aus dem Log berechnet und nirgends gespeichert; wer seinen
Stand einliest, hat danach dieselbe Kutte. Erreichbar über die Rang-Zeile auf
*Heute*.

<p align="center"><sub>Die Bühnen, von der Garage bis zur Hall of Fame — gezählt in Wochen, nicht Sessions</sub></p>

<table>
<tr>
<td align="center"><img src="assets/readme/rang-garage.png" width="192" height="96" alt="Garagenband"><br><sub><b>Garagenband</b> · ab Woche 0</sub></td>
<td align="center"><img src="assets/readme/rang-proberaum.png" width="192" height="96" alt="Proberaum"><br><sub><b>Proberaum</b> · ab 4 Wochen</sub></td>
<td align="center"><img src="assets/readme/rang-vorband.png" width="192" height="96" alt="Vorband"><br><sub><b>Vorband</b> · ab 12 Wochen</sub></td>
<td align="center"><img src="assets/readme/rang-support.png" width="192" height="96" alt="Support"><br><sub><b>Support</b> · ab 26 Wochen</sub></td>
</tr>
<tr>
<td align="center"><img src="assets/readme/rang-headliner.png" width="192" height="96" alt="Headliner"><br><sub><b>Headliner</b> · ab 52 Wochen</sub></td>
<td align="center"><img src="assets/readme/rang-festival.png" width="192" height="96" alt="Festival"><br><sub><b>Festival</b> · ab 104 Wochen</sub></td>
<td align="center"><img src="assets/readme/rang-halloffame.png" width="192" height="96" alt="Hall of Fame"><br><sub><b>Hall of Fame</b> · ab 208 Wochen</sub></td>
</tr>
</table>

- **Der Rang** — von der Garagenband über Proberaum, Vorband, Support,
  Headliner und Festival bis zur Hall of Fame. Gezählt werden Wochen mit
  mindestens einer Session, nicht Sessions: wer in einer Woche siebenmal übt,
  steigt nicht schneller. **Der Rang fällt nie.**
- **Die Bühne** — jeder Rang hat eine eigene Pixelszene, von der Garage bis
  zur Hall of Fame; die aktuelle steht im Merch-Stand und klein auf *Heute*.
  Darunter die ganze Tour als Bildleiste: was man hinter sich hat, wo man
  steht, und was noch dunkel ist. Erreichte Bühnen lassen sich antippen —
  dann steht der alte Proberaum wieder gross da, mit dem Tag, an dem du ihn
  erreicht hast.
- **Die Kutte** — Aufnäher mit dem Tag, an dem sie verdient wurden, jede
  Leiter mit eigenem gestickten Motiv. Je Reihe
  steht nur der nächste fehlende als Umriss da, keine Weste voller leerer
  Kreise:

  | Reihe | Aufnäher |
  |---|---|
  | Bühne | Debüt · 10 bis 250 Gigs (Tage, nicht Blöcke) · Serien von 4 bis 52 Wochen · Comeback nach zwei Wochen Pause |
  | Handwerk | *Tight*, *Eingespielt*, *Wie aus einem Guss*: 10, 25, 50 Tage mit lauter sauberen Blöcken · *Auf den Punkt*, *Im Raster*, *Studioreif*: 10, 50, 150 Blöcke mit gemessenem Timing ab 85 · *Zieltempo*: ein, drei, zehn Drills sauber im Ziel |
  | Techniken | Ein Wappen je Technik — *Stahlhand*, *Chug*, *Galopp*, *Wall of Sound*, *Blizzard* und sechs weitere: an fünf verschiedenen Tagen sauber gespielt. Der nächste ist der, dem du am nächsten bist, und er sagt, wie viele Tage fehlen |
  | Lead | *Gitarrensolo*: das erste abgehakte Lick · 10 und 25 Licks |
  | Sieben Saiten | *Die Siebte* · *Low End* — nur sichtbar, wenn je auf sieben Saiten geübt wurde |
  | Wissen | 10 bis 100 Karten, die eine Woche halten · *Taktgefühl*: die erste gespielte Frage richtig |
  | Griffbrett | 12, 36 und alle 72 Stellen, die beim Finden eine Woche halten · *In- und auswendig*: alle 72 auch beim Benennen |
  | Anlässe | *Weihnachtsgig*, *Lemmy*, *Ozzy*: an einem Tag des Anlasses geübt — nur sichtbar, wenn verdient, nie als Umriss |

- **Tourshirts** — jedes Quartal mit Übung ist eine Tour mit festem Namen,
  und jede hängt als grosses Pixel-Shirt am Stand. Die Farbe kommt vom ersten
  Wort des Namens, das Emblem vom zweiten — *Molten Distortion Tour* ist
  dunkelrot mit Blitz, *Black Amps Tour* schwarz mit Box. Vorne steht der
  Druck mit Riffforge, Emblem, Tourname und Quartal, die laufende Tour trägt
  einen *Live*-Sticker. **Rückseite zeigen** dreht das Shirt um: hinten stehen
  die Tourdaten, wie auf jedem echten Tourshirt. Darunter lassen sich alle
  Termine aufklappen, mit dem, was an dem Tag gespielt wurde.
- **Festival-Shirts** — eins für jeden Rang ab dem Proberaum, als Langarm mit
  Ärmeldruck: Demo-Tape, Mikrofon, Backstage-Pass, Scheinwerfer, Pommesgabel,
  goldene Schallplatte. Der Rang ist das Langsamste in der App; ein Schritt
  auf der Leiter ist etwas zum Anziehen wert.

<p align="center">
  <img src="assets/readme/kutte.png" width="720" height="48" alt="Die gezeichneten Aufnäher, eine je Leiter">
</p>

<table>
<tr>
<td align="center"><img src="assets/screens/tourshirt-vorne.png" width="300" alt="Das laufende Tourshirt von vorne, mit Live-Sticker"><br><sub>Vorne: Druck und <i>Live</i>-Sticker</sub></td>
<td align="center"><img src="assets/screens/tourshirt-hinten.png" width="300" alt="Dasselbe Shirt gewendet, mit den Tourdaten"><br><sub>Gewendet: die Tourdaten</sub></td>
</tr>
</table>

Steigt eine Session den Rang hoch, zeigt der Abschluss die neue Bühne und das
Festival-Shirt dazu. Die Technik-Wappen sind nicht gezeichnet, sondern
gerechnet: dasselbe Zeichen wie in der Drill-Liste, auf Tuch gestickt.

Was die App nicht messen kann, wird auch nicht belohnt: ob die Töne sassen,
weiss sie nicht, und dafür gibt es keinen Aufnäher. Was ein Gerät nicht hat —
eine Siebensaitige —, fehlt auf der Kutte, statt als verfehlt dazustehen. Nach
einer Session stehen neu verdiente Aufnäher direkt unter dem Zettel.

## Der Rückblick

*Wo du stehst* zeigt den Bestwert — eine Zahl, die nur steigen kann und
deshalb nicht sagt, ob es gerade vorangeht. Der Rückblick zeigt den Verlauf,
erreichbar über die Zeile unter dem Rang auf *Heute*:

- **Die Wochen** — Übungstage je Kalenderwoche als Säulen, die laufende in
  Bernstein, dazu Tage, Minuten und Blöcke gegen die Vorwoche. Wochen ohne
  Übung stehen als leere Woche da; eine Pause zu verschweigen hiesse
  beschönigen.
- **Je Drill** — zwei Linien nebeneinander: das höchste Tempo, das in der
  Woche *sauber* oder besser sass, und die gemessene Streuung um den Klick
  (weniger ist besser). Zwei Grafiken statt einer mit zwei Achsen, weil zwei
  Skalen in einem Bild jeder anders liest.
- **Am Pult** — darüber, aus Roadie: je Drill ein Kanalzug. Der Fader steht
  auf dem letzten sauberen Tempo, die Bahn reicht vom eigenen Starttempo bis
  zum Ziel — dieselbe Strecke wie der Balken unter *Wo du stehst*. Eine
  Kerbe in Stahlblau zeigt, wo es am Anfang des Rückblicks stand. Ein Drill
  ohne sauberes Tempo bekommt keinen Kanal, statt unten zu stehen und
  „Starttempo" zu behaupten.

Der Rückblick reicht ein Quartal zurück und wächst mit dem Log — wer seit drei
Wochen übt, sieht drei Wochen. Was nicht im Log steht, steht auch hier nicht:
eine Woche ohne sauberes Tempo ist eine Lücke, keine Null, und ohne Mikrofon
gibt es keine Streuung. Jede Grafik gibt es auch als Tabelle.

## Wissen

<p align="center">
  <img src="assets/screens/wissen.png" alt="Eine aufgelöste Griffbrett-Frage mit Erklärung" width="300">
</p>

Fünfzehn Minuten Spielen und Theorie schlagen sich schlecht, wenn die Theorie
ein zweiter Bildschirm zum Lesen ist. Deshalb ist hier die **Frage der
Normalzustand** und der Text das, was danach kommt: Abfragen behält sich
messbar besser als Nachlesen, und für Musik ist das kaum umgesetzt.

Hundertneunundneunzig Begriffe in sechs Stufen — vom Halbton bis zum Riff-Bau.
Jeder mit zwei, drei Sätzen und einer Frage:

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
- **Vor dem Auflösen sagst du, wie sicher du bist** — geraten, ziemlich sicher,
  sicher. Wer „sicher“ war und danebenlag, sieht die Karte gleich wieder; unter
  *Wissen* steht, wie oft deine Einschätzung stimmte. FSRS bekommt davon nichts mit.
- **Die Transfer-Runde fragt Szenarien statt Begriffe** — „Der Song kippt nach Moll,
  was änderst du am Griff?“ — quer durch die Stufen, eine Frage je Stufe, in
  gemischter Reihenfolge. Sie kommt, sobald in einer Stufe drei Karten begonnen sind.
- **Der Kartenstand wird abgespielt, nicht gespeichert.** Antworten sind
  unveränderlich; zwei Geräte verschmelzen ihre Antworten und kommen von selbst
  auf denselben Stand.

Zu jeder Technik, die ein Drill spielt, gibt es Karten — Bending, Legato,
Slides, Tremolo, Wechselschlag, Dead Notes. Ein Test hält das fest: die erste
Portion einer Session fragt zu dem, was gleich gespielt wird, und ohne passende
Karte fragte sie bis Oktober bei sechs Techniken an ihnen vorbei.

**CAGED** steht als eigene Reihe in Stufe 4: die fünf offenen Dur-Griffe C, A,
G, E und D, den Hals hinaufgeschoben, bis jeder Akkord überall unter der Hand
liegt. Gefragt wird auf dem Griffbrett — wo in einer Form der Grundton liegt,
wo die Terz, welche Form als nächste kommt. Die Formen sind gerechnet
(`lib/theory/caged.ts`), nicht abgetippt: die offenen Griffe plus eine
Verschiebung, geprüft in allen zwölf Tonarten. Dabei fällt heraus, was die
Formen mit der Pentatonik verbindet: jede liegt vollständig in genau einer Lage
der Moll-Pentatonik mit denselben Tönen, G-Form in Lage 1 bis A-Form in Lage 5
— in jeder Tonart dieselbe Zuordnung.

Daneben die **Dreiklänge auf drei Saiten**: Dur und Moll in enger Lage, in
Grundstellung und beiden Umkehrungen, ebenfalls gerechnet
(`lib/theory/dreiklaenge.ts`). Auf G-, B- und e-Saite ist jeder davon ein
Ausschnitt aus einer CAGED-Form — auf den tiefen Saiten nicht immer, und
deshalb behauptet die Karte es auch nur dort.

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

### Eine Frage, die man hört

Vierundzwanzig Karten fragen nach dem Gehör: die App spielt zwei Töne
nacheinander, und gefragt ist das Intervall — jedes von der kleinen Sekunde
bis zur Oktave, aufwärts und abwärts. Aufwärts kommt zuerst, und in einer
Reihenfolge, die mit den leicht unterscheidbaren anfängt: Oktave, Quinte,
Quarte, dann die Terzen.

Die Töne wechseln bei jedem Zeigen. Die Antwort ist der Abstand, und den soll
man hören, nicht wiedererkennen, wie die Karte letztes Mal klang. Erzeugt
werden sie aus Obertönen statt als Aufnahme oder Saitenmodell: so liegt die
Tonhöhe genau dort, wo sie soll — nachgemessen mit demselben YIN wie im
Stimmgerät, auf unter zwei Cent über den ganzen Bereich von A2 bis E5.

### Den Hals lernen

Unter *Griffbrett* — auf *Heute* bei den Nebenwegen und auf *Wissen* — liegt
ein eigener Trainer für das, was jede Theorie auf der Gitarre voraussetzt: zu
wissen, wo welcher Ton liegt. Zwei Richtungen, weil es zwei Fähigkeiten sind:
**Ton finden** (F# auf der A-Saite — tippen) und **Ton benennen** (eine Stelle
leuchtet — welcher Ton?). Eine Runde sind zwölf Stellen, rund zwei Minuten, auf
einer Saite, auf E und A oder auf allen.

Jede der zweiundsiebzig Stellen ist in jeder Richtung eine eigene Karte mit
eigener Wiederholung, nach demselben FSRS wie die Wissenskarten. Was hakt,
kommt früher wieder; Neues kommt in einer sinnvollen Reihenfolge, Stammtöne
und tiefe Bünde zuerst. Gezählt wird auch die Zeit: unter zweieinhalb Sekunden
ist eine Stelle flink, über sechs zäh — wer suchen muss, kennt sie noch nicht
ganz, und eine zähe Antwort kommt früher wieder als eine flinke. Die leere
Saite zählt mit: E auf der E-Saite ist leer genauso richtig wie im 12. Bund.
Ein Treffer bleibt gut zwei Sekunden stehen, mit Stelle, Zeit und einem
ablaufenden Balken; wer schneller weiter will, tippt drauf. Die Uhr der nächsten Frage läuft erst, wenn sie da
ist. Unter der
Runde zeigt eine Karte des Halses, was sitzt, was wackelt und was noch neu ist.

Die Antworten landen im selben Log wie die Wissensfragen und werden damit
abgeglichen, gesichert und gelöscht wie alles andere. Als Wissenskarten zählen
sie nicht: weder im Kartenstand noch in der Trefferquote noch für deren
Aufnäher — der Hals hat im Merch-Stand eine eigene Reihe, und was eine Runde
dort einbringt, steht gleich im Bericht.

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

Ein **negativer** Versatz ist eigentlich kein Latenz-Artefakt: Laufzeit kann
einen Ton nur später machen, nie früher. Mit einer Ausnahme, und die ist
nachgemessen: bei dichten Klicks ist der Versatz nur bis auf ganze Klicks
bestimmt. Achtel bei 190 BPM liegen 158 ms auseinander; eine Kette mit 80 ms
Laufzeit landet näher am *vorigen* Klick und las sich als „72 ms vorne", obwohl
der Spieler genau auf dem Klick lag. Den Score betrifft das nicht, die Aussage
schon. Deshalb sagt die App „du spielst vorne" nur noch, wenn es eindeutig ist
— und sonst, dass es eindeutig würde, wenn man einmisst.

### Einmessen

Unter **Daten → Mikrofon einmessen** misst die App die Laufzeit dieses Geräts
einmal und behält sie:

- **Über Lautsprecher** — das Mikrofon hört sechzehn Klicks und misst, wie lange
  jeder unterwegs war. Reine Maschine, zwanzig Sekunden, du tust nichts. Gilt
  auch für Kabelkopfhörer, die hängen am selben Ausgang.
- **Mit Kopfhörern** — für Bluetooth, wo das Mikrofon den Klick nicht hört: du
  schlägst eine gedämpfte Saite auf jeden Klick an. Darin steckt dann auch deine
  eigene Gewohnheit, und die App misst danach gegen sie.

Eingemessen sucht die App den Versatz um die gemessene Laufzeit herum statt um
null, und was übrig bleibt, ist deine echte Lage zum Klick: *„Laufzeit
herausgerechnet: du lagst 12 ms vor dem Klick."* Passt ein Block nicht mehr zur
Einmessung — andere Kopfhörer, anderes Interface —, sagt sie das, statt eine
falsche Zahl zu nennen. Die Einmessung gehört dem Gerät: sie geht weder in den
Abgleich noch in die Sicherungsdatei, denn die Laufzeit des Rechners wäre auf
dem iPhone falsch.

Danach schlägt sie die Einschätzung selbst vor. Du kannst sie überstimmen.

> **Kopfhörer benutzen.** Über Lautsprecher hört das Mikrofon das Metronom mit
> und zählt es als Anschlag.

Es wird nichts aufgenommen und nichts hochgeladen — nur der Zeitpunkt jedes
Anschlags ausgewertet.

## Stimmen

Das Stimmgerät liegt auf *Heute* neben *Ein Lick*, *Sieben Saiten* und *Griffbrett*, und im
Sieben-Saiter-Modus steht *Erst stimmen* mit B Standard vorgewählt. Eine Saite
anschlagen, klingen lassen: die Nadel zeigt Cent, die Lampe daneben *sitzt*,
*zu tief* oder *zu hoch*, und eine Saite gilt als gestimmt, wenn sie eine
Weile im Ton bleibt.

Hier hört die App **Tonhöhe** — mit YIN, das nach der Periode sucht statt nach
dem lautesten Teilton, weil eine verzerrte Gitarre mehr Energie in der Oktave
hat als im Grundton. Gemessen an synthetischen gezupften Saiten von B1 bis E6:
jeder Einzelton auf den Halbton richtig, sauber wie mit High-Gain, und eine
gestimmte offene Saite auf unter zwei Cent genau.

**Im Block bewertet sie trotzdem weiter nur den Rhythmus.** Klingt in einem
Lick der vorige Ton nach, gehen zwei Töne zusammen durch die Verzerrung, und
die gemeinsame Periode liegt tiefer als beide — YIN findet dann eine Oktave
oder eine Duodezime zu tief. Gemessen: sauber 98 % richtig, Crunch 97 %,
High-Gain **70 %**. Eine App, die bei jedem dritten verzerrten Ton „falscher
Ton" sagt, lügt; also sagt sie dazu nichts. Ein Test hält die Grenze fest und
wird rot, sobald sie fällt.

### Saiten

Unter dem Stimmgerät steht, wann die Saiten zuletzt neu waren — ein Knopf,
*Heute neu aufgezogen*, und ab da zählt die App mit. Saiten sterben am Spielen
mehr als an der Zeit: nach **25 Übungstagen** aus dem Log, oder spätestens
nach **90 Tagen**, steht auf *Heute* eine Zeile *Saiten · neue fällig*. Vorher
steht dort nichts. Das Datum gehört dem Gerät wie die Einmessung — die
Gitarre, die neben diesem Rechner steht, nicht die im Proberaum —, und geht
weder in den Abgleich noch in die Sicherungsdatei.

---

## Als App installieren

<p align="center"><img src="public/icons/icon-192.png" width="96" height="96" alt="Das App-Icon: ein Totenkopf aus Pixeln"></p>

**iPhone / iPad** — in **Safari** öffnen (Chrome auf iOS kann das nicht),
Teilen → *Zum Home-Bildschirm*.

**Mac** — Safari 17+: *Ablage → Zum Dock hinzufügen*. In Chrome: Symbol in der
Adressleiste → *Installieren*.

Danach startet sie ohne Browserleiste, hat ein eigenes Icon — ein Totenkopf mit
glühenden Augen, in denselben Pixeln wie Bühnen und Aufnäher — und **läuft
offline** — nach dem ersten Aufruf liegt alles im Cache, eine Session braucht
kein Netz mehr.

Installieren lohnt auch aus einem weniger offensichtlichen Grund: Safari räumt
den Speicher normaler Webseiten nach sieben Tagen ohne Besuch auf. Für
Home-Screen-Apps gilt das nicht — dein Übungs-Log überlebt also nur, wenn du
sie wirklich installierst.

### Drei iOS-Eigenheiten

- **Der Klingelschalter muss an sein.** iOS schaltet Web-Audio stumm, wenn das
  Gerät auf lautlos steht — das Metronom bleibt still, ohne Fehlermeldung. Das
  ist eine iOS-Eigenheit, kein Fehler der App.
- **Die App braucht iOS 16.4 oder neuer.** Die Darstellung baut auf
  CSS-Funktionen, die Safari erst ab dieser Fassung kann; auf älteren Geräten
  zerfällt das Layout. Jedes iPhone ab dem 8 bekommt 16.4.
- **Die installierte App hat einen eigenen Speicher.** Was in Safari liegt —
  Log, Profil, ein eingerichteter Abgleich —, sieht die App auf dem
  Home-Bildschirm nicht, und umgekehrt. Wer vorher im Browser geübt hat,
  nimmt den Stand über *Daten → Sichern* und *Einlesen* mit oder richtet den
  Abgleich in der App einmal neu ein.

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

Ist ein Datenrepo eingerichtet, steht der Abgleich auf **Daten** ganz oben,
und er zählt als Sicherung: die Erinnerung ans Exportieren meldet sich erst
wieder, wenn auch der letzte gelungene Abgleich zwei Wochen her ist.

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
Kopie davon, die beantworteten Wissensfragen, die beiden Antworten vom ersten
Start — und einen eingerichteten Abgleich samt Token. Danach ist die App in
diesem Browser wie frisch installiert; was im Datenrepo liegt, bleibt dort.
**Trennen** löscht nur Konto, Repo und Token aus dem Browser-Speicher.

Dass dabei nichts liegen bleibt, ist eine Prüfung, kein Vorsatz: ein Test
sammelt jeden Speicher-Schlüssel ein, der im Quelltext vorkommt, und verlangt
danach einen leeren Speicher. Anlass war ein echter Fehler — der Token blieb
früher stehen, und der nächste Abgleich holte den gelöschten Log zurück.

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
freigegeben. Beim Stimmen kommt die Tonhöhe dazu — gerechnet im Browser aus den
letzten 85 Millisekunden, die danach überschrieben werden.

Weil auf GitHub Pages keine eigenen Kopfzeilen gehen, steht die
Content-Security-Policy als Meta-Tag in der Seite. Der wichtige Teil ist
`connect-src`: Anfragen dürfen nur an die eigene Adresse und an GitHub gehen.
Käme über irgendeinen Weg fremdes Skript in die Seite, könnte es Token und Log
nirgendwohin schicken.

### Lieferkette

Die Seite wird von GitHub Actions gebaut, und der Bau führt fremden Code aus.
Deshalb hängen alle Actions an einem festen Commit statt an einem
verschiebbaren Tag, und Schreibrecht auf Pages hat allein der Deploy-Schritt,
nicht der Bau. `pnpm audit` muss leer sein; einmal die Woche prüft ein eigener
Lauf das nach, weil neue Meldungen nicht mit Commits kommen, sondern mit der
Zeit. Die einzige Ausnahme steht mit Begründung in `package.json`: ein Fehler
in `braces`, für den es keine geflickte Fassung gibt und der nur den Linter
beim Bauen betrifft — nichts davon erreicht einen Besucher.

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

Das Zeichen und die Bilder dieser Seite kommen aus Pixelrastern, ohne Browser:

```bash
node tools/icons.mjs         # public/icons/ aus assets/logo/totenkopf.txt
node tools/readme-bilder.mjs # Banner, Rangleiter, Kutte
```

Architektur und Konventionen stehen in [CLAUDE.md](./CLAUDE.md), die langen Begründungen in [docs/](./docs/).

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

- **Der iOS-Klingelschalter.** Es gibt einen bekannten Kniff, um Web-Audio
  trotz Stummschaltung klingen zu lassen. Ungetestet, deshalb noch nicht drin.

## Mitmachen

Gebaut von [@cyphomat](https://github.com/cyphomat). Fehler gefunden, ein
Wunsch, eine Idee für eine Übung? Gern als
[Issue](https://github.com/cyphomat/riffforge/issues).

Riffforge steht unter der [MIT-Lizenz](./LICENSE): **forken, anpassen, eigene
Übungen dazuschreiben ist ausdrücklich erwünscht.** Ein Fork erkennt das
Original von selbst und sagt unter *Daten → Fassung* Bescheid, wenn es dort
Neues gibt. Wer Übungen beisteuert, bleibt bei der Regel unter *Inhalte*:
eigene Übungen im Stil, keine abgeschriebenen Tabs.

Ein Übungswerkzeug, kein Unterricht, und ohne Gewähr. Wenn Hand, Handgelenk
oder Unterarm schmerzen: aufhören.

## Danke

Design-Sprache, Ton und die Idee der Ansage kommen von
[Setlist](https://github.com/cyphomat/setlist) — dem Schwesterprojekt fürs
Training. Kein Neon: ein Röhrenamp glimmt, er strahlt nicht.
