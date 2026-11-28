# Marke, Pixelkunst und Merch

- **Gilt für:** Das Plektrum-Zeichen, Wortmarke und Wortfuge, die Regeln für Pixelkunst, der Merch-Stand mit Rang, Aufnähern und Tourshirts.
- **Lies, wenn** du Logo, Icons, Bilder oder etwas unter `/merch` änderst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Das Zeichen ist ein Totenkopf (vorher ein Plektrum), und es wird bei 48 px
  entschieden.** Das
  alte Icon war ein Amboss mit einem Vierstrahl-Stern: „Forge" war drin,
  „Riff" nicht, der Funke las sich als KI-Glyph, und die liegende Silhouette
  wurde auf dem Homescreen ein Klumpen. Beim Neubau sind neun Entwürfe
  gescheitert — Kopfplatte, Griffbrett, zwei Plektren, Plektrum im Case —
  und zwar **alle an derselben Spalte**: bei 48 px überlebt nur eine fette,
  geschlossene Silhouette. Feine Linien zerfallen, dünne Formen werden
  Striche, mehrfarbige Bänder werden Candy Corn. Wer das Zeichen anfasst,
  prüft es zuerst klein. Die Quelle ist `assets/logo/totenkopf.txt`, und
  `tools/icons.mjs` erzeugt daraus alle Grössen — samt einer **maskierbaren**
  Fassung, weil Android bis zu 20 % vom Rand wegschneidet und ein
  flächenfüllendes Zeichen dort seine Spitze verliert.
  **Seit Oktober ist es Pixelkunst**, 20 × 20 auf einem 32er-Raster. Die App
  war inzwischen aus Pixeln gebaut — Bühnen, Aufnäher, Shirts, Wappen —, und
  das glatte Vektorzeichen stand daneben wie aus einer anderen App. Die
  48-px-Regel hat dabei die Form entschieden: drei Konturen nebeneinander
  geprüft, und die erste, eine Übersetzung des alten Pfads, las sich mit
  runden Schultern als **Tropfen**, die breiteste als **Edelstein**. Ein
  Plektrum braucht breite, flache Schultern und eine klare Spitze. Keine
  Binnenzeichnung, nur Licht oben links und Schatten unten rechts — die
  Stufen der Kante tragen den Pixel-Charakter. Vergrössert wird nur
  ganzzahlig (180 bekommt 5× und Grund drumherum), und die Werkzeuge
  brauchen keinen Browser mehr: `tools/pixel.mjs` schreibt PNG mit
  `node:zlib`. In der Navigation steht das Zeichen vor der Wortmarke, als
  SVG aus Rechtecken (`public/icons/totenkopf.svg`) — und unter 385 px, wo
  die Wortmarke weichen muss, steht es allein und bleibt der Weg nach Hause.
  Der README-Banner ist dieselbe Sprache: Pixelschrift statt Anton, weil
  ein SVG im README keine Schrift mitbringen kann, mit dem Haar Luft an der
  Fuge als genau einem Pixel. GitHub kennt kein `pixelated`, deshalb sind
  Rangszenen und Aufnäher dort vorher ganzzahlig vergrössert und werden in
  genau dieser Grösse gezeigt.
  **Seit Ende Oktober ist es ein Totenkopf.** Das Plektrum las sich in
  Bernstein als **Herz**: flache Schultern, eine Spitze, ein Licht oben links —
  die 48-px-Regel hatte „Tropfen" und „Edelstein" abgewehrt, aber nicht das.
  Ein Totenkopf ist die Silhouette, die niemand mit etwas Weichem verwechselt,
  und er ist Metal, ohne es zu erklären. 20 × 20, spiegelgleich, die Augenhöhlen
  sind **gemalte** Pixel (`k`) statt eines Ausschnitts, damit der Umriss eine
  geschlossene Fläche bleibt (`zeichen.test.ts` prüft das weiter), und die Glut
  in den Höhlen (`e`, #ff5a1f) ist die Schmiede. `tools/icons.mjs` schreibt
  daraus auch `app/icon.svg` — das stand bis dahin als Amboss da und lief den
  PNG-Icons unbemerkt davon. In der Navigation steht er in doppelter Grösse
  (40 px).
- **Die Wortfuge bekommt ein Haar Luft.** „Riff" + „forge" ergibt drei
  gleiche Buchstaben hintereinander — dasselbe Problem wie bei
  „Schifffahrt", und in versaler Anzeigeschrift liest man das als
  Tippfehler. `.marke .fuge` gibt der Naht 0,05 em. (Die Navigation setzt den Namen seit
  Oktober in Blackletter, `.metal`, gemischt statt versal; die Fuge ist dort
  keine Frage mehr, und `.marke` bleibt auf Shirt und Banner.) Zwei naheliegende
  Lösungen sind ausgeschieden: ein Farbwechsel, weil **Rost in dieser App
  „nicht ganz" heisst** und ein zweifarbiger Name ein gebrochenes Versprechen
  wäre; und ein Trennzeichen, weil „Riff · Forge" sich wie zwei Produkte
  liest. Mehr als ein Haar sind übrigens auch falsch: bei 0,09 em zerfiel der
  Name in zwei Wörter.
- **Die Wortmarke hat eine eigene Schrift, sonst nichts.** Anton,
  ausschliesslich auf `.marke`. Die einzige weitere ist der Edding
  (Permanent Marker, `--font-edding`) auf den Titeln des Setlist-Zettels und
  den Gaffa-Etiketten im Merch-Stand — Handschrift gehört auf Papier und
  nirgends sonst hin. Überschriften, Zahlen und Tempo bleiben
  Oswald, damit die App nicht überall schreit. `next/font` legt beide als
  `--font-anton` und `--font-oswald` ab, das Theme baut daraus
  `--font-marke` und `--font-display` — die Namen müssen verschieden sein,
  sonst verweist der Theme-Wert unter Tailwind 4 auf sich selbst.
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
- **Das Rack hängt am Rang, nicht an Gold.** In der Orga-App (Roadie) kauft man
  Gitarren mit Gold; hier gibt es keine Währung, weil gespielt wird um
  Regelmässigkeit. Zu jedem Rang gehört eine Gitarre (`RAENGE[i].gitarre`),
  sie hängt im Rack, sobald der Rang erreicht ist, die nächste als Umriss. Es
  wird nichts gespeichert: das Rack folgt aus `rang(log)`. Die sieben
  Gitarren (24 × 56, unten bündig, `public/merch/gitarre-*.png`) schreibt
  `tools/gitarren.mjs` aus den Formen der Orga-App — wer eine Form ändert,
  lässt das Werkzeug laufen, ein Bild von Hand zu ändern geht nicht. Auf dem
  Handy stehen bis zu sieben nebeneinander und sind dafür kleiner als 3×.
- **Anlässe haben Motive und Aufnäher, beide aus einer Quelle.**
  `tools/anlaesse.mjs` zeichnet die Banner-Motive (15 × 15, `public/bilder/anlass-*.png`)
  und daraus die Aufnäher (24 × 24, `public/merch/aufnaeher-anlass-*.png`; Rand und
  Stickerei vom Debüt-Aufnäher, das Motiv in der Mitte getauscht). Der Aufnäher ist
  verdient, wenn an einem Tag des Anlasses geübt wurde — gerechnet aus dem Log wie
  alle anderen, unabhängig vom Schalter für den Banner — und steht erst dann an
  der Kutte, **nie als Umriss**: Weihnachten und zwei Gedenktage als leere Kreise
  wären Schmuck und eine Lücke, die sich nur selten füllen lässt. Ein Gedenktag
  belohnt nichts ausser dem Dasein: kein Zähler, keine Stufen.
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
  `minmax(0,1fr)`-Spalten. Nicht übernommen aus der Orga-App: Ansager,
  Konsole und die Endgegner — HUD (das Pixelfeuer ist seit Pixel-Metal doch da,
  auf *Heute*, siehe `design-und-themes.md`), und die vier
  Bauteile mit Grenze sind hier schon vergeben.
  Die **Tourshirts** sind keine Dateien, sondern gerechnet
  (`lib/session/shirt.ts`): Stofffarbe aus dem Adjektiv des Tournamens,
  12 × 12 Emblem aus dem Nomen — zwölf mal zwölf Kombinationen wären 144
  Bilder. Gezeichnet als SVG aus Rechtecken, deshalb gilt die Ganzzahl-Regel
  dort nicht. **Seit Oktober hängen sie gross und lassen sich wenden**, aus
  Setlist übernommen (`TourShirtKarte`): der Schnitt ist Setlists 64 × 60
  (`grossesShirt`) mit Rippkragen, Nähten und Falten, vorne tiefer, hinten
  flacher Ausschnitt. Zwei Abweichungen vom Original: der Umriss wird auf
  der linken Hälfte abgetastet und gespiegelt, weil Setlists Punkte rechts
  einen halben Pixel neben der Mitte liegen; und das Licht fällt in
  **diagonalen Bändern** statt in zwei Rechtecken — auf dunklem Stoff las
  sich das helle Rechteck wie ein aufgenähter Flicken. Der Druck liegt als
  Text über dem Stoff und wächst mit (`cqw`): Wortmarke in Anton, weil sie
  die Wortmarke *ist*, Tourname in Oswald — Setlist setzt ihn in Edding, hier
  bleibt Handschrift beim Papier. `shirt.test.ts` rechnet die Drucktinte
  gegen die hellste Stelle unter dem Druck auf jedem der zwölf Stoffe nach
  (AA). Gewendet wird in 3D, ohne Drehung bei reduzierter Bewegung; hinten
  stehen höchstens 33 Daten, alle mit Art des Tages (*Session*, *Lick*,
  *Sieben Saiten*) in der aufklappbaren Liste darunter (`termine`).
  Ebenfalls aus Setlist: die **Überschriften** (`.tape`) im Merch-Stand —
  seit November 2026 Jersey in 30 px mit Linie dahinter; die Gaffa-Streifen
  mit Edding waren das lauteste Element der Seite und die schwerste Schrift
  der App, der Edding bleibt auf dem Zettel —, die **Bildleiste der Ränge** statt der Segmente
  (erreichte Bühnen sind Knöpfe und holen ihre Szene mit dem Tag des
  Aufstiegs, `rangTage`, gross nach oben; was noch kommt, bleibt dunkel und
  stumm), und die Kutte als **eine Fläche** (`.card`). Die Anordnung folgt Setlist
  und der Handy-Regel: links Rang und Kutte, rechts die Shirts, weil
  mehrere bildschirmhohe Shirts die Kutte sonst unter sich begraben.
  Nicht übernommen: die Monats-Tour mit Endgegner (wie bei Roadie) und die
  Gold- und Platin-Wand, die am gehobenen Gewicht hängt.
  `shirt.test.ts` geht fünfzig Jahre Tournamen durch und verlangt, dass jeder
  ohne Ausweichen auf Farbe und Motiv fällt — wer `ADJEKTIVE` oder `NOMEN` in
  `merch.ts` erweitert, zeichnet das Motiv mit. Die Farben dort sind Stoff,
  nicht App-Palette, und stehen deshalb als Hex-Werte im Bild.
  **Festival-Shirts** sind derselbe Bau mit einem zweiten Schnitt: Langarm
  mit Lücke unter dem Arm und Ärmeldruck, eins je Rang ab dem Proberaum
  (`festivalShirts`, `FESTIVAL` in `shirt.ts`). Sie sind die Antwort auf
  „ein Shirt im Quartal ist zu wenig", ohne die Tour zu verdünnen: ein
  Monats-Shirt wäre die Monats-Tour aus Roadie, die bewusst nicht
  übernommen ist. Datiert wird wie der Rang — der erste Übungstag der
  n-ten Woche.
  Die **Technik-Wappen** (Reihe *Techniken*, eins je Technik ausser dem
  Warm-up) sind ebenfalls gerechnet: `technikAufnaeher` stickt das
  Technik-Zeichen auf ein 24 × 24 Wappen, mit Rand, Goldnaht und eigenem
  Tuch je Technik. Ein Test verlangt, dass Rand und Naht nichts vom Zeichen
  abschneiden. Verdient an **fünf verschiedenen Tagen** sauber — Tage, damit
  es Regelmässigkeit misst und nicht einen langen Abend, und *sauber* statt
  Zieltempo, weil das Zieltempo seine eigene Leiter hat und Monate weit weg
  liegen kann. Alle elf sind eine Leiter, deshalb steht nur einer als
  Umriss da: der, dem man am nächsten ist, mit „Noch N Tage". *Tight* und
  *Auf den Punkt* haben Stufen bekommen (10/25/50 Tage, 10/50/150 Blöcke);
  die erste Stufe behält ihre alte Nummer.
  Steigt der Rang, zeigt `RangAufstieg` die neue Bühne und das Festival-Shirt — im Abschluss
  (`SessionSummary`, also Session und Sieben-Saiter-Modus) und nach einem
  Lick in `/lick`, beides als Vorher-nachher-Rechnung über den Log.
  Die **Technik-Zeichen** in der Drill-Liste (`lib/session/technik-zeichen.ts`,
  16 × 16) sind die eine Pixelkunst mit App-Farben statt eigener: Strich in
  `currentColor`, Akzent in `--stahl` — sie stehen in einer Bedienzeile und
  folgen ihr, statt ein Bild mitzubringen. Der Willkommens-Schirm hat eine
  eigene Szene (`public/bilder/willkommen.png`, Übungsecke am Abend, auf dem
  Notenständer eine 15), dazugezeichnet in der Palette der Rangszenen.

## Gurt, Drops und der Roadie

- **Der Gurt rechnet aus dem Log und speichert nichts** (`lib/session/gurt.ts`,
  `drops.ts`). Wie bei der Kutte: ein verdientes Plektrum kann nicht
  verschwinden, es wandert mit dem Abgleich, und ein zweites Gerät hat danach
  denselben Gurt. Gewürfelt wird nicht — Farbe und Form eines Riff-Plektrums
  fallen aus einem Hash der Drill-ID (`hash`, FNV-1a), also auf jedem Gerät
  gleich. Ein Riff gilt als geübt, wenn es an `GEUEBT_TAGE` (3) verschiedenen
  Tagen mindestens `GEUEBT_AB` (3, „Sauber") bekam; wer das Zieltempo sauber
  gespielt hat, bekommt ein Plektrum aus Metall.
- **Drops sind Daten, kein Dienst.** Riffforge ist ein statischer Export; es gibt
  keine Datenbank, aus der ein Katalog nachlädt. Ein Monat ist ein Eintrag in
  `lib/session/drops-daten.ts` samt Bühne in `tools/drops.mjs` — also ein
  Commit, und der Merge deployt. `drops.test.ts` lässt nur durch, was
  `dropSchema` erfüllt: Selten und episch brauchen einen belegten Fakt mit
  https-Quelle, die IDs sind eindeutig, das Datum liegt im Monat. Vor dem
  Eintragen jeden Fakt nachlesen; was sich nicht belegen lässt, kommt nicht rein.
- **Freigeschaltet wird nach Übungstagen im Monat des Drops** (`FREISCHALTUNG`:
  gewöhnlich 4, selten 12, episch 20). Ein vergangener Monat bleibt, wie der Log
  ihn hinterlassen hat; er lässt sich nicht nachholen, weil nur Tage in diesem
  Monat zählen. Die Zahlen sind eine Vermutung und dürfen sich ändern, solange
  der Test mitzieht.
- **Stille Eigenschaften, nirgends beworben, alle aus dem Log:**
  *Patina* (Spieltage eines Riffs ab 10 und 25 machen das Plektrum
  abgegriffener), *Staub* (ein verdientes Riff, das länger als `STAUB_TAGE`
  (30) nicht gespielt wurde, wird matt; einmal wieder gespielt, glänzt es) und
  die *Zugabe* (ein Extra-Plektrum je Drop, das erst erscheint, wenn alle
  anderen verdient sind, und vorher in „n von m" nicht mitzählt). Sie stehen im
  Test, nicht im README.
- **Der Roadie sagt einen Satz, nie in der Session** (`lib/session/roadie.ts`,
  `components/session/roadie-heute.tsx`): auf *Heute* unter dem Banner und auf
  dem Abschluss-Zettel, ohne Animation. Welcher Satz, entscheidet der Tag
  (`hash`), nicht der Zufall — dieselbe Regel wie beim Plan: zurückgerechnet,
  nicht gewürfelt. Er ist 16 × 16, dreifach gezeichnet (`public/bilder/roadie.png`,
  `tools/drops.mjs`).
- **Die Karte des neuen Drops auf *Heute*** bleibt, bis „Gesehen" oder „Zum
  Gurt" gedrückt wurde; gemerkt wird nur die Drop-ID, pro Gerät
  (`dropGesehen` in `lib/storage/lokal.ts`).


## Wochengegner und Combo

- **Der Gegner der Woche rechnet aus dem Log und speichert nichts** (`lib/session/wochengegner.ts`).
  20 Lebenspunkte, Woche Montag bis Sonntag nach Gerätezeit wie die Serie. Treffer aus vier
  Quellen, jede bis zu ihrem Deckel (`DECKEL`): Übungstage (4), saubere Blöcke (8), Riffe im
  Zieltempo (je 2, höchstens 6) und richtige Wissensantworten (6). Die Deckel sorgen dafür, dass
  ein einziger Abend ihn nie schafft und wer wenig Zeit hat, über Wissen trotzdem vorankommt.
  Die Zahlen sind eine Vermutung und dürfen sich ändern, solange der Test mitzieht. Der Name
  fällt aus einem Hash der Woche, nicht aus dem Zufall.
- **Nur auf *Heute* und im Abschluss, nie in der Session.** Die Karte steht unter dem Roadie,
  erst wer einmal geübt hat, sieht sie. Die Siegkarte erscheint im Abschluss, wenn genau diese
  Session ihn gefällt hat (Vorher-nachher-Rechnung wie bei den Aufnähern, eine zweite Session
  am selben Tag feiert nichts doppelt). Das Monster ist ein Pixelbild aus Rechtecken in
  Variablenfarben, ohne Bewegung.
- **Die Combo** (`combo`, ab `COMBO_AB` = 3) ist die längste Kette sauberer Blöcke in Folge
  innerhalb einer Session. Ein wackeliger Block bricht sie. Sie steht nur auf dem Zettel.

## Advent

- **Ein Türchen öffnet sich mit einem Übungstag im Dezember, gezählt wird nichts** (`lib/session/advent.ts`).
  So viele Übungstage, wie die Nummer sagt: zwei Tage öffnen 1 und 2. Daraus folgt ohne eigene Regel,
  dass ein verpasster Tag sich nachholen lässt, dass kein Türchen vor seinem Datum aufgeht (an einem
  Kalendertag zählt höchstens ein Übungstag) und dass ein geöffnetes nie wieder zufällt (der Log ist
  append-only). Außerhalb des Dezembers zeigt `/advent` den letzten Stand.
- **Die 24 sind Daten** (`advent-daten.ts`), gemischt: 8 Mini-Riffe, 8 Plektren, 6 Tipps mit „Warum" und
  zwei Aufnäher hinter 12 und 24. Die Riffe sind eigene Melodien auf der tiefen E- und der A-Saite; ihr
  Lernziel wird aus den Noten gerechnet (sie sind Schmuck, kein Lehrgang), `pruefeSong` prüft trotzdem das
  Raster. Fakten mit Quelle stehen nicht darin; was sich nicht belegen lässt, kommt nicht hinein.
- **Nur auf *Heute* und auf `/advent`, nie in der Session, ohne Animation.** Die Aufnäher stehen erst
  verdient an der Kutte (Reihe *Anlässe*, Gruppe `advent`, ein Bild `aufnaeher-advent.png` für beide Stufen,
  gezeichnet von `tools/advent.mjs`).

## Board, Quests, Zugabe und Rampenlicht

- **Das Board färbt nur die Töne** (`lib/audio/board.ts`, eingehängt im `SongPlayer`). Der Player hat zwei
  Busse: Töne laufen durchs Board, Klicks gehen direkt zum Ausgang — wer sein Timing misst, will keinen Hall
  auf dem Klick. Metronom, Hörfragen und Stimmgerät bleiben trocken. Es bleibt der eine AudioContext; die
  Kette entsteht erst beim Start aus einer Tippgeste und wird beim Anhalten samt Oszillatoren abgebaut.
  Das Delay folgt dem Tempo (punktierte Achtel) ab dem nächsten Start. Die Klänge sind Näherungen
  (Sättigungskurve, Filter, rauschender Hall), keine Nachbauten.
- **Die Reihenfolge gehört dem Lexikon, nicht dem Spieler.** Jedes Pedal trägt die Kennung seines Eintrags
  in `lib/theory/effekte.ts`; vor oder hinter dem Amp steht es dort, wo `fx-amp` steht. `board.test.ts`
  hält beides zusammen und prüft, dass keine Marken in den Namen stehen.
- **Besitz fällt aus dem Log, die Wahl gehört dem Gerät.** Gespeichert wird nur, was *aus* ist und welcher
  Amp steht (`mga.board.v1`, `lib/storage/lokal.ts`), wie beim Rack: das Board am Handy im Proberaum ist
  nicht das zu Hause. Ein neues Pedal ist deshalb von selbst an. Am Anfang gibt es den Übungscombo und
  einen Overdrive.
- **Quests belohnen mit Gerät, nie mit Gold** (`quests-daten.ts`, `quests.ts`). Kein Kontostand, nichts zu
  kaufen: ein Kontostand müsste gespeichert werden. Fortschritt ist eine Zahl, die nur wächst, also aus dem
  Log jederzeit neu zu zählen; erfüllt bleibt erfüllt. Drops dürfen weitere Quests tragen (`quests` im
  Drop-Schema), jeder Lohn muss ein Stück aus `board-daten.ts` sein, jedes nur einmal.
  Die Liste (`board-ansicht.tsx`) zeigt offene Quests zuerst, die nächste am Ziel vorn (`questGeordnet`),
  geschaffte getrennt darunter. Die Zahl „13/25" steht in Bernstein rechts neben dem Namen, der Balken hat zehn
  Felder (`balkenFelder`: voll nur am Ziel, nach dem ersten Fortschritt nie leer), der Lohn steht als eigene
  Zeile in normaler Schrift. Die Stufe trägt die Kante links (Bernstein legendär, Stahlblau episch), das Wort
  nur für Screenreader. Vorher war der Fortschritt ein 4-px-Strich mit grauer Zahl darunter und der Lohn die
  dunkelste Zeile.
- **Die Zugabe ist Ton auf Tippen** (`zugabe.ts`, `zugabe-knopf.tsx`): auf dem Abschluss-Zettel, einmal, ohne
  Klick, nie in der Session. Gespielt wird, was Noten hat: der zuletzt geübte Song, sonst ein Advents-Riff, vom
  Tag gewählt. Drills mit reiner Tabulatur haben keine Noten. Ein Riffbuch gibt es nicht, es bräuchte
  einen gespeicherten „gehört"-Stand.
- **Das Rampenlicht ist reine Anzeige** (`rampenlicht.tsx`): ein Tipp auf eine verdiente Gitarre im Rack,
  Pfeiltasten blättern, Esc schließt. Es bewegt sich nichts, auch bei normaler Bewegung nicht; der
  Hintergrund ist deckend, damit der Name lesbar bleibt.

## Band und Riffbuch

- **Die Band spielt nur in der Wiedergabe, nie im Block** (`lib/session/band.ts`, im `SongPlayer`). Im Block
  misst das Mikro, und eine Band, die sich selbst im Mikro hört, machte jede Timing-Messung zu Rauschen. Die
  Wiedergabe ist während eines laufenden Blocks ohnehin gesperrt; der Vorbehalt entfällt damit, solange die
  Band nur im Player läuft — und er kehrt zurück, wer sie je in den Block holt.
- **Mitglieder kommen mit dem Rang** (Schlagzeug ab Proberaum, Bass ab Vorband). Der Rang fällt aus dem Log
  und nie zurück, also geht auch keiner; gespeichert wird nichts. Ob ein Mitglied mitspielt, wählt das
  Gerät (`BoardWahl.bandAus`, bei fehlendem Feld spielen alle). Der Ablauf (`band-ablauf.ts`) ist rein: Kick
  auf Eins und Drei, Snare auf Zwei und Vier, Hi-Hat in Achteln, der Bass den Grundton auf jedem Schlag. Das
  Schlagzeug läuft am Board vorbei, der Bass hindurch. Klänge sind Näherungen.
- **Das Riffbuch ist die einzige gespeicherte Hörliste** (`riffbuch.ts`, `mga.riffbuch.v1`). „Gehört"
  steht nirgends im Log, also wird es gespeichert — aber nur auf dem Gerät und nicht im Abgleich: es ist
  nichts Verdientes, und ein zweites Gerät fängt leer an. Ein Riff kommt hinein, wenn der `SongPlayer` einen
  Durchgang zu Ende gespielt hat (`onGehoert`), in der Zugabe, in der Probe am Board und bei den Türchen. Das
  erste Datum bleibt, Unbekanntes kommt nicht hinein, Kaputtes fällt auf ein leeres Buch zurück. Es gibt
  keinen Aufnäher dazu: Aufnäher fallen aus dem Log.

## Jahresalbum

- **Das Album rechnet aus Log und Wissens-Log und speichert nichts** (`lib/session/album.ts`). Roadie
  presst am Jahresende ein festes Dokument, weil sich dort Quellen ändern oder wegfallen; hier wachsen
  beide Logs nur, also gibt es keinen Knopf. Trägt ein zweites Gerät spät etwas nach, kommt der Track
  dazu — und nummeriert die folgenden neu.
- **Eine Woche mit Übung ist ein Track, eine Pause ist keiner.** Gezählt wie der Rang: jeder Block
  zählt, auch ein sehr kurzer. Die Woche gehört zum Jahr ihres Donnerstags; KW 53 2026 reicht bis zum
  3. Januar 2027, ab dem Montag danach steht „Erschienen". Einträge aus der Zukunft fallen weg.
- **Keine Spielzeit.** Im echten Log standen Wochen mit 0 und 13 Sekunden; eine Tracklänge „0:00"
  behauptet etwas Falsches. Auf dem Track stehen Tage und Blöcke.
- **Titel aus Technik und Woche** („Gallop of the Molten Wolf"): die Technik mit den meisten Blöcken,
  das Warm-up nur, wenn sonst nichts war, der Rest aus einem Hash der Woche. Auf einer Platte doppelt
  keiner; bei einer Dublette rückt die spätere Woche weiter. In der laufenden Woche kann sich der Titel
  noch ändern. Die Wortlisten sind eigene, keine Muster bekannter Songtitel.
- **Bestwert heisst besser als vorher:** das erste saubere Mal ist keiner. Verglichen wird über
  Jahresgrenzen. Ein nie gefallener Wochengegner erscheint nirgends, auch nicht als Null.
- **Format:** Demo bis 3 Tracks, EP ab 4, LP ab 12. „Noch N Übungswochen bis zur …" steht nur da,
  solange die restlichen Wochen des Jahres dafür reichen. Die Zahlen sind eine Vermutung.
- **Das Cover** ist ein Pixelbild (64 × 64): der Totenkopf über einem Pegel, ein Balken je Track, Höhe
  nach Übungstagen, Bernstein bei gefälltem Gegner. Die Farben der Pappe sind Bild, nicht App-Palette,
  und stehen deshalb als Hex-Werte im Code, wie beim Shirt-Stoff.
- **Der Eingang liegt am Merch-Stand links unter dem Rang**, nicht auf *Heute* und nie in der Session.
