"use client";

import Link from "next/link";

/**
 * Compact top bar: wordmark on the left, history + account on the right.
 * Kept quiet so the worksheet stays the subject of the screen (R1).
 */
export function TopBar() {
  return (
    <header className="flex items-center justify-between px-5 pt-4 pb-2">
      <Link
        href="/"
        className="font-display italic text-[1.125rem] text-ink tracking-tight"
        aria-label="Thought Log — start"
      >
        Thought Log
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
          href="/account"
          aria-label="Account and sync"
          className="flex h-11 w-11 items-center justify-center rounded-full text-ink-soft active:bg-paper-sunken"
        >
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8.2" r="3.4" stroke="currentColor" strokeWidth="1.7" />
            <path
              d="M5 19.5c.8-3.1 3.6-4.8 7-4.8s6.2 1.7 7 4.8"
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
