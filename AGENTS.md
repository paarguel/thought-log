<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Thought Record — agent notes

Local-first CBT thought-record app. Web (Next.js static export) + iOS / Android
(Capacitor shells bundling `out/`). **Invariant: the app makes zero network
requests.** Do not add fetch calls, analytics, cloud SDKs, or remote assets;
see docs/operations/privacy.md before touching anything data-related.

## Entry points

- `app/` — routes: `/` (first screen: a thought worksheet, or one tap to a
  feeling check-in), `/history`, `/history/entry?id=`, `/check-in?id=`
  (reopen a saved check-in), `/data` (export/import/clear + disclaimers)
- `lib/thought-log/` — worksheet domain logic (reducer, distortion catalog,
  segmenter)
- `lib/check-in/` — emotion check-in: entry type, word lists, and the
  reflection (string assembly only). Check-ins share the `entries` store with
  worksheets, told apart by `kind: "check-in"`
- `lib/local-store/` — IndexedDB persistence + file exports
- `scripts/ios-*.sh` — release pipeline (see README and docs/app-store/)
- `android/` — offline native shell, local document export, backup exclusions
- `scripts/android-release.sh` — signed Google Play bundle; docs/google-play/
- `scripts/generate-app-art.swift` — icon/splash generator (CoreGraphics)

## Conventions

- Static export only: no dynamic routes, no route handlers, no server actions
  (`next.config.ts` has `output: 'export'`). Entry detail uses `?id=` for
  this reason.
- All user text renders escaped (React text nodes / `escapeHtml` in exports).
- The check-in never scores, interprets or requires an answer: every question
  can be skipped, an empty check-in saves, and there are no streaks, counts
  or "are you sure" prompts. Keep it that way.
- Verify with `npm run lint && npm test && npm run build`.
- iOS releases are cut from `main` with a clean worktree
  (`npm run ios:testflight`). Listing copy: docs/app-store/listing.md.
