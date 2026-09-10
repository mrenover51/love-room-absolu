-- Recheck availability atomically at payment confirmation while excluding the reservation itself.
create or replace function public.confirm_reservation(p_reservation_id uuid,p_session_id text,p_payment_intent_id text)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_reservation public.reservations%rowtype; v_conflict record;
begin
  perform pg_advisory_xact_lock(hashtext('absolu_reservations'));
  select * into v_reservation from public.reservations where id=p_reservation_id for update;
  if not found or v_reservation.status <> 'pending_payment' then return false; end if;
  select 'reservation'::text source,check_in start_date,check_out end_date into v_conflict from public.reservations
  where id<>p_reservation_id and check_in<v_reservation.check_out and check_out>v_reservation.check_in
    and (status='confirmed' or (status='pending_payment' and payment_expires_at>now())) limit 1;
  if found then raise exception 'DATES_UNAVAILABLE|%|%|%',v_conflict.source,v_conflict.start_date,v_conflict.end_date using errcode='P0001'; end if;
  select source::text,start_date,end_date into v_conflict from public.blocked_dates
  where start_date<v_reservation.check_out and end_date>v_reservation.check_in
    and not(source='direct' and external_uid=p_reservation_id::text) limit 1;
  if found then raise exception 'DATES_UNAVAILABLE|%|%|%',v_conflict.source,v_conflict.start_date,v_conflict.end_date using errcode='P0001'; end if;
  select provider,start_date,end_date into v_conflict from public.calendar_blocks
  where provider in('booking','airbnb') and status in('confirmed','blocked')
    and start_date<v_reservation.check_out and end_date>v_reservation.check_in limit 1;
  if found then raise exception 'DATES_UNAVAILABLE|%|%|%',v_conflict.provider,v_conflict.start_date,v_conflict.end_date using errcode='P0001'; end if;
  update public.reservations set status='confirmed',payment_status='paid',stripe_checkout_session=p_session_id,
    stripe_payment_intent=p_payment_intent_id,confirmed_at=coalesce(confirmed_at,now()),updated_at=now()
  where id=p_reservation_id and status='pending_payment';
  if found then insert into public.blocked_dates(start_date,end_date,source,external_uid,reason)
    values(v_reservation.check_in,v_reservation.check_out,'direct',p_reservation_id::text,'Réservation directe')
    on conflict(source,external_uid) do nothing; end if;
  return found;
end $$;
revoke all on function public.confirm_reservation(uuid,text,text) from public,anon,authenticated;
grant execute on function public.confirm_reservation(uuid,text,text) to service_role;
