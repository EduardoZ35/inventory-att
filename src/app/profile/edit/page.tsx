"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';

export default function EditProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        setEmail(user.email || '');
        const { data: profileData, error: profileError } = await supabase.from('profiles').select('first_name, last_name').eq('id', user.id).single();
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setError('Error al cargar el perfil.');
        } else if (profileData) {
          setFirstName(profileData.first_name || '');
          setLastName(profileData.last_name || '');
        }
      }
    };
    fetchUserData();
  }, []);

  const validatePassword = (pass: string): string | null => {
    if (!pass) return null; // Contraseña opcional si no se va a cambiar
    if (pass.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!/[A-Z]/.test(pass)) {
      return 'La contraseña debe contener al menos una letra mayúscula.';
    }
    if (!/[0-9]/.test(pass)) {
      return 'La contraseña debe contener al menos un número.';
    }
    if (!/[^a-zA-Z0-9]/.test(pass)) {
      return 'La contraseña debe contener al menos un símbolo (ej. !@#$%^&*).';
    }
    return null;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!user) {
      setError('No hay usuario autenticado.');
      setLoading(false);
      return;
    }

    if (password) {
      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }
    }

    try {
      // Actualizar perfil de usuario (nombre, apellido)
      const { error: profileUpdateError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
        })
        .eq('id', user.id);

      if (profileUpdateError) {
        throw new Error(`Error al actualizar el perfil: ${profileUpdateError.message}`);
      }

      // Actualizar correo electrónico si ha cambiado
      if (email !== user.email) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({
          email: email,
        });
        if (emailUpdateError) {
          throw new Error(`Error al actualizar el correo electrónico: ${emailUpdateError.message}`);
        }
      }

      // Actualizar contraseña si se ha proporcionado una nueva
      if (password) {
        const { error: passwordUpdateError } = await supabase.auth.updateUser({
          password: password,
        });
        if (passwordUpdateError) {
          throw new Error(`Error al actualizar la contraseña: ${passwordUpdateError.message}`);
        }
      }

      setMessage('Perfil actualizado exitosamente!');
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
        <p>Por favor, inicia sesión para editar tu perfil.</p>
        <button onClick={() => router.push('/auth')} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Ir a Iniciar Sesión</button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Perfil</h1>
      <form onSubmit={handleUpdateProfile} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="lastName" className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Nueva Contraseña (dejar en blanco si no se desea cambiar):</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (confirmPassword && e.target.value !== confirmPassword) {
                setError('Las contraseñas no coinciden.');
              } else {
                setError(null);
              }
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          {password && validatePassword(password) && !error && (
            <p className="text-red-500 text-xs italic mt-2">{validatePassword(password)}</p>
          )}
        </div>
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirmar Nueva Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (password && password !== e.target.value) {
                setError('Las contraseñas no coinciden.');
              } else {
                setError(null);
              }
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Actualizar Perfil'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/products')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-4">Error: {error}</p>}
        {message && <p className="text-blue-500 text-xs italic mt-4">{message}</p>}
      </form>
    </div>
  );
}
