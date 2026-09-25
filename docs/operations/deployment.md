# Deployment

## Topology

- **Web:** Next.js (App Router) with `output: 'export'` — a fully static
  site in `out/`. Deployed on Vercel (or any static host). There is no
  server-side handling of anything: no API routes, no env vars, no services.
- **iOS:** the same static export is bundled into a Capacitor shell
  (`ios/`) and served from disk inside the app — fully offline. See the
  `ios:*` npm scripts and [docs/app-store/](../app-store/).

- **Android:** the same static export is bundled in `android/`. Internet
  permission is removed; cloud backup and device transfer are disabled.
  Exports use the system local document picker. See [Google Play](../google-play/release-checklist.md).

## Environment

None. The app has no configuration and no secrets.

Native release credentials are machine-local. Android signing uses
`~/.thinking-errors-notepad/android-signing.properties` and its upload keystore.
The iOS signing config is
(`~/.thinking-errors-notepad/ios-release.env`, App Store Connect API key),
which never enters the repo.

## History

Until July 2026 the app had an optional Supabase cloud-history mode. It was
removed for the App Store release so the app can promise, structurally, that
data never leaves the device (git history has the last cloud version if it's
ever needed again).
