"use client";

/**
 * The emotion check-in: four short questions and a reflection.
 *
 * Rules this file keeps, on purpose:
 *  - Every question can be skipped. Continue is never disabled, and an empty
 *    check-in saves like any other.
 *  - Nothing is scored, interpreted or checked for accuracy. The reflection
 *    only repeats what was picked and typed.
 *  - No prompt asks for more, and nothing invites a second pass.
 */

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  checkInHasContent,
  EMOTION_GROUPS,
  KNOWN_EMOTIONS,
  MAX_EMOTIONS,
  NEED_SUGGESTIONS,
  newCheckIn,
  SENSATION_SUGGESTIONS,
  toggleEmotion,
  toggleItem,
  type EmotionCheckIn,
} from "@/lib/check-in/types";
import { reflectionLines, reflectionText } from "@/lib/check-in/reflection";
import { copyText } from "@/lib/check-in/copy";
import {
  clearCheckInDraft,
  loadCheckInDraft,
  saveCheckInDraft,
  saveLocalEntry,
} from "@/lib/local-store/indexed-db";
import { dataNoticeAcknowledged } from "@/components/app/data-notice";
import { Chip, GhostButton, PrimaryButton, SecondaryButton } from "@/components/ui/buttons";
import { StepFooter, StepHeader } from "@/components/worksheet/step-chrome";

type Step = "happened" | "feeling" | "body" | "need" | "reflection";
const STEPS: Step[] = ["happened", "feeling", "body", "need", "reflection"];

/** A draft older than this is a different moment; it is dropped, not resumed. */
const DRAFT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export const CLOSING_REMINDER =
  "Noticing is enough. You don't need to solve what you're feeling right now.";

function Reflection({ checkIn }: { checkIn: EmotionCheckIn }) {
  return (
    <div className="rounded-xl border border-line bg-paper-raised px-4 py-4">
      {reflectionLines(checkIn).map((line, i) => (
        <p key={i} className="font-display text-[1.125rem] leading-relaxed text-ink [&+p]:mt-1.5">
          {line}
        </p>
      ))}
    </div>
  );
}

export { Reflection as CheckInReflection };

function Intensity({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
}) {
  const set = value !== undefined;
  return (
    <div className="rounded-xl border border-line bg-paper-raised px-4 py-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="check-in-intensity" className="text-[0.9375rem] text-ink">
          How strong does this feel?
        </label>
        <span className="shrink-0 text-[0.875rem] text-ink-faint">
          {set ? `${value} of 10` : "Optional"}
        </span>
      </div>
      <input
        id="check-in-intensity"
        type="range"
        min={1}
        max={10}
        step={1}
        value={value ?? 5}
        aria-valuetext={set ? `${value} of 10` : "Not set"}
        onChange={(e) => onChange(Number(e.target.value))}
        // A tap on the resting position changes nothing, so no change event
        // fires; treat the tap itself as choosing that value.
        onClick={(e) => !set && onChange(Number(e.currentTarget.value))}
        className={`intensity-range mt-3 w-full ${set ? "" : "opacity-45"}`}
      />
      <div className="mt-1 flex items-center justify-between text-[0.8125rem] text-ink-faint">
        <span>Barely there</span>
        {set && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="min-h-9 px-2 underline underline-offset-4"
          >
            Clear
          </button>
        )}
        <span>Very strong</span>
      </div>
    </div>
  );
}

export function CheckInFlow({
  editing,
  kindSwitch,
  seedSituation,
  onSeedUsed,
  onLeave,
  onDone,
  onSaved,
  onCancel,
}: {
  /** A saved check-in being reopened. Saving writes back to the same entry. */
  editing?: EmotionCheckIn;
  /** Render the thought/feeling switch above the first question. */
  kindSwitch?: (leave: () => void) => ReactNode;
  /** Situation text carried over from the thought flow. */
  seedSituation?: string;
  onSeedUsed?: () => void;
  /** Called when the user switches away; gets text worth carrying over. */
  onLeave?: (carrySituation: string) => void;
  /** After a new check-in is saved and the user is finished with it. */
  onDone?: () => void;
  /** After an edited check-in is saved. */
  onSaved?: (checkIn: EmotionCheckIn) => void;
  onCancel?: () => void;
}) {
  const [checkIn, setCheckIn] = useState<EmotionCheckIn>(() => editing ?? newCheckIn());
  const [step, setStep] = useState<Step>(editing ? "reflection" : "happened");
  const [ready, setReady] = useState(Boolean(editing));
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [copied, setCopied] = useState<"no" | "yes" | "failed">("no");
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [custom, setCustom] = useState("");

  // Pick up a recent unfinished check-in, else start from the carried text.
  useEffect(() => {
    if (editing) return;
    let cancelled = false;
    const start = (draft?: EmotionCheckIn) => {
      if (cancelled) return;
      const fresh =
        draft &&
        checkInHasContent(draft) &&
        Date.now() - new Date(draft.updatedAt).getTime() < DRAFT_MAX_AGE_MS;
      if (fresh) {
        setCheckIn(draft);
      } else {
        if (draft) clearCheckInDraft().catch(() => {});
        if (seedSituation) {
          setCheckIn((c) => ({ ...c, situation: seedSituation }));
          onSeedUsed?.();
        }
      }
      setReady(true);
    };
    loadCheckInDraft()
      .then(start)
      .catch(() => start());
    return () => {
      cancelled = true;
    };
    // Mount-only: the seed is a one-time handoff.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave the draft while the user works. Edits to a saved entry are not
  // drafts: they are written only when the user saves.
  useEffect(() => {
    if (editing || !ready || status === "saved") return;
    if (!checkInHasContent(checkIn)) return;
    const t = setTimeout(() => {
      saveCheckInDraft(checkIn).catch(() => {});
    }, 400);
    return () => clearTimeout(t);
  }, [checkIn, editing, ready, status]);

  // A patch may be computed from the latest state, so two quick taps on
  // different chips both land.
  const update = (
    patch: Partial<EmotionCheckIn> | ((c: EmotionCheckIn) => Partial<EmotionCheckIn>)
  ) => {
    setCopied("no");
    setCheckIn((c) => ({
      ...c,
      ...(typeof patch === "function" ? patch(c) : patch),
      updatedAt: new Date().toISOString(),
    }));
  };

  const go = (to: Step) => setStep(to);
  const next = () => go(STEPS[Math.min(STEPS.indexOf(step) + 1, STEPS.length - 1)]);
  const back = () => go(STEPS[Math.max(STEPS.indexOf(step) - 1, 0)]);
  const position = { index: STEPS.indexOf(step), total: STEPS.length };

  const leave = () => {
    const onlySituation =
      checkIn.emotions.length === 0 &&
      checkIn.intensity === undefined &&
      checkIn.sensations.length === 0 &&
      !checkIn.sensationText.trim() &&
      checkIn.needs.length === 0 &&
      !checkIn.needText.trim();
    if (checkInHasContent(checkIn)) saveCheckInDraft(checkIn).catch(() => {});
    onLeave?.(onlySituation ? checkIn.situation : "");
  };

  const save = async () => {
    setStatus("saving");
    try {
      const saved = { ...checkIn, updatedAt: new Date().toISOString() };
      await saveLocalEntry(saved);
      if (editing) {
        onSaved?.(saved);
        return;
      }
      await clearCheckInDraft();
      setStatus("saved");
    } catch {
      setStatus("error");
    }
  };

  const discard = async () => {
    await clearCheckInDraft().catch(() => {});
    setCheckIn(newCheckIn());
    setConfirmDiscard(false);
    setStep("happened");
    onDone?.();
  };

  const copy = async () => {
    setCopied((await copyText(reflectionText(checkIn))) ? "yes" : "failed");
  };

  if (!ready) return <div className="flex-1" aria-busy="true" />;

  if (status === "saved") {
    return (
      <section className="step-enter flex flex-1 flex-col" aria-label="Saved">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-[1.5rem] text-ink">Saved.</p>
          <p className="mt-2 max-w-70 text-[0.9375rem] text-ink-soft">{CLOSING_REMINDER}</p>
        </div>
        <div className="flex flex-col gap-2 pb-2">
          <PrimaryButton
            onClick={() => {
              setCheckIn(newCheckIn());
              setStep("happened");
              setStatus("idle");
              onDone?.();
            }}
          >
            Done
          </PrimaryButton>
          <Link
            href="/history"
            className="min-h-11 w-full rounded-full py-2.5 text-center text-[0.9375rem] text-ink-soft"
          >
            View history
          </Link>
        </div>
      </section>
    );
  }

  if (step === "happened") {
    return (
      <section className="step-enter flex flex-1 flex-col" aria-label="What happened">
        {kindSwitch?.(leave)}
        <StepHeader
          position={position}
          title="What happened?"
          hint="Just the situation. You don't need to explain why."
        />
        <textarea
          className="write-surface min-h-20 shrink grow-0 basis-36"
          value={checkIn.situation}
          onChange={(e) => update({ situation: e.target.value })}
          placeholder="What's happening right now? Just describe the situation, without needing to explain why."
          aria-label="Describe what happened"
          autoFocus={dataNoticeAcknowledged()}
        />
        <StepFooter
          onNext={next}
          nextLabel={checkIn.situation.trim() ? "Continue" : "Skip"}
          onBack={editing ? () => go("reflection") : undefined}
        />
      </section>
    );
  }

  if (step === "feeling") {
    const selected = new Set(checkIn.emotions.map((e) => e.toLowerCase()));
    const full = checkIn.emotions.length >= MAX_EMOTIONS;
    const own = checkIn.emotions.filter((e) => !KNOWN_EMOTIONS.has(e.toLowerCase()));
    const addCustom = () => {
      const name = custom.trim();
      if (!name || full || selected.has(name.toLowerCase())) return;
      update((c) => ({ emotions: toggleEmotion(c.emotions, name) }));
      setCustom("");
    };
    return (
      <section className="step-enter flex flex-1 flex-col" aria-label="What I might be feeling">
        <StepHeader
          position={position}
          title="What might I be feeling?"
          hint="These are guesses, not a test. You don't have to find the exact word."
        />
        <div className="flex flex-col gap-4">
          <p className="text-[0.875rem] text-ink-faint" role="status">
            {full ? "That's three. Tap one to take it off." : "Pick up to three, or none."}
          </p>
          {EMOTION_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1.5 text-[0.8125rem] text-ink-faint">{group.label}</p>
              <div className="flex flex-wrap gap-2">
                {group.words.map((word) => {
                  const on = selected.has(word.toLowerCase());
                  return (
                    <Chip
                      key={word}
                      selected={on}
                      muted={full && !on}
                      aria-disabled={full && !on}
                      onClick={() => update((c) => ({ emotions: toggleEmotion(c.emotions, word) }))}
                    >
                      {word}
                    </Chip>
                  );
                })}
              </div>
            </div>
          ))}
          {own.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {own.map((word) => (
                <Chip
                  key={word}
                  selected
                  onClick={() => update((c) => ({ emotions: toggleEmotion(c.emotions, word) }))}
                >
                  {word}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              className="write-surface min-h-11 flex-1 !py-2"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCustom()}
              placeholder="Another word…"
              aria-label="Add your own feeling word"
            />
            <button
              type="button"
              onClick={addCustom}
              disabled={!custom.trim() || full}
              className="min-h-11 rounded-full border border-line-strong px-4 text-[0.9375rem] text-ink-soft disabled:opacity-35"
            >
              Add
            </button>
          </div>
          <Intensity value={checkIn.intensity} onChange={(intensity) => update({ intensity })} />
        </div>
        <StepFooter
          onNext={next}
          nextLabel={checkIn.emotions.length > 0 ? "Continue" : "Skip"}
          onBack={back}
        />
      </section>
    );
  }

  if (step === "body" || step === "need") {
    const body = step === "body";
    const picked = body ? checkIn.sensations : checkIn.needs;
    const text = body ? checkIn.sensationText : checkIn.needText;
    const suggestions = body ? SENSATION_SUGGESTIONS : NEED_SUGGESTIONS;
    const togglePicked = (item: string) =>
      update((c) =>
        body
          ? { sensations: toggleItem(c.sensations, item) }
          : { needs: toggleItem(c.needs, item) }
      );
    const setText = (value: string) =>
      update(body ? { sensationText: value } : { needText: value });
    return (
      <section
        className="step-enter flex flex-1 flex-col"
        aria-label={body ? "What I notice in my body or behavior" : "What I might need"}
      >
        <StepHeader
          position={position}
          title={body ? "What do I notice in my body or behavior?" : "What might I need?"}
          hint={
            body
              ? "Tap anything that's there, or write it your own way."
              : "Possibilities, not conclusions. Not knowing is fine too."
          }
        />
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <Chip
              key={item}
              selected={picked.includes(item)}
              onClick={() => togglePicked(item)}
            >
              {item}
            </Chip>
          ))}
        </div>
        <textarea
          className="write-surface mt-4 min-h-24 shrink-0"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            body
              ? "Tight shoulders, heavy chest, restlessness, fatigue, wanting to withdraw, crying, feeling calm, or nothing noticeable."
              : "Rest, connection, support, space, understanding, affection, encouragement, or maybe I'm not sure."
          }
          aria-label={body ? "In your own words, what you notice" : "In your own words, what you might need"}
        />
        <StepFooter
          onNext={next}
          nextLabel={picked.length > 0 || text.trim() ? "Continue" : "Skip"}
          onBack={back}
        />
      </section>
    );
  }

  // Reflection
  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Reflection">
      <StepHeader position={position} title="Noticing is enough." hint="You don't need to solve what you're feeling right now." />
      <Reflection checkIn={checkIn} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SecondaryButton onClick={copy}>Copy reflection</SecondaryButton>
        <SecondaryButton onClick={() => go("happened")}>Edit check-in</SecondaryButton>
        <span role="status" className="text-[0.875rem] text-ink-faint">
          {copied === "yes" ? "Copied." : copied === "failed" ? "Couldn't copy on this device." : ""}
        </span>
      </div>

      {status === "error" && (
        <p role="alert" className="mt-3 text-[0.875rem] text-danger">
          Couldn&apos;t save on this device. Your check-in is still here.
        </p>
      )}

      <div className="step-footer">
        {confirmDiscard ? (
          <div className="rounded-xl border border-line bg-paper-raised p-4 text-left">
            <p className="text-[0.9375rem] text-ink">
              Discard this check-in? It can&apos;t be recovered.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={discard}
                className="min-h-11 rounded-full border border-danger px-5 text-[0.9375rem] text-danger"
              >
                Discard it
              </button>
              <GhostButton onClick={() => setConfirmDiscard(false)}>Keep it</GhostButton>
            </div>
          </div>
        ) : (
          <>
            <PrimaryButton onClick={save} disabled={status === "saving"}>
              {editing ? "Save changes" : "Save to Thought Record"}
            </PrimaryButton>
            <div className="mt-1 flex justify-center gap-4">
              {editing ? (
                <GhostButton onClick={onCancel}>Cancel</GhostButton>
              ) : (
                <>
                  <GhostButton onClick={back}>Back</GhostButton>
                  <GhostButton onClick={() => setConfirmDiscard(true)} className="!text-danger/70">
                    Discard
                  </GhostButton>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
