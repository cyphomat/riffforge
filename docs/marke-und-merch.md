# Marke, Pixelkunst und Merch

- **Gilt für:** Das Plektrum-Zeichen, Wortmarke und Wortfuge, die Regeln für Pixelkunst, der Merch-Stand mit Rang, Aufnähern und Tourshirts.
- **Lies, wenn** du Logo, Icons, Bilder oder etwas unter `/merch` änderst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Das Zeichen ist ein Plektrum, und es wird bei 48 px entschieden.** Das
  alte Icon war ein Amboss mit einem Vierstrahl-Stern: „Forge" war drin,
  „Riff" nicht, der Funke las sich als KI-Glyph, und die liegende Silhouette
  wurde auf dem Homescreen ein Klumpen. Beim Neubau sind neun Entwürfe
  gescheitert — Kopfplatte, Griffbrett, zwei Plektren, Plektrum im Case —
  und zwar **alle an derselben Spalte**: bei 48 px überlebt nur eine fette,
  geschlossene Silhouette. Feine Linien zerfallen, dünne Formen werden
  Striche, mehrfarbige Bänder werden Candy Corn. Wer das Zeichen anfasst,
  prüft es zuerst klein. Die Quelle ist `assets/logo/plektrum.txt`, und
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
  SVG aus Rechtecken (`public/icons/plektrum.svg`) — und unter 385 px, wo
  die Wortmarke weichen muss, steht es allein und bleibt der Weg nach Hause.
  Der README-Banner ist dieselbe Sprache: Pixelschrift statt Anton, weil
  ein SVG im README keine Schrift mitbringen kann, mit dem Haar Luft an der
  Fuge als genau einem Pixel. GitHub kennt kein `pixelated`, deshalb sind
  Rangszenen und Aufnäher dort vorher ganzzahlig vergrössert und werden in
  genau dieser Grösse gezeigt.
- **Die Wortfuge bekommt ein Haar Luft.** „Riff" + „forge" ergibt drei
  gleiche Buchstaben hintereinander — dasselbe Problem wie bei
  „Schifffahrt", und in versaler Anzeigeschrift liest man das als
  Tippfehler. `.marke .fuge` gibt der Naht 0,05 em. Zwei naheliegende
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
  `minmax(0,1fr)`-Spalten. Nicht übernommen aus der Orga-App: Pixelfeuer,
  Ansager, Konsole und die Endgegner — Schmuck und HUD, und die vier
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
  Ebenfalls aus Setlist: die **Gaffa-Etiketten** (`.tape`) als
  Überschriften im Merch-Stand — Edding auf Papierstreifen, mit derselben
  Tinte wie der Zettel —, die **Bildleiste der Ränge** statt der Segmente
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
