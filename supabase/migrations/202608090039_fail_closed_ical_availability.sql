-- Fail-closed iCal reconciliation and atomic external-block availability guard.
-- This migration is additive and never reactivates previously cancelled data.

alter table public.calendar_sources
  add column if not exists suspicious_snapshot boolean not null default false,
  add column if not exists reconciliation_blocked boolean not null default false,
  add column if not exists protected_count integer not null default 0 check (protected_count >= 0),
  add column if not exists previous_active_count integer not null default 0 check (previous_active_count >= 0),
  add column if not exists missing_count integer not null default 0 check (missing_count >= 0),
  add column if not exists missing_percentage numeric(6,2) not null default 0 check (missing_percentage between 0 and 100);

alter table public.sync_logs
  add column if not exists sync_trigger text not null default 'api'
    check (sync_trigger in ('individual','sync-all','cron','api')),
  add column if not exists provider text,
  add column if not exists downloaded_count integer not null default 0 check (downloaded_count >= 0),
  add column if not exists validated_count integer not null default 0 check (validated_count >= 0),
  add column if not exists previous_active_count integer not null default 0 check (previous_active_count >= 0),
  add column if not exists missing_count integer not null default 0 check (missing_count >= 0),
  add column if not exists missing_percentage numeric(6,2) not null default 0 check (missing_percentage between 0 and 100),
  add column if not exists reconciliation_decision text not null default 'not_applicable',
  add column if not exists suspicious_snapshot boolean not null default false,
  add column if not exists url_fingerprint text;

create table if not exists public.calendar_missing_observations (
  provider text not null check (provider in ('booking','airbnb')),
  ical_uid text not null,
  consecutive_count integer not null default 1 check (consecutive_count >= 0),
  suspicious boolean not null default false,
  first_missing_at timestamptz not null,
  last_missing_at timestamptz not null,
  primary key (provider, ical_uid)
);

alter table public.calendar_missing_observations enable row level security;
drop policy if exists "admins read missing calendar observations" on public.calendar_missing_observations;
create policy "admins read missing calendar observations"
  on public.calendar_missing_observations for select to authenticated
  using (public.is_admin());

create or replace function public.sync_external_calendar(
  p_provider text,
  p_events jsonb,
  p_synced_at timestamptz default now()
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event jsonb;
  v_uid text;
  v_start date;
  v_end date;
  v_seen_uids text[] := array[]::text[];
  v_reservation_id uuid;
  v_primary_id uuid;
  v_existed boolean;
  v_imported integer := 0;
  v_updated integer := 0;
  v_cancelled integer := 0;
  v_conflicts integer := 0;
  v_previous_active integer := 0;
  v_received_active integer := 0;
  v_missing integer := 0;
  v_protected integer := 0;
  v_missing_percentage numeric(6,2) := 0;
  v_suspicious boolean := false;
  v_decision text := 'no_changes';
begin
  if p_provider is null or p_provider not in ('booking', 'airbnb') then
    raise exception 'ICAL_PROVIDER_INVALID' using errcode = 'P0001';
  end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    raise exception 'ICAL_EVENTS_INVALID' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('ical:' || p_provider));

  -- Validate the complete payload before any write.
  for v_event in select value from jsonb_array_elements(p_events)
  loop
    if jsonb_typeof(v_event) <> 'object' then
      raise exception 'ICAL_EVENT_INVALID' using errcode = 'P0001';
    end if;
    v_uid := nullif(btrim(v_event->>'uid'), '');
    if v_uid is null
      or nullif(btrim(v_event->>'reference'), '') is null
      or nullif(btrim(v_event->>'email'), '') is null then
      raise exception 'ICAL_EVENT_REQUIRED_FIELD_MISSING' using errcode = 'P0001';
    end if;
    begin
      v_start := (v_event->>'start')::date;
      v_end := (v_event->>'end')::date;
    exception when others then
      raise exception 'ICAL_EVENT_DATE_INVALID' using errcode = 'P0001';
    end;
    if v_start is null or v_end is null or v_end <= v_start then
      raise exception 'ICAL_EVENT_INVALID' using errcode = 'P0001';
    end if;
    if v_event ? 'cancelled' and jsonb_typeof(v_event->'cancelled') <> 'boolean' then
      raise exception 'ICAL_EVENT_CANCELLED_INVALID' using errcode = 'P0001';
    end if;
    if v_uid = any(v_seen_uids) then
      raise exception 'ICAL_EVENT_UID_DUPLICATE' using errcode = 'P0001';
    end if;
    v_seen_uids := array_append(v_seen_uids, v_uid);
  end loop;

  select count(*) into v_previous_active
  from (
    select ical_uid from public.reservations
    where provider = p_provider and ical_uid is not null and status <> 'cancelled'
    union
    select ical_uid from public.calendar_blocks
    where provider = p_provider and ical_uid is not null and status in ('confirmed','blocked')
  ) active_uids;

  if jsonb_array_length(p_events) = 0 then
    update public.calendar_sources
    set status = 'ok', last_sync = p_synced_at,
        imported_count = 0, suspicious_snapshot = true,
        reconciliation_blocked = true, protected_count = v_previous_active,
        previous_active_count = v_previous_active, missing_count = v_previous_active,
        missing_percentage = case when v_previous_active > 0 then 100 else 0 end,
        last_error = 'ICAL_EMPTY_SNAPSHOT_PROTECTED', updated_at = p_synced_at
    where provider = p_provider;
    return jsonb_build_object(
      'imported', 0, 'updated', 0, 'cancelled', 0, 'conflicts', 0,
      'previousActive', v_previous_active, 'missing', v_previous_active,
      'missingPercentage', case when v_previous_active > 0 then 100 else 0 end,
      'protected', v_previous_active, 'suspicious', true,
      'decision', 'empty_snapshot_protected'
    );
  end if;

  select count(*) into v_received_active
  from jsonb_array_elements(p_events) event
  where not coalesce((event->>'cancelled')::boolean, false);

  select count(*) into v_missing
  from (
    select ical_uid from public.reservations
    where provider = p_provider and ical_uid is not null and status <> 'cancelled'
    union
    select ical_uid from public.calendar_blocks
    where provider = p_provider and ical_uid is not null and status in ('confirmed','blocked')
  ) active_uids
  where not exists (
    select 1 from jsonb_array_elements(p_events) event
    where event->>'uid' = active_uids.ical_uid
  );

  if v_previous_active > 0 then
    v_missing_percentage := round((v_missing::numeric * 100) / v_previous_active, 2);
  end if;

  -- Automatic absence reconciliation is deliberately narrow: exactly one
  -- missing UID, less than half the active snapshot, confirmed twice.
  v_suspicious := v_missing > 1
    or (v_missing > 0 and v_missing * 2 >= v_previous_active);

  for v_event in select value from jsonb_array_elements(p_events)
  loop
    v_uid := btrim(v_event->>'uid');
    v_start := (v_event->>'start')::date;
    v_end := (v_event->>'end')::date;

    select exists(select 1 from public.reservations where provider = p_provider and ical_uid = v_uid)
      into v_existed;
    select id into v_primary_id from public.reservations
    where provider <> p_provider and status in ('confirmed','pending_payment')
      and check_in < v_end and check_out > v_start
    order by created_at limit 1;

    insert into public.reservations(
      reference, check_in, check_out, nights, guest_first_name, guest_last_name,
      guest_email, guest_phone, guest_count, subtotal, extras_total, taxes, total,
      currency, payment_status, status, source, provider, external_id, ical_uid,
      last_sync, sync_status
    ) values (
      btrim(v_event->>'reference'), v_start, v_end, v_end - v_start,
      case when p_provider = 'booking' then 'Voyageur Booking' else 'Voyageur Airbnb' end,
      '(iCal)', btrim(v_event->>'email'), 'Non transmis', 2, 0, 0, 0, 0, 'eur', 'paid',
      case when coalesce((v_event->>'cancelled')::boolean, false)
        then 'cancelled'::public.reservation_status else 'confirmed'::public.reservation_status end,
      p_provider::public.reservation_source, p_provider, v_uid, v_uid, p_synced_at,
      case when v_primary_id is not null then 'conflict' else 'synced' end
    )
    on conflict (provider, ical_uid) where ical_uid is not null do update set
      check_in = excluded.check_in, check_out = excluded.check_out,
      nights = excluded.nights, status = excluded.status,
      external_id = excluded.external_id, last_sync = excluded.last_sync,
      sync_status = excluded.sync_status, updated_at = p_synced_at
    returning id into v_reservation_id;

    if v_existed then v_updated := v_updated + 1; else v_imported := v_imported + 1; end if;

    insert into public.calendar_blocks(provider, external_id, ical_uid, start_date, end_date, summary, status, last_sync)
    values (
      p_provider, v_uid, v_uid, v_start, v_end,
      coalesce(nullif(v_event->>'summary', ''), 'Indisponible'),
      case when coalesce((v_event->>'cancelled')::boolean, false) then 'cancelled' else 'confirmed' end,
      p_synced_at
    )
    on conflict (provider, ical_uid) do update set
      external_id = excluded.external_id, start_date = excluded.start_date,
      end_date = excluded.end_date, summary = excluded.summary,
      status = excluded.status, last_sync = excluded.last_sync;

    delete from public.calendar_missing_observations
    where provider = p_provider and ical_uid = v_uid;

    if v_primary_id is not null and not coalesce((v_event->>'cancelled')::boolean, false) then
      insert into public.calendar_conflicts(
        primary_reservation_id, conflicting_reservation_id, provider, start_date, end_date, status
      ) values (v_primary_id, v_reservation_id, p_provider, v_start, v_end, 'open')
      on conflict (provider, start_date, end_date) where status = 'open' do nothing;
      if found then v_conflicts := v_conflicts + 1; end if;
    end if;
  end loop;

  if v_missing > 0 then
    insert into public.calendar_missing_observations(
      provider, ical_uid, consecutive_count, suspicious, first_missing_at, last_missing_at
    )
    select p_provider, active_uids.ical_uid,
      case when v_suspicious then 0 else 1 end,
      v_suspicious, p_synced_at, p_synced_at
    from (
      select ical_uid from public.reservations
      where provider = p_provider and ical_uid is not null and status <> 'cancelled'
      union
      select ical_uid from public.calendar_blocks
      where provider = p_provider and ical_uid is not null and status in ('confirmed','blocked')
    ) active_uids
    where not exists (
      select 1 from jsonb_array_elements(p_events) event where event->>'uid' = active_uids.ical_uid
    )
    on conflict (provider, ical_uid) do update set
      consecutive_count = case
        when excluded.suspicious then public.calendar_missing_observations.consecutive_count
        else public.calendar_missing_observations.consecutive_count + 1 end,
      suspicious = excluded.suspicious,
      last_missing_at = excluded.last_missing_at;
  end if;

  if v_suspicious then
    v_protected := v_missing;
    v_decision := 'suspicious_snapshot_protected';
  elsif v_missing > 0 then
    with confirmed_missing as (
      select ical_uid from public.calendar_missing_observations
      where provider = p_provider and consecutive_count >= 2 and not suspicious
    ), cancelled as (
      update public.reservations r
      set status = 'cancelled', sync_status = 'cancelled', last_sync = p_synced_at, updated_at = p_synced_at
      where r.provider = p_provider and r.status <> 'cancelled'
        and r.ical_uid in (select ical_uid from confirmed_missing)
      returning r.ical_uid
    ) select count(*) into v_cancelled from cancelled;

    update public.calendar_blocks b
    set status = 'cancelled', last_sync = p_synced_at
    where b.provider = p_provider and b.status in ('confirmed','blocked')
      and b.ical_uid in (
        select ical_uid from public.calendar_missing_observations
        where provider = p_provider and consecutive_count >= 2 and not suspicious
      );

    delete from public.calendar_missing_observations
    where provider = p_provider and consecutive_count >= 2 and not suspicious;
    v_protected := case when v_cancelled = 0 then v_missing else 0 end;
    v_decision := case when v_cancelled > 0 then 'confirmed_absence_reconciled' else 'absence_confirmation_pending' end;
  end if;

  update public.calendar_sources
  set status = 'ok', last_sync = p_synced_at,
      last_successful_sync = case when v_suspicious then last_successful_sync else p_synced_at end,
      last_error = case when v_suspicious then 'ICAL_SUSPICIOUS_SNAPSHOT_PROTECTED' else null end,
      imported_count = jsonb_array_length(p_events), suspicious_snapshot = v_suspicious,
      reconciliation_blocked = v_suspicious or v_protected > 0,
      protected_count = v_protected, previous_active_count = v_previous_active,
      missing_count = v_missing, missing_percentage = v_missing_percentage,
      updated_at = p_synced_at
  where provider = p_provider;

  return jsonb_build_object(
    'imported', v_imported, 'updated', v_updated, 'cancelled', v_cancelled,
    'conflicts', v_conflicts, 'previousActive', v_previous_active,
    'missing', v_missing, 'missingPercentage', v_missing_percentage,
    'protected', v_protected, 'suspicious', v_suspicious, 'decision', v_decision
  );
end
$$;

revoke all on function public.sync_external_calendar(text, jsonb, timestamptz)
  from public, anon, authenticated;
grant execute on function public.sync_external_calendar(text, jsonb, timestamptz)
  to service_role;

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
    or exists(select 1 from public.calendar_blocks where provider in ('booking','airbnb') and status in ('confirmed','blocked') and start_date < p_check_out and end_date > p_check_in)
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
