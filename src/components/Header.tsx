"use client";

import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { useSignOut } from '@/hooks/useSignOut';


export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchUserAndRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role');
        if (roleError) console.error('Error al obtener el rol del usuario:', roleError);
        else setUserRole(roleData);
      } else {
        setUserRole(null);
      }

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
          if (roleError) console.error('Error al obtener rol:', roleError);
          else setUserRole(roleData);
        };
        fetchRoleOnAuthChange();
      } else {
        setUserRole(null);
      }
      if (!session?.user && pathname !== '/auth' && pathname !== '/register') {
        router.push('/auth');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router, pathname]);

  const { signOut } = useSignOut();

  const handleLogout = async () => {
    try {
      await signOut();
      setUser(null);
      setUserRole(null);
    } catch (err: unknown) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  // No renderizar en páginas de auth
  if (!user && (pathname === '/auth' || pathname === '/register')) {
    return null;
  }

  const getRoleLabel = (role: string | null) => {
    const labels = {
      'admin': 'Administrador',
      'tech_support': 'Soporte Técnico',
      'warehouse_staff': 'Personal de Bodega',
      'sales': 'Ventas',
      'blocked': 'Bloqueado'
    };
    return labels[role as keyof typeof labels] || 'Usuario';
  };

  return (
    <header className="bg-gray-950/95 border-b border-gray-800/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="px-6 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo simplificado */}
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-white">Control & Soporte</h1>
              <p className="text-sm text-gray-400">Sistema Tecnológico</p>
            </div>
          </div>

          {/* Usuario y acciones */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-4 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-600/50 transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-sm font-bold text-white">
                      {user.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-white truncate max-w-32">
                      {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{getRoleLabel(userRole)}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown del usuario */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-56 bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50">
                    {userRole === 'admin' && (
                      <button
                        onClick={() => {
                          router.push('/admin/users');
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        Gestión de Usuarios
                      </button>
                    )}
                    {userRole === 'admin' && <hr className="border-gray-700 my-2" />}
                    <button
                      onClick={() => {
                        handleLogout();
                        setShowUserMenu(false);
                      }}
                      className="flex items-center w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Overlay para cerrar menús */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 bg-black/25 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}