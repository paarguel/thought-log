import type { ExtractedThought } from "./types";

const MAX_SEGMENTS = 12;
const MIN_SEGMENT_LENGTH = 3;

// Split into sentence-like chunks on terminators, semicolons, and line breaks
// while keeping the offsets pointing at the ORIGINAL text so highlights line up.
export const segmentThoughts = (text: string): ExtractedThought[] => {
  if (!text.trim()) {
    return [];
  }

  const segments: { start: number; end: number; text: string }[] = [];
  const pattern = /[^.!?;\n]+[.!?;]*/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const raw = match[0];
    const leading = raw.length - raw.trimStart().length;
    const trimmed = raw.trim();

    if (trimmed.length < MIN_SEGMENT_LENGTH) {
      continue;
    }

    const start = match.index + leading;
    segments.push({ start, end: start + trimmed.length, text: trimmed });

    if (segments.length >= MAX_SEGMENTS) {
      break;
    }
  }

  return segments.map((segment, index) => ({
    id: `auto-${index + 1}`,
    text: segment.text,
    start: segment.start,
    end: segment.end,
    source: "auto" as const,
  }));
};

export const createManualThought = (text: string, start: number, end: number): ExtractedThought => ({
  id: crypto.randomUUID(),
  text: text.slice(start, end).trim(),
  start,
  end,
  source: "manual",
});
