"use client";

import { useState } from "react";
import type { ThoughtLogEntry } from "@/lib/thought-log/types";
import { exportEntryAsHtml, exportEntryAsJson } from "@/lib/local-store/export";
import { saveLocalEntry } from "@/lib/local-store/indexed-db";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { saveCloudThoughtLog } from "@/lib/cloud-history/thought-logs";

type SaveOptionsProps = {
  entry: ThoughtLogEntry;
};

export function SaveOptions({ entry }: SaveOptionsProps) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void> | void, success: string) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
      setMessage(success);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <p className="step-kicker">Keep or release</p>
      <h1 className="step-title">Choose where this goes.</h1>
      <div className="save-panel save-options">
        <button
          className="primary-button"
          type="button"
          disabled={busy}
          onClick={() =>
            run(async () => {
              await saveLocalEntry(entry);
            }, "Saved on this device.")
          }
        >
          Save on this device
        </button>
        <button className="secondary-button" type="button" disabled={busy} onClick={() => run(() => exportEntryAsHtml(entry), "Printable HTML exported.")}>
          Export printable file
        </button>
        <button className="secondary-button" type="button" disabled={busy} onClick={() => run(() => exportEntryAsJson(entry), "JSON file exported.")}>
          Export data file
        </button>
        <button
          className="secondary-button"
          type="button"
          disabled={busy || !isSupabaseConfigured()}
          onClick={() =>
            run(async () => {
              const client = createClient();
              if (!client) {
                throw new Error("Cloud history is not configured yet.");
              }
              await saveCloudThoughtLog(client, entry);
            }, "Saved to cloud history.")
          }
        >
          Save to cloud history
        </button>
        {!isSupabaseConfigured() && <p className="muted">Cloud history appears after Supabase is configured.</p>}
        {message && <p className="notice">{message}</p>}
      </div>
    </section>
  );
}
