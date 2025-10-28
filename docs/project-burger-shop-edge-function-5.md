# project-burger-shop-edge-function-5 — 天气 Edge Function（无服务器后端）

目标：实现一个 Edge Function 代理免费天气 API（例如 Open‑Meteo），前端 `/weather` 直接调用函数，展示当前天气。用于演示“无需自建服务器的后端能力”，并说明其“无状态”特性。

应用路径：`apps/project-burger-shop-edge-function-5`

## 核心点
- Edge Function 运行在 Supabase 边缘，Deno 运行时，HTTP 触发。
- 默认无状态：函数实例不持久保存状态；如需“有状态”，把数据落 DB/外部 KV。
- 两种身份调用：
  - 公共代理：无需 JWT；仅转发第三方公共数据。
  - 用户身份：前端附带 `Authorization: Bearer <JWT>`，函数内可按用户做限流/审计（仍受 RLS）。

## 函数设计
- 路径：`/functions/v1/weather?lat=..&lon=..`
- 行为：校验参数 → 请求开源天气 API → 选取字段返回 → 添加 CORS/Cache-Control。

示例（Deno）
```ts
// supabase/functions/weather/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const url = new URL(req.url)
  const lat = url.searchParams.get('lat')
  const lon = url.searchParams.get('lon')
  if (!lat || !lon) return new Response(JSON.stringify({ error: 'missing lat/lon' }), { status: 400 })

  const r = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
  const data = await r.json()
  return new Response(JSON.stringify({ current: data.current_weather }), {
    headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' }
  })
})
```

部署
```bash
supabase functions deploy weather
supabase functions list
# 本地调试
supabase functions serve weather --env-file supabase/.env
```

## 前端页面
- 路由建议：`app/weather/page.tsx`
- 交互：输入经纬度 → `fetch('/functions/v1/weather?lat=..&lon=..')` → 渲染 JSON。

## 何时用 RPC / 何时用 Edge Function
- 纯数据库内聚合/写操作 → 用 Postgres RPC（更快，RLS 原生）。
- 需要外部 API/密钥/多步骤/缓存 → 用 Edge Function（后端代理）。
