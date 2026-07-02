"use client";

/**
 * One-phrase-at-a-time labeling (R6). The active phrase is the subject;
 * distortion definitions are available on demand without filling the screen.
 */

import { useState } from "react";
import type { FlowAction, FlowState } from "@/lib/thought-log/reducer";
import { DISTORTIONS } from "@/lib/thought-log/distortions";
import { GhostButton } from "@/components/ui/buttons";
import { StepFooter, StepHeader } from "./step-chrome";

export function LabelStep({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
}) {
  const phrases = state.worksheet.phrases;
  const [index, setIndex] = useState(0);
  const [openInfo, setOpenInfo] = useState<string | null>(null);

  const clamped = Math.min(index, phrases.length - 1);
  const phrase = phrases[clamped];
  const isLast = clamped === phrases.length - 1;

  if (!phrase) {
    // Should not happen (step is skipped when no phrases), but stay safe.
    return null;
  }

  const removeCurrent = () => {
    dispatch({ type: "removePhrase", id: phrase.id });
    setOpenInfo(null);
    if (phrases.length === 1) {
      // That was the only thought — nothing left to label or review.
      dispatch({ type: "next" });
    }
  };

  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Name the pattern">
      <StepHeader
        step="label"
        title="Name the pattern."
        hint="Does this thought fit any of these thinking traps? Pick any that apply — or none."
      />

      <p className="mb-1 text-[0.8125rem] text-ink-faint">
        Thought {clamped + 1} of {phrases.length}
      </p>
      <blockquote className="rounded-xl bg-mark-soft px-4 py-3 font-display text-[1.1875rem] leading-snug text-ink">
        “{phrase.text}”
      </blockquote>
      <div className="mb-3 -ml-2 flex justify-start">
        <GhostButton onClick={removeCurrent} className="!text-danger !px-2 !min-h-9 text-[0.875rem]">
          Remove this thought
        </GhostButton>
      </div>

      <ul className="flex flex-col gap-1.5" aria-label="Thinking patterns">
        {DISTORTIONS.map((d) => {
          const on = phrase.distortionIds.includes(d.id);
          const infoOpen = openInfo === d.id;
          return (
            <li key={d.id}>
              <div
                className={`flex items-center gap-1 rounded-xl border px-1 transition-colors ${
                  on ? "border-ink bg-paper-raised" : "border-line bg-paper-raised/60"
                }`}
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    dispatch({
                      type: "toggleDistortion",
                      phraseId: phrase.id,
                      distortionId: d.id,
                    })
                  }
                  className="flex min-h-11 flex-1 items-center gap-2.5 px-2.5 text-left"
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[0.7rem] ${
                      on ? "border-ink bg-ink text-paper" : "border-line-strong text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={`text-[0.9375rem] ${on ? "text-ink" : "text-ink-soft"}`}>
                    {d.label}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={`What is ${d.label}?`}
                  aria-expanded={infoOpen}
                  onClick={() => setOpenInfo(infoOpen ? null : d.id)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-faint"
                >
                  ?
                </button>
              </div>
              {infoOpen && (
                <div className="mx-1 rounded-b-xl border-x border-b border-line bg-paper-sunken px-4 py-2.5 text-[0.875rem] text-ink-soft">
                  <p>{d.definition}</p>
                  <p className="mt-1 italic text-ink-faint">{d.example}</p>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <StepFooter
        onNext={() => {
          if (isLast) {
            dispatch({ type: "next" });
          } else {
            setIndex(clamped + 1);
            setOpenInfo(null);
          }
        }}
        nextLabel={isLast ? "Continue" : "Next thought"}
      >
        {clamped > 0 && (
          <div className="mb-1 text-center">
            <GhostButton onClick={() => setIndex(clamped - 1)}>
              Previous thought
            </GhostButton>
          </div>
        )}
      </StepFooter>
      <div className="pb-2 text-center">
        <GhostButton onClick={() => dispatch({ type: "back" })}>Back</GhostButton>
      </div>
    </section>
  );
}
