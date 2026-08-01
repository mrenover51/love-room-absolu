-- Sprint 4A: modèle professionnel. Migration additive/compatible avec les Sprints précédents.
alter type public.reservation_status add value if not exists 'pending' before 'pending_payment';

alter table public.reservations rename column base_amount to subtotal;
alter table public.reservations rename column extras_amount to extras_total;
alter table public.reservations rename column total_amount to total;
alter table public.reservations rename column stripe_checkout_session_id to stripe_checkout_session;
alter table public.reservations rename column stripe_payment_intent_id to stripe_payment_intent;
alter table public.reservations rename column internal_notes to admin_notes;
alter table public.reservations add column if not exists taxes integer not null default 0 check (taxes >= 0);
alter table public.reservations drop constraint if exists reservations_total_amount_check;
alter table public.reservations add constraint reservations_total_check check (total = subtotal + extras_total + taxes);

alter table public.reservation_extras rename to reservation_options;
alter table public.reservation_options rename column extra_key to option_key;
alter table public.reservation_options rename column unit_amount to price;
alter table public.reservation_options rename column total_amount to total;

alter table public.pricing_settings rename to settings;

-- Compatibilité temporaire des écrans Sprint 4B existants pendant leur future refonte.
alter table public.reservations add column if not exists base_amount integer generated always as (subtotal) stored;
alter table public.reservations add column if not exists extras_amount integer generated always as (extras_total) stored;
alter table public.reservations add column if not exists total_amount integer generated always as (total) stored;
alter table public.reservations add column if not exists stripe_checkout_session_id text generated always as (stripe_checkout_session) stored;
alter table public.reservations add column if not exists stripe_payment_intent_id text generated always as (stripe_payment_intent) stored;
alter table public.reservations add column if not exists internal_notes text;
create view public.pricing_settings as select * from public.settings;
create view public.reservation_extras as select id,reservation_id,option_key as extra_key,label,quantity,price as unit_amount,total as total_amount from public.reservation_options;

create table public.pricing (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null unique check (weekday between 0 and 6),
  price integer not null check (price >= 0)
);
create table public.options (
  id uuid primary key default gen_random_uuid(), name text not null,
  option_key text not null unique, description text not null default '',
  price integer not null check (price >= 0), active boolean not null default true,
  "order" integer not null default 0 check ("order" >= 0)
);
create table public.customers (
  id uuid primary key default gen_random_uuid(), firstname text not null, lastname text not null,
  email text not null unique, phone text not null, created_at timestamptz not null default now(),
  last_reservation timestamptz
);

create index reservations_upcoming_idx on public.reservations(check_in) where status = 'confirmed';
create index reservations_payment_idx on public.reservations(payment_status, created_at desc);
create index reservation_options_reservation_idx on public.reservation_options(reservation_id);
create index blocked_dates_external_idx on public.blocked_dates(source, external_uid) where external_uid is not null;
create index customers_last_reservation_idx on public.customers(last_reservation desc);

alter table public.pricing enable row level security;
alter table public.options enable row level security;
alter table public.customers enable row level security;
create policy "public read pricing" on public.pricing for select to anon, authenticated using (true);
create policy "public read active options" on public.options for select to anon, authenticated using (active);
create policy "admins manage pricing" on public.pricing for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage options" on public.options for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins read customers" on public.customers for select to authenticated using (public.is_admin());

insert into public.pricing(weekday,price) values (0,17000),(1,14000),(2,14000),(3,15000),(4,17000),(5,22000),(6,24000)
on conflict (weekday) do update set price=excluded.price;
insert into public.options(option_key,name,description,price,"order") values
 ('romantic-decoration','Décoration romantique','Une mise en scène élégante pour votre arrivée.',2500,1),
 ('champagne','Bouteille de champagne','Une bouteille fraîche préparée avant votre arrivée.',4500,2),
 ('petals','Pétales','Une touche romantique disposée avec soin.',1500,3),
 ('late-checkout','Départ tardif','Profitez de la suite plus longtemps le jour du départ.',3000,4),
 ('early-checkin','Arrivée anticipée','Accédez à la suite plus tôt, sous réserve de disponibilité.',2500,5),
 ('breakfast','Petit-déjeuner','Un petit-déjeuner préparé pour deux.',2000,6)
on conflict (option_key) do update set name=excluded.name,description=excluded.description,price=excluded.price,"order"=excluded."order";

create or replace function public.create_checkout_reservation(
  p_reference text,p_check_in date,p_check_out date,p_first_name text,p_last_name text,p_email text,p_phone text,
  p_guest_count integer,p_message text,p_subtotal integer,p_extras_total integer,p_taxes integer,p_total integer,
  p_expires_at timestamptz,p_options jsonb
) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid; v_option jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('absolu_reservations'));
  if p_check_out <= p_check_in or p_total <> p_subtotal + p_extras_total + p_taxes then raise exception 'INVALID_RESERVATION' using errcode='P0001'; end if;
  if exists(select 1 from public.blocked_dates where start_date < p_check_out and end_date > p_check_in)
    or exists(select 1 from public.reservations where check_in < p_check_out and check_out > p_check_in and
      (status='confirmed' or (status='pending_payment' and payment_expires_at > now()))) then
    raise exception 'DATES_UNAVAILABLE' using errcode='P0001';
  end if;
  insert into public.customers(firstname,lastname,email,phone,last_reservation) values(p_first_name,p_last_name,lower(p_email),p_phone,now())
    on conflict(email) do update set firstname=excluded.firstname,lastname=excluded.lastname,phone=excluded.phone,last_reservation=now();
  insert into public.reservations(reference,status,payment_status,source,check_in,check_out,nights,guest_first_name,guest_last_name,guest_email,guest_phone,guest_count,message,subtotal,extras_total,taxes,total,currency,payment_expires_at)
  values(p_reference,'pending_payment','unpaid','direct',p_check_in,p_check_out,p_check_out-p_check_in,p_first_name,p_last_name,lower(p_email),p_phone,p_guest_count,p_message,p_subtotal,p_extras_total,p_taxes,p_total,'eur',p_expires_at) returning id into v_id;
  for v_option in select * from jsonb_array_elements(p_options) loop
    insert into public.reservation_options(reservation_id,option_key,label,quantity,price,total)
    values(v_id,v_option->>'key',v_option->>'label',(v_option->>'quantity')::integer,(v_option->>'price')::integer,(v_option->>'total')::integer);
  end loop;
  return v_id;
end $$;
revoke all on function public.create_checkout_reservation from public,anon,authenticated;
grant execute on function public.create_checkout_reservation to service_role;

create or replace function public.confirm_reservation(p_reservation_id uuid,p_session_id text,p_payment_intent_id text)
returns boolean language plpgsql security definer set search_path='' as $$
begin
  update public.reservations set status='confirmed',payment_status='paid',stripe_checkout_session=p_session_id,
    stripe_payment_intent=p_payment_intent_id,confirmed_at=coalesce(confirmed_at,now()),updated_at=now()
  where id=p_reservation_id and status='pending_payment';
  if found then insert into public.blocked_dates(start_date,end_date,source,external_uid,reason)
    select check_in,check_out,'direct',id::text,'Réservation directe' from public.reservations where id=p_reservation_id
    on conflict(source,external_uid) do nothing; end if;
  return found;
end $$;
revoke all on function public.confirm_reservation from public,anon,authenticated;
grant execute on function public.confirm_reservation to service_role;
