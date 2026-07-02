"use client";

import { useMemo } from "react";
import type { DistortionId, ExtractedThought, LabelAssignment } from "@/lib/thought-log/types";
import { DistortionPicker } from "./distortion-picker";

type LabelingStepProps = {
  thoughts: ExtractedThought[];
  assignments: LabelAssignment[];
  index: number;
  onChange: (assignments: LabelAssignment[]) => void;
};

export function LabelingStep({ thoughts, assignments, index, onChange }: LabelingStepProps) {
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
      <DistortionPicker selected={selected} onChange={update} />
    </section>
  );
}
