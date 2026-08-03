create table if not exists public.concierge_sessions(id uuid primary key,occasion text,preferences jsonb not null default '{}'::jsonb,last_seen_at timestamptz not null default now(),created_at timestamptz not null default now());
create table if not exists public.concierge_messages(id bigint generated always as identity primary key,session_id uuid not null references public.concierge_sessions(id) on delete cascade,role text not null check(role in ('user','assistant')),content text not null check(char_length(content)<=4000),intent text,created_at timestamptz not null default now());
alter table public.concierge_sessions enable row level security;alter table public.concierge_messages enable row level security;
create index if not exists concierge_messages_session_idx on public.concierge_messages(session_id,created_at desc);
create index if not exists concierge_sessions_seen_idx on public.concierge_sessions(last_seen_at desc);
