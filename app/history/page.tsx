"use client";

/**
 * History: local entries (this device) and cloud entries (this account),
 * kept visually distinct so the user always knows where an entry lives.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Worksheet } from "@/lib/thought-log/types";
import { worksheetTitle } from "@/lib/thought-log/types";
import { feelingFamilies } from "@/lib/thought-log/feelings";
import { listLocalEntries } from "@/lib/local-store/indexed-db";
import { cloudConfigured } from "@/lib/supabase/client";
import { getCurrentUser, listCloudEntries } from "@/lib/cloud/thought-logs";
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

function EntryCard({ w, source }: { w: Worksheet; source: "local" | "cloud" }) {
  const families = feelingFamilies(w.feelings);
  const extra = families.length - MAX_CHIPS;
  const thoughts = w.phrases.length;
  return (
    <Link
      href={`/history/${w.id}?src=${source}`}
      className="block rounded-xl border border-line bg-paper-raised px-4 py-3.5 active:bg-paper-sunken"
    >
      <span className="flex items-baseline justify-between gap-3">
        <span className="truncate text-[1rem] text-ink">{worksheetTitle(w)}</span>
        <span className="shrink-0 text-[0.8125rem] text-ink-faint">
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

function EntryList({ entries, source }: { entries: Worksheet[]; source: "local" | "cloud" }) {
  return (
    <ul className="flex flex-col gap-2">
      {entries.map((w) => (
        <li key={w.id}>
          <EntryCard w={w} source={source} />
        </li>
      ))}
    </ul>
  );
}

export default function HistoryPage() {
  const [local, setLocal] = useState<Worksheet[] | null>(null);
  const [cloud, setCloud] = useState<Worksheet[] | null>(null);
  const [signedIn, setSignedIn] = useState<boolean | null>(() =>
    cloudConfigured() ? null : false
  );
  const [cloudError, setCloudError] = useState<string | null>(null);

  useEffect(() => {
    listLocalEntries()
      .then(setLocal)
      .catch(() => setLocal([]));

    if (!cloudConfigured()) return;
    getCurrentUser().then((user) => {
      setSignedIn(Boolean(user));
      if (user) {
        listCloudEntries()
          .then(setCloud)
          .catch((e) => setCloudError(e instanceof Error ? e.message : "Couldn't load."));
      }
    });
  }, []);

  const empty =
    local !== null && local.length === 0 && (signedIn === false || (cloud !== null && cloud.length === 0));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col px-5 pb-6">
        <h1 className="mb-5 font-display text-[1.625rem] text-ink">History</h1>

        {empty && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[0.9375rem] text-ink-soft">No saved entries yet.</p>
            <Link href="/" className="mt-3 text-[0.9375rem] text-accent underline underline-offset-4">
              Start a thought log
            </Link>
          </div>
        )}

        {local !== null && local.length > 0 && (
          <section className="mb-7" aria-label="On this device">
            <h2 className="mb-2 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
              On this device
            </h2>
            <EntryList entries={local} source="local" />
          </section>
        )}

        {signedIn && (
          <section aria-label="Cloud history">
            <h2 className="mb-2 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
              Cloud history
            </h2>
            {cloudError ? (
              <p className="text-[0.875rem] text-danger">{cloudError}</p>
            ) : cloud === null ? (
              <p className="text-[0.875rem] text-ink-faint">Loading…</p>
            ) : cloud.length === 0 ? (
              <p className="text-[0.875rem] text-ink-faint">Nothing saved to cloud yet.</p>
            ) : (
              <EntryList entries={cloud} source="cloud" />
            )}
          </section>
        )}

        {signedIn === false && cloudConfigured() && local !== null && local.length > 0 && (
          <p className="mt-2 text-[0.875rem] text-ink-faint">
            <Link href="/account" className="text-accent underline underline-offset-4">
              Sign in
            </Link>{" "}
            to see entries saved to your cloud history.
          </p>
        )}
      </main>
    </div>
  );
}
