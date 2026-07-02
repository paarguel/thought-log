"use client";

/**
 * The "circle your thoughts" step — the digital version of circling
 * phrases on a paper worksheet.
 *
 * The passage is rendered as tappable words. Tap a word to anchor a
 * selection, tap another to extend it, then confirm to mark the phrase
 * with a highlighter sweep. Tapping an already-marked phrase offers to
 * unmark it. Auto-pick uses the deterministic segmenter only. (R4, R5)
 */

import { useMemo, useState } from "react";
import type { FlowAction, FlowState } from "@/lib/thought-log/reducer";
import { overlapsExisting } from "@/lib/thought-log/reducer";
import { segmentPassage } from "@/lib/thought-log/segmenter";
import { GhostButton, SecondaryButton } from "@/components/ui/buttons";
import { StepFooter, StepHeader } from "./step-chrome";

interface Token {
  text: string;
  start: number;
  end: number;
  isWord: boolean;
}

function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  const re = /\S+/g;
  let cursor = 0;
  for (const match of text.matchAll(re)) {
    const idx = match.index ?? 0;
    if (idx > cursor) {
      tokens.push({ text: text.slice(cursor, idx), start: cursor, end: idx, isWord: false });
    }
    tokens.push({ text: match[0], start: idx, end: idx + match[0].length, isWord: true });
    cursor = idx + match[0].length;
  }
  if (cursor < text.length) {
    tokens.push({ text: text.slice(cursor), start: cursor, end: text.length, isWord: false });
  }
  return tokens;
}

interface Pending {
  anchor: number; // token index
  head: number; // token index
}

export function CircleStep({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
}) {
  const w = state.worksheet;
  const [pending, setPending] = useState<Pending | null>(null);
  const [tappedPhraseId, setTappedPhraseId] = useState<string | null>(null);
  const [confirmAuto, setConfirmAuto] = useState(false);

  const tokens = useMemo(() => tokenize(w.thoughtText), [w.thoughtText]);

  const range = useMemo(() => {
    if (!pending) return null;
    const [a, b] =
      pending.anchor <= pending.head
        ? [pending.anchor, pending.head]
        : [pending.head, pending.anchor];
    return { start: tokens[a].start, end: tokens[b].end };
  }, [pending, tokens]);

  const rangeOverlaps = range ? overlapsExisting(w.phrases, range) : false;

  const phraseAt = (start: number, end: number) =>
    w.phrases.find((p) => start < p.end && p.start < end);

  const onWordTap = (i: number) => {
    const token = tokens[i];
    const marked = phraseAt(token.start, token.end);
    if (marked) {
      setTappedPhraseId((prev) => (prev === marked.id ? null : marked.id));
      setPending(null);
      return;
    }
    setTappedPhraseId(null);
    setPending((prev) => (prev ? { ...prev, head: i } : { anchor: i, head: i }));
  };

  const markSelection = () => {
    if (!range || rangeOverlaps) return;
    dispatch({ type: "addPhrase", start: range.start, end: range.end });
    setPending(null);
  };

  const runAuto = () => {
    const segments = segmentPassage(w.thoughtText);
    dispatch({
      type: "setAutoPhrases",
      phrases: segments.map((s) => ({ start: s.start, end: s.end })),
    });
    setPending(null);
    setTappedPhraseId(null);
    setConfirmAuto(false);
  };

  const tappedPhrase = w.phrases.find((p) => p.id === tappedPhraseId);

  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Circle your thoughts">
      <StepHeader
        step="circle"
        title="Circle the thoughts."
        hint="Tap the first and last word of a thought, then mark it. Like circling on paper."
      />

      <div
        className="write-surface min-h-48 select-none text-[1.0625rem] leading-[1.9]"
        role="group"
        aria-label="Your written thoughts — tap words to select a phrase"
      >
        {tokens.map((token, i) => {
          if (!token.isWord) {
            return token.text.includes("\n") ? (
              <span key={i}>
                {token.text.split("\n").map((_, j, arr) => (
                  <span key={j}>{j < arr.length - 1 ? <br /> : " "}</span>
                ))}
              </span>
            ) : (
              <span key={i}> </span>
            );
          }
          const inPhrase = phraseAt(token.start, token.end);
          const inPending =
            range && token.start >= range.start && token.end <= range.end;
          const isTapped = inPhrase && inPhrase.id === tappedPhraseId;
          return (
            <span
              key={i}
              role="button"
              tabIndex={0}
              aria-pressed={Boolean(inPhrase || inPending)}
              onClick={() => onWordTap(i)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onWordTap(i);
                }
              }}
              className={`cursor-pointer ${
                inPhrase
                  ? `phrase-marked ${isTapped ? "ring-2 ring-mark-ink/50" : ""}`
                  : inPending
                    ? "phrase-pending"
                    : ""
              }`}
            >
              {token.text}
            </span>
          );
        })}
      </div>

      {/* Contextual action bar */}
      <div className="mt-4 min-h-16">
        {confirmAuto ? (
          <div className="rounded-xl border border-line bg-paper-raised p-4">
            <p className="text-[0.9375rem] text-ink">
              Auto-pick will replace your {w.phrases.length} marked{" "}
              {w.phrases.length === 1 ? "thought" : "thoughts"}.
            </p>
            <div className="mt-3 flex gap-2">
              <SecondaryButton onClick={runAuto} className="!border-ink !text-ink">
                Replace them
              </SecondaryButton>
              <GhostButton onClick={() => setConfirmAuto(false)}>Keep mine</GhostButton>
            </div>
          </div>
        ) : tappedPhrase ? (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3">
            <p className="line-clamp-1 flex-1 text-[0.9375rem] text-ink-soft">
              “{tappedPhrase.text}”
            </p>
            <SecondaryButton
              onClick={() => {
                dispatch({ type: "removePhrase", id: tappedPhrase.id });
                setTappedPhraseId(null);
              }}
              className="!text-danger shrink-0"
            >
              Unmark
            </SecondaryButton>
          </div>
        ) : range ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={markSelection}
              disabled={rangeOverlaps}
              className="min-h-12 flex-1 rounded-full bg-mark px-5 text-[1rem] font-medium text-mark-ink transition-opacity active:opacity-80 disabled:opacity-40"
            >
              Mark as a thought
            </button>
            <GhostButton onClick={() => setPending(null)}>Clear</GhostButton>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <SecondaryButton
              onClick={() => (w.phrases.length ? setConfirmAuto(true) : runAuto())}
            >
              Auto-pick thoughts
            </SecondaryButton>
            {state.phraseUndoStack.length > 0 && (
              <GhostButton onClick={() => dispatch({ type: "undoPhrase" })}>
                Undo
              </GhostButton>
            )}
            {w.phrases.length > 0 && (
              <span className="ml-auto text-[0.875rem] text-ink-faint">
                {w.phrases.length} marked
              </span>
            )}
          </div>
        )}
      </div>

      <StepFooter
        onNext={() => dispatch({ type: "next" })}
        onBack={() => dispatch({ type: "back" })}
        nextLabel={
          w.phrases.length > 0 ? "Continue" : "Continue without marking"
        }
      />
    </section>
  );
}
