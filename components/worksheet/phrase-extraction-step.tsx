"use client";

import { Check, Wand2 } from "lucide-react";
import type { ExtractedThought } from "@/lib/thought-log/types";
import { createManualThought, segmentThoughts } from "@/lib/thought-log/segmenter";

type PhraseExtractionStepProps = {
  thoughtText: string;
  thoughts: ExtractedThought[];
  onChange: (thoughts: ExtractedThought[]) => void;
};

export function PhraseExtractionStep({ thoughtText, thoughts, onChange }: PhraseExtractionStepProps) {
  const confirmSelection = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    if (!selection || !selectedText) {
      return;
    }

    const start = thoughtText.indexOf(selectedText);
    if (start < 0) {
      return;
    }

    onChange([...thoughts, createManualThought(thoughtText, start, start + selectedText.length)]);
    selection.removeAllRanges();
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
      <div className="passage-box" aria-label="Thought passage for selection">
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
