import { SIEBEN_DRILLS } from "./drills-sieben"
import type { Drill } from "./types"

/**
 * All exercises are written for this app — original patterns in the idiom,
 * not transcriptions of copyrighted recordings.
 *
 * Tab is standard tuning, high e on top. PM = palm mute, N/V = down/upstroke.
 */
export const DRILLS: Drill[] = [
  // ---------------------------------------------------------------- warm-ups
  {
    id: "warmup-chromatic",
    title: "Chromatic 1-2-3-4",
    kind: "warmup",
    technique: "warmup",
    goal: "Finger unabhängig machen und die Hand aufwärmen",
    cues: [
      "Ein Finger pro Bund, keiner hebt ab bevor er muss",
      "Fingerkuppen, nicht die Fläche",
      "Wechselschlag: runter, rauf, runter, rauf",
    ],
    tab: `e|------------------------------------------------1--2--3--4--|
B|-------------------------------------1--2--3--4-------------|
G|----------------------------1--2--3--4----------------------|
D|-------------------1--2--3--4-------------------------------|
A|----------1--2--3--4----------------------------------------|
E|-1--2--3--4-------------------------------------------------|`,
    why: "Vier Bünde nebeneinander sind vier Halbtöne — die kleinste Einheit, aus der alles gebaut ist. Tonleitern und Akkorde sind nur Auswahlen daraus.",
    startBpm: 60,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "warmup-string-skip",
    title: "String Skipping",
    kind: "warmup",
    technique: "warmup",
    goal: "Anschlaghand treffsicher machen, ohne hinzusehen",
    cues: [
      "Nicht auf die rechte Hand schauen",
      "Ungespielte Saiten mit dem Handballen abdämpfen",
      "Lieber langsam und sauber als schnell und laut",
    ],
    tab: `e|-------------------------------------|
B|-------------------------------------|
G|-------5-----------5-----------5-----|
D|-------------------------------------|
A|-5-----------7-----------8-----------|
E|-------------------------------------|`,
    why: "Der Abstand zwischen benachbarten Saiten ist eine Quarte (fünf Halbtöne) — außer zwischen G und H, da ist es eine große Terz. Genau deshalb verschieben sich Griffbilder auf der H-Saite um einen Bund.",
    startBpm: 60,
    targetBpm: 130,
    beatsPerBar: 4,
    subdivision: 1,
  },

  // -------------------------------------------------------------- techniques
  {
    id: "tech-downpicking",
    title: "Downpicking Endurance",
    kind: "technique",
    technique: "downpicking",
    goal: "Ausdauer im reinen Abschlag — der Kern des Thrash-Sounds",
    cues: [
      "AUSSCHLIESSLICH Abschläge, kein Wechselschlag",
      "Bewegung aus dem Handgelenk, nicht aus dem Ellbogen",
      "Wenn der Unterarm brennt: Tempo runter, nicht durchbeissen",
    ],
    tab: `e|-------------------------|
B|-------------------------|
G|-------------------------|
D|-2--2--2--2--2--2--2--2--|
A|-2--2--2--2--2--2--2--2--|
E|-0--0--0--0--0--0--0--0--|
   N  N  N  N  N  N  N  N`,
    why: "Reine Abschläge klingen härter als Wechselschlag, weil jeder Anschlag dieselbe Richtung und damit denselben Attack hat. Der Preis ist Ausdauer — deshalb ist Downpicking eine Kondi-Übung, keine Technik-Übung.",
    startBpm: 90,
    targetBpm: 190,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "tech-palm-mute",
    title: "Chug Control",
    kind: "technique",
    technique: "palm-mute",
    goal: "Gleichmässige Palm Mutes — jeder Chug gleich laut, gleich kurz",
    cues: [
      "Handballen liegt auf dem Steg, nicht davor",
      "Ziel ist ein trockenes 'tschk', kein dumpfes Nichts",
      "Auf gleiche Lautstärke hören, nicht auf Geschwindigkeit",
    ],
    tab: `e|----------------------------------|
B|----------------------------------|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|-0--0--0--0--0--0--0--0--0--0--0--|
   PM-----------------------------`,
    why: "Palm Muting kürzt die Ausklingzeit, ohne die Tonhöhe zu ändern. Dadurch wird der Ton perkussiv: Du hörst den Rhythmus deutlicher als die Harmonie — die Basis des Metal-Riffings.",
    startBpm: 80,
    targetBpm: 170,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "tech-gallop",
    title: "Gallop",
    kind: "technique",
    technique: "gallop",
    goal: "Das Achtel-plus-zwei-Sechzehntel-Muster sauber und stabil",
    cues: [
      "Zähle 'taa-ta-ta' auf jeden Klick",
      "Abschlag – Abschlag – Aufschlag",
      "Das erste Achtel ist der Anker, es darf nicht wandern",
    ],
    tab: `e|--------------------------------------|
B|--------------------------------------|
G|--------------------------------------|
D|--------------------------------------|
A|--------------------------------------|
E|-0--0-0---0--0-0---0--0-0---0--0-0----|
   PM--------------------------------
   N  N V   N  N V   N  N V   N  N V`,
    why: "Der Gallop ist ein Achtel plus zwei Sechzehntel: drei Anschläge auf einen Schlag, ungleich verteilt. Diese Ungleichheit erzeugt den Vorwärtsdrall — bei gleichmäßigen Sechzehnteln wäre er weg.",
    startBpm: 70,
    targetBpm: 150,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "tech-power-chord-shifts",
    title: "Power Chord Shifts",
    kind: "technique",
    technique: "power-chords",
    goal: "Lagenwechsel ohne Lücke und ohne Nebengeräusch",
    cues: [
      "Griffhand löst den Druck beim Wechsel, hebt aber nicht ab",
      "Beim Rutschen die Saiten mit der Anschlaghand dämpfen",
      "Der Wechsel passiert auf dem letzten Achtel, nicht auf der Eins",
    ],
    tab: `e|-------------------------|
B|-------------------------|
G|-------------------------|
D|-2----5----7----10-------|
A|-2----5----7----10-------|
E|-0----3----5----8--------|
   E5   G5   A5   C5`,
    why: "Ein Power Chord ist Grundton plus Quinte (sieben Halbtöne), ohne Terz. Weil die Terz fehlt, ist er weder Dur noch Moll — deshalb passt er über jede Tonart und verzerrt sauber, statt zu matschen.",
    startBpm: 70,
    targetBpm: 160,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "tech-alternate-picking",
    title: "Alternate Picking",
    kind: "technique",
    technique: "alternate-picking",
    goal: "Gleichmässiger Wechselschlag auf einer Saite",
    cues: [
      "Klick liegt auf Achteln — jeder Klick ein Ton",
      "Aufschlag muss genauso laut sein wie der Abschlag",
      "Plektrum flach halten, wenig Saitenwiderstand",
    ],
    tab: `e|-------------------------|
B|-------------------------|
G|-------------------------|
D|-------------------------|
A|-------------------------|
E|-5--6--7--8--7--6--5--6--|
   N  V  N  V  N  V  N  V`,
    why: "Wechselschlag halbiert den Weg des Plektrums pro Ton. Die Grenze ist nicht die Geschwindigkeit der Hand, sondern wie gleichmäßig Auf- und Abschlag klingen.",
    startBpm: 60,
    targetBpm: 140,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "tech-pentatonic-box",
    title: "Pentatonik Box 1",
    kind: "technique",
    technique: "pentatonic",
    goal: "A-Moll-Pentatonik in der 5. Lage, hoch und runter",
    cues: [
      "Zeigefinger auf Bund 5, Ringfinger auf 7, kleiner Finger auf 8",
      "Erst die Form auswendig, dann Tempo",
      "Auf dem Rückweg genauso sauber wie auf dem Hinweg",
    ],
    tab: `e|--------------------------------5--8--|
B|--------------------------5--8--------|
G|--------------------5--7--------------|
D|--------------5--7--------------------|
A|--------5--7--------------------------|
E|--5--8--------------------------------|`,
    why: "Die Moll-Pentatonik ist die Moll-Tonleiter ohne den zweiten und sechsten Ton — die beiden, die Halbtonreibung erzeugen. Was übrig bleibt, klingt über fast jeder Begleitung richtig.",
    startBpm: 60,
    targetBpm: 150,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "tech-bending",
    title: "Bending & Vibrato",
    kind: "technique",
    technique: "bending",
    goal: "Ganztonziehen auf Tonhöhe treffen und halten",
    cues: [
      "Zuerst Bund 9 anspielen — das ist der Zielton im Ohr",
      "Aus dem Handgelenk drehen, nicht mit dem Finger drücken",
      "Andere Finger stützen mit, oben am Hals",
    ],
    tab: `e|-----------------------------|
B|-----------------------------|
G|-7b9---7b9---7b9---7--9------|
D|-----------------------------|
A|-----------------------------|
E|-----------------------------|
   b = Ganzton ziehen (2 Bünde)`,
    why: "Beim Bending erzeugst du die Tonhöhe selbst, statt sie zu greifen. Ein Ganzton-Bending in Bund 7 muss exakt so klingen wie Bund 9 gegriffen — dazwischen ist es einfach falsch.",
    startBpm: 50,
    targetBpm: 100,
    beatsPerBar: 4,
    subdivision: 1,
  },

  // ------------------------------------------------------------------- riffs
  {
    id: "riff-ironclad",
    title: "Ironclad",
    kind: "riff",
    technique: "gallop",
    goal: "Gallop plus Lagenwechsel — das erste richtige Riff",
    cues: [
      "Palm Mute nur auf den E5-Gallops, G5 und F#5 klingen offen",
      "Der Wechsel muss im Tempo sitzen, nicht danach",
      "Erst eine Hälfte, dann die andere, dann zusammen",
    ],
    tab: `e|-------------------------------|
B|-------------------------------|
G|-------------------------------|
D|-2--2-2--2--2-2----5-----4-----|
A|-2--2-2--2--2-2----5-----4-----|
E|-0--0-0--0--0-0----3-----2-----|
   PM..............
   E5                G5    F#5`,
    why: "E5, G5 und F#5 kommen alle aus E-Moll. Das F#5 direkt vor der Wiederholung erzeugt Zug zurück zum E — dieselbe Spannung, die eine Kadenz auflöst, nur ohne Terzen.",
    startBpm: 70,
    targetBpm: 145,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "riff-chromatic-crawl",
    title: "Chromatic Crawl",
    kind: "riff",
    technique: "palm-mute",
    goal: "Offene Chugs gegen chromatische Zielnoten — Timing unter Druck",
    cues: [
      "Die offenen E bleiben gedämpft, die Zielnote klingt kurz auf",
      "Der Zeigefinger wandert, der Handballen bleibt liegen",
      "Kein Beschleunigen auf den Zielnoten",
    ],
    tab: `e|-------------------------------------|
B|-------------------------------------|
G|-------------------------------------|
D|-------------------------------------|
A|-------------------------------------|
E|-0-0-0-1---0-0-0-2---0-0-0-3---0-0-0-5|
   PM--------------------------------`,
    why: "Die Zielnoten 1, 2, 3, 5 über dem offenen E sind chromatische Durchgänge — sie gehören zu keiner Tonart. Genau das macht sie unruhig, und der Kontrast zur ruhenden offenen Saite ist der Effekt.",
    startBpm: 80,
    targetBpm: 160,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "riff-dirge",
    title: "Downpicked Dirge",
    kind: "riff",
    technique: "downpicking",
    goal: "Langsam, schwer, alles Abschlag — Timing ohne Versteck",
    cues: [
      "Jeder Ton voll ausklingen lassen, nichts hetzen",
      "Alle Anschläge nach unten, auch die langsamen",
      "Zwischen den Akkorden kurz abdämpfen",
    ],
    tab: `e|----------------------------|
B|----------------------------|
G|----------------------------|
D|-7--7--5--5--2--2--4--4-----|
A|-7--7--5--5--2--2--4--4-----|
E|-5--5--3--3--0--0--2--2-----|
   N  N  N  N  N  N  N  N
   A5    G5    E5    F#5`,
    why: "A5 – G5 – E5 – F#5 ist eine reine Quintenfolge in E-Moll. Bei langsamem Tempo hört man jeden Wechsel einzeln, deshalb fällt jede Ungenauigkeit im Timing sofort auf.",
    startBpm: 60,
    targetBpm: 130,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "riff-escape",
    title: "Escape Lick",
    kind: "riff",
    technique: "pentatonic",
    goal: "Erstes Lead-Lick: Pentatonik mit Bending am Ende",
    cues: [
      "Phrasierung vor Tempo — das Lick soll sprechen",
      "Das Bending am Ende bis zur Tonhöhe ziehen und halten",
      "Letzte Note mit Vibrato stehen lassen",
    ],
    tab: `e|-------------------------------|
B|--------------------8b10--8----|
G|--------------5--7----------7--|
D|--------5--7-------------------|
A|--5--7-------------------------|
E|-------------------------------|`,
    why: "Das Lick bleibt komplett in der A-Moll-Pentatonik. Das Bending am Ende zielt auf die Quinte — der stabilste Ton nach dem Grundton, deshalb wirkt es wie ein Schlusspunkt.",
    startBpm: 55,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    // Der einzige Drill, dessen Inhalt gerechnet wird — siehe lib/session/lead.ts.
    // `tab` und `why` bleiben hier leer: was hier stünde, wäre eine Behauptung
    // über ein Lick, das es noch nicht gibt.
    id: "riff-lead-pentatonik",
    title: "Lick-Schmiede",
    kind: "riff",
    technique: "pentatonic",
    goal: "Ein neues Lead-Lick aus der Pentatonik — bleibt, bis es sitzt",
    cues: [
      "Erst die Töne sicher, dann das Metronom dazu",
      "Gebundene Töne nicht anschlagen — das ist der halbe Lead-Sound",
      "Der letzte Ton wird gehalten: Vibrato bis zum Schluss",
    ],
    startBpm: 50,
    targetBpm: 130,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "tech-legato",
    title: "Hammer-on und Pull-off",
    kind: "technique",
    technique: "legato",
    goal: "Töne mit der Greifhand erzeugen, ohne die Anschlaghand",
    cues: [
      "Nur der erste Ton jeder Vierergruppe wird angeschlagen",
      "Hammer-on aus dem Fingergelenk, nicht aus dem Arm",
      "Beim Pull-off die Saite leicht zur Seite ziehen, nicht nur abheben",
    ],
    tab: `e|----------------------------------|
B|----------------------------------|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|-5h7p5--7h9p7--5h7p5--7h9p7-------|
   N      N      N      N`,
    why: "Ein Hammer-on ist ein Ton ohne Anschlag: die Saite schwingt schon, der Finger ändert nur ihre Länge. Deshalb klingt Legato weicher als angeschlagene Töne — es fehlt der Transient, und genau den hört das Ohr als Härte.",
    startBpm: 55,
    targetBpm: 130,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "tech-slides",
    title: "Slides",
    kind: "technique",
    technique: "slides",
    goal: "Lagenwechsel im Tempo, ohne den Ton zu verlieren",
    cues: [
      "Der Druck bleibt gleich, während der Finger wandert",
      "Ziel ist der Bund, nicht die Richtung — landen, nicht rutschen",
      "Erst langsam auf Zielsicherheit, dann aufs Tempo",
    ],
    tab: `e|----------------------------------|
B|----------------------------------|
G|----------------------------------|
D|----------------------------------|
A|-5/7----7\\5----5/9----9\\5--------|
E|----------------------------------|
   N     N      N     N`,
    why: "Ein Slide ist der einzige Weg, zwei Töne ohne Unterbrechung zu verbinden — dazwischen liegt jeder Bund, den er überstreicht. Deshalb trägt er über Lagenwechsel hinweg, wo ein neuer Anschlag die Linie zerschnitte.",
    startBpm: 55,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "tech-dead-notes",
    title: "Dead Notes",
    kind: "technique",
    technique: "dead-notes",
    goal: "Anschläge ohne Ton — die Lücken füllen, ohne den Klang zu trüben",
    cues: [
      "Greifhand liegt lose auf, drückt nicht auf den Bund",
      "Die Anschlaghand läuft durch, als wäre jeder Ton gleich",
      "Nur ein Klacken, kein Ton — sonst liegt der Finger zu fest",
    ],
    tab: `e|----------------------------------|
B|----------------------------------|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|-0-x-0-x--0-x-0-x--0-x-0-x--------|
   PM------------------------
   N V N V  N V N V  N V N V`,
    why: "Eine Dead Note ist ein Anschlag ohne Tonhöhe. Sie hält die Anschlaghand in gleichmässiger Bewegung, ohne dem Riff eine weitere Note hinzuzufügen — deshalb klingt ein Riff mit Dead Notes treibender, aber nicht voller.",
    startBpm: 60,
    targetBpm: 140,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "tech-tremolo",
    title: "Tremolo Picking",
    kind: "technique",
    technique: "tremolo",
    goal: "Sehr schneller Wechselschlag auf einer Saite, gleichmässig",
    cues: [
      "Bewegung aus dem Handgelenk, der Arm bleibt ruhig",
      "Plektrum flach halten und wenig eintauchen",
      "Gleichmässig schlägt schneller als schnell — Tempo kommt zuletzt",
    ],
    tab: `e|----------------------------------|
B|----------------------------------|
G|----------------------------------|
D|----------------------------------|
A|----------------------------------|
E|-0000000000000000--3333333333333333-|
   N V N V N V N V   N V N V N V N V`,
    why: "Beim Tremolo verschwindet der einzelne Anschlag und übrig bleibt eine Fläche. Genau deshalb tragen ganze Genres darauf: die Tonhöhe bleibt hörbar, der Rhythmus verschwindet, und das Riff wird zum Klangteppich statt zur Figur.",
    startBpm: 70,
    targetBpm: 180,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "riff-ghost",
    title: "Ghost Machine",
    kind: "riff",
    technique: "dead-notes",
    goal: "Dead Notes im Riff — Sechzehntel, von denen nur die Hälfte klingt",
    cues: [
      "Nur die Töne auf Schlag und Mitte klingen, die Nachschläge sind tot",
      "Der Handballen bleibt liegen, auch auf den toten Anschlägen",
      "Wenn es matscht, liegt die Greifhand zu fest",
    ],
    tab: `e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|-----------------5-x-5-x--------|
A|-----------------5-x-5-x--------|
E|-0-x-0-x-0-x-0-x-3-x-3-x--------|
   PM--------------------------
   E5               A5`,
    why: "Die toten Anschläge liegen genau da, wo bei durchgespielten Sechzehnteln ein Ton käme. Weil sie im Zeitraster nicht fehlen, hört man das Tempo weiter — nur eben ohne die Tonhöhe, und genau das erzeugt den Druck.",
    startBpm: 60,
    targetBpm: 150,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "riff-hammer",
    title: "Hammer Down",
    kind: "riff",
    technique: "legato",
    goal: "Legato aus der Leersaite heraus, im Riff-Kontext",
    cues: [
      "Der Hammer-on kommt aus der leeren Saite — kein zweiter Anschlag",
      "Der Powerchord danach muss sofort sitzen",
      "Die Leersaite darf nicht mitklingen, wenn der Akkord kommt",
    ],
    tab: `e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------7--------5--------|
A|--------------7--------5--------|
E|-0h3-0h5-0h3--5--0h3---3--------|
   N   N   N    N  N     N
                E5       D5`,
    why: "Aus der Leersaite heraus gehämmerte Töne kosten keinen Anschlag — die Anschlaghand hat Zeit, sich auf den nächsten Powerchord vorzubereiten. Deshalb lassen sich so Figuren spielen, die für einen reinen Wechselschlag zu schnell wären.",
    startBpm: 55,
    targetBpm: 130,
    beatsPerBar: 4,
    subdivision: 2,
  },
]

export const DRILLS_BY_ID: Record<string, Drill> = Object.fromEntries(
  DRILLS.map((drill) => [drill.id, drill]),
)

export function getDrill(id: string): Drill | undefined {
  return DRILLS_BY_ID[id]
}

/**
 * Nachschlagen über **beide** Kataloge.
 *
 * Der Übungs-Log kennt die Trennung nicht: dort steht eine Drill-Nummer, und
 * ob sie aus dem Hauptkatalog oder vom Sieben-Saiter kommt, ist ihm gleich.
 * Getrennt sind die Kataloge nur für die *Auswahl* — der Scheduler der
 * täglichen Viertelstunde soll nie eine Übung ziehen, für die eine zweite
 * Gitarre nötig ist. Wer einen Titel zu einem Log-Eintrag sucht, sucht hier.
 */
export const ALLE_DRILLS_BY_ID: Record<string, Drill> = Object.fromEntries(
  [...DRILLS, ...SIEBEN_DRILLS].map((drill) => [drill.id, drill]),
)
