"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/dashboard');
      } else {
        router.push('/auth');
      }
    };
    checkSession();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Cargando...</p>
    </div>
  );
}
