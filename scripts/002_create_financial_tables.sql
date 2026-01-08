-- Transactions table
create table if not exists public.transactions (
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

-- Financial goals table
create table if not exists public.financial_goals (
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

-- Cards table
create table if not exists public.cards (
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

-- Enable RLS on all tables
alter table public.transactions enable row level security;
alter table public.financial_goals enable row level security;
alter table public.cards enable row level security;

-- RLS Policies for transactions
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

-- RLS Policies for financial_goals
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

-- RLS Policies for cards
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

-- Create indexes for better performance
create index if not exists transactions_user_id_idx on public.transactions(user_id);
create index if not exists transactions_date_idx on public.transactions(date);
create index if not exists financial_goals_user_id_idx on public.financial_goals(user_id);
create index if not exists cards_user_id_idx on public.cards(user_id);
