# project-burger-shop-menu-crud-1

🍔 **Burger Shop Management System** - A comprehensive CRUD demo showcasing Supabase integration with Next.js

This project demonstrates a complete burger shop management system with menu items and promotional codes management, built with modern web technologies and Supabase as the backend.

## 🚀 Features

### Supabase Integration
This project showcases the following **Supabase features**:

- **🗄️ Database & Tables**: PostgreSQL database with custom tables (`menu_items`, `promo_codes`)
- **🔐 Row Level Security (RLS)**: Configurable security policies (disabled for development, can be enabled for production)
- **📊 Real-time Data**: Live updates when data changes
- **🔑 Authentication Ready**: Built with Supabase Auth integration capabilities
- **⚡ Edge Functions Ready**: Prepared for serverless function integration
- **🛠️ SQL Editor Integration**: Direct database management through Supabase Dashboard

### Application Features
- **📋 Menu Management**: Complete CRUD operations for burger shop menu items
  - Create, read, update, delete menu items
  - Category management (burgers, sides, drinks)
  - Price management (stored in cents for precision)
  - Availability toggle
- **🎫 Promo Code System**: Full promotional code management
  - Percentage and fixed amount discounts
  - Usage limits and expiration dates
  - Minimum order requirements
  - Enable/disable functionality
- **⚙️ Dynamic Configuration**: Runtime Supabase configuration through UI settings
- **📱 Responsive Design**: Modern, mobile-friendly interface
- **🎨 Beautiful UI**: Clean design with Tailwind CSS

## 🛠️ Setup

### Option 1: Dynamic Configuration (Recommended)
1. Start the application (see Run section below)
2. Click the settings button (⚙️) in the top-right corner
3. Enter your Supabase URL and Anon Key
4. Settings are automatically saved to localStorage

### Option 2: Environment Variables
- Copy `.env.example` → `.env.local` and set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🏃‍♂️ Run
```bash
npm install
npm run dev
```
- Open `http://localhost:3000` (or whatever `PORT` you set when running `next dev`) to start managing your burger shop.

## 📁 Project Structure

### Core Application Files
- **`app/page.tsx`** — Main application component with complete CRUD UI
- **`app/components/Settings.tsx`** — Dynamic Supabase configuration component
- **`lib/supabase/client.ts`** — Original Supabase client factory
- **`lib/supabase/dynamic-client.ts`** — Dynamic Supabase client with runtime configuration
- **`lib/database.ts`** — Database service layer with CRUD operations
- **`lib/types.ts`** — TypeScript type definitions
- **`app/layout.tsx`** — Application layout and global styles

### Database Scripts
- **`scripts/`** — SQL scripts for database setup and management
  - **`init.sql`** — 🌟 One-time initialization script (recommended)
  - The script is organized into clearly labeled sections (extensions, tables, seeds) so you can run parts individually if needed
  - See `scripts/README.md` for detailed instructions

## Database Setup

### 🚀 One-time Initialization (Recommended)

The simplest approach is to run the single initialization script.

1. Open the Supabase Dashboard and select your project
2. Go to SQL Editor → New query
3. Copy the entire contents of `scripts/init.sql`
4. Paste into the SQL Editor and click Run

After success, verify in Table Editor that you have:
- `menu_items` with 17 sample items
- `promo_codes` with 10 sample codes

### 📋 Step-by-step (Optional)

Open `scripts/init.sql` and execute one section at a time (extensions, tables, RLS toggles, seeds). Each block is separated by banner comments so you can copy/paste only what you need.

### 🗄️ Database Tables

#### menu_items
Complete menu item management with the following features:
- **Categories**: burger, side, drink
- **Pricing**: Stored in cents for precision (e.g., $8.99 = 899 cents)
- **Availability**: Toggle items on/off
- **Metadata**: Name, description, creation/update timestamps
- **Sample Data**: 17 pre-loaded menu items across all categories

#### promo_codes  
Flexible promotional code system supporting:
- **Discount Types**: Percentage (%) or fixed amount ($)
- **Usage Controls**: Maximum usage limits per code
- **Validity**: Start and end dates
- **Order Requirements**: Minimum order amount thresholds
- **Status Management**: Enable/disable codes
- **Sample Data**: 10 pre-configured promotional codes

### 🔧 Technical Implementation

This project demonstrates several **Supabase best practices**:

1. **Database Design**: Proper table structure with constraints and triggers
2. **Type Safety**: Full TypeScript integration with Supabase types
3. **Error Handling**: Comprehensive error management for database operations
4. **Performance**: Efficient queries and data fetching patterns
5. **Security**: RLS-ready architecture (disabled for development ease)
6. **Flexibility**: Runtime configuration without environment variable dependencies

For detailed database setup instructions, see `scripts/README.md`.
