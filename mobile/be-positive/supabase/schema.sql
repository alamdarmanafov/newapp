-- Run this once in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- Tracks how many AI-chat messages each user has sent per day, to enforce
-- the daily free-message limit from the client.

create table if not exists public.chat_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  count integer not null default 0,
  primary key (user_id, date)
);

alter table public.chat_usage enable row level security;

create policy "Users can read their own usage"
  on public.chat_usage for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own usage"
  on public.chat_usage for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own usage"
  on public.chat_usage for update
  using (auth.uid() = user_id);

-- Expo push tokens, one row per user (a fresh sign-in on a new device
-- overwrites the previous token). Used by the daily-notification function
-- to send AI-written reminder pushes.

create table if not exists public.push_tokens (
  user_id uuid primary key references auth.users (id) on delete cascade,
  token text not null,
  name text,
  language text not null default 'az',
  updated_at timestamptz not null default now()
);

-- If push_tokens already existed from an earlier version of this schema,
-- run this to add the new columns:
-- alter table public.push_tokens add column if not exists name text;
-- alter table public.push_tokens add column if not exists language text not null default 'az';

alter table public.push_tokens enable row level security;

create policy "Users can read their own push token"
  on public.push_tokens for select
  using (auth.uid() = user_id);

create policy "Users can upsert their own push token"
  on public.push_tokens for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own push token"
  on public.push_tokens for update
  using (auth.uid() = user_id);

create policy "Users can delete their own push token"
  on public.push_tokens for delete
  using (auth.uid() = user_id);

-- The daily-notification Edge Function reads all tokens using the
-- service role key, which bypasses RLS.

-- "Xəritə" tab: anonymous, aggregate-only place-mood check-ins ("how do
-- people feel here?"). Users can insert their own check-ins, but can never
-- select raw rows -- only the place_mood_aggregates() function below can
-- read the table (it runs as security definer), and it only ever returns
-- grouped buckets with at least 3 contributors, never individual rows,
-- timestamps, or user ids. This is deliberately separate from journal
-- entries, which stay device-only and are never uploaded.

create table if not exists public.place_moods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  mood smallint not null check (mood between 0 and 4),
  category text not null default 'other' check (category in ('gym', 'restaurant', 'cafe', 'work', 'park', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists place_moods_lat_lng_idx on public.place_moods (lat, lng);
create index if not exists place_moods_category_idx on public.place_moods (category);

alter table public.place_moods enable row level security;

create policy "Users can add their own place check-ins"
  on public.place_moods for insert
  with check (auth.uid() = user_id);

-- A user can read back their own check-ins (used for their personal
-- "best place" stat in Profile) but never anyone else's -- other users'
-- data is only ever visible in already-anonymous aggregate form, via the
-- function below.
create policy "Users can read their own place check-ins"
  on public.place_moods for select
  using (auth.uid() = user_id);

create or replace function public.place_mood_aggregates(
  min_lat double precision,
  max_lat double precision,
  min_lng double precision,
  max_lng double precision,
  p_category text default null
)
returns table (grid_lat double precision, grid_lng double precision, avg_mood double precision, entry_count bigint)
language sql
security definer
set search_path = public
as $$
  select
    round(lat::numeric, 3)::double precision as grid_lat,
    round(lng::numeric, 3)::double precision as grid_lng,
    avg(mood)::double precision as avg_mood,
    count(*) as entry_count
  from public.place_moods
  where lat between min_lat and max_lat
    and lng between min_lng and max_lng
    and (p_category is null or category = p_category)
  group by grid_lat, grid_lng
  having count(*) >= 3
$$;

grant execute on function public.place_mood_aggregates to authenticated;
