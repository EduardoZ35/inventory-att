"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Client } from '@/types';

export default function CustomersClient() {
  const [customers, setCustomers] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('id, name, email, phone, address, country, region_id, region_name, provincia_id, provincia_name, commune_id, commune_name, created_at')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.log('Error completo:', err);
      setError(`${errorMessage}. Es posible que la tabla 'clients' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (customerId: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', customerId);

      if (error) {
        throw error;
      }

      // Refrescar la lista
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleAddNew = () => {
    router.push('/customers/add');
  };

  const handleEdit = (customerId: number) => {
    router.push(`/customers/edit/${customerId}`);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (customer.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (customer.country?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (customer.region_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (customer.provincia_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (customer.commune_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  if (error) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar clientes</h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
            {error.includes('tabla') && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
                <h4 className="text-blue-800 dark:text-blue-200 font-medium">💡 Solución</h4>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  Necesitas crear la tabla 'clients' en Supabase. 
                  Revisa el archivo <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">SETUP_DATABASE.md</code> 
                  para instrucciones detalladas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container page-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Gestión de Clientes</h1>
          <p className="page-subtitle">Administra la información de los clientes del sistema</p>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="card-theme p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar clientes por nombre, email, teléfono o dirección..."
                  className="input-theme w-full pl-10 pr-4"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {canManage() && (
              <button
                onClick={handleAddNew}
                className="btn-theme-primary flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Cliente
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Total Clientes</p>
                <p className="stats-number">{customers.length}</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Con Teléfono</p>
                <p className="stats-number">{customers.filter(c => c.phone).length}</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="stats-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="stats-label">Con Dirección</p>
                <p className="stats-number">{customers.filter(c => c.address).length}</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabla de clientes */}
        <div className="card-theme overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando clientes...</p>
            </div>
          ) : filteredCustomers.length > 0 ? (
            <>
              <div className="table-theme">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Contacto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Ubicación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Registro
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {customer.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customer.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {customer.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {customer.address && (
                              <div className="mb-1">{customer.address}</div>
                            )}
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {[
                                customer.commune_name,
                                customer.provincia_name,
                                customer.region_name,
                                customer.country
                              ].filter(Boolean).join(', ')}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {customer.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(customer.id)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                              title="Editar cliente"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            
                            {canManage() && (
                              <button
                                onClick={() => handleDelete(customer.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                                title="Eliminar cliente"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm 
                  ? 'No se encontraron clientes que coincidan con tu búsqueda.' 
                  : 'Aún no se han registrado clientes en el sistema.'
                }
              </p>
              {canManage() && (
                <button
                  onClick={handleAddNew}
                  className="btn-theme-primary"
                >
                  Agregar Primer Cliente
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
