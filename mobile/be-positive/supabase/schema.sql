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
