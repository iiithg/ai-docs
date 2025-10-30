"use client";
import { SupabaseClient } from '@supabase/supabase-js';
import { 
  MenuItem, 
  PromoCode, 
  CreateMenuItemData, 
  UpdateMenuItemData,
  CreatePromoCodeData,
  UpdatePromoCodeData 
} from './types';

// Menu Items CRUD Operations
export class MenuItemsService {
  constructor(private supabase: SupabaseClient) {}

  // Get all menu items
  async getAll(): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Get menu items by category
  async getByCategory(category: 'burger' | 'side' | 'drink'): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .eq('category', category)
      .order('name');
    
    if (error) throw error;
    return data || [];
  }

  // Get available menu items only
  async getAvailable(): Promise<MenuItem[]> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .eq('available', true)
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // Get single menu item by ID
  async getById(id: string): Promise<MenuItem | null> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Create new menu item
  async create(itemData: CreateMenuItemData): Promise<MenuItem> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .insert(itemData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update menu item
  async update(id: string, itemData: UpdateMenuItemData): Promise<MenuItem> {
    const { data, error } = await this.supabase
      .from('menu_items')
      .update(itemData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Toggle availability
  async toggleAvailability(id: string): Promise<MenuItem> {
    // First get current availability status
    const current = await this.getById(id);
    if (!current) throw new Error('Menu item not found');
    
    return this.update(id, { available: !current.available });
  }

  // Delete menu item
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('menu_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Promo Codes CRUD Operations
export class PromoCodesService {
  constructor(private supabase: SupabaseClient) {}

  // Get all promo codes
  async getAll(): Promise<PromoCode[]> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Get active promo codes only
  async getActive(): Promise<PromoCode[]> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Get valid promo codes (active and within date range)
  async getValid(): Promise<PromoCode[]> {
    const now = new Date().toISOString();
    const { data, error } = await this.supabase
      .from('promo_codes')
      .select('*')
      .eq('is_active', true)
      .lte('valid_from', now)
      .or(`valid_until.is.null,valid_until.gte.${now}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Get single promo code by ID
  async getById(id: string): Promise<PromoCode | null> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Get promo code by code string
  async getByCode(code: string): Promise<PromoCode | null> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .select('*')
      .ilike('code', code) // Case-insensitive search
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }

  // Validate promo code for use
  async validateCode(code: string, orderAmountCents: number): Promise<{
    valid: boolean;
    promoCode?: PromoCode;
    error?: string;
  }> {
    const promoCode = await this.getByCode(code);
    
    if (!promoCode) {
      return { valid: false, error: 'Promo code does not exist' };
    }

    if (!promoCode.is_active) {
      return { valid: false, error: 'Promo code is disabled' };
    }

    const now = new Date();
    const validFrom = new Date(promoCode.valid_from);
    const validUntil = promoCode.valid_until ? new Date(promoCode.valid_until) : null;

    if (now < validFrom) {
      return { valid: false, error: 'Promo code is not yet active' };
    }

    if (validUntil && now > validUntil) {
      return { valid: false, error: 'Promo code has expired' };
    }

    if (orderAmountCents < promoCode.min_order_cents) {
      return {
        valid: false,
        error: `Order must be at least ¥${(promoCode.min_order_cents / 100).toFixed(2)}`
      };
    }

    if (promoCode.usage_limit && promoCode.used_count >= promoCode.usage_limit) {
      return { valid: false, error: 'Promo code usage limit reached' };
    }

    return { valid: true, promoCode };
  }

  // Create new promo code
  async create(codeData: CreatePromoCodeData): Promise<PromoCode> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .insert(codeData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Update promo code
  async update(id: string, codeData: UpdatePromoCodeData): Promise<PromoCode> {
    const { data, error } = await this.supabase
      .from('promo_codes')
      .update(codeData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Toggle active status
  async toggleActive(id: string): Promise<PromoCode> {
    const current = await this.getById(id);
    if (!current) throw new Error('Promo code not found');
    
    return this.update(id, { is_active: !current.is_active });
  }

  // Increment usage count
  async incrementUsage(id: string): Promise<PromoCode> {
    const current = await this.getById(id);
    if (!current) throw new Error('Promo code not found');
    
    return this.update(id, { used_count: current.used_count + 1 });
  }

  // Delete promo code
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('promo_codes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}

// Factory function to create service instances
export function createDatabaseServices(supabase: SupabaseClient) {
  return {
    menuItems: new MenuItemsService(supabase),
    promoCodes: new PromoCodesService(supabase)
  };
}