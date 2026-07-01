"use client";

import { useEffect, useState } from "react";
import type { ThoughtLogEntry } from "@/lib/thought-log/types";
import { deleteCloudThoughtLog, listCloudThoughtLogs } from "@/lib/cloud-history/thought-logs";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { SignInPanel } from "@/components/auth/sign-in-panel";
import { ThoughtLogReview } from "@/components/history/thought-log-review";

export function CloudHistory() {
  const [entries, setEntries] = useState<ThoughtLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ThoughtLogEntry | null>(null);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  const readCloudEntries = async () => {
    const client = createClient();
    if (!client) {
      return { entries: [], message: "Cloud history is not configured on this deployment yet." };
    }

    const {
      data: { user },
    } = await client.auth.getUser();

    if (!user) {
      return { entries: [], message: "" };
    }

    return { entries: await listCloudThoughtLogs(client), message: "" };
  };

  const refresh = async () => {
    const result = await readCloudEntries();
    setEntries(result.entries);
    setSelectedEntry((current) => (current && result.entries.some((entry) => entry.id === current.id) ? current : null));
    setMessage(result.message);
    setLoaded(true);
  };

  useEffect(() => {
    let active = true;

    readCloudEntries()
      .then((result) => {
        if (active) {
          setEntries(result.entries);
          setMessage(result.message);
          setLoaded(true);
        }
      })
      .catch((error) => {
        if (active) {
          setMessage(error instanceof Error ? error.message : "Cloud history could not load.");
          setLoaded(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  if (!isSupabaseConfigured()) {
    return <p className="muted">Cloud history is not configured on this deployment yet.</p>;
  }

  return (
    <div className="save-options">
      <SignInPanel />
      {!loaded && <p className="muted">Checking cloud history...</p>}
      {message && <p className="notice">{message}</p>}
      {loaded && entries.length === 0 && <p className="muted">No cloud entries are available in this browser session.</p>}
      {entries.map((entry) => (
        <article className="history-item" key={entry.id}>
          <strong>{entry.title}</strong>
          <span className="muted">{new Date(entry.createdAt).toLocaleString()}</span>
          <p>{getEntryPreview(entry)}</p>
          <div className="action-row">
            <button className="secondary-button" type="button" onClick={() => setSelectedEntry(entry)}>
              Review
            </button>
            <button
              className="danger-button"
              type="button"
              onClick={async () => {
                const client = createClient();
                if (!client) {
                  return;
                }
                await deleteCloudThoughtLog(client, entry.id);
                await refresh();
              }}
            >
              Delete cloud copy
            </button>
          </div>
        </article>
      ))}
      {selectedEntry && <ThoughtLogReview entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
    </div>
  );
}

const getEntryPreview = (entry: ThoughtLogEntry) =>
  entry.rationalThought || entry.rationalResponses?.find((response) => response.text.trim())?.text || entry.thoughtText || entry.situation;
