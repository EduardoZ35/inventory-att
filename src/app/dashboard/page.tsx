"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null; } | null>(null);

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
        
        if (profileError && profileError.code === 'PGRST116') { // PGRST116: Row not found
          console.warn('Perfil no encontrado para el usuario. Creando uno...', user);
          // Intentar crear el perfil si no existe
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            first_name: user.user_metadata?.full_name || user.user_metadata?.name || null, // Intentar obtener el nombre completo de la metadata de Google
            last_name: null, // Dejar null o intentar extraer el apellido si es posible
            role: 'viewer', // Rol por defecto
          });
          if (insertError) {
            console.error('Error al crear perfil para nuevo usuario OAuth:', insertError);
          } else {
            // Si se creó con éxito, intentar obtener el perfil de nuevo
            const { data: newProfileData } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
            setProfile(newProfileData);
          }
        } else if (profileError) {
          console.error('Error al obtener el perfil de usuario:', profileError);
        } else if (profileData) {
          setProfile(profileData);
        }
      }
    };

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const fetchProfile = async () => {
          const { data: profileData, error: profileError } = await supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single();
          if (profileError && profileError.code === 'PGRST116') {
            console.warn('Perfil no encontrado en cambio de auth. Creando uno...', session.user);
            const { error: insertError } = await supabase.from('profiles').insert({
              id: session.user.id,
              first_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || null,
              last_name: null,
              role: 'viewer',
            });
            if (insertError) {
              console.error('Error al crear perfil en cambio de auth:', insertError);
            } else {
              const { data: newProfileData } = await supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single();
              setProfile(newProfileData);
            }
          } else if (profileError) {
            console.error('Error al obtener perfil en cambio de auth:', profileError);
          } else if (profileData) {
            setProfile(profileData);
          }
        };
        fetchProfile();
      } else {
        setProfile(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen gradient-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          {user && profile ? (
            <p className="text-lg text-gray-600">Bienvenido de vuelta, <span className="font-semibold text-blue-600">{profile.first_name || user.email}</span>! 👋</p>
          ) : user ? (
            <p className="text-lg text-gray-600">Bienvenido de vuelta, <span className="font-semibold text-blue-600">{user.email}</span>! 👋</p>
          ) : (
            <p className="text-lg text-gray-600">Bienvenido al sistema! 👋</p>
          )}
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Tarjeta 1: Total de Productos */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Productos</h2>
                <p className="text-3xl font-bold text-blue-600">127</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Total</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Bodegas */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Bodegas</h2>
                <p className="text-3xl font-bold text-emerald-600">5</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Activas</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Facturas de Compra */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Facturas Compra</h2>
                <p className="text-3xl font-bold text-purple-600">23</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Este mes</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 4: Proveedores */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Proveedores</h2>
                <p className="text-3xl font-bold text-orange-600">8</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">Activos</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 5: Clientes */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Clientes</h2>
                <p className="text-3xl font-bold text-pink-600">42</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-pink-600 bg-pink-100 px-2 py-1 rounded-full">Registrados</span>
                </div>
              </div>
              <div className="p-3 bg-pink-100 rounded-xl group-hover:bg-pink-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de acciones rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Acciones rápidas */}
          <div className="lg:col-span-2">
            <div className="card-modern p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <button 
                  onClick={() => router.push('/products/add')}
                  className="btn-primary p-4 text-center rounded-xl hover:transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">Agregar Producto</span>
                </button>
                <button 
                  onClick={() => router.push('/warehouses/add')}
                  className="btn-secondary p-4 text-center rounded-xl hover:transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span className="text-sm font-medium">Nueva Bodega</span>
                </button>
                <button 
                  onClick={() => router.push('/invoices/add')}
                  className="btn-secondary p-4 text-center rounded-xl hover:transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">Factura Compra</span>
                </button>
                <button 
                  onClick={() => router.push('/products')}
                  className="btn-secondary p-4 text-center rounded-xl hover:transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Ver Inventario</span>
                </button>
                <button 
                  onClick={() => router.push('/customers/add')}
                  className="btn-secondary p-4 text-center rounded-xl hover:transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-sm font-medium">Nuevo Cliente</span>
                </button>
                <button 
                  onClick={() => router.push('/providers')}
                  className="btn-secondary p-4 text-center rounded-xl hover:transform hover:scale-105 transition-all duration-200"
                >
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium">Ver Proveedores</span>
                </button>
              </div>
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="card-modern p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Producto actualizado</p>
                  <p className="text-xs text-gray-500">Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Factura de compra registrada</p>
                  <p className="text-xs text-gray-500">Hace 20 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nueva bodega agregada</p>
                  <p className="text-xs text-gray-500">Hace 45 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Proveedor actualizado</p>
                  <p className="text-xs text-gray-500">Hace 2 horas</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cliente registrado</p>
                  <p className="text-xs text-gray-500">Hace 3 horas</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Inventario */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Productos por categoría */}
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Productos por Categoría</h2>
              <button 
                onClick={() => router.push('/product-types')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Ver todas →
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Electrónicos</span>
                </div>
                <span className="text-sm text-gray-500">45 productos</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Oficina</span>
                </div>
                <span className="text-sm text-gray-500">32 productos</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Herramientas</span>
                </div>
                <span className="text-sm text-gray-500">28 productos</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-700">Materiales</span>
                </div>
                <span className="text-sm text-gray-500">22 productos</span>
              </div>
            </div>
          </div>

          {/* Gastos en compras */}
          <div className="card-modern p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Gastos en Compras</h2>
              <button 
                onClick={() => router.push('/invoices')}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Ver facturas →
              </button>
            </div>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-900 mb-1">$2.847.500</p>
                <p className="text-sm text-gray-500">Total este mes</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-lg font-semibold text-emerald-600">$2.390.756</p>
                  <p className="text-xs text-gray-500">Neto</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-orange-600">$456.744</p>
                  <p className="text-xs text-gray-500">IVA</p>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">23 facturas registradas</span>
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">+12%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
