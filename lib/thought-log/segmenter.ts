import type { ExtractedThought } from "./types";

const thoughtCuePattern = /\b(always|never|everyone|nobody|can't|cannot|won't|should|must|ruined|awful|weird|defective|failure)\b/i;

export const segmentThoughts = (text: string): ExtractedThought[] => {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return [];
  }

  const rawSegments = normalized
    .split(/(?<=[.!?])\s+|;\s+|\s+-\s+|\s+\bbut\b\s+/i)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const candidates = rawSegments.length > 1 ? rawSegments : normalized.split(/,\s+(?=\b(?:I|everyone|they|unless|if|when)\b)/i);

  const selected = candidates
    .map((segment) => segment.trim())
    .filter((segment) => segment.length >= 8)
    .filter((segment) => thoughtCuePattern.test(segment) || segment.split(" ").length >= 5)
    .slice(0, 8);

  let cursor = 0;

  return selected.map((segment, index) => {
    const start = normalized.indexOf(segment, cursor);
    const safeStart = start >= 0 ? start : cursor;
    const end = safeStart + segment.length;
    cursor = end;

    return {
      id: `auto-${index + 1}`,
      text: segment,
      start: safeStart,
      end,
      source: "auto" as const,
    };
  });
};

export const createManualThought = (text: string, start: number, end: number): ExtractedThought => ({
  id: crypto.randomUUID(),
  text: text.slice(start, end).trim(),
  start,
  end,
  source: "manual",
});
