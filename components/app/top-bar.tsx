"use client";

import Link from "next/link";

/**
 * Compact top bar: wordmark on the left, history + data pages on the right.
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
      <nav className="flex items-center gap-1" aria-label="App">
        <Link
          href="/history"
          aria-label="History"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft active:bg-paper-sunken"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5v15l-4-2.6-4 2.6v-15"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(2 0)"
            />
          </svg>
        </Link>
        <Link
          href="/data"
          aria-label="Your data"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft active:bg-paper-sunken"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <ellipse cx="12" cy="6.5" rx="7" ry="3" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M5 6.5v11c0 1.66 3.13 3 7 3s7-1.34 7-3v-11"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
            <path
              d="M5 12c0 1.66 3.13 3 7 3s7-1.34 7-3"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </nav>
    </header>
  );
}
