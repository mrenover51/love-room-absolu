-- Horaires officiels réutilisés par l'administration et les documents générés.
insert into public.settings(key,value,updated_at)
values ('times','{"checkIn":"16:00","checkOut":"10:00"}',now())
on conflict(key) do update set value=excluded.value,updated_at=excluded.updated_at;
