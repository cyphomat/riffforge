import { clearLokal } from "./lokal"
import { clearLog } from "./practice-log"
import { clearProfile } from "./profile"
import { clearTheoryLog } from "./theory-log"
import { clearSettings } from "@/lib/sync/settings"

/**
 * Everything this app ever wrote to the browser, gone in one call.
 *
 * One function instead of five calls in the button: the list of what gets
 * deleted lives next to the storage modules, and `loeschen.test.ts` checks it
 * against every `mga.*` key in the source. A new key that is missing here
 * fails that test instead of surviving a delete unnoticed.
 *
 * The sync settings belong in it. Before, "Alles löschen" left the GitHub
 * token behind — in the storage every github.io page shares — and the next
 * background sync pulled the deleted log straight back. The data repo itself
 * is not touched: deleting here means this browser, not the copy elsewhere.
 */
export function allesLoeschen(): void {
  clearLog()
  clearTheoryLog()
  clearProfile()
  clearLokal()
  clearSettings()
}
