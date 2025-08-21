import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Log de todas las rutas para debuggear
  console.log('🛣️ Middleware ejecutándose en ruta:', req.nextUrl.pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = req.cookies.get(name)
          return cookie ? cookie.value : null // Devolver null si no se encuentra
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set(name, '', options) // Establecer valor vacío con opciones para eliminar
        },
      },
    }
  )

  // Obtener la sesión del usuario
  const { data: { session } } = await supabase.auth.getSession()

  // Rutas que no requieren autenticación
  const publicRoutes = ['/auth', '/auth/callback', '/unauthorized']
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  console.log('🔍 Ruta:', req.nextUrl.pathname, 'Es pública:', isPublicRoute, 'Tiene sesión:', !!session);

  // Si es una ruta pública, permitir acceso
  if (isPublicRoute) {
    console.log('✅ Ruta pública, permitiendo acceso');
    return res
  }

  // Si no hay sesión, redirigir al login
  if (!session) {
    console.log('❌ No hay sesión, redirigiendo a /auth');
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // Verificar si el usuario está autorizado (whitelist)
  try {
    console.log('🔍 Middleware verificando usuario:', session.user.email, 'ID:', session.user.id);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('authorized, is_blocked, role')
      .eq('id', session.user.id)
      .single()

    console.log('📋 Middleware - Perfil obtenido:', {
      email: session.user.email,
      userId: session.user.id,
      profile: profile,
      error: error,
      ruta: req.nextUrl.pathname
    });

    // Si hay error al obtener el perfil o no existe
    if (error || !profile) {
      console.log('❌ Error obteniendo perfil o perfil no existe:', error)
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }

      // TEMPORALMENTE DESHABILITADO PARA DEBUGGING
  if (!profile.authorized) {
    console.log('🚫 Middleware: Usuario no autorizado - PERO NO REDIRIGIENDO:', session.user.email, 'authorized:', profile.authorized)
    // return NextResponse.redirect(new URL('/unauthorized', req.url))
  }

  if (profile.is_blocked) {
    console.log('🔒 Middleware: Usuario bloqueado - PERO NO REDIRIGIENDO:', session.user.email)
    // return NextResponse.redirect(new URL('/unauthorized?reason=blocked', req.url))
  }

    console.log('✅ Usuario autorizado y activo:', session.user.email)
    // Usuario autorizado y no bloqueado, permitir acceso
    return res

  } catch (err) {
    console.error('💥 Error en middleware:', err)
    return NextResponse.redirect(new URL('/unauthorized', req.url))
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/products/:path*',
    '/customers/:path*',
    '/profile/:path*',
  ],
}
