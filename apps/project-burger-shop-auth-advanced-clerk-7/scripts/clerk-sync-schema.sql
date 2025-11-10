-- Clerk 用户同步数据库表结构
-- 这个脚本创建用于存储从 Clerk webhook 同步过来的用户和组织数据的表

-- 用户表 - 存储从 Clerk 同步的用户信息
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- Clerk 用户 ID
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  email_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 组织表 - 存储从 Clerk 同步的组织信息
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,  -- Clerk 组织 ID
  name TEXT NOT NULL,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 组织成员关系表 - 存储用户与组织的成员关系
CREATE TABLE IF NOT EXISTS organization_memberships (
  id TEXT PRIMARY KEY,  -- Clerk 成员关系 ID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'admin', 'member', etc.
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_user_id ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_org_id ON organization_memberships(organization_id);

-- 添加注释说明表的用途
COMMENT ON TABLE users IS '从 Clerk webhook 同步的用户数据';
COMMENT ON TABLE organizations IS '从 Clerk webhook 同步的组织数据';
COMMENT ON TABLE organization_memberships IS '从 Clerk webhook 同步的组织成员关系数据';

-- 启用 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- 创建基本的 RLS 策略（开发环境）
-- 用户只能读取自己的信息
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- 认证用户可以读取所有用户信息（用于用户列表等功能）
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- 组织成员可以查看自己所属的组织
CREATE POLICY "Organization members can view organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id
      FROM organization_memberships
      WHERE user_id = auth.uid()::text
    )
  );

-- 组织成员可以查看其他成员信息
CREATE POLICY "Organization members can view memberships" ON organization_memberships
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    organization_id IN (
      SELECT organization_id
      FROM organization_memberships
      WHERE user_id = auth.uid()::text
    )
  );

-- 创建用于更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为表添加更新时间戳的触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_memberships_updated_at BEFORE UPDATE ON organization_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();