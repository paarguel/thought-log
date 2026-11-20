"use client";

/**
 * History: entries saved on this device. There is nowhere else an entry
 * can live — the app has no server — so the list is deliberately plain.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { worksheetTitle } from "@/lib/thought-log/types";
import { checkInTitle, isCheckIn, type Entry } from "@/lib/check-in/types";
import { feelingFamilies } from "@/lib/thought-log/feelings";
import { listLocalEntries } from "@/lib/local-store/indexed-db";
import { TopBar } from "@/components/app/top-bar";

function formatDate(iso: string): string {
  try {
    const date = new Date(iso);
    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      ...(sameYear ? {} : { year: "numeric" }),
    });
  } catch {
    return iso;
  }
}

const MAX_CHIPS = 3;

type Filter = "all" | "thoughts" | "check-ins";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "thoughts", label: "Thoughts" },
  { id: "check-ins", label: "Feelings" },
];

function EntryCard({ w }: { w: Entry }) {
  const checkIn = isCheckIn(w);
  // A check-in shows the words as picked; a worksheet rolls them up by family.
  const families = checkIn ? w.emotions : feelingFamilies(w.feelings);
  const extra = families.length - MAX_CHIPS;
  const thoughts = checkIn ? 0 : w.phrases.length;
  return (
    <Link
      href={`/history/entry?id=${encodeURIComponent(w.id)}`}
      className="block rounded-xl border border-line bg-paper-raised px-4 py-3.5 active:bg-paper-sunken"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[1rem] text-ink">
          {checkIn ? checkInTitle(w) : worksheetTitle(w)}
        </span>
        <span className="shrink-0 text-[0.8125rem] text-ink-faint">
          {checkIn ? "Check-in · " : ""}
          {formatDate(w.createdAt)}
        </span>
      </span>
      {(families.length > 0 || thoughts > 0) && (
        <span className="mt-2 flex items-center justify-between gap-3">
          <span className="flex min-w-0 items-center gap-1.5 overflow-hidden">
            {families.slice(0, MAX_CHIPS).map((family) => (
              <span
                key={family}
                className="shrink-0 rounded-full bg-paper-sunken px-2.5 py-0.5 text-[0.75rem] text-ink-soft"
              >
                {family}
              </span>
            ))}
            {extra > 0 && (
              <span className="shrink-0 text-[0.75rem] text-ink-faint">+{extra}</span>
            )}
          </span>
          {thoughts > 0 && (
            <span className="shrink-0 text-[0.8125rem] text-ink-faint">
              {thoughts} {thoughts === 1 ? "thought" : "thoughts"}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

export default function HistoryPage() {
  const [local, setLocal] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    listLocalEntries()
      .then(setLocal)
      .catch(() => setLocal([]));
  }, []);

  const empty = local !== null && local.length === 0;
  // The filter only earns its space once there are both kinds to tell apart.
  const mixed =
    local !== null && local.some(isCheckIn) && local.some((e) => !isCheckIn(e));
  const shown = (local ?? []).filter(
    (e) => !mixed || filter === "all" || (filter === "check-ins") === isCheckIn(e)
  );

  return (
    <div className="app-shell mx-auto flex w-full max-w-xl flex-col">
      <TopBar />
      <main className="app-scroll flex flex-col px-5 pb-6">
        <h1 className="mb-5 font-display text-[1.625rem] text-ink">History</h1>

        {empty && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[0.9375rem] text-ink-soft">No saved entries yet.</p>
            <Link href="/" className="mt-3 text-[0.9375rem] text-accent underline underline-offset-4">
              Start an entry
            </Link>
          </div>
        )}

        {local !== null && local.length > 0 && (
          <section aria-label="On this device">
            <h2 className="mb-2 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
              On this device
            </h2>
            {mixed && (
              <div
                role="group"
                aria-label="Show"
                className="mb-3 flex rounded-full border border-line bg-paper-raised p-1"
              >
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={`min-h-9 flex-1 rounded-full text-[0.875rem] transition-colors ${
                      filter === f.id ? "bg-ink text-paper" : "text-ink-soft"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <ul className="flex flex-col gap-2">
              {shown.map((w) => (
                <li key={w.id}>
                  <EntryCard w={w} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[0.8125rem] leading-relaxed text-ink-faint">
              These entries exist only on this device. Deleting the app deletes them.
              Export the ones you want to keep from the{" "}
              <Link href="/data" className="underline underline-offset-4">
                Your data
              </Link>{" "}
              page.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
