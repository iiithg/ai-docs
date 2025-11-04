# Project Burger Shop Auth & Users - 2

🍔 **Complete Authentication & User Management System** - Advanced burger shop with profiles, wallet, stock management, and admin controls

This project demonstrates a **complete authentication system** with Supabase Auth, featuring user profiles, wallet management, stock control, and role-based administration, showcasing production-ready user management patterns.

## 🚀 Features

### Supabase Authentication Integration
This project showcases the following **Supabase features**:

- **🔐 Complete Auth System**: Email/password registration, login, logout
- **👤 User Profiles**: Extended profiles with personal information
- **💳 Wallet System**: Per-user digital wallet with balance management
- **🎁 Welcome Bonus**: One-time gift for new users via RPC
- **🛒 Purchase Flow**: Guarded checkout with stock management
- **📦 Inventory Control**: Automatic stock tracking and depletion
- **👑 Role-Based Access**: Admin controls with email allowlist
- **⚡ Dynamic Configuration**: Runtime Supabase configuration via UI

### Application Features
- **📋 Complete User Management**: Registration, login, profile management
- **💰 Digital Wallet**: Balance tracking, deposits, and purchases
- **🎉 Welcome Rewards**: Automated bonus distribution for new users
- **📊 Real-time Inventory**: Stock tracking with automatic unlisting
- **🛡️ Secure Checkout**: Atomic purchase operations with wallet integration
- **📜 Purchase History**: User-specific order tracking
- **🔧 Admin Dashboard**: Menu management with access controls
- **📱 Responsive Design**: Modern mobile-friendly interface

## 🛠️ Quick Start

### Option 1: Dynamic Configuration (Recommended)
1. Start the application (see Run section below)
2. Click the settings button (⚙️) in the top-right corner
3. Enter your Supabase URL and Anon Key
4. Settings are automatically saved to localStorage

### Option 2: Environment Variables
- Copy `.env.example` → `.env.local` and set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `NEXT_PUBLIC_ADMIN_EMAILS` (optional, comma-separated admin emails)

## 🏃‍♂️ Run

```bash
cd apps/project-burger-shop-auth-users-2
npm install
npm run dev
```

Open `http://localhost:3001`:

- **`/auth`** — Register or login to access the shop
- **`/shop`** — Browse menu, claim welcome gift, make purchases
- **`/admin`** — Admin controls for menu management (admin-only)

## 🗄️ Database Setup

### 🚀 One-time Initialization

1. Open the Supabase Dashboard and select your project
2. Go to SQL Editor → New query
3. Copy the entire contents of `scripts/init.sql`
4. Paste into the SQL Editor and click Run

### What's Included in init.sql

- **Extensions & Tables**: Complete schema with proper constraints
  - `menu_items` with `quantity` column for stock tracking
  - `profiles` with wallet and welcome bonus tracking
  - `orders` for purchase history
- **RLS Policies**: Row Level Security for data protection
- **Triggers**: `handle_new_user()` for automated profile creation
- **RPC Functions**: `buy_burger`, `claim_welcome_bonus`, `get_my_purchased_items`
- **Seed Data**: 16+ menu items with initial stock levels
- **Backfill**: Profile creation for existing auth.users

### Important Security Notes

- **Authentication Required**: Menu is only visible to authenticated users
- **Role-Based Access**: Admin controls restricted to allowlisted emails
- **Stock Management**: Automatic unlisting when quantity reaches 0

## 📁 Project Structure

### Core Application Files
- **`app/shop/page.tsx`** — Main shop interface with purchase flow
- **`app/auth/*`** — Authentication pages (login, register)
- **`app/admin/page.tsx`** — Admin dashboard with menu CRUD
- **`lib/database.ts`** — Database service layer with business logic
- **`lib/types.ts`** — TypeScript type definitions

### Database Scripts
- **`scripts/init.sql`** — Complete database initialization

## 🎯 Technical Implementation

### Database Schema

#### profiles
```sql
- id: uuid (primary key, references auth.users)
- full_name: text (user display name)
- birthday: date (user birthday)
- avatar_url: text (profile image URL)
- wallet_cents: integer (wallet balance in cents)
- welcome_claimed: boolean (welcome bonus status)
- role: text (user/admin role assignment)
- created_at/updated_at: timestamps
```

#### menu_items
```sql
- id: uuid (primary key)
- name: text (item name)
- description: text (item description)
- price_cents: integer (price in cents)
- category: text (burger/side/drink)
- quantity: integer (stock count)
- available: boolean (visibility status)
- created_at/updated_at: timestamps
```

#### orders
```sql
- id: uuid (primary key)
- user_id: uuid (references profiles.id)
- menu_item_id: uuid (references menu_items.id)
- quantity: integer (items purchased)
- price_cents: integer (total price)
- created_at: timestamp
```

### Key Features Implementation

#### Wallet System
- **Initial Balance**: New users start with ¥0
- **Welcome Bonus**: ¥100.00 one-time gift via `claim_welcome_bonus` RPC
- **Atomic Operations**: Wallet updates using database transactions

#### Stock Management
- **Per-Item Tracking**: Each menu item has quantity field
- **Auto-Depletion**: Stock decrements with each purchase
- **Auto-Unlisting**: Items become unavailable when quantity = 0

#### Purchase Flow
- **Security**: Only authenticated users can view/purchase
- **Atomic Operations**: `buy_burger` RPC handles everything atomically
  - Decrements menu item stock
  - Deducts from user wallet
  - Creates order record
- **Error Handling**: Comprehensive validation and rollback

#### Admin System
- **Email Allowlist**: Default `physicoada@gmail.com`, configurable via env
- **Role Guards**: Only users with `profiles.role='admin'` can access admin features
- **Menu CRUD**: Create, read, update, delete menu items
- **Stock Management**: Adjust inventory levels

## ⚠️ Troubleshooting

### Common Issues

**"Failed to load" or "Claim Welcome Gift" not visible**
- **Cause**: Missing `profiles` row or wrong project connection
- **Solution**: Run `scripts/init.sql` on the exact project your app connects to
- **Note**: Script includes backfill for existing users

**"Function not found (get_my_purchased_items)"**
- **Cause**: RPC functions not properly created
- **Solution**: Run the RPC section from `init.sql`
- **Follow-up**: Execute `select pg_notify('pgrst','reload schema');`

**"Column 'quantity' does not exist"**
- **Cause**: Using old table structure without quantity column
- **Solution**: Run `init.sql` which includes `alter table ... add column if not exists quantity`

### Authentication Issues

**Can't access shop after login**
- **Check**: User profile exists in `profiles` table
- **Verify**: JWT token is valid and not expired
- **Test**: Try refreshing the page after login

**Admin access denied**
- **Check**: User email is in admin allowlist
- **Verify**: User has `role='admin'` in profiles table
- **Configure**: Set `NEXT_PUBLIC_ADMIN_EMAILS` environment variable

## 🔒 Security Features

### Row Level Security (RLS)
- **profiles**: Self-read, restricted self-update, admin full access
- **orders**: Self-read, insert-only via `buy_burger` RPC
- **menu_items**: Authenticated read, admin-only writes

### Best Practices
- **Never expose service role keys** in client-side code
- **Always validate user permissions** before operations
- **Use atomic transactions** for financial operations
- **Implement proper error handling** with user feedback

## 📚 Further Learning

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions Documentation](https://supabase.com/docs/guides/database/functions)

