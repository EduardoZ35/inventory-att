"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useSignOut } from '@/hooks/useSignOut';

export default function UnauthorizedPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason');

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error getting user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  const { signOut } = useSignOut();

  const handleSignOut = async () => {
    try {
      // Usar el hook personalizado que maneja tanto Supabase como Google
      await signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Si falla, al menos redirige al auth
      router.push('/auth');
    }
  };

  const getTitle = () => {
    if (reason === 'blocked') {
      return '🚫 Cuenta Bloqueada';
    }
    return '🔒 Acceso No Autorizado';
  };

  const getMessage = () => {
    if (reason === 'blocked') {
      return 'Tu cuenta ha sido bloqueada por un administrador. Si crees que esto es un error, contacta al administrador del sistema.';
    }
    return 'Tu cuenta no está autorizada para acceder a este sistema. Solo los usuarios pre-autorizados pueden ingresar.';
  };

  const getSubMessage = () => {
    if (reason === 'blocked') {
      return 'Para recuperar el acceso, un administrador debe desbloquear tu cuenta.';
    }
    return 'Para obtener acceso, solicita autorización al administrador del sistema.';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Header con gradiente */}
          <div className={`px-8 py-6 ${reason === 'blocked' ? 'bg-gradient-to-r from-red-500 to-red-600' : 'bg-gradient-to-r from-yellow-500 to-orange-500'} text-white text-center`}>
            <div className="text-4xl mb-2">
              {reason === 'blocked' ? '🚫' : '🔒'}
            </div>
            <h1 className="text-xl font-bold">
              {getTitle()}
            </h1>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Información del usuario */}
            {user && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      {user.user_metadata?.full_name || 'Usuario'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mensaje principal */}
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-3">
                {getMessage()}
              </p>
              <p className="text-sm text-gray-600">
                {getSubMessage()}
              </p>
            </div>

            {/* Información de contacto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                📞 Contactar Administrador
              </h3>
              <p className="text-sm text-blue-800">
                Si necesitas acceso al sistema, contacta al administrador:
              </p>
              <p className="text-sm font-medium text-blue-900 mt-1">
                📧 ezuniga@rflex.cl
              </p>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>

              <button
                onClick={() => router.push('/auth')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                <span>Volver al Login</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Sistema de Gestión de Inventario
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Acceso restringido solo a usuarios autorizados
          </p>
        </div>
      </div>
    </div>
  );
}
