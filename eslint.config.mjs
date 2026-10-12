import { defineConfig, globalIgnores } from "eslint/config"
import nextVitals from "eslint-config-next/core-web-vitals"

/**
 * Flat config, because Next 16 dropped `next lint`. The rules are the same
 * `core-web-vitals` set as before; what changed is the reach — `eslint .`
 * also looks at `tools/`, `public/sw.js` and the worklet, which `next lint`
 * never did.
 */
export default defineConfig([
  ...nextVitals,
  {
    // react-hooks 7 ships the React Compiler's checks in its recommended set.
    // This app does not use the compiler, and the 35 places they flag are
    // deliberate patterns, each commented where it sits: loading from
    // localStorage in an effect after the first paint (a static export has no
    // storage at build time, so lazy state would break hydration), the
    // latest-callback ref, and a lick seed captured once so the lick cannot
    // change mid-block. Rewriting the session runner to satisfy a compiler we
    // don't run is a change of its own, not part of a version bump.
    rules: {
      "react-hooks/refs": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "next-env.d.ts", "landing/**"]),
])
