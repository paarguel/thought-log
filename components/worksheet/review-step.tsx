"use client";

import { useState } from "react";
import type { LabelAssignment, ReviewMode, ThoughtLogDraft } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";

type ReviewStepProps = {
  draft: ThoughtLogDraft;
  onModeChange: (mode: ReviewMode) => void;
};

export function ReviewStep({ draft, onModeChange }: ReviewStepProps) {
  const [mode, setMode] = useState<ReviewMode>(draft.reviewModeLastUsed);
  const choose = (next: ReviewMode) => {
    setMode(next);
    onModeChange(next);
  };

  return (
    <section>
      <p className="step-kicker">Review</p>
      <h1 className="step-title">Look at the worksheet map.</h1>
      <div className="tab-list" role="tablist" aria-label="Review modes">
        <button className="tab-button" role="tab" aria-selected={mode === "original"} onClick={() => choose("original")}>
          Original Text
        </button>
        <button className="tab-button" role="tab" aria-selected={mode === "all"} onClick={() => choose("all")}>
          All Together
        </button>
        <button className="tab-button" role="tab" aria-selected={mode === "one"} onClick={() => choose("one")}>
          One by One
        </button>
      </div>
      <div className="review-panel">
        {mode === "original" && <OriginalText draft={draft} />}
        {mode === "all" && <AllTogether assignments={draft.labelAssignments} draft={draft} />}
        {mode === "one" && <OneByOne assignments={draft.labelAssignments} draft={draft} />}
      </div>
    </section>
  );
}

function OriginalText({ draft }: { draft: ThoughtLogDraft }) {
  return (
    <>
      <h2>Original text</h2>
      <p>{draft.thoughtText || "No thought passage yet."}</p>
    </>
  );
}

function AllTogether({ draft, assignments }: { draft: ThoughtLogDraft; assignments: LabelAssignment[] }) {
  return (
    <>
      <h2>Marked thoughts</h2>
      {draft.extractedThoughts.map((thought) => {
        const labels = assignments.find((assignment) => assignment.thoughtId === thought.id)?.distortionIds ?? [];
        return (
          <p key={thought.id}>
            <strong>{thought.text}</strong>
            <br />
            <span className="muted">{labels.map((id) => getDistortion(id)?.shortLabel ?? id).join(", ") || "Unlabeled"}</span>
          </p>
        );
      })}
    </>
  );
}

function OneByOne({ draft, assignments }: { draft: ThoughtLogDraft; assignments: LabelAssignment[] }) {
  const [index, setIndex] = useState(0);
  const active = draft.extractedThoughts[index];

  if (!active) {
    return <p>No marked thoughts yet.</p>;
  }

  const labels = assignments.find((assignment) => assignment.thoughtId === active.id)?.distortionIds ?? [];

  return (
    <>
      <p className="phrase-count">
        {index + 1}/{draft.extractedThoughts.length}
      </p>
      <h2>{active.text}</h2>
      <p className="muted">{labels.map((id) => getDistortion(id)?.label ?? id).join(", ") || "Unlabeled"}</p>
      <div className="action-row" aria-label="Review thought navigation">
        <button className="secondary-button" type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
          Previous
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setIndex(Math.min(draft.extractedThoughts.length - 1, index + 1))}
          disabled={index === draft.extractedThoughts.length - 1}
        >
          Next
        </button>
      </div>
    </>
  );
}
