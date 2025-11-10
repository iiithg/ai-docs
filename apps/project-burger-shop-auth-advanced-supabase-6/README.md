# Project Burger Shop Advanced Auth (Supabase) - 6

仅基于 Supabase Auth 的高级认证示例：Google/GitHub OAuth、邮箱密码登录、会话中间件与 JWT 保护 API。

## 功能
- Google/GitHub OAuth 登录
- 邮箱/密码注册与资料入库（profiles）
- 服务端会话（cookie）与路由保护（middleware）
- `/api/jwt-echo` 使用 `SUPABASE_JWT_SECRET` 验证并回显 claims

## 环境变量
```bash
cp .env.example .env.local
```
设置：
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

## 启动
```bash
cd apps/project-burger-shop-auth-advanced-supabase-6
npm install
npm run dev
```
- 访问 `/auth/login` 进行 OAuth 或邮箱登录
- 登录后访问 `/entry`

## 提示
- JWT Secret: Supabase Dashboard → Settings → API
- OAuth 回调：`http://localhost:3000/auth/callback`

