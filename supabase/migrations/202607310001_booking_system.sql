create extension if not exists btree_gist;

create type public.reservation_status as enum ('pending_payment','confirmed','cancelled','completed','refunded');
create type public.payment_status as enum ('unpaid','paid','partially_refunded','refunded','failed');
create type public.reservation_source as enum ('direct','booking','airbnb','manual');

create table public.reservations (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check_in date not null, check_out date not null, nights integer not null check (nights > 0),
  guest_first_name text not null check (char_length(guest_first_name) between 1 and 100),
  guest_last_name text not null check (char_length(guest_last_name) between 1 and 100),
  guest_email text not null, guest_phone text not null, guest_count integer not null check (guest_count between 1 and 2),
  message text, base_amount integer not null check (base_amount >= 0), extras_amount integer not null default 0 check (extras_amount >= 0),
  total_amount integer not null check (total_amount = base_amount + extras_amount), currency text not null default 'eur' check (currency ~ '^[a-z]{3}$'),
  status public.reservation_status not null default 'pending_payment', payment_status public.payment_status not null default 'unpaid',
  stripe_checkout_session_id text unique, stripe_payment_intent_id text unique, source public.reservation_source not null default 'direct',
  internal_notes text, payment_expires_at timestamptz, confirmed_at timestamptz,
  check (check_out > check_in), check (nights = check_out - check_in)
);

create table public.reservation_extras (
  id uuid primary key default gen_random_uuid(), reservation_id uuid not null references public.reservations(id) on delete cascade,
  extra_key text not null, label text not null, quantity integer not null default 1 check (quantity > 0),
  unit_amount integer not null check (unit_amount >= 0), total_amount integer not null check (total_amount = quantity * unit_amount),
  unique (reservation_id, extra_key)
);

create table public.blocked_dates (
  id uuid primary key default gen_random_uuid(), start_date date not null, end_date date not null,
  source public.reservation_source not null default 'manual', external_uid text, reason text, created_at timestamptz not null default now(),
  check (end_date > start_date), unique (source, external_uid)
);

create table public.pricing_settings (
  id uuid primary key default gen_random_uuid(), key text not null unique, value jsonb not null, updated_at timestamptz not null default now()
);

create table public.admin_profiles (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','owner')), created_at timestamptz not null default now()
);

create table public.webhook_events (
  id text primary key, type text not null, processed_at timestamptz not null default now()
);

create index reservations_dates_idx on public.reservations(check_in, check_out);
create index reservations_status_idx on public.reservations(status, payment_expires_at);
create index reservations_email_idx on public.reservations(lower(guest_email));
create index blocked_dates_range_idx on public.blocked_dates(start_date, end_date);
create index extras_reservation_idx on public.reservation_extras(reservation_id);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.admin_profiles where user_id = auth.uid())
$$;

alter table public.reservations enable row level security;
alter table public.reservation_extras enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.pricing_settings enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.webhook_events enable row level security;

create policy "admins read reservations" on public.reservations for select to authenticated using (public.is_admin());
create policy "admins update reservations" on public.reservations for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage extras" on public.reservation_extras for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage blocked dates" on public.blocked_dates for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage pricing" on public.pricing_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read profiles" on public.admin_profiles for select to authenticated using (user_id = auth.uid());

insert into public.pricing_settings(key, value) values
 ('base_price', '{"amount":25000,"currency":"eur"}'),
 ('minimum_nights', '{"value":1}'),
 ('pending_expiration_minutes', '{"value":30}'),
 ('options', '[{"key":"romantic_pack","label":"Pack romantique","amount":4500,"enabled":true}]'),
 ('times', '{"checkIn":"17:00","checkOut":"11:00"}')
on conflict (key) do nothing;

create or replace function public.create_pending_reservation(
  p_reference text, p_check_in date, p_check_out date, p_first_name text, p_last_name text,
  p_email text, p_phone text, p_guest_count integer, p_message text, p_base_amount integer,
  p_extras_amount integer, p_total_amount integer, p_expires_at timestamptz, p_extras jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_extra jsonb;
begin
  perform pg_advisory_xact_lock(hashtext(p_check_in::text || ':' || p_check_out::text));
  if exists(select 1 from public.blocked_dates where start_date < p_check_out and end_date > p_check_in)
    or exists(select 1 from public.reservations where check_in < p_check_out and check_out > p_check_in and
      (status = 'confirmed' or (status = 'pending_payment' and payment_expires_at > now()))) then
    raise exception 'DATES_UNAVAILABLE' using errcode = 'P0001';
  end if;
  insert into public.reservations(reference,check_in,check_out,nights,guest_first_name,guest_last_name,guest_email,guest_phone,guest_count,message,base_amount,extras_amount,total_amount,payment_expires_at)
  values(p_reference,p_check_in,p_check_out,p_check_out-p_check_in,p_first_name,p_last_name,p_email,p_phone,p_guest_count,p_message,p_base_amount,p_extras_amount,p_total_amount,p_expires_at) returning id into v_id;
  for v_extra in select * from jsonb_array_elements(p_extras) loop
    insert into public.reservation_extras(reservation_id,extra_key,label,quantity,unit_amount,total_amount)
    values(v_id,v_extra->>'key',v_extra->>'label',(v_extra->>'quantity')::integer,(v_extra->>'unitAmount')::integer,(v_extra->>'totalAmount')::integer);
  end loop;
  return v_id;
end $$;
revoke all on function public.create_pending_reservation from public, anon, authenticated;

create or replace function public.confirm_reservation(p_reservation_id uuid, p_session_id text, p_payment_intent_id text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.reservations set status='confirmed', payment_status='paid', stripe_checkout_session_id=p_session_id,
    stripe_payment_intent_id=p_payment_intent_id, confirmed_at=coalesce(confirmed_at,now()), updated_at=now()
  where id=p_reservation_id and status='pending_payment';
  return found;
end $$;
revoke all on function public.confirm_reservation from public, anon, authenticated;
