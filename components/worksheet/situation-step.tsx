"use client";

type SituationStepProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SituationStep({ value, onChange }: SituationStepProps) {
  return (
    <section>
      <p className="step-kicker">Start here</p>
      <h1 className="step-title">What happened?</h1>
      <label className="field-label" htmlFor="situation">
        Situation
      </label>
      <textarea
        id="situation"
        className="text-area cta-glow"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Write the moment as plainly as you can."
      />
    </section>
  );
}
