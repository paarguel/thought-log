"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import type { DistortionId, ExtractedThought, LabelAssignment } from "@/lib/thought-log/types";
import { DistortionPicker } from "./distortion-picker";

type LabelingStepProps = {
  thoughts: ExtractedThought[];
  assignments: LabelAssignment[];
  onChange: (assignments: LabelAssignment[]) => void;
};

export function LabelingStep({ thoughts, assignments, onChange }: LabelingStepProps) {
  const [index, setIndex] = useState(0);
  const active = thoughts[index];
  const selected = useMemo(
    () => assignments.find((assignment) => assignment.thoughtId === active?.id)?.distortionIds ?? [],
    [active?.id, assignments],
  );

  const update = (distortionIds: DistortionId[]) => {
    if (!active) {
      return;
    }
    const next = assignments.filter((assignment) => assignment.thoughtId !== active.id);
    onChange([...next, { thoughtId: active.id, distortionIds }]);
  };

  if (!active) {
    return (
      <section>
        <p className="step-kicker">Label</p>
        <h1 className="step-title">No thoughts marked yet.</h1>
        <p className="muted">Go back and mark at least one thought from the passage.</p>
      </section>
    );
  }

  return (
    <section>
      <div className="split-row">
        <div>
          <p className="step-kicker">Label</p>
          <h1 className="step-title">Name the pattern.</h1>
        </div>
        <span className="phrase-count">
          {index + 1}/{thoughts.length}
        </span>
      </div>
      <div className="label-card">
        <p>{active.text}</p>
      </div>
      <div className="action-row" aria-label="Thought navigation">
        <button className="secondary-button" type="button" onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0}>
          <ChevronLeft size={16} aria-hidden="true" /> Previous
        </button>
        <button
          className="secondary-button"
          type="button"
          onClick={() => setIndex(Math.min(thoughts.length - 1, index + 1))}
          disabled={index === thoughts.length - 1}
        >
          Next <ChevronRight size={16} aria-hidden="true" />
        </button>
      </div>
      <DistortionPicker selected={selected} onChange={update} />
    </section>
  );
}
