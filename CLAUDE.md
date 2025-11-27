# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a collection of Supabase demonstration projects featuring a burger shop theme. Each app isolates specific Supabase features for learning and demonstration purposes.

### Project Structure

- `apps/burger-template/` - Base Next.js template with burger shop UI, no database required
- `apps/project-burger-shop-menu-crud-1/` - Menu items CRUD with database operations
- `apps/project-burger-shop-auth-users-2/` - Authentication, profiles, wallet system, and admin controls
- `apps/project-burger-shop-realtime-orders-3/` - Realtime chat and presence cursors
- `apps/project-burger-shop-storage-uploads-4/` - File storage for avatars with anonymous/guest uploads
- `apps/project-burger-shop-edge-function-5/` - Edge function demos with LLM chat, email service, user registration
- `apps/project-burger-shop-auth-advanced-supabase-6/` - Advanced authentication with Supabase OAuth
- `apps/project-burger-shop-auth-advanced-clerk-7/` - Advanced authentication with Clerk integration
- `apps_snakegame/` - Modern React 18 + Vite Snake game with enhanced gameplay mechanics

### Architecture

All burger shop apps share:

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL with real-time subscriptions)
- **Language**: TypeScript with 2-space indentation, single quotes, semicolons

The snake game uses a different stack:

- **Framework**: React 18 with Vite 7
- **Styling**: Modern CSS with CSS variables and animations
- **Database**: None (client-side only)
- **Language**: JavaScript with modern ES6+ features

Each demo app is scaffolded from `burger-template` and focuses on a single feature set. Database initialization is handled through SQL scripts in each app's `scripts/` directory.

## Authentication Architecture

The auth-users app demonstrates a complete authentication system with:

- **Dynamic Supabase Configuration**: Runtime configuration via UI settings stored in localStorage
- **JWT-based Authentication**: Automatic token management by Supabase client
- **Profile System**: Automated profile creation with triggers on user signup
- **Role-based Access Control**: User and admin roles with RLS policies
- **Wallet Integration**: Atomic financial operations via PostgreSQL RPCs

### Advanced Authentication Patterns

- **auth-advanced-supabase-6**: OAuth integration (Google/GitHub), password reset flows, middleware-based session management, and dynamic configuration
- **auth-advanced-clerk-7**: Third-party auth provider integration with pre-built UI components, organization support, and multi-tenancy

## Database Service Layer

Apps with database operations use a service layer pattern (`lib/database.ts`):

- **Class-based Services**: `MenuItemsService`, `PromoCodesService`, etc.
- **Type Safety**: Full TypeScript interfaces for all data structures
- **Error Handling**: Consistent error throwing and handling
- **Supabase Client Injection**: Services accept SupabaseClient instances

### Service Layer Pattern Example

```typescript
export class MenuItemsService {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*');
    if (error) throw error;
    return data || [];
  }
}

export function createDatabaseServices(supabase: SupabaseClient) {
  return {
    menuItems: new MenuItemsService(supabase),
    profiles: new ProfilesService(supabase),
  };
}
```

## Development Commands

### Per App Development

Navigate to any app directory (e.g., `cd apps/burger-template`):

```bash
npm install          # Install dependencies
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint checks
```

### Snake Game Development (apps_snakegame)

The snake game uses Vite instead of Next.js:

```bash
cd apps_snakegame
npm install          # Install dependencies
npm run dev          # Start development server (localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint checks
```

### Database Setup

Each app with database features includes:

- `.env.example` - Copy to `.env.local` and fill with your Supabase credentials
- `scripts/init.sql` - Complete database initialization script
- `scripts/README.md` - Database setup instructions

**SQL Script Organization:**

- **Single-file apps** (auth-users-2, realtime-orders-3): Use `scripts/init.sql`
- **Multi-file apps** (menu-crud-1): Use numbered scripts (`000-extensions.sql`, `010-table_*.sql`, etc.) and `scripts/init-all.sql`

Run SQL scripts via:

1. Supabase Dashboard SQL Editor (recommended)
2. `psql` command line: `psql -f scripts/init.sql $DATABASE_URL`
3. For multi-file: `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/init-all.sql`

### Environment Variables

Required in `.env.local` for database-connected apps:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

For auth-users app additional options:

```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com,another@example.com
```

## Key Patterns and Conventions

### Component Organization

- Pages in `app/` following Next.js App Router
- Shared components in `components/` or `lib/`
- Database functions in `lib/database.ts`
- Environment-protected client creation with `maybeCreateBrowserClient()`

### Database Patterns

- All demos use Row Level Security (RLS) policies
- Development policies are permissive; production policies are stricter
- Stored procedures (RPCs) for complex operations like purchases
- Automatic triggers for profile creation and timestamp management
- Idempotent SQL scripts using `drop-if-exists`/`create or replace`

### Code Style

- TypeScript strict mode enabled
- Components: `PascalCase.tsx`
- Hooks: `useSomething.ts`
- Files and folders: `kebab-case`
- Named exports preferred over default exports

## Common Database Schema

### Shared Tables Across Apps

- **menu_items**: Product catalog with quantity tracking
- **profiles**: User profiles with wallet and role management
- **orders**: Purchase history with atomic operations
- **promo_codes**: Discount management system

### Key Database Features

- **Atomic Operations**: All financial operations use PostgreSQL transactions
- **Automatic Triggers**: Profile creation on user signup, stock management
- **RLS Implementation**: Production-ready security policies
- **Storage Buckets**: For file uploads with access control policies

## Testing and Quality

- Linting via Next.js ESLint configuration
- No formal test suites currently (demo apps)
- Manual testing focused on feature demonstration

## Development Workflow

1. **New Features**: Start from `burger-template` or clone an existing demo
2. **Database Changes**: Update SQL scripts in `scripts/` directory
3. **Documentation**: Update per-app README.md and project docs in `docs/`

## Edge Functions

Edge Functions are located in `supabase/functions/` and use Deno runtime:

- **weather**: External API proxy example
- **llm-chat**: OpenAI GPT integration
- **send-email**: Email service with templates
- **user-registration**: Automated signup workflow
- **signup-with-invite**: Invite-only registration
- **manage-invites**: CRUD operations for invitation codes

Deploy with: `supabase functions deploy`

## Important Notes

- Never commit secrets or actual API keys
- Use service role keys only in Edge Functions, never client-side
- Development RLS policies may be permissive for demo purposes
- Always test database initialization in a fresh Supabase project
- Each app is self-contained and can run independently