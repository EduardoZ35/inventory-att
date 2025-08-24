/**
 * Maneja redirecciones de autenticación detectando el entorno actual
 */

export function getAuthRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return 'http://localhost:3000/auth/callback';
  }

  const { protocol, host } = window.location;
  
  // Detectar si estamos en Vercel
  if (host.includes('vercel.app')) {
    const vercelUrl = `${protocol}//${host}/auth/callback`;
    console.log('🚀 Vercel detected, using redirect URL:', vercelUrl);
    return vercelUrl;
  }
  
  // Detectar localhost o desarrollo
  if (host.includes('localhost') || host.includes('127.0.0.1')) {
    const localUrl = `${protocol}//${host}/auth/callback`;
    console.log('🏠 Local development detected, using redirect URL:', localUrl);
    return localUrl;
  }
  
  // Para cualquier otro dominio personalizado
  const customUrl = `${protocol}//${host}/auth/callback`;
  console.log('🌐 Custom domain detected, using redirect URL:', customUrl);
  return customUrl;
}

/**
 * Redirige al dashboard después de la autenticación
 */
export function redirectToDashboard(): void {
  if (typeof window === 'undefined') return;
  
  const { protocol, host } = window.location;
  const dashboardUrl = `${protocol}//${host}/dashboard`;
  
  console.log('📊 Redirecting to dashboard:', dashboardUrl);
  
  // Usar replace para evitar problemas con el botón atrás
  window.location.replace(dashboardUrl);
}

/**
 * Redirige a la página de autenticación
 */
export function redirectToAuth(): void {
  if (typeof window === 'undefined') return;
  
  const { protocol, host } = window.location;
  const authUrl = `${protocol}//${host}/auth`;
  
  console.log('🔐 Redirecting to auth:', authUrl);
  
  // Usar replace para evitar problemas con el botón atrás
  window.location.replace(authUrl);
}
