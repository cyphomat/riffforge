# Songs und Notenschrift

Kurze Songs, die Noten, Abstände und Längen üben — mit Notenschrift, Tabulatur
und Wiedergabe aus denselben Daten. Dazu die Entscheidungen, die man den
Dateien nicht ansieht.

## Die Daten sind die Wahrheit

Ein Song (`lib/theory/song.ts`) ist eine Liste von Noten: Griff, Start in
Achteln, Dauer in Achteln. Tabulatur (`song-tab.ts`), Notenschrift
(`notensatz.ts`) und Wiedergabe (`lib/audio/song-ablauf.ts`) fallen alle daraus.
Pausen stehen nicht in den Daten — eine Pause ist, was keine Note belegt.

Das **Lernziel** (Töne, Abstände, Notenwerte) steht daneben als Aussage und
wird von `pruefeSong` gegen die Noten nachgerechnet, und zwar *genau*: ein Song,
der drei Töne verspricht und zwei spielt, fällt durch. Abstände sind die Menge
der vorkommenden Halbton-Abstände, nicht der größte — „Quarte und Quinte" als
Ziel verlangt, dass beide vorkommen.

Die Songs schreibt die AI in einer Sitzung, `songs.test.ts` prüft sie. Ein
Skript, das nicht prüft, wäre ein Wunsch; deshalb liegt die Prüfung in den
Tests und läuft mit `pnpm check`.

## Die Raster-Regel

Eine Note beginnt nur auf einem Vielfachen ihrer eigenen Länge (in Achteln): eine
Viertel auf einem Schlag, eine Halbe auf Eins oder Drei, eine Ganze am
Taktanfang. Damit überquert keine Note eine Taktgrenze, es gibt keine
Synkopen, und der Notensatz kommt ohne Haltebögen aus. Eine Pause füllt die
Lücke mit dem größten Wert, der auf seinem Raster beginnt — so schreibt es jede
Notenschrift.

## Notenschrift

- **Transponiert:** Die Gitarre klingt eine Oktave tiefer, als sie geschrieben
  wird. Die offene hohe e-Saite (E4) steht als E5 im vierten Zwischenraum. Ohne
  das lernte jeder Gitarrist falsche Notennamen.
- **Proportional gesetzt:** ein Achtel nimmt einen Platz, eine Viertel zwei, eine
  Halbe vier. Gedruckte Noten setzt man anders, aber hier ist die Länge der
  Lernstoff, und man soll sie sehen.
- **Rechnung und Zeichnung getrennt:** `notensatz.ts` liefert nur Koordinaten und
  ist getestet, `noten-view.tsx` malt sie. Ob ein D auf der vierten Linie sitzt,
  prüft ein Test, kein Browser.
- **Zeilen nach Platz, nicht nach Bildschirm:** ein Takt je Zeile, solange die
  Notenschrift unter 28 rem breit ist, sonst zwei (Container-Query). Zwei Takte
  auf 320 px machen die Linienabstände zu klein (gut sechs Pixel).
- **Unter jedem System steht seine Tabulatur** (`NotenMitTab`). Zuerst alle
  Noten und dann alle Tabs hiess auf dem Handy zwei Bildschirme scrollen, um
  Zeile 1 mit Zeile 1 zu vergleichen. `songTabSysteme(song, proZeile)` nimmt die
  Zeilenbreite der Notenschrift (ein oder zwei Takte) statt der eigenen, damit
  beide dieselben Takte tragen. Dazu klebt beim Lesen eine schmale Zeile mit Zeit
  und Tempo unter der Navigation, sobald die Zeitanzeige oben herausgescrollt ist.
- **Der Schlüssel ist von Hand gezeichnet**, mit einer Linie. Er ist keine
  Schriftart.
- **Gleichstand der Hälse:** zwei verbundene Achtel gleich weit von der
  Mittellinie haben die Hälse nach unten. Das ist die gängige Regel.

Noch nicht gesetzt: Vorzeichen jenseits des einfachen Kreuzes, Sechzehntel,
Punktierte, Haltebögen, mehrere Stimmen. Wenn das gebraucht wird, lohnt der
Blick auf alphaTab — es spricht dagegen: ein zweiter Synth und eine zweite Uhr
(`Ein AudioContext für alles`), Dateien, die zur Laufzeit geladen werden, und
eine Abhängigkeit mehr in einem Projekt mit fünf.

## Wiedergabe

`SongPlayer` plant einen Durchgang erst, wenn er gleich beginnt. Ein neues
Tempo gilt deshalb ab dem nächsten Durchgang und ohne Sprung, und die Schleife
schließt nahtlos an. Alles läuft über einen Master-Knoten; Anhalten trennt ihn,
und damit ist auch das schon Geplante stumm.

Jede Note wird dort abgedämpft, wo ihr Wert endet — sonst klänge eine Viertel
wie eine Halbe, weil die Saite ohnehin ausschwingt.

**Der Nachklang ist länger als bei den Hörfragen**, und das ist gemessen: mit
dem Ton der Hörfragen (1,4 s) ist eine Halbe bei 60 BPM vor ihrem Ende still,
und man hört nur, *wann* Noten beginnen, nicht, wie lang sie sind. `gezupft`
nimmt dafür den Parameter `nachklang`; die Songs rechnen mit 5 s und Faktor 2,2.
Hörfragen und Stimmgerät behalten den Standardwert, weil dort die Tonhöhe auf
den Cent stimmen muss (die Tonhöhe verschiebt sich mit dem Nachklang nicht).

## Im Block

Ein Song ist ein Drill (`lib/session/drills-songs.ts`): Riff, Technik
`pentatonic`, damit Tempokurve, Beherrschung und Auswahl durch den Scheduler
gelten wie überall. Tabulatur und Notenschrift fallen aus denselben Noten.

- **Kein Mikrofon-Timing bei Songs.** Das Messen gegen die Klicks erwartet einen
  Anschlag je Klick; Pausen und lange Noten ließen ein richtiges Spiel
  schlecht aussehen.
- **Anhören nur in der Pause und vor dem Los.** Der Block hat sein eigenes
  Metronom; zwei Takte gegeneinander helfen niemandem. Das Tempo des Anhörens
  ist das des Metronoms.
- **Den `AudioEngine` bringt der Aufrufer mit**, damit es nur einen
  `AudioContext` gibt.

## Den Klang prüfen, ohne Browser

`AudioContext` gibt es nur im Browser, ein Test kann nichts hören. Was geht: den
echten `SongPlayer` gegen einen Offline-Kontext laufen lassen (Paket
`web-audio-engine`, nur zum Prüfen, nicht im Projekt), mit `schleife: false`,
denn dann wird alles beim `start` geplant. Das Ergebnis lässt sich als WAV
schreiben, zum Anhören, und mit derselben YIN wie das Stimmgerät nachmessen:
Tonhöhe jeder Note, Pegel von Klick und Melodie, Stille nach dem Notenende.
So ist der Nachklang aufgefallen.

## Offen

- Die klingende Note in der Notenschrift hervorheben, während der Song läuft.
- Wissenskarten zu Notenwerten, Notennamen und Abständen, die die Notenschrift
  wiederverwenden.
- Weitere Songs: Lernziele in der Reihenfolge Töne, Längen, Abstände, dann Lagen.
