"use client";

/**
 * A saved check-in, read back section by section. Skipped questions are
 * simply absent; each answered one has a pencil that reopens just it.
 */

import { useState } from "react";
import Link from "next/link";
import type { EmotionCheckIn } from "@/lib/check-in/types";
import { reflectionText } from "@/lib/check-in/reflection";
import { copyText } from "@/lib/check-in/copy";
import { SecondaryButton } from "@/components/ui/buttons";
import { CheckInSummary } from "./check-in-summary";

export function CheckInDetail({ checkIn }: { checkIn: EmotionCheckIn }) {
  const [copied, setCopied] = useState<"no" | "yes" | "failed">("no");
  const editUrl = `/check-in?id=${encodeURIComponent(checkIn.id)}`;
  const edited = checkIn.updatedAt.slice(0, 16) !== checkIn.createdAt.slice(0, 16);

  return (
    <>
      <div className="mb-5">
        <p className="text-[0.8125rem] text-ink-faint">
          {new Date(checkIn.createdAt).toLocaleString(undefined, {
            dateStyle: "long",
            timeStyle: "short",
          })}{" "}
          · Feeling check-in
          {edited &&
            ` · Edited ${new Date(checkIn.updatedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}`}
        </p>
      </div>

      <CheckInSummary
        checkIn={checkIn}
        editHref={(section) => `${editUrl}&section=${section}`}
      />

      <div className="mt-3 mb-7 flex flex-wrap items-center gap-2">
        <Link
          href={editUrl}
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

    </>
  );
}
