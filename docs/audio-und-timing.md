# Audio, Timing und Stimmgerät

- **Gilt für:** Timing-Messung (Versatz, Streuung, Einmessen), gespielte Figuren, Tonhöhenerkennung, Stimmgerät, Saitenwechsel und die offenen Audio-Punkte.
- **Lies, wenn** du in `lib/audio/` arbeitest oder das Mikrofon etwas messen lassen willst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

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
