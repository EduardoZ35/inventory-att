"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ first_name: string | null; last_name: string | null; } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
        if (error) {
          console.error('Error fetching user profile:', error);
        } else if (data) {
          setProfile(data);
        }
      }
    };

    fetchUserAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        const fetchProfile = async () => {
          const { data, error } = await supabase.from('profiles').select('first_name, last_name').eq('id', session.user.id).single();
          if (error) {
            console.error('Error fetching user profile on auth change:', error);
          } else if (data) {
            setProfile(data);
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

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setProfile(null);
      router.push('/auth');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="text-lg font-bold">
        <button onClick={() => router.push('/products')} className="hover:text-gray-300">Inventario ATT</button>
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span>Hola, {profile?.first_name || user.email}</span>
            <button
              onClick={() => router.push('/profile/edit')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-sm"
            >
              Editar Perfil
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
              disabled={loading}
            >
              {loading ? 'Cerrando...' : 'Cerrar Sesión'}
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push('/auth')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Iniciar Sesión
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-xs italic mt-2">Error: {error}</p>}
    </nav>
  );
}
