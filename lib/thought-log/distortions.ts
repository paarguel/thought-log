/**
 * Cognitive distortion catalog.
 *
 * Standard CBT worksheet vocabulary (Burns-style thinking errors),
 * with short labels and plain-language definitions. Deterministic and
 * curated — never AI-generated at runtime.
 */

export interface Distortion {
  id: string;
  label: string;
  definition: string;
  example: string;
}

export const DISTORTIONS: Distortion[] = [
  {
    id: "all-or-nothing",
    label: "All-or-nothing",
    definition: "Seeing things in black and white. If it isn't perfect, it's a failure.",
    example: "“I messed up one part, so the whole thing is ruined.”",
  },
  {
    id: "overgeneralization",
    label: "Overgeneralizing",
    definition: "Treating one bad event as a never-ending pattern.",
    example: "“This always happens to me.”",
  },
  {
    id: "mental-filter",
    label: "Mental filter",
    definition: "Dwelling on one negative detail until it colors everything else.",
    example: "“The day was fine, but I can't stop replaying that one comment.”",
  },
  {
    id: "discounting-positive",
    label: "Discounting the positive",
    definition: "Insisting good things don't count.",
    example: "“They only said that to be nice.”",
  },
  {
    id: "mind-reading",
    label: "Mind reading",
    definition: "Assuming you know what others are thinking, without evidence.",
    example: "“She thinks I'm incompetent.”",
  },
  {
    id: "fortune-telling",
    label: "Fortune telling",
    definition: "Predicting things will turn out badly, as if it were already fact.",
    example: "“I'm going to blow this presentation.”",
  },
  {
    id: "catastrophizing",
    label: "Catastrophizing",
    definition: "Blowing things out of proportion, or expecting the worst possible outcome.",
    example: "“If I fail this, my whole career is over.”",
  },
  {
    id: "emotional-reasoning",
    label: "Emotional reasoning",
    definition: "Believing something must be true because it feels true.",
    example: "“I feel like a burden, so I must be one.”",
  },
  {
    id: "should-statements",
    label: "Should statements",
    definition: "Criticizing yourself or others with shoulds, musts, and oughts.",
    example: "“I should have handled that better.”",
  },
  {
    id: "labeling",
    label: "Labeling",
    definition: "Attaching a fixed, global label instead of describing the behavior.",
    example: "“I'm such an idiot.”",
  },
  {
    id: "personalization",
    label: "Personalization",
    definition: "Blaming yourself for things that aren't fully in your control.",
    example: "“It's my fault they're upset.”",
  },
  {
    id: "blaming",
    label: "Blaming",
    definition: "Holding others entirely responsible for how you feel.",
    example: "“They make me feel worthless.”",
  },
];

const byId = new Map(DISTORTIONS.map((d) => [d.id, d]));

export function getDistortion(id: string): Distortion | undefined {
  return byId.get(id);
}

export function isValidDistortionId(id: string): boolean {
  return byId.has(id);
}
