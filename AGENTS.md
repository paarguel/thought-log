<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Thought Record — agent notes

Local-first CBT thought-record app. Web (Next.js static export) + iOS
(Capacitor shell bundling `out/`). **Invariant: the app makes zero network
requests.** Do not add fetch calls, analytics, cloud SDKs, or remote assets;
see docs/operations/privacy.md before touching anything data-related.

## Entry points

- `app/` — routes: `/` (worksheet flow), `/history`, `/history/entry?id=`,
  `/data` (export/import/clear + disclaimers)
- `lib/thought-log/` — domain logic (reducer, distortion catalog, segmenter)
- `lib/local-store/` — IndexedDB persistence + file exports
- `scripts/ios-*.sh` — release pipeline (see README and docs/app-store/)
- `scripts/generate-app-art.swift` — icon/splash generator (CoreGraphics)

## Conventions

- Static export only: no dynamic routes, no route handlers, no server actions
  (`next.config.ts` has `output: 'export'`). Entry detail uses `?id=` for
  this reason.
- All user text renders escaped (React text nodes / `escapeHtml` in exports).
- Verify with `npm run lint && npm test && npm run build`.
- iOS releases are cut from `main` with a clean worktree
  (`npm run ios:testflight`). Listing copy: docs/app-store/listing.md.
