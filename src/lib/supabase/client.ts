import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Cliente para uso en el navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
  global: {
    headers: {
      'x-application-name': 'inventory-att',
    },
  },
});

// Tipos de base de datos (se pueden generar con Supabase CLI)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string | null;
          last_name: string | null;
          role: 'admin' | 'manager' | 'viewer' | 'blocked';
          is_blocked: boolean | null;
          blocked_at: string | null;
          blocked_by: string | null;
          blocked_reason: string | null;
          authorized: boolean | null;
          authorized_at: string | null;
          authorized_by: string | null;
          auth_request_pending: boolean | null;
          auth_request_date: string | null;
          auth_request_status: 'approved' | 'rejected' | 'pending' | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      products: {
        Row: {
          id: number;
          name: string;
          description: string | null;
          price: number;
          product_type_id: number;
          product_model_id: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['products']['Insert']>;
      };
      // Agregar más tablas según sea necesario
    };
    Views: {
      // Definir vistas si las hay
    };
    Functions: {
      get_user_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      get_profiles_with_emails: {
        Args: Record<string, never>;
        Returns: Array<{
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: string;
          authorized: boolean;
          is_blocked: boolean;
          auth_request_pending: boolean;
        }>;
      };
    };
  };
};



