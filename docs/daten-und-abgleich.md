# Daten, Abgleich und Gerät

- **Gilt für:** Was die App speichert und wohin: localStorage, Zod, Abgleich mit GitHub, Sicherung, Erinnerung, Löschen, Installieren und die Netz-Regel.
- **Lies, wenn** du in `lib/storage/`, `lib/sync/` oder `lib/backup*` arbeitest oder etwas Neues speicherst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Lokal ist der Normalfall, der Abgleich die Ausnahme.** Die App läuft
  vollständig ohne Datenrepo: alles liegt in `localStorage`, mitgenommen wird
  über eine Datei. Auf *Daten* steht deshalb zuerst Sichern und Einlesen;
  der GitHub-Abgleich sitzt zugeklappt darunter. Wer ihn nicht will, sieht
  von GitHub nie etwas — und `runSync` liefert ohne eingerichtetes Repo still
  `ok: false` statt eines Fehlers.
  **Ist er eingerichtet, steht er oben und offen.** Zugeklappt unter
  *Löschen* hielt Daniel ihn auf dem iPhone für verschwunden — wer ein
  Datenrepo hat, benutzt es, und für den ist der Abgleich der Hauptweg und
  die Datei der Nebenweg. *Löschen* bleibt in beiden Fällen das Letzte.
- **Erinnern, aber selten.** `sollErinnern` verlangt *beides*: mindestens
  zwölf Einträge und vierzehn Tage seit der letzten Sicherung. Ohne je
  gesicherte Datei zählt die Zeit ab dem ältesten Eintrag, sonst bekäme
  jemand, der seit einem Jahr übt und nie exportiert hat, nie einen Hinweis.
  Ein erfolgreicher Abgleich **zählt als Sicherung** (`letzteKopie` nimmt den
  jüngeren Zeitpunkt): die Warnung sagt, dass Aufräumen den Log mitnimmt, und
  ein privates Repo überlebt das wie eine Datei. Vorher las, wer täglich
  abglich, trotzdem „Noch nie gesichert" — und eine Warnung, die nachweislich
  nicht stimmt, glaubt man auch dann nicht mehr, wenn sie stimmt.
  Eine Erinnerung, die zu früh oder grundlos kommt, wird weggeklickt und
  danach nie wieder gelesen — deshalb steht sie an genau zwei Stellen: über
  dem Exportknopf und am Abschluss einer Session, also dort, wo man ohnehin
  stehen bleibt.
- **Installieren geht nur auf der Herkunft der App.** `beforeinstallprompt`
  feuert nicht für eine fremde Domain — eine Startseite auf einer anderen
  Adresse kann also keinen echten Installieren-Knopf haben, nur eine
  Attrappe. Der Knopf sitzt deshalb in der App unter *Daten*;
  `landing/index.html` verlinkt nur. Auf iOS gibt es das Ereignis gar nicht,
  dort steht die Anleitung über *Teilen → Zum Home-Bildschirm*. Und `.marke`
  ist in der Startseite ein Systemschrift-Stapel, weil eine Schrift
  nachzuladen hiesse, für eine Startseite einen fremden Host aufzumachen.
- **Zwei Logs, zwei Dateien im Datenrepo.** `uebungen.json` und
  `theorie.json` liegen getrennt, weil ein Gerät mit älterem Stand ein
  unbekanntes Feld beim Einlesen abstreift und beim nächsten Abgleich
  wegschriebe. Die *Sicherungsdatei* ist dagegen eine — dort ist ein
  abgestreiftes Feld eine einmalige, sichtbare Handlung, und zwei Downloads
  wären Zumutung.
- **Die Konfliktbehandlung existiert einmal.** `syncLog` ist über die
  Log-Form parametrisiert (`LogShape`), nicht kopiert. Das ist die heikelste
  Stelle der App — zwei Fassungen davon wären zwei Gelegenheiten, Übung zu
  verlieren.
- **Der Katalog ist streng, der Log ist nachsichtig.** `drillResultSchema`
  prüft die Technik nicht gegen `TECHNIQUES`. Ein Log-Eintrag ist Vergangenheit
  und verweist auf einen Drill, den es auf diesem Gerät vielleicht noch nicht
  gibt; mit der Aufzählung geprüft verlöre ein Gerät auf älterem Stand beim
  Abgleich nicht diesen Eintrag, sondern den *ganzen* Log.
- **Löschen heisst löschen.** Was die App speichert, muss der Löschen-Weg auch
  wieder loswerden — Log, beiseitegelegte Kopie, Profil und **der Abgleich
  samt Token**. Letzterer fehlte lange: *Alles löschen* versprach „wie frisch
  installiert" und liess den Token im Speicher, den sich alle
  `github.io`-Seiten teilen — und der nächste Hintergrund-Abgleich holte den
  gelöschten Log zurück. Seitdem gibt es eine Funktion, `allesLoeschen`, und
  `loeschen.test.ts` sammelt jeden `mga.*`-Schlüssel aus dem Quelltext ein und
  verlangt danach einen leeren Speicher. Ein neuer Schlüssel ohne Löschweg
  fällt dort auf, nicht erst bei jemandem, der sich auf das Löschen verlässt.
  Das Datenrepo bleibt dabei unberührt: gelöscht wird dieser Browser.
- **Kein dritter Host.** `api.github.com` ist die einzige fremde Adresse, und
  auch die nur zweimal: beim eingerichteten Abgleich, und auf Knopfdruck beim
  Blick zum Original — Letzteres ausschliesslich in einem Fork. Sonst spricht
  die App mit niemandem. Schriften liegen lokal (`next/font` lädt sie
  beim Build), es gibt keine Analyse-Dienste und keine Einbettungen. Die CSP in
  `app/layout.tsx` schreibt das fest: wer einen Host hinzufügt, muss dort
  `connect-src` erweitern — und sich fragen, warum.
- **Das Repertoire gehört dem Gerät und enthält keine Noten.** Gelernt wird mit
  der eigenen Guitar-Pro-Datei; die App merkt sich nur Abschnitte, Status,
  Übetempo, Technik-Tags und den Sound (`mga.repertoire.v1`). Von der Datei
  bleibt der Name als Hinweis, ein Pfad wird abgelehnt. Das Repo ist
  öffentlich, deshalb sind alle Testsongs erfunden und `.gitignore` sperrt
  Guitar-Pro-Dateien. `songs.ts` und `pruefeSong` haben damit nichts zu tun:
  das sind eigene Riffe mit nachgerechnetem Lernziel.
  Es wird **nicht abgeglichen und steht nicht in der Sicherungsdatei**: wer
  den Browser leert, verliert es, was nicht als eigene Datei gesichert ist. Weil es anders als Riffbuch oder Rack
  Handarbeit ist, wird Kaputtes beiseitegelegt (`mga.repertoire.v1.broken`),
  und gelingt das nicht, wird auch nicht darübergeschrieben. Ein eigener
  Export ist offen.
  **In den Log geht nur, dass geübt wurde** (`repertoireEintrag` in
  `repertoire-session.ts`): `drillId` und `technique` sind `"repertoire"`, dazu
  Tempo, Sekunden, Zeitpunkt — kein Name, keine Kennung, kein Status, denn der
  Log wird abgeglichen. Das Pflichtfeld `rating` steht fest auf 2, damit auch
  eine ältere Version den Block nie als sauber zählt. Wo ein fester Wert stören
  würde (Ansage, Combo, saubere Tage, Tempoverlauf), wird der Eintrag
  übersprungen; Serie, Rang, Kalender, Minuten und Übungstage zählen ihn.
  Überlappen dürfen sich Abschnitte nur auf **verschiedenen Spuren** —
  Rhythmus und Solo liegen oft über denselben Takten. Je Abschnitt bleibt das
  erste Datum für *langsam* und *sitzt* stehen; ein Rückschritt löscht nichts.
  Die Oberfläche liegt unter *Drills* (`/drills/repertoire`): ein fünfter
  Eintrag passt auf dem Handy nicht in die Leiste. Sie sagt auf jedem
  Bildschirm ausser beim Bearbeiten, dass der Stand nur auf diesem Gerät liegt,
  und meldet, wenn das Speichern scheitert.
- **Ein neuer Song lässt sich aus der Guitar-Pro-Datei ausfüllen**
  (`repertoire-gp.ts`). In `.gp3` bis `.gp5` stehen Titel, Band, Tempo,
  Taktarten, Marken und Stimmungen vor den Noten; gelesen wird bis hinter die
  letzte Spur, keine Note. Ein eigener Leser statt einer Bibliothek, weil jede
  davon Notensatz und Wiedergabe mitbringt. `.gpx` und `.gp` sind anders
  gebaut und werden mit einem Satz abgelehnt. Marken werden zu
  Abschnittsvorschlägen (bis zur nächsten Marke), Stimmungen kommen von Spuren
  ab sechs Saiten ohne Schlagzeug. Reisst die Spurliste ab, bleibt der Rest
  gültig und die Stimmung leer. Tempowechsel stehen zwischen den Noten, also
  zählt das Tempo aus dem Kopf. Ausgefüllt ist nicht gespeichert. Das
  Auswahlfeld hat kein `accept`, weil iOS unbekannte Endungen ausgraut. Die
  Testdateien baut der Test Byte für Byte; Version 5.10 ist nur so geprüft.
- **Das Repertoire reist als eigene Datei** (`repertoire-datei.ts`,
  `riffforge-repertoire-JJJJ-MM-TT.json`, in `.gitignore`). Sie ist getrennt von
  der Sicherung, weil diese und der Abgleich ohne echte Songdaten bleiben
  sollen. Gelesen wird ganz oder gar nicht: ein kaputter Song, eine fremde
  `app`/`art` oder eine neuere `version` ändern nichts. Übernommen wird erst nach
  der Vorschau. Songs finden sich über die Kennung, sonst über Titel und Band;
  Abschnitte über die Kennung, sonst über Name und Spur. Anders als beim Log
  gibt es hier veränderliche Werte, deshalb entscheidet das Datum, und zwar
  getrennt: `standAm` für Status und Übetempo, `geaendert` für Beschreibung und
  Songdaten. So nimmt ein umbenannter Abschnitt auf dem einen Gerät dem anderen
  nicht den neueren Übungsstand. Ältere Daten ohne `standAm` zählen mit ihrem
  jüngsten Übungs- oder Erreicht-Datum, bei Gleichstand gilt, was hier steht.
  Neu Angelegtes bekommt keinen Stempel, damit ein unberührter Abschnitt nie
  neuer wirkt als ein geübter. Gelöscht wird beim Einlesen nichts, auch kein
  Tag und kein Sound-Wert; hier Gelöschtes kommt aus einer alten Datei deshalb
  zurück. Ein Abschnitt, der einen anderen auf derselben Spur überlappen würde,
  wird nicht übernommen, und die Vorschau sagt es. Auf iPhone und iPad geht die
  Datei über das Teilen-Menü hinaus, sonst als Download.
