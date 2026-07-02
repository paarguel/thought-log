# Thought Log

A private, mobile-first thought log. Write out what's in your head, circle the
thoughts — like on a paper CBT worksheet — name the thinking patterns, and land
on a more balanced thought.

No AI reads your entries. No analytics. Nothing leaves your device unless you
explicitly choose cloud save.

## How your data is stored

| Choice | Where it lives | Who can see it |
| --- | --- | --- |
| **Save on this device** | This browser's IndexedDB | Only this device |
| **Export (printable / JSON)** | A file you download | Whoever you give the file to |
| **Save to cloud history** | Supabase Postgres, row-locked to your account | Only you, signed in |
| **Discard** | Nowhere | Nobody |

Drafts autosave to the device while you work so nothing is lost; they are never
uploaded. Signing in is optional (Obsidian-style) — it only unlocks cloud
history, it is never required to use the worksheet.

See [docs/operations/privacy.md](docs/operations/privacy.md) for the full posture.

## Develop

```bash
npm install
cp .env.example .env.local   # optional: add Supabase keys for cloud sync
npm run dev
```

Without Supabase env vars the app runs in local-only mode — the full worksheet,
device saves, and export all work.

## Verify

```bash
npm run lint
npm run test
npm run build
```

## Deploy

The app deploys to Vercel; cloud history uses a Supabase project whose schema
lives in [supabase/migrations](supabase/migrations). Security model: explicit
grants to `authenticated` only (no `anon` access) plus RLS policies scoped to
`auth.uid() = user_id`. See [docs/operations/deployment.md](docs/operations/deployment.md).
