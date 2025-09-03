"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  stats?: {
    label: string;
    value: number;
  };
}

interface DashboardStats {
  totalEquipment: number;
  totalInstances: number;
  totalMovements: number;
  totalOrders: number;
  totalClients: number;
  totalProviders: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipment: 0,
    totalInstances: 0,
    totalMovements: 0,
    totalOrders: 0,
    totalClients: 0,
    totalProviders: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Obtener rol del usuario
        const { data: roleData } = await supabase.rpc('get_user_role');
        setUserRole(roleData);

        // Obtener estadísticas del dashboard
        try {
          const [
            equipmentRes,
            instancesRes,
            movementsRes,
            ordersRes,
            clientsRes,
            providersRes
          ] = await Promise.all([
            supabase.from('equipment').select('id', { count: 'exact' }).is('deleted_at', null),
            supabase.from('equipment_instances').select('id', { count: 'exact' }),
            supabase.from('stock_movements').select('id', { count: 'exact' }),
            supabase.from('service_orders').select('id', { count: 'exact' }),
            supabase.from('clients').select('id', { count: 'exact' }),
            supabase.from('providers').select('id', { count: 'exact' })
          ]);

          setStats({
            totalEquipment: equipmentRes.count || 0,
            totalInstances: instancesRes.count || 0,
            totalMovements: movementsRes.count || 0,
            totalOrders: ordersRes.count || 0,
            totalClients: clientsRes.count || 0,
            totalProviders: providersRes.count || 0
          });
        } catch (error) {
          console.error('Error al cargar estadísticas:', error);
        }
      }

      if (!user) {
        router.push('/auth');
      }

      setIsLoading(false);
    };

    fetchUserAndStats();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push('/auth');
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

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

  const dashboardCards: DashboardCard[] = [
    {
      id: 'equipment',
      title: 'Catálogo de Equipos',
      description: 'Gestionar relojes, huelleros, impresoras y repuestos',
      href: '/equipment',
      color: 'from-blue-500 to-blue-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      stats: {
        label: 'Tipos de equipos',
        value: stats.totalEquipment
      }
    },
    {
      id: 'inventory',
      title: 'Inventario Físico',
      description: 'Unidades individuales con números de serie',
      href: '/inventario-fisico',
      color: 'from-green-500 to-green-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      stats: {
        label: 'Unidades físicas',
        value: stats.totalInstances
      }
    },
    {
      id: 'movements',
      title: 'Stock & Movimientos',
      description: 'Histórico de entradas, salidas y transferencias',
      href: '/stock-movements',
      color: 'from-purple-500 to-purple-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      stats: {
        label: 'Movimientos registrados',
        value: stats.totalMovements
      }
    },
    {
      id: 'orders',
      title: 'Órdenes de Trabajo',
      description: 'Instalaciones, reparaciones y mantenimiento',
      href: '/service-orders',
      color: 'from-orange-500 to-orange-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      stats: {
        label: 'Órdenes activas',
        value: stats.totalOrders
      }
    },
    {
      id: 'clients',
      title: 'Clientes',
      description: 'Empresas, casinos y áreas internas',
      href: '/customers',
      color: 'from-teal-500 to-teal-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      stats: {
        label: 'Clientes registrados',
        value: stats.totalClients
      }
    },
    {
      id: 'providers',
      title: 'Proveedores',
      description: 'Distribuidores y fabricantes de equipos',
      href: '/providers',
      color: 'from-indigo-500 to-indigo-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      stats: {
        label: 'Proveedores activos',
        value: stats.totalProviders
      }
    },
    {
      id: 'warehouses',
      title: 'Bodegas',
      description: 'Principal, tránsito y taller técnico',
      href: '/warehouses',
      color: 'from-gray-500 to-gray-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      id: 'invoices',
      title: 'Facturas',
      description: 'Gestión de facturación y pagos',
      href: '/invoices',
      color: 'from-yellow-500 to-yellow-600',
      icon: (
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Top Stats Bar - Full Width */}
      <div className="bg-gray-900/50 border-b border-gray-800/50 backdrop-blur-xl">
        <div className="px-12 py-8">
          <div className="grid grid-cols-4 gap-8">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Equipos</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalEquipment}</p>
                  <p className="text-emerald-400 text-sm font-medium mt-1">Tipos registrados</p>
                </div>
                <div className="w-14 h-14 bg-blue-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Inventario Físico</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalInstances}</p>
                  <p className="text-emerald-400 text-sm font-medium mt-1">Unidades activas</p>
                </div>
                <div className="w-14 h-14 bg-emerald-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Movimientos</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalMovements}</p>
                  <p className="text-purple-400 text-sm font-medium mt-1">Este mes</p>
                </div>
                <div className="w-14 h-14 bg-purple-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Órdenes Activas</p>
                  <p className="text-3xl font-bold text-white mt-2">{stats.totalOrders}</p>
                  <p className="text-amber-400 text-sm font-medium mt-1">En proceso</p>
                </div>
                <div className="w-14 h-14 bg-amber-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* User Info - Integrated */}
          {user && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700/50">
              <div>
                <h1 className="text-2xl font-bold text-white">Control & Soporte Tecnológico</h1>
                <p className="text-gray-400 mt-1">Sistema integral de gestión de inventario</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-white font-semibold">
                    {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario'}
                  </p>
                  <p className="text-gray-400 text-sm">{getRoleLabel(userRole)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Grid - Spacious Layout */}
      <div className="px-12 py-12">
        <div className="grid grid-cols-3 gap-8 max-w-none">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              onClick={() => router.push(card.href)}
              className="group relative bg-gray-900/60 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/60 transition-all duration-300 cursor-pointer"
            >
              {/* Gradient Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 rounded-3xl transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                    <div className="w-8 h-8 text-white">
                      {card.icon}
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-100 transition-colors">
                  {card.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {card.description}
                </p>

                {card.stats && (
                  <div className="pt-6 border-t border-gray-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">{card.stats.label}</span>
                      <span className="text-2xl font-bold text-white">{card.stats.value}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Admin Card - Premium Style */}
          {userRole === 'admin' && (
            <div
              onClick={() => router.push('/admin/users')}
              className="group relative bg-gradient-to-br from-red-900/40 to-red-800/40 backdrop-blur-xl rounded-3xl p-8 border border-red-700/50 hover:border-red-600/50 hover:from-red-800/50 hover:to-red-700/50 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-600 opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300"></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 715 0z" />
                    </svg>
                  </div>
                  <svg className="w-6 h-6 text-red-400 group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gray-100 transition-colors">
                  Administración
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  Gestión completa de usuarios, roles y permisos del sistema
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}