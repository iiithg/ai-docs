# Project5-Supabase-Demos

A collection of simple demos demonstrating the basic features of Supabase using a burger shop theme. Each project focuses on specific Supabase features and can be run independently.

## 🎯 About This Project

This repository provides hands-on learning experience for developers getting started with Supabase. Each demo is a self-contained application showcasing specific features, from basic CRUD operations to advanced real-time subscriptions and edge functions.

**Tech Stack:**

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🏗️ Project Structure

```
Project5-Supabase-Demos/
├── apps/
│   ├── burger-template/                               # Base Next.js template, no database required
│   ├── project-burger-shop-menu-crud-1/               # Menu items CRUD operations
│   ├── project-burger-shop-auth-users-2/              # Authentication, profiles, wallet system
│   ├── project-burger-shop-realtime-orders-3/         # Realtime chat and presence
│   ├── project-burger-shop-storage-uploads-4/         # File storage for avatars
│   ├── project-burger-shop-edge-function-5/           # Edge function demos
│   ├── project-burger-shop-auth-advanced-supabase-6/  # Advanced Auth with Supabase
│   ├── project-burger-shop-auth-advanced-clerk-7/     # Advanced Auth with Clerk
│   └── sql-examples/                                  # Standalone SQL lessons (no frontend)
├── apps_snakegame/                                    # Snake game built with React and Vite
├── docs/                                              # Documentation and tutorials
├── AGENTS.md                                          # Repository-wide contributor guide
└── CLAUDE.md                                          # Development guidelines for Claude Code
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
# Option 2: psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init.sql

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

---

### 7. project-burger-shop-auth-advanced-supabase-6
**Advanced authentication with Supabase**

```bash
cd apps/project-burger-shop-auth-advanced-supabase-6
npm install

# Environment Setup
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

npm run dev
```

**Features:**
- Google/GitHub OAuth and email/password login
- Password reset flow (email link → reset page)
- Dynamic Supabase configuration via Settings (localStorage) with `.env` fallback
- Protected pages with middleware cookie refresh and in-page guards
- Row-level security (RLS) policies for `public.profiles`

Additional setup:
- Add redirect URLs in Supabase Dashboard → Authentication → URL configuration:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/auth/reset`

---

### 8. project-burger-shop-auth-advanced-clerk-7
**Advanced authentication with Clerk**

```bash
cd apps/project-burger-shop-auth-advanced-clerk-7
npm install

# Environment Setup
cp .env.example .env.local
# Edit .env.local with your Clerk credentials

npm run dev
```

**Features:**
- Integration with Clerk for authentication
- Pre-built UI components for login, signup, and user profiles
- Organization and multi-tenancy support
- Seamless session management

---

### 9. apps_snakegame
**Modern Snake Game with React and Vite**

```bash
cd apps_snakegame
npm install
npm run dev
```

**Features:**
- React 18 with modern hooks and concurrent features
- Vite 7 for ultra-fast development and building
- Enhanced food mechanics with different bean types
- Smooth animations and modern visual effects
- Web Audio API for dynamic sound effects
- Fully responsive design for mobile devices
- Ghost mode for wall-phasing ability
- Strategic gameplay with power-ups and speed modifiers

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

## 🚀 Supabase Edge Functions Development Approaches

Supabase provides two mainstream development approaches for Edge Functions, meeting different team workflow needs:

### 1. CLI Deployment (ideal for professional developers & CI/CD)
- Local bundling: use the Supabase CLI to compile source code into a single `main.js`.
- Secure upload: push to the cloud via Bearer Token authentication.
- Best for automated deployments and GitOps pipelines.

### 2. Studio Visual Deployment (ideal for rapid iteration & team collaboration)
- Edit function code directly in the browser.
- One‑click publishing with "Save and Deploy".
- Syntax highlighting, error tips, and real‑time saving.
- No local environment required; product managers and operations can participate.

### Complete Serverless Development Loop
Together, these two approaches form a complete, efficient, and out‑of‑the‑box serverless development loop on Supabase Cloud.

## ⚠️ Open‑Source Supabase Capability Gap: Engine Without a Cockpit

Supabase is open‑source, but its Edge Functions management backend (FaaS Backend) is not open‑source. This implies:

**What you can do**
- Run edge functions locally using `supabase start` (simulation environment).
- Deploy a container that includes `edge-runtime`.

**What you cannot do**
- Create, edit, or deploy functions via Studio.
- Push code to a self‑hosted instance via CLI.

Many enterprises attempting to self‑host Supabase find Edge Functions "unavailable" or "only manual script deployment", and eventually abandon this core capability.

## 🏢 Enterprise‑Grade Development: PolarDB Supabase (Managed)

PolarDB Supabase is a fully managed Supabase service built on PolarDB for PostgreSQL. It integrates Realtime, RESTful APIs, GoTrue authentication, file storage, and logging collection, with optimizations and enhancements. It removes complex parameter management and operational overhead, offering a flexible and high‑performance backend solution. Teams can quickly build modern Web apps, SaaS platforms, and AI‑integrated applications.

Reference: https://help.aliyun.com/zh/polardb/polardb-for-postgresql/polardb-supabase-best-practices

## 📚 Learning Path

We recommend following this order to get the most out of these demos:

1.  **burger-template**: Get familiar with the basic Next.js setup and UI components.
2.  **project-burger-shop-menu-crud-1**: Learn the fundamentals of database interactions with Supabase.
3.  **project-burger-shop-auth-users-2**: Dive into authentication and user management.
4.  **project-burger-shop-realtime-orders-3**: Explore the power of real-time applications.
5.  **project-burger-shop-storage-uploads-4**: Understand how to manage file storage.
6.  **project-burger-shop-edge-function-5**: Get started with serverless logic.
7.  **project-burger-shop-auth-advanced-supabase-6**: Explore advanced authentication patterns with Supabase.
8. **project-burger-shop-auth-advanced-clerk-7**: Learn how to integrate a third-party auth provider like Clerk.
9. **apps_snakegame**: Enjoy a fun break with a modern React-based Snake game demonstrating advanced React patterns.

## 🤝 Contributing

Contributions are welcome! If you have an idea for a new demo or an improvement to an existing one, please feel free to open an issue or submit a pull request.

### How to Contribute

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature`).
6. Open a pull request.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
