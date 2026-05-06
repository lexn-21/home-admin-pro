-- 1. user_stats: Streak, Level, Pseudonym
create table public.user_stats (
  user_id uuid primary key,
  pseudonym text unique,
  level int not null default 1,
  points int not null default 0,
  weekly_streak int not null default 0,
  last_active_week date,
  total_wins int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_stats enable row level security;

create policy "user_stats own all" on public.user_stats
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_stats public read pseudonym" on public.user_stats
  for select using (true);

-- 2. community_wins
create type public.win_kind as enum (
  'tax_saved','receipts_added','nka_done','listing_published','tenant_added','milestone','tip'
);

create table public.community_wins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  kind public.win_kind not null,
  amount_eur numeric,
  zip_prefix text,
  city text,
  message text,
  reactions_count int not null default 0,
  created_at timestamptz not null default now()
);

create index community_wins_recent_idx on public.community_wins(created_at desc);

alter table public.community_wins enable row level security;

create policy "wins public read" on public.community_wins for select using (true);

create policy "wins owner delete" on public.community_wins
  for delete using (auth.uid() = user_id);

-- Posten nur wenn verifiziert (≥ 1 Objekt)
create or replace function public.can_post_wins(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.properties where user_id = _user_id);
$$;

create policy "wins verified insert" on public.community_wins
  for insert with check (
    auth.uid() = user_id
    and public.can_post_wins(auth.uid())
    and (message is null or length(message) <= 280)
  );

-- 3. win_reactions (nur Applaus, einmalig pro User/Win)
create table public.win_reactions (
  win_id uuid not null references public.community_wins(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (win_id, user_id)
);

alter table public.win_reactions enable row level security;

create policy "reactions public read" on public.win_reactions for select using (true);
create policy "reactions own insert" on public.win_reactions
  for insert with check (auth.uid() = user_id);
create policy "reactions own delete" on public.win_reactions
  for delete using (auth.uid() = user_id);

-- Trigger: reactions_count
create or replace function public.bump_win_reactions()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.community_wins set reactions_count = reactions_count + 1 where id = new.win_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.community_wins set reactions_count = greatest(0, reactions_count - 1) where id = old.win_id;
    return old;
  end if;
  return null;
end $$;

create trigger trg_bump_reactions
after insert or delete on public.win_reactions
for each row execute function public.bump_win_reactions();

-- 4. market_pulse (von uns kuratiert / cron-befüllt)
create table public.market_pulse (
  id uuid primary key default gen_random_uuid(),
  week_start date not null,
  city text,
  zip_prefix text,
  metric text not null,
  value numeric not null,
  delta_pct numeric,
  caption text,
  created_at timestamptz not null default now()
);

alter table public.market_pulse enable row level security;
create policy "pulse public read" on public.market_pulse for select using (true);

-- 5. RPC: weekly streak/level update + win logging
create or replace function public.record_user_activity(_kind text, _amount numeric default null, _message text default null, _zip text default null, _city text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  _uid uuid := auth.uid();
  _now date := current_date;
  _wk date := date_trunc('week', _now)::date;
  _last_wk date;
  _streak int;
  _points int;
  _level int;
  _win_id uuid;
begin
  if _uid is null then raise exception 'auth required'; end if;

  -- upsert stats
  insert into public.user_stats(user_id) values (_uid) on conflict do nothing;
  select last_active_week, weekly_streak, points, level
    into _last_wk, _streak, _points, _level
    from public.user_stats where user_id = _uid;

  if _last_wk is null or _last_wk < _wk - interval '7 days' then
    _streak := 1;
  elsif _last_wk < _wk then
    _streak := _streak + 1;
  end if;

  _points := _points + case _kind
    when 'tax_saved' then 50
    when 'receipts_added' then 5
    when 'nka_done' then 30
    when 'listing_published' then 20
    when 'tenant_added' then 10
    when 'milestone' then 25
    when 'tip' then 15
    else 5 end;

  _level := least(5, 1 + (_points / 200));

  update public.user_stats
    set last_active_week = _wk,
        weekly_streak = _streak,
        points = _points,
        level = _level,
        total_wins = total_wins + (case when _kind in ('tax_saved','nka_done','listing_published','milestone','tip') then 1 else 0 end),
        updated_at = now()
    where user_id = _uid;

  -- optional: post a community win for "post-worthy" kinds
  if _kind in ('tax_saved','nka_done','listing_published','milestone','tip')
     and public.can_post_wins(_uid) then
    insert into public.community_wins(user_id, kind, amount_eur, zip_prefix, city, message)
      values (_uid, _kind::public.win_kind, _amount, left(coalesce(_zip,''),2), _city, _message)
      returning id into _win_id;
  end if;

  return _win_id;
end $$;

-- 6. updated_at trigger reuse (already exists in project? if not, create idempotently)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create trigger trg_user_stats_updated_at
before update on public.user_stats
for each row execute function public.set_updated_at();