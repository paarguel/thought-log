"use client";

/**
 * The "circle your thoughts" step — the digital version of circling
 * phrases on a paper worksheet, tuned for thumbs:
 *
 *  - tap a word to start a highlight (fat invisible tap padding)
 *  - drag either selection handle to stretch it, native-selection style
 *  - double-tap a word to grab its whole sentence (deterministic segmenter)
 *  - tap an already-marked phrase to unmark it
 *
 * Auto-pick uses the deterministic segmenter only — never AI. (R4, R5)
 */

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import type { FlowAction, FlowState } from "@/lib/thought-log/reducer";
import { overlapsExisting } from "@/lib/thought-log/reducer";
import { segmentAt, segmentPassage } from "@/lib/thought-log/segmenter";
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

function orderedRange(p: Pending): [number, number] {
  return p.anchor <= p.head ? [p.anchor, p.head] : [p.head, p.anchor];
}

/** Finger sits on the handle below the line; sample the line above it. */
const DRAG_Y_OFFSET = 28;

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

  const containerRef = useRef<HTMLDivElement>(null);
  const handleLoRef = useRef<HTMLDivElement>(null);
  const handleHiRef = useRef<HTMLDivElement>(null);
  const dragging = useRef<null | "lo" | "hi">(null);
  const dragEndedAt = useRef(-Infinity);
  const lastTap = useRef<{ idx: number; time: number } | null>(null);

  const tokens = useMemo(() => tokenize(w.thoughtText), [w.thoughtText]);

  const range = useMemo(() => {
    if (!pending) return null;
    const [lo, hi] = orderedRange(pending);
    return { start: tokens[lo].start, end: tokens[hi].end };
  }, [pending, tokens]);

  const rangeOverlaps = range ? overlapsExisting(w.phrases, range) : false;

  // Position the drag handles under the first/last selected word.
  // Imperative style mutation: measurement-driven, no extra renders.
  useLayoutEffect(() => {
    const c = containerRef.current;
    const lo = handleLoRef.current;
    const hi = handleHiRef.current;
    if (!c || !lo || !hi || !pending) return;
    const [a, b] = orderedRange(pending);
    const loEl = c.querySelector(`[data-idx="${a}"]`);
    const hiEl = c.querySelector(`[data-idx="${b}"]`);
    if (!loEl || !hiEl) return;
    const cr = c.getBoundingClientRect();
    const lr = loEl.getBoundingClientRect();
    const hr = hiEl.getBoundingClientRect();
    lo.style.left = `${lr.left - cr.left}px`;
    lo.style.top = `${lr.bottom - cr.top}px`;
    hi.style.left = `${hr.right - cr.left}px`;
    hi.style.top = `${hr.bottom - cr.top}px`;
  }, [pending, tokens]);

  const phraseAt = (start: number, end: number) =>
    w.phrases.find((p) => start < p.end && p.start < end);

  /** Expand a selection to the sentence containing token `i`. */
  const sentenceSelection = (i: number): Pending | null => {
    const seg = segmentAt(w.thoughtText, tokens[i].start);
    if (!seg) return null;
    const wordIdxs = tokens
      .map((t, j) => ({ t, j }))
      .filter(({ t }) => t.isWord && t.start < seg.end && seg.start < t.end)
      .map(({ j }) => j);
    if (!wordIdxs.length) return null;
    return { anchor: wordIdxs[0], head: wordIdxs[wordIdxs.length - 1] };
  };

  const onWordTap = (i: number, timeStamp: number) => {
    // Releasing a drag handle makes the browser synthesize a click on the
    // word under the finger (a line below the sampled word) — swallowing it
    // keeps the selection where the drag left it.
    if (timeStamp - dragEndedAt.current < 500) return;
    const token = tokens[i];
    const marked = phraseAt(token.start, token.end);
    if (marked) {
      setTappedPhraseId((prev) => (prev === marked.id ? null : marked.id));
      setPending(null);
      return;
    }
    setTappedPhraseId(null);

    const isDoubleTap =
      lastTap.current &&
      lastTap.current.idx === i &&
      timeStamp - lastTap.current.time < 400;
    lastTap.current = { idx: i, time: timeStamp };

    setPending((prev) => {
      if (isDoubleTap) return sentenceSelection(i) ?? prev ?? { anchor: i, head: i };
      if (!prev) return { anchor: i, head: i };
      return { ...prev, head: i };
    });
  };

  const onHandleDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragging.current = e.currentTarget.dataset.handle === "lo" ? "lo" : "hi";
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // capture is an optimization; dragging still works without it
    }
  };

  const onHandleMove = (e: React.PointerEvent) => {
    if (!dragging.current || !pending) return;
    const el = document.elementFromPoint(e.clientX, e.clientY - DRAG_Y_OFFSET);
    const wordEl = el?.closest?.("[data-idx]");
    if (!wordEl) return;
    const idx = Number(wordEl.getAttribute("data-idx"));
    if (Number.isNaN(idx)) return;
    setPending((prev) => {
      if (!prev) return prev;
      const [lo, hi] = orderedRange(prev);
      // The dragged end follows the finger; the other end stays put.
      return dragging.current === "lo"
        ? { anchor: hi, head: idx }
        : { anchor: lo, head: idx };
    });
  };

  const onHandleUp = (e: React.PointerEvent) => {
    if (dragging.current) dragEndedAt.current = e.timeStamp;
    dragging.current = null;
  };

  const markSelection = () => {
    if (!range || rangeOverlaps) return;
    dispatch({ type: "addPhrase", start: range.start, end: range.end });
    setPending(null);
    try {
      navigator.vibrate?.(15);
    } catch {
      // haptics are a bonus, never a requirement
    }
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
        hint="Tap a word to start a highlight, then drag the handles. Double-tap grabs the whole sentence."
      />

      <div
        ref={containerRef}
        className="write-surface relative min-h-48 select-none pb-6 text-[1.0625rem] leading-[2.05]"
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
              data-idx={i}
              role="button"
              tabIndex={0}
              aria-pressed={Boolean(inPhrase || inPending)}
              onClick={(e) => onWordTap(i, e.timeStamp)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onWordTap(i, e.timeStamp);
                }
              }}
              className={`tap-word cursor-pointer ${
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

        {pending && (
          <>
            <div
              ref={handleLoRef}
              data-handle="lo"
              className="sel-handle-wrap"
              aria-hidden="true"
              onPointerDown={onHandleDown}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              onPointerCancel={onHandleUp}
            >
              <div className="sel-handle sel-handle-lo" />
            </div>
            <div
              ref={handleHiRef}
              data-handle="hi"
              className="sel-handle-wrap"
              aria-hidden="true"
              onPointerDown={onHandleDown}
              onPointerMove={onHandleMove}
              onPointerUp={onHandleUp}
              onPointerCancel={onHandleUp}
            >
              <div className="sel-handle sel-handle-hi" />
            </div>
          </>
        )}
      </div>

      {/* Contextual action bar — floats above the fold on long passages */}
      <div className="sticky bottom-2 z-20 mt-4 min-h-16">
        {confirmAuto ? (
          <div className="rounded-xl border border-line bg-paper-raised p-4 shadow-lg shadow-ink/5">
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
          <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised p-3 shadow-lg shadow-ink/5">
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
          <div className="rounded-xl bg-paper/90 p-1 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={markSelection}
                disabled={rangeOverlaps}
                className="min-h-12 flex-1 rounded-full bg-mark px-5 text-[1rem] font-medium text-mark-ink shadow-md shadow-ink/10 transition-opacity active:opacity-80 disabled:opacity-40"
              >
                Mark as a thought
              </button>
              <GhostButton onClick={() => setPending(null)}>Clear</GhostButton>
            </div>
            {rangeOverlaps && (
              <p className="mt-1.5 px-2 text-[0.8125rem] text-ink-faint">
                This overlaps a marked thought — drag the handles to adjust.
              </p>
            )}
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
