# Project5-Supabase-Demos

A collection of simple demos demonstrating the basic features of Supabase using a burger shop theme. Each project focuses on specific Supabase features and can be run independently.

## 🏗️ Project Structure

```
Project5-Supabase-Demos/
├── apps/
│   ├── burger-template/                    # Base Next.js template, no database required
│   ├── project-burger-shop-menu-crud-1/    # Menu items CRUD operations
│   ├── project-burger-shop-auth-users-2/   # Authentication, profiles, wallet system
│   ├── project-burger-shop-realtime-orders-3/ # Realtime chat and presence
│   ├── project-burger-shop-storage-uploads-4/ # File storage for avatars
│   └── project-burger-shop-edge-function-5/  # Edge function demos
├── docs/                                    # Documentation and tutorials
└── CLAUDE.md                               # Development guidelines for Claude Code
```

## 🚀 Quick Start

Each application is self-contained and can be run independently. Navigate to any app directory to start development:

### Common Commands (All Apps)

```bash
cd apps/[app-name]           # Navigate to the app directory
npm install                  # Install dependencies
npm run dev                  # Start development server (localhost:3000)
npm run build               # Production build
npm run start               # Start production server
npm run lint                # ESLint checks
```

## 📁 Individual Project Setup

### 1. burger-template
**Base template with local shop functionality - No database required**

```bash
cd apps/burger-template
npm install
npm run dev
```

**Features:**
- Interactive burger shop UI with cart system
- Local wallet management ($25.00 starting balance)
- Coupon system (`BURGER10` for 10% off)
- Loyalty points system
- No Supabase setup required

---

### 2. project-burger-shop-menu-crud-1
**Menu items CRUD operations with database**

```bash
cd apps/project-burger-shop-menu-crud-1
npm install

# Database Setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Run database initialization
# Option 1: Supabase Dashboard SQL Editor (recommended)
# Option 2: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init-all.sql

npm run dev
```

**Features:**
- Complete CRUD operations for menu items
- Promo code management system
- Database persistence with Supabase
- Multi-file SQL scripts for organized database setup

---

### 3. project-burger-shop-auth-users-2
**Authentication, profiles, wallet system, and admin controls**

```bash
cd apps/project-burger-shop-auth-users-2
npm install

# Database Setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com

# Run database initialization
# Option 1: Supabase Dashboard SQL Editor (recommended)
# Option 2: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql

npm run dev
```

**Features:**
- Email/password authentication with Supabase Auth
- User profiles with wallet system
- One-time welcome bonus system
- Stock management with automatic updates
- Admin dashboard with role-based access control
- Dynamic Supabase configuration via UI settings

---

### 4. project-burger-shop-realtime-orders-3
**Realtime chat and presence cursors**

```bash
cd apps/project-burger-shop-realtime-orders-3
npm install

# Database Setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database initialization
# Option 1: Supabase Dashboard SQL Editor (recommended)
# Option 2: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql

npm run dev
```

**Features:**
- Realtime chat functionality
- Presence indicators and cursors
- WebSocket-based live updates
- Public and private chat rooms

---

### 5. project-burger-shop-storage-uploads-4
**File storage for avatars and uploads**

```bash
cd apps/project-burger-shop-storage-uploads-4
npm install

# Database Setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database initialization
# Option 1: Supabase Dashboard SQL Editor (recommended)
# Option 2: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/storage-avatars.sql

npm run dev
```

**Features:**
- File upload and storage management
- Avatar upload functionality
- Public and private bucket access
- Image optimization and transformation

---

### 6. project-burger-shop-edge-function-5
**Edge function demonstrations**

```bash
cd apps/project-burger-shop-edge-function-5
npm install

# Environment Setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

npm run dev
```

**Features:**
- Serverless edge functions
- API endpoints with custom logic
- Weather integration examples
- Server-side processing capabilities

## 🛠️ Development Workflow

### Prerequisites

- Node.js 18+ installed
- Supabase account (for database-connected apps)
- Git for version control

### Database Setup Tips

1. **Create a new Supabase project** for each demo to avoid conflicts
2. **Use the SQL Editor** in Supabase Dashboard for easier database initialization
3. **Save your credentials** securely in `.env.local` (never commit)
4. **Test with fresh projects** when experimenting

### Environment Variables

Most apps require these environment variables in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Common Issues & Solutions

- **Port conflicts**: Each app runs on port 3000; stop other instances before starting a new one
- **Database connection errors**: Verify your Supabase URL and keys are correct
- **SQL script failures**: Ensure you're using a fresh Supabase project

## 📚 Learning Path

Recommended order for learning Supabase features:

1. **burger-template** - Basic Next.js setup and UI components
2. **project-burger-shop-menu-crud-1** - Database basics and CRUD operations
3. **project-burger-shop-auth-users-2** - Authentication and row-level security
4. **project-burger-shop-realtime-orders-3** - Realtime subscriptions
5. **project-burger-shop-storage-uploads-4** - File storage and uploads
6. **project-burger-shop-edge-function-5** - Edge functions and serverless logic

## 🤝 Contributing

This repository is designed for educational purposes. Each app demonstrates specific Supabase features in isolation to make learning easier and more focused.

## 📄 License

This project is for educational and demonstration purposes.