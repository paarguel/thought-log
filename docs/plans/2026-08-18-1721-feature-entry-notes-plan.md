---
title: Entry Notes - Plan
date: 2026-08-18
artifact_contract: ce-unified-plan/v1
artifact_readiness: implementation-ready
product_contract_source: ce-brainstorm
execution: code
---

# Entry Notes - Plan

## Goal Capsule

- **Objective:** Someone rereading a saved entry — usually sitting with their therapist — can write down a correction to it and find that correction again later, instead of carrying it in their head until it is gone.
- **Product authority:** Patrick (owner and primary user).
- **Open blockers:** None. Every product decision below is settled; the remaining questions are for planning.

---

## Product Contract

### Summary

Add one optional Notes field to a saved entry, shown directly beneath the balanced thought. It holds free text — corrections, adjustments, anything worked out in a session — is editable and re-savable at any time, and never touches the worksheet it sits under.

### Problem Frame

Every step of the worksheet up to the balanced thought is a record of what happened: the situation, the feelings, the passage as it was written, the phrases circled in it. None of them can be wrong. The balanced thought is different — it is the one step where the user attempts something, and the attempt can miss. Reviewing entries with a therapist, that is exactly where the work lands: the balanced thought was not always as balanced as it looked at the time.

Today a saved entry is read-only. The entry detail screen offers export and delete and nothing else, and the app deliberately never rewrites what was written — marked phrases store offsets into the passage rather than editing it, the way circling words on paper leaves the page intact. So the correction has nowhere to go. In practice it was carried out of the session in the user's head and lost.

### Key Decisions

- **One editable note, no version history.** (session-settled: user-directed — chosen over a list of stored revisions: version control complicates something that should be as simple as an edit.) Governs R2, R7.
- **The worksheet itself stays immutable.** The correction sits beside the original rather than replacing it, consistent with how marked phrases already work. (session-settled: user-approved.) Governs R8.
- **Notes belong to review, not to writing.** Keeping them out of the worksheet flow protects the honesty of the first draft — the moment of writing should not be shaped by what a therapist might say about it. (session-settled: user-directed.) Governs R1.
- **A confirmation only when text would be lost.** Because there is no history, an overwrite is unrecoverable; the check is the cheapest thing that makes that survivable, and it stays out of the way on the first save. (session-settled: user-directed.) Governs R6.
- **The shareable copy is optional about notes; the backup is not.** A backup that silently drops content is not a backup, while the printable copy is handed to another person and should be the user's call. Governs R10, R11.

### Requirements

**The notes surface**

- R1. Notes are available only when reviewing a saved entry. The worksheet flow is unchanged, and no step of it gains a notes field.
- R2. An entry has at most one notes field, holding free text with a single current value.
- R3. The notes sit directly below the balanced thought and above the entry's export and delete controls, so they read as a correction to the thought rather than a comment on the entry as a whole.
- R4. A short explainer is available at the section, stating that notes are for corrections, notes, and adjustments — including work done with a therapist. It is a light prompt or an info affordance, not a persistent block of instructional text.
- R5. An entry with no notes shows a quiet way to add them rather than a permanently open empty field.

**Editing**

- R6. Saving notes over existing text asks for confirmation first; saving into an empty notes field does not. The confirmation is inline and low-friction, in the manner of the existing discard and delete confirmations.
- R7. Saving replaces the previous text. No prior value is retained and there is no undo.
- R8. Nothing else in the entry can be edited: situation, feelings, the written passage, marked phrases, distortion labels, and the original balanced thought all remain as first saved.
- R9. Clearing the notes to empty and saving removes the section from the entry.

**Exports and backups**

- R10. The printable copy can be produced with or without the notes, chosen by the user at export time.
- R11. The JSON export and the full backup always include the notes, and importing a backup restores them.
- R12. Entries saved before this feature exists behave as entries with no notes. No migration step or prompt is shown for them.

**Invariants this must not break**

- R13. Notes text renders escaped everywhere it appears — on screen and in every export — as all other user-entered text already does.
- R14. Adding notes introduces no network activity. The app's zero-request invariant holds unchanged.

### Screen placement

The saved-entry screen gains one section, in this order:

```
Title
Situation
Feelings
Thoughts            (passage with the marked phrases)
A more balanced thought
Notes               ← new; absent until the user adds one
Export printable | Export JSON
Delete entry
```

### Key Flows

- F1. Recording a correction during a session
  - **Trigger:** User opens a saved entry while reviewing it with their therapist.
  - **Steps:** User adds notes below the balanced thought, writes the corrected version and whatever was said about it, saves.
  - **Outcome:** The entry now carries both the original balanced thought and the correction.
  - **Covered by:** R1, R2, R3, R5

- F2. Adjusting notes later
  - **Trigger:** User reopens an entry that already has notes.
  - **Steps:** User edits the text and saves; the app asks for confirmation before replacing what is there.
  - **Outcome:** Notes hold the new text; the previous text is gone.
  - **Covered by:** R6, R7

- F3. Handing a copy to someone
  - **Trigger:** User exports a printable copy of an entry that has notes.
  - **Steps:** User chooses whether the copy includes the notes.
  - **Outcome:** The printable file matches that choice; a JSON export or backup taken separately still contains them.
  - **Covered by:** R10, R11

### Acceptance Examples

- AE1. **Covers R6.** Given an entry whose notes are empty, when the user writes text and saves, then it saves without a confirmation step.
- AE2. **Covers R6, R7.** Given an entry with existing notes, when the user changes the text and saves, then the app asks first, and on confirmation the previous text is not recoverable anywhere in the app.
- AE3. **Covers R9.** Given an entry with notes, when the user clears the text and saves, then the entry shows no notes section and reads as it did before notes were added.
- AE4. **Covers R10.** Given an entry with notes, when the user exports a printable copy without notes, then the file contains the worksheet exactly as it would have before this feature.
- AE5. **Covers R11, R12.** Given a backup containing entries with and without notes, when it is imported, then notes-bearing entries keep their notes and the others show none.
- AE6. **Covers R8.** Given any saved entry, when the user looks for a way to change the balanced thought itself, then none exists.

### Scope Boundaries

- Version history, revision lists, or any before-and-after view of the balanced thought. Explicitly rejected: the value of seeing the progression does not justify the machinery.
- Editing any original worksheet content, including fixing typos in it.
- Notes anywhere in the writing flow, including the save step.
- Any therapist-side capability: accounts, sharing, sync, or a mode the therapist operates. The therapist is present in the room, not in the software.
- Notes attached to individual phrases or distortion labels rather than the entry.
- Reminders or prompts to add notes after a session.

### Dependencies / Assumptions

- The printable copy is the artifact users hand to another person, and the JSON file is their safety net. R10 and R11 rest on that split.
- Notes are plain text. No formatting, attachments, or links are assumed.
- The stored worksheet gains one optional field; its absence means no notes, which is what makes R12 free.

### Outstanding Questions

None. The four questions this contract deferred to planning are answered in Key Technical Decisions below (KTD2, KTD3, KTD5) and in U3's approach.

---

## Planning Contract

**Product Contract preservation:** unchanged. Planning added the sections below and resolved the four questions the contract deferred; no requirement was reworded, split, or rescoped.

### Approach

The feature is additive in every layer it touches. The stored worksheet gains one optional string; IndexedDB stores whole records with no column schema, so no migration and no `DB_VERSION` bump are needed, and an entry saved before this change simply has no such field. The entry screen already renders labelled sections and already carries an inline confirm-then-act pattern for deletion, so the notes section is a new instance of shapes that exist rather than a new interaction language.

The one structural choice is pulling the notes editor out of `app/history/entry/page.tsx` into its own component. That page reads `?id=` through `useSearchParams`, which makes it awkward to mount in a test; a standalone component lets the save, overwrite-confirm, and clear-to-remove behavior be tested directly.

### Key Technical Decisions

- KTD1. **The notes editor is its own component at `components/entry/notes-section.tsx`.** It owns draft text, edit mode, and the overwrite confirmation, and reports a saved value upward; the page owns persistence. Makes R6, R7, and R9 testable without the page's URL dependency. Governs R2, R5, R6, R7, R9.
- KTD2. **An explicit Save control, not save-on-blur.** R6's confirmation needs a discrete moment to attach to, and a blur that raises a dialog is a trap on touch. Resolves a deferred question. Governs R6.
- KTD3. **The printable export takes an explicit include-notes option, defaulting to excluding them.** `worksheetToPrintableHtml` stays a pure function; the caller decides. The privacy-preserving default means a future caller that forgets the option cannot leak notes into a shared file. Resolves a deferred question. Governs R10.
- KTD4. **Saving notes leaves `updatedAt` untouched.** `listLocalEntries` sorts on `updatedAt` while the History card displays `createdAt`, so touching it would float an old entry to the top of History still labelled with its original date. (session-settled: user-approved — chosen over bumping the timestamp: stable History ordering is worth more than recency signalling.)
- KTD5. **`WORKSHEET_SCHEMA_VERSION` goes to 2, and import stays version-agnostic.** Exported files describe their real shape while `parseBackupJson` keeps accepting version-1 backups, which is what makes R12 free. Governs R11, R12.
- KTD6. **No History indicator for entries carrying notes.** Nothing in the contract depends on it and the list is deliberately quiet. Resolves a deferred question.

### Patterns to Follow

- `Section` in `app/history/entry/page.tsx` — the label-plus-content wrapper every entry section already uses.
- The `confirmDelete` block in the same file — inline confirm panel, destructive action plus a cancel ghost button. The overwrite confirmation mirrors its shape at a lower temperature.
- `SecondaryButton` / `GhostButton` in `components/ui/buttons.tsx`, and `.write-surface` in `app/globals.css` for the editing textarea.
- Export tests in `lib/local-store/__tests__/export.test.ts` — escaping assertions in particular.

---

## Implementation Units

### U1. Optional notes on the worksheet model

- **Goal:** The stored worksheet can carry notes.
- **Requirements:** R2, R11, R12 · KTD5
- **Dependencies:** none
- **Files:** `lib/thought-log/types.ts`
- **Approach:**
  1. Add `notes?: string` to `Worksheet`, documented as review-time content that never alters the worksheet body.
  2. Leave `newWorksheet` alone — a new worksheet has no notes, and absence is the empty state.
  3. Raise `WORKSHEET_SCHEMA_VERSION` to 2.
- **Test scenarios:** none — a type addition with no behavior. Covered downstream by U4's round-trip tests.

### U2. Notes section component

- **Goal:** A self-contained section that displays notes, edits them, confirms before overwriting, and removes itself when cleared.
- **Requirements:** R2, R4, R5, R6, R7, R9, R13 · KTD1, KTD2 · AE1, AE2, AE3
- **Dependencies:** U1
- **Files:** `components/entry/notes-section.tsx`, `components/entry/__tests__/notes-section.test.tsx`
- **Approach:**
  1. Props: current notes value and an async save callback; internal state for draft text, edit mode, and a pending-overwrite flag.
  2. With no notes, render a quiet control to add them (R5). With notes, render the text and an edit control.
  3. In edit mode, render a `.write-surface` textarea and an explicit Save (KTD2). Saving into empty notes commits directly; saving over existing text shows the inline confirm panel first (R6).
  4. Saving whitespace-only text stores nothing, which is what makes clearing remove the section (R9).
  5. Render notes as a React text node with `whitespace-pre-wrap`, never as markup (R13).
  6. Include the explainer as a short line or a toggleable info affordance (R4).
- **Patterns to follow:** the `confirmDelete` panel and `Section` in `app/history/entry/page.tsx`.
- **Test scenarios:**
  - Covers AE1. With no existing notes, typing text and saving calls the save callback once with that text and shows no confirmation.
  - Covers AE2. With existing notes, editing and saving shows a confirmation; confirming calls save with the new text; dismissing it calls save not at all and leaves the draft intact.
  - Covers AE3. With existing notes, clearing the field and saving calls save with an empty value.
  - Whitespace-only input saves as empty rather than as blank text.
  - The explainer text is reachable from the section.
  - Notes containing `<script>` render as literal characters, not markup.
  - A failing save callback surfaces an error and leaves the editor open with the user's text.
- **Verification:** the component's own tests pass and cover each scenario above.

### U3. Wire notes into the entry screen

- **Goal:** Notes persist to the entry and appear in the right place on screen.
- **Requirements:** R1, R3, R8, R14 · KTD4
- **Dependencies:** U2
- **Files:** `app/history/entry/page.tsx`
- **Approach:**
  1. Render the notes section between the balanced thought and the export controls (R3).
  2. On save, write `{...entry, notes}` — or the entry with `notes` removed when empty — through the existing `saveLocalEntry`, which is already an upsert, and hold the result in local state so the screen reflects it without a reload.
  3. Do not touch `updatedAt` or `createdAt` (KTD4).
  4. Surface a save failure through the page's existing `error` state.
  5. Change nothing about the worksheet flow (R1) and add no control that edits any other field (R8).
- **Test scenarios:** none at this layer — the page depends on `useSearchParams` and is verified by running the app. U2 covers the behavior and U4 covers persistence shape.
- **Verification:** on the simulator, notes added to an entry survive navigating away and back, and survive an app relaunch.

### U4. Exports, backup, and legacy entries

- **Goal:** Notes travel with the data the user keeps, and stay out of a shared copy when asked.
- **Requirements:** R10, R11, R12, R13 · KTD3, KTD5 · AE4, AE5
- **Dependencies:** U1
- **Files:** `lib/local-store/export.ts`, `app/history/entry/page.tsx`, `lib/local-store/__tests__/export.test.ts`
- **Approach:**
  1. Give `worksheetToPrintableHtml` an options argument carrying `includeNotes`, defaulting to excluding notes (KTD3). When included and present, render a Notes block after the balanced thought, escaped like every other field.
  2. Leave `worksheetToJson` and `backupToJson` untouched — they serialize the whole worksheet, so notes ride along already (R11).
  3. Confirm `parseBackupJson` passes the field through and keeps accepting version-1 backups (R12, KTD5).
  4. On the entry screen, let the printable export offer the with-or-without choice; keep the JSON export a single action.
- **Test scenarios:**
  - Covers AE4. A worksheet with notes exported without them produces HTML containing no note text.
  - A worksheet with notes exported with them includes the note under its own heading.
  - Notes containing HTML are escaped in the printable copy.
  - A worksheet with no notes produces the same printable output whether or not notes are requested.
  - Covers AE5. A backup containing one entry with notes and one without round-trips through `backupToJson` and `parseBackupJson` with notes intact and absent respectively.
  - A version-1 backup with no notes field still imports.
- **Verification:** export tests pass; a printable file opened in a browser shows or omits the notes as chosen.

---

## Verification Contract

- `npm run lint` clean.
- `npm test` green, including the new component and export scenarios.
- `npm run build` succeeds — the static export must keep working, since the native shell bundles `out/`.
- On the iPhone simulator: add notes to a saved entry, leave and return, relaunch the app, edit and confirm the overwrite, clear them away, and export a printable copy both ways.
- The zero-network invariant holds — no fetch, no analytics, no remote asset enters the diff (R14).

## Definition of Done

- Every requirement R1–R14 is satisfied or explicitly deferred in writing.
- AE1–AE6 are each covered by a passing test or an observed simulator check.
- The worksheet flow is untouched: writing a new entry behaves exactly as before.
- An entry saved before this change opens, exports, and deletes with no notes and no errors.
