"use client";

import type { ReactNode } from "react";
import { GhostButton, PrimaryButton } from "@/components/ui/buttons";
import { STEP_ORDER, type StepId } from "@/lib/thought-log/types";

/**
 * `step` places the header in the worksheet's own order. A flow with a
 * different set of steps (the check-in) passes `position` instead.
 */
export function StepHeader({
  step,
  position,
  title,
  hint,
}: {
  step?: StepId;
  position?: { index: number; total: number };
  title: string;
  hint?: string;
}) {
  const index = position ? position.index : step ? STEP_ORDER.indexOf(step) : 0;
  const total = position ? position.total : STEP_ORDER.length;
  return (
    <div className="mb-5">
      <div className="mb-4 flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-ink/60" : "bg-line"
            }`}
          />
        ))}
      </div>
      <p className="sr-only">
        Step {index + 1} of {total}
      </p>
      <h1 className="font-display text-[1.625rem] leading-snug text-ink">{title}</h1>
      {hint ? <p className="step-hint mt-1.5 text-[0.9375rem] text-ink-soft">{hint}</p> : null}
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
    <div className="step-footer">
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
