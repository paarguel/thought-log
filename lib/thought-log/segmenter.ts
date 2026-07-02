/**
 * Deterministic phrase segmenter for "auto choose thoughts".
 *
 * Splits a free-written passage into candidate phrases using only
 * punctuation, line breaks, and conjunction heuristics. Runs entirely
 * on-device; never calls a network or model. (R5, KTD7)
 */

export interface Segment {
  start: number;
  end: number;
  text: string;
}

/** Sentence-ending punctuation followed by whitespace, or hard line breaks. */
const BOUNDARY = /[.!?…]+["')\]]*\s+|\n+/g;

/** Coordinating conjunctions that often join two separate thoughts. */
const SPLIT_CONJUNCTIONS = /,\s+(but|and|so|because|which means)\s+/gi;

const MIN_SEGMENT_CHARS = 12;
/** Segments longer than this get a second pass on conjunction boundaries. */
const LONG_SEGMENT_CHARS = 120;

function trimRange(text: string, start: number, end: number): Segment | null {
  let s = start;
  let e = end;
  while (s < e && /\s/.test(text[s])) s++;
  while (e > s && /\s/.test(text[e - 1])) e--;
  if (e - s < MIN_SEGMENT_CHARS) return null;
  return { start: s, end: e, text: text.slice(s, e) };
}

function splitOnBoundaries(
  text: string,
  start: number,
  end: number,
  pattern: RegExp
): Array<[number, number]> {
  const slice = text.slice(start, end);
  const ranges: Array<[number, number]> = [];
  let cursor = 0;
  pattern.lastIndex = 0;
  for (const match of slice.matchAll(pattern)) {
    const idx = match.index ?? 0;
    ranges.push([start + cursor, start + idx + match[0].length]);
    cursor = idx + match[0].length;
  }
  ranges.push([start + cursor, end]);
  return ranges;
}

/**
 * Segment a passage into candidate thought phrases.
 * Sentences first; long sentences are further split on ", but/and/so/because".
 */
export function segmentPassage(text: string): Segment[] {
  if (!text.trim()) return [];

  const segments: Segment[] = [];
  for (const [s, e] of splitOnBoundaries(text, 0, text.length, BOUNDARY)) {
    const sentence = trimRange(text, s, e);
    if (!sentence) continue;

    if (sentence.end - sentence.start <= LONG_SEGMENT_CHARS) {
      segments.push(sentence);
      continue;
    }

    for (const [cs, ce] of splitOnBoundaries(
      text,
      sentence.start,
      sentence.end,
      SPLIT_CONJUNCTIONS
    )) {
      const clause = trimRange(text, cs, ce);
      if (clause) segments.push(clause);
    }
  }
  return segments;
}
