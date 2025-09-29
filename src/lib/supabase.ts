import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Types pour les tables Supabase
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          category: string;
          quantity: number;
          price: number;
          sku: string;
          serial_number: string | null;
          barcode: string | null;
          qr_code: string | null;
          supplier: string | null;
          location: string | null;
          status: 'en-stock' | 'sav' | 'vente' | 'en-utilisation' | 'hs';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          category: string;
          quantity?: number;
          price: number;
          sku: string;
          serial_number?: string | null;
          barcode?: string | null;
          qr_code?: string | null;
          supplier?: string | null;
          location?: string | null;
          status?: 'en-stock' | 'sav' | 'vente' | 'en-utilisation' | 'hs';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          category?: string;
          quantity?: number;
          price?: number;
          sku?: string;
          serial_number?: string | null;
          barcode?: string | null;
          qr_code?: string | null;
          supplier?: string | null;
          location?: string | null;
          status?: 'en-stock' | 'sav' | 'vente' | 'en-utilisation' | 'hs';
          created_at?: string;
          updated_at?: string;
        };
      };
      stock_movements: {
        Row: {
          id: string;
          product_id: string;
          type: 'in' | 'out' | 'adjustment' | 'sale' | 'return';
          quantity: number;
          reference: string | null;
          supplier: string | null;
          cost: number | null;
          reason: string | null;
          user_id: string | null;
          date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          type: 'in' | 'out' | 'adjustment' | 'sale' | 'return';
          quantity: number;
          reference?: string | null;
          supplier?: string | null;
          cost?: number | null;
          reason?: string | null;
          user_id?: string | null;
          date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          type?: 'in' | 'out' | 'adjustment' | 'sale' | 'return';
          quantity?: number;
          reference?: string | null;
          supplier?: string | null;
          cost?: number | null;
          reason?: string | null;
          user_id?: string | null;
          date?: string;
          created_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
