# Privacy Posture

Thinking Errors NotePad handles mental-health-adjacent writing. Content is
private **by architecture**: there is no server, no account, and no network
path for content to leave the device. The user-facing policy is
[PRIVACY.md](../../PRIVACY.md) at the repo root.

## Guarantees

1. **Local-only, always.** The worksheet is held in memory and autosaved to
   IndexedDB on the device. The app makes no network requests — there are no
   API routes, no server actions, no third-party SDKs, and no cloud client.
2. **No analytics, no tracking, no third-party scripts.** Fonts are served
   first-party via `next/font`.
3. **Escaped rendering everywhere.** Worksheet text renders as React text nodes
   (never `dangerouslySetInnerHTML`), and file exports HTML-escape all
   user-entered content. Covered by unit tests with script-like input.
4. **Deletion.** Users can delete individual entries, and clear all local data
   from the Your Data page.
5. **Informed data loss.** A first-launch notice (and the Your Data page)
   states that entries live only on the device, can be lost with the app, and
   should be exported regularly — the app is a working tool, not long-term
   storage, and not a medical device.

## Boundaries

- Local storage is device-local, not a backup. Export exists so "local-only"
  still gives the user a durable copy they control: per-entry printable HTML /
  JSON, plus a whole-device backup file that can be re-imported.
- Exported files leave the app's control by design; where the user puts them
  is their choice.

## If this ever changes

Any feature that sends content off-device (sync, backup services, AI) must be
opt-in, prominently disclosed, and reflected in PRIVACY.md and the App Store
privacy label **before** shipping.
