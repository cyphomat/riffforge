import { z } from "zod"
import { FORMEN, MATERIALIEN, type Stufe } from "./gurt"
import { dayKey } from "./progress"
import type { PracticeLog } from "./types"

/**
 * Die monatlichen Drops: Plektren zu einem Thema, eine Bühne als Pixelbild
 * und ein paar Sprüche des Roadies.
 *
 * Ein Drop ist ein Datensatz in `drops-daten.ts`. Riffforge ist ein statischer
 * Export ohne Datenbank — ein neuer Monat ist also ein Commit, und der
 * Test unten lässt nur durch, was das Schema erfüllt. Selten und episch
 * brauchen einen belegten Fakt samt Quelle.
 *
 * Freigeschaltet wird aus dem Log, wie der Rest des Merch-Stands: je Stufe
 * eine Zahl von Übungstagen im Monat des Drops. Nichts wird gespeichert und
 * nichts gewürfelt; ein vergangener Drop bleibt, wie der Monat ihn hinterlassen hat.
 */

/** Übungstage im Monat des Drops, ab denen eine Stufe freigeschaltet ist. */
export const FREISCHALTUNG: Record<Stufe, number> = { g: 4, s: 12, e: 20 }

const tag = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

export const dropPlektrumSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    stufe: z.enum(["g", "s", "e"]),
    name: z.string().trim().min(1).max(40),
    farbe: z.string().regex(/^#[0-9a-f]{6}$/i),
    form: z.enum(FORMEN),
    material: z.enum(MATERIALIEN).optional(),
    /** Ein Satz in eigenen Worten. */
    text: z.string().trim().min(1).max(200),
    /** Belegter Fakt — Pflicht ab selten. */
    fakt: z.string().trim().min(1).max(260).optional(),
    /** Wo der Fakt steht, eine https-Adresse. */
    quelle: z.string().url().startsWith("https://").optional(),
    /** Das Extra-Plektrum des Monats: erscheint erst, wenn alle anderen verdient sind. */
    zugabe: z.boolean().optional(),
  })
  .superRefine((p, ctx) => {
    if (p.stufe !== "g" && (!p.fakt || !p.quelle)) {
      ctx.addIssue({ code: "custom", message: `${p.id}: ab selten braucht es fakt und quelle` })
    }
    if (p.zugabe && p.stufe !== "e") {
      ctx.addIssue({ code: "custom", message: `${p.id}: die Zugabe ist episch` })
    }
  })

export const dropSchema = z
  .object({
    /** Der Monat, `JJJJ-MM` — zugleich der Name des Bildes `drop-<id>.png`. */
    id: z.string().regex(/^\d{4}-\d{2}$/),
    titel: z.string().trim().min(1).max(40),
    thema: z.string().trim().min(1).max(60),
    text: z.string().trim().min(1).max(200),
    /** Ab diesem Tag ist der Drop sichtbar. */
    datum: tag,
    plektren: z.array(dropPlektrumSchema).min(3).max(12),
    sprueche: z.array(z.string().trim().min(1).max(160)).min(3).max(12),
  })
  .superRefine((d, ctx) => {
    if (!d.datum.startsWith(d.id) || Number.isNaN(Date.parse(`${d.datum}T12:00:00Z`))) {
      ctx.addIssue({ code: "custom", message: `${d.id}: datum liegt nicht im Monat des Drops` })
    }
    const ids = d.plektren.map((p) => p.id)
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: `${d.id}: doppelte Plektrum-IDs` })
    if (d.plektren.filter((p) => p.zugabe).length > 1) {
      ctx.addIssue({ code: "custom", message: `${d.id}: höchstens eine Zugabe` })
    }
  })

export type Drop = z.infer<typeof dropSchema>
export type DropPlektrum = z.infer<typeof dropPlektrumSchema>

/** Ein Drop ist sichtbar, sobald sein Datum erreicht ist. `heute` und `datum` als `JJJJ-MM-TT`. */
export function sichtbar(drop: Drop, heute: string): boolean {
  return drop.datum <= heute
}

/** Sichtbare Drops, der neueste zuerst. */
export function sichtbareDrops(drops: Drop[], heute: string): Drop[] {
  return drops.filter((d) => sichtbar(d, heute)).sort((a, b) => b.datum.localeCompare(a.datum))
}

/** Tage mit mindestens einem Log-Eintrag im Monat `JJJJ-MM`. */
export function uebungstage(log: PracticeLog, monat: string): number {
  const tage = new Set<string>()
  for (const r of log.results) {
    const zeit = Date.parse(r.at)
    if (Number.isNaN(zeit)) continue
    const t = dayKey(new Date(zeit))
    if (t.startsWith(monat)) tage.add(t)
  }
  return tage.size
}

export interface DropStand {
  drop: Drop
  tage: number
  eintraege: Array<{ plektrum: DropPlektrum; verdient: boolean }>
  /** Die Zugabe, aber erst wenn sie verdient ist — vorher weiss die Zählung nichts von ihr. */
  zugabe: DropPlektrum | null
  verdient: number
  gesamt: number
}

export function dropStand(drop: Drop, log: PracticeLog): DropStand {
  const tage = uebungstage(log, drop.id)
  const eintraege = drop.plektren
    .filter((p) => !p.zugabe)
    .map((plektrum) => ({ plektrum, verdient: tage >= FREISCHALTUNG[plektrum.stufe] }))
  const alle = eintraege.every((e) => e.verdient)
  const extra = drop.plektren.find((p) => p.zugabe) ?? null
  return {
    drop,
    tage,
    eintraege,
    zugabe: alle ? extra : null,
    verdient: eintraege.filter((e) => e.verdient).length,
    gesamt: eintraege.length,
  }
}

/** Alle sichtbaren Drops mit Stand, der neueste zuerst. */
export function dropStaende(drops: Drop[], log: PracticeLog, heute: string): DropStand[] {
  return sichtbareDrops(drops, heute).map((d) => dropStand(d, log))
}
