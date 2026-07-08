"use client";

/**
 * Your data. There is no account and no server — this page makes that
 * legible: where entries live, how to back them up, how to wipe them.
 * It also carries the app's honest limits (working tool, not an archive,
 * not a medical device).
 */

import { useRef, useState } from "react";
import { listLocalEntries, saveLocalEntry, clearAllLocalData } from "@/lib/local-store/indexed-db";
import {
  backupFilename,
  backupToJson,
  downloadFile,
  parseBackupJson,
} from "@/lib/local-store/export";
import { GhostButton, PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { TopBar } from "@/components/app/top-bar";

export default function DataPage() {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const say = (message: string) => {
    setError(null);
    setNotice(message);
  };
  const fail = (message: string) => {
    setNotice(null);
    setError(message);
  };

  const exportAll = async () => {
    try {
      const entries = await listLocalEntries();
      if (entries.length === 0) {
        fail("Nothing to back up yet — no entries are saved on this device.");
        return;
      }
      downloadFile(backupFilename(), backupToJson(entries), "application/json");
      say(`Backup exported: ${entries.length} ${entries.length === 1 ? "entry" : "entries"}.`);
    } catch {
      fail("Couldn't read the entries on this device.");
    }
  };

  const importBackup = async (file: File) => {
    try {
      const entries = parseBackupJson(await file.text());
      for (const entry of entries) {
        await saveLocalEntry(entry);
      }
      say(`Imported ${entries.length} ${entries.length === 1 ? "entry" : "entries"}. Find them in History.`);
    } catch (e) {
      fail(e instanceof Error ? e.message : "Couldn't import that file.");
    }
  };

  const clearLocal = async () => {
    await clearAllLocalData();
    setConfirmClear(false);
    say("All entries and drafts on this device were cleared.");
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col">
      <TopBar />
      <main className="flex flex-1 flex-col px-5 pb-8">
        <h1 className="mb-2 font-display text-[1.625rem] text-ink">Your data</h1>
        <p className="mb-6 text-[0.9375rem] text-ink-soft">
          Everything you write stays on this device. There is no account, no cloud,
          and no server — nothing you write is ever sent anywhere.
        </p>

        <section className="rounded-xl border border-line bg-paper-raised p-5">
          <h2 className="text-[1rem] font-medium text-ink">Please export regularly</h2>
          <p className="mt-1 text-[0.875rem] leading-relaxed text-ink-soft">
            Because entries live only on this device, they are gone for good if the
            app is deleted, the device is lost, or the system clears its storage.
            Treat this app as a working notepad, not long-term storage — the backup
            file below is the copy that lasts.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton onClick={exportAll}>Export all entries</PrimaryButton>
            <SecondaryButton onClick={() => fileInput.current?.click()}>
              Import a backup
            </SecondaryButton>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) importBackup(file);
                e.target.value = "";
              }}
            />
          </div>
        </section>

        {notice && (
          <p role="status" className="mt-3 text-[0.875rem] text-ink-soft">
            {notice}
          </p>
        )}
        {error && (
          <p role="alert" className="mt-3 text-[0.875rem] text-danger">
            {error}
          </p>
        )}

        <section className="mt-10 border-t border-line pt-5">
          <h2 className="mb-1 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
            This device
          </h2>
          <p className="mb-3 text-[0.875rem] text-ink-soft">
            Remove every draft and entry stored on this device. Exported files are
            not affected.
          </p>
          {confirmClear ? (
            <div className="rounded-xl border border-line bg-paper-raised p-4">
              <p className="text-[0.9375rem] text-ink">
                Clear all data on this device? This can&apos;t be undone.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={clearLocal}
                  className="min-h-11 rounded-full border border-danger px-5 text-[0.9375rem] text-danger"
                >
                  Clear all data
                </button>
                <GhostButton onClick={() => setConfirmClear(false)}>Cancel</GhostButton>
              </div>
            </div>
          ) : (
            <GhostButton onClick={() => setConfirmClear(true)} className="!text-danger/70">
              Clear all data…
            </GhostButton>
          )}
        </section>

        <section className="mt-10 border-t border-line pt-5">
          <h2 className="mb-1 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
            About this app
          </h2>
          <p className="text-[0.8125rem] leading-relaxed text-ink-faint">
            Thought Record is a free, open-source worksheet for noticing
            thinking errors (cognitive distortions), in the style of CBT thought
            records. It is a self-help writing tool — it is not therapy, medical
            advice, or a medical device, and it does not diagnose or treat anything.
            If you are working with a therapist, exports are made to be shared with
            them. No analytics, no tracking, no network access.
          </p>
        </section>
      </main>
    </div>
  );
}
