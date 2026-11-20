"use client";

/**
 * History: entries saved on this device, newest first and grouped by the
 * day they were written. Thoughts and feelings look different at a glance,
 * and a search box finds an entry by any word in it. There is nowhere else
 * an entry can live (the app has no server), so nothing here loads or syncs.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { worksheetTitle } from "@/lib/thought-log/types";
import { checkInTitle, isCheckIn, type Entry } from "@/lib/check-in/types";
import { feelingFamilies } from "@/lib/thought-log/feelings";
import { listLocalEntries } from "@/lib/local-store/indexed-db";
import { groupByDay, matchesSearch } from "@/lib/local-store/history";
import { TopBar } from "@/components/app/top-bar";

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

const MAX_CHIPS = 3;

type Filter = "all" | "thoughts" | "feelings";

const FILTERS: Array<{ id: Filter; label: string }> = [
  { id: "all", label: "All" },
  { id: "thoughts", label: "Thoughts" },
  { id: "feelings", label: "Feelings" },
];

/**
 * A thought wears the highlighter's yellow, a feeling the warm accent. Both
 * also say which they are in words, so color is never the only signal.
 */
function EntryCard({ w }: { w: Entry }) {
  const feeling = isCheckIn(w);
  // A feeling shows the words as picked; a thought rolls them up by family.
  const words = feeling ? w.emotions : feelingFamilies(w.feelings);
  const extra = words.length - MAX_CHIPS;
  const thoughts = feeling ? 0 : w.phrases.length;
  return (
    <Link
      href={`/history/entry?id=${encodeURIComponent(w.id)}`}
      className={`block rounded-xl border px-4 py-3.5 active:bg-paper-sunken ${
        feeling ? "border-accent/25 bg-accent-soft/55" : "border-line bg-paper-raised"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[0.75rem] font-medium ${
            feeling ? "bg-accent/15 text-accent" : "bg-mark text-mark-ink"
          }`}
        >
          {feeling ? "Feeling" : "Thought"}
        </span>
        <span className="shrink-0 text-[0.8125rem] text-ink-faint">{formatTime(w.createdAt)}</span>
      </span>
      <span className="mt-2 block truncate text-[1rem] text-ink">
        {feeling ? checkInTitle(w) : worksheetTitle(w)}
      </span>
      {(words.length > 0 || thoughts > 0) && (
        <span className="mt-1.5 block text-[0.875rem] text-ink-soft">
          {words.slice(0, MAX_CHIPS).join(" · ")}
          {extra > 0 && ` +${extra}`}
          {thoughts > 0 && (
            <span className="text-ink-faint">
              {words.length > 0 && " · "}
              {thoughts} {thoughts === 1 ? "thought" : "thoughts"} circled
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
  const [query, setQuery] = useState("");

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
    (e) =>
      (!mixed || filter === "all" || (filter === "feelings") === isCheckIn(e)) &&
      matchesSearch(e, query)
  );
  const days = groupByDay(shown);

  return (
    <div className="app-shell mx-auto flex w-full max-w-xl flex-col">
      <TopBar />
      <main className="app-scroll flex flex-col px-5 pb-6">
        <h1 className="mb-4 font-display text-[1.625rem] text-ink">History</h1>

        {empty && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[0.9375rem] text-ink-soft">No saved entries yet.</p>
            <Link href="/" className="mt-3 text-[0.9375rem] text-accent underline underline-offset-4">
              Start an entry
            </Link>
          </div>
        )}

        {local !== null && local.length > 0 && (
          <section aria-label="Saved entries">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your entries"
              aria-label="Search your entries"
              className="write-surface mb-3 min-h-11 !py-2"
            />
            {mixed && (
              <div
                role="group"
                aria-label="Show"
                className="mb-2 flex rounded-full border border-line bg-paper-raised p-1"
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

            {days.length === 0 && (
              <p role="status" className="mt-6 text-center text-[0.9375rem] text-ink-soft">
                Nothing matches.
              </p>
            )}

            {days.map((day) => (
              <div key={day.label}>
                <h2 className="mt-4 mb-2 text-[0.875rem] font-medium text-ink-soft">{day.label}</h2>
                <ul className="flex flex-col gap-2">
                  {day.entries.map((w) => (
                    <li key={w.id}>
                      <EntryCard w={w} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="mt-5 text-[0.8125rem] leading-relaxed text-ink-faint">
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
