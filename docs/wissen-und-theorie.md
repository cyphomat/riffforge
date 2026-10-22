# Wissen und Theorie

- **Gilt für:** Wissenskarten, FSRS, Griffbrett und Griffbrett-Trainer, CAGED, Hörfragen und Dreiklänge.
- **Lies, wenn** du `lib/theory/` (außer Lick und Sieben-Saiter), Karten oder Wissensfragen anfasst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

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
