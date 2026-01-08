-- ========================================
-- JEVV - Complete Database Setup
-- ========================================
-- Execute this entire script in Supabase SQL Editor
-- This will create all tables, triggers, and policies

-- Drop existing objects if they exist (for clean setup)
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists handle_profiles_updated_at on public.profiles;
drop trigger if exists handle_transactions_updated_at on public.transactions;
drop trigger if exists handle_financial_goals_updated_at on public.financial_goals;
drop trigger if exists handle_cards_updated_at on public.cards;
drop function if exists public.handle_new_user();
drop function if exists public.handle_updated_at();
drop table if exists public.cards;
drop table if exists public.financial_goals;
drop table if exists public.transactions;
drop table if exists public.profiles;

-- ========================================
-- 1. PROFILES TABLE
-- ========================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  avatar_url text,
  phone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ========================================
-- 2. TRANSACTIONS TABLE
-- ========================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  amount decimal(12, 2) not null,
  category text not null,
  description text,
  date timestamp with time zone not null default now(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions"
  on public.transactions for update
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

create index transactions_user_id_idx on public.transactions(user_id);
create index transactions_date_idx on public.transactions(date);

-- ========================================
-- 3. FINANCIAL GOALS TABLE
-- ========================================
create table public.financial_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount decimal(12, 2) not null,
  current_amount decimal(12, 2) default 0,
  deadline timestamp with time zone,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.financial_goals enable row level security;

create policy "Users can view their own goals"
  on public.financial_goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.financial_goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.financial_goals for update
  using (auth.uid() = user_id);

create policy "Users can delete their own goals"
  on public.financial_goals for delete
  using (auth.uid() = user_id);

create index financial_goals_user_id_idx on public.financial_goals(user_id);

-- ========================================
-- 4. CARDS TABLE
-- ========================================
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  card_name text not null,
  card_number text not null,
  card_type text not null check (card_type in ('credit', 'debit')),
  balance decimal(12, 2) default 0,
  limit_amount decimal(12, 2),
  expiry_date text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.cards enable row level security;

create policy "Users can view their own cards"
  on public.cards for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cards"
  on public.cards for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cards"
  on public.cards for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cards"
  on public.cards for delete
  using (auth.uid() = user_id);

create index cards_user_id_idx on public.cards(user_id);

-- ========================================
-- 5. FUNCTIONS
-- ========================================

-- Function to auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Function to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ========================================
-- 6. TRIGGERS
-- ========================================

-- Trigger to auto-create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Triggers for updated_at
create trigger handle_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger handle_transactions_updated_at
  before update on public.transactions
  for each row
  execute function public.handle_updated_at();

create trigger handle_financial_goals_updated_at
  before update on public.financial_goals
  for each row
  execute function public.handle_updated_at();

create trigger handle_cards_updated_at
  before update on public.cards
  for each row
  execute function public.handle_updated_at();

-- ========================================
-- SETUP COMPLETE
-- ========================================
-- Your database is now ready!
-- Next steps:
-- 1. Configure your .env.local with Supabase credentials
-- 2. Enable Google OAuth in Supabase Auth settings
-- 3. Start your app with: npm run dev
