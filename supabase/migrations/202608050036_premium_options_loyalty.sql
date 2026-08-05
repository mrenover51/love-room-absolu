insert into public.options(option_key,name,description,price,"order",active) values
  ('bouquet','Bouquet de fleurs','Une composition élégante préparée pour votre arrivée.',3500,7,true),
  ('gourmet-tray','Plateau gourmand','Une sélection sucrée et salée à partager.',2800,8,true),
  ('partner-massage','Massage partenaire','Une mise en relation avec un praticien partenaire.',8500,9,true)
on conflict (option_key) do update set name=excluded.name,description=excluded.description,price=excluded.price,active=excluded.active,"order"=excluded."order";

alter table public.gift_cards add column if not exists event_date date;
alter table public.customers add column if not exists loyalty_points integer not null default 0 check (loyalty_points >= 0);
alter table public.customers add column if not exists loyalty_tier text not null default 'member' check (loyalty_tier in ('member','privilege','signature'));
alter table public.customers add column if not exists birthday date;
