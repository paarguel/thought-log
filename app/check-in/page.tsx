"use client";

/**
 * Reopen a saved check-in to change it (`/check-in?id=`). Saving writes back
 * to the same entry, keeping its original date. Without an id this is just a
 * new check-in.
 *
 * The id rides in the query string, like the entry page, so the app stays a
 * static export.
 */

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { isCheckIn, type EmotionCheckIn } from "@/lib/check-in/types";
import { getLocalEntry } from "@/lib/local-store/indexed-db";
import { TopBar } from "@/components/app/top-bar";
import { CheckInFlow } from "@/components/check-in/check-in-flow";

function CheckInEditor() {
  const search = useSearchParams();
  const router = useRouter();
  const id = search.get("id") ?? "";
  const [loaded, setLoaded] = useState<EmotionCheckIn | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return;
    getLocalEntry(id)
      .then((entry) => setLoaded(entry && isCheckIn(entry) ? entry : null))
      .catch(() => setLoaded(null));
  }, [id]);

  if (!id) return <CheckInFlow onDone={() => router.push("/")} />;

  if (loaded === undefined) return <div className="flex-1" aria-busy="true" />;

  if (loaded === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-[0.9375rem] text-ink-soft">Check-in not found.</p>
        <Link href="/history" className="mt-3 text-[0.9375rem] text-accent underline underline-offset-4">
          Back to history
        </Link>
      </div>
    );
  }

  const entryUrl = `/history/entry?id=${encodeURIComponent(loaded.id)}`;
  return (
    <CheckInFlow
      editing={loaded}
      onSaved={() => router.push(entryUrl)}
      onCancel={() => router.push(entryUrl)}
    />
  );
}

export default function CheckInPage() {
  return (
    <div className="app-shell mx-auto flex w-full max-w-xl flex-col">
      <TopBar />
      <main className="app-scroll flex flex-col px-5">
        <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
          <CheckInEditor />
        </Suspense>
      </main>
    </div>
  );
}
