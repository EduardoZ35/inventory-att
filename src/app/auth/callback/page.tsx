"use client";

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { redirectToDashboard, redirectToAuth } from '@/utils/redirectHandler';
import { autoCreateOrUpdateProfile } from '@/utils/autoCreateProfile';

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
          console.log('✅ Auth successful, auto-creating/updating profile...');
          
          // Auto-crear o actualizar perfil con datos de Google
          await autoCreateOrUpdateProfile(data.session.user);
          
          console.log('✅ Profile processed, redirecting to dashboard');
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
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === 'SIGNED_IN') {
        console.log('🔄 Auth state changed: session found, processing profile...');
        await autoCreateOrUpdateProfile(session.user);
        redirectToDashboard();
      } else if (!session) {
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
