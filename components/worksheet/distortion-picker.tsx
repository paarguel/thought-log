"use client";

import type { DistortionId } from "@/lib/thought-log/types";
import { distortions } from "@/lib/thought-log/distortions";

type DistortionPickerProps = {
  selected: DistortionId[];
  onChange: (ids: DistortionId[]) => void;
};

export function DistortionPicker({ selected, onChange }: DistortionPickerProps) {
  const toggle = (id: DistortionId) => {
    onChange(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]);
  };

  return (
    <div className="distortion-list" aria-label="Thinking pattern choices">
      {distortions.map((distortion) => (
        <button
          key={distortion.id}
          type="button"
          className="chip-button distortion-option"
          aria-pressed={selected.includes(distortion.id)}
          onClick={() => toggle(distortion.id)}
        >
          <span>{distortion.label}</span>
          <small>{distortion.definition}</small>
        </button>
      ))}
    </div>
  );
}
