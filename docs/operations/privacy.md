# Privacy Posture

Thought Log handles mental-health-adjacent writing. Content is private by
default; every storage decision is explicit and belongs to the user.

## Guarantees

1. **Local-only completion.** The worksheet is fully usable signed out. During
   the flow, content is held in memory and autosaved to IndexedDB on the
   device. No worksheet content is sent to any server in this mode — verified
   by inspecting network traffic through a full local-only run.
2. **No server middleman.** There are no app API routes or server actions that
   receive worksheet content. Cloud save goes directly from the browser to
   Supabase over TLS under the user's own session.
3. **Owner-only cloud rows.** `thought_logs` has RLS enabled with
   `auth.uid() = user_id` policies for select/insert/update/delete, grants to
   `authenticated` only, and no `anon` access (verified: a different
   authenticated user sees zero rows; `anon` is denied at the grant level).
4. **No analytics, no tracking, no third-party scripts.** Fonts are served
   first-party via `next/font`.
5. **Escaped rendering everywhere.** Worksheet text renders as React text nodes
   (never `dangerouslySetInnerHTML`), and file exports HTML-escape all
   user-entered content. Covered by unit tests with script-like input.
6. **Deletion.** Users can delete individual local or cloud entries, and clear
   all local data from the Account page. Cloud deletes remove the row.

## Boundaries

- Local storage is device-local, not a backup. Export exists so "local-only"
  still gives the user a durable copy they control.
- Supabase stores cloud rows with its standard encryption-at-rest/in-transit
  posture; end-to-end encryption is a possible future upgrade, deliberately out
  of MVP scope.
- The app provides no AI interpretation, diagnosis, or medical advice, and must
  not imply it replaces therapy.
