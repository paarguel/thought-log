"use client";

import { useEffect, useRef } from "react";
import { Check, Wand2 } from "lucide-react";
import type { ExtractedThought } from "@/lib/thought-log/types";
import { createManualThought, segmentThoughts } from "@/lib/thought-log/segmenter";

type PhraseExtractionStepProps = {
  thoughtText: string;
  thoughts: ExtractedThought[];
  onChange: (thoughts: ExtractedThought[]) => void;
};

type PendingSelection = {
  start: number;
  end: number;
};

export function PhraseExtractionStep({ thoughtText, thoughts, onChange }: PhraseExtractionStepProps) {
  const passageRef = useRef<HTMLDivElement>(null);
  const pendingSelectionRef = useRef<PendingSelection | null>(null);

  useEffect(() => {
    pendingSelectionRef.current = null;
  }, [thoughtText]);

  const readPassageSelection = (): PendingSelection | null => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selection || !selectedText) {
      return null;
    }

    const selectedRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    const selectionBelongsToPassage =
      !selectedRange || !passageRef.current || passageRef.current.contains(selectedRange.commonAncestorContainer);

    if (!selectionBelongsToPassage) {
      return null;
    }

    const start = thoughtText.indexOf(selectedText);
    if (start < 0) {
      return null;
    }

    return { start, end: start + selectedText.length };
  };

  const rememberSelection = () => {
    const selection = readPassageSelection();
    if (selection) {
      pendingSelectionRef.current = selection;
    }
  };

  const confirmSelection = () => {
    const selection = readPassageSelection() ?? pendingSelectionRef.current;

    if (!selection) {
      return;
    }

    onChange([...thoughts, createManualThought(thoughtText, selection.start, selection.end)]);
    pendingSelectionRef.current = null;
    window.getSelection()?.removeAllRanges();
  };

  const autoChoose = () => {
    if (thoughts.length > 0 && !window.confirm("Auto choose will replace the thoughts marked so far. Continue?")) {
      return;
    }

    onChange(segmentThoughts(thoughtText));
  };

  const undoLast = () => onChange(thoughts.slice(0, -1));
  const clearSelection = () => window.getSelection()?.removeAllRanges();

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
        className="passage-box"
        aria-label="Thought passage for selection"
        onKeyUp={rememberSelection}
        onMouseUp={rememberSelection}
        onTouchEnd={rememberSelection}
      >
        {renderMarkedText(thoughtText, thoughts)}
      </div>
      <div className="action-row">
        <button type="button" className="primary-button" onClick={confirmSelection}>
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

const renderMarkedText = (text: string, thoughts: ExtractedThought[]) => {
  if (thoughts.length === 0) {
    return text;
  }

  const sorted = [...thoughts].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  sorted.forEach((thought) => {
    if (thought.start > cursor) {
      parts.push(text.slice(cursor, thought.start));
    }
    parts.push(
      <mark className="marked" key={thought.id}>
        {text.slice(thought.start, thought.end)}
      </mark>,
    );
    cursor = thought.end;
  });

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return parts;
};
