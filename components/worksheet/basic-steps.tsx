"use client";

/**
 * The straightforward writing steps: situation, feelings, thoughts, rational.
 * One question, one surface, one action per screen (R9).
 */

import { useEffect, useRef, useState } from "react";
import type { FlowAction, FlowState } from "@/lib/thought-log/reducer";
import { FEELING_GROUPS } from "@/lib/thought-log/feelings";
import { dataNoticeAcknowledged } from "@/components/app/data-notice";
import { StepFooter, StepHeader } from "./step-chrome";

interface StepProps {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
}

export function SituationStep({ state, dispatch }: StepProps) {
  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Situation">
      <StepHeader
        step="situation"
        title="What happened?"
        hint="Just the facts of the moment — where you were, what occurred."
      />
      <textarea
        className="write-surface min-h-36"
        value={state.worksheet.situation}
        onChange={(e) => dispatch({ type: "setSituation", value: e.target.value })}
        placeholder="e.g. My boss emailed asking to “talk tomorrow” with no other detail."
        aria-label="Describe the situation"
        // Don't pop the keyboard under the first-launch notice.
        autoFocus={dataNoticeAcknowledged()}
      />
      <StepFooter
        onNext={() => dispatch({ type: "next" })}
        nextDisabled={!state.worksheet.situation.trim()}
      />
    </section>
  );
}

export function FeelingsStep({ state, dispatch }: StepProps) {
  const [custom, setCustom] = useState("");
  const selected = new Set(state.worksheet.feelings.map((f) => f.name));
  const customFeelings = state.worksheet.feelings.filter(
    (f) => !FEELING_GROUPS.some((g) => g.words.includes(f.name))
  );

  const addCustom = () => {
    const name = custom.trim();
    if (!name || selected.has(name)) return;
    dispatch({ type: "toggleFeeling", name });
    setCustom("");
  };

  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Feelings">
      <StepHeader
        step="feelings"
        title="How did it feel?"
        hint="Tap the words that fit. There's no wrong answer."
      />
      <div className="flex flex-col gap-4">
        {FEELING_GROUPS.map((group) => (
          <div key={group.family}>
            <p className="mb-1.5 text-[0.75rem] uppercase tracking-[0.08em] text-ink-faint">
              {group.family}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.words.map((word) => {
                const on = selected.has(word);
                return (
                  <button
                    key={word}
                    type="button"
                    aria-pressed={on}
                    onClick={() => dispatch({ type: "toggleFeeling", name: word })}
                    className={`min-h-10 rounded-full border px-4 text-[0.9375rem] transition-colors ${
                      on
                        ? "border-ink bg-ink text-paper"
                        : "border-line bg-paper-raised text-ink-soft"
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {customFeelings.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {customFeelings.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed
                onClick={() => dispatch({ type: "toggleFeeling", name: f.name })}
                className="min-h-10 rounded-full border border-ink bg-ink px-4 text-[0.9375rem] text-paper"
              >
                {f.name}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <input
            className="write-surface min-h-11 flex-1 !py-2"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustom()}
            placeholder="Something else…"
            aria-label="Add your own feeling word"
          />
          <button
            type="button"
            onClick={addCustom}
            disabled={!custom.trim()}
            className="min-h-11 rounded-full border border-line-strong px-4 text-[0.9375rem] text-ink-soft disabled:opacity-35"
          >
            Add
          </button>
        </div>
      </div>
      <StepFooter
        onNext={() => dispatch({ type: "next" })}
        onBack={() => dispatch({ type: "back" })}
        nextDisabled={state.worksheet.feelings.length === 0}
      />
    </section>
  );
}

export function ThoughtsStep({ state, dispatch }: StepProps) {
  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Thoughts">
      <StepHeader
        step="thoughts"
        title="Write it all out."
        hint="Everything going through your head, unfiltered. Don't organize it — you'll circle the thoughts next."
      />
      <textarea
        className="write-surface min-h-56 flex-1"
        value={state.worksheet.thoughtText}
        onChange={(e) => dispatch({ type: "setThoughtText", value: e.target.value })}
        placeholder="Let it pour out…"
        aria-label="Write your thoughts freely"
        autoFocus
      />
      <StepFooter
        onNext={() => dispatch({ type: "next" })}
        onBack={() => dispatch({ type: "back" })}
        nextDisabled={!state.worksheet.thoughtText.trim()}
      />
    </section>
  );
}

export function RationalStep({ state, dispatch }: StepProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  const w = state.worksheet;

  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Balanced thought">
      <StepHeader
        step="rational"
        title="A more balanced thought."
        hint="Knowing what you know now, what's a fairer way to see it?"
      />
      <textarea
        ref={ref}
        className="write-surface min-h-40"
        value={w.rationalThought}
        onChange={(e) => dispatch({ type: "setRational", value: e.target.value })}
        placeholder="It might be true that… but…"
        aria-label="Write a more balanced thought"
      />
      <details className="mt-4 rounded-xl border border-line bg-paper-raised px-4 py-3">
        <summary className="cursor-pointer text-[0.9375rem] text-ink-soft">
          Recap of this worksheet
        </summary>
        <div className="mt-3 flex flex-col gap-2 text-[0.9375rem] text-ink-soft">
          <p>
            <span className="text-ink-faint">Situation — </span>
            {w.situation || "—"}
          </p>
          <p>
            <span className="text-ink-faint">Feelings — </span>
            {w.feelings.map((f) => f.name).join(", ") || "—"}
          </p>
          {w.phrases.length > 0 && (
            <ul className="flex list-none flex-col gap-1">
              {w.phrases.map((p) => (
                <li key={p.id}>
                  <span className="rounded bg-mark-soft px-1">“{p.text}”</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
      <StepFooter
        onNext={() => dispatch({ type: "next" })}
        onBack={() => dispatch({ type: "back" })}
        nextDisabled={!w.rationalThought.trim()}
        nextLabel="Finish"
      />
    </section>
  );
}
