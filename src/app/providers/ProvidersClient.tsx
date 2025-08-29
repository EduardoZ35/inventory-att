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
  country?: string;
  region_id?: string;
  region_name?: string;
  commune_id?: string;
  commune_name?: string;
  created_at?: string;
  updated_at?: string;
}

export default function ProvidersClient() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchProviders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('providers')
        .select('*')
        .order('organization', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setProviders(data || []);
    } catch (err) {
      console.error('Error fetching providers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`${errorMessage}. Es posible que la tabla 'providers' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este proveedor?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('providers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProviders(providers.filter(provider => provider.id !== id));
      alert('Proveedor eliminado exitosamente');
    } catch (err) {
      console.error('Error deleting provider:', err);
      alert('Error al eliminar proveedor');
    }
  };

  const handleEdit = (id: number) => {
    router.push(`/providers/edit/${id}`);
  };

  const handleView = (id: number) => {
    router.push(`/providers/${id}`);
  };

  const handleAddNew = () => {
    router.push('/providers/add');
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const filteredProviders = providers.filter(provider => {
    const searchLower = searchTerm.toLowerCase();
    return (
      provider.organization?.toLowerCase().includes(searchLower) ||
      provider.dni?.toLowerCase().includes(searchLower) ||
      provider.contact_name?.toLowerCase().includes(searchLower) ||
      provider.contact_email?.toLowerCase().includes(searchLower) ||
      provider.contact_phone?.toLowerCase().includes(searchLower) ||
      provider.address?.toLowerCase().includes(searchLower) ||
      provider.country?.toLowerCase().includes(searchLower) ||
      provider.region_name?.toLowerCase().includes(searchLower) ||
      provider.commune_name?.toLowerCase().includes(searchLower)
    );
  });

  // Estadísticas
  const totalProviders = providers.length;
  const activeProviders = providers.length; // Todos los proveedores se consideran activos

  if (error) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <div className="flex items-center mb-4">
            <svg className="h-6 w-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold">Error al cargar proveedores</h3>
          </div>
          <p className="mb-4">{error}</p>
          <div className="flex gap-3">
            <button 
              onClick={fetchProviders}
              className="btn-theme-secondary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container page-bg">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Proveedores
        </h1>
        <p className="page-subtitle">
          Gestiona la información de tus proveedores
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Proveedores</p>
              <p className="stats-number text-blue-600">{totalProviders}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Proveedores Activos</p>
              <p className="stats-number text-green-600">{activeProviders}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Búsquedas</p>
              <p className="stats-number text-purple-600">{filteredProviders.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar proveedores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-theme w-full pl-10"
            />
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {canManage() && (
          <button
            onClick={handleAddNew}
            className="btn-theme-primary"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar Proveedor
          </button>
        )}
      </div>

             {/* Lista de proveedores */}
       <div className="card-theme overflow-hidden">
         {isLoading ? (
           <div className="p-8 text-center">
             <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             <p className="mt-2">Cargando proveedores...</p>
           </div>
         ) : filteredProviders.length > 0 ? (
           <div className="overflow-x-auto">
             <table className="table-theme min-w-full">
               <thead>
                 <tr>
                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                     Empresa
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                     DNI/RUT
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                     Contacto
                   </th>
                   <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                     Ubicación
                   </th>
                   <th className="relative px-6 py-3">
                     <span className="sr-only">Acciones</span>
                   </th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                 {filteredProviders.map((provider) => (
                   <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white font-semibold">
                            {provider.organization?.substring(0, 2).toUpperCase() || 'PR'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {provider.organization || 'Sin nombre'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {provider.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {provider.dni || 'No especificado'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {provider.contact_name || 'Sin contacto'}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {provider.contact_email || provider.contact_phone || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {provider.address || 'Sin dirección'}
                      </div>
                                             <div className="text-sm text-gray-500 dark:text-gray-400">
                         {[
                           provider.commune_name,
                           provider.region_name,
                           provider.country
                         ].filter(Boolean).join(', ') || '-'}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleView(provider.id)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                      >
                        Ver
                      </button>
                      {canManage() && (
                        <>
                          <button
                            onClick={() => handleEdit(provider.id)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(provider.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Eliminar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay proveedores</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron proveedores que coincidan con tu búsqueda.' : 'Comienza agregando tu primer proveedor.'}
            </p>
            {canManage() && !searchTerm && (
              <div className="mt-6">
                <button
                  onClick={handleAddNew}
                  className="btn-theme-primary"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Primer Proveedor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}




