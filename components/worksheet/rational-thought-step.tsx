"use client";

import { useState, type ReactNode } from "react";
import type { DistortionId, RationalResponse, ReviewMode, ThoughtLogDraft } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";

type RationalThoughtStepProps = {
  draft: ThoughtLogDraft;
  onModeChange: (mode: ReviewMode) => void;
  onFullChange: (value: string) => void;
  onResponsesChange: (responses: RationalResponse[]) => void;
};

export function RationalThoughtStep({ draft, onModeChange, onFullChange, onResponsesChange }: RationalThoughtStepProps) {
  const [mode, setMode] = useState<ReviewMode>(draft.reviewModeLastUsed);
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(0, draft.extractedThoughts.length - 1));
  const active = draft.extractedThoughts[safeIndex];

  const choose = (next: ReviewMode) => {
    setMode(next);
    onModeChange(next);
  };

  const updateActiveResponse = (text: string) => {
    if (!active) {
      return;
    }

    const next = draft.rationalResponses.filter((response) => response.thoughtId !== active.id);
    onResponsesChange(text.trim() ? [...next, { thoughtId: active.id, text }] : next);
  };

  return (
    <section>
      <p className="step-kicker">Rational thought</p>
      <h1 className="step-title">Write your response.</h1>
      <div className="tab-list" role="tablist" aria-label="Writing modes">
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

      {mode === "original" && (
        <FullResponseMode
          contextTitle="Original text"
          context={<p>{draft.thoughtText || "No thought passage yet."}</p>}
          value={draft.rationalThought}
          onChange={onFullChange}
          textareaLabel="Response to original text"
        />
      )}

      {mode === "all" && (
        <FullResponseMode
          contextTitle="Marked thoughts and labels"
          context={<AllTogether draft={draft} />}
          value={draft.rationalThought}
          onChange={onFullChange}
          textareaLabel="Response to all labeled thoughts"
        />
      )}

      {mode === "one" && (
        <OneByOneMode
          draft={draft}
          index={safeIndex}
          onIndexChange={setIndex}
          value={active ? draft.rationalResponses.find((response) => response.thoughtId === active.id)?.text ?? "" : ""}
          onChange={updateActiveResponse}
        />
      )}
    </section>
  );
}

function FullResponseMode({
  contextTitle,
  context,
  value,
  onChange,
  textareaLabel,
}: {
  contextTitle: string;
  context: ReactNode;
  value: string;
  onChange: (value: string) => void;
  textareaLabel: string;
}) {
  return (
    <div className="response-stack">
      <div className="review-panel writing-context">
        <h2>{contextTitle}</h2>
        {context}
      </div>
      <label className="field-label" htmlFor="rational-thought">
        {textareaLabel}
      </label>
      <textarea
        id="rational-thought"
        className="text-area cta-glow"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write the grounded thought in your own words."
        autoFocus
      />
    </div>
  );
}

function AllTogether({ draft }: { draft: ThoughtLogDraft }) {
  if (draft.extractedThoughts.length === 0) {
    return <p>No marked thoughts yet.</p>;
  }

  return (
    <div className="review-thought-list">
      {draft.extractedThoughts.map((thought, index) => (
        <article className="review-thought" key={thought.id}>
          <span className="thought-number">{index + 1}</span>
          <div>
            <strong>{thought.text}</strong>
            <PatternPills ids={draft.labelAssignments.find((assignment) => assignment.thoughtId === thought.id)?.distortionIds ?? []} />
          </div>
        </article>
      ))}
    </div>
  );
}

function OneByOneMode({
  draft,
  index,
  onIndexChange,
  value,
  onChange,
}: {
  draft: ThoughtLogDraft;
  index: number;
  onIndexChange: (index: number) => void;
  value: string;
  onChange: (value: string) => void;
}) {
  const active = draft.extractedThoughts[index];

  if (!active) {
    return (
      <div className="review-panel writing-context">
        <h2>No thoughts marked yet.</h2>
        <p className="muted">Go back and mark at least one thought from the passage.</p>
      </div>
    );
  }

  const labels = draft.labelAssignments.find((assignment) => assignment.thoughtId === active.id)?.distortionIds ?? [];

  return (
    <div className="response-stack">
      <div className="review-panel writing-context one-by-one-context">
        <p className="phrase-count">
          {index + 1}/{draft.extractedThoughts.length}
        </p>
        <h2>{active.text}</h2>
        <PatternPills ids={labels} showDefinitions />
      </div>
      <label className="field-label" htmlFor="rational-response">
        Response to this thought
      </label>
      <textarea
        id="rational-response"
        className="text-area cta-glow"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write the response to this thought."
        autoFocus
      />
      <div className="action-row" aria-label="Rational response navigation">
        <button className="secondary-button" type="button" onClick={() => onIndexChange(Math.max(0, index - 1))} disabled={index === 0}>
          Previous
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => onIndexChange(Math.min(draft.extractedThoughts.length - 1, index + 1))}
          disabled={index === draft.extractedThoughts.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function PatternPills({ ids, showDefinitions = false }: { ids: DistortionId[]; showDefinitions?: boolean }) {
  if (ids.length === 0) {
    return <p className="muted">Unlabeled</p>;
  }

  if (showDefinitions) {
    return (
      <div className="pattern-definition-list">
        {ids.map((id) => {
          const distortion = getDistortion(id);
          return (
            <article className="pattern-definition" key={id}>
              <strong>{distortion?.label ?? id}</strong>
              {distortion?.definition ? <small>{distortion.definition}</small> : null}
            </article>
          );
        })}
      </div>
    );
  }

  return (
    <div className="pattern-list">
      {ids.map((id) => {
        const distortion = getDistortion(id);
        return (
          <span className="pattern-pill" key={id} title={distortion?.definition}>
            {distortion?.shortLabel ?? id}
          </span>
        );
      })}
    </div>
  );
}
