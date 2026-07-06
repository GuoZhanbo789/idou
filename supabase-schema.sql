create extension if not exists pgcrypto;

create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null default '现货',
  price numeric not null default 0,
  status text not null default '整理中',
  note text not null default '',
  image_url text not null default '',
  palette jsonb not null default '[]'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null default '现货',
  price numeric not null default 0,
  cost numeric not null default 0,
  stock integer not null default 0,
  status text not null default '编辑中',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.products add column if not exists sort_order integer not null default 0;

create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  number text not null default '',
  name text not null,
  code text not null default '#b98d43',
  stock integer not null default 0,
  min integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.colors add column if not exists number text not null default '';

create table if not exists public.ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  name text not null,
  amount numeric not null default 0,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.consumptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  color_id uuid,
  color_name text not null,
  amount integer not null default 0,
  date date not null default current_date,
  project text not null default '',
  created_at timestamptz not null default now()
);

alter table public.works enable row level security;
alter table public.products enable row level security;
alter table public.colors enable row level security;
alter table public.ledger enable row level security;
alter table public.consumptions enable row level security;

drop policy if exists "works select own" on public.works;
drop policy if exists "works insert own" on public.works;
drop policy if exists "works update own" on public.works;
drop policy if exists "works delete own" on public.works;
create policy "works select own" on public.works for select using (auth.uid() = user_id);
create policy "works insert own" on public.works for insert with check (auth.uid() = user_id);
create policy "works update own" on public.works for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "works delete own" on public.works for delete using (auth.uid() = user_id);

drop policy if exists "products select own" on public.products;
drop policy if exists "products insert own" on public.products;
drop policy if exists "products update own" on public.products;
drop policy if exists "products delete own" on public.products;
create policy "products select own" on public.products for select using (auth.uid() = user_id);
create policy "products insert own" on public.products for insert with check (auth.uid() = user_id);
create policy "products update own" on public.products for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "products delete own" on public.products for delete using (auth.uid() = user_id);

drop policy if exists "colors select own" on public.colors;
drop policy if exists "colors insert own" on public.colors;
drop policy if exists "colors update own" on public.colors;
drop policy if exists "colors delete own" on public.colors;
create policy "colors select own" on public.colors for select using (auth.uid() = user_id);
create policy "colors insert own" on public.colors for insert with check (auth.uid() = user_id);
create policy "colors update own" on public.colors for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "colors delete own" on public.colors for delete using (auth.uid() = user_id);

drop policy if exists "ledger select own" on public.ledger;
drop policy if exists "ledger insert own" on public.ledger;
drop policy if exists "ledger update own" on public.ledger;
drop policy if exists "ledger delete own" on public.ledger;
create policy "ledger select own" on public.ledger for select using (auth.uid() = user_id);
create policy "ledger insert own" on public.ledger for insert with check (auth.uid() = user_id);
create policy "ledger update own" on public.ledger for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ledger delete own" on public.ledger for delete using (auth.uid() = user_id);

drop policy if exists "consumptions select own" on public.consumptions;
drop policy if exists "consumptions insert own" on public.consumptions;
drop policy if exists "consumptions update own" on public.consumptions;
drop policy if exists "consumptions delete own" on public.consumptions;
create policy "consumptions select own" on public.consumptions for select using (auth.uid() = user_id);
create policy "consumptions insert own" on public.consumptions for insert with check (auth.uid() = user_id);
create policy "consumptions update own" on public.consumptions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "consumptions delete own" on public.consumptions for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('work-images', 'work-images', true)
on conflict (id) do nothing;

drop policy if exists "work images public read" on storage.objects;
create policy "work images public read"
on storage.objects for select
using (bucket_id = 'work-images');

drop policy if exists "work images upload own folder" on storage.objects;
create policy "work images upload own folder"
on storage.objects for insert
with check (bucket_id = 'work-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "work images update own folder" on storage.objects;
create policy "work images update own folder"
on storage.objects for update
using (bucket_id = 'work-images' and auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'work-images' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "work images delete own folder" on storage.objects;
create policy "work images delete own folder"
on storage.objects for delete
using (bucket_id = 'work-images' and auth.uid()::text = (storage.foldername(name))[1]);

notify pgrst, 'reload schema';
