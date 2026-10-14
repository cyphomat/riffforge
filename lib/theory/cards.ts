import { stufeInForm } from "./caged"
import { dreiklangTon } from "./dreiklaenge"
import { INTERVALLE, positionsOf, positionsOfInterval, stufeInLage } from "./fretboard"
import { HOER_AUSWAHL, HOER_REIHENFOLGE, type Richtung } from "./gehoer"
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

/**
 * Woran man ein Intervall erkennt, wenn man es hört — je Halbtonzahl ein
 * Satz. Die Hörkarten werden daraus erzeugt statt einzeln geschrieben: so
 * können Name, Halbtonzahl und Erklärung nicht auseinanderlaufen.
 */
const HOER_CHARAKTER: Record<number, string> = {
  1: "Ein Halbton — die engste Reibung, die es gibt. Nacheinander klingt sie wie ein Schritt, der nicht ganz ankommt. Im Metal ist sie der ♭2 aus Phrygisch, die Drohung direkt neben dem Grundton.",
  2: "Ein Ganzton, der gewöhnliche Schritt einer Tonleiter. Er klingt nach Weitergehen, nicht nach Spannung — die meisten Melodien bestehen grösstenteils aus ihm.",
  3: "Drei Halbtöne, der dunkle Kern von Moll. Schon zwei Töne für sich klingen nach Moll, und daran erkennt man sie am leichtesten.",
  4: "Vier Halbtöne, der helle Kern von Dur. Sie klingt offen und freundlich — im Metal fällt sie gerade deshalb auf, wo sie vorkommt.",
  5: "Fünf Halbtöne, der Abstand zweier benachbarter Leersaiten. Leer und offen, weder Dur noch Moll; wer nach Gehör stimmt, hört sie jedes Mal.",
  6: "Sechs Halbtöne, die halbe Oktave. Unruhig und ungelöst, ohne Richtung, in die er sich auflösen will — der Klang, den Metal sucht, wenn es bedrohlich werden soll.",
  7: "Sieben Halbtöne, der Abstand im Powerchord. Stabil und leer, beinahe ein einziger Ton mit mehr Körper — nach der Oktave das am leichtesten erkennbare Intervall.",
  8: "Acht Halbtöne, die Umkehrung der grossen Terz. Weit und schwer, mit einem Zug zurück zur Quinte — die Farbe düsterer Moll-Melodien.",
  9: "Neun Halbtöne, die Umkehrung der kleinen Terz. Weit und hell zugleich; sie klingt eher nach Aufbruch als nach Schwere.",
  10: "Zehn Halbtöne, knapp unter der Oktave. Offen und ungelöst, ohne zu schneiden — als wäre die Oktave noch nicht ganz erreicht.",
  11: "Elf Halbtöne, einen Halbton unter der Oktave. Sie reibt scharf und zieht hörbar weiter zur Oktave — der Leitton, nur weit auseinander.",
  12: "Zwölf Halbtöne: derselbe Ton, eine Etage höher. Beide sind so verwandt, dass sie fast verschmelzen, und genau daran erkennt man sie.",
}

const RICHTUNG_SATZ: Record<Richtung, string> = {
  auf: "",
  ab: " Abwärts heisst das Intervall genauso — der Name misst den Abstand, nicht die Richtung. Schwerer ist es trotzdem, weil das Ohr den zweiten Ton am ersten misst und nach unten weniger Übung hat.",
}

/** Zwölf Hörkarten in einer Richtung, in der Reihenfolge, in der man sie lernen sollte. */
function hoerKarten(richtung: Richtung): TheoryCard[] {
  return HOER_REIHENFOLGE.map((halbtoene) => {
    const name = INTERVALLE[halbtoene].name
    return {
      id: `g-${name.toLowerCase().replace(/\s+/g, "-")}-${richtung}`,
      stufe: 2,
      begriff: `Gehört: ${name} ${richtung === "auf" ? "aufwärts" : "abwärts"}`,
      erklaerung: HOER_CHARAKTER[halbtoene] + RICHTUNG_SATZ[richtung],
      frage: {
        art: "gehoert",
        text: `Zwei Töne nacheinander, der zweite ${richtung === "auf" ? "höher" : "tiefer"}. Welches Intervall hörst du?`,
        auswahl: HOER_AUSWAHL,
        richtig: [name],
        hoeren: { halbtoene, richtung },
      },
    }
  })
}

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

  {
    id: "m-f-erster",
    stufe: 1,
    begriff: "E und F, direkt nebeneinander",
    erklaerung:
      "Zwischen E und F liegt nur ein Halbton — also nur ein Bund. Auf der tiefen E-Saite heisst das: gleich im ersten Bund sitzt F, nicht F#. Wer hier zwei Bünde zählt, liegt bei jedem Riff in F einen Halbton daneben.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt F auf der tiefen E-Saite, so tief wie möglich?",
      richtig: [griff(6, 1)],
    },
  },
  {
    id: "m-d-saite",
    stufe: 1,
    begriff: "Töne auf der D-Saite",
    erklaerung:
      "Die D-Saite trägt dieselben Marken wie die A-Saite, nur eine Quarte höher: 3. Bund F, 5. Bund G, 7. Bund A. Mit E-, A- und D-Saite zusammen hast du den Teil des Halses, auf dem fast jedes Riff spielt.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt F auf der D-Saite?",
      richtig: positionsOf("F").filter((stelle) => stelle.saite === 4),
    },
  },
  {
    id: "m-hohe-e",
    stufe: 1,
    begriff: "Die hohe e-Saite",
    erklaerung:
      "Die dünnste Saite ist wieder ein E, zwei Oktaven über der dicksten. Deshalb tragen beide in jedem Bund denselben Ton: G im 3., A im 5., B im 7. Wer die tiefe E kann, kann die hohe schon.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt G auf der hohen e-Saite?",
      richtig: positionsOf("G").filter((stelle) => stelle.saite === 1),
    },
  },
  {
    id: "m-stimmen",
    stufe: 1,
    begriff: "Nach Gehör stimmen",
    erklaerung:
      "Im 5. Bund klingt jede Saite wie die nächsthöhere leer — tiefe E im 5. ist A, A im 5. ist D, D im 5. ist G. So stimmt man ohne Gerät: einen Ton greifen, die nächste Saite leer daneben, bis beide gleich klingen.",
    frage: {
      art: "eingabe",
      text: "In welchem Bund der tiefen E-Saite klingt derselbe Ton wie die leere A-Saite?",
      richtig: ["5", "fünf", "fuenf"],
    },
  },
  {
    id: "m-stimmen-ausnahme",
    stufe: 1,
    begriff: "Die Ausnahme beim Stimmen",
    erklaerung:
      "Eine Saite bricht die Regel vom 5. Bund: die leere B-Saite findest du auf der G-Saite schon im 4. Bund. Dahinter steckt derselbe Knick, der jede Form über diese beiden Saiten um einen Bund verschiebt — beim Stimmen begegnet man ihm zum ersten Mal.",
    frage: {
      art: "eingabe",
      text: "In welchem Bund der G-Saite klingt derselbe Ton wie die leere B-Saite?",
      richtig: ["4", "vier"],
    },
  },
  {
    id: "m-einlagen",
    stufe: 1,
    begriff: "Die Punkte auf dem Hals",
    erklaerung:
      "Die Einlagen sitzen im 3., 5., 7. und 9. Bund, doppelt im 12. — und dann wiederholt sich das Muster eine Oktave höher. Sie sind kein Schmuck, sondern das schnellste Lineal auf dem Hals: wer weiss, dass im 5. Bund der E-Saite A liegt, braucht nicht zu zählen.",
    frage: {
      art: "auswahl",
      text: "Auf welchen Bünden sitzen die Einlagen bis zur Oktave?",
      auswahl: ["3, 5, 7, 9 und 12", "2, 4, 6, 8 und 12", "3, 6, 9 und 12", "1, 5, 7, 10 und 12"],
      richtig: ["3, 5, 7, 9 und 12"],
    },
  },
  {
    id: "m-b-vorzeichen",
    stufe: 1,
    begriff: "Kreuz und b",
    erklaerung:
      "Ein Kreuz hebt einen Ton um einen Halbton, ein b senkt ihn um einen — auf der Gitarre ein Bund nach oben oder nach unten. Bb liegt also einen Bund unter B, und das ist derselbe Bund wie A#.",
    frage: {
      art: "auswahl",
      text: "Wo liegt Bb, von B aus gesehen?",
      auswahl: ["einen Bund tiefer", "einen Bund höher", "zwei Bünde tiefer", "auf demselben Bund"],
      richtig: ["einen Bund tiefer"],
    },
  },

  {
    id: "m-g-saite",
    stufe: 1,
    begriff: "Töne auf der G-Saite",
    erklaerung:
      "Die G-Saite hat ihre eigenen Marken: 2. Bund A, 5. Bund C, 7. Bund D. Sie ist die Saite, auf der die meisten Bendings liegen — wer dort den Ton kennt, von dem er losgeht, weiss auch, wo er ankommen muss.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt C auf der G-Saite?",
      richtig: positionsOf("C").filter((stelle) => stelle.saite === 3),
    },
  },
  {
    id: "m-b-saite",
    stufe: 1,
    begriff: "Töne auf der B-Saite",
    erklaerung:
      "Auf der B-Saite liegt im 1. Bund C, im 3. D und im 5. E — der 5. Bund klingt also wie die leere hohe e-Saite. Weil sie gegenüber der G-Saite um eine grosse Terz statt einer Quarte versetzt ist, stimmen hier die Marken der tieferen Saiten nicht mehr.",
    frage: {
      art: "griffbrett",
      text: "Wo liegt D auf der B-Saite?",
      richtig: positionsOf("D").filter((stelle) => stelle.saite === 2),
    },
  },
  {
    id: "m-tabulatur",
    stufe: 1,
    begriff: "Tabulatur lesen",
    erklaerung:
      "Eine Tabulatur hat eine Zeile je Saite, und die Zahl darauf ist der Bund. Oben steht die hohe e-Saite, unten die tiefe E — also umgekehrt dazu, wie man von oben auf die Gitarre schaut. Wer das einmal verdreht, spielt jedes Riff auf den falschen Saiten.",
    frage: {
      art: "auswahl",
      text: "Welche Saite steht in einer Tabulatur ganz oben?",
      auswahl: ["die hohe e-Saite", "die tiefe E-Saite", "die A-Saite", "kommt auf die Tabulatur an"],
      richtig: ["die hohe e-Saite"],
    },
  },
  {
    id: "m-tab-null",
    stufe: 1,
    begriff: "Die Null in der Tabulatur",
    erklaerung:
      "Eine 0 heisst: die Saite leer anschlagen, ohne zu greifen. In Metal-Riffs ist sie die häufigste Zahl überhaupt, weil die leere tiefe Saite der Ton ist, auf den ein Riff immer wieder zurückfällt.",
    frage: {
      art: "auswahl",
      text: "Was bedeutet eine 0 auf einer Zeile der Tabulatur?",
      auswahl: [
        "die Saite leer anschlagen",
        "die Saite nicht spielen",
        "die Saite abdämpfen",
        "den Ton davor halten",
      ],
      richtig: ["die Saite leer anschlagen"],
    },
  },
  {
    id: "m-ueber-zwoelf",
    stufe: 1,
    begriff: "Über dem 12. Bund",
    erklaerung:
      "Ab dem 12. Bund wiederholt sich der Hals eine Oktave höher: was im 3. Bund liegt, liegt im 15. wieder. Man muss den oberen Teil also nicht neu lernen — zwölf dazuzählen genügt.",
    frage: {
      art: "eingabe",
      text: "Auf der A-Saite im 3. Bund liegt C. In welchem Bund derselben Saite liegt das C eine Oktave höher?",
      richtig: ["15", "fünfzehn", "fuenfzehn"],
    },
  },
  {
    id: "m-siebte-saite",
    stufe: 1,
    begriff: "Die siebte Saite",
    erklaerung:
      "Eine Siebensaitige in Standardstimmung bekommt unter der tiefen E-Saite eine B-Saite dazu, eine Quarte tiefer — derselbe Abstand wie zwischen allen tiefen Saiten. Die sechs übrigen bleiben, wie sie sind; alles, was man auf der Sechssaitigen kann, gilt weiter.",
    frage: {
      art: "eingabe",
      text: "Wie heisst die tiefste Saite einer Siebensaitigen in Standardstimmung?",
      richtig: ["B"],
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
  {
    id: "i-kleine-terz-form",
    stufe: 2,
    begriff: "Die kleine Terz auf dem Hals",
    erklaerung:
      "Eine Saite höher und zwei Bünde zurück — das ist die kleine Terz, auf jedem Saitenpaar ausser G zu B. Die grosse Terz liegt einen Bund zurück. Die beiden Formen nebeneinander zu sehen ist der schnellste Weg, Dur und Moll auf dem Hals zu unterscheiden.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig die kleine Terz dazu auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 3).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "i-grosse-terz",
    stufe: 2,
    begriff: "Die grosse Terz",
    erklaerung:
      "Vier Halbtöne — der helle Ton im Dur-Akkord. Im Metal-Riff ist sie selten, weil sie unter Verzerrung schnell matscht; dafür ist sie der Ton, der in Phrygisch dominant den ganzen Klang umdreht.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton C liegt auf der A-Saite im 3. Bund. Zeig die grosse Terz dazu auf der D-Saite.",
      gegeben: [griff(5, 3)],
      richtig: positionsOfInterval(griff(5, 3), 4).filter((stelle) => stelle.saite === 4),
    },
  },
  {
    id: "i-kleine-sexte",
    stufe: 2,
    begriff: "Die kleine Sexte",
    erklaerung:
      "Acht Halbtöne über dem Grundton — die sechste Stufe von Moll und die Umkehrung der grossen Terz. Sie ist der dunkle Ton, der Moll-Melodien ihre Schwere gibt; im Riff kippt eine ♭6 auf die Quinte zurück und erzeugt genau das Ziehen, das man aus düsteren Refrains kennt.",
    frage: {
      art: "auswahl",
      text: "Wie viele Halbtöne umfasst die kleine Sexte?",
      auswahl: ["8", "9", "7", "6"],
      richtig: ["8"],
    },
  },
  {
    id: "i-grosse-septime",
    stufe: 2,
    begriff: "Die grosse Septime",
    erklaerung:
      "Elf Halbtöne, einen Halbton unter der Oktave. Als Einzelton zieht sie nach oben zum Grundton — der Leitton, den harmonisch Moll einführt, damit eine Auflösung wirklich ankommt. Zusammen gegriffen mit dem Grundton reibt sie fast so scharf wie die kleine Sekunde.",
    frage: {
      art: "eingabe",
      text: "Wie viele Halbtöne umfasst die grosse Septime?",
      richtig: ["11", "elf"],
    },
  },
  {
    id: "i-quarte-abwaerts",
    stufe: 2,
    begriff: "Eine Quarte nach unten",
    erklaerung:
      "Eine Quarte unter dem Grundton liegt derselbe Ton wie eine Quinte darüber, nur eine Oktave tiefer — Quarte und Quinte ergänzen sich zur Oktave. Unter A liegt deshalb E. Darum klingt ein Powerchord mit der Quinte unten, also umgekehrt gegriffen, so verwandt mit dem normalen.",
    frage: {
      art: "auswahl",
      text: "Welcher Ton liegt eine Quarte unter A?",
      auswahl: ["E", "D", "F", "G"],
      richtig: ["E"],
    },
  },
  {
    id: "i-grosse-sexte",
    stufe: 2,
    begriff: "Die grosse Sexte",
    erklaerung:
      "Neun Halbtöne über dem Grundton, die Umkehrung der kleinen Terz. In Moll ist sie der eine Ton, der Dorisch von natürlichem Moll trennt: mit grosser Sexte klingt Moll weniger schwer, beinahe trotzig.",
    frage: {
      art: "eingabe",
      text: "Wie viele Halbtöne umfasst die grosse Sexte?",
      richtig: ["9", "neun"],
    },
  },
  {
    id: "i-ganzton-saite",
    stufe: 2,
    begriff: "Die grosse Sekunde auf einer Saite",
    erklaerung:
      "Zwei Bünde auf derselben Saite sind eine grosse Sekunde, ein Ganzton. Es ist der Abstand, um den ein gewöhnliches Bending zieht, und der Schritt, aus dem die meisten Tonleitern grösstenteils bestehen.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig die grosse Sekunde auf derselben Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 2).filter((stelle) => stelle.saite === 6),
    },
  },
  {
    id: "i-quartform",
    stufe: 2,
    begriff: "Die Quartform",
    erklaerung:
      "Eine Saite höher im selben Bund liegt die Quarte — weil die Saiten selbst eine Quarte auseinander gestimmt sind. Zwei Töne im selben Bund auf benachbarten Saiten sind deshalb ein Quartpowerchord, und über den Knick zur B-Saite gilt das nicht.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig die Quarte dazu auf der A-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 5).filter((stelle) => stelle.saite === 5),
    },
  },
  {
    id: "i-septime-form",
    stufe: 2,
    begriff: "Die kleine Septime auf dem Hals",
    erklaerung:
      "Zwei Saiten höher im selben Bund liegt die kleine Septime — zwei Quarten übereinander ergeben zehn Halbtöne. Von der tiefen E- und der A-Saite aus findet man sie so ohne Zählen; über die B-Saite hinweg verschiebt sie sich wie alles andere um einen Bund.",
    frage: {
      art: "griffbrett",
      text: "Der Grundton A liegt auf der tiefen E-Saite im 5. Bund. Zeig die kleine Septime dazu auf der D-Saite.",
      gegeben: [griff(6, 5)],
      richtig: positionsOfInterval(griff(6, 5), 10).filter((stelle) => stelle.saite === 4),
    },
  },
  {
    id: "i-stapeln",
    stufe: 2,
    begriff: "Intervalle stapeln",
    erklaerung:
      "Intervalle lassen sich addieren: man zählt die Halbtöne zusammen. Quinte und Quarte übereinander ergeben zwölf, also eine Oktave — genau das greift die Hand beim Powerchord mit Oktave obendrauf.",
    frage: {
      art: "auswahl",
      text: "Eine Quinte und darüber eine Quarte: welches Intervall umspannen sie zusammen?",
      auswahl: ["Oktave", "grosse Septime", "kleine Sexte", "None"],
      richtig: ["Oktave"],
    },
  },
  {
    id: "i-none",
    stufe: 2,
    begriff: "Über die Oktave hinaus",
    erklaerung:
      "Intervalle über der Oktave heissen weiter: die None ist eine Sekunde plus Oktave, die Undezime eine Quarte plus Oktave. Klanglich tragen sie dieselbe Farbe wie ihr kleiner Bruder, nur luftiger — deshalb reibt eine None im Akkord viel weniger als eine Sekunde.",
    frage: {
      art: "eingabe",
      text: "Wie viele Halbtöne umfasst die grosse None?",
      richtig: ["14", "vierzehn"],
    },
  },

  // Hören statt zählen: aufwärts zuerst, abwärts erst danach — abwärts ist
  // dasselbe Intervall, aber schwerer zu hören.
  ...hoerKarten("auf"),
  ...hoerKarten("ab"),

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

  {
    id: "s-dorisch",
    stufe: 3,
    begriff: "Dorisch",
    erklaerung:
      "1 2 ♭3 4 5 6 ♭7 — natürliches Moll mit grosser statt kleiner Sexte. Der eine Ton nimmt Moll die Schwere, ohne es hell zu machen; deshalb klingt Dorisch eher kämpferisch als traurig. Auf den weissen Tasten ist es die Leiter von D bis D.",
    frage: {
      art: "auswahl",
      text: "Welche Stufe trennt Dorisch von natürlichem Moll?",
      auswahl: ["die grosse Sexte", "die grosse Terz", "die kleine Sekunde", "die grosse Septime"],
      richtig: ["die grosse Sexte"],
    },
  },
  {
    id: "s-lokrisch",
    stufe: 3,
    begriff: "Lokrisch",
    erklaerung:
      "1 ♭2 ♭3 4 ♭5 ♭6 ♭7 — der einzige Modus, dessen Quinte vermindert ist. Ohne reine Quinte findet der Grundton keine Ruhe, und ein Powerchord darauf ist ein Tritonus. Für fast alles ist das unbrauchbar, für die finstersten Ecken des Metal genau richtig.",
    frage: {
      art: "auswahl",
      text: "Was macht Lokrisch als Tonart so instabil?",
      auswahl: [
        "die verminderte Quinte über dem Grundton",
        "die grosse Terz über dem Grundton",
        "es hat nur fünf Töne",
        "die grosse Septime unter dem Grundton",
      ],
      richtig: ["die verminderte Quinte über dem Grundton"],
    },
  },
  {
    id: "s-e-pentatonik",
    stufe: 3,
    begriff: "E-Moll-Pentatonik",
    erklaerung:
      "Auf E gebaut ergibt 1 ♭3 4 5 ♭7 die Töne E G A B D. Weil E die tiefste Leersaite ist, liegt die erste Lage dieser Pentatonik ganz unten am Hals, mit vielen Leersaiten — der Grund, warum so viele Riffs in E-Moll stehen.",
    frage: {
      art: "eingabe",
      text: "Welche fünf Töne hat die E-Moll-Pentatonik?",
      richtig: ["E G A B D", "E G A H D"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-lage-terz",
    stufe: 3,
    begriff: "Die kleine Terz in der Lage",
    erklaerung:
      "Die kleine Terz ist der Ton, der Moll nach Moll klingen lässt. In Lage 1 von A-Moll liegt sie auf der tiefen und der hohen E-Saite im 8. Bund und auf der G-Saite im 5. — wer sie anspielt, sagt dem Ohr, welche Tonart gilt.",
    frage: {
      art: "griffbrett",
      text: "A-Moll-Pentatonik, Lage 1 im 5. bis 8. Bund: tippe eine kleine Terz an.",
      richtig: stufeInLage("A", 1, 3),
    },
    technique: "pentatonic",
  },
  {
    id: "s-dur-pentatonik",
    stufe: 3,
    begriff: "Dur- und Moll-Pentatonik",
    erklaerung:
      "Die Dur-Pentatonik ist 1 2 3 5 6, und sie hat dieselben Töne wie die Moll-Pentatonik drei Halbtöne tiefer — wie bei Dur und Moll überhaupt. Die Griffmuster sind also schon bekannt, nur der Ton, auf dem man landet, ist ein anderer.",
    frage: {
      art: "auswahl",
      text: "Welche Dur-Pentatonik hat dieselben Töne wie die A-Moll-Pentatonik?",
      auswahl: ["C-Dur", "A-Dur", "E-Dur", "G-Dur"],
      richtig: ["C-Dur"],
    },
    technique: "pentatonic",
  },
  {
    id: "s-leitton",
    stufe: 3,
    begriff: "Der Leitton",
    erklaerung:
      "In harmonisch Moll liegt die siebte Stufe einen Halbton unter dem Grundton und zieht dorthin zurück. In A harmonisch Moll ist das G# — auf der tiefen E-Saite im 4. Bund, direkt unter dem A im 5. Dieser eine Bund Abstand ist der ganze neoklassische Effekt.",
    frage: {
      art: "griffbrett",
      text: "A harmonisch Moll: zeig den Leitton auf der tiefen E-Saite.",
      richtig: positionsOf("G#").filter((stelle) => stelle.saite === 6),
    },
  },
  {
    id: "s-grundton-hoeren",
    stufe: 3,
    begriff: "Den Grundton eines Riffs finden",
    erklaerung:
      "Der Grundton ist der Ton, auf dem ein Riff zur Ruhe kommt — nicht unbedingt der erste und nicht der tiefste. Meist ist es der, zu dem das Riff am Ende jeder Runde zurückfällt. Wer ihn gefunden hat, weiss, welche Pentatonik darüber passt.",
    frage: {
      art: "auswahl",
      text: "Woran erkennst du den Grundton eines Riffs?",
      auswahl: [
        "an dem Ton, auf dem es zur Ruhe kommt",
        "am ersten Ton",
        "am höchsten Ton",
        "an der dicksten Saite",
      ],
      richtig: ["an dem Ton, auf dem es zur Ruhe kommt"],
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

  {
    id: "a-sus",
    stufe: 4,
    begriff: "sus2 und sus4",
    erklaerung:
      "Bei einem sus-Akkord ist die Terz ersetzt — durch die Sekunde (sus2) oder durch die Quarte (sus4). Damit ist er wie der Powerchord weder Dur noch Moll, hat aber eine Reibung, die nach Auflösung verlangt. Im Riff ist das ein Powerchord mit Spannung.",
    frage: {
      art: "auswahl",
      text: "Was ersetzt in einem sus4-Akkord die Terz?",
      auswahl: ["die Quarte", "die Quinte", "die Sekunde", "die Septime"],
      richtig: ["die Quarte"],
    },
  },
  {
    id: "a-powerchord-oktave",
    stufe: 4,
    begriff: "Der Powerchord mit Oktave",
    erklaerung:
      "Zu Grundton und Quinte kommt der Grundton eine Oktave höher — auf der Saite über der Quinte, im selben Bund wie sie. Der Akkord wird dadurch voller, aber nicht matschiger, weil kein neuer Ton dazukommt.",
    frage: {
      art: "griffbrett",
      text: "G5: Grundton auf der tiefen E-Saite im 3. Bund. Zeig die Oktave dazu auf der D-Saite.",
      gegeben: [griff(6, 3)],
      richtig: positionsOfInterval(griff(6, 3), 12).filter((stelle) => stelle.saite === 4),
    },
    technique: "power-chords",
  },
  {
    id: "a-powerchord-name",
    stufe: 4,
    begriff: "Einen Powerchord benennen",
    erklaerung:
      "Ein Powerchord heisst nach seinem tiefsten Ton, dem Grundton, mit einer 5 dahinter. Liegt der Zeigefinger auf der A-Saite im 7. Bund, ist das E — der Akkord heisst also E5. Wer die Töne auf E- und A-Saite kennt, kann jeden Powerchord sofort benennen.",
    frage: {
      art: "eingabe",
      text: "Zeigefinger auf der A-Saite im 7. Bund, Ringfinger zwei Bünde weiter auf der D-Saite: wie heisst der Powerchord?",
      richtig: ["E5", "E"],
    },
    technique: "power-chords",
  },
  {
    id: "a-dominante-moll",
    stufe: 4,
    begriff: "Die Dominante in harmonisch Moll",
    erklaerung:
      "In natürlichem Moll ist der Akkord auf der fünften Stufe selbst Moll und zieht kaum zurück. Harmonisch Moll erhöht die Septime, und dadurch wird genau dieser Akkord Dur: in A-Moll aus e-Moll ein E-Dur, mit dem G# als Leitton darin. Erst dann kommt die Rückkehr zum Grundton wirklich an.",
    frage: {
      art: "auswahl",
      text: "Welcher Akkord liegt in A harmonisch Moll auf der fünften Stufe?",
      auswahl: ["E-Dur", "e-Moll", "G-Dur", "d-Moll"],
      richtig: ["E-Dur"],
    },
  },
  {
    id: "a-weglassen",
    stufe: 4,
    begriff: "Was man im Akkord weglassen kann",
    erklaerung:
      "Wenn nicht alle Töne Platz haben, fällt zuerst die Quinte: sie färbt kaum und steckt als Oberton ohnehin im Grundton. Die Terz dagegen entscheidet über Dur oder Moll und darf nur weg, wenn man genau das offen lassen will — wie beim Powerchord.",
    frage: {
      art: "auswahl",
      text: "Welchen Ton eines Septakkords lässt man am ehesten weg?",
      auswahl: ["die Quinte", "die Terz", "die Septime", "den Grundton"],
      richtig: ["die Quinte"],
    },
  },
  {
    id: "a-stufen-e-saite",
    stufe: 4,
    begriff: "Die Stufen auf der E-Saite",
    erklaerung:
      "In E-Moll liegen die Powerchords der Tonart alle auf der tiefen E-Saite nebeneinander: leer E, 2. Bund F#, 3. G, 5. A, 7. B, 8. C, 10. D. Die ♭VI ist also das C im 8. Bund — dort, wo die Metal-Kadenz anfängt.",
    frage: {
      art: "griffbrett",
      text: "E-Moll: zeig den Grundton des Powerchords auf der ♭VI. Stufe, auf der tiefen E-Saite.",
      richtig: positionsOf("C").filter((stelle) => stelle.saite === 6),
    },
    technique: "power-chords",
  },

  {
    id: "a-caged-reihenfolge",
    stufe: 4,
    begriff: "CAGED: die Reihenfolge",
    erklaerung:
      "Wer mit einem Akkord den Hals hinaufgeht, trifft die Formen immer in derselben Reihenfolge: C, A, G, E, D, und danach wieder C, eine Oktave höher. Bei C-Dur liegt die C-Form offen, die A-Form im 3. Bund, die G-Form ab dem 5., die E-Form im 8. und die D-Form ab dem 10. Bei einem anderen Akkord beginnt man nur an einer anderen Stelle im Kreis.",
    frage: {
      art: "auswahl",
      text: "C-Dur, ab der offenen C-Form den Hals hinauf: welche Form kommt als nächste?",
      auswahl: ["die A-Form", "die G-Form", "die E-Form", "die D-Form"],
      richtig: ["die A-Form"],
    },
  },
  {
    id: "a-caged-a-form",
    stufe: 4,
    begriff: "CAGED: die A-Form",
    erklaerung:
      "Die A-Form ist der offene A-Dur-Griff, mit dem Zeigefinger als Sattel nach oben geschoben. Ihr tiefster Grundton liegt auf der A-Saite, der zweite zwei Saiten höher auf der G-Saite, zwei Bünde weiter — die Oktavform. Für C-Dur sitzt sie im 3. Bund.",
    frage: {
      art: "griffbrett",
      text: "C-Dur in der A-Form, ab dem 3. Bund: tippe einen Grundton an.",
      richtig: stufeInForm("A", "C", 0),
    },
  },
  {
    id: "a-caged-g-form",
    stufe: 4,
    begriff: "CAGED: Nachbarn teilen sich Töne",
    erklaerung:
      "Die G-Form folgt auf die A-Form und übernimmt deren oberen Grundton: bei C-Dur liegt er für beide auf der G-Saite im 5. Bund. Dazu kommen zwei weitere C auf der tiefen und der hohen E-Saite im 8. Bund. Genau diese geteilten Töne machen aus fünf Griffen eine Karte des Halses statt fünf einzelner Muster.",
    frage: {
      art: "griffbrett",
      text: "C-Dur in der G-Form, im 5. bis 8. Bund: tippe einen Grundton an.",
      richtig: stufeInForm("G", "C", 0),
    },
  },
  {
    id: "a-caged-d-form",
    stufe: 4,
    begriff: "CAGED: die D-Form",
    erklaerung:
      "Die D-Form spielt nur auf den vier hohen Saiten, ihr tiefster Grundton liegt auf der D-Saite. Für E-Dur sitzt sie zwei Bünde hoch: E auf der D-Saite im 2. Bund und noch einmal auf der B-Saite im 5. Sie ist die kleinste der fünf und die, die man im Lead am häufigsten unter der Hand hat.",
    frage: {
      art: "griffbrett",
      text: "E-Dur in der D-Form: tippe einen Grundton an.",
      richtig: stufeInForm("D", "E", 0),
    },
  },
  {
    id: "a-caged-terz",
    stufe: 4,
    begriff: "CAGED: die Terz in der Form",
    erklaerung:
      "Eine Form zu kennen heisst zu wissen, welcher Finger welchen Ton hält. In der E-Form liegt die Terz auf der G-Saite, einen Bund über dem Barré — bei G-Dur im 3. Bund also das B im 4. Bund. Das ist der Ton, den man für Moll einen Bund tiefer greift.",
    frage: {
      art: "griffbrett",
      text: "G-Dur als Barré in der E-Form, Grundton im 3. Bund: tippe die Terz an.",
      gegeben: [griff(6, 3)],
      richtig: stufeInForm("E", "G", 4),
    },
  },
  {
    id: "a-caged-anker",
    stufe: 4,
    begriff: "CAGED: woran die Formen hängen",
    erklaerung:
      "Jede Form hängt an einem Grundton auf einer bestimmten Saite. E-Form und G-Form haben ihren tiefsten Grundton auf der tiefen E-Saite, A-Form und C-Form auf der A-Saite, die D-Form auf der D-Saite. Wer die Töne auf diesen drei Saiten kennt, findet jede Form, ohne zu zählen.",
    frage: {
      art: "auswahl",
      text: "Bei welchen beiden Formen liegt der tiefste Grundton auf der tiefen E-Saite?",
      auswahl: ["E-Form und G-Form", "A-Form und C-Form", "C-Form und D-Form", "E-Form und A-Form"],
      richtig: ["E-Form und G-Form"],
    },
  },
  {
    id: "a-caged-moll",
    stufe: 4,
    begriff: "CAGED in Moll",
    erklaerung:
      "Jede der fünf Formen wird zu Moll, wenn man ihre Terz einen Bund tiefer greift — Grundton und Quinte bleiben, wo sie sind. Bei der E-Form heisst das: der Finger auf der G-Saite fällt weg und das Barré übernimmt den Ton. Zehn Griffe sind es also nicht, sondern fünf und eine Regel.",
    frage: {
      art: "auswahl",
      text: "Wie wird aus einer Dur-Form eine Moll-Form?",
      auswahl: [
        "die Terz einen Bund tiefer greifen",
        "die Quinte einen Bund tiefer greifen",
        "den Grundton einen Bund höher greifen",
        "die ganze Form einen Bund tiefer schieben",
      ],
      richtig: ["die Terz einen Bund tiefer greifen"],
    },
  },

  {
    id: "a-caged-pentatonik",
    stufe: 4,
    begriff: "CAGED und die Pentatonik-Lagen",
    erklaerung:
      "Jede CAGED-Form eines Dur-Akkords liegt vollständig in einer Lage der Moll-Pentatonik mit denselben Tönen — bei C-Dur also A-Moll. Die Zuordnung ist immer dieselbe: G-Form in Lage 1, E-Form in Lage 2, D-Form in Lage 3, C-Form in Lage 4, A-Form in Lage 5. Wer die Lage spielt, hat den Akkord schon unter den Fingern, und umgekehrt.",
    frage: {
      art: "auswahl",
      text: "C-Dur in der G-Form, im 5. bis 8. Bund: in welcher Lage der A-Moll-Pentatonik liegt sie?",
      auswahl: ["Lage 1", "Lage 2", "Lage 4", "Lage 5"],
      richtig: ["Lage 1"],
    },
    technique: "pentatonic",
  },
  {
    id: "a-harmonisiert",
    stufe: 4,
    begriff: "Die harmonisierte Dur-Tonleiter",
    erklaerung:
      "Baut man auf jeder Stufe der Dur-Tonleiter einen Dreiklang aus ihren eigenen Tönen, kommt in jeder Tonart dieselbe Folge heraus: Dur, Moll, Moll, Dur, Dur, Moll, vermindert. Geschrieben I ii iii IV V vi vii°. Wer die Folge kennt, weiss in jeder Tonart, welche Akkorde dazugehören, ohne einen einzigen nachzuschlagen.",
    frage: {
      art: "auswahl",
      text: "Welche Akkordarten liegen auf den sieben Stufen einer Dur-Tonleiter, der Reihe nach?",
      auswahl: [
        "Dur, Moll, Moll, Dur, Dur, Moll, vermindert",
        "Dur, Moll, Dur, Moll, Dur, Moll, vermindert",
        "Moll, vermindert, Dur, Moll, Moll, Dur, Dur",
        "Dur, Dur, Moll, Moll, Dur, Moll, vermindert",
      ],
      richtig: ["Dur, Moll, Moll, Dur, Dur, Moll, vermindert"],
    },
  },
  {
    id: "s-dreiklang-tonleiter",
    stufe: 3,
    begriff: "Vom Dreiklang zur Tonleiter",
    erklaerung:
      "Der Dur-Dreiklang ist 1 3 5. Kommen 2 und 6 dazu, entsteht die Dur-Pentatonik 1 2 3 5 6; kommen danach 4 und 7 dazu, die vollständige Dur-Tonleiter. Die drei sind also keine getrennten Dinge, sondern dasselbe Gerüst in drei Ausbaustufen — und die zwei zuletzt dazugekommenen Töne sind genau die, an denen man sich am leichtesten vergreift.",
    frage: {
      art: "auswahl",
      text: "Welche zwei Stufen machen aus dem Dur-Dreiklang die Dur-Pentatonik?",
      auswahl: ["2 und 6", "4 und 7", "2 und 4", "6 und 7"],
      richtig: ["2 und 6"],
    },
  },

  {
    id: "a-dreiklang-lagen",
    stufe: 4,
    begriff: "Dreiklänge auf drei Saiten",
    erklaerung:
      "Ein Dreiklang in enger Lage passt auf drei benachbarte Saiten: drei Töne, jeder der nächste Akkordton über dem darunter. Welcher unten liegt, ist die Umkehrung — Grundton, Terz oder Quinte. Damit gibt es auf jeder Saitengruppe genau drei Griffe je Akkord und Oktave — nur direkt am Sattel fehlt manchmal einer, weil er unter den leeren Saiten läge.",
    frage: {
      art: "auswahl",
      text: "Ein Dur-Dreiklang in enger Lage auf drei benachbarten Saiten: wie viele verschiedene Griffe gibt es, bevor sich einer eine Oktave höher wiederholt?",
      auswahl: ["drei", "zwei", "fünf", "sechs"],
      richtig: ["drei"],
    },
  },
  {
    id: "a-dreiklang-grundstellung",
    stufe: 4,
    begriff: "Dreiklang in Grundstellung",
    erklaerung:
      "In Grundstellung liegt der Grundton unten, darüber Terz und Quinte. Auf G-, B- und e-Saite heisst das für C-Dur: C auf der G-Saite im 5. Bund, E auf der B-Saite im 5., G auf der e-Saite im 3. Drei Töne, ein Barré aus zwei Fingern und einer — der kleinste vollständige Dur-Akkord, den es auf dem Hals gibt.",
    frage: {
      art: "griffbrett",
      text: "C-Dur auf G-, B- und e-Saite, Grundton unten auf der G-Saite im 5. Bund: tippe die Terz an.",
      gegeben: [griff(3, 5)],
      richtig: dreiklangTon("C", "dur", [3, 2, 1], 0, 4),
    },
  },
  {
    id: "a-dreiklang-erste",
    stufe: 4,
    begriff: "Dreiklang in erster Umkehrung",
    erklaerung:
      "In der ersten Umkehrung liegt die Terz unten, und der Grundton wandert nach oben. Für C-Dur auf G-, B- und e-Saite: E im 9. Bund der G-Saite, G im 8. der B-Saite, C im 8. der e-Saite. Der Grundton oben ist der Ton, den das Ohr als Melodie hört.",
    frage: {
      art: "griffbrett",
      text: "C-Dur auf G-, B- und e-Saite, Terz unten auf der G-Saite im 9. Bund: tippe den Grundton an.",
      gegeben: [griff(3, 9)],
      richtig: dreiklangTon("C", "dur", [3, 2, 1], 1, 0),
    },
  },
  {
    id: "a-dreiklang-zweite",
    stufe: 4,
    begriff: "Dreiklang in zweiter Umkehrung",
    erklaerung:
      "In der zweiten Umkehrung liegt die Quinte unten, der Grundton in der Mitte, die Terz oben. Für G-Dur auf G-, B- und e-Saite: D im 7. Bund der G-Saite, G im 8. der B-Saite, B im 7. der e-Saite. Wer die drei Lagen eines Akkords kennt, findet ihn auf jeder Höhe des Halses, ohne die Hand weit zu bewegen.",
    frage: {
      art: "griffbrett",
      text: "G-Dur auf G-, B- und e-Saite, Quinte unten auf der G-Saite im 7. Bund: tippe den Grundton an.",
      gegeben: [griff(3, 7)],
      richtig: dreiklangTon("G", "dur", [3, 2, 1], 2, 0),
    },
  },
  {
    id: "a-dreiklang-moll",
    stufe: 4,
    begriff: "Moll-Dreiklang auf drei Saiten",
    erklaerung:
      "Ein Moll-Dreiklang ist derselbe Griff mit der Terz einen Bund tiefer. A-Moll in Grundstellung auf D-, G- und B-Saite: A im 7. Bund der D-Saite, C im 5. der G-Saite, E im 5. der B-Saite. Die kleine Terz liegt dabei direkt neben dem Ton, an dem man Moll von Dur unterscheidet.",
    frage: {
      art: "griffbrett",
      text: "A-Moll auf D-, G- und B-Saite, Grundton unten auf der D-Saite im 7. Bund: tippe die kleine Terz an.",
      gegeben: [griff(4, 7)],
      richtig: dreiklangTon("A", "moll", [4, 3, 2], 0, 3),
    },
  },
  {
    id: "a-dreiklang-oben",
    stufe: 4,
    begriff: "Was oben liegt",
    erklaerung:
      "In enger Lage folgen die Töne immer in derselben Runde aufeinander: Grundton, Terz, Quinte, Grundton. Liegt die Terz unten, ist also der Grundton oben; liegt die Quinte unten, ist es die Terz. Der oberste Ton ist der, den man als Melodie hört — wer Dreiklänge für eine Melodie auswählt, wählt sie nach ihm.",
    frage: {
      art: "auswahl",
      text: "Dreiklang in enger Lage, erste Umkehrung: welcher Ton liegt oben?",
      auswahl: ["der Grundton", "die Terz", "die Quinte", "die Septime"],
      richtig: ["der Grundton"],
    },
  },
  {
    id: "a-dreiklang-caged",
    stufe: 4,
    begriff: "Dreiklänge in den CAGED-Formen",
    erklaerung:
      "Jeder Dur-Dreiklang auf G-, B- und e-Saite ist ein Ausschnitt aus einer der fünf CAGED-Formen: die Grundstellung von C-Dur aus der A-Form, die erste Umkehrung aus der E-Form, die zweite aus der C-Form. Wer die Formen kennt, hat die Dreiklänge also schon unter der Hand — und umgekehrt sind die Dreiklänge die handlichen Kerne der grossen Griffe.",
    frage: {
      art: "auswahl",
      text: "Woher kennt die Hand die Dur-Dreiklänge auf G-, B- und e-Saite schon?",
      auswahl: [
        "sie sind Ausschnitte aus den CAGED-Formen",
        "sie sind Teile der Powerchords",
        "sie liegen alle in Pentatonik-Lage 1",
        "gar nicht — sie sind eigene Muster",
      ],
      richtig: ["sie sind Ausschnitte aus den CAGED-Formen"],
    },
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
    technique: "dead-notes",
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
    technique: "dead-notes",
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

  {
    id: "r-half-time",
    stufe: 5,
    begriff: "Half-Time",
    erklaerung:
      "Beim Half-Time-Feel bleibt das Tempo, aber die Betonung kommt halb so oft: die Snare liegt auf der Drei statt auf Zwei und Vier. Das Riff wirkt plötzlich doppelt so schwer, obwohl kein Schlag langsamer geworden ist — der übliche Trick vor einem Breakdown.",
    frage: {
      art: "auswahl",
      text: "Was ändert sich beim Half-Time-Feel?",
      auswahl: [
        "die Betonung kommt halb so oft, das Tempo bleibt",
        "das Metronom läuft halb so schnell",
        "jede Note wird doppelt angeschlagen",
        "der Takt wird zum Dreiertakt",
      ],
      richtig: ["die Betonung kommt halb so oft, das Tempo bleibt"],
    },
  },
  {
    id: "r-tremolo-gezaehlt",
    stufe: 5,
    begriff: "Tremolo wird gezählt",
    erklaerung:
      "Tremolo klingt wie eine Fläche, ist aber ein Raster: meistens Sechzehntel, bei schnellen Stücken Zweiunddreissigstel. Sechzehntel bei 150 BPM sind vier Anschläge je Schlag, zweieinhalb Schläge je Sekunde — zehn Anschläge in der Sekunde. Wer nicht zählt, wird schneller oder langsamer, ohne es zu merken.",
    frage: {
      art: "eingabe",
      text: "Sechzehntel bei 150 BPM: wie viele Anschläge sind das pro Sekunde?",
      richtig: ["10", "zehn"],
    },
    technique: "tremolo",
  },
  {
    id: "r-zweiunddreissigstel",
    stufe: 5,
    begriff: "Zweiunddreissigstel",
    erklaerung:
      "Halbiert man ein Sechzehntel, entsteht ein Zweiunddreissigstel — acht davon auf einen Schlag. Im Tremolo ist das der Wechsel, an dem das Riff aufhört, eine Figur zu sein, und zur Fläche wird: einzelne Anschläge hört man dort nicht mehr.",
    frage: {
      art: "auswahl",
      text: "Wie viele Zweiunddreissigstel passen auf einen Schlag?",
      auswahl: ["8", "6", "4", "16"],
      richtig: ["8"],
    },
    technique: "tremolo",
  },
  {
    id: "r-blast",
    stufe: 5,
    begriff: "Über dem Blast Beat",
    erklaerung:
      "Beim Blast Beat wechseln Bassdrum und Snare in hohem Tempo, oft auf jedem Achtel oder Sechzehntel. Darüber hat ein einzelner Gitarrenanschlag keinen Platz mehr, und die Gitarre spielt Tremolo: die Tonhöhe trägt das Riff, das Schlagzeug den Rhythmus.",
    frage: {
      art: "auswahl",
      text: "Was spielt die Gitarre typischerweise über einem Blast Beat?",
      auswahl: ["Tremolo-Picking", "einzelne ausklingende Akkorde", "Gallops", "Legato-Läufe"],
      richtig: ["Tremolo-Picking"],
    },
    technique: "tremolo",
  },
  {
    id: "r-sieben-achtel",
    stufe: 5,
    begriff: "Ungerade Takte",
    erklaerung:
      "Ein 7/8-Takt wird nicht als sieben gleiche Schläge gezählt, sondern in Gruppen aus Zweien und Dreien, etwa 2+2+3. Die Gruppen geben dem Takt seinen Gang — derselbe 7/8 als 3+2+2 fühlt sich ganz anders an, obwohl gleich viele Achtel darin stehen.",
    frage: {
      art: "auswahl",
      text: "Wie zählt man einen 7/8-Takt meistens?",
      auswahl: [
        "in Gruppen aus Zweien und Dreien",
        "sieben gleich betonte Schläge",
        "wie einen 4/4-Takt mit einer Pause",
        "als zwei Dreiergruppen und einen Auftakt",
      ],
      richtig: ["in Gruppen aus Zweien und Dreien"],
    },
  },
  {
    id: "r-sechs-achtel",
    stufe: 5,
    begriff: "6/8",
    erklaerung:
      "Sechs Achtel in zwei Gruppen zu drei: man fühlt zwei Schläge, die jeweils in drei geteilt sind. Deshalb ist 6/8 kein Dreiertakt und auch nicht dasselbe wie 3/4, obwohl beide sechs Achtel lang sind — 3/4 sind drei Schläge zu zwei.",
    frage: {
      art: "auswahl",
      text: "Wie viele Schläge fühlt man in einem 6/8-Takt?",
      auswahl: ["zwei", "drei", "sechs", "vier"],
      richtig: ["zwei"],
    },
  },
  {
    id: "r-wechselschlag-sechzehntel",
    stufe: 5,
    begriff: "Wechselschlag im Raster",
    erklaerung:
      "Bei Sechzehnteln im Wechselschlag gehen vier Anschläge auf einen Schlag — eine gerade Zahl, also landet jeder Schlag wieder auf einem Abschlag. Die Hand wird damit selbst zum Metronom: ab auf dem Schlag, auf dazwischen. Wer das einmal hat, verliert die Eins nicht mehr.",
    frage: {
      art: "auswahl",
      text: "Sechzehntel im Wechselschlag: womit wird jeder Schlag angeschlagen?",
      auswahl: ["immer mit einem Abschlag", "immer mit einem Aufschlag", "abwechselnd", "das ist egal"],
      richtig: ["immer mit einem Abschlag"],
    },
    technique: "alternate-picking",
  },
  {
    id: "r-wechselschlag-triole",
    stufe: 5,
    begriff: "Triolen im Wechselschlag",
    erklaerung:
      "Drei Anschläge je Schlag sind eine ungerade Zahl: im Wechselschlag beginnt der nächste Schlag deshalb mit dem Aufschlag. Ab und auf wechseln sich auf dem Schlag ab, und genau daran hängt das Gefühl, Triolen seien schwerer — die Hand verliert ihren Anker.",
    frage: {
      art: "auswahl",
      text: "Achteltriolen im Wechselschlag: womit wird jeder Schlag angeschlagen?",
      auswahl: [
        "abwechselnd mit Ab- und Aufschlag",
        "immer mit einem Abschlag",
        "immer mit einem Aufschlag",
        "mit zwei Abschlägen hintereinander",
      ],
      richtig: ["abwechselnd mit Ab- und Aufschlag"],
    },
    technique: "alternate-picking",
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
  {
    id: "x-bending-ziel",
    stufe: 6,
    begriff: "Wo ein Bending ankommt",
    erklaerung:
      "Ein Ganzton-Bending muss genau auf dem Ton landen, der zwei Bünde höher gegriffen liegt. Von D auf der G-Saite im 7. Bund aus ist das E im 9. Bund. Der gegriffene Ton ist der Massstab — ein Bending dazwischen ist nicht ausdrucksvoll, sondern verstimmt.",
    frage: {
      art: "griffbrett",
      text: "Du ziehst die G-Saite im 7. Bund einen Ganzton. Zeig, wo dieser Zielton auf derselben Saite gegriffen liegt.",
      gegeben: [griff(3, 7)],
      richtig: positionsOfInterval(griff(3, 7), 2).filter((stelle) => stelle.saite === 3),
    },
    technique: "bending",
  },
  {
    id: "x-bending-pruefen",
    stufe: 6,
    begriff: "Ein Bending prüfen",
    erklaerung:
      "Erst den Zielton gegriffen anschlagen, dann den Ausgangston ziehen, bis beide gleich klingen. Das Ohr vergleicht zwei Töne viel genauer, als es einen allein beurteilt — und nach ein paar Wochen weiss die Hand, wie weit sie ziehen muss.",
    frage: {
      art: "auswahl",
      text: "Wie prüfst du, ob ein Bending hoch genug ist?",
      auswahl: [
        "den Zielton vorher gegriffen spielen und vergleichen",
        "so weit ziehen, wie die Saite nachgibt",
        "auf das Stimmgerät schauen, während ich ziehe",
        "zählen, wie viele Millimeter die Saite wandert",
      ],
      richtig: ["den Zielton vorher gegriffen spielen und vergleichen"],
    },
    technique: "bending",
  },
  {
    id: "x-bending-pentatonik",
    stufe: 6,
    begriff: "Bendings in der Pentatonik",
    erklaerung:
      "In der Moll-Pentatonik zieht man am liebsten so, dass man auf einem Ton der Tonleiter ankommt: die Quarte einen Ganzton hoch ergibt die Quinte, die kleine Septime einen Ganzton hoch den Grundton. Beide Ziele sind stabil, und deshalb klingen diese Bendings wie ein Schlusspunkt.",
    frage: {
      art: "auswahl",
      text: "A-Moll-Pentatonik: du ziehst die Quarte D einen Ganzton. Welcher Ton kommt an?",
      auswahl: ["E, die Quinte", "F, die kleine Sexte", "C, die kleine Terz", "A, der Grundton"],
      richtig: ["E, die Quinte"],
    },
    technique: "bending",
  },
  {
    id: "x-vibrato",
    stufe: 6,
    begriff: "Vibrato",
    erklaerung:
      "Ein Vibrato ist ein kleines, wiederholtes Bending: die Saite wird gezogen und losgelassen, immer wieder. Weil Ziehen eine Saite nur höher machen kann, schwankt der Ton zwischen dem gegriffenen und einem etwas höheren — nie darunter. Gleichmässig in Breite und Tempo ist es das, was einen gehaltenen Ton singen lässt.",
    frage: {
      art: "auswahl",
      text: "In welche Richtung schwankt ein Vibrato, das durch Ziehen der Saite entsteht?",
      auswahl: [
        "nur nach oben, über den gegriffenen Ton",
        "gleich weit nach oben und unten",
        "nur nach unten, unter den gegriffenen Ton",
        "gar nicht, nur die Lautstärke schwankt",
      ],
      richtig: ["nur nach oben, über den gegriffenen Ton"],
    },
    technique: "bending",
  },
  {
    id: "x-legato-tab",
    stufe: 6,
    begriff: "Legato in der Tabulatur",
    erklaerung:
      "Ein h zwischen zwei Bundzahlen ist ein Hammer-on, ein p ein Pull-off. Angeschlagen wird nur der erste Ton; der zweite entsteht, weil ein Finger auf die schwingende Saite schlägt oder von ihr abzieht. 5h7 heisst also: 5. Bund anschlagen, 7. Bund aufschlagen.",
    frage: {
      art: "auswahl",
      text: "Was bedeutet 5h7 in einer Tabulatur?",
      auswahl: [
        "5. Bund anschlagen, 7. Bund aufschlagen",
        "beide Bünde einzeln anschlagen",
        "vom 5. zum 7. Bund rutschen",
        "den 5. Bund zum Klang des 7. ziehen",
      ],
      richtig: ["5. Bund anschlagen, 7. Bund aufschlagen"],
    },
    technique: "legato",
  },
  {
    id: "x-pull-off",
    stufe: 6,
    begriff: "Der Pull-off ist ein Zupfen",
    erklaerung:
      "Hebt man den Finger beim Pull-off einfach ab, bleibt vom nächsten Ton kaum etwas übrig. Der Finger zieht die Saite deshalb ein wenig seitlich mit und lässt sie dann los — ein kleines Zupfen mit der Greifhand, das die Saite neu anregt.",
    frage: {
      art: "auswahl",
      text: "Warum zieht der Finger beim Pull-off die Saite leicht zur Seite?",
      auswahl: [
        "damit die Saite neu angeregt wird und laut bleibt",
        "damit der Ton höher klingt",
        "damit die anderen Saiten gedämpft werden",
        "damit der Finger schneller wieder frei ist",
      ],
      richtig: ["damit die Saite neu angeregt wird und laut bleibt"],
    },
    technique: "legato",
  },
  {
    id: "x-slide-tab",
    stufe: 6,
    begriff: "Slides in der Tabulatur",
    erklaerung:
      "Ein Schrägstrich zwischen zwei Bundzahlen ist ein Slide: 5/7 rutscht vom 5. hinauf zum 7. Bund, 7\\5 wieder hinunter. Angeschlagen wird nur der erste Ton; der Finger bleibt die ganze Strecke auf der Saite.",
    frage: {
      art: "auswahl",
      text: "Was bedeutet 5/7 in einer Tabulatur?",
      auswahl: [
        "vom 5. zum 7. Bund rutschen",
        "5. und 7. Bund gleichzeitig greifen",
        "5. Bund anschlagen, 7. Bund aufschlagen",
        "der 5. Bund im 7/8-Takt",
      ],
      richtig: ["vom 5. zum 7. Bund rutschen"],
    },
    technique: "slides",
  },
  {
    id: "x-slide-druck",
    stufe: 6,
    begriff: "Ein Slide, der ankommt",
    erklaerung:
      "Ein Slide klingt nur durch, solange der Finger fest auf der Saite bleibt — lässt der Druck unterwegs nach, stirbt der Ton. Und er hört am Zielbund auf, nicht kurz davor oder danach: das Ziel ist der Ton, die Strecke nur der Weg dorthin.",
    frage: {
      art: "auswahl",
      text: "Woran hängt es, dass ein Slide sauber durchklingt?",
      auswahl: [
        "der Druck bleibt, bis der Zielbund erreicht ist",
        "der Finger hebt kurz vor dem Ziel ab",
        "die Saite wird am Ziel neu angeschlagen",
        "möglichst schnell rutschen, egal wohin",
      ],
      richtig: ["der Druck bleibt, bis der Zielbund erreicht ist"],
    },
    technique: "slides",
  },
  {
    id: "x-palm-mute-stelle",
    stufe: 6,
    begriff: "Wo der Handballen liegt",
    erklaerung:
      "Beim Palm Mute liegt die Kante der Anschlaghand auf den Saiten, direkt vor dem Steg. Wenige Millimeter entscheiden: zu weit zum Hals hin erstickt der Ton zum Klacken, zu weit auf dem Steg wird er gar nicht gedämpft.",
    frage: {
      art: "auswahl",
      text: "Wo liegt die Hand beim Palm Mute?",
      auswahl: [
        "auf den Saiten, direkt vor dem Steg",
        "auf den Saiten über dem Hals",
        "neben den Saiten auf dem Korpus",
        "auf dem Tonabnehmer am Hals",
      ],
      richtig: ["auf den Saiten, direkt vor dem Steg"],
    },
    technique: "palm-mute",
  },
  {
    id: "x-dead-note-tab",
    stufe: 6,
    begriff: "Dead Notes in der Tabulatur",
    erklaerung:
      "Wo in der Tabulatur ein x statt einer Bundzahl steht, wird die Saite angeschlagen, aber nicht gegriffen — die Greifhand liegt nur lose darauf. Heraus kommt ein Klacken ohne Ton, das den Rhythmus trägt.",
    frage: {
      art: "eingabe",
      text: "Welches Zeichen steht in einer Tabulatur für eine Dead Note?",
      richtig: ["x"],
    },
    technique: "dead-notes",
  },
  {
    id: "x-inside-picking",
    stufe: 6,
    begriff: "Saitenwechsel im Wechselschlag",
    erklaerung:
      "Wechselt der Ton auf eine Nachbarsaite, kommt es darauf an, in welche Richtung der letzte Anschlag ging. Beim Inside Picking schlägt das Plektrum zwischen den beiden Saiten an, beim Outside Picking muss es von aussen um beide herum. Welche Variante sich leichter anfühlt, ist von Hand zu Hand verschieden — gerade deshalb lohnt es sich, beide bewusst zu üben.",
    frage: {
      art: "auswahl",
      text: "Was heisst Inside Picking beim Saitenwechsel?",
      auswahl: [
        "das Plektrum schlägt zwischen den beiden Saiten an",
        "das Plektrum geht von aussen um beide Saiten herum",
        "auf beiden Saiten nur Abschläge",
        "die Saite wird mit der Greifhand angeschlagen",
      ],
      richtig: ["das Plektrum schlägt zwischen den beiden Saiten an"],
    },
    technique: "alternate-picking",
  },
  {
    id: "x-sieben-stimmen",
    stufe: 6,
    begriff: "Die siebte Saite stimmen",
    erklaerung:
      "Die tiefe B-Saite liegt eine Quarte unter der E-Saite, wie alle tiefen Saiten zueinander. Im 5. Bund klingt sie deshalb wie die leere tiefe E-Saite — dieselbe Regel wie beim Stimmen nach Gehör, nur eine Saite weiter unten.",
    frage: {
      art: "eingabe",
      text: "In welchem Bund der tiefen B-Saite klingt derselbe Ton wie die leere tiefe E-Saite?",
      richtig: ["5", "fünf", "fuenf"],
    },
  },
  {
    id: "x-drop-c",
    stufe: 6,
    begriff: "Drop C",
    erklaerung:
      "Drop C ist Drop D einen Ganzton tiefer: alle Saiten zwei Halbtöne runter, die tiefste noch einmal zwei. Von tief nach hoch C G C F A D. Die Griffe bleiben die aus Drop D, nur klingt alles tiefer — und die Saiten müssen dicker werden, damit sie nicht schlackern.",
    frage: {
      art: "auswahl",
      text: "Welche Töne hat Drop C, von der tiefsten zur höchsten Saite?",
      auswahl: ["C G C F A D", "C A D G B E", "D A D G B E", "C F Bb Eb G C"],
      richtig: ["C G C F A D"],
    },
  },
  {
    id: "x-breakdown",
    stufe: 6,
    begriff: "Breakdown",
    erklaerung:
      "Ein Breakdown nimmt die Melodie weg und lässt den Rhythmus übrig: tiefe, gedämpfte Anschläge auf der Leersaite, Pausen, die genauso zählen wie die Töne, und oft ein Half-Time-Feel darunter. Er wirkt langsamer, obwohl das Tempo oft dasselbe bleibt.",
    frage: {
      art: "auswahl",
      text: "Was macht einen Breakdown aus?",
      auswahl: [
        "der Rhythmus tritt vor, die Melodie zurück",
        "ein schnelles Solo über dem Riff",
        "ein Tonartwechsel nach oben",
        "das Schlagzeug setzt aus",
      ],
      richtig: ["der Rhythmus tritt vor, die Melodie zurück"],
    },
    technique: "palm-mute",
  },
  {
    id: "x-tritonus-e",
    stufe: 6,
    begriff: "Der Tritonus über E",
    erklaerung:
      "Sechs Halbtöne über E liegt A#, gleichbedeutend Bb — auf der tiefen E-Saite im 6. Bund. Ein Riff, das von der leeren E-Saite dorthin springt und wieder zurück, ist eines der ältesten Mittel, im Metal Bedrohung herzustellen.",
    frage: {
      art: "eingabe",
      text: "Grundton E: welcher Ton liegt einen Tritonus darüber?",
      richtig: ["A#", "Bb"],
    },
  },
]


/** Karten einer Stufe. */
export function cardsOfStufe(stufe: number): TheoryCard[] {
  return THEORY_CARDS.filter((card) => card.stufe === stufe)
}

export function cardById(id: string): TheoryCard | undefined {
  return THEORY_CARDS.find((card) => card.id === id)
}
