BEGIN;

SELECT pg_advisory_xact_lock(hashtext('ical:booking'));

CREATE TEMPORARY TABLE approved_booking_restore (
  ical_uid text PRIMARY KEY,
  check_in date NOT NULL,
  check_out date NOT NULL
) ON COMMIT DROP;

INSERT INTO approved_booking_restore (ical_uid, check_in, check_out)
VALUES
  ('577b133aa1415e710ff556b3ef5ab4da@booking.com', DATE '2026-08-09', DATE '2026-08-12'),
  ('b101843cabdbab88ca83c21ed10bb710@booking.com', DATE '2026-08-10', DATE '2026-08-12'),
  ('f0e3a462014eb26359fb0e3ffb267b0c@booking.com', DATE '2026-08-16', DATE '2026-08-17'),
  ('058c7507c26d34d6de7aa996f2d22791@booking.com', DATE '2026-08-20', DATE '2026-08-21'),
  ('214ff80e3763fa5fd2aaacc0bc1e361f@booking.com', DATE '2026-08-28', DATE '2026-08-30'),
  ('dc9685cec0d72df10bcc12e66d448e96@booking.com', DATE '2026-09-05', DATE '2026-09-07'),
  ('4dd0848158f7e193b1001ba1c92d6766@booking.com', DATE '2026-12-11', DATE '2026-12-12'),
  ('891068f1f4e1ba8ad5e234f06366a6d3@booking.com', DATE '2028-02-08', DATE '2028-02-09');

SELECT r.id
FROM public.reservations r
JOIN approved_booking_restore a
  ON a.ical_uid = r.ical_uid
 AND a.check_in = r.check_in
 AND a.check_out = r.check_out
WHERE r.provider = 'booking'
  AND r.status = 'cancelled'
  AND r.sync_status = 'cancelled'
FOR UPDATE;

SELECT b.id
FROM public.calendar_blocks b
JOIN approved_booking_restore a
  ON a.ical_uid = b.ical_uid
 AND a.check_in = b.start_date
 AND a.check_out = b.end_date
WHERE b.provider = 'booking'
  AND b.status = 'cancelled'
FOR UPDATE;

DO $$
DECLARE
  v_approved_count integer;
  v_reservation_count integer;
  v_block_count integer;
BEGIN
  SELECT count(*) INTO v_approved_count
  FROM approved_booking_restore;

  IF v_approved_count <> 8 THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: expected 8 approved UIDs, found %', v_approved_count;
  END IF;

  SELECT count(*) INTO v_reservation_count
  FROM approved_booking_restore a
  JOIN public.reservations r
    ON r.provider = 'booking'
   AND r.ical_uid = a.ical_uid
   AND r.check_in = a.check_in
   AND r.check_out = a.check_out
   AND r.status = 'cancelled'
   AND r.sync_status = 'cancelled';

  IF v_reservation_count <> 8 THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: expected 8 exact cancelled reservations, found %', v_reservation_count;
  END IF;

  SELECT count(*) INTO v_block_count
  FROM approved_booking_restore a
  JOIN public.calendar_blocks b
    ON b.provider = 'booking'
   AND b.ical_uid = a.ical_uid
   AND b.start_date = a.check_in
   AND b.end_date = a.check_out
   AND b.status = 'cancelled';

  IF v_block_count <> 8 THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: expected 8 exact cancelled calendar_blocks, found %', v_block_count;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM approved_booking_restore a
    WHERE (
      SELECT count(*)
      FROM public.reservations r
      WHERE r.provider = 'booking'
        AND r.ical_uid = a.ical_uid
        AND r.check_in = a.check_in
        AND r.check_out = a.check_out
        AND r.status = 'cancelled'
        AND r.sync_status = 'cancelled'
    ) <> 1
  ) THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: ambiguous or invalid reservation match';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM approved_booking_restore a
    WHERE (
      SELECT count(*)
      FROM public.calendar_blocks b
      WHERE b.provider = 'booking'
        AND b.ical_uid = a.ical_uid
        AND b.start_date = a.check_in
        AND b.end_date = a.check_out
        AND b.status = 'cancelled'
    ) <> 1
  ) THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: ambiguous or invalid calendar_block match';
  END IF;
END
$$;

DO $$
DECLARE
  v_updated_reservations integer;
  v_updated_blocks integer;
BEGIN
  UPDATE public.reservations r
  SET
    status = 'confirmed',
    sync_status = 'synced',
    updated_at = now()
  FROM approved_booking_restore a
  WHERE r.provider = 'booking'
    AND r.ical_uid = a.ical_uid
    AND r.check_in = a.check_in
    AND r.check_out = a.check_out
    AND r.status = 'cancelled'
    AND r.sync_status = 'cancelled';

  GET DIAGNOSTICS v_updated_reservations = ROW_COUNT;

  IF v_updated_reservations <> 8 THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: expected to update 8 reservations, updated %', v_updated_reservations;
  END IF;

  UPDATE public.calendar_blocks b
  SET status = 'confirmed'
  FROM approved_booking_restore a
  WHERE b.provider = 'booking'
    AND b.ical_uid = a.ical_uid
    AND b.start_date = a.check_in
    AND b.end_date = a.check_out
    AND b.status = 'cancelled';

  GET DIAGNOSTICS v_updated_blocks = ROW_COUNT;

  IF v_updated_blocks <> 8 THEN
    RAISE EXCEPTION 'BOOKING_RESTORE_ABORTED: expected to update 8 calendar_blocks, updated %', v_updated_blocks;
  END IF;
END
$$;

COMMIT;

WITH approved (ical_uid, check_in, check_out) AS (
  VALUES
    ('577b133aa1415e710ff556b3ef5ab4da@booking.com', DATE '2026-08-09', DATE '2026-08-12'),
    ('b101843cabdbab88ca83c21ed10bb710@booking.com', DATE '2026-08-10', DATE '2026-08-12'),
    ('f0e3a462014eb26359fb0e3ffb267b0c@booking.com', DATE '2026-08-16', DATE '2026-08-17'),
    ('058c7507c26d34d6de7aa996f2d22791@booking.com', DATE '2026-08-20', DATE '2026-08-21'),
    ('214ff80e3763fa5fd2aaacc0bc1e361f@booking.com', DATE '2026-08-28', DATE '2026-08-30'),
    ('dc9685cec0d72df10bcc12e66d448e96@booking.com', DATE '2026-09-05', DATE '2026-09-07'),
    ('4dd0848158f7e193b1001ba1c92d6766@booking.com', DATE '2026-12-11', DATE '2026-12-12'),
    ('891068f1f4e1ba8ad5e234f06366a6d3@booking.com', DATE '2028-02-08', DATE '2028-02-09')
)
SELECT
  r.check_in,
  r.check_out,
  left(r.ical_uid, 6)
    || '…'
    || right(split_part(r.ical_uid, '@', 1), 4)
    || '@'
    || split_part(r.ical_uid, '@', 2) AS masked_ical_uid,
  r.provider,
  r.status AS reservation_status,
  r.sync_status,
  b.status AS calendar_block_status,
  b.start_date AS block_start_date,
  b.end_date AS block_end_date
FROM approved a
JOIN public.reservations r
  ON r.provider = 'booking'
 AND r.ical_uid = a.ical_uid
 AND r.check_in = a.check_in
 AND r.check_out = a.check_out
JOIN public.calendar_blocks b
  ON b.provider = 'booking'
 AND b.ical_uid = a.ical_uid
 AND b.start_date = a.check_in
 AND b.end_date = a.check_out
ORDER BY r.check_in, r.check_out;

WITH approved (ical_uid, check_in, check_out) AS (
  VALUES
    ('577b133aa1415e710ff556b3ef5ab4da@booking.com', DATE '2026-08-09', DATE '2026-08-12'),
    ('b101843cabdbab88ca83c21ed10bb710@booking.com', DATE '2026-08-10', DATE '2026-08-12'),
    ('f0e3a462014eb26359fb0e3ffb267b0c@booking.com', DATE '2026-08-16', DATE '2026-08-17'),
    ('058c7507c26d34d6de7aa996f2d22791@booking.com', DATE '2026-08-20', DATE '2026-08-21'),
    ('214ff80e3763fa5fd2aaacc0bc1e361f@booking.com', DATE '2026-08-28', DATE '2026-08-30'),
    ('dc9685cec0d72df10bcc12e66d448e96@booking.com', DATE '2026-09-05', DATE '2026-09-07'),
    ('4dd0848158f7e193b1001ba1c92d6766@booking.com', DATE '2026-12-11', DATE '2026-12-12'),
    ('891068f1f4e1ba8ad5e234f06366a6d3@booking.com', DATE '2028-02-08', DATE '2028-02-09')
)
SELECT
  count(*) FILTER (WHERE r.status = 'confirmed') AS reservations_confirmed,
  count(*) FILTER (
    WHERE r.status = 'confirmed'
      AND r.sync_status = 'synced'
  ) AS reservations_synced,
  count(*) FILTER (WHERE b.status = 'confirmed') AS blocks_confirmed
FROM approved a
JOIN public.reservations r
  ON r.provider = 'booking'
 AND r.ical_uid = a.ical_uid
 AND r.check_in = a.check_in
 AND r.check_out = a.check_out
JOIN public.calendar_blocks b
  ON b.provider = 'booking'
 AND b.ical_uid = a.ical_uid
 AND b.start_date = a.check_in
 AND b.end_date = a.check_out;
