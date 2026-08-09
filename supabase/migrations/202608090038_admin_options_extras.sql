-- Étend le catalogue d'options existant sans remplacer ni supprimer ses données.
alter table public.options
  add column if not exists image_url text,
  add column if not exists icon text,
  add column if not exists billing_type text not null default 'per_stay',
  add column if not exists available_weekdays smallint[] not null default array[0,1,2,3,4,5,6]::smallint[],
  add column if not exists max_quantity integer not null default 1,
  add column if not exists min_lead_days integer not null default 0,
  add column if not exists updated_at timestamptz not null default now();

alter table public.options drop constraint if exists options_billing_type_check;
alter table public.options add constraint options_billing_type_check
  check (billing_type in ('per_stay','per_night','per_person','per_person_per_night'));
alter table public.options drop constraint if exists options_max_quantity_check;
alter table public.options add constraint options_max_quantity_check
  check (max_quantity between 1 and 100);
alter table public.options drop constraint if exists options_min_lead_days_check;
alter table public.options add constraint options_min_lead_days_check
  check (min_lead_days between 0 and 365);
alter table public.options drop constraint if exists options_available_weekdays_check;
alter table public.options add constraint options_available_weekdays_check
  check (
    cardinality(available_weekdays) between 1 and 7
    and available_weekdays <@ array[0,1,2,3,4,5,6]::smallint[]
  );

create index if not exists options_public_order_idx
  on public.options(active, "order", name);

update public.options set min_lead_days = 1 where option_key = 'breakfast' and min_lead_days = 0;
update public.options set min_lead_days = 2 where option_key = 'bouquet' and min_lead_days = 0;
