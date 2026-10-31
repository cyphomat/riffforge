# Wissen und Theorie

- **Gilt für:** Wissenskarten, FSRS, Griffbrett und Griffbrett-Trainer, CAGED, Hörfragen und Dreiklänge.
- **Lies, wenn** du `lib/theory/` (außer Lick und Sieben-Saiter), Karten oder Wissensfragen anfasst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Karten mit Notenbild rechnen die Antwort aus dem Bild.** `Frage.notenbild` ist
  ein echter `Song` (`notenbild()` in `lib/theory/noten-karten.ts` baut ihn aus
  Kurzschrift, das Lernziel fällt aus den Noten) und geht durch `pruefeSong`.
  Tonname, Abstand, Schlagzahl und Pausenwert kommen aus `noteAt`, den
  MIDI-Nummern, der Dauer und `pausenOf`; `noten-karten.test.ts` rechnet sie auf
  anderem Weg nach. Die Antwort steht bei den vier Möglichkeiten an wechselnder
  Stelle. Der Begriff ist nummeriert und verrät nichts: in der Übersicht steht er
  vor der Frage.

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
  Die **leere Saite** gehört dazu: links vom Sattel, wo ihr Name steht, ist
  sie antippbar. Vorher war „E auf der E-Saite" im Trainer nur im 12. Bund
  zu beantworten, und Daniel griff — wie jeder an der Gitarre — zuerst leer.
  Die Karten des Trainers bleiben bei Bund 1–12 (eine leere Saite sucht
  man nicht), aber `halsLoesungen` nimmt jede Stelle der gefragten Saite mit
  dem Ton, und die Auflösung zeigt beide.
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
  Wertung. Ein Treffer bleibt 2,4 s stehen, mit Stelle, Zeit, Wertung und
  einem ablaufenden Balken, und lässt sich wegtippen. Zuerst waren es
  450 ms — ein Aufblitzen, das verschwunden war, bevor der Blick vom Hals
  hochkam —, dann 1,6 s, im Gebrauch immer noch zu knapp. Die Pause kostet
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
- **Gerade Achtel sind nicht abfragbar**, aus demselben Grund wie
  Sechzehntel: eine Synkope trifft drei der vier Anschläge und hat keinen zu
  viel. Die Figur steht in `rhythm.ts`, eine Karte dazu hat der Katalogtest
  beim ersten Lauf abgewiesen.
- **Die Sicherheit wird vor dem Auflösen gefragt, und FSRS erfährt nichts davon.**
  Die drei Knöpfe *Geraten / Ziemlich sicher / Sicher* ersetzen das einzelne
  *Auflösen*: derselbe Tap, nur mit einer Antwort. Nach dem Auflösen gefragt
  wüsste jeder, dass er es gewusst hat; das "Wie lief's?" danach misst die
  Mühe, nicht die Selbsteinschätzung. Die Stufe steht als optionales `sure` in
  der Antwort (1 bis 3, fehlt bei älteren Antworten, im Griffbrett-Trainer und
  bei gespielten Fragen — "keine Angabe" ist etwas anderes als "geraten").
  *Scheinwissen* ist eine Karte, deren letzte Antwort "sicher und falsch" war
  (`istScheinwissen`, nach Zeit gezählt, nicht nach Listenreihenfolge). Sie gilt
  in `dueCards` als sofort fällig und steht vor allem anderen, auch wenn FSRS
  sie auf später gelegt hat — und kommt deshalb noch in der zweiten Portion
  derselben Session wieder. Die FSRS-Rechnung bleibt unberührt, ihr Port hängt
  an den Prüfwerten der Referenz; die Sonderregel sitzt davor, nicht darin. Die
  Kalibrierung (`kalibrierung`, unter *Wissen* als "Einschätzung") zeigt je
  Stufe die Trefferquote, erst ab fünf Antworten (`KALIBRIERUNG_AB`) — darunter
  wäre eine Prozentzahl Zufall. Der Griffbrett-Trainer bleibt wie überall
  ausserhalb. Bekannte Grenze: ein Gerät mit älterer Version verwirft das
  Feld `sure`, wenn es den Log neu schreibt (das Zod-Objekt kennt es nicht);
  der Lernstand bleibt dabei erhalten, nur Einschätzung und Scheinwissen dieser
  Antworten gehen verloren.
- **Szenario-Karten sind ein eigener Katalog, und nur die Transfer-Runde fragt sie.**
  `lib/theory/szenarien.ts` hält zwölf Karten (zwei je Stufe) in der Form
  "Du greifst ein Barré, der Song kippt nach Moll — was änderst du?": Wissen
  anwenden statt wiedererkennen. Sie liegen bewusst nicht in `THEORY_CARDS`,
  damit "Begonnen von 199", die Stufenlisten, die Session-Portionen und
  `cards.test.ts` unberührt bleiben. Ihre Antworten laufen durch denselben Log
  und denselben FSRS-Stand wie alle anderen, Sicherheit und Scheinwissen
  gelten mit. Bekannt: die Merch-Rechnung zählt Kennungen aus dem Log, nicht
  aus `THEORY_CARDS`, Szenario-Antworten zählen dort also als Karten, die
  "sitzen". `transferRunde` (`lib/theory/transfer.ts`, rein) nimmt je Stufe
  höchstens eine Karte (Scheinwissen zuerst, dann das Schwächste, dann Neues,
  wie `dueCards`) und mischt, damit die Stufe nicht an der Reihenfolge
  abzulesen ist; erst ab `TRANSFER_AB` begonnenen Wissenskarten der Stufe,
  weil Anwenden Gelerntes voraussetzt. Die richtige Antwort liegt an
  wechselnder Stelle (Test), Töne stehen englisch, und der Hals hat zwölf
  Bünde. `szenarien.test.ts` rechnet nach, was die Karten behaupten, wie bei
  den anderen Texten. Vorbild sind Roadies `rf-t01` bis `rf-t12`; dort stand
  die Antwort überall an erster Stelle und `rf-t07` fragte nach dem 15. Bund.
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
- **Das Effektlexikon ist Nachschlagen, keine Abfrage.** `lib/theory/effekte.ts`
  hält 24 Einträge (Pedale, Amp, Loop, Box), `/wissen/effekte` zeigt sie; keine
  Karten, kein Log, kein FSRS. Das ist ein Gegenstück zu „Theorie gehört an den
  Drill": ein Lexikon erklärt nichts, was die Hände gerade tun, sondern beantwortet
  „was kommt wohin", und das fragt man beim Aufbauen des Boards, nicht beim Üben.
  Der Eintrag trägt seinen **Platz** (`ort`, `platz` in Zehnerschritten, damit
  ein neuer dazwischen passt), und `effekte.test.ts` hält die Regeln fest, die
  jeder unterschreibt (Wah vor den Verzerrern, Gate vor Delay und Hall, Delay vor
  Hall, Verzerrer vor dem Amp, Modulation dahinter). Was sich streiten lässt, steht
  als `ausnahme` am Eintrag und nicht in der Reihenfolge: Phaser und Flanger
  gehören im Original vor den Amp, ein Fuzz Face vor das Wah. Die Einträge sind
  eigener Text, am 31.10.2026 per Websuche gegengelesen. Die Quellen sind
  überwiegend Foren, Händlerseiten und Gitarren-Blogs, keine Herstellerdokumente;
  die Reihenfolgen sind Konvention, die Einstellungen Ausgangspunkte. Dabei
  korrigiert: Hendrix stellte das Wah *vor* das Fuzz Face, der Federhall eines
  Fender-Amps sitzt zwischen Vor- und Endstufe, und nicht jeder Octaver ist
  einstimmig. Geräte stehen nur als Beispiele. Das Delay-Beispiel (500 ms je Viertel bei 120 BPM)
  rechnet ein Test nach. Als Nächstes möglich: ein Delay-Rechner, der die Zeit
  aus dem Tempo des Blocks nimmt.
