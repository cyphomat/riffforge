import { positionsOf, positionsOfInterval, stufeInLage } from "./fretboard"
import type { Griff, TheoryCard } from "./types"

/**
 * Der Katalog, Stufe 1 und 2.
 *
 * Jeder Eintrag ist ein Begriff, eine Erklärung von zwei bis drei Sätzen und
 * eine Frage. Der Text ist das, was **nach** der Antwort kommt — Abfragen
 * behält sich besser als Nachlesen, und deshalb steht hier keine Lektion mit
 * einem Quiz daneben.
 *
 * Alles selbst geschrieben, im jeweiligen Stil, ohne abgeschriebene Tabs —
 * dieselbe Regel wie für die Drills.
 *
 * Die richtigen Antworten auf dem Griffbrett sind **gerechnet**, nicht
 * getippt: `positionsOf` und `positionsOfInterval` liefern jede Stelle, an der
 * der gesuchte Ton liegt. Wer eine davon trifft, hat recht — auf der Gitarre
 * hat derselbe Ton bis zu sechs Orte, und nur den nächstgelegenen gelten zu
 * lassen wäre schlicht falsch.
 */

const griff = (saite: number, bund: number) => ({ saite, bund }) as Griff

export const THEORY_CARDS: TheoryCard[] = [
  // ─────────────────────────────────────────────── Stufe 1: Das Material
  {
    id: "m-halbton",
    stufe: 1,
    begriff: "Halbton und Ganzton",
    erklaerung:
      "Ein Bund ist ein Halbton — der kleinste Schritt, den die Gitarre kennt. Ein Ganzton sind zwei Bünde. Jede Tonleiter, jeder Akkord und jedes Riff ist am Ende nur eine bestimmte Folge dieser beiden Schritte, und deshalb lohnt es sich, sie nicht als Theorie zu behandeln, sondern als Entfernung auf dem Hals.",
    frage: {
      art: "eingabe",
      text: "Wie viele Bünde ist ein Ganzton?",
      richtig: ["2", "zwei"],
    },
  },
  {
    id: "m-chromatisch",
    stufe: 1,
    begriff: "Die zwölf Töne",
    erklaerung:
      "Zwischen einem Ton und demselben Ton eine Oktave höher liegen zwölf Halbtöne. Danach fängt alles von vorn an, nur höher. Auf der Gitarre heisst das: was du am 3. Bund spielst, findest du am 15. wieder.",
    frage: {
      art: "eingabe",
      text: "Wie viele verschiedene Töne gibt es, bevor sich alles wiederholt?",
      richtig: ["12", "zwölf", "zwoelf"],
    },
  },
  {
    id: "m-stammtoene",
    stufe: 1,
    begriff: "Wo die Halbtonschritte sitzen",
    erklaerung:
      "Die Stammtöne heissen C D E F G A B. Zwischen ihnen liegt überall ein Ganzton — ausser zwischen E und F und zwischen B und C, da ist es nur ein Halbton. Das ist der Grund, warum die weissen Tasten am Klavier ungleich verteilt wirken, und auf dem Griffbrett der Grund, warum manche Töne direkt nebeneinander liegen.",
    frage: {
      art: "auswahl",
      text: "Zwischen welchen beiden Paaren liegt nur ein Halbton?",
      auswahl: ["E–F und B–C", "C–D und G–A", "F–G und A–B", "D–E und G–A"],
      richtig: ["E–F und B–C"],
    },
  },
  {
    id: "m-h-oder-b",
    stufe: 1,
    begriff: "B oder H",
    erklaerung:
      "Diese App schreibt die Töne englisch, wie jede Tabulatur: der Ton über A heisst B. Deutsche Notenhefte nennen ihn H und vergeben das B an den Ton einen Halbton darunter — englisch A# oder Bb. Wer beides mischt, greift irgendwann den falschen Ton und sucht lange nach dem Grund.",
    frage: {
      art: "eingabe",
      text: "Ein deutsches Notenheft schreibt „H“. Wie heisst dieser Ton in einer Tabulatur?",
      richtig: ["B"],
      woertlich: true,
    },
  },
  {
    id: "m-oktave",
    stufe: 1,
    begriff: "Oktave",
    erklaerung:
      "Zwei Töne im Oktavabstand tragen denselben Namen und klingen wie derselbe Ton in zwei Höhen — die Schwingung ist genau doppelt so schnell. Deshalb kannst du ein Riff eine Oktave höher spielen, und es bleibt dasselbe Riff.",
    frage: {
      art: "eingabe",
      text: "Wie viele Halbtöne umfasst eine Oktave?",
      richtig: ["12", "zwölf", "zwoelf"],
    },
  },
  {
    id: "m-leersaiten",
    stufe: 1,
    begriff: "Die sechs Leersaiten",
    erklaerung:
      "In Standardstimmung heissen die Saiten von der dicksten zur dünnsten E A D G B e. Die tiefe und die hohe heissen beide E — sie liegen zwei Oktaven auseinander. Merken lohnt sich, weil fast jede Bezeichnung auf dem Hals von hier aus gezählt wird.",
    frage: {
      art: "eingabe",
      text: "Wie heisst die zweitdickste Saite in Standardstimmung?",
      richtig: ["A"],
    },
  },
  {
    id: "m-e-saite",
    stufe: 1,
    begriff: "Töne auf der tiefen E-Saite",
    erklaerung:
      "Auf der tiefen E-Saite liegen die Grundtöne der meisten Powerchords. Drei Marken reichen als Gerüst: 3. Bund G, 5. Bund A, 7. Bund B. Der Rest ergibt sich durch Zählen in Halbtönen.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt G auf der tiefen E-Saite?",
      richtig: [griff(6, 3)],
    },
  },
  {
    id: "m-a-saite",
    stufe: 1,
    begriff: "Töne auf der A-Saite",
    erklaerung:
      "Die A-Saite trägt die zweite Hälfte der Powerchord-Grundtöne. Auch hier drei Marken: 3. Bund C, 5. Bund D, 7. Bund E. Mit E- und A-Saite zusammen findest du jeden gebräuchlichen Grundton, ohne zu suchen.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt D auf der A-Saite?",
      richtig: [griff(5, 5)],
    },
  },
  {
    id: "m-bund-halbton",
    stufe: 1,
    begriff: "Ein Bund weiter",
    erklaerung:
      "Jeder Bund höher ist genau ein Halbton höher — egal auf welcher Saite, egal an welcher Stelle des Halses. Das klingt banal, ist aber der Grund, warum sich auf der Gitarre jede Form verschieben lässt und dabei richtig bleibt.",
    frage: {
      art: "griffbrett",
      text: "Die A-Saite leer klingt A. Wo liegt A#, also einen Halbton höher, auf derselben Saite?",
      richtig: [griff(5, 1)],
    },
  },
  {
    id: "m-zwoelfter",
    stufe: 1,
    begriff: "Der 12. Bund",
    erklaerung:
      "Am 12. Bund ist die Saite genau halbiert, und dort beginnt alles von vorn: derselbe Ton wie leer, eine Oktave höher. Deshalb tragen fast alle Gitarren dort eine doppelte Einlage — es ist die Mitte des Halses, nicht nur eine Markierung unter vielen.",
    frage: {
      art: "griffbrett",
      text: "Die tiefe E-Saite leer klingt E. Wo liegt dasselbe E eine Oktave höher auf derselben Saite?",
      richtig: [griff(6, 12)],
    },
  },
  {
    id: "m-oktavform",
    stufe: 1,
    begriff: "Die Oktavform",
    erklaerung:
      "Von einem Ton auf der E- oder A-Saite aus liegt derselbe Ton zwei Saiten höher und zwei Bünde weiter. Diese eine Form spart das Auswendiglernen des halben Halses: Grundton finden, Form anwenden, fertig.",
    frage: {
      art: "griffbrett",
      text: "Auf der A-Saite im 5. Bund liegt D. Zeig dasselbe D auf der D- oder G-Saite.",
      gegeben: [griff(5, 5)],
      richtig: positionsOfInterval(griff(5, 5), 12).filter(
        (stelle) => stelle.saite === 4 || stelle.saite === 3,
      ),
    },
  },
  {
    id: "m-enharmonik",
    stufe: 1,
    begriff: "Zwei Namen, ein Bund",
    erklaerung:
      "F# und Gb sind derselbe Bund. Welcher Name richtig ist, hängt an der Tonart — man will in einer Tonleiter jeden Buchstaben genau einmal verwenden. Fürs Greifen ist es egal, fürs Aufschreiben nicht.",
    frage: {
      art: "auswahl",
      text: "Welcher Ton liegt auf demselben Bund wie G#?",
      auswahl: ["Ab", "Gb", "G", "A"],
      richtig: ["Ab"],
    },
  },

  // ─────────────────────────────────────────────────── Stufe 2: Intervalle
  {
    id: "i-was",
    stufe: 2,
    begriff: "Was ein Intervall ist",
    erklaerung:
      "Ein Intervall ist der Abstand zwischen zwei Tönen, gemessen in Halbtönen. Nicht die Töne selbst tragen den Charakter, sondern ihr Abstand: dieselbe Form klingt überall auf dem Hals gleich, nur höher oder tiefer. Deshalb ist das Griffbrett vor allem eine Karte von Abständen.",
    frage: {
      art: "eingabe",
      text: "Worin wird ein Intervall gemessen?",
      richtig: ["Halbtöne", "Halbtönen", "Halbton", "Halbtoene", "Halbtoenen"],
    },
  },
  {
    id: "i-terz",
    stufe: 2,
    begriff: "Die Terz entscheidet",
    erklaerung:
      "Vier Halbtöne über dem Grundton liegt die grosse Terz, drei Halbtöne die kleine. Dieser eine Halbton ist der Unterschied zwischen Dur und Moll — mehr braucht es nicht, damit ein Akkord hell oder düster klingt.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Terz?",
      auswahl: ["3", "4", "2", "5"],
      richtig: ["3"],
    },
  },
  {
    id: "i-quinte",
    stufe: 2,
    begriff: "Die Quinte",
    erklaerung:
      "Sieben Halbtöne über dem Grundton liegt die Quinte — nach der Oktave der stabilste Abstand überhaupt. Sie ist der zweite Ton jedes Powerchords, und weil sie so wenig Eigenfarbe hat, überlebt sie jede Verzerrung.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig die Quinte dazu auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 7).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "i-quinte-form",
    stufe: 2,
    begriff: "Die Quintform",
    erklaerung:
      "Eine Saite höher und zwei Bünde weiter — das ist die Quinte, und zwar überall auf dem Hals gleich. Genau diese Form greift die Hand beim Powerchord, ohne dass man sie je bewusst gelernt hätte.",
    frage: {
      art: "eingabe",
      text: "Wie viele Bünde weiter liegt die Quinte, wenn du eine Saite höher gehst?",
      richtig: ["2", "zwei"],
    },
    technique: "power-chords",
  },
  {
    id: "i-tritonus",
    stufe: 2,
    begriff: "Tritonus",
    erklaerung:
      "Sechs Halbtöne — genau die halbe Oktave, und der einzige Abstand, der sich selbst umkehrt. Er hat keine Auflösungsrichtung und klingt deshalb ungelöst; im Metal ist das kein Makel, sondern das Werkzeug.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig den Tritonus dazu auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 6).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "i-sekunde",
    stufe: 2,
    begriff: "Die Sekunde",
    erklaerung:
      "Ein Halbton ist die kleine Sekunde, zwei die grosse. Die kleine ist der schärfste Reibungsabstand, den es gibt — im Phrygischen sitzt sie direkt über dem Grundton und macht dort die ganze Drohung.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Sekunde?",
      auswahl: ["1", "2", "3", "0"],
      richtig: ["1"],
    },
  },
  {
    id: "i-quarte",
    stufe: 2,
    begriff: "Die Quarte",
    erklaerung:
      "Fünf Halbtöne. Auf der Gitarre ist sie überall dort versteckt, wo zwei benachbarte Leersaiten zusammenklingen — E zu A, A zu D, D zu G sind alle Quarten. Genau deshalb liegen Formen auf diesen Saitenpaaren immer gleich.",
    frage: {
      art: "auswahl",
      text: "Welches Intervall liegt zwischen der leeren A-Saite und der leeren D-Saite?",
      auswahl: ["Quarte", "Quinte", "grosse Terz", "Tritonus"],
      richtig: ["Quarte"],
    },
  },
  {
    id: "i-septime",
    stufe: 2,
    begriff: "Die kleine Septime",
    erklaerung:
      "Zehn Halbtöne über dem Grundton. Sie klingt offen und ungelöst, ohne scharf zu sein — der Grund, warum sie in fast jeder Moll- und Bluesskala vorkommt und warum ein Riff mit ♭7 nach Rock klingt statt nach Kirchenlied.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Septime?",
      auswahl: ["10", "11", "9", "12"],
      richtig: ["10"],
    },
  },
  {
    id: "i-umkehrung",
    stufe: 2,
    begriff: "Umkehrung",
    erklaerung:
      "Nimmst du den unteren Ton eines Intervalls eine Oktave höher, wird aus der Quinte eine Quarte und aus der grossen Terz eine kleine Sexte. Zusammen ergeben Intervall und Umkehrung immer zwölf Halbtöne. Deshalb muss man nur die Hälfte wirklich lernen.",
    frage: {
      art: "auswahl",
      text: "Was wird aus einer Quinte, wenn man sie umkehrt?",
      auswahl: ["Quarte", "Quinte", "kleine Terz", "grosse Sexte"],
      richtig: ["Quarte"],
    },
  },
  {
    id: "i-knick",
    stufe: 2,
    begriff: "Der Knick zur B-Saite",
    erklaerung:
      "Fünf der sechs Saiten liegen eine Quarte auseinander — nur zwischen der G- und der B-Saite ist es eine grosse Terz. Deshalb wandert jede Form, die diese beiden Saiten überspannt, um einen Bund. Es ist die einzige Ausnahme auf dem ganzen Hals, und sie erklärt fast jeden Griff, der sich falsch anfühlt.",
    frage: {
      art: "auswahl",
      text: "Zwischen welchen beiden Saiten liegt keine Quarte?",
      auswahl: ["G und B", "A und D", "D und G", "B und e"],
      richtig: ["G und B"],
    },
  },
  {
    id: "i-oktavform-hoch",
    stufe: 2,
    begriff: "Oktave über den Knick",
    erklaerung:
      "Die Oktavform von der D-Saite aus liegt zwei Saiten höher und drei Bünde weiter, nicht zwei — weil der Weg über die B-Saite führt. Dieselbe Form, ein Bund verschoben: das ist der Knick in der Praxis.",
    frage: {
      art: "griffbrett",
      text: "Auf der D-Saite im 5. Bund liegt G. Zeig dasselbe G auf der B-Saite.",
      gegeben: [griff(4, 5)],
      richtig: positionsOf("G").filter((stelle) => stelle.saite === 2 && stelle.bund <= 12),
    },
  },
  {
    id: "i-messen",
    stufe: 2,
    begriff: "Ein Intervall abzählen",
    erklaerung:
      "Wenn du den Namen nicht weisst, zähl die Bünde. Beide Töne auf dieselbe Saite gedacht, Bünde zählen, fertig — die Zahl ist das Intervall. Das ist langsam, aber es geht immer, und mit der Zeit erkennt das Auge die Form vor dem Zählen.",
    frage: {
      art: "auswahl",
      text: "Vom 3. zum 10. Bund derselben Saite: welches Intervall ist das?",
      auswahl: ["Quinte", "Quarte", "kleine Sexte", "grosse Sexte"],
      richtig: ["Quinte"],
    },
  },
  // ─────────────────────────────────────────────────── Stufe 3: Tonleitern
  {
    id: "s-dur",
    stufe: 3,
    begriff: "Die Dur-Tonleiter",
    erklaerung:
      "Sieben Töne in einem festen Muster aus Ganz- und Halbtonschritten: Ganz Ganz Halb Ganz Ganz Ganz Halb. Das ist keine willkürliche Auswahl, sondern das Raster, aus dem fast alles Weitere folgt — Tonarten, Akkorde, Stufen. Wer es einmal auf dem Hals abzählen kann, braucht es nie wieder auswendig.",
    frage: {
      art: "auswahl",
      text: "Wie lautet das Schrittmuster der Dur-Tonleiter?",
      auswahl: ["G G H G G G H", "G H G G H G G", "G G G H G G H", "H G G G H G G"],
      richtig: ["G G H G G G H"],
    },
  },
  {
    id: "s-stufen",
    stufe: 3,
    begriff: "Stufenzahlen",
    erklaerung:
      "Statt Tonnamen zählen Musiker Stufen: 1 ist der Grundton, 5 die Quinte, ♭3 die kleine Terz. Der Vorteil ist, dass die Beschreibung in jeder Tonart gilt — eine Moll-Tonleiter ist immer 1 2 ♭3 4 5 ♭6 ♭7, egal ob sie auf A oder auf F# steht.",
    frage: {
      art: "eingabe",
      text: "Wie schreibt man die kleine Terz als Stufe?",
      richtig: ["b3", "♭3"],
    },
  },
  {
    id: "s-moll",
    stufe: 3,
    begriff: "Natürliches Moll",
    erklaerung:
      "1 2 ♭3 4 5 ♭6 ♭7 — dieselben sieben Töne wie eine Dur-Tonleiter, nur von einer anderen Stufe aus gezählt. Drei Töne liegen tiefer als in Dur, und die ♭3 trägt den grössten Teil der düsteren Farbe.",
    frage: {
      art: "eingabe",
      text: "Wie ist natürliches Moll in Stufen gebaut?",
      richtig: ["1 2 b3 4 5 b6 b7", "1 2 ♭3 4 5 ♭6 ♭7"],
    },
  },
  {
    id: "s-parallel",
    stufe: 3,
    begriff: "Paralleltonart",
    erklaerung:
      "Jede Dur-Tonart hat eine Moll-Tonart mit genau denselben Tönen, drei Halbtöne tiefer: C-Dur und a-Moll, G-Dur und e-Moll. Was sie unterscheidet, ist nur, welcher Ton sich wie ein Zuhause anfühlt.",
    frage: {
      art: "eingabe",
      text: "Welche Moll-Tonart hat dieselben Töne wie C-Dur?",
      richtig: ["a", "a-moll", "am", "A", "A-Moll"],
    },
  },
  {
    id: "s-pentatonik",
    stufe: 3,
    begriff: "Moll-Pentatonik",
    erklaerung:
      "Fünf Töne: 1 ♭3 4 5 ♭7. Es ist natürliches Moll ohne die zwei Stufen, an denen man sich vergreifen kann — deshalb klingt fast alles daraus brauchbar, und deshalb steht sie unter neunzig Prozent aller Rock- und Metal-Soli.",
    frage: {
      art: "eingabe",
      text: "Welche Stufen bilden die Moll-Pentatonik?",
      richtig: ["1 b3 4 5 b7", "1 ♭3 4 5 ♭7"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-blue-note",
    stufe: 3,
    begriff: "Die Blue Note",
    erklaerung:
      "Legt man den Tritonus (♭5) in die Moll-Pentatonik, wird daraus die Blues-Tonleiter. Der Ton trägt keine eigene Ruhe — er funktioniert im Vorbeigehen, zwischen 4 und 5, und klingt festgehalten schnell schief.",
    frage: {
      art: "auswahl",
      text: "Welche Stufe kommt zur Moll-Pentatonik dazu, damit eine Blues-Tonleiter entsteht?",
      auswahl: ["♭5", "2", "6", "7"],
      richtig: ["♭5"],
    },
  },
  {
    id: "s-harmonisch",
    stufe: 3,
    begriff: "Harmonisch Moll",
    erklaerung:
      "Natürliches Moll mit erhöhter siebter Stufe: 1 2 ♭3 4 5 ♭6 7. Zwischen ♭6 und 7 entsteht dadurch ein Schritt von anderthalb Tönen — der grösste in einer Tonleiter, und der Grund für den orientalisch-klassischen Klang, den Neoklassik und Melodic Death Metal ausgiebig nutzen.",
    frage: {
      art: "auswahl",
      text: "Was unterscheidet harmonisch Moll von natürlichem Moll?",
      auswahl: [
        "Die siebte Stufe ist erhöht",
        "Die dritte Stufe ist erhöht",
        "Die sechste Stufe ist erhöht",
        "Die zweite Stufe ist erniedrigt",
      ],
      richtig: ["Die siebte Stufe ist erhöht"],
    },
  },
  {
    id: "s-phrygisch",
    stufe: 3,
    begriff: "Phrygisch",
    erklaerung:
      "1 ♭2 ♭3 4 5 ♭6 ♭7 — Moll mit zusätzlich erniedrigter zweiter Stufe. Der ♭2 sitzt einen Halbton über dem Grundton und drückt permanent dagegen; genau diese Reibung ist der Klang, den man mit Metal verbindet, sobald ein Riff um einen Ton kreist.",
    frage: {
      art: "eingabe",
      text: "Welche Stufe trennt Phrygisch von natürlichem Moll?",
      richtig: ["b2", "♭2"],
    },
  },
  {
    id: "s-phrygisch-dominant",
    stufe: 3,
    begriff: "Phrygisch dominant",
    erklaerung:
      "1 ♭2 3 4 5 ♭6 ♭7 — wie Phrygisch, aber mit grosser Terz. Aus der Reibung des ♭2 und der Härte der grossen Terz entsteht der Klang, den man aus unzähligen Metal-Soli kennt. Es ist die fünfte Stufe von harmonisch Moll: wer A harmonisch Moll spielt und E zum Grundton erklärt, ist da.",
    frage: {
      art: "auswahl",
      text: "Die wievielte Stufe von harmonisch Moll ist Phrygisch dominant?",
      auswahl: ["die fünfte", "die dritte", "die vierte", "die siebte"],
      richtig: ["die fünfte"],
    },
  },
  {
    id: "s-modi",
    stufe: 3,
    begriff: "Modi sind Verschiebungen",
    erklaerung:
      "Ein Modus ist dieselbe Tonleiter von einem anderen Ton aus gezählt. Die weissen Tasten ab D ergeben Dorisch, ab E Phrygisch, ab G Mixolydisch. Die Töne bleiben, der Schwerpunkt wandert — und mit ihm die Farbe.",
    frage: {
      art: "auswahl",
      text: "Von welcher Stufe der Dur-Tonleiter aus gezählt entsteht Phrygisch?",
      auswahl: ["der dritten", "der zweiten", "der vierten", "der sechsten"],
      richtig: ["der dritten"],
    },
  },
  {
    id: "s-quintenzirkel",
    stufe: 3,
    begriff: "Der Quintenzirkel",
    erklaerung:
      "Geht man von einer Tonart eine Quinte höher, kommt genau ein Kreuz dazu: C ohne Vorzeichen, G mit einem, D mit zwei. Nach zwölf Schritten ist man wieder am Anfang. Für die Gitarre praktisch, weil eine Quinte auf dem Hals eine feste Form ist — der Zirkel ist eine Bewegung, keine Tabelle.",
    frage: {
      art: "auswahl",
      text: "Wie viele Kreuze hat die Tonart eine Quinte über C-Dur?",
      auswahl: ["eins", "keins", "zwei", "vier"],
      richtig: ["eins"],
    },
  },
  {
    id: "s-lagen",
    stufe: 3,
    begriff: "Die fünf Pentatonik-Lagen",
    erklaerung:
      "Dieselben fünf Töne lassen sich in fünf zusammenhängenden Griffmustern über den ganzen Hals spielen. Jede Lage endet dort, wo die nächste beginnt — wer eine kann, kann eine Fünftel des Halses. Lage 1 zu A-Moll beginnt im 5. Bund.",
    frage: {
      art: "griffbrett",
      text: "Wo beginnt die erste Pentatonik-Lage von A-Moll auf der tiefen E-Saite?",
      richtig: [griff(6, 5)],
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-grundton",
    stufe: 3,
    begriff: "Der Grundton in der Lage",
    erklaerung:
      "In jeder Lage liegt der Grundton mehrfach — bei Lage 1 von A-Moll auf der tiefen E-Saite, auf der D-Saite und wieder auf der hohen E-Saite. Wer ihn im Muster findet, weiss jederzeit, wo er ist; wer ihn nicht findet, spielt Muster statt Musik.",
    frage: {
      art: "griffbrett",
      text: "A-Moll-Pentatonik, Lage 1 im 5. bis 8. Bund: tippe einen Grundton an.",
      richtig: stufeInLage("A", 1, 0),
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-quinte",
    stufe: 3,
    begriff: "Die Quinte in der Lage",
    erklaerung:
      "Nach dem Grundton ist die Quinte der Ton, auf dem sich eine Phrase am ruhigsten ablegen lässt — sie ist auch der zweite Ton jedes Powerchords. In Lage 1 von A-Moll liegt sie auf der A-Saite und noch einmal auf der B-Saite.",
    frage: {
      art: "griffbrett",
      text: "A-Moll-Pentatonik, Lage 1 im 5. bis 8. Bund: tippe eine Quinte an.",
      richtig: stufeInLage("A", 1, 7),
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-anker",
    stufe: 3,
    begriff: "Woran die Lagen sich unterscheiden",
    erklaerung:
      "Die fünf Lagen sind dasselbe Tonmaterial, nur an verschiedenen Stellen gegriffen. Was sie auseinanderhält, ist die Stufe, die auf der tiefen E-Saite zuunterst liegt: Lage 1 der Grundton, Lage 2 die kleine Terz, Lage 3 die Quarte, Lage 4 die Quinte, Lage 5 die kleine Septime.",
    frage: {
      art: "auswahl",
      text: "Welche Stufe liegt in Lage 2 auf der tiefen E-Saite zuunterst?",
      auswahl: ["die kleine Terz", "der Grundton", "die Quinte", "die Quarte"],
      richtig: ["die kleine Terz"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-zwei-toene",
    stufe: 3,
    begriff: "Zwei Töne je Saite",
    erklaerung:
      "Jede Pentatonik-Lage hat auf jeder Saite genau zwei Töne — zwölf insgesamt. Deshalb passt eine Lage unter eine Hand, ohne dass sie wandert, und deshalb lässt sich eine ganze Tonleiter spielen, ohne die Lage zu wechseln.",
    frage: {
      art: "auswahl",
      text: "Wie viele Töne der Pentatonik liegen in einer Lage auf jeder Saite?",
      auswahl: ["2", "1", "3", "je nach Saite verschieden"],
      richtig: ["2"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-kreis",
    stufe: 3,
    begriff: "Die Lagen laufen im Kreis",
    erklaerung:
      "Nach Lage 5 kommt wieder Lage 1, eine Oktave höher. Welche Lage am Hals zuunterst liegt, hängt deshalb am Grundton: bei A-Moll ist es Lage 4, weil deren Anker die Quinte E ist — und die liegt auf der leeren tiefen E-Saite. Wer 1 bis 5 von unten nach oben erwartet, erwartet das Falsche.",
    frage: {
      art: "auswahl",
      text: "Welche Lage der A-Moll-Pentatonik liegt am Hals ganz unten?",
      auswahl: ["Lage 4", "Lage 1", "Lage 5", "Lage 2"],
      richtig: ["Lage 4"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-verbinden",
    stufe: 3,
    begriff: "Lagen verbinden",
    erklaerung:
      "Zwei benachbarte Lagen teilen sich Töne: die oberen einer Lage sind die unteren der nächsten. Genau deshalb lässt sich zwischen ihnen wechseln, ohne dass eine Lücke entsteht — und deshalb lohnt es sich, eine neue Lage sofort mit der bekannten zu verzahnen, statt sie für sich zu üben.",
    frage: {
      art: "auswahl",
      text: "Was haben zwei benachbarte Pentatonik-Lagen gemeinsam?",
      auswahl: [
        "sie teilen sich Töne an denselben Stellen",
        "sie haben denselben Grundton auf der E-Saite",
        "sie liegen im selben Bund",
        "gar nichts — sie sind getrennte Muster",
      ],
      richtig: ["sie teilen sich Töne an denselben Stellen"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-vorzeichen",
    stufe: 3,
    begriff: "Vorzeichen einer Tonart",
    erklaerung:
      "Welche Töne in einer Tonart erhöht oder erniedrigt sind, steht fest, sobald der Grundton feststeht — sonst ergäbe das Schrittmuster nicht auf. E-Moll etwa braucht genau ein Kreuz, das F#, und deshalb steht in fast jedem Metal-Riff in E-Moll ein F# statt eines F.",
    frage: {
      art: "eingabe",
      text: "Welcher Ton ist in E-Moll erhöht?",
      richtig: ["F#", "Fis"],
    },
  },

  // ───────────────────────────────────────────────────── Stufe 4: Akkorde
  {
    id: "a-dreiklang",
    stufe: 4,
    begriff: "Der Dreiklang",
    erklaerung:
      "Grundton, Terz, Quinte — mehr ist ein Akkord im Kern nicht. Alles Weitere, von Septimen bis zu weit gegriffenen Voicings, sind Zutaten zu diesen drei Tönen.",
    frage: {
      art: "auswahl",
      text: "Aus welchen drei Stufen besteht ein Dreiklang?",
      auswahl: ["1 3 5", "1 4 5", "1 3 7", "1 5 8"],
      richtig: ["1 3 5"],
    },
  },
  {
    id: "a-dur-moll",
    stufe: 4,
    begriff: "Dur oder Moll",
    erklaerung:
      "Ein einziger Halbton entscheidet: grosse Terz ergibt Dur, kleine Terz ergibt Moll. Grundton und Quinte bleiben in beiden Fällen dieselben — deshalb liegt die ganze Stimmung eines Akkords auf einem einzigen Finger.",
    frage: {
      art: "auswahl",
      text: "Welcher Ton macht aus einem Dur-Akkord einen Moll-Akkord?",
      auswahl: ["die Terz", "die Quinte", "der Grundton", "die Septime"],
      richtig: ["die Terz"],
    },
  },
  {
    id: "a-powerchord",
    stufe: 4,
    begriff: "Der Powerchord",
    erklaerung:
      "Grundton und Quinte, keine Terz. Damit ist er weder Dur noch Moll — er passt überall hin, und genau das macht ihn im Metal so brauchbar. Geschrieben wird er als 5, etwa E5.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton G liegt auf der tiefen E-Saite im 3. Bund. Zeig die Quinte des Powerchords auf der A-Saite.",
      gegeben: [griff(6, 3)],
      richtig: positionsOfInterval(griff(6, 3), 7).filter((stelle) => stelle.saite === 5),
    },
    technique: "power-chords",
  },
  {
    id: "a-verzerrung",
    stufe: 4,
    begriff: "Warum Verzerrung Terzen frisst",
    erklaerung:
      "Verzerrung erzeugt Summen- und Differenztöne zwischen allem, was gleichzeitig klingt. Bei Grundton und Quinte fallen diese Zusatztöne grösstenteils mit den gespielten zusammen; kommt eine Terz dazu, entstehen Frequenzen dazwischen, und der Akkord wird matschig. Deshalb spielt Metal Powerchords und keine vollen Dreiklänge.",
    frage: {
      art: "auswahl",
      text: "Warum klingen volle Dreiklänge mit viel Verzerrung matschig?",
      auswahl: [
        "Die Terz erzeugt zusätzliche Frequenzen dazwischen",
        "Die Quinte ist zu laut",
        "Der Grundton verschwindet",
        "Die Saiten schwingen ungleich",
      ],
      richtig: ["Die Terz erzeugt zusätzliche Frequenzen dazwischen"],
    },
    technique: "power-chords",
  },
  {
    id: "a-stufen-dur",
    stufe: 4,
    begriff: "Stufenakkorde in Dur",
    erklaerung:
      "Baut man auf jeder Stufe der Dur-Tonleiter einen Dreiklang aus den Tönen derselben Tonart, ergibt sich immer dasselbe Muster: I ii iii IV V vi vii°. Grossbuchstaben sind Dur, kleine Moll, das ° vermindert. Das gilt in jeder Dur-Tonart.",
    frage: {
      art: "auswahl",
      text: "Welches Geschlecht hat die sechste Stufe in Dur?",
      auswahl: ["Moll", "Dur", "vermindert", "übermässig"],
      richtig: ["Moll"],
    },
  },
  {
    id: "a-stufen-moll",
    stufe: 4,
    begriff: "Stufenakkorde in Moll",
    erklaerung:
      "In natürlichem Moll lautet die Reihe i ii° III iv v VI VII. Die fünfte Stufe ist hier Moll — und weil ein Moll-Akkord weniger Zug nach Hause hat, greift klassische Musik dort zur erhöhten Septime aus harmonisch Moll und macht Dur daraus.",
    frage: {
      art: "auswahl",
      text: "Welches Geschlecht hat die dritte Stufe in natürlichem Moll?",
      auswahl: ["Dur", "Moll", "vermindert", "übermässig"],
      richtig: ["Dur"],
    },
  },
  {
    id: "a-roemisch",
    stufe: 4,
    begriff: "Römische Ziffern lesen",
    erklaerung:
      "I–V–vi–IV beschreibt eine Akkordfolge ohne Tonart: in C wären das C, G, a, F. Der Vorteil ist, dass sich dieselbe Folge überallhin verschieben lässt — auf der Gitarre heisst das schlicht, dieselbe Form ein paar Bünde weiter zu greifen.",
    frage: {
      art: "eingabe",
      text: "Welcher Akkord ist die V. Stufe in C-Dur?",
      richtig: ["G"],
    },
  },
  {
    id: "a-kadenz",
    stufe: 4,
    begriff: "Kadenz und Auflösung",
    erklaerung:
      "Die fünfte Stufe zieht zurück zur ersten — das ist der stärkste Zug, den tonale Musik kennt, und der Grund, warum ein Stück am Ende zu Hause klingt. Metal umgeht ihn oft absichtlich und bleibt auf der ♭VII oder ♭VI stehen, damit nichts sich auflöst.",
    frage: {
      art: "auswahl",
      text: "Welche Stufe zieht am stärksten zurück zum Grundton?",
      auswahl: ["die fünfte", "die vierte", "die zweite", "die sechste"],
      richtig: ["die fünfte"],
    },
  },
  {
    id: "a-umkehrung",
    stufe: 4,
    begriff: "Umkehrungen",
    erklaerung:
      "Liegt statt des Grundtons die Terz oder die Quinte unten, ist es immer noch derselbe Akkord — nur mit anderem Fundament. Auf der Gitarre entsteht das oft von selbst, sobald man eine Form in eine andere Lage schiebt.",
    frage: {
      art: "auswahl",
      text: "Was liegt bei der ersten Umkehrung eines Dreiklangs unten?",
      auswahl: ["die Terz", "die Quinte", "der Grundton", "die Septime"],
      richtig: ["die Terz"],
    },
  },
  {
    id: "a-septakkord",
    stufe: 4,
    begriff: "Septakkorde",
    erklaerung:
      "Ein vierter Ton über dem Dreiklang: die Septime. Die kleine Septime auf einem Dur-Akkord ergibt den Dominantseptakkord, der stark nach Auflösung verlangt; auf einem Moll-Akkord klingt sie einfach offener.",
    frage: {
      art: "auswahl",
      text: "Welche Stufe kommt zum Dreiklang dazu, damit ein Septakkord entsteht?",
      auswahl: ["die Septime", "die Sexte", "die None", "die Quarte"],
      richtig: ["die Septime"],
    },
  },
  {
    id: "a-barre",
    stufe: 4,
    begriff: "Barré: E-Form und A-Form",
    erklaerung:
      "Ein Barré ist ein Sattel aus Zeigefinger. Die E-Form hat ihren Grundton auf der tiefen E-Saite, die A-Form auf der A-Saite — zwei Formen, und damit jeder Dur- und Moll-Akkord in jeder Lage. Die Töne der beiden tiefen Saiten zu kennen reicht deshalb aus, um jeden Akkord zu finden.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt der Grundton eines G-Dur-Barrés in der E-Form?",
      richtig: [griff(6, 3)],
    },
  },
  {
    id: "a-caged",
    stufe: 4,
    begriff: "CAGED",
    erklaerung:
      "Die fünf offenen Akkordformen C, A, G, E und D lassen sich verschieben und decken zusammen den ganzen Hals ab. Sie greifen ineinander wie die Pentatonik-Lagen: wo eine endet, beginnt die nächste. Der Name ist die Reihenfolge, in der sie den Hals hinaufwandern.",
    frage: {
      art: "eingabe",
      text: "Wofür stehen die fünf Buchstaben in CAGED?",
      richtig: ["Akkordformen", "die fünf offenen Akkordformen", "Akkordform", "offene Akkordformen"],
    },
  },
  {
    id: "a-vermindert",
    stufe: 4,
    begriff: "Der verminderte Dreiklang",
    erklaerung:
      "Kleine Terz und Tritonus über dem Grundton: 1 ♭3 ♭5. Er hat keine Ruhe, weil der Tritonus keine hat — in Dur steht er auf der siebten Stufe, und in Metal-Riffs taucht er auf, wenn Spannung ohne Auflösung gewollt ist.",
    frage: {
      art: "auswahl",
      text: "Welches Intervall trennt einen verminderten von einem Moll-Dreiklang?",
      auswahl: ["die Quinte ist erniedrigt", "die Terz ist erhöht", "der Grundton ist erniedrigt", "die Septime fehlt"],
      richtig: ["die Quinte ist erniedrigt"],
    },
  },
  {
    id: "a-quartpowerchord",
    stufe: 4,
    begriff: "Quartpowerchord",
    erklaerung:
      "Statt Grundton und Quinte greift man Grundton und Quarte — fünf Halbtöne statt sieben. Der Griff ist derselbe, nur eine Saite tiefer angesetzt, und er klingt offener und weniger fest als der gewöhnliche Powerchord. Im Hardrock der Achtziger steht er überall dort, wo ein Riff schweben soll statt zu stehen.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne liegen zwischen den beiden Tönen eines Quartpowerchords?",
      auswahl: ["5", "7", "6", "4"],
      richtig: ["5"],
    },
    technique: "power-chords",
  },
  {
    id: "a-powerchord-umkehrung",
    stufe: 4,
    begriff: "Powerchord-Umkehrung",
    erklaerung:
      "Legt man die Quinte nach unten und den Grundton darüber, wird aus dem Quintabstand ein Quartabstand — dieselben zwei Töne, andere Reihenfolge. Der Akkord heisst weiter nach seinem Grundton, klingt aber leichter, weil der tiefste Ton nicht mehr der Namensgeber ist.",
    frage: {
      art: "auswahl",
      text: "Welcher Ton liegt bei der Umkehrung eines Powerchords unten?",
      auswahl: ["die Quinte", "der Grundton", "die Terz", "die Oktave"],
      richtig: ["die Quinte"],
    },
    technique: "power-chords",
  },
  {
    id: "a-powerchord-b5",
    stufe: 4,
    begriff: "Der b5-Powerchord",
    erklaerung:
      "Die Quinte einen Bund tiefer, und aus sieben Halbtönen werden sechs — der Tritonus. Das Ergebnis ist kein Akkord, auf dem sich etwas ablegen liesse; er drängt weiter. Genau deshalb steht er im Metal überall dort, wo Spannung ohne Auflösung gewollt ist.",
    frage: {
      art: "auswahl",
      text: "Welches Intervall bleibt übrig, wenn man die Quinte eines Powerchords um einen Halbton senkt?",
      auswahl: ["der Tritonus", "die Quarte", "die grosse Terz", "die kleine Sexte"],
      richtig: ["der Tritonus"],
    },
    technique: "power-chords",
  },
  {
    id: "a-powerchord-kreuz5",
    stufe: 4,
    begriff: "Der #5-Powerchord",
    erklaerung:
      "Die Quinte einen Bund höher: acht Halbtöne, also eine kleine Sexte. Auch das ist kein Ruhepunkt, aber ein anderer als der Tritonus — er zieht nach oben statt zu kippen. Wer beide gegeneinander hört, hat den Unterschied zwischen Drohung und Aufbruch im Ohr.",
    frage: {
      art: "auswahl",
      text: "Welches Intervall entsteht, wenn man die Quinte eines Powerchords um einen Halbton erhöht?",
      auswahl: ["die kleine Sexte", "die grosse Sexte", "die kleine Septime", "der Tritonus"],
      richtig: ["die kleine Sexte"],
    },
    technique: "power-chords",
  },
  {
    id: "a-powerchord-hoch",
    stufe: 4,
    begriff: "Powerchords auf den hohen Saiten",
    erklaerung:
      "Derselbe Griff funktioniert auf jedem Saitenpaar, nur wandert er beim Sprung auf die B-Saite einen Bund weiter — der Knick in der Stimmung. Höher gegriffen klingt ein Powerchord dünner, weil die Verzerrung weniger Grundton zum Arbeiten hat; deshalb tragen Riffs auf den hohen Saiten selten allein.",
    frage: {
      art: "auswahl",
      text: "Was ändert sich am Powerchord-Griff, sobald die B-Saite beteiligt ist?",
      auswahl: [
        "der obere Ton wandert einen Bund höher",
        "der obere Ton wandert einen Bund tiefer",
        "nichts, der Griff bleibt gleich",
        "man braucht eine dritte Saite",
      ],
      richtig: ["der obere Ton wandert einen Bund höher"],
    },
    technique: "power-chords",
  },

  // ──────────────────────────────────────────────────── Stufe 5: Rhythmus
  {
    id: "r-notenwerte",
    stufe: 5,
    begriff: "Notenwerte",
    erklaerung:
      "Jeder Wert ist die Hälfte des vorigen: ganze, halbe, Viertel, Achtel, Sechzehntel. Als Verhältnis gedacht statt als Symbol wird das Zählen leichter — vier Sechzehntel dauern so lange wie eine Viertel, egal bei welchem Tempo.",
    frage: {
      art: "auswahl",
      text: "Wie viele Sechzehntel passen in eine Viertelnote?",
      auswahl: ["4", "2", "8", "16"],
      richtig: ["4"],
    },
  },
  {
    id: "r-taktart",
    stufe: 5,
    begriff: "Taktarten",
    erklaerung:
      "Die obere Zahl sagt, wie viele Schläge ein Takt hat, die untere, welcher Notenwert ein Schlag ist. 4/4 sind vier Viertel — das Mass der allermeisten Riffs. Ungerade Taktarten wie 7/8 sind im Metal kein Selbstzweck, sondern ein Mittel, den Fuss aus dem Tritt zu bringen.",
    frage: {
      art: "auswahl",
      text: "Was sagt die untere Zahl einer Taktangabe?",
      auswahl: [
        "welcher Notenwert ein Schlag ist",
        "wie viele Schläge ein Takt hat",
        "wie schnell gespielt wird",
        "wie viele Takte eine Phrase hat",
      ],
      richtig: ["welcher Notenwert ein Schlag ist"],
    },
  },
  {
    id: "r-punktierung",
    stufe: 5,
    begriff: "Punktierung",
    erklaerung:
      "Ein Punkt hinter einer Note verlängert sie um die Hälfte ihres eigenen Werts. Eine punktierte Viertel dauert also so lange wie drei Achtel — das ist der Grund, warum punktierte Rhythmen gegen den Grundschlag laufen und dabei trotzdem aufgehen.",
    frage: {
      art: "auswahl",
      text: "Wie lange dauert eine punktierte Viertelnote?",
      auswahl: ["drei Achtel", "zwei Achtel", "vier Achtel", "eineinhalb Sechzehntel"],
      richtig: ["drei Achtel"],
    },
  },
  {
    id: "r-triole",
    stufe: 5,
    begriff: "Triole",
    erklaerung:
      "Drei Noten im Platz von zweien. Das Ergebnis ist ein anderes Raster als das übliche Zweier-Gefühl, und genau deshalb klingt eine Triolenpassage nach Rollen statt nach Marschieren.",
    frage: {
      art: "auswahl",
      text: "Wie viele Noten spielt eine Achteltriole im Platz von zwei Achteln?",
      auswahl: ["3", "2", "4", "6"],
      richtig: ["3"],
    },
  },
  {
    id: "r-gallop",
    stufe: 5,
    begriff: "Die Gallop-Figur",
    erklaerung:
      "Achtel, Sechzehntel, Sechzehntel — auf einen Schlag. Der lange Ton vorn und die zwei kurzen hinterher ergeben genau den Vorwärtsdruck, den Thrash und die NWOBHM zum Markenzeichen gemacht haben. Gespielt wird sie üblicherweise Abschlag, Abschlag, Aufschlag.",
    frage: {
      art: "auswahl",
      text: "Aus welchen Notenwerten besteht ein Gallop auf einem Schlag?",
      auswahl: [
        "Achtel, Sechzehntel, Sechzehntel",
        "Sechzehntel, Sechzehntel, Achtel",
        "Viertel, Achtel, Achtel",
        "drei Achteltriolen",
      ],
      richtig: ["Achtel, Sechzehntel, Sechzehntel"],
    },
    technique: "gallop",
  },
  {
    id: "r-gallop-umgekehrt",
    stufe: 5,
    begriff: "Umgekehrter Gallop",
    erklaerung:
      "Dieselben drei Werte, andere Reihenfolge: Sechzehntel, Sechzehntel, Achtel. Die zwei kurzen Töne kommen zuerst, der lange trägt den Schlag aus — das zieht statt zu schieben und klingt schwerer als das Original.",
    frage: {
      art: "auswahl",
      text: "Womit beginnt ein umgekehrter Gallop?",
      auswahl: ["zwei Sechzehnteln", "einer Achtel", "einer Viertel", "einer Pause"],
      richtig: ["zwei Sechzehnteln"],
    },
    technique: "gallop",
  },
  {
    id: "r-gallop-gespielt",
    stufe: 5,
    begriff: "Gallop spielen",
    erklaerung:
      "Gewusst ist noch nicht gespielt. Die Figur sitzt erst, wenn die zwei kurzen Töne wirklich kurz sind — im Kopf ist der Unterschied zu geraden Achteln klar, unter den Fingern verwischt er. Das Mikrofon misst genau das und rechnet die Verzögerung der Signalkette vorher heraus.",
    frage: {
      art: "gespielt",
      text: "Spiel zwei Takte Gallop.",
      richtig: ["gallop"],
      rhythmus: { figurId: "gallop", bpm: 90, takte: 2 },
    },
    technique: "gallop",
  },
  {
    id: "r-gallop-umgekehrt-gespielt",
    stufe: 5,
    begriff: "Umgekehrten Gallop spielen",
    erklaerung:
      "Dieselben drei Werte in anderer Reihenfolge — und genau deshalb der beste Prüfstein: wer den Unterschied nur denkt, spielt hier den normalen Gallop. Gemessen wird gegen die Figur, nicht gegen das Metronomraster.",
    frage: {
      art: "gespielt",
      text: "Spiel zwei Takte umgekehrten Gallop.",
      richtig: ["gallop-umgekehrt"],
      rhythmus: { figurId: "gallop-umgekehrt", bpm: 90, takte: 2 },
    },
    technique: "gallop",
  },
  {
    id: "r-synkope",
    stufe: 5,
    begriff: "Synkope",
    erklaerung:
      "Eine Betonung, die neben dem Grundschlag liegt. Der Reiz entsteht nur, weil der Grundschlag im Kopf weiterläuft — ohne ihn ist eine Synkope einfach ein Ton. Deshalb ist das Metronom kein Gegner, sondern die Voraussetzung.",
    frage: {
      art: "auswahl",
      text: "Was ist eine Synkope?",
      auswahl: [
        "eine Betonung neben dem Grundschlag",
        "ein Wechsel der Taktart",
        "eine Pause auf der Eins",
        "eine Verzögerung des Tempos",
      ],
      richtig: ["eine Betonung neben dem Grundschlag"],
    },
  },
  {
    id: "r-sechzehntel",
    stufe: 5,
    begriff: "Sechzehntel",
    erklaerung:
      "Vier Töne auf einen Schlag, das feinste Raster, das im Riff-Spiel regelmässig vorkommt. Fast jede Metal-Figur ist ein Ausschnitt daraus: der Gallop nimmt den ersten, dritten und vierten, die Dreiergruppe jeden dritten. Wer das Raster im Kopf hat, muss Figuren nicht auswendig lernen, sondern nur abzählen.",
    frage: {
      art: "auswahl",
      text: "Wie viele Sechzehntel liegen auf einem Schlag?",
      auswahl: ["4", "2", "3", "8"],
      richtig: ["4"],
    },
  },
  {
    id: "r-haltebogen",
    stufe: 5,
    begriff: "Haltebogen",
    erklaerung:
      "Ein Bogen zwischen zwei gleichen Tönen macht aus ihnen einen einzigen, der über die Grenze hinweg klingt. Angeschlagen wird nur der erste. Über einen Taktstrich gezogen ist das die einfachste Art, eine Betonung von der Eins wegzuschieben — deshalb steht am Anfang fast jeder Synkope ein Haltebogen.",
    frage: {
      art: "auswahl",
      text: "Wie oft wird ein Ton angeschlagen, der mit einem Haltebogen an den nächsten gebunden ist?",
      auswahl: ["einmal, am Anfang", "zweimal", "einmal, am Ende", "gar nicht"],
      richtig: ["einmal, am Anfang"],
    },
  },
  {
    id: "r-pause",
    stufe: 5,
    begriff: "Pausen zählen",
    erklaerung:
      "Eine Pause ist kein Nichts, sondern ein Wert mit derselben Dauer wie die Note, die dort stehen könnte. Auf der Gitarre ist sie ausserdem Arbeit: eine Saite hört nicht von selbst auf zu klingen, das Abdämpfen mit Handballen oder Greifhand gehört zur Pause dazu. Bei Verzerrung fällt jede ungedämpfte Pause sofort auf.",
    frage: {
      art: "auswahl",
      text: "Was gehört auf der E-Gitarre zu einer sauber gespielten Pause?",
      auswahl: [
        "die Saiten abdämpfen",
        "das Tempo kurz anhalten",
        "leiser weiterspielen",
        "auf die nächste Saite wechseln",
      ],
      richtig: ["die Saiten abdämpfen"],
    },
  },
  {
    id: "r-akzent",
    stufe: 5,
    begriff: "Akzent",
    erklaerung:
      "Ein Akzent ist ein Ton, der lauter angeschlagen wird als seine Nachbarn. Er verschiebt, wo eine Figur ihren Schwerpunkt hat, ohne eine einzige Note zu ändern. Bei hoher Verzerrung wird er allerdings stark zusammengedrückt — deshalb arbeitet Metal öfter mit Dämpfung als mit Lautstärke, wenn etwas hervorstechen soll.",
    frage: {
      art: "auswahl",
      text: "Warum trägt ein Akzent bei starker Verzerrung weniger weit?",
      auswahl: [
        "Verzerrung drückt laute und leise Anschläge zusammen",
        "Verzerrung verschiebt die Tonhöhe",
        "Akzente sind nur auf Akustikgitarren notiert",
        "das Metronom übertönt sie",
      ],
      richtig: ["Verzerrung drückt laute und leise Anschläge zusammen"],
    },
  },
  {
    id: "r-dreiergruppe",
    stufe: 5,
    begriff: "Dreiergruppen",
    erklaerung:
      "Töne im Abstand von drei Sechzehnteln — also punktierte Achtel. Weil drei nicht in vier aufgeht, wandert der Anfang der Gruppe über den Schlag und findet erst nach drei Schlägen zurück. Genau diese Verschiebung erzeugt den Eindruck, das Riff laufe gegen das Schlagzeug, obwohl beide dasselbe Tempo halten.",
    frage: {
      art: "auswahl",
      text: "Nach wie vielen Schlägen fällt eine Dreiergruppe aus Sechzehnteln wieder auf den Schlag?",
      auswahl: ["3", "2", "4", "gar nicht"],
      richtig: ["3"],
    },
  },
  {
    id: "r-dreiergruppe-gespielt",
    stufe: 5,
    begriff: "Dreiergruppen spielen",
    erklaerung:
      "Der Prüfstein ist nicht die Gruppe selbst, sondern das Weiterzählen: wer bei der zweiten Gruppe anfängt, den Schlag zu suchen, verliert sie. Drei Takte sind vier Gruppen — genau eine Runde, bis der Anfang wieder auf der Eins liegt. Das Metronom klickt dabei weiter Viertel, und das soll es auch.",
    frage: {
      art: "gespielt",
      text: "Spiel drei Takte Dreiergruppen — punktierte Achtel, durchgehend.",
      richtig: ["dreiergruppe"],
      rhythmus: { figurId: "dreiergruppe", bpm: 80, takte: 3 },
    },
  },
  {
    id: "r-shuffle",
    stufe: 5,
    begriff: "Shuffle",
    erklaerung:
      "Zwei Töne je Schlag, aber ungleich lang: der erste dauert zwei Drittel, der zweite ein Drittel. Gedacht wird es als Triole, bei der die mittlere Note wegfällt. Im Hardrock trägt das ganze Riffs, im Metal taucht es vor allem dort auf, wo die Wurzeln im Blues liegen.",
    frage: {
      art: "auswahl",
      text: "Wie entsteht das Shuffle-Gefühl aus einer Triole?",
      auswahl: [
        "die mittlere Note fällt weg",
        "die erste Note fällt weg",
        "alle drei werden gleich lang",
        "die Triole wird verdoppelt",
      ],
      richtig: ["die mittlere Note fällt weg"],
    },
  },
  {
    id: "r-shuffle-gespielt",
    stufe: 5,
    begriff: "Shuffle spielen",
    erklaerung:
      "Der häufigste Fehler ist die Mitte: wer den zweiten Ton zu früh setzt, landet bei geraden Achteln, wer ihn zu spät setzt, bei punktierten. Das Mikrofon misst genau diesen Abstand — zwei Drittel zu einem Drittel, nichts dazwischen.",
    frage: {
      art: "gespielt",
      text: "Spiel zwei Takte im Shuffle.",
      richtig: ["shuffle"],
      rhythmus: { figurId: "shuffle", bpm: 90, takte: 2 },
    },
  },
  {
    id: "r-dead-note",
    stufe: 5,
    begriff: "Dead Note",
    erklaerung:
      "Ein Anschlag ohne Tonhöhe: die Greifhand liegt lose auf den Saiten, sodass nur ein perkussives Klacken übrig bleibt. Im Riff füllt das die Lücken zwischen den klingenden Tönen und hält die Anschlaghand in Bewegung, ohne den Klang zu verwässern. Notiert wird es als Kreuz statt einer Bundzahl.",
    frage: {
      art: "auswahl",
      text: "Wie wird eine Dead Note erzeugt?",
      auswahl: [
        "die Greifhand liegt lose auf den Saiten",
        "die Saite wird gar nicht angeschlagen",
        "der Verstärker wird kurz stummgeschaltet",
        "die Saite wird über den Sattel gedrückt",
      ],
      richtig: ["die Greifhand liegt lose auf den Saiten"],
    },
    technique: "palm-mute",
  },
  {
    id: "r-dead-note-gespielt",
    stufe: 5,
    begriff: "Dead Notes spielen",
    erklaerung:
      "Vier Sechzehntel, aber nur der erste und der dritte klingen — die beiden dazwischen sind abgedämpft. Im Zeitraster ist das von geraden Sechzehnteln nicht zu unterscheiden; der Unterschied steckt allein darin, wie laut die gedämpften Anschläge sind. Genau das misst das Mikrofon hier.",
    frage: {
      art: "gespielt",
      text: "Spiel zwei Takte Sechzehntel, dabei die Nachschläge abgedämpft.",
      richtig: ["dead-notes"],
      rhythmus: { figurId: "dead-notes", bpm: 80, takte: 2 },
    },
    technique: "palm-mute",
  },
  {
    id: "r-synkope-gespielt",
    stufe: 5,
    begriff: "Eine Synkope spielen",
    erklaerung:
      "Eins, und — und: auf der Zwei liegt kein Anschlag, der Ton davor wird über sie hinweg gehalten. Schwer ist daran nicht das Treffen, sondern das Aushalten; die Hand will auf der Zwei zuschlagen, weil das Metronom dort klickt.",
    frage: {
      art: "gespielt",
      text: "Spiel zwei Takte mit Achtelsynkope — auf der Zwei kein Anschlag.",
      richtig: ["synkope"],
      rhythmus: { figurId: "synkope", bpm: 90, takte: 2 },
    },
  },
  {
    id: "r-triole-gespielt",
    stufe: 5,
    begriff: "Eine Triole spielen",
    erklaerung:
      "Drei gleich lange Töne auf einen Schlag. Der Fehler, der am häufigsten passiert, ist ein Gallop daraus zu machen — drei Töne sind es dann auch, aber ungleich verteilt. Gemessen wird der Abstand, und der verzeiht die Verwechslung nicht.",
    frage: {
      art: "gespielt",
      text: "Spiel zwei Takte Achteltriolen.",
      richtig: ["triole"],
      rhythmus: { figurId: "triole", bpm: 90, takte: 2 },
    },
  },

  // ──────────────────────────────────────── Stufe 6: Metal im Besonderen
  {
    id: "x-drop",
    stufe: 6,
    begriff: "Drop-Stimmungen",
    erklaerung:
      "In Drop D wird die tiefe E-Saite auf D heruntergestimmt. Dadurch liegen Grundton und Quinte des Powerchords auf demselben Bund zweier Nachbarsaiten — ein Finger reicht, und Riffs lassen sich in einem Tempo verschieben, das mit zwei Fingern nicht ginge. Drop C und tiefer folgen demselben Prinzip.",
    frage: {
      art: "auswahl",
      text: "Warum reicht in Drop D ein Finger für den Powerchord?",
      auswahl: [
        "Grundton und Quinte liegen auf demselben Bund",
        "Die Saiten sind lockerer",
        "Die Quinte entfällt",
        "Der Grundton liegt leer",
      ],
      richtig: ["Grundton und Quinte liegen auf demselben Bund"],
    },
  },
  {
    id: "x-orgelpunkt",
    stufe: 6,
    begriff: "Orgelpunkt",
    erklaerung:
      "Ein Ton bleibt liegen, während sich darüber alles ändert — im Metal meist die leere tiefe Saite zwischen den Akzenten. Der stehende Ton gibt dem Riff einen Boden, gegen den alles andere arbeitet, und macht Bewegung hörbar, die sonst untergehen würde.",
    frage: {
      art: "auswahl",
      text: "Was ist ein Orgelpunkt in einem Riff?",
      auswahl: [
        "ein liegender Ton, über dem sich alles ändert",
        "die lauteste Stelle",
        "ein Wechsel der Tonart",
        "eine Pause vor dem Refrain",
      ],
      richtig: ["ein liegender Ton, über dem sich alles ändert"],
    },
  },
  {
    id: "x-palm-mute",
    stufe: 6,
    begriff: "Palm Mute in der Tabulatur",
    erklaerung:
      "P.M. mit gestrichelter Linie über den Noten heisst: Handballen auf die Saiten am Steg. Der Ton wird kürzer und perkussiver, ohne stumm zu sein. Wie stark gedämpft wird, steht nirgends — das ist die Entscheidung, die den Chug ausmacht.",
    frage: {
      art: "eingabe",
      text: "Wofür steht P.M. über einer Tabulatur?",
      richtig: ["Palm Mute", "Palm Muting", "Handballendämpfung", "palm mute"],
    },
    technique: "palm-mute",
  },
  {
    id: "x-abschlag",
    stufe: 6,
    begriff: "Abschlag gegen Wechselschlag",
    erklaerung:
      "Reiner Abschlag klingt anders, nicht nur anstrengender: jeder Anschlag trifft die Saite aus derselben Richtung, also sind alle Töne gleich betont und gleich hart. Wechselschlag ist schneller, erzeugt aber zwangsläufig eine leichte Ungleichheit zwischen Ab und Auf — genau die, die man bei Thrash nicht will.",
    frage: {
      art: "auswahl",
      text: "Warum klingt reiner Abschlag härter als Wechselschlag?",
      auswahl: [
        "Jeder Anschlag trifft die Saite aus derselben Richtung",
        "Er ist automatisch lauter",
        "Er trifft mehr Saiten",
        "Er dämpft die Saite mit",
      ],
      richtig: ["Jeder Anschlag trifft die Saite aus derselben Richtung"],
    },
    technique: "downpicking",
  },
  {
    id: "x-riffbau",
    stufe: 6,
    begriff: "Riff-Bau: Motiv und Antwort",
    erklaerung:
      "Die meisten Riffs bestehen aus einer kurzen Figur und einer Variante davon, die anders endet — Frage und Antwort über zwei oder vier Takte. Wer das hört, kann ein fremdes Riff nach zweimal Hören mitspielen, weil die zweite Hälfte fast immer die erste mit anderem Schluss ist.",
    frage: {
      art: "auswahl",
      text: "Wie sind die meisten Riffs über vier Takte gebaut?",
      auswahl: [
        "eine Figur und eine Variante mit anderem Schluss",
        "vier verschiedene Figuren",
        "dieselbe Figur viermal",
        "eine Figur und eine Pause",
      ],
      richtig: ["eine Figur und eine Variante mit anderem Schluss"],
    },
  },
  {
    id: "x-kadenz-moll",
    stufe: 6,
    begriff: "Die Metal-Kadenz",
    erklaerung:
      "In E-Moll: C5, D5, E5 — sechste, siebte, erste Stufe, also ♭VI ♭VII i. Die zwei Powerchords laufen in Ganztönen auf den Grundton zu und kommen dort an, ohne dass ein Dur-Akkord die Stimmung aufhellt. Das ist die Fortschreitung hinter unzähligen Refrains, gerade weil sie so wenig erklären muss.",
    frage: {
      art: "auswahl",
      text: "C5 – D5 – E5 in E-Moll: welche Stufen sind das?",
      auswahl: ["♭VI – ♭VII – i", "IV – V – I", "ii – iii – i", "♭III – IV – i"],
      richtig: ["♭VI – ♭VII – i"],
    },
    technique: "power-chords",
  },
  {
    id: "x-terzen-zweistimmig",
    stufe: 6,
    begriff: "Zweistimmig in Terzen",
    erklaerung:
      "Zwei Gitarren, dieselbe Melodie, die zweite eine Terz darüber — der Klang von Twin-Leads. Gespielt wird dabei die Terz, die in der Tonart liegt: über A in A-Moll ist das C, drei Halbtöne höher.",
    frage: {
      art: "griffbrett",
      text: "Die erste Gitarre spielt A, tiefe E-Saite im 5. Bund, in A-Moll. Zeig die Terz darüber auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 3).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "x-terzen-wechsel",
    stufe: 6,
    begriff: "Warum man Terzen nicht parallel schiebt",
    erklaerung:
      "Die Tonleiter hat mal kleine, mal grosse Terzen: in A-Moll liegen über A, B, D und E kleine, über C, F und G grosse. Wer dieselbe Griffform einfach mitwandern lässt, landet nach zwei Tönen ausserhalb der Tonart — die zweite Stimme bleibt in der Leiter, nicht in der Form.",
    frage: {
      art: "auswahl",
      text: "Warum klingt eine Terzstimme falsch, die man in fester Form mitschiebt?",
      auswahl: [
        "Die Tonleiter hat mal grosse, mal kleine Terzen",
        "Terzen klingen verzerrt immer schief",
        "Die zweite Gitarre ist zu laut",
        "Terzen gehören nicht in Moll",
      ],
      richtig: ["Die Tonleiter hat mal grosse, mal kleine Terzen"],
    },
  },
  {
    id: "x-flageolett-12",
    stufe: 6,
    begriff: "Flageolett",
    erklaerung:
      "Die Saite nur berühren statt drücken, direkt über dem Bundstab: dann schwingt sie in Teilen, und es klingt ein Oberton. Über dem 12. Bund teilt der Finger sie genau in zwei Hälften — der Ton liegt eine Oktave über der Leersaite.",
    frage: {
      art: "eingabe",
      text: "Über welchem Bund klingt das Flageolett genau eine Oktave über der Leersaite?",
      richtig: ["12", "zwölf", "zwoelf"],
    },
  },
  {
    id: "x-flageolett-7",
    stufe: 6,
    begriff: "Flageolett am 7. Bund",
    erklaerung:
      "Über dem 7. Bund liegt fast genau ein Drittel der Saite. Sie schwingt dann in drei Teilen, und der Oberton klingt eine Oktave plus eine Quinte über der Leersaite. Über dem 5. Bund ist es ein Viertel — zwei Oktaven.",
    frage: {
      art: "auswahl",
      text: "Wie hoch klingt das Flageolett über dem 7. Bund, gemessen an der Leersaite?",
      auswahl: ["eine Oktave plus Quinte", "eine Oktave", "zwei Oktaven", "eine Quinte"],
      richtig: ["eine Oktave plus Quinte"],
    },
  },
  {
    id: "x-pinch",
    stufe: 6,
    begriff: "Pinch Harmonic",
    erklaerung:
      "Der Daumen streift die Saite direkt nach dem Plektrum und löscht den Grundton aus — übrig bleibt ein Oberton, der quietscht. Wo die Anschlaghand dabei steht, entscheidet, welcher: ein paar Millimeter zum Hals oder zum Steg ergeben einen anderen Ton. Deshalb klingt es mal und mal nicht, und deshalb sucht man die Stelle mit dem Ohr, nicht mit dem Auge.",
    frage: {
      art: "auswahl",
      text: "Was entscheidet, welcher Oberton beim Pinch Harmonic klingt?",
      auswahl: [
        "wo die Anschlaghand auf der Saite steht",
        "wie fest die Greifhand drückt",
        "wie viel Verzerrung eingestellt ist",
        "ob ab- oder aufgeschlagen wird",
      ],
      richtig: ["wo die Anschlaghand auf der Saite steht"],
    },
  },
  {
    id: "x-drop-d-bund",
    stufe: 6,
    begriff: "Powerchords in Drop D",
    erklaerung:
      "In Drop D klingt die tiefste Saite leer D, die A-Saite darüber liegt eine Quinte höher. Ein Finger quer über beide Saiten im selben Bund greift deshalb einen Powerchord: Bund 3 ist F5, Bund 5 G5. Der Grundton liegt zwei Bünde höher als in Standardstimmung.",
    frage: {
      art: "eingabe",
      text: "In Drop D: in welchem Bund greifst du F5 mit einem Finger auf den beiden tiefsten Saiten?",
      richtig: ["3", "drei"],
    },
    technique: "power-chords",
  },
  {
    id: "x-tiefer-stimmen",
    stufe: 6,
    begriff: "Alles einen Ganzton tiefer",
    erklaerung:
      "In D Standard sind alle sechs Saiten um zwei Halbtöne heruntergestimmt. Die Abstände zwischen ihnen bleiben, also bleiben auch alle Griffbilder: dieselbe Form, nur klingt sie einen Ganzton tiefer. Wer aus einer Tabulatur in D Standard spielt, greift einfach, was dasteht.",
    frage: {
      art: "auswahl",
      text: "Du stimmst alle Saiten einen Ganzton tiefer. Was passiert mit den Griffbildern?",
      auswahl: [
        "Sie bleiben gleich und klingen tiefer",
        "Sie rutschen zwei Bünde höher",
        "Nur die Powerchords ändern sich",
        "Die Abstände zwischen den Saiten ändern sich",
      ],
      richtig: ["Sie bleiben gleich und klingen tiefer"],
    },
  },
  {
    id: "x-spannung",
    stufe: 6,
    begriff: "Tiefer gestimmt, dickere Saiten",
    erklaerung:
      "Die Spannung einer Saite wächst mit dem Quadrat ihrer Tonhöhe. Einen Ganzton tiefer gestimmt verliert sie deshalb rund ein Fünftel ihrer Spannung, schlackert, schnarrt und verstimmt sich beim Anschlagen. Dickere Saiten holen die Spannung zurück — das ist der Grund für die Sätze mit 11er oder 12er.",
    frage: {
      art: "auswahl",
      text: "Wie viel Spannung verliert eine Saite ungefähr, wenn du sie einen Ganzton tiefer stimmst?",
      auswahl: ["etwa ein Fünftel", "etwa die Hälfte", "fast nichts", "etwa ein Zwanzigstel"],
      richtig: ["etwa ein Fünftel"],
    },
  },
  {
    id: "x-vermindert-symmetrie",
    stufe: 6,
    begriff: "Der verminderte Septakkord",
    erklaerung:
      "Lauter kleine Terzen übereinander: 1 ♭3 ♭5 ♭♭7, je drei Halbtöne. Weil vier kleine Terzen genau eine Oktave füllen, ist der Akkord symmetrisch — drei Bünde höher ergibt dieselben vier Töne in anderer Reihenfolge. Das ist das Werkzeug der Neoklassik: eine Form, die man ohne Nachdenken über den ganzen Hals schieben kann.",
    frage: {
      art: "eingabe",
      text: "Alle wie viele Bünde wiederholt sich ein verminderter Septakkord?",
      richtig: ["3", "drei"],
    },
  },
  {
    id: "x-anschlaege-pro-sekunde",
    stufe: 6,
    begriff: "Was 180 BPM bedeuten",
    erklaerung:
      "Das Tempo zählt Schläge pro Minute, nicht Anschläge. Achtel bei 180 BPM heisst zwei Anschläge je Schlag, drei Schläge je Sekunde — sechs Anschläge in der Sekunde, und bei reinem Abschlag sechs volle Bewegungen der Hand. Wer das einmal ausrechnet, versteht, warum Downpicking eine Ausdauerfrage ist.",
    frage: {
      art: "eingabe",
      text: "Achtel bei 180 BPM: wie viele Anschläge sind das pro Sekunde?",
      richtig: ["6", "sechs"],
    },
    technique: "downpicking",
  },
]


/** Karten einer Stufe. */
export function cardsOfStufe(stufe: number): TheoryCard[] {
  return THEORY_CARDS.filter((card) => card.stufe === stufe)
}

export function cardById(id: string): TheoryCard | undefined {
  return THEORY_CARDS.find((card) => card.id === id)
}
