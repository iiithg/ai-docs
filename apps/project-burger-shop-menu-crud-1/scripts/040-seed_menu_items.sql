-- Seed data for menu items
-- Insert sample burger shop menu items for testing

insert into public.menu_items (name, description, category, price_cents, available, image_url)
values
  -- Burgers
  ('经典汉堡', '新鲜牛肉饼配生菜、番茄、洋葱和特制酱料', 'burger', 799, true, null),
  ('芝士汉堡', '经典汉堡加双层芝士片', 'burger', 899, true, null),
  ('培根汉堡', '经典汉堡加脆培根片', 'burger', 999, true, null),
  ('双层汉堡', '双层牛肉饼的豪华汉堡', 'burger', 1299, true, null),
  ('鸡肉汉堡', '嫩滑鸡胸肉配特制香料', 'burger', 849, true, null),
  ('素食汉堡', '植物蛋白饼配新鲜蔬菜', 'burger', 749, true, null),
  
  -- Sides
  ('薯条', '金黄酥脆的炸薯条', 'side', 349, true, null),
  ('洋葱圈', '酥脆洋葱圈配蘸酱', 'side', 399, true, null),
  ('鸡块', '6块香脆鸡块', 'side', 449, true, null),
  ('沙拉', '新鲜蔬菜沙拉配调味汁', 'side', 299, true, null),
  ('奶酪薯条', '薯条配融化芝士酱', 'side', 449, true, null),
  
  -- Drinks
  ('可乐', '经典可口可乐', 'drink', 199, true, null),
  ('雪碧', '清爽柠檬汽水', 'drink', 199, true, null),
  ('奶昔', '香草奶昔', 'drink', 499, true, null),
  ('巧克力奶昔', '浓郁巧克力奶昔', 'drink', 549, true, null),
  ('橙汁', '新鲜橙汁', 'drink', 299, true, null),
  ('咖啡', '现磨咖啡', 'drink', 249, true, null),
  ('热茶', '精选茶叶', 'drink', 199, true, null)
on conflict do nothing;