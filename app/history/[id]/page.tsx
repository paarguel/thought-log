"use client";

/**
 * Entry detail. Renders the saved worksheet read-only (safely, as text —
 * never injected HTML), with export and delete controls.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { Worksheet } from "@/lib/thought-log/types";
import { worksheetTitle } from "@/lib/thought-log/types";
import { getLocalEntry, deleteLocalEntry } from "@/lib/local-store/indexed-db";
import { getCloudEntry, deleteCloudEntry } from "@/lib/cloud/thought-logs";
import {
  downloadFile,
  exportFilename,
  worksheetToJson,
  worksheetToPrintableHtml,
} from "@/lib/local-store/export";
import { TopBar } from "@/components/app/top-bar";
import { MarkedPassage } from "@/components/worksheet/review-step";
import { GhostButton, SecondaryButton } from "@/components/ui/buttons";

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-1.5 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
        {label}
      </h2>
      {children}
    </section>
  );
}

export default function EntryDetailPage() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const source = search.get("src") === "cloud" ? "cloud" : "local";

  const [entry, setEntry] = useState<Worksheet | null | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = source === "cloud" ? getCloudEntry(params.id) : getLocalEntry(params.id);
    Promise.resolve(load)
      .then((w) => setEntry(w ?? null))
      .catch((e) => {
        setEntry(null);
        setError(e instanceof Error ? e.message : "Couldn't load this entry.");
      });
  }, [params.id, source]);

  const remove = async () => {
    try {
      if (source === "cloud") await deleteCloudEntry(params.id);
      else await deleteLocalEntry(params.id);
      router.push("/history");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete this entry.");
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col px-5 pb-8">
        {entry === undefined && <p className="text-[0.875rem] text-ink-faint">Loading…</p>}

        {entry === null && (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <p className="text-[0.9375rem] text-ink-soft">{error ?? "Entry not found."}</p>
            <Link
              href="/history"
              className="mt-3 text-[0.9375rem] text-accent underline underline-offset-4"
            >
              Back to history
            </Link>
          </div>
        )}

        {entry && (
          <>
            <div className="mb-6">
              <p className="text-[0.8125rem] text-ink-faint">
                {new Date(entry.createdAt).toLocaleString(undefined, {
                  dateStyle: "long",
                  timeStyle: "short",
                })}{" "}
                · {source === "cloud" ? "Cloud history" : "On this device"}
              </p>
              <h1 className="mt-1 font-display text-[1.5rem] leading-snug text-ink">
                {worksheetTitle(entry)}
              </h1>
            </div>

            <Section label="Situation">
              <p className="whitespace-pre-wrap text-[1rem] text-ink">{entry.situation || "—"}</p>
            </Section>

            <Section label="Feelings">
              <p className="text-[1rem] text-ink">
                {entry.feelings.map((f) => f.name).join(" · ") || "—"}
              </p>
            </Section>

            <Section label="Thoughts">
              <div className="write-surface">
                <MarkedPassage worksheet={entry} />
              </div>
            </Section>

            <Section label="A more balanced thought">
              <p className="whitespace-pre-wrap rounded-xl bg-paper-sunken px-4 py-3 text-[1rem] text-ink">
                {entry.rationalThought || "—"}
              </p>
            </Section>

            <div className="mt-2 flex flex-wrap gap-2">
              <SecondaryButton
                onClick={() =>
                  downloadFile(
                    exportFilename(entry, "html"),
                    worksheetToPrintableHtml(entry),
                    "text/html"
                  )
                }
              >
                Export printable
              </SecondaryButton>
              <SecondaryButton
                onClick={() =>
                  downloadFile(exportFilename(entry, "json"), worksheetToJson(entry), "application/json")
                }
              >
                Export JSON
              </SecondaryButton>
            </div>

            <div className="mt-8 border-t border-line pt-4">
              {confirmDelete ? (
                <div className="rounded-xl border border-line bg-paper-raised p-4">
                  <p className="text-[0.9375rem] text-ink">
                    Delete this entry {source === "cloud" ? "from your cloud history" : "from this device"}?
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={remove}
                      className="min-h-11 rounded-full border border-danger px-5 text-[0.9375rem] text-danger"
                    >
                      Delete it
                    </button>
                    <GhostButton onClick={() => setConfirmDelete(false)}>Keep it</GhostButton>
                  </div>
                </div>
              ) : (
                <GhostButton onClick={() => setConfirmDelete(true)} className="!text-danger/70">
                  Delete entry
                </GhostButton>
              )}
              {error && entry && (
                <p role="alert" className="mt-2 text-[0.875rem] text-danger">
                  {error}
                </p>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
