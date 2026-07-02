/**
 * Worksheet state reducer — pure, deterministic, unit-testable.
 * The UI dispatches; this file owns every legal state transition.
 */

import type {
  Feeling,
  MarkedPhrase,
  ReviewMode,
  StepId,
  Worksheet,
} from "./types";
import { generateId, newWorksheet, STEP_ORDER } from "./types";

export interface FlowState {
  worksheet: Worksheet;
  step: StepId;
  /** History stack of phrase lists for undo. */
  phraseUndoStack: MarkedPhrase[][];
}

export type FlowAction =
  | { type: "load"; worksheet: Worksheet; step?: StepId }
  | { type: "reset" }
  | { type: "goto"; step: StepId }
  | { type: "next" }
  | { type: "back" }
  | { type: "setSituation"; value: string }
  | { type: "toggleFeeling"; name: string }
  | { type: "setThoughtText"; value: string }
  | { type: "addPhrase"; start: number; end: number }
  | { type: "removePhrase"; id: string }
  | { type: "undoPhrase" }
  | { type: "setAutoPhrases"; phrases: Array<{ start: number; end: number }> }
  | { type: "toggleDistortion"; phraseId: string; distortionId: string }
  | { type: "setRational"; value: string }
  | { type: "setReviewMode"; mode: ReviewMode };

export function initialFlowState(): FlowState {
  return {
    worksheet: newWorksheet(generateId()),
    step: "situation",
    phraseUndoStack: [],
  };
}

function touch(w: Worksheet): Worksheet {
  return { ...w, updatedAt: new Date().toISOString() };
}

function stepIndex(step: StepId): number {
  return STEP_ORDER.indexOf(step);
}

/** Phrases the user still has to label; steps that need them are skipped when empty. */
export function nextStep(current: StepId, w: Worksheet): StepId {
  let i = stepIndex(current) + 1;
  while (i < STEP_ORDER.length) {
    const candidate = STEP_ORDER[i];
    if ((candidate === "label" || candidate === "review") && w.phrases.length === 0) {
      i++;
      continue;
    }
    return candidate;
  }
  return current;
}

export function prevStep(current: StepId, w: Worksheet): StepId {
  let i = stepIndex(current) - 1;
  while (i >= 0) {
    const candidate = STEP_ORDER[i];
    if ((candidate === "label" || candidate === "review") && w.phrases.length === 0) {
      i--;
      continue;
    }
    return candidate;
  }
  return current;
}

function rangesOverlap(a: { start: number; end: number }, b: { start: number; end: number }) {
  return a.start < b.end && b.start < a.end;
}

export function overlapsExisting(
  phrases: MarkedPhrase[],
  range: { start: number; end: number }
): boolean {
  return phrases.some((p) => rangesOverlap(p, range));
}

function makePhrase(w: Worksheet, start: number, end: number, auto = false): MarkedPhrase {
  return {
    id: generateId(),
    start,
    end,
    text: w.thoughtText.slice(start, end),
    distortionIds: [],
    auto,
  };
}

export function flowReducer(state: FlowState, action: FlowAction): FlowState {
  const w = state.worksheet;

  switch (action.type) {
    case "load":
      return {
        worksheet: action.worksheet,
        step: action.step ?? "situation",
        phraseUndoStack: [],
      };

    case "reset":
      return initialFlowState();

    case "goto":
      return { ...state, step: action.step };

    case "next":
      return { ...state, step: nextStep(state.step, w) };

    case "back":
      return { ...state, step: prevStep(state.step, w) };

    case "setSituation":
      return { ...state, worksheet: touch({ ...w, situation: action.value }) };

    case "toggleFeeling": {
      const exists = w.feelings.some((f) => f.name === action.name);
      const feelings: Feeling[] = exists
        ? w.feelings.filter((f) => f.name !== action.name)
        : [...w.feelings, { id: generateId(), name: action.name }];
      return { ...state, worksheet: touch({ ...w, feelings }) };
    }

    case "setThoughtText": {
      // Editing the passage invalidates offsets; drop phrases only if text changed.
      if (action.value === w.thoughtText) return state;
      return {
        ...state,
        worksheet: touch({ ...w, thoughtText: action.value, phrases: [] }),
        phraseUndoStack: [],
      };
    }

    case "addPhrase": {
      const range = { start: action.start, end: action.end };
      if (
        range.start < 0 ||
        range.end > w.thoughtText.length ||
        range.start >= range.end ||
        overlapsExisting(w.phrases, range)
      ) {
        return state;
      }
      const phrases = [...w.phrases, makePhrase(w, range.start, range.end)].sort(
        (a, b) => a.start - b.start
      );
      return {
        ...state,
        worksheet: touch({ ...w, phrases }),
        phraseUndoStack: [...state.phraseUndoStack, w.phrases],
      };
    }

    case "removePhrase": {
      const phrases = w.phrases.filter((p) => p.id !== action.id);
      if (phrases.length === w.phrases.length) return state;
      return {
        ...state,
        worksheet: touch({ ...w, phrases }),
        phraseUndoStack: [...state.phraseUndoStack, w.phrases],
      };
    }

    case "undoPhrase": {
      const stack = [...state.phraseUndoStack];
      const previous = stack.pop();
      if (!previous) return state;
      return {
        ...state,
        worksheet: touch({ ...w, phrases: previous }),
        phraseUndoStack: stack,
      };
    }

    case "setAutoPhrases": {
      const phrases = action.phrases
        .filter(
          (r) => r.start >= 0 && r.end <= w.thoughtText.length && r.start < r.end
        )
        .map((r) => makePhrase(w, r.start, r.end, true))
        .sort((a, b) => a.start - b.start);
      return {
        ...state,
        worksheet: touch({ ...w, phrases }),
        phraseUndoStack: [...state.phraseUndoStack, w.phrases],
      };
    }

    case "toggleDistortion": {
      const phrases = w.phrases.map((p) => {
        if (p.id !== action.phraseId) return p;
        const has = p.distortionIds.includes(action.distortionId);
        return {
          ...p,
          distortionIds: has
            ? p.distortionIds.filter((d) => d !== action.distortionId)
            : [...p.distortionIds, action.distortionId],
        };
      });
      return { ...state, worksheet: touch({ ...w, phrases }) };
    }

    case "setRational":
      return { ...state, worksheet: touch({ ...w, rationalThought: action.value }) };

    case "setReviewMode":
      return { ...state, worksheet: touch({ ...w, reviewModeLastUsed: action.mode }) };
  }
}
