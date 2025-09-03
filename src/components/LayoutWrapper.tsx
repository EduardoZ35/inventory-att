"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import Header from './Header';
import SessionTimeoutModal from './common/SessionTimeoutModal';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import { NotificationContainer } from './common/NotificationContainer';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export default function LayoutWrapper({ children }: LayoutWrapperProps) {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { setUser, setProfile, checkAuth } = useAuthStore();
  const router = useRouter();

  // Verificación adicional de autorización en el cliente
  useEffect(() => {
    // Evitar bucles infinitos verificando si ya estamos en una página de autenticación
    const currentPath = window.location.pathname;
    if (currentPath === '/auth' || currentPath === '/unauthorized' || currentPath.startsWith('/auth/')) {
      console.log('🔄 LayoutWrapper: Ya en página de auth, saltando verificación');
      setIsCheckingAuth(false);
      return;
    }

    // Verificación de autorización restaurada
    console.log('🔍 LayoutWrapper: Verificando autorización (respaldo del middleware)');
    
    let hasRedirected = false;

    const checkAuthorization = async () => {
      try {
        console.log('🔍 LayoutWrapper: SOLO DEBUGGING - SIN REDIRECCIONES');
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('❌ LayoutWrapper: No hay usuario');
          setUser(null);
          setProfile(null);
          setIsCheckingAuth(false);
          return;
        }

        console.log('👤 LayoutWrapper: Usuario encontrado:', user.email);

        // Actualizar el store con el usuario (asegurándonos de que email existe)
        if (user.email) {
          setUser(user as any);
        }

        // Verificar autorización en la base de datos
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('📋 LayoutWrapper: Perfil obtenido:', { 
          email: user.email,
          userId: user.id, 
          profile, 
          error,
          authorized: profile?.authorized,
          authorized_type: typeof profile?.authorized,
          is_blocked: profile?.is_blocked,
          is_blocked_type: typeof profile?.is_blocked,
          role: profile?.role
        });

        // Log detallado SIEMPRE para debugging
        console.log('🔍 DEBUG COMPLETO - Análisis detallado:', {
          profile_exists: !!profile,
          authorized_value: profile?.authorized,
          authorized_strict_true: profile?.authorized === true,
          authorized_strict_false: profile?.authorized === false,
          authorized_is_null: profile?.authorized === null,
          authorized_is_undefined: profile?.authorized === undefined,
          is_blocked_value: profile?.is_blocked,
          role_value: profile?.role,
          error_exists: !!error,
          error_message: error?.message
        });

        if (error || !profile) {
          console.log('❌ LayoutWrapper: Error obteniendo perfil - PERO NO REDIRIGIENDO');
          setProfile(null);
        } else {
          // Actualizar el store con el perfil
          setProfile(profile as any);
        }

        if (!profile?.authorized) {
          console.log('🚫 LayoutWrapper: Usuario no autorizado, redirigiendo a /unauthorized');
          window.location.href = '/unauthorized';
          return;
        }

        if (profile?.is_blocked) {
          console.log('🔒 LayoutWrapper: Usuario bloqueado, redirigiendo a /unauthorized');
          window.location.href = '/unauthorized?reason=blocked';
          return;
        }

        console.log('✅ LayoutWrapper: Usuario autorizado, permitiendo acceso');
        setIsCheckingAuth(false);

      } catch (err) {
        console.error('💥 LayoutWrapper: Error en verificación de autorización:', err);
        setIsCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [router]);

  const {
    showWarning,
    timeRemaining,
    handleExtendSession,
    handleConfirmLogout
  } = useSessionTimeout({
    timeoutMinutes: 30,
    warningMinutes: 1
  });

  // Mostrar loading mientras se verifica autorización
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando permisos...</p>
          <p className="text-gray-500 text-sm mt-2">🔍 Validando autorización del usuario</p>
          <p className="text-gray-400 text-xs mt-3">Máximo 3 segundos...</p>
          
          {/* Barra de progreso visual */}
          <div className="w-64 mx-auto mt-4 bg-gray-200 rounded-full h-1">
            <div 
              className="bg-blue-600 h-1 rounded-full animate-pulse"
              style={{
                animation: 'progress 3s linear forwards'
              }}
            ></div>
          </div>
          
          <style jsx>{`
            @keyframes progress {
              from { width: 0% }
              to { width: 100% }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-950">
        <Header />
        <main className="min-h-screen pt-0">
          {children}
        </main>
      </div>

      {/* Modal de timeout de sesión */}
      <SessionTimeoutModal
        isOpen={showWarning}
        timeRemaining={timeRemaining}
        onExtendSession={handleExtendSession}
        onConfirmLogout={handleConfirmLogout}
      />
      
      {/* Container de notificaciones - deshabilitado temporalmente */}
      {/* <NotificationContainer /> */}
    </>
  );
}
