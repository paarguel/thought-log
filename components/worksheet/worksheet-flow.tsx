"use client";

/**
 * The worksheet orchestrator. Owns flow state, autosaves the draft to
 * IndexedDB as the user works (never the network), and restores an
 * unfinished draft on return.
 */

import { useEffect, useReducer, useState } from "react";
import { flowReducer, initialFlowState } from "@/lib/thought-log/reducer";
import {
  worksheetHasContent,
  type StepId,
  type Worksheet,
  STEP_ORDER,
} from "@/lib/thought-log/types";
import { loadDraft, saveDraft, clearDraft } from "@/lib/local-store/indexed-db";
import { GhostButton, PrimaryButton } from "@/components/ui/buttons";
import { SituationStep, FeelingsStep, ThoughtsStep, RationalStep } from "./basic-steps";
import { CircleStep } from "./circle-step";
import { LabelStep } from "./label-step";
import { ReviewStep } from "./review-step";
import { SaveStep } from "./save-step";

const STEP_STORAGE_KEY = "thought-log:draft-step";

function persistStep(step: StepId) {
  try {
    localStorage.setItem(STEP_STORAGE_KEY, step);
  } catch {
    // Private-mode storage failures are fine; worksheet still works in memory.
  }
}

function restoreStep(): StepId {
  try {
    const raw = localStorage.getItem(STEP_STORAGE_KEY);
    if (raw && (STEP_ORDER as string[]).includes(raw)) return raw as StepId;
  } catch {
    // ignore
  }
  return "situation";
}

type Phase =
  | { kind: "loading" }
  | { kind: "resume-prompt"; draft: Worksheet }
  | { kind: "ready" };

export function WorksheetFlow() {
  const [state, dispatch] = useReducer(flowReducer, undefined, initialFlowState);
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });

  // Restore an unfinished draft once on mount.
  useEffect(() => {
    let cancelled = false;
    loadDraft()
      .then((draft) => {
        if (cancelled) return;
        if (draft && worksheetHasContent(draft)) {
          setPhase({ kind: "resume-prompt", draft });
        } else {
          setPhase({ kind: "ready" });
        }
      })
      .catch(() => setPhase({ kind: "ready" }));
    return () => {
      cancelled = true;
    };
  }, []);

  // Autosave the draft (debounced) while the user works.
  useEffect(() => {
    if (phase.kind !== "ready") return;
    if (!worksheetHasContent(state.worksheet)) return;
    const t = setTimeout(() => {
      saveDraft(state.worksheet).catch(() => {});
      persistStep(state.step);
    }, 400);
    return () => clearTimeout(t);
  }, [state.worksheet, state.step, phase]);

  if (phase.kind === "loading") {
    return <div className="flex-1" aria-busy="true" />;
  }

  if (phase.kind === "resume-prompt") {
    const draft = phase.draft;
    return (
      <div className="step-enter flex flex-1 flex-col justify-center px-1">
        <p className="font-display text-[1.5rem] leading-snug text-ink">
          You have an unfinished entry.
        </p>
        <p className="mt-2 text-[0.9375rem] text-ink-soft">
          {draft.situation
            ? `“${draft.situation.slice(0, 80)}${draft.situation.length > 80 ? "…" : ""}”`
            : "Saved on this device."}
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <PrimaryButton
            onClick={() => {
              dispatch({ type: "load", worksheet: draft, step: restoreStep() });
              setPhase({ kind: "ready" });
            }}
          >
            Continue where I left off
          </PrimaryButton>
          <div className="text-center">
            <GhostButton
              onClick={async () => {
                await clearDraft();
                dispatch({ type: "reset" });
                setPhase({ kind: "ready" });
              }}
            >
              Start fresh
            </GhostButton>
          </div>
        </div>
      </div>
    );
  }

  switch (state.step) {
    case "situation":
      return <SituationStep state={state} dispatch={dispatch} />;
    case "feelings":
      return <FeelingsStep state={state} dispatch={dispatch} />;
    case "thoughts":
      return <ThoughtsStep state={state} dispatch={dispatch} />;
    case "circle":
      return <CircleStep state={state} dispatch={dispatch} />;
    case "label":
      return <LabelStep state={state} dispatch={dispatch} />;
    case "review":
      return <ReviewStep state={state} dispatch={dispatch} />;
    case "rational":
      return <RationalStep state={state} dispatch={dispatch} />;
    case "save":
      return <SaveStep state={state} dispatch={dispatch} />;
  }
}
