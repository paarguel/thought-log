/**
 * The reflection: the check-in read back as four short labeled sections,
 * one per question, followed by one closing line.
 *
 * It only repeats what the user picked and typed. It never infers, ranks or
 * explains a feeling, and no model reads this text.
 */

import type { EmotionCheckIn } from "./types";

export const REFLECTION_CLOSING = "I don't have to figure this out perfectly.";

/** The four questions. Also the flow's step ids, so a section can be reopened. */
export type CheckInSection = "happened" | "feeling" | "body" | "need";

export interface ReflectionRow {
  section: CheckInSection;
  label: string;
  /** Picked words, shown as chips. */
  items: string[];
  /** What was typed, shown as written. */
  text: string;
  /** A small trailing detail (the optional strength). */
  detail?: string;
}

export function rowIsBlank(row: ReflectionRow): boolean {
  return row.items.length === 0 && !row.text && !row.detail;
}

/** Always all four sections, in order; unanswered ones are simply empty. */
export function reflectionRows(c: EmotionCheckIn): ReflectionRow[] {
  return [
    { section: "happened", label: "What happened", items: [], text: c.situation.trim() },
    {
      section: "feeling",
      label: "I might be feeling",
      items: c.emotions,
      text: "",
      detail: c.intensity !== undefined ? `Strength ${c.intensity} of 10` : undefined,
    },
    { section: "body", label: "I notice", items: c.sensations, text: c.sensationText.trim() },
    { section: "need", label: "I might need", items: c.needs, text: c.needText.trim() },
  ];
}

/** Plain-text copy: one labeled line per answered section, then the closing. */
export function reflectionText(c: EmotionCheckIn): string {
  const lines = reflectionRows(c)
    .filter((row) => !rowIsBlank(row))
    .map((row) => {
      const parts = [...row.items, row.text, row.detail ?? ""].filter(Boolean);
      return `${row.label}: ${parts.join(", ")}`;
    });
  return [...lines, ...(lines.length ? [""] : []), REFLECTION_CLOSING].join("\n");
}
