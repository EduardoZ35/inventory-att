/**
 * Obtiene la URL base de la aplicación
 * 
 * En desarrollo: usa NEXT_PUBLIC_BASE_URL o localhost:3000
 * En producción: usa NEXT_PUBLIC_BASE_URL o la URL actual
 */
export function getBaseUrl(): string {
  // Si estamos en el cliente, podemos usar la URL actual
  if (typeof window !== 'undefined') {
    const envBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    if (envBaseUrl) {
      return envBaseUrl;
    }
    
    // Si no hay URL base configurada, usar la URL actual
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  }
  
  // En el servidor, usar la variable de entorno o un valor por defecto
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
