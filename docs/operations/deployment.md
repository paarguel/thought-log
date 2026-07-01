# Deployment

Thought Log is intended to run as a standalone Vercel project backed by its own Supabase project.

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The app still works in private device mode when those variables are absent, but cloud history is disabled.
