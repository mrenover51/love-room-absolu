create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 2 and 120),
  category text not null check (category in ('restaurant','champagne','photographe','spa','massage','activite')),
  description text not null check (char_length(description) between 80 and 5000),
  city text not null,
  website_url text,
  backlink_url text,
  logo_url text,
  image_url text,
  contact_name text,
  contact_email text,
  status text not null default 'prospect' check (status in ('prospect','contacted','verified','published','declined')),
  reciprocal_status text not null default 'unchecked' check (reciprocal_status in ('unchecked','pending','verified','lost')),
  authority_quality smallint not null default 0 check (authority_quality between 0 and 40),
  local_relevance smallint not null default 0 check (local_relevance between 0 and 30),
  editorial_quality smallint not null default 0 check (editorial_quality between 0 and 20),
  reciprocal_bonus smallint generated always as (case when reciprocal_status='verified' then 10 else 0 end) stored,
  last_checked_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'published' or (website_url is not null and published_at is not null))
);
create index if not exists partners_public_idx on public.partners(category,published_at desc) where status='published';
create index if not exists partners_backlinks_idx on public.partners(reciprocal_status,last_checked_at desc);
alter table public.partners enable row level security;
create policy "published partners are public" on public.partners for select to anon,authenticated using(status='published');
create policy "admins manage partners" on public.partners for all to authenticated using(public.is_admin()) with check(public.is_admin());
