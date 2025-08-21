import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function useSignOut() {
  const router = useRouter();

  const signOut = async (redirectTo: string = '/auth') => {
    try {
      console.log('🚪 Iniciando cierre de sesión...');
      
      // 1. Cerrar sesión de Supabase
      await supabase.auth.signOut({ scope: 'global' });
      console.log('✅ Sesión de Supabase cerrada');
      
      // 2. Limpiar almacenamiento local completamente
      const keysToRemove = Object.keys(localStorage);
      keysToRemove.forEach(key => {
        if (key.includes('supabase') || key.includes('sb-') || key.includes('google') || key.includes('oauth')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
      console.log('✅ Almacenamiento local limpiado');
      
      // 3. Limpiar cookies relacionadas con autenticación
      const cookiesToClear = [
        'sb-qkerefsdylpfdljzjqza-auth-token',
        'sb-qkerefsdylpfdljzjqza-auth-token.0',
        'sb-qkerefsdylpfdljzjqza-auth-token.1',
        'sb-qkerefsdylpfdljzjqza-auth-token.2',
        'sb-qkerefsdylpfdljzjqza-auth-token.3',
        'sb-qkerefsdylpfdljzjqza-auth-token.4'
      ];
      
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
      });
      console.log('✅ Cookies limpiadas');
      
      // 4. Redirigir con parámetros para forzar nueva autenticación
      const redirectUrl = `${window.location.origin}${redirectTo}?force_login=true&logout_success=true&t=${Date.now()}`;
      console.log('🔄 Redirigiendo a:', redirectUrl);
      
      // Usar setTimeout para asegurar que la limpieza se complete
      setTimeout(() => {
        window.location.replace(redirectUrl);
      }, 100);
      
    } catch (error) {
      console.error('❌ Error durante el logout:', error);
      
      // Fallback: logout mínimo y redirección
      try {
        await supabase.auth.signOut();
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Logout de emergencia completado');
      } catch (fallbackError) {
        console.error('❌ Error en logout de emergencia:', fallbackError);
      }
      
      // Redirigir de todos modos
      router.push(`${redirectTo}?logout_error=true`);
    }
  };

  const signOutLocal = async (redirectTo: string = '/auth') => {
    try {
      console.log('Cierre de sesión local...');
      
      // Solo cerrar sesión de Supabase (sin Google logout)
      await supabase.auth.signOut();
      
      // Limpiar almacenamiento local
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();
      
      router.push(redirectTo);
    } catch (error) {
      console.error('Error during local sign out:', error);
      router.push(redirectTo);
    }
  };

  return { signOut, signOutLocal };
}
