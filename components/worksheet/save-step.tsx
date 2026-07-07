"use client";

/**
 * End of the worksheet: the user decides where this entry lives (R11).
 * Save on device, export a file, or discard. Everything stays on the
 * device — this app has no server and no accounts (R12).
 */

import { useState } from "react";
import Link from "next/link";
import type { FlowAction, FlowState } from "@/lib/thought-log/reducer";
import { saveLocalEntry, clearDraft } from "@/lib/local-store/indexed-db";
import {
  downloadFile,
  exportFilename,
  worksheetToJson,
  worksheetToPrintableHtml,
} from "@/lib/local-store/export";
import { GhostButton } from "@/components/ui/buttons";
import { StepHeader } from "./step-chrome";

type DoneState =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "done"; message: string }
  | { kind: "error"; message: string };

function OptionButton({
  title,
  detail,
  onClick,
  disabled,
}: {
  title: string;
  detail: string;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-xl border border-line bg-paper-raised px-4 py-3.5 text-left transition-colors active:bg-paper-sunken disabled:opacity-40"
    >
      <span className="block text-[1rem] font-medium text-ink">{title}</span>
      <span className="mt-0.5 block text-[0.875rem] text-ink-soft">{detail}</span>
    </button>
  );
}

export function SaveStep({
  state,
  dispatch,
}: {
  state: FlowState;
  dispatch: React.Dispatch<FlowAction>;
}) {
  const w = state.worksheet;
  const [status, setStatus] = useState<DoneState>({ kind: "idle" });
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const finish = async (message: string) => {
    await clearDraft();
    setStatus({ kind: "done", message });
  };

  const saveDevice = async () => {
    setStatus({ kind: "saving" });
    try {
      await saveLocalEntry(w);
      await finish("Saved on this device. Find it any time in History.");
    } catch {
      setStatus({ kind: "error", message: "Couldn't save on this device." });
    }
  };

  const exportPrintable = () => {
    downloadFile(exportFilename(w, "html"), worksheetToPrintableHtml(w), "text/html");
  };

  const exportJson = () => {
    downloadFile(exportFilename(w, "json"), worksheetToJson(w), "application/json");
  };

  const discard = async () => {
    await clearDraft();
    dispatch({ type: "reset" });
  };

  if (status.kind === "done") {
    return (
      <section className="step-enter flex flex-1 flex-col" aria-label="Saved">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="font-display text-[1.5rem] text-ink">Done.</p>
          <p className="mt-2 max-w-65 text-[0.9375rem] text-ink-soft">{status.message}</p>
        </div>
        <div className="flex flex-col gap-2 pb-2">
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="min-h-13 w-full rounded-full bg-ink text-[1.0625rem] font-medium text-paper"
          >
            Start a new entry
          </button>
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

  return (
    <section className="step-enter flex flex-1 flex-col" aria-label="Save your entry">
      <StepHeader
        step="save"
        title="Where should this live?"
        hint="Your entry is yours. Nothing is stored anywhere until you choose."
      />

      <div className="flex flex-col gap-2.5">
        <OptionButton
          title="Save on this device"
          detail="Stays on this device only. Never uploaded — and gone if the app is removed."
          onClick={saveDevice}
          disabled={status.kind === "saving"}
        />
        <OptionButton
          title="Export printable copy"
          detail="A clean file you can keep, print, or share with a therapist."
          onClick={exportPrintable}
        />
        <OptionButton
          title="Export data file (JSON)"
          detail="Your raw entry, portable and yours. The safest way to keep it."
          onClick={exportJson}
        />
      </div>

      {status.kind === "error" && (
        <p role="alert" className="mt-3 text-[0.875rem] text-danger">
          {status.message}
        </p>
      )}

      <div className="mt-auto pt-6 pb-2 text-center">
        {confirmDiscard ? (
          <div className="rounded-xl border border-line bg-paper-raised p-4 text-left">
            <p className="text-[0.9375rem] text-ink">
              Discard this entry? It can&apos;t be recovered.
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
          <div className="flex justify-center gap-4">
            <GhostButton onClick={() => dispatch({ type: "back" })}>Back</GhostButton>
            <GhostButton onClick={() => setConfirmDiscard(true)} className="!text-danger/70">
              Discard
            </GhostButton>
          </div>
        )}
      </div>
    </section>
  );
}
