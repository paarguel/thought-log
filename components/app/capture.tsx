"use client";

/**
 * The first screen. It opens straight onto a thought, as it always has; one
 * tap on the switch turns the same first question into a feeling check-in.
 *
 * Whatever was typed into "What happened?" follows the user across the
 * switch when that is all they have written. Anything further along stays
 * behind as that flow's own draft.
 */

import { useState } from "react";
import { clearCheckInDraft, clearDraft } from "@/lib/local-store/indexed-db";
import { CheckInFlow } from "@/components/check-in/check-in-flow";
import { WorksheetFlow } from "@/components/worksheet/worksheet-flow";
import { EntryKindSwitch, type EntryKind } from "./entry-kind-switch";

export function Capture() {
  const [kind, setKind] = useState<EntryKind>("thought");
  const [carry, setCarry] = useState("");

  // Each flow decides what to keep or hand over before it steps aside.
  const kindSwitch = (leave: () => void) => (
    <EntryKindSwitch kind={kind} onChange={leave} />
  );

  if (kind === "feeling") {
    return (
      <CheckInFlow
        kindSwitch={kindSwitch}
        seedSituation={carry}
        // The text now lives in the check-in; drop the thought draft it came from.
        onSeedUsed={() => clearDraft().catch(() => {})}
        onLeave={(text) => {
          setCarry(text);
          setKind("thought");
        }}
        onDone={() => {
          setCarry("");
          setKind("thought");
        }}
      />
    );
  }

  return (
    <WorksheetFlow
      kindSwitch={kindSwitch}
      seedSituation={carry}
      onSeedUsed={() => clearCheckInDraft().catch(() => {})}
      onLeave={(text) => {
        setCarry(text);
        setKind("feeling");
      }}
    />
  );
}
