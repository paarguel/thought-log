"use client";

import type { ReactNode } from "react";
import { GhostButton, PrimaryButton } from "@/components/ui/buttons";
import { STEP_ORDER, type StepId } from "@/lib/thought-log/types";

export function StepHeader({
  step,
  title,
  hint,
}: {
  step: StepId;
  title: string;
  hint?: string;
}) {
  const index = STEP_ORDER.indexOf(step);
  return (
    <div className="mb-5">
      <div className="mb-4 flex gap-1.5" aria-hidden="true">
        {STEP_ORDER.map((s, i) => (
          <span
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-ink/60" : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="sr-only">
        Step {index + 1} of {STEP_ORDER.length}
      </p>
      <h1 className="font-display text-[1.625rem] leading-snug text-ink">{title}</h1>
      {hint ? <p className="mt-1.5 text-[0.9375rem] text-ink-soft">{hint}</p> : null}
    </div>
  );
}

export function StepFooter({
  onNext,
  onBack,
  nextLabel = "Continue",
  nextDisabled = false,
  children,
}: {
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  children?: ReactNode;
}) {
  return (
    <div className="mt-auto pt-6 pb-2">
      {children}
      {onNext ? (
        <PrimaryButton onClick={onNext} disabled={nextDisabled}>
          {nextLabel}
        </PrimaryButton>
      ) : null}
      {onBack ? (
        <div className="mt-1 text-center">
          <GhostButton onClick={onBack}>Back</GhostButton>
        </div>
      ) : null}
    </div>
  );
}
