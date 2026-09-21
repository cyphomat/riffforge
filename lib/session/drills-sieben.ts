import type { Drill } from "./types"

/**
 * Der Sieben-Saiter-Katalog — eigener Vorrat, eigene Nummern.
 *
 * Bewusst **nicht** in `DRILLS`: der Scheduler der täglichen Viertelstunde
 * soll nie eine Übung ziehen, für die man eine zweite Gitarre braucht. Wer
 * keine Siebensaitige hat, merkt von diesem Katalog nichts ausser dem
 * Geisterknopf auf *Heute*.
 *
 * Gestimmt ist **B Standard** (B-E-A-D-G-B-E): die tiefe B kommt unten dazu,
 * die sechs darüber bleiben, wie sie sind. Deshalb steht in jeder Tabulatur
 * eine siebte Zeile, und deshalb heisst die unterste Zeile `B`.
 *
 * Alle Übungen sind eigene Muster im jeweiligen Stil — keine abgeschriebenen
 * Tabs, wie im Rest der App.
 *
 * Die Tabulaturen sind spaltenweise gesetzt, damit die sieben Zeilen
 * zwangsläufig untereinander stehen; `__tests__/sieben.test.ts` rechnet
 * jede Behauptung über Töne gegen `lib/theory/sieben.ts` nach.
 */
export const SIEBEN_DRILLS: Drill[] = [
  // ---------------------------------------------------------------- warm-ups
  {
    id: "7-warmup-alle-sieben",
    title: "Alle Sieben",
    kind: "warmup",
    technique: "warmup",
    goal: "Die Anschlaghand lernt, dass der Hals unten weitergeht",
    cues: [
      "Nicht auf die Anschlaghand schauen — die Saite finden, nicht suchen",
      "Jeder Ton gleich laut, auch der tiefste",
      "Handballen wandert mit: was nicht klingt, wird gedämpft",
    ],
    tab: `e|-------------------5-------------------|
B|----------------5-----5----------------|
G|-------------5-----------5-------------|
D|----------5-----------------5----------|
A|-------5-----------------------5-------|
E|----5-----------------------------5----|
B|-5-----------------------------------5-|`,
    why: "Bund 5 einer Saite klingt wie die nächsthöhere leere Saite — auch bei der neuen: im fünften Bund der tiefen B liegt das E, dein bisher tiefster Ton. Die eine Ausnahme ist wie immer G nach B, dort ist es Bund 4.",
    startBpm: 60,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "7-warmup-quartensprung",
    title: "Quartensprung",
    kind: "warmup",
    technique: "warmup",
    goal: "Jede zweite Saite treffen, ohne hinzusehen",
    cues: [
      "Der Sprung geht aus dem Handgelenk, nicht aus dem Arm",
      "Die übersprungene Saite bleibt stumm — sie ist der eigentliche Prüfstein",
      "Erst treffen, dann schneller",
    ],
    tab: `e|----------7----------|
B|---------------------|
G|-------7-----7-------|
D|---------------------|
A|----7-----------7----|
E|---------------------|
B|-7-----------------7-|`,
    why: "Eine Saite zu überspringen sind zehn Halbtöne — zwei Quarten übereinander. Nur von G auf e sind es neun, weil dazwischen die B-Saite den halben Bund Versatz einführt, den du von der Sechssaitigen kennst.",
    startBpm: 55,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
  },

  // -------------------------------------------------------------- techniques
  {
    id: "7-tech-chug-b",
    title: "Chug auf B",
    kind: "technique",
    technique: "palm-mute",
    goal: "Die tiefe Saite trocken bekommen statt dumpf",
    cues: [
      "Mehr Handballen als auf der E — sonst dröhnt es",
      "Kurz und gleich lang: jeder Chug ein Schlag, kein Nachhall",
      "Wenn es matscht: Tempo runter und auf das Ende des Tons hören",
    ],
    tab: `e|------------------------|
B|------------------------|
G|------------------------|
D|------------------------|
A|------------------------|
E|------------------------|
B|-0--0--0--0--0--0--0--0-|
   PM-------------------`,
    why: "Die leere B schwingt mit knapp 62 Hz, die tiefe E mit gut 82 — eine Quarte tiefer heisst längere Wellen und mehr Nachschwingen. Derselbe Handballen, der auf der E einen trockenen Chug gibt, lässt die B noch klingen. Nicht deine Technik ist schlechter geworden, die Saite ist tiefer.",
    startBpm: 70,
    targetBpm: 160,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "7-tech-stille",
    title: "Stille auf der Sieben",
    kind: "technique",
    technique: "dead-notes",
    goal: "Die tiefe Saite zum Schweigen bringen, während oben gespielt wird",
    cues: [
      "Die Unterseite des Zeigefingers liegt auf der B — immer",
      "Die Sieben wird mitgeschlagen: sie darf klicken, nicht klingen",
      "Zwischendurch stoppen und hinhören, ob wirklich Ruhe ist",
    ],
    tab: `e|------------------------|
B|------------------------|
G|----7-----9-----7-----7-|
D|-7-----7-----7-----9----|
A|------------------------|
E|------------------------|
B|-x-----x-----x-----x----|
   x = anschlagen, darf nicht klingen`,
    why: "Eine tiefe Saite klingt auch mit, wenn du sie gar nicht anschlägst: die Nachbarsaite regt sie an, und unter Verzerrung reicht das für ein Brummen, das dein ganzes Riff zumatscht. Das ist der Unterschied, den Siebensaiter-Anfänger hören und nicht erklären können — gedämpft wird links, nicht rechts.",
    startBpm: 55,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "7-tech-powerchords-b",
    title: "Power Chords auf der Sieben",
    kind: "technique",
    technique: "power-chords",
    goal: "Grundton auf der tiefsten Saite, sauber und ohne Nebengeräusch",
    cues: [
      "Zeigefinger Grundton, Ringfinger zwei Bünde höher auf der E",
      "Beim Rutschen den Druck lösen, nicht die Hand abheben",
      "Die vier hohen Saiten liegen unter der Handfläche — die schweigen",
    ],
    tab: `e|------------|
B|------------|
G|------------|
D|------------|
A|------------|
E|-2--5--7--9-|
B|-0--3--5--7-|
   B5 D5 E5 F#5`,
    why: "Grundton plus Quinte sind sieben Halbtöne, also zwei Bünde weiter auf der nächsthöheren Saite — dieselbe Form wie unten auf der E-Saite, nur eine Saite tiefer. Die Griffbilder wandern unverändert mit, weil der Abstand zwischen B und E dieselbe Quarte ist wie zwischen E und A.",
    startBpm: 60,
    targetBpm: 150,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "7-tech-gallop-b",
    title: "Gallop auf B",
    kind: "technique",
    technique: "gallop",
    goal: "Die Gallop-Figur auf der tiefsten Saite, ohne dass sie verschmiert",
    cues: [
      "Zähle 'taa-ta-ta' auf jeden Klick",
      "Abschlag – Abschlag – Aufschlag",
      "Die zwei Sechzehntel kürzer greifen als auf der E, sonst laufen sie ineinander",
    ],
    tab: `e|--------------------------------------|
B|--------------------------------------|
G|--------------------------------------|
D|--------------------------------------|
A|--------------------------------------|
E|--------------------------------------|
B|-0--0-0---0--0-0---0--0-0---0--0-2----|
   PM--------------------------------
   N  N V   N  N V   N  N V   N  N V`,
    why: "Dieselbe Figur wie auf der Sechssaitigen, und trotzdem schwerer: je tiefer die Saite, desto länger braucht sie, bis der Ton steht. Die zwei Sechzehntel sind kürzer als diese Ansprechzeit — deshalb hört man auf der tiefen B jede Ungenauigkeit, die auf der E noch durchging.",
    startBpm: 60,
    targetBpm: 140,
    beatsPerBar: 4,
    subdivision: 1,
  },
  {
    id: "7-tech-pentatonik-keller",
    title: "Pentatonik in den Keller",
    kind: "technique",
    technique: "pentatonic",
    goal: "Die vertraute Box um die siebte Saite verlängern",
    cues: [
      "Dieselbe Form wie oben: Zeigefinger 5, kleiner Finger 8",
      "Den Umstieg auf die neue Saite nicht beschleunigen",
      "Rückweg genauso sauber wie der Hinweg",
    ],
    tab: `e|-------------------------------------5--8-|
B|-------------------------------5--8-------|
G|-------------------------5--7-------------|
D|-------------------5--7-------------------|
A|-------------5--7-------------------------|
E|-------5--8-------------------------------|
B|-5--8-------------------------------------|`,
    why: "Die A-Moll-Pentatonik, Box 1 — dieselbe, die du kennst, nur unten um zwei Töne länger: auf der B liegen im fünften und achten Bund E und G, beide gehören zur Tonleiter. Die Form wandert unverändert weiter, weil die Sieben zur E dieselbe Quarte ist wie die E zur A.",
    startBpm: 55,
    targetBpm: 140,
    beatsPerBar: 4,
    subdivision: 1,
  },

  // ------------------------------------------------------------------- riffs
  {
    id: "7-riff-tieferlegung",
    title: "Tieferlegung",
    kind: "riff",
    technique: "palm-mute",
    goal: "Gedämpfte Chugs unten gegen offene Power Chords",
    cues: [
      "Die Chugs gedämpft, die Akkorde klingen lassen — der Wechsel ist die Übung",
      "Der Handballen geht hoch und runter, die Griffhand bleibt ruhig",
      "Auf die Eins des Akkords hören: sie darf nicht zu spät kommen",
    ],
    tab: `e|------------------------------|
B|------------------------------|
G|------------------------------|
D|------------------------------|
A|------------------------------|
E|-------------5--5--------7--7-|
B|-0--0--0--0--3--3--0--0--5--5-|
   PM---------                PM---`,
    why: "Das Riff steht in B-Moll: die leere Sieben ist der Grundton, D und E darüber sind die Stufen drei und vier. Genau dafür ist die Gitarre gebaut — auf der Sechssaitigen müsstest du dasselbe eine Quarte höher spielen oder tiefer stimmen.",
    startBpm: 60,
    targetBpm: 140,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "7-riff-wechselbad",
    title: "Wechselbad",
    kind: "riff",
    technique: "alternate-picking",
    goal: "Zwischen tiefster Saite und Mittellage springen, ohne dass es brummt",
    cues: [
      "Die Chugs kurz, die Figur oben klar — zwei Klangfarben in einem Riff",
      "Beim Sprung nach oben liegt sofort etwas auf der B",
      "Langsam genug, dass der Sprung nicht rumpelt",
    ],
    tab: `e|------------------------------------------------|
B|------------------------------------------------|
G|----------7--------9--------------7-------------|
D|-------7--------------7--------7----------------|
A|------------------------------------------------|
E|------------------------------------------------|
B|-0--0--------0--0--------0--0--------0--3--0--0-|`,
    why: "Die Figur oben liegt auf A, D und E — in B-Moll die Stufen sieben, drei und vier. Der Reiz ist der Abstand: zwischen dem tiefsten und dem höchsten Ton des Riffs liegen mehr als zwei Oktaven, und genau dieser Sprung ist auf sieben Saiten die typische Bewegung.",
    startBpm: 55,
    targetBpm: 130,
    beatsPerBar: 4,
    subdivision: 2,
  },
  {
    id: "7-riff-erdgeschoss",
    title: "Erdgeschoss",
    kind: "riff",
    technique: "pentatonic",
    goal: "Eine Lead-Figur, die unten aus der Box herausfällt",
    cues: [
      "Der letzte Ton wird gehalten, mit Vibrato",
      "Die Töne auf der Sieben genauso singen lassen wie oben",
      "Nicht hetzen: tief gespielte Leads brauchen mehr Platz",
    ],
    tab: `e|------------------------------------------|
B|------------------------------------------|
G|------------------------------------------|
D|----------------------------------5-------|
A|-7--5-----------------------5--7-----7----|
E|-------8--5-----------5--8----------------|
B|-------------8--5--8--------------------5-|
                                          ~~~`,
    why: "Dieselbe A-Moll-Pentatonik wie oben, aber die Phrase läuft nach unten aus der gewohnten Box heraus und löst auf dem E der tiefen Saite auf. Tiefe Leads klingen nur dann nicht nach Gebrumm, wenn jeder Ton ausgespielt wird — deshalb hier weniger Noten als in derselben Figur eine Oktave höher.",
    startBpm: 50,
    targetBpm: 120,
    beatsPerBar: 4,
    subdivision: 1,
  },
]

export const SIEBEN_DRILLS_BY_ID: Record<string, Drill> = Object.fromEntries(
  SIEBEN_DRILLS.map((drill) => [drill.id, drill]),
)
