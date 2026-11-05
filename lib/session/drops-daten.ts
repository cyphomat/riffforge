import { dropSchema, type Drop } from "./drops"

/**
 * Die Drops, ein Datensatz je Monat, der neueste unten. Texte in eigenen
 * Worten; jeder Fakt ab "selten" steht mit Quelle da und wird von
 * `drops.test.ts` auf Vollständigkeit geprüft.
 *
 * Ein neuer Monat: Eintrag anhängen, Bühne in `tools/drops.mjs` ergänzen,
 * das Werkzeug laufen lassen (`public/bilder/drop-<id>.png`).
 */

const MARSHALL = "https://en.wikipedia.org/wiki/Marshall_Amplification"
const MESA = "https://en.wikipedia.org/wiki/Mesa_Boogie"
const PEAVEY = "https://en.wikipedia.org/wiki/Peavey_5150"
const HM2 = "https://en.wikipedia.org/wiki/Boss_HM-2"

const ROH: unknown[] = [
  {
    id: "2026-11",
    titel: "Röhren und Kettensäge",
    thema: "Verstärker",
    text: "Vier Namen, die den Metal-Sound gebaut haben — und das Pedal, das ihn dreckig machte.",
    datum: "2026-11-01",
    plektren: [
      { id: "g-standby", stufe: "g", name: "Standby", farbe: "#6c7377", form: "std", text: "Erst anwärmen, dann spielen. Die Röhren danken es." },
      { id: "g-netzkabel", stufe: "g", name: "Netzkabel", farbe: "#1f1f22", form: "std", text: "Ohne Strom bleibt jedes Riff ein Gerücht." },
      { id: "g-master", stufe: "g", name: "Master auf 3", farbe: "#e8c23a", form: "jazz", text: "Leise anfangen, lauter werden, wenn es sitzt." },
      { id: "g-klinke", stufe: "g", name: "Klinkenkabel", farbe: "#c8322b", form: "tri", text: "Drei Meter reichen. Mehr Kabel, mehr Stolperfallen." },
      {
        id: "s-bassman",
        stufe: "s",
        name: "Bassman-Erbe",
        farbe: "#b9c0c6",
        form: "std",
        material: "metall",
        text: "Der erste Marshall hatte einen Vorfahren aus Kalifornien.",
        fakt: "Der erste Marshall-Verstärker, der JTM45, war dem Fender Bassman nachempfunden.",
        quelle: MARSHALL,
      },
      {
        id: "s-boogie",
        stufe: "s",
        name: "Boogie",
        farbe: "#dfe6ea",
        form: "std",
        material: "perl",
        text: "Ein Ausruf wurde zum Markennamen.",
        fakt: "Der Name „Boogie“ stammt von Carlos Santana, der einen umgebauten Fender Princeton testete und rief: „Man, that amp really boogies!“",
        quelle: MESA,
      },
      {
        id: "s-mesa",
        stufe: "s",
        name: "Mesa",
        farbe: "#7c8287",
        form: "std",
        material: "stein",
        text: "Der Wunschname war schon vergeben.",
        fakt: "Randall Smith wollte seine Firma „Marin Engineering“ nennen, der Name war vergeben — „Mesa“ wählte er spontan.",
        quelle: MESA,
      },
      {
        id: "e-super-lead",
        stufe: "e",
        name: "Super Lead",
        farbe: "#d9a400",
        form: "std",
        material: "gold",
        text: "Lauter ging nicht, also wurde ein neuer Verstärker gebaut.",
        fakt: "Marshall entwickelte den 100-Watt-Röhrenverstärker auf Wunsch von Pete Townshend und John Entwistle von The Who, die mehr Lautstärke suchten.",
        quelle: MARSHALL,
      },
      {
        id: "e-5150",
        stufe: "e",
        name: "5150",
        farbe: "#a8302a",
        form: "std",
        material: "gold",
        text: "Ein Studio, ein Gesetz, ein Verstärker.",
        fakt: "Der Peavey 5150 trägt den Namen von Eddie Van Halens Studio 5150, erschien 1992 und heißt seit der Trennung von Van Halen und Peavey 2004 6505.",
        quelle: PEAVEY,
      },
      {
        id: "e-kettensaege",
        stufe: "e",
        name: "Kettensäge",
        farbe: "#e07a26",
        form: "tri",
        material: "gold",
        zugabe: true,
        text: "Alle Regler auf Anschlag — und plötzlich klingt ganz Stockholm gleich.",
        fakt: "Das Boss HM-2 wurde von Oktober 1983 bis Oktober 1991 gebaut; mit voll aufgedrehten Reglern prägte es den schwedischen Death-Metal-Sound, etwa auf Entombeds „Left Hand Path“ (1990).",
        quelle: HM2,
      },
    ],
    sprueche: [
      "Erst die Röhren anwärmen, dann das Riff.",
      "Lauter macht nicht besser. Sauber macht besser.",
      "Der Amp rettet nichts, was die Finger nicht liefern.",
      "Gain auf Anschlag ist keine Technik, sondern ein Geständnis.",
      "Ein Verstärker ist nur so tight wie der, der davorsteht.",
    ],
  },
]

export const DROPS: Drop[] = ROH.map((d) => dropSchema.parse(d))
