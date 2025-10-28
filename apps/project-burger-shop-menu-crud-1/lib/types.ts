// TypeScript types for the burger shop application

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  category: 'burger' | 'side' | 'drink';
  price_cents: number;
  available: boolean;
  emoji?: string;
  created_at: string;
  updated_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateMenuItemData {
  name: string;
  description?: string;
  category: 'burger' | 'side' | 'drink';
  price_cents: number;
  available?: boolean;
  emoji?: string;
}

export interface UpdateMenuItemData {
  name?: string;
  description?: string;
  category?: 'burger' | 'side' | 'drink';
  price_cents?: number;
  available?: boolean;
  emoji?: string;
}

export interface CreatePromoCodeData {
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount';
  discount_value: number;
  is_active?: boolean;
}

export interface UpdatePromoCodeData {
  code?: string;
  description?: string;
  discount_type?: 'percentage' | 'fixed_amount';
  discount_value?: number;
  used_count?: number;
  is_active?: boolean;
}

// Helper function to format price from cents to dollars
export function formatPrice(cents: number): string {
  return `¥${(cents / 100).toFixed(2)}`;
}

// Helper function to parse price from dollars to cents
export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[¥$,]/g, '');
  const dollars = parseFloat(cleaned);
  return Math.round(dollars * 100);
}