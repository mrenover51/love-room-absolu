-- The original inline constraint was auto-named reservations_check. After
-- total_amount became a generated alias of total, it incorrectly rejected
-- every reservation with a non-zero tourist tax.
alter table public.reservations
  drop constraint if exists reservations_check;

alter table public.reservations
  drop constraint if exists reservations_total_amount_check;

alter table public.reservations
  drop constraint if exists reservations_total_check;

alter table public.reservations
  add constraint reservations_total_check
  check (total = subtotal + extras_total + taxes);
