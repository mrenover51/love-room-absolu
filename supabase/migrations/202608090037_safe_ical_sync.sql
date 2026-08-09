-- Une synchronisation iCal validée est appliquée dans une transaction unique.
-- Une exception annule toutes les écritures de réservations et de blocages.
alter table public.calendar_sources
  add column if not exists last_successful_sync timestamptz;

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
  v_reservation_id uuid;
  v_primary_id uuid;
  v_existed boolean;
  v_imported integer := 0;
  v_updated integer := 0;
  v_cancelled integer := 0;
  v_conflicts integer := 0;
begin
  if p_provider not in ('booking', 'airbnb') then
    raise exception 'ICAL_PROVIDER_INVALID' using errcode = 'P0001';
  end if;
  if jsonb_typeof(p_events) <> 'array' then
    raise exception 'ICAL_EVENTS_INVALID' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('ical:' || p_provider));

  for v_event in select value from jsonb_array_elements(p_events)
  loop
    if coalesce(v_event->>'uid', '') = ''
      or (v_event->>'end')::date <= (v_event->>'start')::date then
      raise exception 'ICAL_EVENT_INVALID' using errcode = 'P0001';
    end if;

    select exists(
      select 1 from public.reservations
      where provider = p_provider and ical_uid = v_event->>'uid'
    ) into v_existed;

    select id into v_primary_id
    from public.reservations
    where provider <> p_provider
      and status in ('confirmed', 'pending_payment')
      and check_in < (v_event->>'end')::date
      and check_out > (v_event->>'start')::date
    order by created_at
    limit 1;

    insert into public.reservations(
      reference, check_in, check_out, nights, guest_first_name,
      guest_last_name, guest_email, guest_phone, guest_count,
      subtotal, extras_total, taxes, total, currency, payment_status,
      status, source, provider, external_id, ical_uid, last_sync, sync_status
    ) values (
      v_event->>'reference', (v_event->>'start')::date,
      (v_event->>'end')::date,
      (v_event->>'end')::date - (v_event->>'start')::date,
      case when p_provider = 'booking' then 'Voyageur Booking' else 'Voyageur Airbnb' end,
      '(iCal)', v_event->>'email', 'Non transmis', 2,
      0, 0, 0, 0, 'eur', 'paid',
      case when coalesce((v_event->>'cancelled')::boolean, false) then 'cancelled'::public.reservation_status else 'confirmed'::public.reservation_status end,
      p_provider::public.reservation_source, p_provider, v_event->>'uid',
      v_event->>'uid', p_synced_at,
      case when v_primary_id is not null then 'conflict' else 'synced' end
    )
    on conflict (provider, ical_uid) where ical_uid is not null do update set
      check_in = excluded.check_in,
      check_out = excluded.check_out,
      nights = excluded.nights,
      status = excluded.status,
      external_id = excluded.external_id,
      last_sync = excluded.last_sync,
      sync_status = excluded.sync_status,
      updated_at = p_synced_at
    returning id into v_reservation_id;

    if v_existed then v_updated := v_updated + 1;
    else v_imported := v_imported + 1;
    end if;

    insert into public.calendar_blocks(
      provider, external_id, ical_uid, start_date, end_date, summary, status, last_sync
    ) values (
      p_provider, v_event->>'uid', v_event->>'uid',
      (v_event->>'start')::date, (v_event->>'end')::date,
      coalesce(nullif(v_event->>'summary', ''), 'Indisponible'),
      case when coalesce((v_event->>'cancelled')::boolean, false) then 'cancelled' else 'confirmed' end,
      p_synced_at
    )
    on conflict (provider, ical_uid) do update set
      external_id = excluded.external_id,
      start_date = excluded.start_date,
      end_date = excluded.end_date,
      summary = excluded.summary,
      status = excluded.status,
      last_sync = excluded.last_sync;

    if v_primary_id is not null
      and not coalesce((v_event->>'cancelled')::boolean, false) then
      insert into public.calendar_conflicts(
        primary_reservation_id, conflicting_reservation_id, provider,
        start_date, end_date, status
      ) values (
        v_primary_id, v_reservation_id, p_provider,
        (v_event->>'start')::date, (v_event->>'end')::date, 'open'
      ) on conflict (provider, start_date, end_date) where status = 'open'
        do nothing;
      if found then v_conflicts := v_conflicts + 1; end if;
    end if;
  end loop;

  with cancelled as (
    update public.reservations r
    set status = 'cancelled', sync_status = 'cancelled',
        last_sync = p_synced_at, updated_at = p_synced_at
    where r.provider = p_provider
      and r.ical_uid is not null
      and r.status <> 'cancelled'
      and not exists (
        select 1 from jsonb_array_elements(p_events) event
        where event->>'uid' = r.ical_uid
      )
    returning r.ical_uid
  )
  select count(*) into v_cancelled from cancelled;

  update public.calendar_blocks b
  set status = 'cancelled', last_sync = p_synced_at
  where b.provider = p_provider
    and b.status <> 'cancelled'
    and not exists (
      select 1 from jsonb_array_elements(p_events) event
      where event->>'uid' = b.ical_uid
    );

  update public.calendar_sources
  set status = 'ok', last_sync = p_synced_at,
      last_successful_sync = p_synced_at, last_error = null,
      imported_count = jsonb_array_length(p_events), updated_at = p_synced_at
  where provider = p_provider;

  return jsonb_build_object(
    'imported', v_imported, 'updated', v_updated,
    'cancelled', v_cancelled, 'conflicts', v_conflicts
  );
end
$$;

revoke all on function public.sync_external_calendar(text, jsonb, timestamptz)
  from public, anon, authenticated;
grant execute on function public.sync_external_calendar(text, jsonb, timestamptz)
  to service_role;
