# Design und Themes

- **Gilt für:** Farben und Kontrast, hell/dunkel, Schriften, Flächen, die Metal-Twist-Bauteile, Tailwind 4 und das Seitenraster.
- **Lies, wenn** du CSS, Farben, Schriften, ein Bauteil oder das Layout anfasst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Breit ab 900 px** (`wide:` in Tailwind), wie bei Setlist. Die Reihenfolge im
  Markup bleibt gleich — `.zwei-spalten` stapelt auf dem Handy einfach. Der
  Abschluss-Bildschirm bleibt schmal: er ist eine Entscheidung, keine Übersicht.
- **Lesbarkeit ist eine Zahl.** `lib/ui/__tests__/kontrast.test.ts` liest die
  Farben aus `globals.css` und rechnet jede Paarung nach, die als Text
  vorkommt — AA, also 4,5 : 1. Der Anlass war kein Geschmacksurteil: `--dim`
  stand auf #57535c, das sind **2,4 : 1** gegen eine Karte, und trug trotzdem
  fünfundvierzig Textstellen in fünfzehn Dateien. Die App war an Dutzenden
  Stellen schlicht nicht lesbar, und gemerkt hat es niemand, weil Lesbarkeit
  bis dahin Geschmack war statt einer Prüfung. Der schwierigste Grund ist
  `--panel2`, das helle Ende des Kartenverlaufs — dort ist mein erster
  Kandidat mit 4,47 gescheitert, und der Test hat ihn beim ersten Lauf
  abgewiesen. Wer eine Farbe anfasst, lässt ihn laufen.
- **Es gibt zwei Fassungen, und beide sind gerechnet.** Die helle kam aus
  Roadie, für Tageslicht: dasselbe Road-Case in Grau, Papier statt Glut.
  Sie steht **einmal** in `globals.css`, als `:root[data-theme="hell"]`, und
  setzt nur, was sich ändert — Papier, Tinte und Stempel erbt sie. Das
  Attribut setzt ein Skript im Kopf der Seite (`lib/ui/darstellung.ts`),
  *immer aufgelöst* zu `hell` oder `dunkel`: so braucht es keine zweite
  Kopie der Palette in einer Medienabfrage, und Auto folgt dem System über
  `matchMedia`. Das Skript läuft vor React, damit nichts dunkel aufblitzt;
  es spricht deshalb seine eigene kleine Fassung der Regel, und
  `darstellung.test.ts` führt es aus und hält es gegen `fassungFuer`. Die
  Wahl gehört dem Gerät (`mga.darstellung.v1`), nicht dem Log. Was je
  Fassung anders *fällt* als nur die Farbe — Tolex-Narbung, der Einlass der
  Platte, das Glimmen, Schatten unter Papier —, steht ebenfalls als
  Variable: in dunkler Stärke wäre die Narbung auf hellem Grund ein Muster.
  Bernstein ist im Hellen #854d00 statt #e8a23d; das helle läge dort bei
  1,9 : 1. Wer eine Farbe hinzufügt, setzt sie in beiden Blöcken oder
  prüft, dass die dunkle im Hellen trägt — der Kontrasttest rechnet beide.
- **Klein und gesperrt ist zweimal schlecht.** Die Etiketten standen auf
  10,5 px mit 0,22 em Sperrung; Versalien in Monospace so weit auseinander
  zerlegen das Wortbild, und auf einem Handy kommt beides zusammen. Der Boden
  ist jetzt 11,5 px, die Sperrung höchstens 0,14 em. Wer ein Etikett setzt,
  nimmt `.kicker` statt eigener Pixelwerte — sonst wandert der Boden wieder
  nach unten.
- **Ein Eingabefeld hat 16 px, sonst zoomt das iPhone.** Safari vergrössert
  beim Antippen jedes Feld unter 16 px und springt danach nicht zurück. Die
  drei Felder des Abgleichs standen auf 14 — aufgefallen ist es in Roadie,
  wo dieselbe Falle sass. `lib/ui/__tests__/eingabefeld.test.ts` liest jedes
  `<input>`, `<textarea>` und `<select>` aus dem Quelltext und verlangt
  `text-[16px]` oder mehr; ein Feld ohne Angabe fällt dort auch durch. Der
  Test zählt ausserdem, *dass* er Felder findet: im ersten Lauf hielt er
  `outline-hidden` für `hidden`, übersprang alle und war grün.
- **Der Grund ist matt.** Bis Oktober lag ein ganzer Hals als Hintergrund
  auf der Seite — Saiten, Bünde, Einlagen, gekachelt aus `lib/theory/hals.ts`,
  mit einem Regler und einem Test, der die Einlagen im Stylesheet nachrechnete.
  Er ist in drei Anläufen an drei verschiedenen Stellen gescheitert: erst
  unsichtbar, weil er im Register von `--raster` lag; dann hochgezogen und
  auf einem OLED unruhig; dann schien er durch das antippbare Griffbrett und
  setzte fremde Punkte zwischen die Bünde, und zuletzt lag er hinter Listen,
  die selbst aus Linien bestehen. Daniels Urteil: stört mehr, als es hilft.
  Der Grund für alle drei Fehlschläge ist derselbe — **der Inhalt dieser App
  ist aus Linien und Punkten gemacht**: Tabulaturen, Griffbrett,
  Skalenstriche, Trennlinien. Ein Grund, der dieselbe Sprache spricht,
  konkurriert mit ihm, egal wie leise er gestellt ist. Textur gehört auf
  Flächen (Tolex auf `.card`), nicht auf den Grund; `hals.test.ts` hält fest,
  dass dort keiner mehr liegt. Wer ein Flächenmuster erwägt, prüft es zuerst
  hinter dem Griffbrett und hinter einer Liste — dort ist es gescheitert.
- **Ein Instrument zum Ablesen bekommt eine eigene Fläche.** Griffbrett und
  Tabulatur stehen auf `--sunken`, mit Rand. Das war zuerst die Antwort auf
  den durchscheinenden Hals, ist aber auch ohne ihn richtig: was man liest,
  während die Hände spielen, soll sich vom Rest des Bildschirms abheben.
- **Vier Bauteile tragen den Metal-Twist, und jedes hat eine Grenze.**
  `.winkel` sind die Eckwinkel am Road-Case — **höchstens zwei je Bildschirm**,
  und nur auf dem, was gerade dran ist: die Ansage auf *Heute*, der laufende
  Block, der Wissens-Kopf, der Rang im Merch-Stand. Ein Winkel an jeder Fläche wäre Dekoration.
  `.platte` ist das eingelassene Blech mit Skalenstrichen und Glimmen, und es
  trägt **die** Zahl, auf die es auf dem jeweiligen Bildschirm ankommt: das
  Tempo im Block, die drei Zahlen unter *Bisher*. Nicht jede Zahl — dann wäre
  keine mehr die Heldenzahl. `.jewel` ist die Kontrolllampe am Netzschalter;
  ihre Farbe kommt über `currentColor` von aussen, damit sie denselben Zustand
  zeigt, den das Wort daneben schon nennt, und keinen eigenen erfindet.
  `.warnstreifen` markiert **nur verletzte Bedingungen** — Mikrofon
  verweigert, Fassung zurückgerollt, Abgleich gescheitert —, nie einen Fehler
  und nie Schmuck.
- **Der Anlass-Banner ist der eine Schmuck, und er hat Grenzen.** Riffforge
  verzichtete bis Oktober auf Pixelfeuer, Ansager und HUD (das Pixelfeuer steht
  seitdem auf *Heute*, siehe *Pixel-Metal*); Weihnachten bekommt trotzdem
  einen Streifen, weil er genau zwei Dinge leistet, die sonst nichts leistet:
  er sagt dem Nutzer, dass die App den Kalender kennt, und er kostet nichts.
  Deshalb gilt: nur auf *Heute*, direkt unter der Ansage, **nie in der Session**;
  ein Motiv von 15 × 15 Pixeln, ganzzahlig dreifach, **ohne Animation**; kein
  `.winkel`, kein `.jewel`, keine Akzentfarbe — Linie, Motiv, ein Satz, ✕ für den
  Tag; ein Gedenktag lässt auch die Linie weg. Rund vierzig Tage im Jahr
  (Weihnachten 1.–26.12., dazu Lemmy und Ozzy), ein Schalter unter *Daten*.
  Nur öffentliche Anlässe, nie etwas Persönliches: Riffforge hat keine Daten,
  aus denen Geburtstage oder Konzerte folgten. Wer einen Anlass oder ein Motiv
  hinzufügt, bleibt in dieser Hülle; was mehr will, gehört nicht hierher.
- **Der Taktzähler ist eine Spielhilfe, kein Bedienelement.** Er stand als
  vier Quadrate von zehn Pixeln in der Knopfreihe — genug zum Ablesen, aber
  unbrauchbar für den, der das Gerät auf dem Notenständer hat: im Augenwinkel
  kommen Fläche und Helligkeitswechsel an, keine Formen. Jetzt über die volle
  Breite, 42 px hoch, und **über** den Knöpfen statt zwischen ihnen; in die
  Knopfreihe sieht man, wenn man drücken will. Gezählt werden **Schläge,
  nicht Klicks**: bei Klick auf Achteln blinkte er sonst achtmal je Takt, und
  acht Wechsel je Takt sind im Augenwinkel ein Flackern statt eines Pulses.
  Die Eins bleibt auch im Ruhezustand markiert, damit man nach einem Blick
  zur Griffhand wiederfindet, wo der Takt anfängt.
- **Der Twist gehört dorthin, wo der Nutzer ist.** Als die vier Bauteile
  fertig waren, sass genau eines davon auf *Heute* — dem Bildschirm, der
  täglich aufgeht; der Rest lag hinter dem Startknopf oder in Fehlzuständen,
  die man hoffentlich nie sieht. Beim Bauen fällt auf, woran man gerade baut.
  Wer ein Bauteil hinzufügt, prüft deshalb zuerst *Heute*.
- **`.num` gibt nur `tabular-nums`, `.ziffern` gibt die Monospace.** Beide
  stehen in `@layer components`, und `font-mono` in `.num` stach früher die
  Anzeigeschrift von `.display` aus — Timer und Tempo rendern dann in der
  System-Monospace. Wer eine grosse Zahl setzt, nimmt `display num`; die
  Monospace ist für Tabs und Log-Zeilen da.
- **Tailwind 4 hat echte Kaskaden-Ebenen, und die Utility-Ebene gewinnt
  immer.** Unter Tailwind 3 war `@layer` nur eine Sortierung, und eine
  Komponenten-Regel wie `.spalte > :first-child` überstimmte ein `mt-8` am
  selben Element über die Spezifität. Unter 4 verliert sie, egal wie
  spezifisch — beim Umstieg rutschte so die linke Spalte auf jedem breiten
  Bildschirm um 32 px nach unten. Was ein Utility überstimmen *muss*, steht
  deshalb in `@layer utilities`. Die Regel hatte eine Kehrseite, die erst
  Daniel am breiten Schirm sah: wo die zwei Spalten die Seite selbst sind
  (*Heute*, *Rückblick*, *Merch*, *Wissen*), nahm sie dem ersten Element
  auch den Abstand zur Navigation — Plakat und *Bisher* klebten an ihrer
  Kante. Den Abstand trägt seitdem die Hülle (`.huelle-breit.zwei-spalten`,
  24 px wie überall), nicht das erste Kind. Zwei weitere Grenzen: `@apply` geht nur auf
  Utilities, nicht auf eigene Klassen (`.huelle`, `.display`, `.rule` stehen
  dort ausgeschrieben), und das Theme steht als `@theme` in `globals.css`,
  nicht mehr in einer `tailwind.config.ts`. Das offizielle Upgrade-Werkzeug
  hat beim Umzug zusammengesetzte Selektoren zerlegt (`details.info` und
  `.zettel li.sauber` wurden zu kaputten Utilities); `globals.css` ist von
  Hand umgestellt, Seite für Seite pixelgleich gegen den Stand davor
  verglichen. Tailwind 4 verlangt Safari 16.4 — die Untergrenze für iOS steht
  in beiden READMEs.
- **Pixel-Metal: die App sieht aus wie das, was man darin übt.** Daniels Urteil
  im Vergleich mit Roadie und Setlist: etwas öde, „dabei kann das Ding ja Metal
  leben" — und das Plektrum-Zeichen „sieht eher aus wie ein Herz". Seitdem:
  - **Das Zeichen ist ein Totenkopf**, 20 × 20 mit glühenden Augen
    (`assets/logo/totenkopf.txt`, Begründung in `marke-und-merch.md`).
  - **Zwei Pixelschriften, jede für ihren Zweck.** *Jacquard 24* ist
    Pixel-Blackletter (`.metal`) und trägt den Namen in der Navigation und das
    Wort des Tages: nur gross (ab 24 px, scharf bei 24/48/72), gemischt gesetzt
    — Fraktur-Versalien liest niemand —, mit hartem Schatten in `--lippe`.
    *Jersey 10* ist `--font-display` und ersetzt Oswald für Titel, Tempi und
    Zähler. Pixelify Sans war die erste Wahl und ist an den **Ziffern**
    gescheitert: die 5 liest sich als S, die 8 als 6 mit Loch, und das bei einem
    Tempo. Jersey ist für Trikotnummern gezeichnet und schmal wie Oswald, also
    läuft kein Titel auf 320 px über. Oswald bleibt Rückfall und trägt den Druck
    der Shirts; kleine Schrift (Etiketten, Fliesstext) bleibt Monospace und
    System — Pixelschrift unter 16 px franst aus.
  - **Kanten sind Treppen.** `--pix-line`, `--pix-akzent`, `--pix-stahl` sind vier
    Balken, die um 2 px versetzt hinter dem Element liegen: die Ecken bleiben
    leer, ohne Bild und ohne `clip-path` — ein Clip schneidet den Fokusring ab,
    und der wäre dann nicht mehr da. `.btn` sitzt auf einer Lippe (`--lippe`,
    6 px) und sinkt beim Drücken um 4; `.card` hat einen harten Sockelschatten.
    Das gilt für Karte, Knopf, Platte, die drei Zahlen und die Navigations-Tabs.
    Einfache Listenzeilen behalten ihre Linie von 1 px: ein Treppenrahmen an
    jeder Zeile wäre Gitter.
  - **Zacken und Schädel sind Masken** (`--glyph-zacke`, `--glyph-schaedel`), kein
    Bild: die Farbe kommt vom Element und folgt damit der Fassung und dem
    Kontrast. `.zacken` sitzt unter der Navigation, `.rule::before` setzt einen
    Schädel vor jede Überschrift, und die Linie dahinter ist gestrichelt statt
    verlaufend.
  - **Das Pixelfeuer** (Algorithmus aus Setlist) steigt aus der oberen Kante des
    Plakats auf *Heute*. Die Höhe folgt dem Ton: *Hart* 14 Reihen, *Solide* 10,
    *Technik* 8, *Start* 6, *Pause* 4 — ein harter Tag lodert, nach einer Pause
    glimmt es. Die Kühlung muss mit der Höhe skalieren (`80 / Reihen`): Setlists
    Wert ist für 34 Reihen gestimmt, und bei 14 stand oben eine gelbe Wand. Der
    Platz dafür ist ein Platzhalter vor dem Plakat, weil `.spalte > :first-child`
    dem ersten Kind den Aussenabstand nimmt.
  - **Was bleibt.** Der Grund ist matt (siehe oben); die Session hat weder Feuer
    noch Animation, denn dort sind die Hände beschäftigt; der Kontrasttest und
    die 16 px der Eingabefelder gelten unverändert; Ansager, Konsole und
    Endgegner sind weiter nicht übernommen. Wer ein weiteres Pixelstück
    hinzufügt, prüft es zuerst auf der Session und hinter einer Liste — dort ist
    der Hals-Hintergrund gescheitert.
- **Rost ist „nicht ganz", Rot ist „kaputt".** `--rost` trägt die zähe
  Bewertung, die überfällige Karte, die fehlende Bedingung. Bleibt Rot dafür
  frei, heisst Rot wirklich noch etwas.
