import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Safari auf dem iPhone zoomt in jedes Eingabefeld unter 16 px, sobald man es
 * antippt — und springt danach nicht zurück. Die Felder für den Abgleich
 * standen auf 14 px; aufgefallen ist es in Roadie, wo dieselbe Falle sass.
 *
 * Geprüft wird am Quelltext: jedes sichtbare `<input>`, `<textarea>` und
 * `<select>` braucht eine Schriftgrösse von mindestens 16 px in seinen
 * Klassen. Eine Grösse ohne Angabe zählt als Fehler — dann entscheidet
 * irgendein Erbe, und das ist die Stelle, an der es still kleiner wird.
 */

const WURZELN = ["components", "app"];
const FELD = /<(input|textarea|select)\b/g;

/** Ein Feld reicht bis zu seinem `/>` oder dem schliessenden Tag — ein `>` allein kann auch ein Pfeil in `onChange` sein. */
function bisZumEnde(text: string, ab: number, tag: string): string {
  const enden = [text.indexOf("/>", ab), text.indexOf(`</${tag}`, ab)].filter(
    (i) => i >= 0,
  );
  return text.slice(ab, Math.min(...enden));
}

function dateien(ordner: string): string[] {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) return dateien(pfad);
    return pfad.endsWith(".tsx") ? [pfad] : [];
  });
}

function felder() {
  return WURZELN.flatMap((wurzel) =>
    dateien(join(process.cwd(), wurzel)),
  ).flatMap((datei) => {
    const text = readFileSync(datei, "utf8");
    return [...text.matchAll(FELD)].map((treffer) => ({
      datei,
      tag: treffer[1],
      attribute: bisZumEnde(text, treffer.index, treffer[1]),
    }));
  });
}

// `hidden` als ganze Klasse — `outline-hidden` steht an jedem Feld und ist keine Unsichtbarkeit.
const unsichtbar = (attribute: string) =>
  /type="(file|checkbox|radio|hidden|range)"/.test(attribute) ||
  /className="(?:[^"]*\s)?hidden(?:\s[^"]*)?"/.test(attribute);

describe("Eingabefelder", () => {
  it("findet überhaupt welche — sonst prüft der Test nichts", () => {
    expect(
      felder().filter(({ attribute }) => !unsichtbar(attribute)).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it("sind mindestens 16 px gross, damit iOS beim Antippen nicht zoomt", () => {
    for (const { datei, tag, attribute } of felder()) {
      if (unsichtbar(attribute)) continue;
      const groesse = attribute.match(/text-\[(\d+(?:\.\d+)?)px\]/)?.[1];
      expect(groesse, `${datei}: <${tag}> ohne text-[…px]`).toBeDefined();
      expect(
        Number(groesse),
        `${datei}: <${tag}> mit ${groesse} px`,
      ).toBeGreaterThanOrEqual(16);
    }
  });
});
