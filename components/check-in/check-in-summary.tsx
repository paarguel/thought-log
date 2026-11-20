"use client";

/**
 * The check-in read back: one labeled section per question, with a pencil
 * to reopen just that section. Picked words stay as chips and typed text
 * stays as written, so it scans at a glance instead of reading as a
 * paragraph.
 */

import Link from "next/link";
import type { EmotionCheckIn } from "@/lib/check-in/types";
import {
  REFLECTION_CLOSING,
  reflectionRows,
  rowIsBlank,
  type CheckInSection,
} from "@/lib/check-in/reflection";

function Pencil() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17l-1 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m14.5 7.5 3 3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

const EDIT_CLASS =
  "-my-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-faint active:bg-paper-sunken";

export function CheckInSummary({
  checkIn,
  onEdit,
  editHref,
  showBlank = false,
}: {
  checkIn: EmotionCheckIn;
  /** Reopen one section in place. */
  onEdit?: (section: CheckInSection) => void;
  /** Or link to it (a saved entry, edited from its own page). */
  editHref?: (section: CheckInSection) => string;
  /** Keep unanswered sections visible so they can still be filled in. */
  showBlank?: boolean;
}) {
  const rows = reflectionRows(checkIn).filter((row) => showBlank || !rowIsBlank(row));
  return (
    <div className="rounded-xl border border-line bg-paper-raised">
      {rows.map((row) => {
        const blank = rowIsBlank(row);
        return (
          <section key={row.section} className="border-b border-line px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[0.8125rem] text-ink-faint">{row.label}</h2>
              {onEdit && (
                <button
                  type="button"
                  aria-label={`Edit: ${row.label}`}
                  onClick={() => onEdit(row.section)}
                  className={EDIT_CLASS}
                >
                  <Pencil />
                </button>
              )}
              {!onEdit && editHref && (
                <Link
                  href={editHref(row.section)}
                  aria-label={`Edit: ${row.label}`}
                  className={EDIT_CLASS}
                >
                  <Pencil />
                </Link>
              )}
            </div>
            {blank && <p className="text-[1rem] text-ink-faint">Left blank</p>}
            {row.items.length > 0 && (
              <ul className="mt-1 flex list-none flex-wrap gap-1.5">
                {row.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-paper-sunken px-3 py-1 text-[0.9375rem] text-ink"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
            {row.text && (
              <p className="mt-1 whitespace-pre-wrap text-[1rem] leading-relaxed text-ink">
                {row.text}
              </p>
            )}
            {row.detail && <p className="mt-1.5 text-[0.875rem] text-ink-soft">{row.detail}</p>}
          </section>
        );
      })}
      <p className="px-4 py-3 font-display text-[1.0625rem] italic text-ink-soft">
        {REFLECTION_CLOSING}
      </p>
    </div>
  );
}
