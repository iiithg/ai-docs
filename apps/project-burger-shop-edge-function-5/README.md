# Project Burger Shop — AI & Email (Edge Functions)

本项目的前端演示三类 Supabase Edge Functions 能力：
- LLM Chat（OpenAI 兼容 Chat Completions）
- Send Emails（邮件队列/模板）
- Text→Image（OpenAI 兼容上游）

路径：`apps/project-burger-shop-edge-function-5`

## 1) 前置准备

- Node.js 18+
- 你自己的 Supabase 项目（将在 Dashboard 里创建并部署 Edge Functions）

## 2) 安装与本地运行（仅前端）

```bash
cd apps/project-burger-shop-edge-function-5
npm install
npm run dev
```

在右上角 Settings 中填写：
- `Supabase URL`：例如 `https://YOUR-PROJECT.supabase.co`
- `Anon Key`：项目匿名密钥
- 若你的函数启用了鉴权验证，可在 `Access Token` 粘贴用户 JWT（前端会自动带上 `Authorization: Bearer ...`）。

也可在 `.env.local` 设置：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3) Supabase Functions 部署（重要）

在 Supabase Dashboard → Functions 创建并部署以下 3 个函数（将本仓库 `scripts/` 目录下同名文件完整复制过去）：
- `llm-chat` → `scripts/llm-chat.ts`
- `send-email` → `scripts/send-email.ts`
- `txt2img` → `scripts/txt2img.ts`

为每个函数在 Dashboard → Functions → Settings 配置环境变量：
- `llm-chat`：`OPENAI_API_KEY`
- `send-email`：`SUPABASE_URL`、`SUPABASE_SERVICE_ROLE_KEY`
- `txt2img`：`NANOBANANA_API_KEY`（可选 `NANOBANANA_API_URL`）

模板代码已内置 CORS（包含 OPTIONS 预检与跨域响应头），前端可直接调用。

### 关于 Verify JWT with legacy secret（务必确认）
- 含义：要求请求头 `Authorization` 携带由“legacy JWT secret（旧密钥）”签名的 JWT。由于项目的 anon key 也是一个易获得的 JWT，启用该选项后，使用 anon key 也可能满足校验。
- 推荐：关闭（OFF）。建议在函数内部实现更细粒度的鉴权与授权逻辑（例如校验用户身份、角色、白名单或签名），而不是依赖 legacy secret 校验。
- 若你确实开启，则前端必须携带 `Authorization: Bearer <token>`。本项目的 Settings 已提供 Access Token 输入框，保存后将自动附带。

完成上述步骤后，请先在 Dashboard 内直接“运行/测试”每个函数，确认 200 响应并返回预期数据，再回到前端页面调试。

## 4) 前端页面与接口

- LLM Chat（`/functions/v1/llm-chat`）
  - body：`{ messages | prompt, model, temperature, max_tokens }`
- Send Emails（`/functions/v1/send-email`）
  - body：`{ to, subject|templateName, templateData }`
- Text→Image（`/functions/v1/txt2img`）
  - body：`{ prompt, model }`

每个页面都提供“自定义 Endpoint URL（可选）”输入框，便于你临时指向任意已部署的函数（例如 `.../functions/v1/dynamic-endpoint`）。

## 5) 常见问题

- `TypeError: Failed to fetch`
  - 通常是 CORS 预检失败或缺少 `apikey`/`Authorization` 请求头。
  - 解决：确保函数代码包含 CORS 头；在前端 Settings 保存 Anon Key（自动附加 `apikey`）；若函数启用鉴权，提供 Access Token。
  - DevTools → Network 检查 `OPTIONS` 与 `POST` 响应是否包含 `Access-Control-Allow-Origin`。

- `401 Missing authorization header`
  - 你的函数要求 `Authorization`，但前端未附带。
  - 在 Settings 粘贴 Access Token（JWT）；或关闭函数的强校验；或在函数内部放宽逻辑（仅限测试）。

- Text→Image 显示重复图片
  - 上游可能同时返回 Markdown 与原始 `data:image`；前端已做去重处理。

