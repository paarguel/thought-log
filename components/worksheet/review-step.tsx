"use client";

/**
 * Review the worksheet map. Original Text is the default lens (R7);
 * All together and One by one offer other levels of detail.
 */

import { useState } from "react";
import type { FlowAction, FlowState } from "@/lib/thought-log/reducer";
import type { ReviewMode, Worksheet } from "@/lib/thought-log/types";
import { getDistortion } from "@/lib/thought-log/distortions";
import { GhostButton } from "@/components/ui/buttons";
import { StepFooter, StepHeader } from "./step-chrome";

const MODES: Array<{ id: ReviewMode; label: string }> = [
  { id: "original", label: "Original" },
  { id: "all-together", label: "All together" },
  { id: "one-by-one", label: "One by one" },
];

/** Passage with marked phrases highlighted; plain React rendering, no HTML injection. */
export function MarkedPassage({ worksheet }: { worksheet: Worksheet }) {
  const { thoughtText, phrases } = worksheet;
  const sorted = [...phrases].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  for (const p of sorted) {
    if (p.start > cursor) {
      parts.push(<span key={`t-${cursor}`}>{thoughtText.slice(cursor, p.start)}</span>);
    }
    const labels = p.distortionIds
      .map((id) => getDistortion(id)?.label)
      .filter(Boolean)
      .join(", ");
    parts.push(
      <span key={p.id}>
        <span className="phrase-marked">{thoughtText.slice(p.start, p.end)}</span>
        {labels && (
          <span className="ml-0.5 align-super text-[0.6875rem] text-accent"> {labels}</span>
        )}
      </span>
    );
    cursor = p.end;
  }
  parts.push(<span key="tail">{thoughtText.slice(cursor)}</span>);
  return (
    <p className="whitespace-pre-wrap text-[1.0625rem] leading-[1.9] text-ink">{parts}</p>
  );
}

function AllTogether({ worksheet }: { worksheet: Worksheet }) {
  return (
    <ul className="flex flex-col gap-3">
      {worksheet.phrases.map((p) => (
        <li key={p.id} className="rounded-xl border border-line bg-paper-raised p-4">
          <p className="font-display text-[1.0625rem] leading-snug text-ink">“{p.text}”</p>
          <p className="mt-1.5 text-[0.875rem] text-accent">
            {p.distortionIds.map((id) => getDistortion(id)?.label).filter(Boolean).join(" · ") ||
              "No pattern named"}
          </p>
        </li>
      ))}
    </ul>
  );
}

function OneByOne({ worksheet }: { worksheet: Worksheet }) {
  const [i, setI] = useState(0);
  const phrases = worksheet.phrases;
  const p = phrases[Math.min(i, phrases.length - 1)];
  if (!p) return null;
  return (
    <div>
      <p className="mb-1 text-[0.8125rem] text-ink-faint">
        Thought {Math.min(i, phrases.length - 1) + 1} of {phrases.length}
      </p>
      <div className="rounded-xl border border-line bg-paper-raised p-5">
        <p className="font-display text-[1.1875rem] leading-snug text-ink">“{p.text}”</p>
        <ul className="mt-3 flex flex-col gap-1.5">
          {p.distortionIds.length ? (
            p.distortionIds.map((id) => {
              const d = getDistortion(id);
              if (!d) return null;
              return (
                <li key={id} className="text-[0.9375rem] text-ink-soft">
                  <span className="font-medium text-accent">{d.label}</span> — {d.definition}
                </li>
              );
            })
          ) : (
            <li className="text-[0.9375rem] text-ink-faint">No pattern named.</li>
          )}
        </ul>
      </div>
      <div className="mt-3 flex justify-between">
        <GhostButton onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
          Previous
        </GhostButton>
        <GhostButton
          onClick={() => setI(Math.min(phrases.length - 1, i + 1))}
          disabled={i >= phrases.length - 1}
        >
          Next
        </GhostButton>
      </div>
    </div>
  );
}

export function ReviewStep({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
}) {
  const mode = state.worksheet.reviewModeLastUsed;

  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Review">
      <StepHeader
        step="review"
        title="Step back and look."
        hint="This is your whole worksheet — the thoughts you circled and the patterns you named."
      />

      <div
        role="tablist"
        aria-label="Review mode"
        className="mb-4 flex rounded-full border border-line bg-paper-raised p-1"
      >
        {MODES.map((m) => (
          <button
            key={m.id}
            role="tab"
            aria-selected={mode === m.id}
            onClick={() => dispatch({ type: "setReviewMode", mode: m.id })}
            className={`min-h-10 flex-1 rounded-full text-[0.875rem] transition-colors ${
              mode === m.id ? "bg-ink text-paper" : "text-ink-soft"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {mode === "original" && (
          <div className="write-surface">
            <MarkedPassage worksheet={state.worksheet} />
          </div>
        )}
        {mode === "all-together" && <AllTogether worksheet={state.worksheet} />}
        {mode === "one-by-one" && <OneByOne worksheet={state.worksheet} />}
      </div>

      <StepFooter
        onNext={() => dispatch({ type: "next" })}
        onBack={() => dispatch({ type: "back" })}
      />
    </section>
  );
}
