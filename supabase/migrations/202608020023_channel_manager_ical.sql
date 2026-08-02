-- Sprint 23: Channel Manager iCal extensible et compatible avec le schéma existant.
alter type public.reservation_source add value if not exists 'abritel';
alter type public.reservation_source add value if not exists 'google';

create table if not exists public.calendar_sources (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique check (provider in ('booking','airbnb','abritel','google')),
  name text not null,
  import_url text,
  enabled boolean not null default false,
  status text not null default 'not_configured' check (status in ('not_configured','ok','error','syncing')),
  last_sync timestamptz,
  last_error text,
  imported_count integer not null default 0 check (imported_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.calendar_sources(provider,name) values
  ('booking','Booking.com'),('airbnb','Airbnb'),('abritel','Abritel'),('google','Google Vacation Rentals')
on conflict (provider) do nothing;

alter table public.reservations add column if not exists provider text not null default 'site'
  check (provider in ('site','booking','airbnb','abritel','google','manual'));
alter table public.reservations add column if not exists external_id text;
alter table public.reservations add column if not exists ical_uid text;
alter table public.reservations add column if not exists last_sync timestamptz;
alter table public.reservations add column if not exists sync_status text not null default 'local'
  check (sync_status in ('local','synced','conflict','cancelled','error'));
create unique index if not exists reservations_provider_ical_uid_idx on public.reservations(provider,ical_uid) where ical_uid is not null;

create table if not exists public.calendar_blocks (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('site','booking','airbnb','abritel','google','manual')),
  external_id text,
  ical_uid text,
  start_date date not null,
  end_date date not null,
  summary text not null default 'Indisponible',
  status text not null default 'confirmed' check (status in ('confirmed','cancelled','blocked')),
  last_sync timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (end_date > start_date),
  unique(provider,ical_uid)
);

alter table public.sync_logs add column if not exists duration_ms integer check (duration_ms >= 0);
alter table public.sync_logs add column if not exists imported_count integer not null default 0 check (imported_count >= 0);
alter table public.sync_logs add column if not exists updated_count integer not null default 0 check (updated_count >= 0);
alter table public.sync_logs add column if not exists cancelled_count integer not null default 0 check (cancelled_count >= 0);
alter table public.sync_logs add column if not exists conflict_count integer not null default 0 check (conflict_count >= 0);
alter table public.sync_logs add column if not exists error_message text;

create table if not exists public.calendar_conflicts (
  id uuid primary key default gen_random_uuid(),
  primary_reservation_id uuid references public.reservations(id) on delete set null,
  conflicting_reservation_id uuid references public.reservations(id) on delete set null,
  provider text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'open' check (status in ('open','resolved','ignored')),
  resolution_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);
create unique index if not exists calendar_conflicts_open_idx on public.calendar_conflicts(provider,start_date,end_date) where status='open';

create index if not exists calendar_sources_enabled_idx on public.calendar_sources(enabled,provider);
create index if not exists calendar_blocks_dates_idx on public.calendar_blocks(start_date,end_date);
create index if not exists sync_logs_source_created_idx on public.sync_logs(source,created_at desc);

alter table public.calendar_sources enable row level security;
alter table public.calendar_blocks enable row level security;
alter table public.calendar_conflicts enable row level security;
create policy "admins manage calendar sources" on public.calendar_sources for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage calendar blocks" on public.calendar_blocks for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage calendar conflicts" on public.calendar_conflicts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Les anciennes réservations restent explicitement rattachées au site.
update public.reservations set provider=case source::text when 'booking' then 'booking' when 'airbnb' then 'airbnb' else 'site' end
where provider='site';
