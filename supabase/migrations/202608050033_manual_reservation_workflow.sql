create table if not exists public.reservation_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom text not null check (char_length(nom) between 1 and 100),
  prenom text not null check (char_length(prenom) between 1 and 100),
  email text not null,
  telephone text not null,
  date_arrivee date not null,
  date_depart date not null,
  adultes integer not null check (adultes between 1 and 2),
  options jsonb not null default '{}'::jsonb,
  prix_calcule integer not null check (prix_calcule >= 0),
  message text,
  statut text not null default 'new' check (statut in ('new','accepted','pending_payment','confirmed','rejected','expired','cancelled')),
  expires_at timestamptz,
  stripe_checkout_url text,
  reservation_id uuid unique references public.reservations(id) on delete set null,
  admin_notes text,
  provider text not null default 'site',
  source text not null default 'direct',
  updated_at timestamptz not null default now(),
  check (date_depart > date_arrivee)
);

create index if not exists reservation_requests_status_created_idx on public.reservation_requests(statut,created_at desc);
create index if not exists reservation_requests_dates_idx on public.reservation_requests(date_arrivee,date_depart);
create index if not exists reservation_requests_email_idx on public.reservation_requests(lower(email));

alter table public.reservation_requests enable row level security;
create policy "admins manage reservation requests" on public.reservation_requests for all to authenticated using (public.is_admin()) with check (public.is_admin());

insert into public.settings(key,value) values
  ('reservation_workflow','{"mode":"manual","paymentExpirationHours":24}')
on conflict(key) do nothing;
