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
