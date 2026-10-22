# Lead-Licks und Sieben-Saiter-Modus

- **Gilt für:** Die Lick-Grammatik, ihre Tabulatur, `/lick` und der Sieben-Saiter-Modus.
- **Lies, wenn** du `lib/theory/lick.ts`, `lib/session/lead.ts`, `lib/theory/sieben.ts` oder `lib/session/sieben*` anfasst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

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
