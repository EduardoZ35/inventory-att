"use client";

import { useState, useEffect, Suspense } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAuthRedirectUrl } from '@/utils/redirectHandler';

// Componente que usa searchParams envuelto en Suspense
function AuthContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Verificar si necesitamos forzar re-login
  useEffect(() => {
    const forceLogin = searchParams.get('force_login');
    const logoutSuccess = searchParams.get('logout_success');
    const logoutError = searchParams.get('logout_error');
    
    if (forceLogin || logoutSuccess) {
      // Limpiar cualquier sesión residual
      supabase.auth.signOut({ scope: 'global' }).catch(() => {
        // Ignorar errores, solo asegurar limpieza
      });
      
      if (logoutSuccess) {
        setMessage('✅ Sesión cerrada correctamente. Puedes iniciar sesión con cualquier cuenta.');
      } else {
        setMessage('🔄 Sesión reiniciada. Selecciona tu cuenta para continuar.');
      }
    }
    
    if (logoutError) {
      setMessage('⚠️ Sesión cerrada con advertencias. Puedes intentar iniciar sesión nuevamente.');
    }
  }, [searchParams]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Obtener la URL de redirección correcta para el entorno actual
      const redirectUrl = getAuthRedirectUrl();
      console.log('🔄 Starting Google OAuth with redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            // Forzar a Google a mostrar selector de cuenta
            prompt: 'select_account',
            // Asegurar que no use cuenta en caché
            login_hint: '',
          },
        },
      });

      if (error) {
        throw error;
      }

      // La redirección a la página de productos se manejará en el callback de Google
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container gradient-bg">
      <div className="auth-card">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventario ATT</h1>
          <p className="text-gray-600">Bienvenido de vuelta</p>
        </div>

        {/* Tarjeta de autenticación */}
        <div className="card-modern p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede con tu cuenta de Google para continuar</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center px-6 py-4 border-2 border-gray-300 rounded-xl shadow-lg bg-white text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl"
            disabled={loading}
          >
            <svg className="w-6 h-6 mr-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-semibold text-lg text-gray-900">{loading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
          </button>

          {/* Mensajes de estado */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}
          
          {message && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente principal que usa Suspense
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="auth-container gradient-bg">
        <div className="auth-card">
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
