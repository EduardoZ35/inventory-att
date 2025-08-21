"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { getBaseUrl } from '@/utils/getBaseUrl';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Obtener la URL base para asegurar redirecciones correctas
      const baseUrl = getBaseUrl();
      console.log('Auth callback using base URL:', baseUrl);
      
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Si hay una sesión, redirige a la página de dashboard
        // Usar URL absoluta para evitar problemas de redirección
        window.location.href = `${baseUrl}/dashboard`;
      } else {
        // Si no hay sesión (ej. error en la autenticación), redirige al login
        window.location.href = `${baseUrl}/auth`;
      }
    };

    // Iniciar el manejo del callback de autenticación
    handleAuthCallback();

    // También podemos usar un listener para cambios de estado de autenticación si es necesario
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const baseUrl = getBaseUrl();
      if (session) {
        window.location.href = `${baseUrl}/dashboard`;
      } else {
        window.location.href = `${baseUrl}/auth`;
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Procesando autenticación...</p>
    </div>
  );
}
