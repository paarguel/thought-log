"use client";

/**
 * Notes on a saved entry: corrections and adjustments made after the fact,
 * usually with a therapist. The worksheet above it is never rewritten — this
 * sits beside it, the way a margin note sits beside a page.
 *
 * There is deliberately one version of the notes and no history, so the only
 * way to lose text is to save over it. That is the single moment this asks
 * for confirmation.
 */

import { useState } from "react";
import { GhostButton, SecondaryButton } from "@/components/ui/buttons";

const EXPLAINER =
  "For corrections, notes, and adjustments made after writing this — including anything worked out with a therapist. The entry above stays as you wrote it.";

export function NotesSection({
  notes,
  onSave,
}: {
  notes?: string;
  onSave: (notes: string) => Promise<void>;
}) {
  const saved = notes?.trim() ?? "";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(saved);
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [showExplainer, setShowExplainer] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setDraft(saved);
    setError(null);
    setConfirmOverwrite(false);
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
    setConfirmOverwrite(false);
    setError(null);
  };

  const commit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSave(draft.trim());
      stopEditing();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save these notes.");
      setConfirmOverwrite(false);
    } finally {
      setSaving(false);
    }
  };

  // Replacing text the user can't get back is the one thing worth a check.
  const requestSave = () => {
    if (saved) {
      setConfirmOverwrite(true);
      return;
    }
    void commit();
  };

  if (!editing) {
    if (!saved) {
      return (
        <section className="mb-6" aria-label="Notes">
          <GhostButton onClick={startEditing} className="!px-0">
            Add notes
          </GhostButton>
        </section>
      );
    }
    return (
      <section className="mb-6" aria-label="Notes">
        <h2 className="mb-1.5 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
          Notes
        </h2>
        <p className="whitespace-pre-wrap rounded-xl border border-line bg-paper-raised px-4 py-3 text-[1rem] text-ink">
          {saved}
        </p>
        <div className="mt-1">
          <GhostButton onClick={startEditing} className="!px-0">
            Edit notes
          </GhostButton>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-6" aria-label="Notes">
      <div className="mb-1.5 flex items-center gap-1">
        <h2 className="text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">Notes</h2>
        <button
          type="button"
          aria-label="What are notes for?"
          aria-expanded={showExplainer}
          onClick={() => setShowExplainer(!showExplainer)}
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-faint"
        >
          ?
        </button>
      </div>
      {showExplainer && (
        <p className="mb-2 text-[0.875rem] leading-relaxed text-ink-soft">{EXPLAINER}</p>
      )}
      <textarea
        className="write-surface min-h-20 shrink grow-0 basis-32"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="What did you get wrong, and what's truer?"
        aria-label="Notes on this entry"
        autoFocus
      />
      {confirmOverwrite ? (
        <div className="mt-3 rounded-xl border border-line bg-paper-raised p-4">
          <p className="text-[0.9375rem] text-ink">
            Replace the notes you saved before? There&apos;s only one version.
          </p>
          <div className="mt-3 flex gap-2">
            <SecondaryButton onClick={commit} disabled={saving}>
              Replace them
            </SecondaryButton>
            <GhostButton onClick={() => setConfirmOverwrite(false)} disabled={saving}>
              Keep editing
            </GhostButton>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <SecondaryButton onClick={requestSave} disabled={saving}>
            Save notes
          </SecondaryButton>
          <GhostButton onClick={stopEditing} disabled={saving}>
            Cancel
          </GhostButton>
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-[0.875rem] text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
