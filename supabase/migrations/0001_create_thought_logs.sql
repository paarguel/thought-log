-- Thought Log: owner-scoped cloud history table.
-- Explicit grants + RLS together (2026 Supabase defaults require both).

create table if not exists public.thought_logs (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null default '',
  situation text not null default '',
  feelings jsonb not null default '[]'::jsonb,
  thought_text text not null default '',
  phrases jsonb not null default '[]'::jsonb,
  rational_thought text not null default '',
  review_mode_last_used text not null default 'original',
  schema_version int not null default 1
);

create index if not exists thought_logs_user_updated_idx
  on public.thought_logs (user_id, updated_at desc);

-- Data API exposure: authenticated users only. No anon access at all.
grant select, insert, update, delete on table public.thought_logs to authenticated;

alter table public.thought_logs enable row level security;

create policy "Users can read own thought logs"
  on public.thought_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own thought logs"
  on public.thought_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update own thought logs"
  on public.thought_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete own thought logs"
  on public.thought_logs for delete
  to authenticated
  using ((select auth.uid()) = user_id);
