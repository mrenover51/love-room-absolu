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
begin
  if p_provider is null or p_provider not in ('booking', 'airbnb') then
    raise exception 'ICAL_PROVIDER_INVALID' using errcode = 'P0001';
  end if;
  if p_events is null or jsonb_typeof(p_events) <> 'array' then
    raise exception 'ICAL_EVENTS_INVALID' using errcode = 'P0001';
  end if;

  perform pg_advisory_xact_lock(hashtext('ical:' || p_provider));

  -- Valider le flux complet avant la moindre écriture. Toute exception
  -- interrompt l'appel RPC et conserve intégralement l'état précédent.
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

    if v_event ? 'cancelled'
      and jsonb_typeof(v_event->'cancelled') <> 'boolean' then
      raise exception 'ICAL_EVENT_CANCELLED_INVALID' using errcode = 'P0001';
    end if;

    if v_uid = any(v_seen_uids) then
      raise exception 'ICAL_EVENT_UID_DUPLICATE' using errcode = 'P0001';
    end if;
    v_seen_uids := array_append(v_seen_uids, v_uid);
  end loop;

  -- Un calendrier vide peut être valide, mais n'est jamais une preuve
  -- suffisante pour annuler les données importées lors d'un précédent flux.
  if jsonb_array_length(p_events) = 0 then
    update public.calendar_sources
    set status = 'ok', last_sync = p_synced_at,
        last_successful_sync = p_synced_at, last_error = null,
        imported_count = 0, updated_at = p_synced_at
    where provider = p_provider;

    return jsonb_build_object(
      'imported', 0, 'updated', 0,
      'cancelled', 0, 'conflicts', 0
    );
  end if;

  for v_event in select value from jsonb_array_elements(p_events)
  loop
    v_uid := btrim(v_event->>'uid');
    v_start := (v_event->>'start')::date;
    v_end := (v_event->>'end')::date;

    select exists(
      select 1 from public.reservations
      where provider = p_provider and ical_uid = v_uid
    ) into v_existed;

    select id into v_primary_id
    from public.reservations
    where provider <> p_provider
      and status in ('confirmed', 'pending_payment')
      and check_in < v_end
      and check_out > v_start
    order by created_at
    limit 1;

    insert into public.reservations(
      reference, check_in, check_out, nights, guest_first_name,
      guest_last_name, guest_email, guest_phone, guest_count,
      subtotal, extras_total, taxes, total, currency, payment_status,
      status, source, provider, external_id, ical_uid, last_sync, sync_status
    ) values (
      btrim(v_event->>'reference'), v_start,
      v_end,
      v_end - v_start,
      case when p_provider = 'booking' then 'Voyageur Booking' else 'Voyageur Airbnb' end,
      '(iCal)', btrim(v_event->>'email'), 'Non transmis', 2,
      0, 0, 0, 0, 'eur', 'paid',
      case when coalesce((v_event->>'cancelled')::boolean, false) then 'cancelled'::public.reservation_status else 'confirmed'::public.reservation_status end,
      p_provider::public.reservation_source, p_provider, v_uid,
      v_uid, p_synced_at,
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
      p_provider, v_uid, v_uid,
      v_start, v_end,
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
        v_start, v_end, 'open'
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
