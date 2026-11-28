import { Suspense } from "react"
import { RepertoireAnsicht } from "@/components/session/repertoire-ansicht"

export const metadata = { title: "Repertoire · Riffforge" }

export default function RepertoirePage() {
  return (
    // Which song is open sits in the query string, and a static export only
    // knows that in the browser.
    <Suspense>
      <RepertoireAnsicht />
    </Suspense>
  )
}
