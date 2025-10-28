# project-burger-shop-auth-users-2

Auth + Users demo on top of the burger shop — requires login to buy burgers, stores user profile (name, birthday, avatar) and a per-user wallet with randomized initial balance.

## Features

- Supabase Auth (email/password): register, login, logout
- Profiles table: `full_name`, `birthday`, `avatar_url`, `wallet_cents`
- Random initial wallet per user (set by trigger on signup)
- Guarded purchase flow: only logged-in users can buy
- Atomic purchase RPC `buy_burger` updates wallet and writes `orders`
- Reuses existing `menu_items` from CRUD demo; shows available items only

## Setup

- Copy `.env.example` → `.env.local` and set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Or click the in-app ⚙️ to set URL/Key at runtime (stored in localStorage)

## Database (SQL)

Run in Supabase SQL Editor:

Option A — one shot
- Open `scripts/init-auth.sql`, copy all, run once.

Option B — step-by-step
- `000-extensions.sql`
- `010-table_menu_items.sql`
- `011-table_promo_codes.sql`
- `020-table_profiles.sql`
- `022-alter_profiles_add_role.sql`（profiles 增加 role 字段，默认 'user'）
- `021-table_orders.sql`
- `030-rls_dev_off.sql` (dev only; re-enable RLS for prod)
- `031-rls_on_min_policies.sql` (prod: 开启最小可用 RLS 策略)
- `040-seed_menu_items.sql`
- `041-seed_promo_codes.sql`
- `060-rpc_buy_burger.sql`
- `070-trigger_on_signup.sql`
- `080-seed_auth_users.sql`（可选：直接在数据库中批量创建测试用户）
- `085-grant_admin.sql`（可选：把某个邮箱的用户设为管理员 role='admin'）

Notes
- Trigger `handle_new_user` copies `full_name/birthday/avatar_url` from `raw_user_meta_data` at signup and assigns a random starting `wallet_cents`.
- RPC `buy_burger(p_item_id uuid)` checks availability, ensures sufficient funds, deducts wallet, inserts an order, and returns `{ order_id, new_wallet_cents }`.

## Run

```bash
cd apps/project-burger-shop-auth-users-2
npm install
npm run dev
```

Open `http://localhost:3001` (or your dev port):
- Go to `/auth` to register or login
- After login, go to `/` to buy items; header shows your balance and birthday
- Admin can visit `/admin` 进入“菜单管理”界面；非管理员会看到“权限不足”的提示。

## Files

- `app/page.tsx` — Shop UI (requires auth to buy)
- `app/auth/page.tsx` — Register/Login form, pushes user metadata
- `lib/database.ts` — Services: `menuItems`, `profiles`, `orders`
- `lib/types.ts` — Types incl. `Profile` and `BuyResult`
- `scripts/*.sql` — Tables, RPC, trigger, seeds

## Security

- Dev scripts disable RLS for speed; for production, enable RLS and restrict RPCs.
- Never expose service role keys in the client; use only the anon key on the web.

## 测试用户（数据库直建）

- 运行 `scripts/080-seed_auth_users.sql` 将直接插入 2 个测试账号：
  - `alice@example.com` / `Passw0rd!`
  - `bob@example.com` / `Passw0rd!`
- 插入到 `auth.users` 时会触发 `handle_new_user`，自动在 `public.profiles` 生成资料，并分配随机 `wallet_cents`。
- 登录界面 `/auth` 使用 Supabase Auth API 实际写入/验证用户，无需服务端。

## RLS 说明

- `profiles` 与 `orders` 默认开启 RLS：
  - profiles：仅本人可读写（姓名/生日/头像）；
  - orders：仅本人可读；购买通过 `buy_burger`（SECURITY DEFINER）在数据库侧扣款与写单。
- `menu_items`、`promo_codes` 在开发脚本中默认关闭 RLS（便于调试），如需生产隔离，可执行 `031-rls_on_min_policies.sql` 开启只读策略。
- 同时在 `031-rls_on_min_policies.sql` 中已加入“管理员写策略”，只有 `profiles.role='admin'` 的用户可对菜单/优惠券进行 insert/update/delete。
