# 🚀 实时聊天功能设置指南

## 🚨 常见错误快速修复

### ❌ "Could not find the 'username' column" 错误

**问题**: 发送消息时出现找不到 `username` 列的错误
**原因**: 数据库表结构与代码不匹配

**解决方案**:
1. 在 Supabase SQL 编辑器中运行：
```sql
-- 复制粘贴 scripts/fix-table-structure.sql 的内容
```
2. 在 **Database > Replication** 中重新启用 `chat_messages` 表的实时复制
3. 刷新页面重试

## 📋 问题诊断

如果你遇到以下问题：
- ✅ 能看到多个在线用户
- ❌ 看不到其他用户的鼠标位置
- ❌ 发送消息失败

## 🔧 解决步骤

### 1. 数据库设置

首先在 Supabase SQL 编辑器中运行：

```sql
-- 运行完整的初始化脚本
\i scripts/init-chat.sql
```

或者直接复制粘贴 `scripts/init-chat.sql` 的内容到 SQL 编辑器中执行。

### 2. 启用实时功能

在 Supabase 控制台中：

1. **进入 Database > Replication**
2. **找到 `chat_messages` 表**
3. **点击右侧的开关启用实时复制**

### 3. 检查 RLS 策略

确保以下策略已创建：

```sql
-- 检查策略是否存在
SELECT * FROM pg_policies WHERE tablename = 'chat_messages';
```

应该看到两个策略：
- `chat read auth`
- `chat write auth`

### 4. 环境变量配置

在 `.env.local` 文件中设置正确的 Supabase 配置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
```

**重要**：确保 URL 不是占位符 `https://your-project-ref.supabase.co`

### 5. 重启开发服务器

修改环境变量后，重启 Next.js 开发服务器：

```bash
npm run dev
```

## 🐛 调试技巧

### 检查浏览器控制台

打开浏览器开发者工具，查看控制台输出：

- `Presence subscription status: SUBSCRIBED` - 表示在线状态订阅成功
- `Chat subscription status: SUBSCRIBED` - 表示聊天消息订阅成功
- `Sending cursor update:` - 表示鼠标位置正在发送
- `Cursor update:` - 表示接收到其他用户的鼠标位置

### 常见错误

1. **`Invalid JWT`** - 检查 ANON_KEY 是否正确
2. **`relation "chat_messages" does not exist`** - 运行数据库初始化脚本
3. **`permission denied`** - 检查 RLS 策略是否正确设置

### 测试步骤

1. 打开两个不同的浏览器窗口（或无痕模式）
2. 访问 `/chat` 页面
3. 在两个窗口中都应该看到对方在线
4. 移动鼠标应该能看到对方的鼠标位置
5. 发送消息应该在两个窗口中都能看到

## 📊 功能验证清单

- [ ] 数据库表 `chat_messages` 已创建
- [ ] RLS 策略已设置
- [ ] 实时复制已启用
- [ ] 环境变量配置正确
- [ ] 开发服务器已重启
- [ ] 浏览器控制台无错误
- [ ] 多窗口测试成功

## 🆘 仍然有问题？

如果按照以上步骤仍然无法解决问题，请检查：

1. Supabase 项目是否在免费计划限制内
2. 网络连接是否稳定
3. 浏览器是否支持 WebSocket
4. 是否有防火墙或代理阻止连接

## 🔄 重置配置

如果需要重新配置 Supabase 连接，点击聊天页面左侧的 "Reconfigure Supabase" 按钮。