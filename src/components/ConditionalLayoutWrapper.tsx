"use client";

import { usePathname } from 'next/navigation';
import LayoutWrapper from './LayoutWrapper';

interface ConditionalLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ConditionalLayoutWrapper({ children }: ConditionalLayoutWrapperProps) {
  const pathname = usePathname();
  
  // Páginas que NO necesitan verificación de autorización ni sidebar
  const publicPages = [
    '/auth',
    '/auth/callback', 
    '/unauthorized',
    '/register'
  ];
  
  // Verificar si la página actual es pública
  const isPublicPage = publicPages.some(page => pathname.startsWith(page));
  
  console.log('🔍 ConditionalLayoutWrapper: Ruta actual:', pathname, 'Es pública:', isPublicPage);
  
  // Si es una página pública, renderizar directamente sin LayoutWrapper
  if (isPublicPage) {
    console.log('✅ ConditionalLayoutWrapper: Página pública, sin verificación de auth');
    return <>{children}</>;
  }
  
  // Si es una página protegida, usar LayoutWrapper con verificación
  console.log('🛡️ ConditionalLayoutWrapper: Página protegida, usando LayoutWrapper');
  return (
    <LayoutWrapper>
      {children}
    </LayoutWrapper>
  );
}
