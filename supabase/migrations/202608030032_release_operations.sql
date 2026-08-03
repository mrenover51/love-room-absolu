create table if not exists public.operational_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('info','warning','error','critical')),
  source text not null check (char_length(source) between 1 and 80),
  event text not null check (char_length(event) between 1 and 120),
  context jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists operational_logs_created_idx on public.operational_logs(created_at desc);
create index if not exists operational_logs_open_errors_idx on public.operational_logs(level,created_at desc) where resolved_at is null;
alter table public.operational_logs enable row level security;
comment on table public.operational_logs is 'Journal serveur sans données bancaires ni secrets, accessible via service role.';
