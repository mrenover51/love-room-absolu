-- Separate technical iCal unavailability from customer reservations while
-- preserving every existing block and all fail-closed reconciliation rules.
-- Existing reservations, blocks and conflicts are intentionally left untouched.

alter table public.calendar_blocks
  add column if not exists object_kind text not null default 'legacy_unknown'
    check (object_kind in ('legacy_unknown','technical_block','reservation'));

alter table public.calendar_conflicts
  add column if not exists object_a_key text,
  add column if not exists object_b_key text,
  add column if not exists conflict_kind text not null default 'legacy_unclassified'
    check (conflict_kind in ('legacy_unclassified','reservation_conflict')),
  add column if not exists resolution_kind text
    check (resolution_kind in ('resolved','technical_duplicate','channel_mirror')),
  add constraint calendar_conflicts_canonical_pair_order
    check (
      (object_a_key is null and object_b_key is null)
      or (object_a_key is not null and object_b_key is not null and object_a_key < object_b_key)
    );

create unique index if not exists calendar_conflicts_canonical_pair_idx
  on public.calendar_conflicts(object_a_key, object_b_key)
  where object_a_key is not null and object_b_key is not null;

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
  v_summary text;
  v_kind text;
  v_seen_uids text[] := array[]::text[];
  v_reservation_id uuid;
  v_primary_id uuid;
  v_primary_provider text;
  v_primary_uid text;
  v_primary_start date;
  v_primary_end date;
  v_current_key text;
  v_primary_key text;
  v_object_a text;
  v_object_b text;
  v_existed boolean;
  v_imported integer := 0;
  v_updated integer := 0;
  v_cancelled integer := 0;
  v_conflicts integer := 0;
  v_previous_active integer := 0;
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
    if v_event ? 'kind' and v_event->>'kind' not in ('block','reservation') then
      raise exception 'ICAL_EVENT_KIND_INVALID' using errcode = 'P0001';
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
    set status = 'ok', last_sync = p_synced_at, imported_count = 0,
        suspicious_snapshot = true, reconciliation_blocked = true,
        protected_count = v_previous_active, previous_active_count = v_previous_active,
        missing_count = v_previous_active,
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
  v_suspicious := v_missing > 1
    or (v_missing > 0 and v_missing * 2 >= v_previous_active);

  for v_event in select value from jsonb_array_elements(p_events)
  loop
    v_uid := btrim(v_event->>'uid');
    v_start := (v_event->>'start')::date;
    v_end := (v_event->>'end')::date;
    v_summary := coalesce(nullif(btrim(v_event->>'summary'), ''), 'Indisponible');
    -- SQL remains authoritative even if an older application omitted kind.
    v_kind := case
      when lower(v_summary) ~ '(^|[^[:alnum:]])(closed[[:space:]-]*[-:]?[[:space:]]*)?not[[:space:]]+available([^[:alnum:]]|$)'
        then 'block'
      else coalesce(v_event->>'kind', 'reservation')
    end;

    insert into public.calendar_blocks(
      provider, external_id, ical_uid, start_date, end_date, summary,
      status, last_sync, object_kind
    ) values (
      p_provider, v_uid, v_uid, v_start, v_end, v_summary,
      case when coalesce((v_event->>'cancelled')::boolean, false) then 'cancelled' else 'confirmed' end,
      p_synced_at,
      case when v_kind = 'block' then 'technical_block' else 'reservation' end
    )
    on conflict (provider, ical_uid) do update set
      external_id = excluded.external_id, start_date = excluded.start_date,
      end_date = excluded.end_date, summary = excluded.summary,
      status = excluded.status, last_sync = excluded.last_sync,
      object_kind = excluded.object_kind;

    delete from public.calendar_missing_observations
    where provider = p_provider and ical_uid = v_uid;

    -- A technical closure blocks availability through calendar_blocks only.
    -- Any reservation created by an older migration is deliberately untouched.
    if v_kind = 'reservation' then
      select exists(
        select 1 from public.reservations
        where provider = p_provider and ical_uid = v_uid
      ) into v_existed;

      insert into public.reservations(
        reference, check_in, check_out, nights, guest_first_name,
        guest_last_name, guest_email, guest_phone, guest_count,
        subtotal, extras_total, taxes, total, currency, payment_status,
        status, source, provider, external_id, ical_uid, last_sync, sync_status
      ) values (
        btrim(v_event->>'reference'), v_start, v_end, v_end - v_start,
        case when p_provider = 'booking' then 'Voyageur Booking' else 'Voyageur Airbnb' end,
        '(iCal)', btrim(v_event->>'email'), 'Non transmis', 2,
        0, 0, 0, 0, 'eur', 'paid',
        case when coalesce((v_event->>'cancelled')::boolean, false)
          then 'cancelled'::public.reservation_status else 'confirmed'::public.reservation_status end,
        p_provider::public.reservation_source, p_provider, v_uid, v_uid,
        p_synced_at, 'synced'
      )
      on conflict (provider, ical_uid) where ical_uid is not null do update set
        check_in = excluded.check_in, check_out = excluded.check_out,
        nights = excluded.nights, status = excluded.status,
        external_id = excluded.external_id, last_sync = excluded.last_sync,
        sync_status = excluded.sync_status, updated_at = p_synced_at
      returning id into v_reservation_id;

      if v_existed then v_updated := v_updated + 1;
      else v_imported := v_imported + 1;
      end if;

      if not coalesce((v_event->>'cancelled')::boolean, false) then
        select r.id, r.provider, r.ical_uid, r.check_in, r.check_out
        into v_primary_id, v_primary_provider, v_primary_uid, v_primary_start, v_primary_end
        from public.reservations r
        where r.id <> v_reservation_id
          and r.provider <> p_provider
          and r.status in ('confirmed','pending_payment')
          and r.check_in < v_end and r.check_out > v_start
          and (
            r.provider in ('site','manual')
            or exists (
              select 1 from public.calendar_blocks evidence
              where evidence.provider = r.provider
                and evidence.ical_uid = r.ical_uid
                and evidence.object_kind = 'reservation'
            )
          )
        order by r.created_at
        limit 1;

        if v_primary_id is not null then
          v_current_key := 'reservation:' || p_provider || ':' || v_uid;
          v_primary_key := case
            when v_primary_provider in ('site','manual') or v_primary_uid is null
              then 'reservation:' || v_primary_provider || ':' || v_primary_id::text
            else 'reservation:' || v_primary_provider || ':' || v_primary_uid
          end;
          v_object_a := least(v_current_key, v_primary_key);
          v_object_b := greatest(v_current_key, v_primary_key);

          insert into public.calendar_conflicts(
            primary_reservation_id, conflicting_reservation_id, provider,
            start_date, end_date, status, object_a_key, object_b_key, conflict_kind
          ) values (
            v_primary_id, v_reservation_id, p_provider,
            greatest(v_primary_start, v_start), least(v_primary_end, v_end),
            'open', v_object_a, v_object_b, 'reservation_conflict'
          )
          on conflict (object_a_key, object_b_key)
            where object_a_key is not null and object_b_key is not null
          do update set
            primary_reservation_id = excluded.primary_reservation_id,
            conflicting_reservation_id = excluded.conflicting_reservation_id,
            start_date = excluded.start_date,
            end_date = excluded.end_date
          where public.calendar_conflicts.status = 'open';

          if found then
            v_conflicts := v_conflicts + 1;
            update public.reservations set sync_status = 'conflict'
            where id = v_reservation_id;
          end if;
        end if;
      end if;
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
      select 1 from jsonb_array_elements(p_events) event
      where event->>'uid' = active_uids.ical_uid
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
      set status = 'cancelled', sync_status = 'cancelled',
          last_sync = p_synced_at, updated_at = p_synced_at
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
    v_decision := case when v_cancelled > 0
      then 'confirmed_absence_reconciled' else 'absence_confirmation_pending' end;
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
