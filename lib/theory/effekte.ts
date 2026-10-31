import { z } from "zod"

/**
 * Das Pedal- und Effektlexikon: was ein Effekt tut, wofür der Metal ihn nimmt
 * und — vor allem — wo er in der Signalkette steht.
 *
 * Die Kette ist eine Konvention, kein Gesetz. Deshalb trägt jeder Eintrag
 * einen festen Platz (`ort` und `platz`) und, wo es Streit gibt, eine
 * `ausnahme`. Der Platz ist das, was `effekte.test.ts` prüft: die Reihenfolge
 * muss auch dann stimmen, wenn jemand einen Eintrag ergänzt.
 *
 * Alles selbst geschrieben, wie die Karten und Songs. Geräte stehen nur als
 * Beispiel, damit man das Ding im Laden findet; keine Kaufempfehlung.
 */

/** Die Stationen der Kette, in Signalrichtung. */
export const ORTE = [
  {
    value: "vorne",
    label: "Vor dem Amp",
    erklaerung:
      "Zwischen Gitarre und Eingang des Amps. Alles hier geht in die Verzerrung der Vorstufe und wird mitverzerrt.",
  },
  {
    value: "amp",
    label: "Amp-Vorstufe",
    erklaerung: "Hier zerrt der Amp. Was davor steht, formt die Verzerrung, was dahinter steht, hört sie nur noch.",
  },
  {
    value: "loop",
    label: "FX-Loop",
    erklaerung:
      "Hinter der Vorstufe, vor der Endstufe. Effekte im Loop bearbeiten den schon verzerrten Ton und bleiben klar, auch bei viel Gain.",
  },
  {
    value: "hinten",
    label: "Endstufe und Box",
    erklaerung: "Am Ende wird aus dem Signal Schall. Hier gibt es keine Pedale mehr, nur noch den Klang des Geräts.",
  },
] as const

export type Ort = (typeof ORTE)[number]["value"]

export const KATEGORIEN = [
  { value: "dynamik", label: "Dynamik" },
  { value: "verzerrung", label: "Verzerrung" },
  { value: "filter", label: "Filter und EQ" },
  { value: "modulation", label: "Modulation" },
  { value: "zeit", label: "Zeit" },
  { value: "pitch", label: "Tonhöhe" },
  { value: "amp", label: "Amp" },
  { value: "hilfen", label: "Hilfen" },
] as const

export type Kategorie = (typeof KATEGORIEN)[number]["value"]

const ORT_WERTE = ORTE.map((o) => o.value) as [Ort, ...Ort[]]
const KATEGORIE_WERTE = KATEGORIEN.map((k) => k.value) as [Kategorie, ...Kategorie[]]

export const effektSchema = z.object({
  id: z.string().regex(/^fx-[a-z-]+$/),
  name: z.string().min(1),
  kategorie: z.enum(KATEGORIE_WERTE),
  ort: z.enum(ORT_WERTE),
  /**
   * Die Stelle in der Kette innerhalb des Ortes, aufsteigend in Signalrichtung.
   * In Zehnerschritten, damit ein neuer Eintrag dazwischen passt.
   */
  platz: z.number().int().positive(),
  /** Was der Effekt tut — ein bis zwei Sätze. */
  wofuer: z.string().min(1),
  /** Wo man ihn im Metal hört. */
  metal: z.string().min(1),
  /** Eine übliche Startstellung zum Ausprobieren. */
  einstellung: z.string().min(1),
  /** Das, was man beim ersten Mal falsch macht. */
  fallstrick: z.string().min(1),
  /** Wo die Reihenfolge umstritten ist oder es einen guten Grund gibt, davon abzuweichen. */
  ausnahme: z.string().min(1).optional(),
  /** Geräte, an denen man ihn kennt. */
  beispiele: z.array(z.string().min(1)).optional(),
})

export type Effekt = z.infer<typeof effektSchema>

export const EFFEKTE: Effekt[] = [
  // ── Vor dem Amp ──────────────────────────────────────────────
  {
    id: "fx-stimmgeraet",
    name: "Stimmgerät",
    kategorie: "hilfen",
    ort: "vorne",
    platz: 10,
    wofuer: "Zeigt an, wie weit eine Saite vom Soll entfernt ist, und schaltet beim Stimmen das Signal stumm.",
    metal:
      "Im Proberaum nach jedem Wechsel auf Drop D oder die Siebensaitige, auf der Bühne zwischen den Songs, ohne dass jemand das Gestimme hört.",
    einstellung: "Auf die Stimmung der Gitarre stellen (Standard, Drop D, B Standard), Referenz 440 Hz.",
    fallstrick:
      "Steht es hinter den Verzerrern, misst es gegen Rauschen und Gain: das Gerät bekommt kein sauberes Signal und zittert.",
    beispiele: ["Boss TU-3", "TC Polytune"],
  },
  {
    id: "fx-buffer",
    name: "Buffer und True Bypass",
    kategorie: "hilfen",
    ort: "vorne",
    platz: 20,
    wofuer:
      "Ein Buffer hält das Gitarrensignal bei langen Kabeln und vielen Pedalen kräftig, damit die Höhen nicht verloren gehen. True Bypass schaltet ein ausgeschaltetes Pedal komplett aus dem Signalweg.",
    metal:
      "Zehn True-Bypass-Pedale und acht Meter Kabel klingen dumpf; ein Buffer am Anfang richtet das, ohne dass ein Pedal an sein muss.",
    einstellung: "Nichts einzustellen. Ein einziger Buffer am Anfang der Kette genügt.",
    fallstrick:
      "Zu viele Buffer hintereinander färben den Ton selbst, und ein Fuzz mag nichts Gepuffertes vor sich.",
    ausnahme: "Mit einem Fuzz Face steht das Fuzz zuerst und der Buffer dahinter.",
    beispiele: ["Boss Pedale (meist gepuffert)", "Behringer Buffer"],
  },
  {
    id: "fx-wah",
    name: "Wah",
    kategorie: "filter",
    ort: "vorne",
    platz: 30,
    wofuer:
      "Ein Filter, den der Fuss durchfährt: er hebt einen schmalen Frequenzbereich an und schiebt ihn zwischen Bass und Höhen. Das gibt den Wah-Klang.",
    metal:
      "Leads und Soli mit Stimme drin, oder halb getreten als fester, schneidender Filter für ein Solo.",
    einstellung:
      "Pedal ganz zurück klingt dumpf, ganz vorne schneidend. In der Mitte stehen gelassen wird es zu einem festen Filter.",
    fallstrick:
      "Hinter dem Verzerrer wird der Sweep schwächer und klingt anders: der Verzerrer hat das Signal schon verdichtet, bevor das Filter es bekommt.",
    ausnahme:
      "Hendrix spielte das Wah vor dem Fuzz Face, so wie es üblich ist. Das Problem ist das Fuzz Face: es mag kein Wah davor und kann dann quietschen. Deshalb stellen manche das Fuzz vor das Wah, andere einen Puffer dazwischen.",
    beispiele: ["Dunlop Cry Baby", "Vox V847"],
  },
  {
    id: "fx-whammy",
    name: "Pitch-Shifter und Whammy",
    kategorie: "pitch",
    ort: "vorne",
    platz: 40,
    wofuer:
      "Verschiebt die Tonhöhe: um feste Intervalle wie Oktave oder Quinte, parallel zum Originalton als Harmonizer oder stufenlos per Fusspedal wie ein Hebel.",
    metal:
      "Dive-Bombs und kreischende Leads, ohne den Hebel der Gitarre zu belasten; Oktave tiefer für Riffs, die dicker klingen sollen als die Gitarre.",
    einstellung:
      "Bei fester Verschiebung den Effektanteil auf 100 % und mit dem Pedal dosieren; als Harmonizer beide Signale etwa gleich laut.",
    fallstrick:
      "Das Pedal verfolgt die Tonhöhe und braucht dafür ein klares Signal. Bei Akkorden wird es unsicher und schwankt, hinter Verzerrung noch mehr.",
    ausnahme:
      "Manche stellen ihn hinter den Verzerrer: das klingt anders und folgt schlechter. Ein mehrstimmiger Harmonizer steht dort häufiger als ein klassisches Whammy.",
    beispiele: ["DigiTech Whammy", "Boss PS-6"],
  },
  {
    id: "fx-octaver",
    name: "Octaver",
    kategorie: "pitch",
    ort: "vorne",
    platz: 50,
    wofuer: "Mischt eine Oktave tiefer (oder höher) unter das Signal.",
    metal:
      "Einzelne Töne bekommen Gewicht: ein Riff auf der tiefen Saite klingt wie mit Bass dazu, oder ein Solo wird dicker.",
    einstellung: "Die tiefe Oktave nur halb so laut wie das Originalsignal, sonst frisst sie den Ton.",
    fallstrick: "Einfache (monophone) Octaver folgen nur einzelnen Tönen; bei Akkorden blubbern sie. Polyphone Modelle wie der Boss OC-5 im Poly-Modus kommen mit Akkorden besser zurecht.",
    beispiele: ["Boss OC-5", "EHX Nano POG"],
  },
  {
    id: "fx-kompressor",
    name: "Kompressor",
    kategorie: "dynamik",
    ort: "vorne",
    platz: 60,
    wofuer:
      "Macht laute Anschläge leiser und leise lauter. Das gleicht die Lautstärke aus und verlängert den Ton.",
    metal:
      "Selten: in cleanen Passagen und bei Funk-Anschlägen. Bei viel Gain macht der Amp die Kompression ohnehin selbst.",
    einstellung: "Verhältnis etwa 4:1, Attack mittel, Pegel so, dass der saubere Ton nur leicht einspringt.",
    fallstrick:
      "Ist selbst rauschig und hebt Nebengeräusche mit an. Vor starkem Gain wird dieses Rauschen mitverstärkt.",
    ausnahme:
      "Hinter dem Verzerrer quetscht er einen schon verdichteten Ton und klingt platt. Manche nehmen das in Kauf, weil das Rauschen dann kleiner bleibt.",
    beispiele: ["MXR Dyna Comp", "Boss CS-3"],
  },
  {
    id: "fx-fuzz",
    name: "Fuzz",
    kategorie: "verzerrung",
    ort: "vorne",
    platz: 70,
    wofuer:
      "Verzerrt hart und kratzig, bis das Signal fast ein Rechteck ist. Klingt dichter und rauer als ein Overdrive.",
    metal: "Doom, Stoner und Sludge: der Big Muff ist der klassische dicke Sound für Leads und tiefe Riffs.",
    einstellung: "Sustain nach Gefühl; das Gitarren-Volume zurückdrehen, bis es aufräumt, dann ist es ein zweiter Sound.",
    fallstrick:
      "Fuzz reagiert auf alles, was davor steht: ein Buffer oder Wah davor ändert den Klang deutlich, und nicht immer zum Guten.",
    ausnahme: "Ein Fuzz Face, besonders mit Germanium, will die Gitarre direkt hören, also vor Buffer und Wah. Mit einem Puffer zwischen Wah und Fuzz geht auch die übliche Reihenfolge.",
    beispiele: ["EHX Big Muff Pi", "Dunlop Fuzz Face"],
  },
  {
    id: "fx-distortion",
    name: "Distortion",
    kategorie: "verzerrung",
    ort: "vorne",
    platz: 80,
    wofuer:
      "Verzerrt härter als ein Overdrive, auch ohne Amp-Gain. Kompression und Obertöne sind fest eingebaut.",
    metal:
      "Der Grundsound, wenn der Amp clean bleibt oder wenig Gain hat. Das Boss DS-1 und das MT-2 sind in vielen Anfänger-Rigs der erste Zerrer.",
    einstellung:
      "Gain am Pedal nicht voll aufdrehen: ab etwa drei Uhr wird es matschig und der Anschlag verschwindet.",
    fallstrick:
      "Ein Distortion-Pedal vor einem schon stark zerrenden Amp macht keinen härteren Sound, nur einen undeutlicheren.",
    ausnahme:
      "Zwei Verzerrer hintereinander: der mit weniger Gain zuerst, der mit mehr dahinter. Das ist Geschmack, hier hilft Probieren.",
    beispiele: ["Boss DS-1", "Boss MT-2", "ProCo RAT"],
  },
  {
    id: "fx-overdrive",
    name: "Overdrive und Tube Screamer",
    kategorie: "verzerrung",
    ort: "vorne",
    platz: 90,
    wofuer:
      "Wärmt das Signal an und kippt sanft in die Verzerrung. Der Tube Screamer hebt dazu die Mitten und kappt den tiefen Bass.",
    metal:
      "Fast jede Metal-Kette hat einen davor: er strafft den Bass vor der Hochgain-Vorstufe, deshalb klingen Palm Mutes klarer.",
    einstellung:
      "Drive ganz oder fast ganz zurück, Level hoch (ab etwa zwei Uhr), Tone nach Geschmack. Das Pedal soll nicht zerren, sondern den Amp anschieben.",
    fallstrick:
      "Viel Drive am Pedal gibt matschige Mitten, die die Vorstufe noch einmal verzerrt.",
    ausnahme:
      "Direkt vor dem Amp, also hinter allen anderen Verzerrern: dort strafft er auch deren Bass mit.",
    beispiele: ["Ibanez TS808", "Ibanez TS9", "Maxon OD808"],
  },
  {
    id: "fx-booster",
    name: "Clean Boost",
    kategorie: "dynamik",
    ort: "vorne",
    platz: 100,
    wofuer:
      "Hebt den Pegel an, ohne den Klang zu färben. Man schiebt damit den Amp oder einen Verzerrer härter an.",
    metal: "Als Solo-Knopf: ein Tritt, und die Lead-Linie ist ein paar Dezibel lauter als der Rhythmus.",
    einstellung: "Gerade so viel, dass das Solo aus der Band tritt. Mehr als etwa 6 dB ist nur lauter, nicht besser.",
    fallstrick: "Beim Anheben wird auch das Rauschen lauter, und ein vergessener Boost macht den Rhythmus zu laut.",
    ausnahme:
      "Vor dem Overdrive schiebt er ihn härter in die Verzerrung, hinter ihm hebt er nur die Lautstärke. Das sind zwei verschiedene Effekte im selben Pedal.",
    beispiele: ["MXR Micro Amp", "EHX LPB-1"],
  },
  {
    id: "fx-eq",
    name: "Grafischer EQ",
    kategorie: "filter",
    ort: "vorne",
    platz: 110,
    wofuer:
      "Hebt oder senkt feste Frequenzbänder. Vor dem Amp formt er, was in die Verzerrung geht.",
    metal:
      "Mitten anheben und tiefen Bass abschneiden: der Amp zerrt dann nicht den Tiefbass mit, und der Ton wird straff.",
    einstellung: "Unter 80 Hz absenken, bei etwa 700 bis 800 Hz um drei bis sechs Dezibel anheben.",
    fallstrick:
      "Vor dem Amp ändert er auch, wie stark der Amp zerrt: wer Pegel anhebt, bekommt mehr Gain, nicht nur mehr Lautstärke.",
    ausnahme:
      "Im FX-Loop ändert er den fertigen Ton, nicht die Verzerrung. Dort glättet man die Box oder hebt ein Solo an.",
    beispiele: ["MXR 10-Band EQ", "Boss GE-7"],
  },

  // ── Amp-Vorstufe ─────────────────────────────────────────────
  {
    id: "fx-amp",
    name: "Amp-Vorstufe",
    kategorie: "amp",
    ort: "amp",
    platz: 10,
    wofuer:
      "Hier zerrt der Amp, mit Röhren oder als Modell. Die meiste Verzerrung entsteht in dieser Vorstufe, nicht in den Pedalen.",
    metal: "Der Gain-Kanal des Amps ist das Fundament, Pedale davor schärfen ihn nach.",
    einstellung: "Gain moderat, Mitten nicht ganz zurück, Bass zurückhaltend. Dann mit einem Pedal davor nachschärfen.",
    fallstrick:
      "Mehr Gain ist nicht mehr Härte: bei sehr viel Gain verschwimmen die Töne, und Palm Mutes klingen weich.",
    ausnahme: "Was vor dem Amp steht, geht in die Verzerrung. Was im FX-Loop steht, trifft nur den fertigen Ton.",
  },

  // ── FX-Loop ──────────────────────────────────────────────────
  {
    id: "fx-loop",
    name: "FX-Loop",
    kategorie: "amp",
    ort: "loop",
    platz: 10,
    wofuer:
      "Ein Weg zwischen Vorstufe und Endstufe: Send geht raus, Return kommt zurück. Effekte im Loop bearbeiten den fertigen, verzerrten Ton.",
    metal:
      "Delay, Reverb und Modulation werden hier nicht mitverzerrt: sie klingen klar, auch wenn der Amp viel Gain hat.",
    einstellung: "Loop-Pegel so, dass das Signal mit und ohne Effekt gleich laut ist (Unity).",
    fallstrick:
      "Nicht jeder Amp hat einen Loop. Fehlt er, stehen die Effekte vor dem Amp und werden mitverzerrt.",
  },
  {
    id: "fx-gate",
    name: "Noise Gate",
    kategorie: "dynamik",
    ort: "loop",
    platz: 20,
    wofuer:
      "Schaltet das Signal stumm, sobald es unter eine Schwelle fällt: Rauschen und Brummen verschwinden zwischen den Noten.",
    metal:
      "Bei viel Gain Pflicht: Palm Mutes enden abrupt, und die Pausen zwischen den Riffs sind wirklich still.",
    einstellung:
      "Schwelle so, dass es beim Ausklingen sauber schliesst, aber ein leise ausklingender Akkord nicht abgehackt wird.",
    fallstrick: "Zu hoch eingestellt wird es zum Schneidwerkzeug: Ausklang und leise Stellen werden abgehackt.",
    ausnahme:
      "Vor dem Amp hört das Gate auf das Brummen der Tonabnehmer, im Loop nur auf das Rauschen der Vorstufe; manche nehmen zwei. Wer mit Pedalen zerrt statt mit dem Amp, stellt es hinter die Verzerrer. In beiden Fällen steht es vor Delay und Reverb, sonst schneidet es deren Ausklang ab.",
    beispiele: ["ISP Decimator", "Boss NS-2"],
  },
  {
    id: "fx-volumen",
    name: "Volumenpedal",
    kategorie: "dynamik",
    ort: "loop",
    platz: 30,
    wofuer:
      "Regelt die Lautstärke mit dem Fuss, ohne dass die Hände etwas drehen. Je nach Platz wirkt es als Lautstärke- oder als Gain-Regler.",
    metal:
      "Swells (Anschlag leise einblenden) und Lautstärkewechsel zwischen Rhythmus und Solo, ohne den Verzerrer anzufassen.",
    einstellung: "Pedal ganz zu ist stumm. Für Swells erst anschlagen, dann langsam aufdrehen.",
    fallstrick: "Vor dem Verzerrer ändert es auch die Menge an Gain, nicht nur die Lautstärke.",
    ausnahme:
      "Vor den Verzerrern regelt es, wie viel Gain ankommt. Ganz am Ende der Kette, hinter Delay und Reverb, macht es die ganze Gitarre samt Hall leiser.",
    beispiele: ["Ernie Ball VP Jr", "Boss FV-500"],
  },
  {
    id: "fx-chorus",
    name: "Chorus",
    kategorie: "modulation",
    ort: "loop",
    platz: 40,
    wofuer: "Verdoppelt das Signal, verstimmt es leicht und mischt es dazu. Das klingt breiter und schimmernd.",
    metal:
      "Cleane Passagen und Balladen, Intros und Arpeggios. Auf Verzerrung klingt er schnell schwammig.",
    einstellung: "Rate langsam, Depth mittel, Mix etwa die Hälfte.",
    fallstrick: "Auf Hochgain klingt Chorus wie ein Schwimmbad und nimmt dem Anschlag die Kante.",
    ausnahme: "Vor dem Amp klingt er herber, weil die Verzerrung die Verdopplung mitzerrt.",
    beispiele: ["Boss CE-2", "TC Corona"],
  },
  {
    id: "fx-phaser",
    name: "Phaser",
    kategorie: "modulation",
    ort: "loop",
    platz: 50,
    wofuer:
      "Verschiebt die Phasenlage des Signals und mischt es dazu. Das gibt ein Kreisen, das durch den Klang wandert.",
    metal: "Eddie Van Halens frühe Platten mit dem MXR Phase 90; heute dezent in Soli und Intros.",
    einstellung: "Rate langsam, etwa neun bis elf Uhr, Depth mittel.",
    fallstrick: "Zu schnell klingt es wie ein Flugzeug, und auf Hochgain deckt zu viel den Ton zu.",
    ausnahme: "Wie beim Original, dem Phase 90, vor dem Amp: dort kreist die Verzerrung selbst.",
    beispiele: ["MXR Phase 90"],
  },
  {
    id: "fx-flanger",
    name: "Flanger",
    kategorie: "modulation",
    ort: "loop",
    platz: 60,
    wofuer:
      "Wie ein Chorus, aber mit sehr kurzer Verzögerung, die gegen das Original schwebt. Das gibt ein Rauschen wie ein Düsenjäger.",
    metal: "Eddie Van Halens Sweeps auf Stücken wie „Unchained“: das Rauschen, das durch einen Akkord zieht.",
    einstellung: "Rate langsam, Manual mittig, Feedback gering.",
    fallstrick: "Viel Feedback klingt metallisch-scharf und ist laut.",
    ausnahme: "Wie beim Phaser vor dem Amp, wenn die Verzerrung mitkreisen soll. Van Halen stellte den Flanger dort sogar vor den Phase 90.",
    beispiele: ["MXR M117R", "Boss BF-3"],
  },
  {
    id: "fx-tremolo",
    name: "Tremolo",
    kategorie: "modulation",
    ort: "loop",
    platz: 70,
    wofuer: "Regelt die Lautstärke im Takt rauf und runter.",
    metal: "Doom und Post-Metal, Intros: im Takt des Songs hypnotisch.",
    einstellung: "Rate auf das Tempo des Songs (Achtel oder Viertel), Depth mittel.",
    fallstrick:
      "Nicht verwechseln mit dem Tremolohebel der Gitarre: dort ändert sich die Tonhöhe, hier die Lautstärke.",
    ausnahme: "Alte Fender-Amps mischen es erst nach den Vorstufenstufen ein und hinter dem Hall, sodass die Hallfahne mitpulsiert. Als Pedal geht das, wenn man es hinter den Hall stellt.",
    beispiele: ["Boss TR-2"],
  },
  {
    id: "fx-delay",
    name: "Delay",
    kategorie: "zeit",
    ort: "loop",
    platz: 80,
    wofuer: "Wiederholt das Signal verzögert, ein Echo. Die Zeit lässt sich ans Tempo binden.",
    metal:
      "Soli bekommen Raum, ohne dass ein Hall sie verwischt; Intros mit Echo auf der punktierten Achtel.",
    einstellung:
      "Mix 15 bis 25 %, zwei bis vier Wiederholungen. Zeit in Millisekunden: 60 000 geteilt durch BPM ist die Viertel, die Achtel die Hälfte, die punktierte Achtel drei Viertel davon. Bei 120 BPM: Viertel 500 ms, punktierte Achtel 375 ms.",
    fallstrick: "Zu viel Feedback oder Mix verschmiert schnelle Riffs. Im Rhythmus bleibt es besser aus.",
    ausnahme:
      "Vor dem Amp wird jede Wiederholung mitverzerrt und klingt zerfetzt. Deshalb im Loop, oder hinter dem Amp.",
    beispiele: ["Boss DD-8", "MXR Carbon Copy"],
  },
  {
    id: "fx-reverb",
    name: "Reverb",
    kategorie: "zeit",
    ort: "loop",
    platz: 90,
    wofuer: "Simuliert einen Raum: den Nachhall von Wänden und Decke, der den Ton weich ausklingen lässt.",
    metal:
      "Dezent bei Leads und Cleanpassagen. Im Rhythmus bleibt er weg, sonst verschwimmen die Palm Mutes.",
    einstellung: "Mix zehn bis zwanzig Prozent bei Leads, Decay ein bis zwei Sekunden; lieber Plate oder Room als einen langen Hall.",
    fallstrick: "Viel Hall und viel Gain schmieren zusammen: der Hall wird mit der Verzerrung zu Brei.",
    ausnahme: "Der Federhall in Fender-Amps sitzt zwischen Vorstufe und Endstufe, also etwa dort, wo auch der FX-Loop liegt.",
    beispiele: ["TC Hall of Fame", "Boss FRV-1"],
  },
  {
    id: "fx-looper",
    name: "Looper",
    kategorie: "hilfen",
    ort: "loop",
    platz: 100,
    wofuer: "Nimmt einen Durchgang auf und spielt ihn in der Schleife ab, zum Drüberspielen.",
    metal: "Zum Üben: ein Riff aufnehmen und darüber Soli probieren.",
    einstellung: "Aufnahme genau auf der Eins starten und nach einem vollen Takt beenden, sonst läuft die Schleife schief.",
    fallstrick: "Ein Loop mit Delay oder Hall davor nimmt deren Ausklang mit auf, und er klingt beim Abspielen doppelt.",
    ausnahme: "Ganz am Ende der Kette, damit er alles aufnimmt; nur vor Delay und Reverb, wenn deren Ausklang draussen bleiben soll.",
    beispiele: ["Boss RC-1", "TC Ditto Looper"],
  },

  // ── Endstufe und Box ─────────────────────────────────────────
  {
    id: "fx-endstufe",
    name: "Endstufe",
    kategorie: "amp",
    ort: "hinten",
    platz: 10,
    wofuer:
      "Verstärkt das Signal auf Lautsprecher-Pegel. Anders als die Vorstufe sorgt sie vor allem für Lautstärke und Druck.",
    metal:
      "Im Metal kommt die Verzerrung aus der Vorstufe, die Endstufe bleibt möglichst sauber und gibt Druck.",
    einstellung: "Master so, dass der Amp laut genug ist, ohne dass die Endstufe in die Sättigung kommt.",
    fallstrick: "Ein Röhrenamp wird nie ohne Box oder Last gespielt: Endstufenröhren und Ausgangsübertrager können sonst Schaden nehmen.",
  },
  {
    id: "fx-box",
    name: "Box, Mikrofon und Impulsantwort",
    kategorie: "amp",
    ort: "hinten",
    platz: 20,
    wofuer:
      "Die Box formt den Klang stärker als jedes Pedal: sie filtert Höhen und Tiefbass und gibt die Mitten. Mikrofon oder Impulsantwort (IR) fangen genau das ein.",
    metal:
      "Die 4x12-Box mit Celestion Vintage 30 ist im Metal weit verbreitet: die Mesa-Rectifier-4x12 trägt vier davon. Modeler laden eine IR statt einer echten Box.",
    einstellung:
      "Mikrofon nahe an der Kappe: hell und scharf, zum Rand hin dunkler. Bei einer IR eine passende Box wählen und den Bass unter 80 Hz abschneiden.",
    fallstrick:
      "Ein Modeler ohne IR klingt hart und kratzt, weil das Filter der Box fehlt: man hört den rohen Amp.",
    ausnahme: "Bei Modelern steht die IR am Ende der digitalen Kette, hinter dem Amp-Modell.",
    beispiele: ["Celestion Vintage 30", "Shure SM57"],
  },
]

export const EFFEKTE_BY_ID: Record<string, Effekt> = Object.fromEntries(EFFEKTE.map((e) => [e.id, e]))

/** Die Einträge einer Station, in Signalrichtung. */
export function eintraegeAm(ort: Ort): Effekt[] {
  return EFFEKTE.filter((e) => e.ort === ort).sort((a, b) => a.platz - b.platz)
}

/** Die ganze Kette: Stationen in Signalrichtung, jede mit ihren Einträgen. */
export function kette() {
  return ORTE.map((o) => ({ ...o, eintraege: eintraegeAm(o.value) }))
}

/** Alle Einträge flach, vom Gitarrenausgang bis zur Box. */
export function reihenfolge(): Effekt[] {
  return kette().flatMap((station) => station.eintraege)
}
