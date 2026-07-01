alter table public.thought_logs
add column if not exists rational_responses jsonb not null default '[]'::jsonb;

alter table public.thought_logs
alter column schema_version set default 2;
