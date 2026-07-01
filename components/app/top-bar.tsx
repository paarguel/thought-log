"use client";

import Link from "next/link";
import { Download, Home, RotateCcw } from "lucide-react";

type TopBarProps = {
  onExport?: () => void;
  onReset?: () => void;
};

export function TopBar({ onExport, onReset }: TopBarProps) {
  return (
    <header className="top-bar">
      <div className="brand-lockup">
        <strong>Thought Log</strong>
        <span>Private worksheet</span>
      </div>
      <div className="icon-row">
        <Link className="icon-button" href="/history" aria-label="Open history">
          <Home size={20} aria-hidden="true" />
        </Link>
        <button className="icon-button" type="button" onClick={onExport} aria-label="Export current worksheet">
          <Download size={20} aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" onClick={onReset} aria-label="Start over">
          <RotateCcw size={20} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
