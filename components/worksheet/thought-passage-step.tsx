"use client";

type ThoughtPassageStepProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ThoughtPassageStep({ value, onChange }: ThoughtPassageStepProps) {
  return (
    <section>
      <p className="step-kicker">Stream</p>
      <h1 className="step-title">Write the whole thought loop.</h1>
      <label className="field-label" htmlFor="thought-passage">
        Thought passage
      </label>
      <textarea
        id="thought-passage"
        className="text-area cta-glow"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Let it come out as one passage. You will split it later."
      />
    </section>
  );
}
