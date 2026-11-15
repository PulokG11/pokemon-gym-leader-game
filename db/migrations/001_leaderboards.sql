-- Daily Challenge leaderboards with anonymous nicknames (Neon Postgres + Neon Data API).
--
-- Players have no account: registering a nickname returns a random secret token
-- that the game keeps in local storage; only its SHA-256 hash is stored.
-- Tables live in the private `gym` schema. The Data API exposes only the `api`
-- schema, which holds nothing but the functions below, callable by the
-- `anonymous` role at POST /rpc/<function>.
--
-- Setup order (see README): run this file, enable Neon Auth (Better Auth), then
-- enable the Data API with auth provider neon_auth, exposed schema `api` and
-- anonymous role `anonymous`. The Data API creates the `anonymous` role, so the
-- final GRANT block must run after it exists.

create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;

create schema gym;
create schema api;
revoke all on schema gym from public;

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table gym.players (
  id          uuid primary key default gen_random_uuid(),
  nickname    text not null,
  token_hash  bytea not null,
  created_at  timestamptz not null default now(),
  constraint players_nickname_format check (nickname ~ '^[A-Za-z0-9_]{3,16}$')
);
create unique index players_nickname_lower_key on gym.players (lower(nickname));

create table gym.daily_results (
  player_id   uuid not null references gym.players (id) on delete cascade,
  day         date not null,
  gym_type    text not null,
  wins        integer not null check (wins between 0 and 10000),
  finished    boolean not null default false,
  updated_at  timestamptz not null default now(),
  primary key (player_id, day)
);
create index daily_results_day_rank_idx on gym.daily_results (day, wins desc, updated_at);

-- ─── Private helpers ─────────────────────────────────────────────────────────

-- Same algorithm as dailyType() in src/lib/daily.ts: FNV-1a over 'type:YYYY-MM-DD', mod 18.
create function gym.daily_gym_type(p_day date)
returns text
language plpgsql
immutable
set search_path = ''
as $$
declare
  types constant text[] := array[
    'fire','water','grass','electric','ghost','dragon',
    'normal','ice','fighting','poison','ground','flying',
    'psychic','bug','rock','dark','steel','fairy'];
  key text := 'type:' || to_char(p_day, 'YYYY-MM-DD');
  h bigint := 2166136261;
  i int;
begin
  for i in 1..length(key) loop
    h := ((h # ascii(substr(key, i, 1))) * 16777619) % 4294967296;
  end loop;
  return types[(h % 18) + 1];
end;
$$;

create function gym.utc_today()
returns date
language sql
stable
set search_path = ''
as $$ select (now() at time zone 'utc')::date $$;

create function gym.verify_player(p_player_id uuid, p_token text)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from gym.players
    where id = p_player_id
      and token_hash = extensions.digest(coalesce(p_token, ''), 'sha256')
  )
$$;

create function gym.check_nickname(p_nickname text, p_except uuid)
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if p_nickname is null or p_nickname !~ '^[A-Za-z0-9_]{3,16}$' then
    raise exception 'nickname_invalid' using errcode = '22023';
  end if;
  if exists (
    select 1 from gym.players
    where lower(nickname) = lower(p_nickname) and id is distinct from p_except
  ) then
    raise exception 'nickname_taken' using errcode = '23505';
  end if;
end;
$$;

-- ─── API: players ────────────────────────────────────────────────────────────

create function api.register_player(p_nickname text)
returns table (player_id uuid, token text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
  v_id uuid;
begin
  perform gym.check_nickname(p_nickname, null);
  insert into gym.players (nickname, token_hash)
  values (p_nickname, extensions.digest(v_token, 'sha256'))
  returning id into v_id;
  return query select v_id, v_token;
end;
$$;

create function api.rename_player(p_player_id uuid, p_token text, p_nickname text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not gym.verify_player(p_player_id, p_token) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  perform gym.check_nickname(p_nickname, p_player_id);
  update gym.players set nickname = p_nickname where id = p_player_id;
end;
$$;

-- ─── API: daily results ──────────────────────────────────────────────────────

-- Wins only go up, a finished run is frozen, and only today's or yesterday's
-- (UTC) Daily can be submitted, so a run crossing midnight still counts.
create function api.submit_daily(
  p_player_id uuid, p_token text, p_day date, p_gym_type text, p_wins integer, p_finished boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not gym.verify_player(p_player_id, p_token) then
    raise exception 'not_authorized' using errcode = '42501';
  end if;
  if p_day is null or p_day < gym.utc_today() - 1 or p_day > gym.utc_today() then
    raise exception 'day_closed' using errcode = '22023';
  end if;
  if p_gym_type is distinct from gym.daily_gym_type(p_day) then
    raise exception 'wrong_gym_type' using errcode = '22023';
  end if;
  if p_wins is null or p_wins < 0 or p_wins > 10000 then
    raise exception 'wins_invalid' using errcode = '22023';
  end if;

  insert into gym.daily_results as r (player_id, day, gym_type, wins, finished)
  values (p_player_id, p_day, p_gym_type, p_wins, coalesce(p_finished, false))
  on conflict (player_id, day) do update
    set wins = greatest(r.wins, excluded.wins),
        finished = r.finished or excluded.finished,
        updated_at = case when excluded.wins > r.wins then now() else r.updated_at end
    where not r.finished;
end;
$$;

-- ─── API: leaderboards ───────────────────────────────────────────────────────

create function api.daily_leaderboard(p_day date, p_limit integer default 50)
returns table (rank bigint, nickname text, gym_type text, wins integer, finished boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select rank() over (order by r.wins desc), p.nickname, r.gym_type, r.wins, r.finished
  from gym.daily_results r
  join gym.players p on p.id = r.player_id
  where r.day = p_day
  order by r.wins desc, r.updated_at, p.nickname
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
$$;

-- Each player's best single Daily run across all days, with that day's Gym type.
create function api.alltime_leaderboard(p_limit integer default 50)
returns table (rank bigint, nickname text, gym_type text, wins integer, day date, days_played bigint)
language sql
stable
security definer
set search_path = ''
as $$
  with best as (
    select distinct on (r.player_id) r.player_id, r.gym_type, r.wins, r.day, r.updated_at
    from gym.daily_results r
    order by r.player_id, r.wins desc, r.day
  ),
  played as (
    select player_id, count(*) as days_played from gym.daily_results group by player_id
  )
  select rank() over (order by b.wins desc), p.nickname, b.gym_type, b.wins, b.day, pl.days_played
  from best b
  join gym.players p on p.id = b.player_id
  join played pl on pl.player_id = b.player_id
  order by b.wins desc, b.day, b.updated_at, p.nickname
  limit least(greatest(coalesce(p_limit, 50), 1), 100)
$$;

-- A player's own position, for when they are outside the top of the board.
create function api.daily_standing(p_day date, p_player_id uuid)
returns table (rank bigint, total bigint, wins integer)
language sql
stable
security definer
set search_path = ''
as $$
  select x.rank, x.total, x.wins
  from (
    select r.player_id, r.wins, rank() over (order by r.wins desc) as rank, count(*) over () as total
    from gym.daily_results r
    where r.day = p_day
  ) x
  where x.player_id = p_player_id
$$;

create function api.daily_gym_type(p_day date)
returns text
language sql
immutable
security definer
set search_path = ''
as $$ select gym.daily_gym_type(p_day) $$;

-- ─── Permissions ─────────────────────────────────────────────────────────────
-- `anonymous` can call the api functions and nothing else; it has no access to schema gym.
-- Run after the Data API is enabled (it creates the `anonymous` role).

revoke execute on all functions in schema api, gym from public;
grant usage on schema api to anonymous;
grant execute on all functions in schema api to anonymous;
