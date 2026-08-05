alter table public.seasonal_prices
  add column if not exists season text not null default 'medium'
    check (season in ('low', 'medium', 'high'));

create index if not exists seasonal_prices_season_dates_idx
  on public.seasonal_prices (season, start_date, end_date);
