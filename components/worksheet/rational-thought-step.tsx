"use client";

import type { ThoughtLogDraft } from "@/lib/thought-log/types";

type RationalThoughtStepProps = {
  draft: ThoughtLogDraft;
  onChange: (value: string) => void;
};

export function RationalThoughtStep({ draft, onChange }: RationalThoughtStepProps) {
  return (
    <section>
      <p className="step-kicker">Rational thought</p>
      <h1 className="step-title">Write what you want to practice believing.</h1>
      <label className="field-label" htmlFor="rational-thought">
        Realistic / rational thought
      </label>
      <textarea
        id="rational-thought"
        className="text-area cta-glow"
        value={draft.rationalThought}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write the grounded thought in your own words."
        autoFocus
      />
      <div className="review-panel section-gap">
        <strong>Thinking patterns to consider</strong>
        <p className="muted">
          {draft.labelAssignments.flatMap((assignment) => assignment.distortionIds).length} labels across{" "}
          {draft.extractedThoughts.length} marked thoughts.
        </p>
      </div>
    </section>
  );
}
