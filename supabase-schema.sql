-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  full_name text,
  role text default 'customer' check (role in ('customer', 'business', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Businesses table
create table public.businesses (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  category text not null,
  location text not null,
  description text,
  image_url text,
  owner_id uuid references public.profiles(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Deals table
create table public.deals (
  id uuid default uuid_generate_v4() primary key,
  business_id uuid references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  original_price decimal(10,2) not null,
  deal_price decimal(10,2) not null,
  expiration_date timestamp with time zone not null,
  images text[] default '{}',
  included text[] default '{}',
  location text,
  rating decimal(3,1) default 0,
  total_available integer default 100,
  vouchers_sold integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Vouchers table
create table public.vouchers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  deal_id uuid references public.deals(id),
  qr_code text not null,
  status text default 'active' check (status in ('active', 'used', 'expired')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.deals enable row level security;
alter table public.vouchers enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Businesses policies
create policy "Businesses are viewable by everyone" on public.businesses for select using (true);
create policy "Business owners can insert" on public.businesses for insert with check (auth.uid() = owner_id);
create policy "Business owners can update" on public.businesses for update using (auth.uid() = owner_id);

-- Deals policies
create policy "Deals are viewable by everyone" on public.deals for select using (true);
create policy "Business owners can insert deals" on public.deals for insert with check (
  auth.uid() in (select owner_id from public.businesses where id = business_id)
);
create policy "Business owners can update their deals" on public.deals for update using (
  auth.uid() in (select owner_id from public.businesses where id = business_id)
);

-- Vouchers policies
create policy "Users can view own vouchers" on public.vouchers for select using (auth.uid() = user_id);
create policy "Authenticated users can create vouchers" on public.vouchers for insert with check (auth.uid() = user_id);
