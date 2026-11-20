"use client";

/**
 * A saved check-in, read back: the reflection first, then exactly what was
 * picked and typed. Skipped questions are simply absent.
 */

import { useState } from "react";
import Link from "next/link";
import type { EmotionCheckIn } from "@/lib/check-in/types";
import { reflectionText } from "@/lib/check-in/reflection";
import { copyText } from "@/lib/check-in/copy";
import { SecondaryButton } from "@/components/ui/buttons";
import { CheckInReflection } from "./check-in-flow";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h2 className="mb-1 text-[0.8125rem] text-ink-faint">{label}</h2>
      <div className="text-[1rem] text-ink">{children}</div>
    </section>
  );
}

function joined(picked: string[], typed: string): string {
  return [...picked, typed.trim()].filter(Boolean).join(" · ");
}

export function CheckInDetail({ checkIn }: { checkIn: EmotionCheckIn }) {
  const [copied, setCopied] = useState<"no" | "yes" | "failed">("no");
  const sensations = joined(checkIn.sensations, checkIn.sensationText);
  const needs = joined(checkIn.needs, checkIn.needText);
  const edited = checkIn.updatedAt.slice(0, 16) !== checkIn.createdAt.slice(0, 16);

  return (
    <>
      <div className="mb-5">
        <p className="text-[0.8125rem] text-ink-faint">
          {new Date(checkIn.createdAt).toLocaleString(undefined, {
            dateStyle: "long",
            timeStyle: "short",
          })}{" "}
          · Check-in
          {edited &&
            ` · Edited ${new Date(checkIn.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}`}
        </p>
      </div>

      <CheckInReflection checkIn={checkIn} />

      <div className="mt-3 mb-7 flex flex-wrap items-center gap-2">
        <Link
          href={`/check-in?id=${encodeURIComponent(checkIn.id)}`}
          className="flex min-h-11 items-center rounded-full border border-line-strong bg-paper-raised px-5 text-[0.9375rem] font-medium text-ink-soft active:bg-paper-sunken"
        >
          Edit check-in
        </Link>
        <SecondaryButton
          onClick={async () =>
            setCopied((await copyText(reflectionText(checkIn))) ? "yes" : "failed")
          }
        >
          Copy reflection
        </SecondaryButton>
        <span role="status" className="text-[0.875rem] text-ink-faint">
          {copied === "yes" ? "Copied." : copied === "failed" ? "Couldn't copy on this device." : ""}
        </span>
      </div>

      {checkIn.situation.trim() && (
        <Row label="What happened">
          <p className="whitespace-pre-wrap">{checkIn.situation}</p>
        </Row>
      )}
      {checkIn.emotions.length > 0 && (
        <Row label="What I might be feeling">
          <p>{checkIn.emotions.join(" · ")}</p>
        </Row>
      )}
      {checkIn.intensity !== undefined && (
        <Row label="How strong it felt">
          <p>{checkIn.intensity} of 10</p>
        </Row>
      )}
      {sensations && (
        <Row label="What I notice in my body or behavior">
          <p className="whitespace-pre-wrap">{sensations}</p>
        </Row>
      )}
      {needs && (
        <Row label="What I might need">
          <p className="whitespace-pre-wrap">{needs}</p>
        </Row>
      )}
    </>
  );
}
