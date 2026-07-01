# Thought Log

A standalone, mobile-first worksheet app for writing a situation, feelings, one long thought passage, extracted thoughts, thinking-pattern labels, review, and a realistic rational thought.

The first experience is the worksheet itself. Cloud history is optional; local-only save/export is available for entries that should not be stored online.

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run test
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and set:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

Without Supabase variables, the app remains usable in private device mode and cloud history is disabled.
