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
