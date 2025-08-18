"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      // La redirección a la página de productos se manejará en el callback de Google
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-6">Acceder a Inventario ATT</h1>
        <p className="mb-8 text-gray-400">Inicia sesión con tu cuenta de Google</p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg flex items-center justify-center space-x-2"
          disabled={loading}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.449 12.217c0-.756-.069-1.48-.198-2.186H12v4.116h6.185c-.266 1.393-1.077 2.585-2.228 3.393v2.677h3.454c2.028-1.871 3.208-4.636 3.208-7.999z" fillRule="evenodd"></path>
            <path d="M12 23c3.276 0 6.02-1.085 8.026-2.956l-3.454-2.677c-.96.64-2.181 1.02-3.372 1.02-2.583 0-4.783-1.745-5.579-4.089H2.923v2.756C5.076 21.012 8.356 23 12 23z" fillRule="evenodd"></path>
            <path d="M6.421 14.822c-.2-.64-.316-1.32-.316-2.071s.116-1.432.316-2.071V8.023H2.923A9.976 9.976 0 002 12c0 1.696.38 3.307 1.054 4.717l3.367-2.895z" fillRule="evenodd"></path>
            <path d="M12 4.978c1.419 0 2.697.487 3.702 1.432l3.078-3.078C18.006 1.83 15.262.085 12 .085c-3.644 0-6.924 1.988-8.923 4.717l3.367 2.895c.796-2.344 3.0-4.089 5.579-4.089z" fillRule="evenodd"></path>
          </svg>
          <span>{loading ? 'Redirigiendo a Google...' : 'Iniciar Sesión con Google'}</span>
        </button>

        {error && <p className="text-red-400 text-sm italic mt-4">Error: {error}</p>}
        {message && <p className="text-blue-400 text-sm italic mt-4">{message}</p>}
      </div>
    </div>
  );
}
