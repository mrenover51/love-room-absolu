create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(), reference text not null unique,
  theme text not null, amount integer not null check (amount in (150,250,350)),
  recipient_name text not null, sender_name text not null, purchaser_email text not null,
  message text not null, color text not null, status text not null default 'pending_payment'
    check (status in ('pending_payment','active','redeemed','expired','cancelled')),
  stripe_checkout_session text unique, stripe_payment_intent text,
  activated_at timestamptz, expires_at timestamptz, redeemed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.gift_cards enable row level security;
create index if not exists gift_cards_status_idx on public.gift_cards(status);
create index if not exists gift_cards_created_at_idx on public.gift_cards(created_at desc);
