# Burger Template (Next.js + Supabase)

Minimal Next.js App Router template with a burger‑shop style UI and a local demo shop (cart + wallet, inventory, combos, coupon, tips, loyalty points). Features a modern user avatar component with profile display. No backend required.

## Features

### 🛒 **Shop Functionality**
- Interactive burger shop with cart system
- Wallet management ($25.00 starting balance)
- Real-time inventory tracking
- Combo deals: $1 off per Burger+Side+Drink set
- Coupon system: `BURGER10` for 10% off
- Tip options: 0/10/15%
- Loyalty points: earn 1pt per $1, redeem per 100pts

### 👤 **User Avatar Component**
- Modern avatar display in header (top-right corner)
- Support for both emoji and image avatars
- Click to view user profile information:
  - Account balance
  - Birthday
  - User name
- Smooth animations and hover effects
- Click outside or press ESC to close
- Responsive design with Tailwind CSS

### 🛠 **Developer Tools**
- Dev Tools panel (sidebar): restock, reset, clear local save
- Local storage persistence
- Real-time state management

## Quickstart
- Env is optional for the template. To keep it purely UI-only, skip env setup.
- If you want to test Supabase wiring, copy `.env.example` → `.env.local` and set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Install deps and run:
  ```bash
  npm install
  npm run dev
  ```
- Open `http://localhost:3000` and explore:
  - Shop for burgers, sides, and drinks
  - Click the avatar in the top-right to view profile
  - Use coupon code `BURGER10` for discount
  - Try combo deals and loyalty system

## Structure
- `app/layout.tsx` — Main layout with header, navigation, and user avatar
- `app/page.tsx` — Shop interface with cart, wallet, and inventory management
- `app/components/UserAvatar.tsx` — Reusable avatar component with profile popup
- `lib/supabase/client.ts` — Browser client factory for Supabase integration
- `styles/globals.css` — Tailwind CSS configuration

## Components

### UserAvatar
A flexible avatar component that supports:
- **Props**: `userInfo` object with name, balance, birthday, avatar, and isEmoji flag
- **Avatar Types**: Emoji avatars or image URLs with fallback handling
- **Interactions**: Click to toggle profile, keyboard navigation (ESC), click outside to close
- **Styling**: Gradient backgrounds, smooth transitions, responsive design

## Notes
- This template has no database schema; feature apps will add SQL/RLS.
- Keep components small; use Postgres as state where it makes sense.
- User data is currently mocked; integrate with your authentication system as needed.
- All styling uses Tailwind CSS with custom burger-themed color palette.
