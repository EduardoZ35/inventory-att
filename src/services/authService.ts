import { supabase } from '@/lib/supabaseClient';
import type { User, Profile } from '@/types';

export const authService = {
  /**
   * Obtener usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user || !user.email) return null;
    return {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    };
  },

  /**
   * Obtener perfil del usuario actual
   */
  async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !data) return null;
    
    // Agregar email del usuario
    return {
      ...data,
      email: user.email || '',
    };
  },

  /**
   * Verificar si el usuario está autorizado
   */
  async checkAuthorization(): Promise<{
    isAuthenticated: boolean;
    isAuthorized: boolean;
    profile: Profile | null;
  }> {
    const user = await this.getCurrentUser();
    if (!user) {
      return { isAuthenticated: false, isAuthorized: false, profile: null };
    }

    const profile = await this.getCurrentProfile();
    if (!profile) {
      return { isAuthenticated: true, isAuthorized: false, profile: null };
    }

    const isAuthorized = profile.authorized === true && profile.is_blocked !== true;
    
    return {
      isAuthenticated: true,
      isAuthorized,
      profile,
    };
  },

  /**
   * Login con Google
   */
  async signInWithGoogle(redirectTo?: string) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });

    return { data, error };
  },

  /**
   * Cerrar sesión
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Solicitar autorización
   */
  async requestAuthorization(): Promise<{ success: boolean; error?: string }> {
    const user = await this.getCurrentUser();
    if (!user) {
      return { success: false, error: 'No hay usuario autenticado' };
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        auth_request_pending: true,
        auth_request_date: new Date().toISOString(),
        auth_request_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Escuchar cambios de autenticación
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Obtener rol del usuario
   */
  async getUserRole(): Promise<string | null> {
    const { data, error } = await supabase.rpc('get_user_role');
    if (error) return null;
    return data;
  },

  /**
   * Verificar si el usuario es admin
   */
  async isAdmin(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin';
  },

  /**
   * Verificar si el usuario puede gestionar (admin o manager)
   */
  async canManage(): Promise<boolean> {
    const role = await this.getUserRole();
    return role === 'admin' || role === 'manager';
  },
};
