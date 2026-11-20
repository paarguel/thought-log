"use client";

import Link from "next/link";

/**
 * Compact top bar: wordmark on the left, history + data pages on the right,
 * named in words. Two unlabeled icons made people guess.
 * Kept quiet so the worksheet stays the subject of the screen (R1).
 */
export function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <Link
        href="/"
        className="font-display italic text-[1.0625rem] text-ink tracking-tight"
        aria-label="Thought Record — start"
      >
        Thought Record
      </Link>
      <nav className="flex items-center" aria-label="App">
        <Link
          href="/history"
          className="flex min-h-11 items-center rounded-full px-3 text-[0.9375rem] text-ink-soft active:bg-paper-sunken"
        >
          History
        </Link>
        <Link
          href="/data"
          className="-mr-3 flex min-h-11 items-center rounded-full px-3 text-[0.9375rem] text-ink-soft active:bg-paper-sunken"
        >
          Your data
        </Link>
      </nav>
    </header>
  );
}
