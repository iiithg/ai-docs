-- Seed data for promo codes
-- Insert sample promotional codes for testing

insert into public.promo_codes (code, description, discount_type, discount_value, min_order_cents, max_discount_cents, usage_limit, is_active, valid_from, valid_until)
values
  -- Active percentage discounts
  ('WELCOME10', 'New user 10% discount', 'percentage', 10, 500, 1000, 100, true, now(), now() + interval '30 days'),
  ('SAVE20', 'Save 20% on orders over 50 yuan', 'percentage', 20, 5000, 2000, null, true, now(), now() + interval '60 days'),
  ('STUDENT15', 'Student exclusive 15% discount', 'percentage', 15, 1000, 1500, 200, true, now(), now() + interval '90 days'),

  -- Active fixed amount discounts
  ('FIRST5', '5 yuan off first order', 'fixed_amount', 500, 2000, null, 50, true, now(), now() + interval '14 days'),
  ('SAVE10', '10 yuan off orders over 30 yuan', 'fixed_amount', 1000, 3000, null, null, true, now(), now() + interval '45 days'),
  ('LUNCH3', '3 yuan off lunch time orders', 'fixed_amount', 300, 1500, null, 100, true, now(), now() + interval '7 days'),

  -- Inactive codes (for testing status toggle)
  ('EXPIRED', 'Expired promo code', 'percentage', 25, 1000, 2000, null, false, now() - interval '30 days', now() - interval '1 day'),
  ('DISABLED', 'Disabled promo code', 'fixed_amount', 800, 2000, null, 50, false, now(), now() + interval '30 days'),

  -- Limited usage codes
  ('FLASH50', 'Limited time 50% off', 'percentage', 50, 2000, 3000, 10, true, now(), now() + interval '3 days'),
  ('VIP20', 'VIP exclusive 20% discount', 'percentage', 20, 5000, 5000, 5, true, now(), now() + interval '365 days')
on conflict do nothing;