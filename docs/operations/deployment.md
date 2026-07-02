# Deployment

## Topology

- **App:** Next.js (App Router), deployed on Vercel. All pages are static or
  client-rendered; there is no server-side handling of worksheet content.
- **Cloud history:** Supabase project `thought-log` (`dktoxkyrbsqtqvonvuxv`,
  us-west-1). Auth (email + password) and one Postgres table `thought_logs`.

## Environment

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable key (`sb_publishable_…`) — safe to expose; all data access is gated by RLS |

Both are build-time public values, pinned in `vercel.json` (`build.env`) and in
`.env.local` for local dev. If they are absent the app degrades gracefully to
local-only mode.

## Database schema

Migrations live in `supabase/migrations/`. Security invariants any future
migration must preserve:

- RLS stays enabled on `thought_logs`.
- Grants: `authenticated` only. Never grant to `anon`.
- All four policies scoped `auth.uid() = user_id`.

Run `get_advisors` (Supabase MCP) or the dashboard advisors after schema
changes.

## Auth settings (Supabase dashboard)

- Email confirmation is ON: new signups must confirm via email before signing
  in. Supabase's built-in SMTP has low hourly limits — fine for personal use;
  configure custom SMTP before any wider launch.

## Release checklist

1. `npm run lint && npm run test && npm run build`
2. Deploy (Vercel MCP `deploy_to_vercel` or `vercel deploy --prod`)
3. Open the production URL on a phone: complete a local-only worksheet, watch
   the network tab for content leaks, then a cloud save while signed in.
