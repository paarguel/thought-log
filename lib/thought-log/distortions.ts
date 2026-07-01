import type { DistortionId } from "./types";

export type Distortion = {
  id: DistortionId;
  label: string;
  shortLabel: string;
  definition: string;
};

export const distortions: Distortion[] = [
  {
    id: "all-or-nothing",
    label: "All-or-nothing thinking",
    shortLabel: "All-or-nothing",
    definition: "Seeing things in only two categories instead of a range.",
  },
  {
    id: "mind-reading",
    label: "Mind reading",
    shortLabel: "Mind reading",
    definition: "Assuming you know what someone else thinks without checking.",
  },
  {
    id: "fortune-telling",
    label: "Fortune telling",
    shortLabel: "Fortune telling",
    definition: "Treating a feared future outcome as already decided.",
  },
  {
    id: "labeling",
    label: "Labeling",
    shortLabel: "Labeling",
    definition: "Reducing yourself or someone else to a fixed negative label.",
  },
  {
    id: "catastrophizing",
    label: "Catastrophizing",
    shortLabel: "Catastrophe",
    definition: "Jumping from a problem to the worst possible outcome.",
  },
  {
    id: "emotional-reasoning",
    label: "Emotional reasoning",
    shortLabel: "Emotion = fact",
    definition: "Treating a feeling as proof that something is true.",
  },
  {
    id: "should-statements",
    label: "Should statements",
    shortLabel: "Shoulds",
    definition: "Using rigid rules that add shame or pressure.",
  },
  {
    id: "mental-filter",
    label: "Mental filter",
    shortLabel: "Filter",
    definition: "Focusing on one negative detail while missing the rest.",
  },
  {
    id: "discounting-positive",
    label: "Discounting the positive",
    shortLabel: "Discounting",
    definition: "Explaining away evidence that does not fit the negative thought.",
  },
  {
    id: "overgeneralization",
    label: "Overgeneralization",
    shortLabel: "Always/never",
    definition: "Turning one event into a broad rule.",
  },
];

export const distortionIds = distortions.map((distortion) => distortion.id);

export const getDistortion = (id: DistortionId) => distortions.find((distortion) => distortion.id === id);
