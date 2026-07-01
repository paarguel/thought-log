"use client";

const feelings = ["Anxious", "Insecure", "Sad", "Angry", "Ashamed", "Lonely", "Overwhelmed", "Embarrassed"];

type FeelingsStepProps = {
  selected: string[];
  onChange: (feelings: string[]) => void;
};

export function FeelingsStep({ selected, onChange }: FeelingsStepProps) {
  const toggle = (feeling: string) => {
    onChange(selected.includes(feeling) ? selected.filter((item) => item !== feeling) : [...selected, feeling]);
  };

  return (
    <section>
      <p className="step-kicker">Feelings</p>
      <h1 className="step-title">What did it bring up?</h1>
      <div className="feeling-grid" aria-label="Feeling choices">
        {feelings.map((feeling) => (
          <button
            key={feeling}
            type="button"
            className="chip-button"
            aria-pressed={selected.includes(feeling)}
            onClick={() => toggle(feeling)}
          >
            {feeling}
          </button>
        ))}
      </div>
      <label className="field-label" htmlFor="custom-feeling">
        Add your own
      </label>
      <input
        id="custom-feeling"
        className="text-input"
        placeholder="Type a feeling and press Enter"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            const value = event.currentTarget.value.trim();
            if (value && !selected.includes(value)) {
              onChange([...selected, value]);
              event.currentTarget.value = "";
            }
          }
        }}
      />
    </section>
  );
}
