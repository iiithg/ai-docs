# Clerk Webhook 同步设置指南

本指南将帮助您设置 Clerk 到 Supabase 的用户数据同步，使用 Supabase Edge Functions 接收 Clerk webhook 事件。

## 概述

通过 webhook 同步，Clerk 用户数据会自动同步到您的 Supabase 数据库中，这样可以：
- 在本地数据库中进行用户数据查询和关联
- 支持 RLS (Row Level Security) 策略
- 进行数据分析和报告
- 减少对 Clerk API 的实时调用

## 设置步骤

### 1. 数据库初始化

首先运行 SQL 脚本来创建必要的表结构：

```bash
# 使用 Supabase Dashboard 的 SQL Editor
# 或者使用 psql 命令行：
psql -f scripts/clerk-sync-schema.sql $DATABASE_URL
```

这个脚本会创建以下表：
- `users` - 存储用户基本信息
- `organizations` - 存储组织信息
- `organization_memberships` - 存储用户与组织的成员关系

### 2. 创建 Edge Function

确保您的 Edge Function 已经创建在 `supabase/functions/clerk-webhooks/index.ts`。

### 3. 部署 Edge Function

```bash
# 在项目根目录运行
npx supabase functions deploy clerk-webhooks
```

部署后，在 Supabase Dashboard 的 Edge Functions 页面复制函数 URL。

### 4. 配置 Edge Function

在 Supabase Dashboard 中：
1. 导航到 Edge Functions > clerk-webhooks
2. 点击函数名称进入详情页面
3. 选择 "Details" 标签
4. 取消勾选 "Enforce JWT Verification"
5. 保存更改

**重要**: 这一步很关键，因为我们需要使用 Clerk Webhook Secret 来验证请求，而不是 JWT。

### 5. 添加环境变量

在 Supabase Dashboard 中添加以下 secrets：

```
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret_here
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**获取 CLERK_WEBHOOK_SECRET**:
1. 在 Clerk Dashboard 中进入 Configure > Webhooks
2. 创建或编辑 webhook endpoint
3. 复制 "Signing Secret"

### 6. 配置 Clerk Webhook

在 Clerk Dashboard 中：

1. 导航到 Configure > Webhooks
2. 点击 "Add Endpoint"
3. 在 "Endpoint URL" 字段粘贴您的 Supabase Edge Function URL
4. 启用所需的事件类型：
   - `user.created` - 用户创建
   - `user.updated` - 用户更新
   - `user.deleted` - 用户删除
   - `organization.created` - 组织创建
   - `organization.updated` - 组织更新
   - `organization.deleted` - 组织删除
   - `organizationMembership.created` - 成员关系创建
   - `organizationMembership.updated` - 成员关系更新
   - `organizationMembership.deleted` - 成员关系删除
5. 点击 "Create" 保存

## 测试设置

### 使用 Clerk Dashboard 测试

1. 在 Clerk Dashboard 中打开您的 webhook
2. 进入 "Testing" 标签
3. 选择要测试的事件类型（如 `user.created`）
4. 点击 "Send Example" 发送测试事件
5. 检查 Supabase 数据库中是否出现新用户记录

### 检查 Edge Function 日志

在 Supabase Dashboard 中：
1. 导航到 Edge Functions
2. 点击您的函数名称
3. 查看 "Logs" 标签中的日志输出

## 数据结构

### 用户表 (users)

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | Clerk 用户 ID |
| first_name | TEXT | 名字 |
| last_name | TEXT | 姓氏 |
| username | TEXT | 用户名 |
| email_address | TEXT | 邮箱地址 |
| avatar_url | TEXT | 头像 URL |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 组织表 (organizations)

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | Clerk 组织 ID |
| name | TEXT | 组织名称 |
| slug | TEXT | 组织标识符 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 组织成员关系表 (organization_memberships)

| 字段 | 类型 | 描述 |
|------|------|------|
| id | TEXT | 成员关系 ID |
| user_id | TEXT | 用户 ID |
| organization_id | TEXT | 组织 ID |
| role | TEXT | 角色 ('admin', 'member' 等) |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

## 安全注意事项

1. **Webhook Secret**: 始终保持 `CLERK_WEBHOOK_SECRET` 的机密性
2. **Service Role Key**: 仅在服务器端使用，永远不要在客户端代码中暴露
3. **RLS 策略**: 根据您的业务需求调整 RLS 策略
4. **HTTPS**: 确保您的 webhook URL 使用 HTTPS

## 故障排除

### 常见问题

**Q: 用户数据没有出现在数据库中**
- 检查 Edge Function 日志是否有错误
- 验证环境变量是否正确设置
- 确认 Clerk webhook 配置正确

**Q: webhook 验证失败**
- 确认 `CLERK_WEBHOOK_SECRET` 与 Clerk Dashboard 中的值一致
- 检查是否已禁用 JWT Verification

**Q: 数据库权限错误**
- 确认使用了 SERVICE_ROLE_KEY 而不是 ANON_KEY
- 检查数据库表和 RLS 策略是否正确创建

### 调试技巧

1. 查看 Edge Function 的实时日志
2. 使用 Clerk Dashboard 的 webhook 测试功能
3. 检查网络请求和响应状态码
4. 验证数据库表结构和权限

## 扩展功能

一旦基础同步设置完成，您可以：

1. 添加自定义字段到数据库表
2. 实现更复杂的业务逻辑
3. 添加数据验证和清理
4. 设置数据同步监控和告警
5. 实现批量数据导入/导出功能

## 相关资源

- [Clerk Webhooks 文档](https://clerk.com/docs/integrations/webhooks)
- [Supabase Edge Functions 文档](https://supabase.com/docs/guides/functions)
- [RLS 策略指南](https://supabase.com/docs/guides/auth/row-level-security)