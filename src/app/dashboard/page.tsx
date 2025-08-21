"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Tarjeta 1: Total de Productos */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Total de Productos</h2>
                <p className="text-3xl font-bold text-blue-600">1,234</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">+15%</span>
                  <span className="text-sm text-gray-500 ml-2">desde el mes pasado</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Instancias en Stock */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Instancias en Stock</h2>
                <p className="text-3xl font-bold text-emerald-600">8,765</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full">+8%</span>
                  <span className="text-sm text-gray-500 ml-2">desde la semana pasada</span>
                </div>
              </div>
              <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Productos por Agotarse */}
          <div className="card-modern p-6 group">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-1">Productos por Agotarse</h2>
                <p className="text-3xl font-bold text-orange-600">45</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-orange-600 bg-orange-100 px-2 py-1 rounded-full">⚠️</span>
                  <span className="text-sm text-gray-500 ml-2">Acción requerida</span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors duration-200">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="btn-primary p-4 text-center rounded-xl">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">Agregar Producto</span>
                </button>
                <button className="btn-secondary p-4 text-center rounded-xl">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  <span className="text-sm font-medium">Nuevo Cliente</span>
                </button>
                <button className="btn-secondary p-4 text-center rounded-xl">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm font-medium">Nueva Factura</span>
                </button>
                <button className="btn-secondary p-4 text-center rounded-xl">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="text-sm font-medium">Ver Reportes</span>
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
                  <p className="text-sm font-medium text-gray-900">Producto agregado</p>
                  <p className="text-xs text-gray-500">Hace 2 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cliente registrado</p>
                  <p className="text-xs text-gray-500">Hace 15 minutos</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Stock bajo detectado</p>
                  <p className="text-xs text-gray-500">Hace 1 hora</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico placeholder modernizado */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Estadísticas de Ventas</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200">7 días</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200">30 días</button>
              <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200">90 días</button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Gráfico de Ventas</h3>
            <p className="text-gray-500 mb-4">Los datos del gráfico se mostrarán aquí una vez que se integre con el sistema de analytics</p>
            <button className="btn-primary">Configurar Analytics</button>
          </div>
        </div>
      </div>
    </div>
  );
}
