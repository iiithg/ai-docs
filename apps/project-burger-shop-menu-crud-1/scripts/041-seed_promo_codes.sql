-- Seed data for promo codes
-- Insert sample promotional codes for testing

insert into public.promo_codes (code, description, discount_type, discount_value, min_order_cents, max_discount_cents, usage_limit, is_active, valid_from, valid_until)
values
  -- Active percentage discounts
  ('WELCOME10', '新用户10%折扣', 'percentage', 10, 500, 1000, 100, true, now(), now() + interval '30 days'),
  ('SAVE20', '满50元享8折优惠', 'percentage', 20, 5000, 2000, null, true, now(), now() + interval '60 days'),
  ('STUDENT15', '学生专享85折', 'percentage', 15, 1000, 1500, 200, true, now(), now() + interval '90 days'),
  
  -- Active fixed amount discounts
  ('FIRST5', '首单立减5元', 'fixed_amount', 500, 2000, null, 50, true, now(), now() + interval '14 days'),
  ('SAVE10', '满30元减10元', 'fixed_amount', 1000, 3000, null, null, true, now(), now() + interval '45 days'),
  ('LUNCH3', '午餐时光减3元', 'fixed_amount', 300, 1500, null, 100, true, now(), now() + interval '7 days'),
  
  -- Inactive codes (for testing status toggle)
  ('EXPIRED', '已过期优惠码', 'percentage', 25, 1000, 2000, null, false, now() - interval '30 days', now() - interval '1 day'),
  ('DISABLED', '已禁用优惠码', 'fixed_amount', 800, 2000, null, 50, false, now(), now() + interval '30 days'),
  
  -- Limited usage codes
  ('FLASH50', '限时5折优惠', 'percentage', 50, 2000, 3000, 10, true, now(), now() + interval '3 days'),
  ('VIP20', 'VIP专享8折', 'percentage', 20, 5000, 5000, 5, true, now(), now() + interval '365 days')
on conflict do nothing;