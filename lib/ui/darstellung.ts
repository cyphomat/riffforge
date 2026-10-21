/**
 * Hell oder dunkel — die Regel und das Skript, das sie vor dem ersten
 * Anstrich anwendet.
 *
 * Rein und ohne `"use client"`, weil `app/layout.tsx` das Skript als Text in
 * den Kopf der Seite legt: ein Wert aus einem Client-Modul käme dort nur als
 * Verweis an. `lib/storage/lokal.ts` liest und schreibt die Wahl.
 *
 * Gesetzt wird `data-theme` auf `<html>`, und zwar *immer* aufgelöst —
 * `hell` oder `dunkel`, nie `auto`. So steht die helle Palette in
 * `globals.css` genau einmal, statt einmal fürs Attribut und noch einmal in
 * einer Medienabfrage, wo zwei Kopien irgendwann auseinanderlaufen.
 */

export const DARSTELLUNG_KEY = "mga.darstellung.v1"
export const DARSTELLUNG_EREIGNIS = "mga-darstellung"

export const DARSTELLUNGEN = ["auto", "hell", "dunkel"] as const
export type Darstellung = (typeof DARSTELLUNGEN)[number]
export type Fassung = "hell" | "dunkel"

/** Die Statusleiste färbt sich mit — sonst stünde über der hellen Seite ein schwarzer Balken. */
export const STATUSLEISTE: Record<Fassung, string> = { dunkel: "#0c0c0e", hell: "#dcd9d3" }

/** Was nicht ausdrücklich hell oder dunkel ist, folgt dem System. */
export function alsDarstellung(roh: string | null): Darstellung {
  return roh === "hell" || roh === "dunkel" ? roh : "auto"
}

export function fassungFuer(wahl: Darstellung, systemHell: boolean): Fassung {
  if (wahl === "auto") return systemHell ? "hell" : "dunkel"
  return wahl
}

/**
 * Das Skript für den Kopf der Seite. Läuft, bevor irgendetwas gezeichnet
 * wird — sonst blitzte die helle Fassung bei jedem Aufruf erst dunkel auf.
 * Es hört danach weiter zu: auf das System, solange Auto gilt, und auf die
 * Wahl unter *Daten* (`DARSTELLUNG_EREIGNIS`).
 *
 * Bewusst klein und ohne Abhängigkeit: es steht als Text in jeder Seite.
 */
export const DARSTELLUNG_SKRIPT = `(function(){
var k=${JSON.stringify(DARSTELLUNG_KEY)},f=${JSON.stringify(STATUSLEISTE)},m=matchMedia("(prefers-color-scheme: light)");
function a(){var w=null;try{w=localStorage.getItem(k)}catch(e){}
var h=w==="hell"||(w!=="dunkel"&&m.matches)?"hell":"dunkel",r=document.documentElement;
r.setAttribute("data-theme",h);r.style.colorScheme=h==="hell"?"light":"dark";
var t=document.querySelectorAll('meta[name="theme-color"]');for(var i=0;i<t.length;i++)t[i].setAttribute("content",f[h])}
a();m.addEventListener("change",a);addEventListener(${JSON.stringify(DARSTELLUNG_EREIGNIS)},a);
document.addEventListener("DOMContentLoaded",a)})()`
