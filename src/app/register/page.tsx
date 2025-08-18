"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const validatePassword = (pass: string): string | null => {
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

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

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          first_name: firstName,
          last_name: lastName,
          role: 'viewer', // Rol por defecto al registrarse
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          setError('Registro exitoso, pero no se pudo crear el perfil de usuario. Por favor, contacta al soporte.');
          setLoading(false);
          return;
        }
      }

      setMessage('¡Registro exitoso! Por favor, revisa tu correo electrónico para verificar tu cuenta. Serás redirigido para iniciar sesión.');
      // Redirigir al usuario a la página de login después de un registro exitoso y creación de perfil
      setTimeout(() => {
        router.push('/auth');
      }, 3000); // Esperar 3 segundos antes de redirigir

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Registrarse</h1>
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow-md">
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
          <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Contraseña:</label>
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
            required
          />
          {password && validatePassword(password) && !error && (
            <p className="text-red-500 text-xs italic mt-2">{validatePassword(password)}</p>
          )}
        </div>
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirmar Contraseña:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (password !== e.target.value) {
                setError('Las contraseñas no coinciden.');
              } else {
                setError(null);
              }
            }}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/auth')}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Volver al Inicio de Sesión
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-4">Error: {error}</p>}
        {message && <p className="text-blue-500 text-xs italic mt-4">{message}</p>}
      </form>
    </div>
  );
}
