"use client";

import { useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { Check, Wand2 } from "lucide-react";
import type { ExtractedThought } from "@/lib/thought-log/types";
import { createManualThought, segmentThoughts } from "@/lib/thought-log/segmenter";

type PhraseExtractionStepProps = {
  thoughtText: string;
  thoughts: ExtractedThought[];
  onChange: (thoughts: ExtractedThought[]) => void;
};

type WordToken = {
  index: number;
  start: number;
  end: number;
  text: string;
};

type TokenSelection = {
  anchor: number;
  focus: number;
};

export function PhraseExtractionStep({ thoughtText, thoughts, onChange }: PhraseExtractionStepProps) {
  const passageRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [tokenSelection, setTokenSelection] = useState<TokenSelection | null>(null);
  const tokens = useMemo(() => createWordTokens(thoughtText), [thoughtText]);
  const selectedBounds = tokenSelection ? getSelectionBounds(tokenSelection, tokens) : null;

  const updateFocusFromPoint = (clientX: number, clientY: number) => {
    const target = document.elementFromPoint(clientX, clientY);
    const tokenElement = target instanceof HTMLElement ? target.closest<HTMLElement>("[data-token-index]") : null;

    if (!tokenElement || !passageRef.current?.contains(tokenElement)) {
      return;
    }

    const tokenIndex = Number(tokenElement.dataset.tokenIndex);
    if (Number.isNaN(tokenIndex)) {
      return;
    }

    setTokenSelection((current) => (current ? { ...current, focus: tokenIndex } : current));
  };

  const startTokenSelection = (tokenIndex: number, event: PointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.currentTarget.parentElement?.setPointerCapture?.(event.pointerId);
    window.getSelection()?.removeAllRanges();
    setIsSelecting(true);
    setTokenSelection({ anchor: tokenIndex, focus: tokenIndex });
  };

  const updateTokenSelection = (event: PointerEvent<HTMLDivElement>) => {
    if (!isSelecting) {
      return;
    }

    updateFocusFromPoint(event.clientX, event.clientY);
  };

  const finishTokenSelection = (event: PointerEvent<HTMLDivElement>) => {
    if (!isSelecting) {
      return;
    }

    updateFocusFromPoint(event.clientX, event.clientY);
    setIsSelecting(false);

    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const confirmSelection = () => {
    if (!selectedBounds) {
      return;
    }

    onChange([...thoughts, createManualThought(thoughtText, selectedBounds.start, selectedBounds.end)]);
    setTokenSelection(null);
  };

  const autoChoose = () => {
    if (thoughts.length > 0 && !window.confirm("Auto choose will replace the thoughts marked so far. Continue?")) {
      return;
    }

    setTokenSelection(null);
    onChange(segmentThoughts(thoughtText));
  };

  const undoLast = () => {
    setTokenSelection(null);
    onChange(thoughts.slice(0, -1));
  };

  const clearSelection = () => {
    setTokenSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  return (
    <section>
      <div className="split-row">
        <div>
          <p className="step-kicker">Separate</p>
          <h1 className="step-title">Mark the thoughts inside the passage.</h1>
        </div>
        <span className="phrase-count">{thoughts.length} marked</span>
      </div>
      <div
        ref={passageRef}
        className="passage-box selectable-passage"
        aria-label="Thought passage for selection"
        onPointerMove={updateTokenSelection}
        onPointerUp={finishTokenSelection}
        onPointerCancel={finishTokenSelection}
      >
        {renderSelectableText(thoughtText, tokens, thoughts, tokenSelection, startTokenSelection)}
      </div>
      <div className="action-row">
        <button type="button" className={`primary-button${selectedBounds ? " cta-glow" : ""}`} onClick={confirmSelection} disabled={!selectedBounds}>
          <Check size={18} aria-hidden="true" /> Mark selection
        </button>
        <button type="button" className="secondary-button" onClick={autoChoose}>
          <Wand2 size={16} aria-hidden="true" /> Auto choose thoughts
        </button>
        <button type="button" className="text-button" onClick={clearSelection}>
          Clear selection
        </button>
        <button type="button" className="text-button" onClick={undoLast} disabled={thoughts.length === 0}>
          Undo last
        </button>
      </div>
    </section>
  );
}

const createWordTokens = (text: string): WordToken[] => {
  const tokens: WordToken[] = [];
  const matcher = /\S+/g;
  let match: RegExpExecArray | null;

  while ((match = matcher.exec(text)) !== null) {
    tokens.push({
      index: tokens.length,
      start: match.index,
      end: match.index + match[0].length,
      text: match[0],
    });
  }

  return tokens;
};

const getSelectionBounds = (selection: TokenSelection, tokens: WordToken[]) => {
  const firstIndex = Math.min(selection.anchor, selection.focus);
  const lastIndex = Math.max(selection.anchor, selection.focus);
  const first = tokens[firstIndex];
  const last = tokens[lastIndex];

  if (!first || !last) {
    return null;
  }

  return { firstIndex, lastIndex, start: first.start, end: last.end };
};

const tokenOverlapsThought = (token: WordToken, thoughts: ExtractedThought[]) =>
  thoughts.some((thought) => token.start < thought.end && token.end > thought.start);

const renderSelectableText = (
  text: string,
  tokens: WordToken[],
  thoughts: ExtractedThought[],
  selection: TokenSelection | null,
  onPointerDown: (tokenIndex: number, event: PointerEvent<HTMLSpanElement>) => void,
) => {
  if (tokens.length === 0) {
    return text;
  }

  const selectedBounds = selection ? getSelectionBounds(selection, tokens) : null;
  const parts: ReactNode[] = [];
  let cursor = 0;

  tokens.forEach((token) => {
    if (token.start > cursor) {
      parts.push(text.slice(cursor, token.start));
    }

    const selected = selectedBounds ? token.index >= selectedBounds.firstIndex && token.index <= selectedBounds.lastIndex : false;
    const marked = tokenOverlapsThought(token, thoughts);

    parts.push(
      <span
        className={`word-token${selected ? " word-token-selected" : ""}${marked ? " word-token-marked" : ""}`}
        data-token-index={token.index}
        key={`${token.start}-${token.end}`}
        onPointerDown={(event) => onPointerDown(token.index, event)}
      >
        {text.slice(token.start, token.end)}
      </span>,
    );
    cursor = token.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
};
