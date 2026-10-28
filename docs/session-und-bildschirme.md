# Session, Fortschritt und Bildschirme

- **Gilt für:** Tempo-Fortschreibung, Profil, die Drei-Minuten-Grenze, Serie, *Heute*, Kalender, Rückblick mit Pult, Abschluss-Zettel und Willkommens-Schirm.
- **Lies, wenn** du `lib/session/` (Scheduler, Fortschritt) oder einen dieser Bildschirme anfasst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Ein leeres Raster ist keine Auskunft.** Der Übungskalender zeigte feste
  sechzehn Wochen — einem Wiedereinsteiger also hundertzwölf leere Kästchen
  und darunter „0 von 112 Tagen". `weeksFor` lässt ihn mit dem Log wachsen.
  Dabei die Falle, in die ich prompt gelaufen bin: weniger Wochen heissen
  weniger Spalten, und `1fr` bläst die Zellen auf — das Raster wurde
  *grösser*. Die Zellgrösse ist deshalb gedeckelt (32 px).
  Danach stand er **verloren** da — Daniels Wort: ein Kasten ohne Achsen,
  auf seine eigene Breite geschrumpft, allein am Ende der linken Spalte
  unter dem Rückblick. Man sah, dass etwas war, aber nicht wann. Drei
  Antworten: Wochentage (Mo, Mi, Fr) und Monate an den Achsen
  (`monatsMarken`, über der Woche mit dem Ersten); daneben, was das Raster
  sagt — *Geübt* N von M Tagen und *Zuletzt* (`tageSeitZuletzt`) —, auf
  einem breiten Kasten nebeneinander, auf dem Handy darunter (eine
  Container-Abfrage, keine Bildschirmbreite: dieselbe Komponente sitzt in
  einer Spalte); und sein Platz ist **unter *Bisher***, in der rechten
  Spalte, weil er dieselbe Auskunft über die Zeit ist wie die drei Zahlen.
- **Der Willkommens-Schirm kommt einmal und beantwortet drei Fragen.** Wo
  bleiben meine Daten, brauche ich ein Konto, wie komme ich wieder raus. Die
  dritte ist die, an der solche Apps scheitern: wer nicht weiss, dass sein
  Stand nur in diesem Browser liegt, verliert ihn beim ersten Aufräumen. Das
  gehört nicht ins Kleingedruckte. Er erscheint nur bei leerem Log — nach
  einem Import wäre er nur eine Hürde.
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
  Anteils der Fläche.
  Darüber steht **das Pult**, aus Roadies Soundcheck (`pultKanaele`): je
  Drill ein Kanalzug, der Fader auf dem letzten sauberen Tempo, die Kerbe
  auf dem ersten im Fenster. Die Bahn läuft vom Starttempo *dieses*
  Spielers bis zum Ziel — dieselbe Strecke wie `masteryOf`, damit ein
  Fader auf halber Höhe dasselbe heisst wie ein halber Balken unter *Wo du
  stehst*. Kein Kanal ohne sauberes Tempo: ein Fader am Fuss behauptete
  sonst das Starttempo. Roadie legt Streifen unter sein Pult, hier nicht —
  ein Kanalzug ist selbst aus Strichen. Die Spalten richten sich nach der
  Breite (mindestens 78 px), weil „Downpicking" bei festen vier Spalten auf
  320 px mitten im Wort brach. Der Eingang steht auf *Heute* unter dem Rang, in der
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
- **Unter der Ansage kann ein Anlass-Streifen stehen.** `AnlassBanner` liest
  Datum und Gerätespeicher erst nach dem ersten Anstrich (der statische Export
  kennt beim Bauen keins von beiden) und zeigt höchstens einen Anlass
  (`fuer`: Gedenktag vor Einzeltag vor Phase). `?anlass=weihnachten` zeigt ihn zur
  Probe und speichert nichts. Grenzen und Begründung: `docs/design-und-themes.md`.
- **Die Ansage behauptet nichts.** Jede Zeile in `briefing.ts` muss aus dem Log
  ableitbar sein, sonst gehört sie da nicht hin.
- **Tempo ist ein Anteil des Ziels.** `nextBpm` bewegt sich um Prozent von
  `targetBpm`, nicht um eine feste Zahl BPM — fünf Schritte heissen bei Ziel
  190 etwas anderes als bei Ziel 100, und der Drill mit der längsten Strecke
  kroch am langsamsten. Ebenso misst `masteryOf` ab dem Starttempo *dieses
  Spielers*: `startBpmFor` skaliert es mit dem Profil, und wer ab dem
  Katalogwert misst, schenkt einem Wiedereinsteiger ein Viertel Beherrschung.
  Das verzerrt nicht nur die Anzeige — `priorityOf` wählt darüber aus.
- **Das Profil ist ein Startwert, kein Filter.** Die zwei Fragen beim ersten
  Start skalieren die Starttempi und gewichten die Auswahl leicht — sie
  schliessen nie einen Drill aus. Sobald ein Log da ist, schreibt sich das
  Tempo daraus fort und das Profil zählt für diesen Drill nicht mehr. Es darf
  deshalb auch fehlen: jede Funktion nimmt `Profile | null`.
- **Drei Minuten am Stück, dann etwas anderes.** Ein Drill ohne
  Vorgeschichte bekam früher seinen ganzen Technik-Anteil in einem Block —
  Erlernen und Behalten verlangen Verschiedenes, so die Begründung. In der
  Viertelstunde waren das sechs Minuten, in 25 Minuten elf, und Daniel nach
  sechs Minuten Palm-Mute-Chug: „irgendwann wird man kirre." Wer kirre wird,
  übt nicht mehr, er sitzt die Zeit ab. `MAX_AM_STUECK` (180 s) deckelt jetzt
  jede Runde, neue Drills werden genauso geteilt wie bekannte, mit dem Riff
  dazwischen; der Test geht 10 bis 30 Minuten mit leerem und vollem Log
  durch und verlangt ausserdem, dass kein Drill zweimal direkt
  hintereinander steht. *+5 Minuten* sind deshalb zwei verschiedene Drills
  zu je zweieinhalb. Ein **Tempowechsel mitten im Block** war der andere
  Vorschlag und ist bewusst nicht gebaut: ein Eintrag trägt genau ein Tempo,
  und daran hängen Tempokurve, Bestwert, Rückblick und die
  Zieltempo-Aufnäher — ein Block mit zwei Tempi wäre dort nicht mehr
  deutbar. Abwechslung kommt aus dem Wechsel des Drills, nicht aus dem
  Wechsel im Drill. Ausgenommen ist der einzeln gewählte Drill
  (`buildDrillSession`, zehn Minuten): wer ihn antippt, will genau den.
- **Ein Drill über mehrere Runden ist ein Eintrag**, nicht drei. Der
  Session-Runner sammelt die Spielzeit und schreibt nach der letzten Runde.
