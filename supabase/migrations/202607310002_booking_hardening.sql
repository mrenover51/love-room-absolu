-- Sérialise toutes les créations afin que deux plages qui se chevauchent
-- mais n'ont pas les mêmes bornes ne puissent pas être validées en parallèle.
create or replace function public.create_pending_reservation(
  p_reference text, p_check_in date, p_check_out date, p_first_name text, p_last_name text,
  p_email text, p_phone text, p_guest_count integer, p_message text, p_base_amount integer,
  p_extras_amount integer, p_total_amount integer, p_expires_at timestamptz, p_extras jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid; v_extra jsonb;
begin
  perform pg_advisory_xact_lock(hashtext('absolu_reservations'));
  if exists(select 1 from public.blocked_dates where start_date < p_check_out and end_date > p_check_in)
    or exists(select 1 from public.reservations where check_in < p_check_out and check_out > p_check_in and
      (status = 'confirmed' or (status = 'pending_payment' and payment_expires_at > now()))) then
    raise exception 'DATES_UNAVAILABLE' using errcode = 'P0001';
  end if;
  insert into public.reservations(reference,check_in,check_out,nights,guest_first_name,guest_last_name,guest_email,guest_phone,guest_count,message,base_amount,extras_amount,total_amount,payment_expires_at)
  values(p_reference,p_check_in,p_check_out,p_check_out-p_check_in,p_first_name,p_last_name,lower(p_email),p_phone,p_guest_count,p_message,p_base_amount,p_extras_amount,p_total_amount,p_expires_at) returning id into v_id;
  for v_extra in select * from jsonb_array_elements(p_extras) loop
    insert into public.reservation_extras(reservation_id,extra_key,label,quantity,unit_amount,total_amount)
    values(v_id,v_extra->>'key',v_extra->>'label',(v_extra->>'quantity')::integer,(v_extra->>'unitAmount')::integer,(v_extra->>'totalAmount')::integer);
  end loop;
  return v_id;
end $$;
revoke all on function public.create_pending_reservation from public, anon, authenticated;
grant execute on function public.create_pending_reservation to service_role;
grant execute on function public.confirm_reservation to service_role;

insert into public.pricing_settings(key,value) values
 ('base_price','{"amount":22000,"currency":"eur"}'),
 ('friday_supplement','{"amount":3000}'),
 ('saturday_supplement','{"amount":5000}'),
 ('service_fee','{"amount":0}'),
 ('maximum_nights','{"value":14}'),
 ('pending_expiration_minutes','{"value":30}'),
 ('options','[{"key":"romantic-decoration","label":"Décoration romantique","amount":4500,"enabled":true},{"key":"champagne","label":"Bouteille de champagne","amount":5500,"enabled":true},{"key":"petals","label":"Pétales","amount":2500,"enabled":true},{"key":"late-checkout","label":"Départ tardif","amount":3500,"enabled":true},{"key":"early-checkin","label":"Arrivée anticipée","amount":3500,"enabled":true}]')
on conflict (key) do update set value=excluded.value, updated_at=now();
