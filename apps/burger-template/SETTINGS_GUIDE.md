# 🔧 设置功能使用指南

## 功能概述

本项目已在页面右上角添加了设置按钮，点击后可以配置 Supabase 的 URL 和 Anon Key。

## ⚙️ 设置按钮位置

在页面右上角的用户头像旁边有一个齿轮图标按钮（⚙️），这就是设置按钮。

## 🔧 如何使用设置功能

### 1. 打开设置
- 点击页面右上角的 ⚙️ 设置按钮

### 2. 输入 Supabase 配置
在设置模态框中，你会看到两个输入字段：

- **Supabase URL**: 从 Supabase 控制台获取的项目 URL
  - 格式: `https://your-project-ref.supabase.co`
- **Anon Key**: 匿名访问密钥
  - 格式: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. 保存设置
点击"保存设置"按钮，设置会自动保存到浏览器本地存储中。

### 4. 复制到环境变量
点击"复制到 .env.local"按钮，系统会自动复制环境变量格式的配置到剪贴板。

然后你需要：
1. 粘贴内容到项目的 `.env.local` 文件中
2. 重启开发服务器使更改生效

## 📱 使用说明

- 设置会自动保存到浏览器的 localStorage 中
- 关闭浏览器后再次打开，设置会从本地存储中恢复
- 按钮有友好的中文提示
- 支持键盘快捷键：按 ESC 键关闭模态框
- 点击模态框外部区域也可以关闭设置

## 🎨 界面特色

- 美观的渐变模态框设计
- 与项目整体的 burger 主题风格一致
- 流畅的动画效果
- 响应式设计，支持不同屏幕尺寸
- 友好的用户交互反馈

## 📋 获取 Supabase 配置的步骤

1. 登录 [Supabase 控制台](https://supabase.com/dashboard)
2. 选择你的项目
3. 进入 "Settings" > "API" 页面
4. 复制 "Project URL" 和 "anon public" 密钥
5. 粘贴到设置模态框中

## 🔒 安全提醒

- Anon Key 是公开密钥，可以安全地在客户端使用
- 不要在代码中硬编码敏感信息，使用环境变量
- 定期轮换 API 密钥以确保安全

## 🚀 启动项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 📝 注意事项

- 设置保存在浏览器的 localStorage 中，清除浏览器数据会丢失设置
- 如果使用的是不同的浏览器或设备，需要重新配置设置
- 确保 Supabase URL 和 Anon Key 的格式正确