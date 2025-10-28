# project-burger-shop-storage-uploads-4 — 头像上传（Storage）

目标：登录用户可在个人页上传头像到 Storage，并把文件 URL 写入 `profiles.avatar_url`，在商店页展示。

应用路径：`apps/project-burger-shop-storage-uploads-4`

## 功能范围
- 选择文件（限制类型/大小），预览后上传。
- 获取公共或签名 URL，更新 `public.profiles.avatar_url`。
- 刷新后在 Auth-Users 商店页 `/` 显示新头像。

## 存储与策略
- 新建 bucket：`avatars`
- 推荐路径：`<user_id>/avatar.<ext>`
- Storage Policies（示例）：
```sql
-- 所有人可读头像（或改为仅签名读）
create policy if not exists "avatars read all" on storage.objects
  for select using (bucket_id = 'avatars');

-- 仅本人可写/改/删自己目录
create policy if not exists "avatars write self" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
create policy if not exists "avatars update self" on storage.objects
  for update using (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
create policy if not exists "avatars delete self" on storage.objects
  for delete using (
    bucket_id = 'avatars' and split_part(name,'/',1) = auth.uid()::text
  );
```

## 前端交互
- 使用 `supabase.storage.from('avatars').upload(path, file, { upsert:true })` 上传。
- 取 URL：`getPublicUrl(path)` 或 `createSignedUrl(path, 3600)`。
- 调用 `profiles.update({ avatar_url })` 写入资料。
- 路由建议：`app/profile/page.tsx`。

## 环境变量
- `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 运行
```bash
npm install
npm run dev
```
