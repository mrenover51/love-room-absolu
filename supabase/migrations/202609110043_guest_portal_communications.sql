-- Portail voyageur et communications automatisées. Migration additive uniquement.
create extension if not exists pgcrypto;

alter table public.reservations
  add column if not exists guest_portal_token text,
  add column if not exists keybox_code text,
  add column if not exists keybox_reveal_time time,
  add column if not exists estimated_arrival_time time,
  add column if not exists precheckin_completed_at timestamptz,
  add column if not exists guest_rules_accepted_at timestamptz;

update public.reservations
set guest_portal_token = encode(gen_random_bytes(32), 'hex')
where status = 'confirmed'
  and guest_portal_token is null
  and check_out >= (now() at time zone 'Europe/Paris')::date;

create unique index if not exists reservations_guest_portal_token_idx
  on public.reservations(guest_portal_token)
  where guest_portal_token is not null;

alter table public.reservations
  drop constraint if exists reservations_guest_portal_token_length_check;
alter table public.reservations
  add constraint reservations_guest_portal_token_length_check
  check (guest_portal_token is null or guest_portal_token ~ '^[0-9a-f]{64}$');

alter table public.reservations
  drop constraint if exists reservations_keybox_code_length_check;
alter table public.reservations
  add constraint reservations_keybox_code_length_check
  check (keybox_code is null or char_length(keybox_code) between 3 and 32);

create type public.reservation_communication_type as enum (
  'confirmation', 'pre_arrival', 'access_ready', 'checkout_reminder', 'post_stay_review'
);

create table public.reservation_communications (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  type public.reservation_communication_type not null,
  channel text not null default 'email' check (channel in ('email', 'sms')),
  scheduled_for timestamptz,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'processing', 'sent', 'failed', 'cancelled', 'skipped')),
  provider_message_id text,
  error text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reservation_id, type)
);

create index reservation_communications_due_idx
  on public.reservation_communications(status, scheduled_for)
  where sent_at is null;
create index reservation_communications_reservation_idx
  on public.reservation_communications(reservation_id, created_at desc);

alter table public.reservation_communications enable row level security;
create policy "admins manage reservation communications"
  on public.reservation_communications for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

insert into public.settings(key, value, updated_at) values (
  'guest_experience',
  '{"address":"36 rue Pasteur, 51190 Avize","phone":"06 87 01 04 64","email":"love.room.absolu@gmail.com","checkInTime":"16:00","checkOutTime":"10:00","keyboxRevealTime":"14:00","defaultKeyboxCode":"","accessInstructions":"","parkingInstructions":"","keyboxInstructions":"","wifiName":"","wifiPassword":"","checkoutInstructions":"","houseRules":"","balneoInstructions":"","saunaInstructions":"","tvInstructions":"","kitchenInstructions":"","coffeeInstructions":"","climateInstructions":"","facadeImageUrl":"","entranceImageUrl":"","keyboxImageUrl":"","googleReviewUrl":"","guestPortalRetentionDays":7,"smsEnabled":false}'::jsonb,
  now()
) on conflict(key) do nothing;
