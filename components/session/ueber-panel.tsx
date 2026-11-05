import { isFork, runningBuild, UPSTREAM } from "@/lib/update/version"

const link = "text-stahl underline-offset-4 hover:underline"

/**
 * Wer das gebaut hat, wohin mit Rückmeldungen, und dass man es nehmen darf.
 *
 * Steht am Ende von *Daten*, nicht als Banner: es ist eine Auskunft für den,
 * der sie sucht. Nur Links — beim Öffnen der Seite fragt die App nirgends an,
 * die CSP bleibt, wie sie ist. Rückmeldungen gehen ans Original, der Quelltext
 * zeigt auf das, was gerade läuft: in einem Fork also auf den Fork.
 */
export function UeberPanel() {
  // Über `isFork`, nicht über den Stempel direkt: ein Klon von vor der
  // Umbenennung trägt noch `metal-guitar-academy` und ist trotzdem das Original.
  const laeuft = runningBuild()
  const quelle = laeuft && isFork(laeuft) ? laeuft.repo : UPSTREAM
  const extern = { target: "_blank", rel: "noopener noreferrer" } as const
  // Rückmeldungen gehen immer ans Original. Der Commit ist kein persönliches
  // Datum; er steht im Formular schon drin, damit die Fassung nicht fehlt.
  const neu = `https://github.com/${UPSTREAM}/issues/new`
  const fassung = laeuft ? `&version=${encodeURIComponent(laeuft.commit.slice(0, 7))}` : ""
  return (
    <section>
      <h2 className="rule mb-1 mt-9">Über Riffforge</h2>
      <div className="space-y-2 text-[13px] leading-relaxed text-dim">
        <p>
          Gebaut von{" "}
          <a href="https://github.com/cyphomat" className={link} {...extern}>
            @cyphomat
          </a>
          . Rückmeldungen gehen als Issue auf GitHub (ein Konto dort brauchst du dafür):{" "}
          <a href={`${neu}?template=fehler.yml${fassung}`} className={link} {...extern}>
            Fehler melden
          </a>{" "}
          oder{" "}
          <a href={`${neu}?template=idee.yml`} className={link} {...extern}>
            Idee oder Wunsch
          </a>
          . Bitte keine echten Übungsdaten dazuschreiben.
        </p>
        <p>
          Der{" "}
          <a href={`https://github.com/${quelle}`} className={link} {...extern}>
            Quelltext
          </a>{" "}
          steht unter der MIT-Lizenz: forken, anpassen, eigene Übungen dazuschreiben ist ausdrücklich
          erwünscht. Ein Fork erkennt das Original von selbst und sagt Bescheid, wenn es dort Neues gibt.
        </p>
        <p>
          Ein Übungswerkzeug, kein Unterricht, und ohne Gewähr. Wenn Hand, Handgelenk oder Unterarm
          schmerzen: aufhören. Tempo kommt mit der Zeit, nicht mit Zähnezusammenbeissen.
        </p>
      </div>
    </section>
  )
}
