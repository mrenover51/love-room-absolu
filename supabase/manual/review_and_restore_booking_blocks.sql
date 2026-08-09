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

-- 2. Transaction prepared on 2026-08-09 for the eight short Booking periods
-- explicitly approved by the owner. It remains fully commented and unexecuted.
-- Every write is constrained by provider + UID + exact dates + cancelled status.
-- begin;
-- create temporary table approved_booking_uids(
--   ical_uid text primary key,
--   check_in date not null,
--   check_out date not null
-- ) on commit drop;
-- insert into approved_booking_uids(ical_uid, check_in, check_out) values
--   ('577b133aa1415e710ff556b3ef5ab4da@booking.com', '2026-08-09', '2026-08-12'),
--   ('b101843cabdbab88ca83c21ed10bb710@booking.com', '2026-08-10', '2026-08-12'),
--   ('f0e3a462014eb26359fb0e3ffb267b0c@booking.com', '2026-08-16', '2026-08-17'),
--   ('058c7507c26d34d6de7aa996f2d22791@booking.com', '2026-08-20', '2026-08-21'),
--   ('214ff80e3763fa5fd2aaacc0bc1e361f@booking.com', '2026-08-28', '2026-08-30'),
--   ('dc9685cec0d72df10bcc12e66d448e96@booking.com', '2026-09-05', '2026-09-07'),
--   ('4dd0848158f7e193b1001ba1c92d6766@booking.com', '2026-12-11', '2026-12-12'),
--   ('891068f1f4e1ba8ad5e234f06366a6d3@booking.com', '2028-02-08', '2028-02-09');
-- do $$
-- begin
--   if (select count(*) from public.reservations r join approved_booking_uids a
--       on a.ical_uid = r.ical_uid and a.check_in = r.check_in and a.check_out = r.check_out
--       where r.provider = 'booking' and r.status = 'cancelled' and r.sync_status = 'cancelled') <> 8
--     or (select count(*) from public.calendar_blocks b join approved_booking_uids a
--       on a.ical_uid = b.ical_uid and a.check_in = b.start_date and a.check_out = b.end_date
--       where b.provider = 'booking' and b.status = 'cancelled') <> 8 then
--     raise exception 'BOOKING_RESTORE_PRECONDITION_FAILED';
--   end if;
-- end $$;
-- update public.reservations r
-- set status = 'confirmed', sync_status = 'synced', updated_at = now()
-- from approved_booking_uids a
-- where r.provider = 'booking' and r.status = 'cancelled' and r.sync_status = 'cancelled'
--   and r.ical_uid = a.ical_uid and r.check_in = a.check_in and r.check_out = a.check_out
-- returning r.id, r.ical_uid, r.check_in, r.check_out, r.status, r.sync_status;
-- update public.calendar_blocks b
-- set status = 'confirmed', last_sync = now()
-- from approved_booking_uids a
-- where b.provider = 'booking' and b.status = 'cancelled'
--   and b.ical_uid = a.ical_uid and b.start_date = a.check_in and b.end_date = a.check_out
-- returning b.id, b.ical_uid, b.start_date, b.end_date, b.status;
-- -- Keep ROLLBACK until the owner explicitly authorizes the write.
-- rollback;
