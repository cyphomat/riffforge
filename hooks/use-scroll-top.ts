"use client"

import { useEffect, useRef } from "react"

/**
 * Jumps the window to the top whenever `key` changes — not on first mount.
 *
 * Screens that replace each other in place (block, rating, questions,
 * summary) keep the scroll position of the one before. The new heading then
 * sits above the fold, and a skipped block looks as if nothing had happened.
 * No smooth scrolling: the session stays calm, and a jump reads as a cut.
 */
export function useScrollTopOn(key: string | number): void {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    window.scrollTo(0, 0)
  }, [key])
}
