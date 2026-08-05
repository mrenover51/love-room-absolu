alter table public.customers add column if not exists origin text not null default 'site';
alter table public.customers add column if not exists city text;
alter table public.customers add column if not exists country text;
alter table public.customers add column if not exists private_notes text;
alter table public.customers add column if not exists is_returning boolean not null default false;

update public.customers customer set
  origin=coalesce((select reservation.source::text from public.reservations reservation where lower(reservation.guest_email)=lower(customer.email) order by reservation.created_at asc limit 1),'site'),
  is_returning=(select count(*)>1 from public.reservations reservation where lower(reservation.guest_email)=lower(customer.email));

alter table public.audit_logs add column if not exists actor_email text;
alter table public.audit_logs add column if not exists user_agent text;

alter table public.email_logs drop constraint if exists email_logs_status_check;
alter table public.email_logs add constraint email_logs_status_check check(status in('sent','delivered','opened','replied','failed','bounced','skipped'));
alter table public.email_logs add column if not exists delivered_at timestamptz;
alter table public.email_logs add column if not exists opened_at timestamptz;
alter table public.email_logs add column if not exists replied_at timestamptz;
alter table public.email_logs add column if not exists last_event_at timestamptz;

create table if not exists public.reservation_history (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references public.reservations(id) on delete cascade,
  event text not null,
  previous_value text,
  new_value text,
  created_at timestamptz not null default now()
);
create index if not exists reservation_history_reservation_idx on public.reservation_history(reservation_id,created_at desc);
alter table public.reservation_history enable row level security;
create policy "admins read reservation history" on public.reservation_history for select to authenticated using(public.is_admin());

create or replace function public.track_reservation_history() returns trigger language plpgsql security definer set search_path='' as $$
begin
  if old.status is distinct from new.status then insert into public.reservation_history(reservation_id,event,previous_value,new_value) values(new.id,'status',old.status::text,new.status::text); end if;
  if old.payment_status is distinct from new.payment_status then insert into public.reservation_history(reservation_id,event,previous_value,new_value) values(new.id,'payment',old.payment_status::text,new.payment_status::text); end if;
  if old.check_in is distinct from new.check_in or old.check_out is distinct from new.check_out then insert into public.reservation_history(reservation_id,event,previous_value,new_value) values(new.id,'dates',old.check_in||' → '||old.check_out,new.check_in||' → '||new.check_out); end if;
  return new;
end $$;
drop trigger if exists reservations_history_trigger on public.reservations;
create trigger reservations_history_trigger after update on public.reservations for each row execute function public.track_reservation_history();

create or replace function public.refresh_customer_pms_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.customers(firstname,lastname,email,phone,last_reservation,origin,is_returning)
  values(new.guest_first_name,new.guest_last_name,lower(new.guest_email),new.guest_phone,new.created_at,new.source::text,false)
  on conflict(email) do update set firstname=excluded.firstname,lastname=excluded.lastname,phone=excluded.phone,last_reservation=greatest(public.customers.last_reservation,excluded.last_reservation),is_returning=true;
  update public.customers set is_returning=(select count(*)>1 from public.reservations where lower(guest_email)=lower(new.guest_email)) where lower(email)=lower(new.guest_email);
  return new;
end $$;
drop trigger if exists reservations_customer_profile_trigger on public.reservations;
create trigger reservations_customer_profile_trigger after insert on public.reservations for each row execute function public.refresh_customer_pms_profile();
