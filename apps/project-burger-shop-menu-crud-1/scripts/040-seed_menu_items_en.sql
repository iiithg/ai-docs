-- Seed data for menu items (English version)
-- Insert sample burger shop menu items for testing

insert into public.menu_items (name, description, category, price_cents, available, image_url)
values
  -- Burgers
  ('Classic Burger', 'Fresh beef patty with lettuce, tomato, onion and special sauce', 'burger', 799, true, null),
  ('Cheeseburger', 'Classic burger with double cheese slices', 'burger', 899, true, null),
  ('Bacon Burger', 'Classic burger with crispy bacon', 'burger', 999, true, null),
  ('Double Burger', 'Deluxe burger with double beef patties', 'burger', 1299, true, null),
  ('Chicken Burger', 'Tender chicken breast with special spices', 'burger', 849, true, null),
  ('Veggie Burger', 'Plant-based patty with fresh vegetables', 'burger', 749, true, null),

  -- Sides
  ('French Fries', 'Golden crispy fried potatoes', 'side', 349, true, null),
  ('Onion Rings', 'Crispy onion rings with dipping sauce', 'side', 399, true, null),
  ('Chicken Nuggets', '6 pieces of crispy chicken nuggets', 'side', 449, true, null),
  ('Garden Salad', 'Fresh vegetable salad with dressing', 'side', 299, true, null),
  ('Cheese Fries', 'French fries with melted cheese sauce', 'side', 449, true, null),

  -- Drinks
  ('Coca Cola', 'Classic Coca Cola', 'drink', 199, true, null),
  ('Sprite', 'Refreshing lemon lime soda', 'drink', 199, true, null),
  ('Vanilla Shake', 'Vanilla milkshake', 'drink', 499, true, null),
  ('Chocolate Shake', 'Rich chocolate milkshake', 'drink', 549, true, null),
  ('Orange Juice', 'Fresh orange juice', 'drink', 299, true, null),
  ('Coffee', 'Freshly brewed coffee', 'drink', 249, true, null),
  ('Hot Tea', 'Premium tea selection', 'drink', 199, true, null)
on conflict do nothing;