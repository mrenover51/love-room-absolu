create table if not exists public.seo_audits (
  id bigint generated always as identity primary key, score smallint not null check(score between 0 and 100),
  status text not null check(status in ('pass','attention','fail')), errors integer not null default 0,
  warnings integer not null default 0, broken_links integer not null default 0, orphan_pages integer not null default 0,
  duplicate_pages integer not null default 0, report jsonb not null, created_at timestamptz not null default now()
);
alter table public.seo_audits enable row level security;
create policy "admins read seo audits" on public.seo_audits for select to authenticated using(public.is_admin());
create index if not exists seo_audits_created_idx on public.seo_audits(created_at desc);
create table if not exists public.seo_corrections(id bigint generated always as identity primary key,issue_key text not null unique,route text not null,issue_type text not null,status text not null default 'open' check(status in ('open','planned','resolved','ignored')),note text,updated_at timestamptz not null default now());
alter table public.seo_corrections enable row level security;
create policy "admins manage seo corrections" on public.seo_corrections for all to authenticated using(public.is_admin()) with check(public.is_admin());
