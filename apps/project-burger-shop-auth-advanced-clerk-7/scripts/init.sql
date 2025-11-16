-- 文件: init.sql

-- 1. 为同步的 Clerk 用户创建 `users` 表
-- 这个表将存储从 Clerk Webhooks 推送过来的用户数据。
CREATE TABLE public.users (
  id TEXT NOT NULL PRIMARY KEY, -- 对应 Clerk User ID
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用表的行级安全 (RLS)
-- 这是一个重要的安全措施，确保用户默认无法访问任何数据。
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略
-- 策略1: 允许认证用户读取自己的用户信息。
-- `auth.jwt()->>'sub'` 会从 Clerk 提供的 JWT 中提取用户 ID。
CREATE POLICY "Authenticated users can view their own user record"
ON public.users FOR SELECT
TO authenticated
USING ( (SELECT auth.jwt()->>'sub') = id );

-- 策略2: 允许用户更新自己的信息。
CREATE POLICY "Authenticated users can update their own user record"
ON public.users FOR UPDATE
TO authenticated
USING ( (SELECT auth.jwt()->>'sub') = id );