# Lieferung und Werkzeugkette

- **Gilt für:** Abhängigkeiten und `pnpm audit`, Build-Rechte, Bau-Stempel, Linter-Regeln, das Veröffentlichen (READMEs) sowie Lizenz und Inhalte.
- **Lies, wenn** du Abhängigkeiten hebst, Workflows änderst, veröffentlichst oder fremde Inhalte erwägst.
- Verschoben aus der CLAUDE.md, Text unverändert. Die kurzen Regeln stehen weiter dort.

## Konventionen

- **Der Bau-Stempel wird nicht von Hand gepflegt.** `tools/version.mjs`
  schreibt ihn zweimal aus einer Quelle: als `public/version.json` (was auf dem
  Server liegt) und als `NEXT_PUBLIC_*` im Bündel (was gerade läuft). Der
  Vergleich der beiden *ist* die Update-Erkennung — wer eines von beiden
  anders befüllt, macht sie blind. Der Service Worker muss `version.json`
  deshalb ungecacht durchlassen.
- **`pnpm audit` bleibt leer.** Die Werkzeugkette schleppt DoS-Meldungen in
  ihren Transitiven mit — nichts davon geht an einen Besucher, es läuft kein
  Server, aber `next dev` läuft auf diesem Rechner. Wo eine Transitive hängt,
  kommt die geflickte Fassung als `pnpm.overrides` in `package.json`. Im
  Moment sind es **null**: nach dem Sprung auf Next 16, Tailwind 4 und
  Vitest 5 waren alle elf früheren Overrides überflüssig — geprüft ohne
  jeden Override und mit frisch aufgelöster Lockfile. Wer eine Abhängigkeit
  hebt, schaut danach in `pnpm audit` und räumt Overrides weg, die ins Leere
  zeigen.
  Die einzige Ausnahme steht in `pnpm.auditConfig.ignoreGhsas`:
  GHSA-vfj7-8cjw-p6xm in `braces`, für das es **keine** geflickte Fassung gibt
  und das nur über den Linter hereinkommt (`eslint-config-next` → `fast-glob`
  → `micromatch`). Die Muster dort stammen aus unserer eigenen Konfiguration,
  nicht von einem Besucher. Sobald es einen Fix gibt, fliegt die Ausnahme
  raus. Geprüft wird wöchentlich von `audit.yml`, weil neue Meldungen mit der
  Zeit kommen, nicht mit Commits — und bewusst nicht im Deploy, damit eine
  fremde Meldung keinen eiligen Fix aufhält.
  **Leer heisst nicht sicher.** Next 16.4.1 schloss im Oktober zwei
  kritische und eine hohe Lücke (`use cache`, Bildoptimierung, Server
  Actions), und `pnpm audit` sah keine davon: Vercel veröffentlicht sie als
  Hinweise im eigenen Repo, und in der globalen Datenbank, aus der das
  Audit liest, standen sie nicht. Getroffen hätten sie diese App ohnehin
  nicht — ein statischer Export hat keinen Next-Server, und keine der drei
  Funktionen kommt im Code vor —, wohl aber `next dev` auf diesem Rechner.
  Wer Next hebt oder nach Sicherheit fragt, liest deshalb die Release-Notes
  unter github.com/vercel/next.js/releases, nicht nur das Audit.
  Zwei weitere Einträge in `pnpm` halten die Installation warnungsfrei, damit
  eine *neue* Warnung auffällt: `peerDependencyRules` erlaubt ESLint 10 für
  die drei Plugins aus eslint-config-next, die ihre Peer-Angabe noch nicht
  nachgezogen haben (sie laufen damit ohne Befund), und
  `ignoredBuiltDependencies` hält fest, dass die Installationsskripte von
  `msw` (über Vitest) und `unrs-resolver` (über den Linter) nicht laufen —
  pnpm 10 blockiert sie ohnehin, gebraucht werden sie nicht.
- **Der Bau hat keine Schreibrechte.** Im Deploy-Workflow gelten `pages:
  write` und `id-token: write` nur für den Deploy-Job; der Build-Job führt
  mit `pnpm install` fremden Code aus und bekommt nur `contents: read`.
  Actions hängen an Commit-Hashes mit der Fassung als Kommentar — ein Tag
  lässt sich nachträglich verschieben. Wer eine Action hebt, holt den Hash
  der neuen Fassung, statt auf den Tag zurückzufallen.
  Beim Heben die Eingaben alt gegen neu vergleichen, nicht nur die
  Versionsnummer: `upload-pages-artifact` v5 lässt versteckte Dateien weg,
  also auch die `.nojekyll`, an der `_next` hängen könnte — deshalb steht
  dort `include-hidden-files: true`.

## Beim Veröffentlichen

Die Testzahl steht als Abzeichen in **beiden** READMEs (`README.md` und
`README.en.md`) und zieht nicht von selbst mit. Wer Tests hinzufügt, zieht sie
dort nach — sonst steht dort irgendwann eine Zahl, die niemand mehr glaubt.
Dasselbe gilt für die Drill-Tabellen unter *Die Übungen* / *The drills*: sie
sind aus `lib/session/drills.ts` erzeugt, aber nicht generiert. Wer den Katalog
ändert, zieht sie nach — in beiden Sprachen.

Die beiden READMEs haben dieselbe Gliederung. Ein neuer Abschnitt gehört in
beide, sonst laufen sie auseinander.

## Inhalte und Recht

Alle Drills und Riffs sind **eigene** Übungen im jeweiligen Stil. Keine
abgeschriebenen Tabs, kein Audio urheberrechtlich geschützter Aufnahmen. Wenn
neue Inhalte dazukommen: bitte dabei bleiben.

Der Code steht unter **MIT** (`LICENSE`), Autor ist **@cyphomat** — nur der
GitHub-Name, kein Klarname und keine E-Mail-Adresse in App, READMEs oder
Lizenz. Ohne Lizenzdatei hiess es bis Oktober 2026 rechtlich „alle Rechte
vorbehalten": GitHub erlaubt den Fork-Knopf, aber anpassen und betreiben
durfte niemand, und ein „gerne forken" wäre eine Einladung ohne Boden
gewesen. Rückmeldungen gehen ans Original (Issues), der Quelltext-Link in
der App zeigt auf das, was gerade läuft — in einem Fork also auf den Fork.
Das steht in `components/session/ueber-panel.tsx`, am Ende von *Daten*.

## Deployment: Linter

Seit Next 16 gibt es `next lint` nicht mehr, und `next build` lintet nicht
mehr mit; der Linter läuft als `eslint .` in `pnpm check`, und der Workflow
lässt nichts durch, was `pnpm check` reisst. Die Konfiguration steht flach in
`eslint.config.mjs`. Drei Regeln aus `react-hooks` 7 sind dort bewusst aus:
`refs`, `set-state-in-effect` und `immutability` prüfen, ob der Code zum
React Compiler passt, und den benutzt die App nicht. Was sie anmahnen, sind
gewollte Muster — Laden aus `localStorage` nach dem ersten Anstrich (beim
statischen Export gibt es beim Bauen keinen Speicher), der jeweils neueste
Callback in einer Ref, der einmal festgehaltene Lick-Startwert. Wer den
Compiler einführt, schaltet sie wieder an und baut diese Stellen um — als
eigene Änderung, nicht nebenbei.
