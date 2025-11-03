# 项目 -6：高级登录（Google / GitHub + JWT）

本 Demo 展示：
- 使用 Supabase 的 Google 与 GitHub OAuth 登录
- `@supabase/auth-helpers-nextjs` 在回调路由中把 `code` 交换为服务端会话 Cookie
- `middleware.ts` 限制 `/protected` 仅登录用户可访问
- 一个 JWT 保护的 API（`/api/jwt-echo`）使用 `SUPABASE_JWT_SECRET` 验证 Supabase Access Token

## 快速开始
- 复制环境变量：`cp .env.example .env.local`
- 设置：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`、`SUPABASE_JWT_SECRET`
- 在 Supabase Dashboard 启用 Google/GitHub Provider，并将回调 URL 设为：`http://localhost:3000/auth/callback`
- 安装并运行：`npm install && npm run dev`

## 路由说明
- `GET /auth/callback`：在服务端调用 `exchangeCodeForSession`，把 OAuth code 换成 Cookie 会话
- `GET /protected`：仅登录可见（由 `middleware.ts` 拦截未登录用户并重定向到 `/auth/login`）
- `GET /api/jwt-echo`：要求 `Authorization: Bearer <access_token>`；用 `jsonwebtoken` + `SUPABASE_JWT_SECRET` 验证并回显 `sub/role/exp`

## 使用建议
- 浏览器内访问内部数据时，优先使用基于 Cookie 的校验（`auth-helpers`）
- 面向第三方或服务到服务调用时，再使用 JWT Bearer Token 模式
- 切勿在客户端暴露 `SUPABASE_JWT_SECRET`

对应代码目录：`apps/project-burger-shop-auth-advanced-6`
