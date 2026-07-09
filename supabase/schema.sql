-- Casa Leite — schema do banco
-- Cole este arquivo inteiro no SQL Editor do Supabase (Dashboard > SQL Editor > New query) e clique em Run.
-- Pode rodar de uma vez só, é seguro rodar de novo (idempotente onde possível).

-- ============================================================
-- EXTENSÕES
-- ============================================================
create extension if not exists "pgcrypto";

-- ============================================================
-- TABELAS
-- ============================================================

create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  color text not null default '#d4af6a',
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('expense', 'income')),
  fixed boolean not null default false,
  color text not null default '#d4af6a',
  icon text not null default 'circle',
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid not null references categories(id) on delete restrict,
  person_id uuid references household_members(id) on delete set null,
  kind text not null check (kind in ('expense', 'income')),
  amount numeric(12, 2) not null check (amount > 0),
  occurred_on date not null,
  description text not null default '',
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  amount numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  unique (household_id, category_id, year, month)
);

create index if not exists idx_transactions_household_date on transactions (household_id, occurred_on desc);
create index if not exists idx_transactions_category on transactions (category_id);
create index if not exists idx_budgets_household_period on budgets (household_id, year, month);

-- ============================================================
-- FAMÍLIA LEITE — household único com id fixo
-- ============================================================

insert into households (id, name)
values ('00000000-0000-0000-0000-000000000001', 'Família Leite')
on conflict (id) do nothing;

-- Categorias padrão
insert into categories (household_id, name, kind, fixed, color, icon)
select '00000000-0000-0000-0000-000000000001', v.name, v.kind, v.fixed, v.color, v.icon
from (values
  ('Moradia',      'expense', true,  '#3987e5', 'home'),
  ('Mercado',      'expense', false, '#199e70', 'shopping-cart'),
  ('Transporte',   'expense', false, '#c98500', 'car'),
  ('Saúde',        'expense', true,  '#008300', 'heart-pulse'),
  ('Lazer',        'expense', false, '#9085e9', 'popcorn'),
  ('Educação',     'expense', true,  '#e66767', 'graduation-cap'),
  ('Compras',      'expense', false, '#d55181', 'shopping-bag'),
  ('Assinaturas',  'expense', true,  '#d95926', 'repeat'),
  ('Salário',      'income',  true,  '#3987e5', 'wallet'),
  ('Renda Extra',  'income',  false, '#199e70', 'trending-up')
) as v(name, kind, fixed, color, icon)
where not exists (
  select 1 from categories c
  where c.household_id = '00000000-0000-0000-0000-000000000001' and c.name = v.name
);

-- ============================================================
-- AUTO-CADASTRO: quando Walter ou Nat fazem login pela 1ª vez,
-- entram automaticamente na Família Leite. Ninguém precisa rodar SQL de novo.
-- ============================================================

create or replace function public.handle_new_family_member()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email in ('walter.bruno.leite@gmail.com', 'nleite23@gmail.com') then
    insert into public.household_members (household_id, user_id, email, display_name, color)
    values (
      '00000000-0000-0000-0000-000000000001',
      new.id,
      new.email,
      case when new.email = 'walter.bruno.leite@gmail.com' then 'Walter' else 'Nat' end,
      case when new.email = 'walter.bruno.leite@gmail.com' then '#d4af6a' else '#d55181' end
    )
    on conflict (user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_family_member();

-- ============================================================
-- SEGURANÇA (Row Level Security)
-- Cada pessoa só enxerga dados da própria família (Família Leite).
-- ============================================================

create or replace function public.current_household_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select household_id from household_members where user_id = auth.uid() limit 1;
$$;

alter table households enable row level security;
alter table household_members enable row level security;
alter table categories enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;

drop policy if exists "select own household" on households;
create policy "select own household" on households
  for select using (id = public.current_household_id());

drop policy if exists "select household members" on household_members;
create policy "select household members" on household_members
  for select using (household_id = public.current_household_id());

drop policy if exists "manage own categories" on categories;
create policy "manage own categories" on categories
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists "manage own transactions" on transactions;
create policy "manage own transactions" on transactions
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());

drop policy if exists "manage own budgets" on budgets;
create policy "manage own budgets" on budgets
  for all using (household_id = public.current_household_id())
  with check (household_id = public.current_household_id());
