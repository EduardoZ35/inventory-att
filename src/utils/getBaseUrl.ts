/**
 * Obtiene la URL base de la aplicación
 * 
 * Prioriza Vercel URLs en producción
 */
export function getBaseUrl(): string {
  // Si estamos en el cliente
  if (typeof window !== 'undefined') {
    // En producción de Vercel, siempre usar la URL actual del navegador
    const { protocol, host } = window.location;
    const currentUrl = `${protocol}//${host}`;
    
    // Si detectamos que estamos en Vercel, usar la URL actual
    if (host.includes('vercel.app') || host.includes('vercel.com')) {
      console.log('Detected Vercel deployment, using current URL:', currentUrl);
      return currentUrl;
    }
    
    // Si hay una variable de entorno configurada, usarla
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (envBaseUrl && envBaseUrl !== 'http://localhost:3000') {
      return envBaseUrl;
    }
    
    // Para desarrollo local o cuando no hay configuración, usar la URL actual
    return currentUrl;
  }
  
  // En el servidor, intentar detectar Vercel
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  
  // Fallback a variable de entorno o localhost
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
