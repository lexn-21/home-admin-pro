create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_subscriptions_user_id on public.subscriptions(user_id);
create index idx_subscriptions_stripe_id on public.subscriptions(stripe_subscription_id);

alter table public.subscriptions enable row level security;

create policy "users view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "service role manage subscriptions"
  on public.subscriptions for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create trigger update_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.update_updated_at_column();

-- Pro-Zugriff: aktives/Trial-Abo ODER 30-Tage-Trial seit Registrierung
create or replace function public.has_pro_access(_user_id uuid, _env text default 'sandbox')
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    -- aktives oder bezahltes/grace Abo
    exists (
      select 1 from public.subscriptions
      where user_id = _user_id
        and environment = _env
        and (
          (status in ('active','trialing','past_due') and (current_period_end is null or current_period_end > now()))
          or (status = 'canceled' and current_period_end > now())
        )
    )
    OR
    -- 30-Tage-Trial: profile.created_at + 30 Tage > now()
    exists (
      select 1 from public.profiles
      where user_id = _user_id
        and created_at > (now() - interval '30 days')
    );
$$;

-- Helper: Trial-Restzeit
create or replace function public.trial_days_left(_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select greatest(0, 30 - extract(day from (now() - created_at))::int)
  from public.profiles where user_id = _user_id;
$$;