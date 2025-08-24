"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { redirectToDashboard, redirectToAuth } from '@/utils/redirectHandler';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔄 Processing auth callback...');
      
      try {
        // Procesar el callback de autenticación de Supabase
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Auth callback error:', error);
          redirectToAuth();
          return;
        }
        
        if (data.session) {
          console.log('✅ Auth successful, redirecting to dashboard');
          redirectToDashboard();
        } else {
          console.log('❌ No session found, redirecting to auth');
          redirectToAuth();
        }
      } catch (err) {
        console.error('❌ Unexpected error in auth callback:', err);
        redirectToAuth();
      }
    };

    // Iniciar el manejo del callback de autenticación
    handleAuthCallback();

    // También podemos usar un listener para cambios de estado de autenticación si es necesario
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        console.log('🔄 Auth state changed: session found, redirecting to dashboard');
        redirectToDashboard();
      } else {
        console.log('🔄 Auth state changed: no session, redirecting to auth');
        redirectToAuth();
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
