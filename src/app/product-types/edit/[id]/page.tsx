"use client";

// This page is deprecated - Equipment categories are now managed differently in the specialized system
// Redirecting to equipment management

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EditProductTypePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">Redirigiendo a gestión de equipos...</p>
      </div>
    </div>
  );
}