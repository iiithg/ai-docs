-- Promo codes table for discount management
-- This table stores promotional codes that customers can use for discounts

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text check (discount_type in ('percentage', 'fixed_amount')) default 'percentage',
  discount_value int not null check (discount_value > 0),
  min_order_cents int default 0 check (min_order_cents >= 0),
  max_discount_cents int,
  usage_limit int,
  used_count int default 0 check (used_count >= 0),
  is_active boolean default true,
  valid_from timestamptz default now(),
  valid_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint valid_date_range check (valid_until is null or valid_until > valid_from),
  constraint usage_limit_check check (usage_limit is null or usage_limit > 0),
  constraint max_discount_check check (max_discount_cents is null or max_discount_cents > 0)
);

-- Comments for documentation
comment on table public.promo_codes is 'Promotional codes for discounts and special offers';
comment on column public.promo_codes.id is 'Unique identifier for each promo code';
comment on column public.promo_codes.code is 'The actual promo code string (case-insensitive)';
comment on column public.promo_codes.description is 'Human-readable description of the promotion';
comment on column public.promo_codes.discount_type is 'Type of discount: percentage or fixed_amount';
comment on column public.promo_codes.discount_value is 'Discount value (percentage 1-100 or cents for fixed amount)';
comment on column public.promo_codes.min_order_cents is 'Minimum order amount in cents to use this code';
comment on column public.promo_codes.max_discount_cents is 'Maximum discount amount in cents (for percentage discounts)';
comment on column public.promo_codes.usage_limit is 'Maximum number of times this code can be used (null = unlimited)';
comment on column public.promo_codes.used_count is 'Number of times this code has been used';
comment on column public.promo_codes.is_active is 'Whether the promo code is currently active';
comment on column public.promo_codes.valid_from is 'Start date/time for code validity';
comment on column public.promo_codes.valid_until is 'End date/time for code validity (null = no expiry)';

-- Trigger to automatically update updated_at timestamp
create trigger update_promo_codes_updated_at
  before update on public.promo_codes
  for each row
  execute function update_updated_at_column();