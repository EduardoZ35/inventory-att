"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';

interface Provider {
  id: number;
  organization: string;
  dni: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
}

interface ProviderDetailPageProps {
  params: {
    id: string;
  };
}

export default function ProviderDetailPage({ params }: ProviderDetailPageProps) {
  const [provider, setProvider] = useState<Provider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { canManage } = useAuthStore();
  const providerId = params.id;

  const fetchProvider = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();

      if (error) throw error;

      setProvider(data);
    } catch (err) {
      console.error('Error fetching provider:', err);
      setError('Error al cargar el proveedor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/providers/edit/${providerId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', providerId);

      if (error) throw error;

      alert('Proveedor eliminado exitosamente');
      router.push('/providers');
    } catch (err) {
      console.error('Error deleting provider:', err);
      alert('Error al eliminar proveedor');
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchProvider();
    }
  }, [providerId]);

  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar proveedor</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error || 'Proveedor no encontrado'}</p>
          <button 
            onClick={() => router.push('/providers')}
            className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            Volver a Proveedores
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {provider.organization}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Información detallada del proveedor
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/providers')}
            className="btn-secondary"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          
          {canManage() && (
            <>
              <button
                onClick={handleEdit}
                className="btn-primary"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </>
          )}
        </div>
      </div>

      {/* Información del proveedor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="card-modern p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de la Empresa
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombre de la Empresa
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.organization}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                RUT/DNI
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.dni}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                ID del Proveedor
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                #{provider.id}
              </p>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="card-modern p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información de Contacto
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Nombre del Contacto
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.contact_name || 'No especificado'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Email de Contacto
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.contact_email ? (
                  <a 
                    href={`mailto:${provider.contact_email}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {provider.contact_email}
                  </a>
                ) : (
                  'No especificado'
                )}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Teléfono de Contacto
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.contact_phone ? (
                  <a 
                    href={`tel:${provider.contact_phone}`}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {provider.contact_phone}
                  </a>
                ) : (
                  'No especificado'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Información de ubicación */}
        <div className="card-modern p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ubicación
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Dirección
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.address || 'No especificada'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Ciudad
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.city || 'No especificada'}
              </p>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className="card-modern p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Información del Sistema
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Fecha de Registro
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.created_at ? new Date(provider.created_at).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                Última Actualización
              </label>
              <p className="text-lg text-gray-900 dark:text-white">
                {provider.updated_at ? new Date(provider.updated_at).toLocaleDateString('es-CL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'No disponible'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


