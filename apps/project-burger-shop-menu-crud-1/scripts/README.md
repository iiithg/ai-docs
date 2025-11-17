# Database Scripts

This directory contains SQL scripts for setting up the burger shop database with the latest schema updates.

## 🚀 One-time Setup (Recommended)

**The easiest way: Use the one-time initialization script**

### Steps to execute in Supabase SQL Editor:

1. **Login to Supabase Dashboard**
   - Visit [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Login to your account and select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left navigation bar
   - Or visit directly: `https://supabase.com/dashboard/project/[your-project-id]/sql`

3. **Execute the initialization script**
   - Click "New query" to create a new query
   - Copy the entire content of `init.sql`
   - Paste it into the SQL Editor
   - Click "Run" button to execute the script

4. **Verify the results**
   - After successful execution, you should see a green success message
   - Check the created tables in "Table Editor":
     - `menu_items` table should contain 17 sample menu items with English names and emoji icons
     - `promo_codes` table should contain 10 sample promo codes with simplified structure

### 🎉 Done!
After executing `init.sql`, your database is fully set up and ready to run the application.

---

## 📋 Step-by-step Setup (Optional)

If you prefer to run smaller chunks (extensions, tables, seeds), open `init.sql` and copy only the section you need—the script is annotated with banner comments so each block is easy to identify before executing it inside the SQL Editor.

## 📁 Script Files Description

### Core Script
- **`init.sql`** - 🌟 **One-time initialization script (Recommended)**

## 📊 Table Structure

### menu_items table
**Updated Schema Features:**
- Stores burger shop menu items with English names and descriptions
- **`emoji`** field replaces `image_url` for visual representation (e.g., 🍔, 🍟, 🥤)
- Supports three categories: burger, side, drink
- Prices stored in cents to avoid floating-point precision issues
- Includes availability status control
- Sample data includes popular items like "Classic Beef Burger", "Crispy Fries", etc.

**Key Fields:**
- `id` - UUID primary key
- `name` - Item name (English)
- `description` - Item description (English, optional)
- `category` - Item category (burger/side/drink)
- `price_cents` - Price in cents
- `emoji` - Visual emoji representation
- `available` - Availability status
- `created_at`, `updated_at` - Timestamps

### promo_codes table
**Simplified Schema Features:**
- Stores promotional code information with streamlined structure
- **Removed fields**: `min_order_cents`, `max_discount_cents`, `usage_limit`, `valid_from`, `valid_until`
- Supports percentage and fixed amount discounts
- Includes basic usage tracking and enable/disable status
- Sample data includes codes like "WELCOME10", "STUDENT15", etc.

**Key Fields:**
- `id` - UUID primary key
- `code` - Promo code (unique)
- `description` - Code description (English, optional)
- `discount_type` - Type of discount (percentage/fixed)
- `discount_value` - Discount amount
- `is_active` - Enable/disable status
- `used_count` - Usage counter
- `created_at`, `updated_at` - Timestamps

## 🔄 Recent Schema Changes

### What's New:
1. **Menu Items Enhancement:**
   - Changed `image_url` → `emoji` for better visual representation
   - Updated all sample data to use English names and descriptions
   - Added appropriate emoji icons for each menu item

2. **Promo Codes Simplification:**
   - Removed complex validation fields for easier management
   - Streamlined structure focuses on core discount functionality
   - Updated sample data with English descriptions

### Migration Notes:
- If upgrading from previous version, existing `image_url` data will need manual conversion to emoji
- Removed promo code fields are no longer validated in the application
- All sample data has been updated to reflect the new schema

## 🔧 Important Notes

1. **Development vs Production**: Development environment can disable RLS for easier testing, production environment must enable RLS for security
2. **Price Storage**: All prices are stored in cents to avoid floating-point precision issues
3. **Emoji Support**: Ensure your database and application support Unicode emoji characters
4. **Promo Code Validation**: Application layer handles basic validation (active status, usage count)
5. **Backup**: Please ensure important data is backed up before executing reset or delete scripts

## 🎯 Application Integration

The updated schema is fully integrated with the Next.js application:
- Dynamic Supabase configuration support
- Real-time CRUD operations for both tables
- Form validation and error handling
- Responsive UI with emoji display
- Settings page for database configuration
