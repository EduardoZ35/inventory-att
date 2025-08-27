import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Profile } from '@/types';
import { authService } from '@/services/authService';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Async actions
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
  requestAuthorization: () => Promise<{ success: boolean; error?: string }>;
  
  // Utils
  clearAuth: () => void;
  hasRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
  canManage: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isLoading: true,
      isAuthenticated: false,
      isAuthorized: false,
      
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user,
        isLoading: false 
      }),
      
      setProfile: (profile) => set({ 
        profile,
        isAuthorized: profile ? profile.authorized === true && profile.is_blocked !== true : false
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      checkAuth: async () => {
        set({ isLoading: true });
        try {
          const user = await authService.getCurrentUser();
          const profile = user ? await authService.getCurrentProfile() : null;
          
          set({
            user,
            profile,
            isAuthenticated: !!user,
            isAuthorized: profile ? profile.authorized === true && profile.is_blocked !== true : false,
            isLoading: false,
          });
        } catch (error) {
          console.error('Error checking auth:', error);
          set({ 
            user: null,
            profile: null,
            isAuthenticated: false,
            isAuthorized: false,
            isLoading: false 
          });
        }
      },
      
      signOut: async () => {
        set({ isLoading: true });
        try {
          await authService.signOut();
          get().clearAuth();
        } catch (error) {
          console.error('Error signing out:', error);
        } finally {
          set({ isLoading: false });
        }
      },
      
      requestAuthorization: async () => {
        const result = await authService.requestAuthorization();
        if (result.success) {
          // Actualizar el perfil local
          const currentProfile = get().profile;
          if (currentProfile) {
            set({
              profile: {
                ...currentProfile,
                auth_request_pending: true,
                auth_request_date: new Date().toISOString(),
                auth_request_status: 'pending',
              }
            });
          }
        }
        return result;
      },
      
      clearAuth: () => set({ 
        user: null, 
        profile: null,
        isAuthenticated: false,
        isAuthorized: false,
      }),
      
      hasRole: (roles) => {
        const profile = get().profile;
        return profile ? roles.includes(profile.role) : false;
      },
      
      isAdmin: () => {
        const profile = get().profile;
        return profile?.role === 'admin';
      },
      
      canManage: () => {
        const profile = get().profile;
        return profile ? ['admin', 'manager'].includes(profile.role) : false;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
