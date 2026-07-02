"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/top-bar";
import { createEmptyThoughtLogDraft, finalizeDraft, type ThoughtLogDraft } from "@/lib/thought-log/types";
import { SituationStep } from "./situation-step";
import { FeelingsStep } from "./feelings-step";
import { ThoughtPassageStep } from "./thought-passage-step";
import { PhraseExtractionStep } from "./phrase-extraction-step";
import { LabelingStep } from "./labeling-step";
import { RationalThoughtStep } from "./rational-thought-step";
import { SaveOptions } from "./save-options";
import { StepFooter } from "./step-footer";
import { printEntryWorksheet } from "@/lib/local-store/export";

const steps = ["situation", "feelings", "thoughts", "extract", "label", "rational", "save"] as const;

export function ThoughtLogApp() {
  const [draft, setDraft] = useState<ThoughtLogDraft>(() => createEmptyThoughtLogDraft());
  const [step, setStep] = useState(0);
  const [labelIndex, setLabelIndex] = useState(0);
  const entry = useMemo(() => finalizeDraft(draft), [draft]);
  const current = steps[step];

  const update = (patch: Partial<ThoughtLogDraft>) => setDraft((currentDraft) => ({ ...currentDraft, ...patch }));
  const reset = () => {
    if (window.confirm("Start a new worksheet and clear the current draft?")) {
      setDraft(createEmptyThoughtLogDraft());
      setStep(0);
      setLabelIndex(0);
    }
  };

  const thoughtCount = draft.extractedThoughts.length;
  const safeLabelIndex = Math.min(labelIndex, Math.max(0, thoughtCount - 1));
  const onLastLabel = safeLabelIndex >= thoughtCount - 1;
  const cyclingLabels = current === "label" && thoughtCount > 1 && !onLastLabel;
  const isLastStep = step === steps.length - 1;

  const hasRationalResponse =
    draft.rationalThought.trim().length > 0 || draft.rationalResponses.some((response) => response.text.trim().length > 0);

  const gate: Record<(typeof steps)[number], { ok: boolean; hint?: string }> = {
    situation: { ok: draft.situation.trim().length > 0, hint: "Describe what happened to continue." },
    feelings: { ok: draft.feelings.length > 0, hint: "Pick at least one feeling to continue." },
    thoughts: { ok: draft.thoughtText.trim().length > 0, hint: "Write the thought passage to continue." },
    extract: { ok: thoughtCount > 0, hint: "Mark at least one thought to continue." },
    label: { ok: true },
    rational: { ok: hasRationalResponse, hint: "Write your rational response to continue." },
    save: { ok: true },
  };

  const canContinue = gate[current].ok;

  const goForward = () => {
    if (cyclingLabels) {
      setLabelIndex(safeLabelIndex + 1);
      return;
    }
    if (step < steps.length - 1) {
      if (current === "extract") {
        setLabelIndex(0);
      }
      setStep(step + 1);
    }
  };

  const goBack = () => {
    if (current === "label" && safeLabelIndex > 0) {
      setLabelIndex(safeLabelIndex - 1);
      return;
    }
    setStep(Math.max(0, step - 1));
  };

  const canBack = step > 0 || (current === "label" && safeLabelIndex > 0);

  const primaryLabel = isLastStep ? "Done" : cyclingLabels ? `Next thought (${safeLabelIndex + 1}/${thoughtCount})` : "Continue";

  return (
    <main className="app-shell">
      <div className="phone-frame">
        <TopBar onExport={() => printEntryWorksheet(entry)} onReset={reset} />
        <div className="worksheet">
          <div className="step-area">
            {current === "situation" && <SituationStep value={draft.situation} onChange={(situation) => update({ situation })} />}
            {current === "feelings" && <FeelingsStep selected={draft.feelings} onChange={(feelings) => update({ feelings })} />}
            {current === "thoughts" && <ThoughtPassageStep value={draft.thoughtText} onChange={(thoughtText) => update({ thoughtText })} />}
            {current === "extract" && (
              <PhraseExtractionStep
                thoughtText={draft.thoughtText}
                thoughts={draft.extractedThoughts}
                onChange={(extractedThoughts) => update({ extractedThoughts })}
              />
            )}
            {current === "label" && (
              <LabelingStep
                thoughts={draft.extractedThoughts}
                assignments={draft.labelAssignments}
                index={safeLabelIndex}
                onChange={(labelAssignments) => update({ labelAssignments })}
              />
            )}
            {current === "rational" && (
              <RationalThoughtStep
                draft={draft}
                onModeChange={(reviewModeLastUsed) => update({ reviewModeLastUsed })}
                onFullChange={(rationalThought) => update({ rationalThought })}
                onResponsesChange={(rationalResponses) => update({ rationalResponses })}
              />
            )}
            {current === "save" && <SaveOptions entry={entry} />}
          </div>
          <StepFooter
            current={step}
            total={steps.length}
            canBack={canBack}
            canContinue={canContinue}
            primaryLabel={primaryLabel}
            hint={!canContinue ? gate[current].hint : undefined}
            onBack={goBack}
            onContinue={goForward}
          />
        </div>
      </div>
    </main>
  );
}
