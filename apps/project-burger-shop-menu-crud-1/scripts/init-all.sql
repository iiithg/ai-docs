-- ============================================================================
-- Burger Shop Management System - One-time Initialization Script
-- ============================================================================
--
-- This script contains all necessary database initialization operations:
-- 1. Enable extensions
-- 2. Create table structures
-- 3. Disable RLS for development
-- 4. Insert seed data
--
-- Usage: Copy and paste this script in Supabase SQL Editor and execute
-- ============================================================================

-- ============================================================================
-- 1. Enable Required Extensions
-- ============================================================================

-- Enable UUID generation
create extension if not exists pgcrypto;

-- Enable case-insensitive text operations (optional, useful for search)
create extension if not exists citext;

-- ============================================================================
-- 2. Create Menu Items Table
-- ============================================================================

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text check (category in ('burger','side','drink')) default 'burger',
  price_cents int not null check (price_cents > 0),
  available boolean default true,
  emoji text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments for documentation
comment on table public.menu_items is 'Burger shop menu items for CRUD demo';
comment on column public.menu_items.id is 'Unique identifier for each menu item';
comment on column public.menu_items.name is 'Display name of the menu item';
comment on column public.menu_items.description is 'Detailed description of the menu item';
comment on column public.menu_items.category is 'Category: burger, side, or drink';
comment on column public.menu_items.price_cents is 'Price in cents (integer) to avoid floating point issues';
comment on column public.menu_items.available is 'Whether the item is currently available for order';
comment on column public.menu_items.emoji is 'Optional emoji representation of the menu item';
comment on column public.menu_items.created_at is 'Timestamp when the item was created';
comment on column public.menu_items.updated_at is 'Timestamp when the item was last updated';

-- Trigger to automatically update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_menu_items_updated_at
  before update on public.menu_items
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 3. Create Promo Codes Table
-- ============================================================================

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text check (discount_type in ('percentage', 'fixed_amount')) default 'percentage',
  discount_value int not null check (discount_value > 0),
  used_count int default 0 check (used_count >= 0),
  is_active boolean default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Comments for documentation
comment on table public.promo_codes is 'Promotional codes for discounts and special offers';
comment on column public.promo_codes.id is 'Unique identifier for each promo code';
comment on column public.promo_codes.code is 'The actual promo code string (case-insensitive)';
comment on column public.promo_codes.description is 'Human-readable description of the promotion';
comment on column public.promo_codes.discount_type is 'Type of discount: percentage or fixed_amount';
comment on column public.promo_codes.discount_value is 'Discount value (percentage points or cents)';
comment on column public.promo_codes.used_count is 'Number of times this code has been used';
comment on column public.promo_codes.is_active is 'Whether this promo code is currently active';

create trigger update_promo_codes_updated_at
  before update on public.promo_codes
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- 4. Disable RLS for Development
-- ============================================================================
-- WARNING: This allows unrestricted access to all data
-- Only use this during development and testing

-- Disable RLS on menu_items table
alter table public.menu_items disable row level security;

-- Disable RLS on promo_codes table  
alter table public.promo_codes disable row level security;

-- ============================================================================
-- 5. Insert Menu Items Seed Data
-- ============================================================================

insert into public.menu_items (name, description, category, price_cents, available, emoji)
values
  -- Burgers
  ('Classic Burger', 'Fresh beef patty with lettuce, tomato, onion and special sauce', 'burger', 799, true, '🍔'),
  ('Cheese Burger', 'Classic burger with double cheese slices', 'burger', 899, true, '🧀'),
  ('Bacon Burger', 'Classic burger with crispy bacon strips', 'burger', 999, true, '🥓'),
  ('Double Burger', 'Deluxe burger with double beef patties', 'burger', 1299, true, '🍔🍔'),
  ('Chicken Burger', 'Tender chicken breast with special spices', 'burger', 849, true, '🐔'),
  ('Veggie Burger', 'Plant-based patty with fresh vegetables', 'burger', 749, true, '🥬'),
  
  -- Sides
  ('French Fries', 'Golden crispy french fries', 'side', 349, true, '🍟'),
  ('Onion Rings', 'Crispy onion rings with dipping sauce', 'side', 399, true, '🧅'),
  ('Chicken Nuggets', '6 pieces of crispy chicken nuggets', 'side', 449, true, '🍗'),
  ('Garden Salad', 'Fresh vegetable salad with dressing', 'side', 299, true, '🥗'),
  ('Cheese Fries', 'French fries with melted cheese sauce', 'side', 449, true, '🧀🍟'),
  
  -- Drinks
  ('Coca Cola', 'Classic Coca Cola', 'drink', 199, true, '🥤'),
  ('Sprite', 'Refreshing lemon-lime soda', 'drink', 199, true, '🍋'),
  ('Orange Juice', '100% pure orange juice', 'drink', 249, true, '🍊'),
  ('Milkshake', 'Vanilla milkshake', 'drink', 399, true, '🥛'),
  ('Coffee', 'Freshly brewed americano', 'drink', 299, true, '☕'),
  ('Tea', 'Premium black tea', 'drink', 199, true, '🍵')
on conflict do nothing;

-- ============================================================================
-- 6. Insert Promo Codes Seed Data
-- ============================================================================

insert into public.promo_codes (code, description, discount_type, discount_value, is_active)
values
  -- Active percentage discounts
  ('WELCOME10', 'New customer 10% discount', 'percentage', 10, true),
  ('SAVE20', '20% off for orders', 'percentage', 20, true),
  ('STUDENT15', 'Student special 15% discount', 'percentage', 15, true),
  
  -- Active fixed amount discounts
  ('FIRST5', 'First order $5 off', 'fixed_amount', 500, true),
  ('SAVE10', '$10 off orders', 'fixed_amount', 1000, true),
  ('LUNCH3', 'Lunch time $3 off', 'fixed_amount', 300, true),
  
  -- Inactive codes (for testing status toggle)
  ('EXPIRED', 'Expired promo code', 'percentage', 25, false),
  ('DISABLED', 'Disabled promo code', 'fixed_amount', 800, false),
  
  -- Special offers
  ('WEEKEND30', 'Weekend special 30% off', 'percentage', 30, true),
  ('VIP50', 'VIP exclusive 50% off', 'percentage', 50, true)
on conflict do nothing;

-- ============================================================================
-- Initialization Complete!
-- ============================================================================
--
-- 🎉 Database initialization successful! Now you can:
--
-- 1. Configure Supabase environment variables in your app
-- 2. Start development server: npm run dev
-- 3. Visit http://localhost:3001 to see the burger shop management system
--
-- Table Overview:
-- • menu_items: 17 sample menu items
-- • promo_codes: 10 sample promo codes
--
-- ============================================================================