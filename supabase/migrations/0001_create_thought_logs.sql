create table if not exists public.thought_logs (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  title text not null,
  situation text not null default '',
  feelings jsonb not null default '[]'::jsonb,
  thought_text text not null default '',
  extracted_thoughts jsonb not null default '[]'::jsonb,
  label_assignments jsonb not null default '[]'::jsonb,
  rational_thought text not null default '',
  review_mode_last_used text not null default 'original',
  schema_version integer not null default 1,
  constraint thought_logs_review_mode_check check (review_mode_last_used in ('original', 'all', 'one'))
);

alter table public.thought_logs enable row level security;

grant select, insert, update, delete on public.thought_logs to authenticated;
grant all on public.thought_logs to service_role;

create policy "Users can read their own thought logs"
on public.thought_logs
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can insert their own thought logs"
on public.thought_logs
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own thought logs"
on public.thought_logs
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own thought logs"
on public.thought_logs
for delete
to authenticated
using ((select auth.uid()) = user_id);

create index if not exists thought_logs_user_created_idx
on public.thought_logs (user_id, created_at desc);
