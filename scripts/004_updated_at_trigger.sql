-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for all tables
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
