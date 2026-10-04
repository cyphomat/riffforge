import { describe, expect, it } from "vitest"
import {
  EINTRAEGE_MINDESTENS,
  TAGE_MINDESTENS,
  letzteKopie,
  sollErinnern,
  tageSeit,
} from "../backup-erinnerung"

/**
 * Eine Erinnerung, die zu früh oder grundlos kommt, wird weggeklickt — und
 * danach nie wieder gelesen. Deshalb sind hier beide Richtungen festgehalten:
 * wann sie kommen muss, und vor allem, wann sie zu schweigen hat.
 */

const NOW = new Date(2026, 8, 14, 20, 0, 0)
const vorTagen = (n: number) => new Date(NOW.getTime() - n * 24 * 3600 * 1000)

describe("sollErinnern", () => {
  it("schweigt, solange es kaum etwas zu verlieren gibt", () => {
    expect(
      sollErinnern({
        eintraege: EINTRAEGE_MINDESTENS - 1,
        gesichert: null,
        aeltester: vorTagen(400),
        now: NOW,
      }),
    ).toBe(false)
  })

  it("schweigt, wenn kürzlich gesichert wurde", () => {
    expect(
      sollErinnern({
        eintraege: 500,
        gesichert: vorTagen(TAGE_MINDESTENS - 1),
        aeltester: vorTagen(400),
        now: NOW,
      }),
    ).toBe(false)
  })

  it("meldet sich, wenn beides zutrifft", () => {
    expect(
      sollErinnern({
        eintraege: EINTRAEGE_MINDESTENS,
        gesichert: vorTagen(TAGE_MINDESTENS),
        aeltester: vorTagen(400),
        now: NOW,
      }),
    ).toBe(true)
  })

  it("zählt ohne je gesicherte Datei ab dem ältesten Eintrag", () => {
    // Sonst bekäme jemand, der seit einem Jahr übt und nie exportiert hat,
    // nie einen Hinweis — „zuletzt gesichert" bliebe für immer leer.
    expect(
      sollErinnern({ eintraege: 50, gesichert: null, aeltester: vorTagen(300), now: NOW }),
    ).toBe(true)
  })

  it("schweigt bei einem leeren Log, auch ohne Sicherung", () => {
    expect(sollErinnern({ eintraege: 0, gesichert: null, aeltester: null, now: NOW })).toBe(false)
  })

  it("schweigt, wenn der Log frisch ist", () => {
    expect(
      sollErinnern({ eintraege: 50, gesichert: null, aeltester: vorTagen(2), now: NOW }),
    ).toBe(false)
  })
})

describe("Der Abgleich ist auch eine Kopie", () => {
  it("schweigt, wenn kürzlich abgeglichen wurde, auch ohne je eine Datei", () => {
    // Der Anlass: wer ins private Datenrepo abgleicht, las trotzdem „Noch nie
    // gesichert" — eine Warnung, die nicht stimmt, liest danach keiner mehr.
    expect(
      sollErinnern({
        eintraege: 500,
        gesichert: null,
        abgeglichen: vorTagen(1),
        aeltester: vorTagen(400),
        now: NOW,
      }),
    ).toBe(false)
  })

  it("meldet sich, wenn auch der Abgleich lange her ist", () => {
    // Ein Abgleich, der seit Wochen scheitert, schützt nichts.
    expect(
      sollErinnern({
        eintraege: 500,
        gesichert: vorTagen(90),
        abgeglichen: vorTagen(TAGE_MINDESTENS),
        aeltester: vorTagen(400),
        now: NOW,
      }),
    ).toBe(true)
  })

  it("nimmt die jüngere der beiden Kopien", () => {
    expect(letzteKopie({ gesichert: vorTagen(30), abgeglichen: vorTagen(2) })).toEqual(vorTagen(2))
    expect(letzteKopie({ gesichert: vorTagen(2), abgeglichen: vorTagen(30) })).toEqual(vorTagen(2))
    expect(letzteKopie({ gesichert: null, abgeglichen: null })).toBeNull()
    expect(letzteKopie({ gesichert: vorTagen(5) })).toEqual(vorTagen(5))
  })
})

describe("tageSeit", () => {
  it("rundet ab und wird nie negativ", () => {
    expect(tageSeit(vorTagen(14), NOW)).toBe(14)
    expect(tageSeit(new Date(NOW.getTime() + 3600 * 1000), NOW)).toBe(0)
  })
})
