"use client";

/**
 * The one choice on the first screen: is this a thought to work through or
 * a feeling to notice? It sits above the first question and nowhere else, so
 * a thought is still zero taps away and a feeling is one.
 */

export type EntryKind = "thought" | "feeling";

const KINDS: Array<{ id: EntryKind; label: string }> = [
  { id: "thought", label: "A thought" },
  { id: "feeling", label: "A feeling" },
];

export function EntryKindSwitch({
  kind,
  onChange,
}: {
  kind: EntryKind;
  onChange: (kind: EntryKind) => void;
}) {
  return (
    <div
      role="group"
      aria-label="What are you writing down?"
      className="mb-4 flex rounded-full border border-line bg-paper-raised p-1"
    >
      {KINDS.map((k) => (
        <button
          key={k.id}
          type="button"
          aria-pressed={kind === k.id}
          onClick={() => kind !== k.id && onChange(k.id)}
          className={`min-h-10 flex-1 rounded-full text-[0.9375rem] transition-colors ${
            kind === k.id ? "bg-ink text-paper" : "text-ink-soft"
          }`}
        >
          {k.label}
        </button>
      ))}
    </div>
  );
}
