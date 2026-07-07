"use client";

/**
 * One-time notice shown on first launch. The app's whole privacy posture —
 * device-only storage — has a real cost (data can be lost), and the user
 * agrees to that trade before writing anything.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const ACK_KEY = "ten:data-notice-ack";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function readAcknowledged(): boolean {
  try {
    return Boolean(window.localStorage.getItem(ACK_KEY));
  } catch {
    // Storage unavailable (private mode) — never persistently acknowledged.
    return false;
  }
}

/**
 * For other components that shouldn't grab focus (and pop the keyboard)
 * underneath the first-launch notice. False on the server; the server
 * never focuses anything anyway.
 */
export function dataNoticeAcknowledged(): boolean {
  if (typeof window === "undefined") return false;
  return readAcknowledged();
}

export function DataNotice() {
  // Server snapshot says "acknowledged" so the prerendered HTML has no dialog;
  // the real answer replaces it on hydration.
  const acknowledged = useSyncExternalStore(subscribe, readAcknowledged, () => true);
  const [dismissed, setDismissed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const open = !acknowledged && !dismissed;

  // The worksheet's autofocused textarea must yield to the modal. iOS ignores
  // programmatic focus() without a user gesture, but blur() always works and
  // dismisses the keyboard; the focus() is for desktop/a11y.
  useEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    if (active instanceof HTMLElement) active.blur();
    buttonRef.current?.focus();
  }, [open]);

  const acknowledge = () => {
    try {
      window.localStorage.setItem(ACK_KEY, new Date().toISOString());
    } catch {
      // ignore — worst case the notice shows again next launch
    }
    setDismissed(true);
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="data-notice-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-paper p-6 shadow-xl">
        <h2 id="data-notice-title" className="font-display text-[1.25rem] text-ink">
          Your words stay on this device
        </h2>
        <div className="mt-3 flex flex-col gap-2.5 text-[0.9375rem] leading-relaxed text-ink-soft">
          <p>
            Nothing you write here is sent anywhere. There is no account, no cloud,
            and no server.
          </p>
          <p>
            That also means entries can be <span className="font-medium text-ink">lost</span> —
            if this app is deleted or the device is lost, they are gone. Export the
            entries you want to keep.
          </p>
          <p>
            This is a working notepad for untangling thoughts, not long-term storage,
            and not a substitute for professional care.
          </p>
        </div>
        <button
          ref={buttonRef}
          type="button"
          onClick={acknowledge}
          className="mt-5 min-h-13 w-full rounded-full bg-ink text-[1.0625rem] font-medium text-paper"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
