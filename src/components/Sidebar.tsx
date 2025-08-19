"use client";

import { supabase } from '@/lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

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
      onClick={() => router.push(href)} // <-- Usar la instancia del router
      className={`flex items-center p-2 rounded-lg ${isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
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

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setUserRole(null); // Limpiar el rol al cerrar sesión
      router.push('/auth'); // Redirige al login después de cerrar sesión
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
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col h-screen">
      <div className="text-2xl font-bold mb-8 text-center">
        Inventario ATT
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          <li><NavLink href="/dashboard">Dashboard</NavLink></li>
          <li><NavLink href="/products">Productos</NavLink></li>
          <li><NavLink href="/product-types">Tipos de Productos</NavLink></li>
          <li><NavLink href="/customers">Clientes</NavLink></li>
          <li><NavLink href="/invoices">Facturas</NavLink></li>
          <li><NavLink href="/warehouses">Bodegas</NavLink></li>
          {/* Enlace de Administración de Usuarios, visible solo para admins */}
          {userRole === 'admin' && (
            <li><NavLink href="/admin/users">Administración de Usuarios</NavLink></li>
          )}
          {/* Agrega más categorías según sea necesario */}
        </ul>
      </nav>
      <div className="mt-auto">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        ) : null}
        {error && <p className="text-red-400 text-sm mt-2">Error: {error}</p>}
      </div>
    </aside>
  );
}
