# project-burger-shop-auth-users-2 — Auth, Profiles, Wallet, Admin, Stock

应用路径：`apps/project-burger-shop-auth-users-2`

## 目标功能
- 登录后：
  - 管理员（super admin = `role='admin'`）可在 `/admin` 管理商品（新增/编辑/删除/上下架）。
  - 普通用户拥有初始钱包余额，可在 `/shop` 购买商品。
- 购买后商品库存 `quantity` 减 1；当库存到 0 自动下架（`available=false`），不可购买。
 - 每个新用户仅一次“新手大礼包”领取机会；数据库以 `profiles.welcome_claimed` 记录是否已领取；领取通过安全 RPC 完成并在 RLS 下生效。

## 主要页面
- `/auth` 登录/注册（Supabase Auth）
- `/shop` 商店（登录后可买；展示个人资料和余额）
- `/admin` 管理界面（仅 `role='admin'` 访问）

## 环境变量
- `.env.local`（或在界面右上角“⚙️”动态设置并存储到 localStorage）
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 启动
```bash
cd apps/project-burger-shop-auth-users-2
npm install
npm run dev
```

## 数据库与脚本（scripts/）
- `init.sql`（生产最小集，一次性执行）：
  - 扩展：`pgcrypto`、`citext`
  - 表：
    - `public.menu_items`（含 `quantity integer not null default 0 check (quantity >= 0)`）
    - `public.profiles`（含 `wallet_cents`、`welcome_claimed boolean default false`、`role text check ... default 'user'`）
    - `public.orders`
  - 触发器：`handle_new_user()` 在注册后生成 profile 并分配随机初始余额
  - RPC：
    - `buy_burger(p_item_id uuid)` — 原子扣款 + 扣减库存；当库存为 0 自动将 `available=false`
    - `claim_welcome_bonus(p_bonus_cents integer default 10000)` — 每用户仅一次，给钱包充值（默认 ¥100.00），并将 `welcome_claimed=true`
  - RLS：
    - `menu_items`：公共只读；管理员可写（基于 `profiles.role='admin'`）
    - `profiles`：本人可读/更改资料（不涉及角色）；
    - `orders`：本人可读；插入经由 RPC 完成
  - 种子：示例菜单，带初始 `quantity`
- `init-dev.sql`（开发便捷脚本）：
  - `\i init.sql` 后关闭 `menu_items` 的 RLS 便于调试（`profiles`/`orders` 保持受保护）
  - 注意：`\i` 是 psql 元命令，需使用 psql 或 Supabase CLI 执行；SQL Editor 可能不支持。

执行方式示例
```bash
# 使用 psql（推荐）
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql
# 或开发模式：
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init-dev.sql
```

## 购买与礼包流程（事务语义）
1) 校验登录与商品存在/可售；
2) 扣减库存：`update menu_items set quantity = quantity - 1 where id = $1 and quantity > 0 returning quantity`；
   - 若返回为空或变为负数，则报错并回滚（并发安全）。
3) 若新库存为 0，自动将 `available=false`；
4) 从用户 `profiles.wallet_cents` 扣除价格（不足则报错回滚）；
5) 写入 `orders` 并返回 `{ order_id, new_wallet_cents }`。

礼包：
- 登录后用户在 `/shop` 点击“领取新手大礼包”；UI 调用 `claim_welcome_bonus()`。
- 若 `profiles.welcome_claimed=false`，数据库在单次事务中将其置为 true 并为 `wallet_cents` 增加奖励金额；否则抛出“Already claimed”。

## 前端行为
- `/shop` 仅展示“可售且库存>0”的商品，购买成功后刷新余额与列表。
- `/admin` 可编辑 `quantity` 与 `available`，支持新增、编辑、删除与上下架。
- `/shop` 个人卡片显示余额与“领取新手大礼包”按钮（仅当未领取时显示）。

## 测试建议
- 注册两个账号，使用 “管理员账号”设置为 `role='admin'`（在 SQL 控制台更新 `profiles.role`）。
- 管理员在 `/admin` 新增几条商品并设置 `quantity`；普通用户在 `/shop` 重复购买直至售罄，观察商品自动下架。
