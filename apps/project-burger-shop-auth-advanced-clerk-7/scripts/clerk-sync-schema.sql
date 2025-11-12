-- Clerk user sync database schema
-- This script creates tables for storing user and organization data synced from Clerk webhooks

-- Users table - stores user information synced from Clerk
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,  -- Clerk user ID
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  email_address TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Organizations table - stores organization information synced from Clerk
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,  -- Clerk organization ID
  name TEXT NOT NULL,
  slug TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Organization memberships table - stores user-organization membership relationships
CREATE TABLE IF NOT EXISTS organization_memberships (
  id TEXT PRIMARY KEY,  -- Clerk membership ID
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL, -- 'admin', 'member', etc.
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email_address);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_user_id ON organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_memberships_org_id ON organization_memberships(organization_id);

-- Add table comments to explain their purpose
COMMENT ON TABLE users IS 'User data synced from Clerk webhooks';
COMMENT ON TABLE organizations IS 'Organization data synced from Clerk webhooks';
COMMENT ON TABLE organization_memberships IS 'Organization membership data synced from Clerk webhooks';

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_memberships ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies (development environment)
-- Users can only view their own information
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Authenticated users can view all user information (for user list features, etc.)
CREATE POLICY "Authenticated users can view all users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

-- Organization members can view their organization
CREATE POLICY "Organization members can view organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id
      FROM organization_memberships
      WHERE user_id = auth.uid()::text
    )
  );

-- Organization members can view membership information
CREATE POLICY "Organization members can view memberships" ON organization_memberships
  FOR SELECT USING (
    user_id = auth.uid()::text OR
    organization_id IN (
      SELECT organization_id
      FROM organization_memberships
      WHERE user_id = auth.uid()::text
    )
  );

-- Create function for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add timestamp update triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_memberships_updated_at BEFORE UPDATE ON organization_memberships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();