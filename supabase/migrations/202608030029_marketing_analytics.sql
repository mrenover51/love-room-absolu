create table if not exists public.marketing_events (
  id bigint generated always as identity primary key,
  session_id uuid not null, event_name text not null check (event_name in ('page_view','scroll','click','cro_sticky_cta_click','cro_popup_open','cro_quote_requested','cro_quote_available','booking_dates_selected','booking_step_view','booking_promo_applied','begin_checkout','checkout_redirect','purchase')),
  path text not null, referrer_host text, channel text not null default 'direct',
  value numeric, scroll_depth smallint check (scroll_depth between 0 and 100),
  x_percent smallint check (x_percent between 0 and 100), y_percent smallint check (y_percent between 0 and 100),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);
alter table public.marketing_events enable row level security;
create index if not exists marketing_events_created_idx on public.marketing_events(created_at desc);
create index if not exists marketing_events_path_idx on public.marketing_events(path, event_name);
create index if not exists marketing_events_session_idx on public.marketing_events(session_id, created_at);
