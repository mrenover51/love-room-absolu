create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  reservation_id uuid not null unique references public.reservations(id) on delete restrict,
  reviewer_name text not null check (char_length(reviewer_name) between 2 and 80),
  title text not null check (char_length(title) between 5 and 140),
  body text not null check (char_length(body) between 30 and 5000),
  stay_type text not null check (stay_type in ('couple','anniversaire','demande-en-mariage','lune-de-miel','week-end','autre')),
  stay_date date not null,
  nights integer not null check (nights between 1 and 30),
  cleanliness smallint not null check (cleanliness between 1 and 10),
  comfort smallint not null check (comfort between 1 and 10),
  romance smallint not null check (romance between 1 and 10),
  equipment smallint not null check (equipment between 1 and 10),
  welcome smallint not null check (welcome between 1 and 10),
  value_for_money smallint not null check (value_for_money between 1 and 10),
  location smallint not null check (location between 1 and 10),
  atmosphere smallint not null check (atmosphere between 1 and 10),
  overall_rating numeric(3,1) generated always as (round((cleanliness + comfort + romance + equipment + welcome + value_for_money + location + atmosphere)::numeric / 8, 1)) stored,
  photo_urls text[] not null default '{}',
  owner_response text check (owner_response is null or char_length(owner_response) between 10 and 3000),
  owner_responded_at timestamptz,
  verified boolean not null default false,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','rejected')),
  submitted_at timestamptz not null default now(),
  published_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists reviews_public_idx on public.reviews(published_at desc) where status = 'published';
create index if not exists reviews_rating_idx on public.reviews(overall_rating desc) where status = 'published';
create index if not exists reviews_featured_idx on public.reviews(featured, published_at desc) where status = 'published';

create or replace function public.enforce_verified_review() returns trigger language plpgsql security definer set search_path = '' as $$
declare stay public.reservations%rowtype;
begin
  select * into stay from public.reservations where id = new.reservation_id;
  if stay.id is null then raise exception 'RESERVATION_NOT_FOUND'; end if;
  new.verified := stay.status = 'completed' and stay.check_out <= current_date;
  new.stay_date := stay.check_in;
  new.nights := stay.nights;
  new.updated_at := now();
  if new.status = 'published' and not new.verified then raise exception 'ONLY_COMPLETED_STAYS_CAN_BE_PUBLISHED'; end if;
  if new.status = 'published' and new.published_at is null then new.published_at := now(); end if;
  return new;
end $$;

drop trigger if exists reviews_verify_stay on public.reviews;
create trigger reviews_verify_stay before insert or update on public.reviews for each row execute function public.enforce_verified_review();

alter table public.reviews enable row level security;
create policy "published reviews are public" on public.reviews for select to anon, authenticated using (status = 'published' and verified = true);
create policy "admins manage reviews" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());
