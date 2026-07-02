"use client";

import { useMemo, useState, type ReactNode } from "react";
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
};

type TokenSelection = {
  anchor: number;
  focus: number;
};

export function PhraseExtractionStep({ thoughtText, thoughts, onChange }: PhraseExtractionStepProps) {
  const [tokenSelection, setTokenSelection] = useState<TokenSelection | null>(null);
  const tokens = useMemo(() => createWordTokens(thoughtText), [thoughtText]);
  const selectedBounds = tokenSelection ? getSelectionBounds(tokenSelection, tokens) : null;

  const tapToken = (tokenIndex: number) => {
    setTokenSelection((current) => (current ? { anchor: current.anchor, focus: tokenIndex } : { anchor: tokenIndex, focus: tokenIndex }));
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
      <p className="muted step-hint">Tap the first and last word of a thought, then Mark selection. Or let Auto choose split it for you.</p>
      <div className="passage-box selectable-passage" aria-label="Thought passage for selection">
        {renderSelectableText(thoughtText, tokens, thoughts, tokenSelection, tapToken)}
      </div>
      <div className="action-row">
        <button type="button" className={`primary-button${selectedBounds ? " cta-glow" : ""}`} onClick={confirmSelection} disabled={!selectedBounds}>
          <Check size={18} aria-hidden="true" /> Mark selection
        </button>
        <button type="button" className="secondary-button" onClick={autoChoose}>
          <Wand2 size={16} aria-hidden="true" /> Auto choose thoughts
        </button>
        <button type="button" className="text-button" onClick={clearSelection} disabled={!tokenSelection}>
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

type TokenState = {
  selected: boolean;
  marked: boolean;
};

const renderSelectableText = (
  text: string,
  tokens: WordToken[],
  thoughts: ExtractedThought[],
  selection: TokenSelection | null,
  onTap: (tokenIndex: number) => void,
) => {
  if (tokens.length === 0) {
    return text;
  }

  const selectedBounds = selection ? getSelectionBounds(selection, tokens) : null;
  const stateOf = (token: WordToken): TokenState => ({
    selected: selectedBounds ? token.index >= selectedBounds.firstIndex && token.index <= selectedBounds.lastIndex : false,
    marked: tokenOverlapsThought(token, thoughts),
  });

  const parts: ReactNode[] = [];
  let cursor = 0;

  tokens.forEach((token, position) => {
    const state = stateOf(token);

    if (token.start > cursor) {
      // Highlight the gap between two same-state tokens so runs read as one continuous phrase.
      const previous = position > 0 ? stateOf(tokens[position - 1]) : null;
      const gapSelected = state.selected && previous?.selected;
      const gapMarked = state.marked && previous?.marked;
      const gapClass = gapSelected ? "gap-selected" : gapMarked ? "gap-marked" : "";
      const gapText = text.slice(cursor, token.start);
      parts.push(
        gapClass ? (
          <span className={gapClass} key={`gap-${token.start}`}>
            {gapText}
          </span>
        ) : (
          gapText
        ),
      );
    }

    parts.push(
      <span
        className={`word-token${state.selected ? " word-token-selected" : ""}${state.marked ? " word-token-marked" : ""}`}
        data-token-index={token.index}
        key={`${token.start}-${token.end}`}
        role="button"
        tabIndex={0}
        onClick={() => onTap(token.index)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onTap(token.index);
          }
        }}
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
