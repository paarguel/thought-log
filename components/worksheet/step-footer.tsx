"use client";

type StepFooterProps = {
  current: number;
  total: number;
  canBack: boolean;
  canContinue: boolean;
  primaryLabel: string;
  hint?: string;
  onBack: () => void;
  onContinue: () => void;
};

export function StepFooter({ current, total, canBack, canContinue, primaryLabel, hint, onBack, onContinue }: StepFooterProps) {
  return (
    <footer className="step-footer">
      <div className="progress-line" aria-label={`Step ${current + 1} of ${total}`}>
        <span style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      {hint && <p className="footer-hint">{hint}</p>}
      <button className="secondary-button" type="button" onClick={onBack} disabled={!canBack}>
        Back
      </button>
      <button className="primary-button cta-glow" type="button" onClick={onContinue} disabled={!canContinue}>
        {primaryLabel}
      </button>
    </footer>
  );
}
