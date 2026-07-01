"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ThoughtLogEntry } from "@/lib/thought-log/types";
import { clearLocalEntries, deleteLocalEntry, listLocalEntries } from "@/lib/local-store/indexed-db";
import { CloudHistory } from "@/components/history/cloud-history";
import { ThoughtLogReview } from "@/components/history/thought-log-review";

export function HistoryPage() {
  const [localEntries, setLocalEntries] = useState<ThoughtLogEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<ThoughtLogEntry | null>(null);

  const refresh = async () => {
    const entries = sortEntries(await listLocalEntries());
    setLocalEntries(entries);
    setSelectedEntry((current) => (current && entries.some((entry) => entry.id === current.id) ? current : null));
  };

  useEffect(() => {
    let active = true;

    listLocalEntries()
      .then((entries) => {
        if (active) {
          setLocalEntries(sortEntries(entries));
        }
      })
      .catch(() => {
        if (active) {
          setLocalEntries([]);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <header className="top-bar">
          <Link className="icon-button" href="/" aria-label="Back to worksheet">
            <ArrowLeft size={20} aria-hidden="true" />
          </Link>
          <div className="brand-lockup">
            <strong>History</strong>
            <span>Local first</span>
          </div>
          <span />
        </header>
        <div className="step-area">
          <section className="history-section">
            <div className="split-row">
              <h1 className="step-title">On this device</h1>
              <button
                className="danger-button"
                type="button"
                onClick={async () => {
                  await clearLocalEntries();
                  setSelectedEntry(null);
                  await refresh();
                }}
              >
                Clear
              </button>
            </div>
            <div className="history-list">
              {localEntries.length === 0 && <p className="muted">No local entries yet.</p>}
              {localEntries.map((entry) => (
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
                        await deleteLocalEntry(entry.id);
                        await refresh();
                      }}
                    >
                      Delete local copy
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
          {selectedEntry && <ThoughtLogReview entry={selectedEntry} onClose={() => setSelectedEntry(null)} />}
          <section className="history-section section-gap">
            <h2>Cloud history</h2>
            <CloudHistory />
          </section>
        </div>
      </div>
    </main>
  );
}

const sortEntries = (entries: ThoughtLogEntry[]) => entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const getEntryPreview = (entry: ThoughtLogEntry) =>
  entry.rationalThought || entry.rationalResponses?.find((response) => response.text.trim())?.text || entry.thoughtText || entry.situation;
