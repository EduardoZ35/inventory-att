"use client";

import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSignOut } from '@/hooks/useSignOut';
import ThemeToggle from './ThemeToggle';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const router = useRouter(); // <-- Llamada correcta al hook
  const isActive = pathname === href;

  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center p-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' 
          : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null); // Nuevo estado para el rol
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
        if (roleError) console.error('Error al obtener el rol del usuario en Sidebar:', roleError);
        else setUserRole(roleData);
      } else {
        setUserRole(null);
      }

      // Redirigir si no está autenticado y no está en la página de auth/register
      if (!user && pathname !== '/auth' && pathname !== '/register') {
        router.push('/auth');
      }
    };

    fetchUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const fetchRoleOnAuthChange = async () => {
          const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
          if (roleError) console.error('Error al obtener rol en cambio de auth en Sidebar:', roleError);
          else setUserRole(roleData);
        };
        fetchRoleOnAuthChange();
      } else {
        setUserRole(null);
      }
      // Si la sesión cambia a nula y no estamos ya en auth/register, redirigir
      if (!session?.user && pathname !== '/auth' && pathname !== '/register') {
        router.push('/auth');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]); // Añadir router y pathname a las dependencias

  const { signOut } = useSignOut();

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar el hook personalizado que maneja tanto Supabase como Google
      await signOut();
      
      // Limpiar estado local
      setUser(null);
      setUserRole(null);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Solo renderizar el sidebar si el usuario está autenticado y no está en la página de login/registro
  // O si el userRole aún no se ha cargado (para evitar destellos de contenido)
  if (!user && (pathname === '/auth' || pathname === '/register')) {
    return null; // No renderizar el sidebar en las páginas de autenticación/registro si no hay sesión
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-800 to-slate-900 text-white p-6 flex flex-col h-screen shadow-xl">
      {/* Header del sidebar */}
      <div className="mb-8">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-4 mx-auto shadow-lg">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-center text-white">Inventario ATT</h1>
        <p className="text-xs text-slate-400 text-center mt-1">Sistema de Gestión</p>
      </div>

      {/* Información del usuario */}
      {user && (
        <div className="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
              </p>
              <p className="text-xs text-slate-400 truncate">{userRole || 'Cargando...'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li>
            <NavLink href="/dashboard">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z" />
              </svg>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink href="/products">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink href="/product-types">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Tipos de Productos
            </NavLink>
          </li>
          <li>
            <NavLink href="/customers">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Clientes
            </NavLink>
          </li>
          <li>
            <NavLink href="/invoices">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Facturas
            </NavLink>
          </li>
          <li>
            <NavLink href="/warehouses">
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Bodegas
            </NavLink>
          </li>
          
          {/* Separador para administración */}
          {userRole === 'admin' && (
            <>
              <li className="pt-4">
                <div className="flex items-center space-x-2 px-3 py-2">
                  <div className="flex-1 h-px bg-slate-600"></div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Administración</span>
                  <div className="flex-1 h-px bg-slate-600"></div>
                </div>
              </li>
              <li>
                <NavLink href="/admin/users">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Gestión de Usuarios
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>

      {/* Footer con toggle de tema y botón de logout */}
      <div className="mt-auto space-y-4">
        {/* Toggle de tema */}
        <ThemeToggle />
        
        {user && (
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={loading}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {loading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        )}
        
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
