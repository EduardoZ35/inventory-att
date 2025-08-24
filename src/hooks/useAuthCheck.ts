import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthStatus {
  isLoading: boolean;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  userRole: string | null;
  userProfile: any | null;
}

export function useAuthCheck(): AuthStatus {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    isLoading: true,
    isAuthenticated: false,
    isAuthorized: false,
    userRole: null,
    userProfile: null
  });

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔍 Verificando autenticación y autorización...');
        
        // Obtener sesión actual
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session?.user) {
          console.log('❌ No hay sesión activa');
          setAuthStatus({
            isLoading: false,
            isAuthenticated: false,
            isAuthorized: false,
            userRole: null,
            userProfile: null
          });
          return;
        }

        console.log('✅ Usuario autenticado:', session.user.email);

        // Obtener perfil del usuario
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('❌ Error obteniendo perfil:', profileError);
          setAuthStatus({
            isLoading: false,
            isAuthenticated: true,
            isAuthorized: false,
            userRole: null,
            userProfile: null
          });
          return;
        }

        console.log('📊 Perfil obtenido:', {
          email: session.user.email,
          role: profile.role,
          authorized: profile.authorized,
          is_blocked: profile.is_blocked
        });

        // Verificar autorización
        const isAuthorized = profile.authorized === true && profile.is_blocked !== true;

        setAuthStatus({
          isLoading: false,
          isAuthenticated: true,
          isAuthorized,
          userRole: profile.role,
          userProfile: profile
        });

        // Si no está autorizado, redirigir a página de no autorizado
        if (!isAuthorized && window.location.pathname !== '/unauthorized') {
          console.log('⚠️ Usuario no autorizado, redirigiendo...');
          router.push('/unauthorized');
        }

      } catch (err) {
        console.error('❌ Error en verificación de auth:', err);
        setAuthStatus({
          isLoading: false,
          isAuthenticated: false,
          isAuthorized: false,
          userRole: null,
          userProfile: null
        });
      }
    };

    checkAuth();

    // Escuchar cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      checkAuth();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return authStatus;
}
