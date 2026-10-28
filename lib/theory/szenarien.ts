import type { TheoryCard } from "./types"

/**
 * Szenario-Karten: Wissen anwenden statt wiedererkennen.
 *
 * "Du greifst ein Barré im 5. Bund und der Song kippt nach Moll — was änderst
 * du?" fragt nicht nach dem Wort Terz, sondern danach, was man mit ihr macht.
 * Das ist die Frage, die am Instrument tatsächlich kommt.
 *
 * Ein eigener Katalog, nicht Teil von `THEORY_CARDS`: Die Zählungen des
 * Wissen-Bildschirms (Begonnen, Stufenlisten) und die Fragen in der Session
 * bleiben unberührt. Szenarien kommen nur in die Transfer-Runde
 * (`transfer.ts`), die sie quer über alle Stufen mischt. Ihre Antworten laufen
 * trotzdem durch denselben Log und denselben FSRS-Stand wie alle anderen.
 *
 * Vorbild sind die Karten `rf-t01` bis `rf-t12` aus Roadie, neu gesetzt:
 * Töne englisch (B ist der Ton über A), "ss" statt "ß" wie im übrigen
 * Katalog, der 15. Bund durch den 12. ersetzt (der Hals hat zwölf), und die
 * richtige Antwort liegt an wechselnder Stelle — Roadie legte sie überall an
 * die erste, und eine Auswahl, deren Antwort immer oben steht, ist keine.
 * Was die Erklärungen behaupten, rechnet `szenarien.test.ts` nach.
 */
export const SZENARIO_KARTEN: TheoryCard[] = [
  {
    id: "rf-t01",
    stufe: 1,
    begriff: "Nach Gehör stimmen",
    erklaerung:
      "Zwischen D- und G-Saite liegt eine Quarte, also 5 Bünde. Die 4 Bünde gelten nur von der G- zur B-Saite.",
    frage: {
      art: "auswahl",
      text: "Du stimmst nach Gehör. Die D-Saite sitzt. In welchem Bund der D-Saite greifst du den Vergleichston für die leere G-Saite?",
      auswahl: ["4. Bund", "3. Bund", "5. Bund", "7. Bund"],
      richtig: ["5. Bund"],
    },
  },
  {
    id: "rf-t07",
    stufe: 1,
    begriff: "Eine Oktave tiefer",
    erklaerung:
      "Zwölf Bünde sind eine Oktave: Der 12. Bund klingt wie die leere Saite, nur eine Etage höher. Eine Oktave nach unten heisst deshalb zwölf Bünde zurück, hier bis zur leeren Saite.",
    frage: {
      art: "auswahl",
      text: "Eine Linie liegt auf der tiefen E-Saite im 12. Bund. Dein Sänger singt tiefer, du rückst sie auf derselben Saite eine Oktave nach unten. Wohin?",
      auswahl: ["5. Bund", "Leere Saite", "7. Bund", "3. Bund"],
      richtig: ["Leere Saite"],
    },
  },
  {
    id: "rf-t02",
    stufe: 2,
    begriff: "Powerchord über den Knick",
    erklaerung:
      "Zwischen G- und B-Saite liegt eine grosse Terz statt einer Quarte, der Abstand ist einen Halbton kleiner. Derselbe Griff ergibt dort 6 statt 7 Halbtöne. Für eine Quinte rückt der obere Ton einen Bund höher.",
    frage: {
      art: "auswahl",
      text: "Du schiebst deinen Powerchord-Griff (Quinte zwei Bünde höher auf der nächsten Saite) von der A/D-Saite auf die G/B-Saite. Welches Intervall hörst du jetzt?",
      auswahl: ["Tritonus", "Quinte", "Quarte", "grosse Sexte"],
      richtig: ["Tritonus"],
    },
  },
  {
    id: "rf-t08",
    stufe: 2,
    begriff: "Quinte umgekehrt",
    erklaerung:
      "Das ist die Umkehrung: Aus der Quinte wird eine Quarte. Intervall und Umkehrung ergeben zusammen immer zwölf Halbtöne.",
    frage: {
      art: "auswahl",
      text: "Du spielst das A und legst die Quinte E nicht darüber, sondern darunter. Welches Intervall liegt jetzt zwischen den beiden Tönen?",
      auswahl: ["Quarte", "Quinte", "grosse Terz", "Oktave"],
      richtig: ["Quarte"],
    },
  },
  {
    id: "rf-t03",
    stufe: 3,
    begriff: "Moll mit ♭2",
    erklaerung:
      "Phrygisch ist natürliches Moll mit ♭2, hier das F über E. Lokrisch hätte zusätzlich eine verminderte Quinte, die B fehlt dort.",
    frage: {
      art: "auswahl",
      text: "Über einem E-Moll-Riff macht ein F statt F# die Stimmung bedrohlicher, die Quinte B bleibt. Welche Tonleiter spielst du?",
      auswahl: ["E-Dorisch", "E-Lokrisch", "E harmonisch Moll", "E-Phrygisch"],
      richtig: ["E-Phrygisch"],
    },
  },
  {
    id: "rf-t09",
    stufe: 3,
    begriff: "Die Blue Note",
    erklaerung:
      "Der Tritonus ♭5 macht aus der Moll-Pentatonik die Blues-Tonleiter. Er trägt keine eigene Ruhe und klingt festgehalten schnell schief.",
    frage: {
      art: "auswahl",
      text: "Du spielst die A-Moll-Pentatonik (A, C, D, E, G) und nimmst zwischen D und E im Vorbeigehen einen Blues-Ton dazu. Welchen?",
      auswahl: ["F (♭6)", "Eb (♭5)", "B (2)", "F# (6)"],
      richtig: ["Eb (♭5)"],
    },
  },
  {
    id: "rf-t10",
    stufe: 4,
    begriff: "Akkord abspecken",
    erklaerung:
      "Die Quinte färbt kaum und steckt als Oberton ohnehin im Grundton. Die Terz entscheidet über Moll und bleibt.",
    frage: {
      art: "auswahl",
      text: "Du greifst Am7 (A, C, E, G), aber die Hand kommt nicht an alle vier Töne. Welchen lässt du zuerst weg?",
      auswahl: ["Das E (Quinte)", "Das C (Terz)", "Das G (Septime)", "Das A (Grundton)"],
      richtig: ["Das E (Quinte)"],
    },
  },
  {
    id: "rf-t04",
    stufe: 4,
    begriff: "Von Dur nach Moll im Barré",
    erklaerung:
      "Moll entsteht, wenn die Terz einen Bund tiefer liegt. Grundton und Quinte bleiben. Bei der E-Form fällt dafür der Finger auf der G-Saite weg.",
    frage: {
      art: "auswahl",
      text: "Du greifst ein E-Form-Barré im 5. Bund (A-Dur). Der Song kippt nach Moll. Was änderst du am Griff?",
      auswahl: [
        "Das Barré einen Bund tiefer setzen",
        "Finger von der G-Saite nehmen",
        "Die B-Saite einen Bund höher greifen",
        "Die tiefe E-Saite weglassen",
      ],
      richtig: ["Finger von der G-Saite nehmen"],
    },
  },
  {
    id: "rf-t05",
    stufe: 5,
    begriff: "Gallop im Wechselschlag",
    erklaerung:
      "Üblich ist Abschlag, Abschlag, Aufschlag. Die Hand läuft im Sechzehntel-Raster durch, die Stelle ohne Note ist ein Luftschlag.",
    frage: {
      art: "auswahl",
      text: "Du spielst einen Gallop (Achtel, dann zwei Sechzehntel) in strengem Wechselschlag. Die Achtel ist ein Abschlag. Wie schlägst du die beiden Sechzehntel an?",
      auswahl: ["Ab, Ab", "Auf, Ab", "Ab, Auf", "Auf, Auf"],
      richtig: ["Ab, Auf"],
    },
  },
  {
    id: "rf-t11",
    stufe: 5,
    begriff: "Half-Time-Feel",
    erklaerung:
      "Beim Half-Time-Feel kommt die Betonung halb so oft, ohne dass ein Schlag langsamer wird. Das ist der übliche Trick vor einem Breakdown.",
    frage: {
      art: "auswahl",
      text: "Vor dem Breakdown legt der Drummer die Snare von Zwei und Vier auf die Drei. Das Metronom läuft unverändert. Was passiert mit deinem Riff?",
      auswahl: [
        "Das Tempo halbiert sich, du spielst langsamer",
        "Es wird zum Dreiertakt",
        "Jede Note wird doppelt angeschlagen",
        "Es wirkt doppelt so schwer, das Tempo bleibt",
      ],
      richtig: ["Es wirkt doppelt so schwer, das Tempo bleibt"],
    },
  },
  {
    id: "rf-t06",
    stufe: 6,
    begriff: "Riff nach Drop D",
    erklaerung:
      "In Drop D liegen Grundton und Quinte im selben Bund, Bund 2 ist E5. Beide Saiten leer ergäben D5.",
    frage: {
      art: "auswahl",
      text: "Du übernimmst ein Riff mit E5 aus der Standardstimmung (leere tiefe E-Saite plus A-Saite im 2. Bund) nach Drop D. Wie greifst du denselben Klang?",
      auswahl: [
        "Beide tiefen Saiten leer lassen",
        "Tiefe Saite leer, A-Saite im 2. Bund",
        "Tiefe Saite im 2. Bund, A-Saite im 4. Bund",
        "Beide im 2. Bund, ein Finger quer",
      ],
      richtig: ["Beide im 2. Bund, ein Finger quer"],
    },
  },
  {
    id: "rf-t12",
    stufe: 6,
    begriff: "Bending auf den Grundton",
    erklaerung:
      "Die kleine Septime einen Ganzton hoch ergibt den Grundton. Die Quarte käme bei der Quinte an. Beide Ziele sind stabil und klingen wie ein Schlusspunkt.",
    frage: {
      art: "auswahl",
      text: "Dein Solo in A-Moll-Pentatonik soll mit einem Bending auf dem Grundton A enden. Welchen Ton ziehst du dafür einen Ganzton hoch?",
      auswahl: ["D (4)", "E (5)", "G (♭7)", "C (♭3)"],
      richtig: ["G (♭7)"],
    },
  },
]
