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
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {user && profile ? (
        <p className="text-xl mb-8">Bienvenido, {profile.first_name || user.email}!</p>
      ) : user ? (
        <p className="text-xl mb-8">Bienvenido, {user.email}!</p>
      ) : (
        <p className="text-xl mb-8">Bienvenido!</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Tarjeta 1: Total de Productos */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total de Productos</h2>
          <p className="text-4xl font-bold text-blue-600">1,234</p>
          <p className="text-gray-500 mt-2">+15% desde el mes pasado</p>
        </div>

        {/* Tarjeta 2: Instancias en Stock */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Instancias en Stock</h2>
          <p className="text-4xl font-bold text-green-600">8,765</p>
          <p className="text-gray-500 mt-2">+8% desde la semana pasada</p>
        </div>

        {/* Tarjeta 3: Productos por Agotarse */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Productos por Agotarse</h2>
          <p className="text-4xl font-bold text-red-600">45</p>
          <p className="text-gray-500 mt-2">Acción requerida</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Gráfico de Ventas Mensuales (Ficticio)</h2>
        <img src="https://via.placeholder.com/600x300?text=Gráfico+de+Ventas" alt="Gráfico de Ventas" className="w-full h-auto" />
      </div>
    </div>
  );
}
