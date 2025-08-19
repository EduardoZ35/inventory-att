"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Si hay una sesión, redirige a la página de productos
        router.push('/dashboard');
      } else {
        // Si no hay sesión (ej. error en la autenticación), redirige al login
        router.push('/auth');
      }
    };

    // Iniciar el manejo del callback de autenticación
    handleAuthCallback();

    // También podemos usar un listener para cambios de estado de autenticación si es necesario
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
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
