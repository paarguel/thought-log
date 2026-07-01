"use client";

import { useMemo, useState } from "react";
import { TopBar } from "@/components/app/top-bar";
import { createEmptyThoughtLogDraft, finalizeDraft, type ThoughtLogDraft } from "@/lib/thought-log/types";
import { SituationStep } from "./situation-step";
import { FeelingsStep } from "./feelings-step";
import { ThoughtPassageStep } from "./thought-passage-step";
import { PhraseExtractionStep } from "./phrase-extraction-step";
import { LabelingStep } from "./labeling-step";
import { ReviewStep } from "./review-step";
import { RationalThoughtStep } from "./rational-thought-step";
import { SaveOptions } from "./save-options";
import { StepFooter } from "./step-footer";
import { printEntryWorksheet } from "@/lib/local-store/export";

const steps = ["situation", "feelings", "thoughts", "extract", "label", "review", "rational", "save"] as const;

export function ThoughtLogApp() {
  const [draft, setDraft] = useState<ThoughtLogDraft>(() => createEmptyThoughtLogDraft());
  const [step, setStep] = useState(0);
  const entry = useMemo(() => finalizeDraft(draft), [draft]);
  const current = steps[step];

  const update = (patch: Partial<ThoughtLogDraft>) => setDraft((currentDraft) => ({ ...currentDraft, ...patch }));
  const reset = () => {
    if (window.confirm("Start a new worksheet and clear the current draft?")) {
      setDraft(createEmptyThoughtLogDraft());
      setStep(0);
    }
  };

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
              <LabelingStep thoughts={draft.extractedThoughts} assignments={draft.labelAssignments} onChange={(labelAssignments) => update({ labelAssignments })} />
            )}
            {current === "review" && <ReviewStep draft={draft} onModeChange={(reviewModeLastUsed) => update({ reviewModeLastUsed })} />}
            {current === "rational" && <RationalThoughtStep draft={draft} onChange={(rationalThought) => update({ rationalThought })} />}
            {current === "save" && <SaveOptions entry={entry} />}
          </div>
          <StepFooter
            current={step}
            total={steps.length}
            canBack={step > 0}
            canContinue={true}
            primaryLabel={step === steps.length - 1 ? "Done" : "Continue"}
            onBack={() => setStep(Math.max(0, step - 1))}
            onContinue={() => {
              if (step < steps.length - 1) {
                setStep(step + 1);
              }
            }}
          />
        </div>
      </div>
    </main>
  );
}
