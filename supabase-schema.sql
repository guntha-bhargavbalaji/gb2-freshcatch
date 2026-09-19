-- GB² FreshCatch production database for Supabase
-- Run this entire file in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Fish','Prawns','Crabs','Chicken','Mutton','Eggs')),
  price numeric(10,2) not null check (price >= 0),
  unit text not null default 'per kg',
  image_url text,
  emoji text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.admin_users enable row level security;

-- Public customers can only see active products.
drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products"
on public.products for select
to anon, authenticated
using (active = true);

-- Admins can view all products.
drop policy if exists "Admins can view all products" on public.products;
create policy "Admins can view all products"
on public.products for select
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Admins can insert/update/delete products.
drop policy if exists "Admins can insert products" on public.products;
create policy "Admins can insert products"
on public.products for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can update products" on public.products;
create policy "Admins can update products"
on public.products for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()))
with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

drop policy if exists "Admins can delete products" on public.products;
create policy "Admins can delete products"
on public.products for delete
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Do NOT make admin_users publicly readable.
-- The admin page's query of admin_users is controlled by this policy.
drop policy if exists "Admins can see their own admin record" on public.admin_users;
create policy "Admins can see their own admin record"
on public.admin_users for select
to authenticated
using (user_id = auth.uid());

-- Starter products
insert into public.products (name,category,price,unit,emoji,description)
select * from (values
 ('Freshwater Pond Fish','Fish',450,'per kg','🐟','Fresh pond fish for Sunday delivery.'),
 ('Fresh Prawns','Prawns',650,'per kg','🦐','Fresh prawns, cleaned on request.'),
 ('Fresh Crabs','Crabs',600,'per kg','🦀','Fresh crabs for your weekend meal.'),
 ('Chicken','Chicken',280,'per kg','🍗','Fresh chicken for Sunday delivery.'),
 ('Mutton','Mutton',750,'per kg','🥩','Fresh mutton, prepared to order.'),
 ('Farm Eggs','Eggs',8,'per egg','🥚','Fresh eggs.')
) as v(name,category,price,unit,emoji,description)
where not exists (select 1 from public.products);

-- IMPORTANT:
-- After creating your admin user in Supabase Authentication, run:
-- insert into public.admin_users(user_id) values ('YOUR_AUTH_USER_UUID');
