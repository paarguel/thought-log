"use client";

import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

/** The one visually obvious primary action per screen (R9). */
export function PrimaryButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`w-full min-h-13 rounded-full bg-ink text-paper text-[1.0625rem] font-medium
        tracking-wide transition-opacity active:opacity-80 disabled:opacity-35
        disabled:cursor-not-allowed ${className}`}
    />
  );
}

export function SecondaryButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-11 px-5 rounded-full border border-line-strong bg-paper-raised
        text-ink-soft text-[0.9375rem] font-medium transition-colors
        active:bg-paper-sunken disabled:opacity-35 disabled:cursor-not-allowed ${className}`}
    />
  );
}

export function GhostButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`min-h-11 px-4 rounded-full text-ink-soft text-[0.9375rem]
        underline-offset-4 transition-colors active:text-ink
        disabled:opacity-35 disabled:cursor-not-allowed ${className}`}
    />
  );
}
