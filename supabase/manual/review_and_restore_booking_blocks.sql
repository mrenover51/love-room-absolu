-- REVIEW ONLY BY DEFAULT. This file is not a migration and must not be run blindly.
-- 1. Review every candidate and retain only UIDs confirmed as still occupied in Booking.
select r.id, r.ical_uid, r.check_in, r.check_out, r.status, r.sync_status,
       b.id as block_id, b.status as block_status
from public.reservations r
left join public.calendar_blocks b
  on b.provider = r.provider and b.ical_uid = r.ical_uid
where r.provider = 'booking'
  and r.status = 'cancelled'
order by r.check_in;

-- 2. After external verification, copy approved UIDs into the VALUES list below,
-- uncomment the transaction, inspect the RETURNING rows, and replace ROLLBACK by
-- COMMIT only after explicit approval.
-- begin;
-- create temporary table approved_booking_uids(ical_uid text primary key) on commit drop;
-- insert into approved_booking_uids(ical_uid) values
--   ('REPLACE_WITH_REVIEWED_UID');
-- update public.reservations r
-- set status = 'confirmed', sync_status = 'synced', updated_at = now()
-- where r.provider = 'booking' and r.status = 'cancelled'
--   and exists (select 1 from approved_booking_uids a where a.ical_uid = r.ical_uid)
-- returning r.id, r.ical_uid, r.check_in, r.check_out, r.status, r.sync_status;
-- update public.calendar_blocks b
-- set status = 'confirmed', last_sync = now()
-- where b.provider = 'booking' and b.status = 'cancelled'
--   and exists (select 1 from approved_booking_uids a where a.ical_uid = b.ical_uid)
-- returning b.id, b.ical_uid, b.start_date, b.end_date, b.status;
-- rollback;
