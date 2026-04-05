-- ───────────────────────────────────────────────────────────────────────
-- Msgly — Supabase schema
--
-- Run this in Supabase SQL Editor once per project. Safe to re-run; every
-- statement uses IF NOT EXISTS / OR REPLACE where possible.
-- ───────────────────────────────────────────────────────────────────────

-- Extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ─── profiles ──────────────────────────────────────────────────────────
-- One row per auth.users row. Stores plan + Stripe linkage.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'pro_annual')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  subscription_status text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_stripe_customer_id_idx
  on public.profiles(stripe_customer_id);

-- ─── conversions ───────────────────────────────────────────────────────
-- One row per file a user successfully (or unsuccessfully) converted.
create table if not exists public.conversions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_filename text not null,
  output_filename text not null,
  file_size_bytes bigint not null,
  pdf_size_bytes bigint,
  status text not null default 'completed'
    check (status in ('completed', 'failed')),
  error text,
  storage_path text,
  created_at timestamptz not null default now()
);

-- This composite index already makes the monthly-usage query fast:
-- `where user_id = ? and created_at >= <month_start>` is a range scan
-- against the trailing column, which is exactly what a B-tree on
-- (user_id, created_at desc) supports.
create index if not exists conversions_user_created_idx
  on public.conversions(user_id, created_at desc);

-- ─── Row Level Security ────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.conversions enable row level security;

-- profiles: a user can only see and update their own row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- conversions: a user can only read their own rows. Inserts happen server-
-- side with the service role, so no insert policy is needed for clients.
drop policy if exists "conversions_select_own" on public.conversions;
create policy "conversions_select_own" on public.conversions
  for select using (auth.uid() = user_id);

-- ─── Trigger: create a profile row automatically on signup ─────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Helper: current-month usage ───────────────────────────────────────
-- Uses UTC boundaries so month rollovers are predictable across regions.
create or replace function public.get_monthly_usage(p_user_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.conversions
  where user_id = p_user_id
    and status = 'completed'
    and created_at >= date_trunc('month', (now() at time zone 'utc'));
$$;

grant execute on function public.get_monthly_usage(uuid) to authenticated;

-- ─── Storage: conversion PDFs (Pro history) ────────────────────────────
-- Create a private bucket so Pro users can re-download past PDFs.
insert into storage.buckets (id, name, public)
values ('conversions', 'conversions', false)
on conflict (id) do nothing;

-- Users can read their own PDFs (path prefix = their user id).
drop policy if exists "conversions_storage_read_own" on storage.objects;
create policy "conversions_storage_read_own" on storage.objects
  for select
  using (
    bucket_id = 'conversions'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
