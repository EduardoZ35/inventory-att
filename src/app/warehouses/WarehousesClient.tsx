"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Warehouse } from '@/types';

export default function WarehousesClient() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchWarehouses = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('warehouses')
        .select('id, name, location, warehouse_type, capacity, responsible_person, created_at')
        .order('name', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      setWarehouses(data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.log('Error completo:', err);
      setError(`${errorMessage}. Es posible que la tabla 'warehouses' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleDelete = async (warehouseId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta bodega?')) return;

    try {
      const { error } = await supabase
        .from('warehouses')
        .delete()
        .eq('id', warehouseId);

      if (error) {
        throw error;
      }

      // Refrescar la lista
      fetchWarehouses();
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleAddNew = () => {
    router.push('/warehouses/add');
  };

  const handleEdit = (warehouseId: number) => {
    router.push(`/warehouses/edit/${warehouseId}`);
  };

  const filteredWarehouses = warehouses.filter(warehouse =>
    warehouse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    warehouse.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (error) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <h3 className="text-lg font-semibold mb-2">Error al cargar bodegas</h3>
          <p className="mb-4">{error}</p>
          {error.includes('tabla') && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <h4 className="font-medium">💡 Solución</h4>
              <p className="text-sm mt-1">
                Necesitas crear la tabla 'warehouses' en Supabase. 
                Revisa el archivo <code className="bg-blue-100 px-1 rounded">SETUP_DATABASE.md</code> 
                para instrucciones detalladas.
              </p>
            </div>
          )}
          <div className="mt-3 flex gap-2">
            <button 
              onClick={fetchWarehouses}
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
          Bodegas
        </h1>
        <p className="page-subtitle">
          Gestiona bodegas especializadas: Principal, En tránsito y Taller técnico
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Bodegas</p>
              <p className="stats-number text-blue-600">{warehouses.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Bodega Principal</p>
              <p className="stats-number text-green-600">
                {warehouses.filter(w => w.warehouse_type === 'main').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Taller Técnico</p>
              <p className="stats-number text-purple-600">{warehouses.filter(w => w.warehouse_type === 'repair_shop').length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
              placeholder="Buscar bodegas..."
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
            Agregar Bodega
          </button>
        )}
      </div>

      {/* Lista de bodegas */}
      <div className="card-theme overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Cargando bodegas...</p>
          </div>
        ) : filteredWarehouses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-theme min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Bodega
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Responsable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Capacidad
                  </th>
                  {canManage() && (
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center text-white font-semibold">
                            {warehouse.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {warehouse.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {warehouse.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        warehouse.warehouse_type === 'main' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        warehouse.warehouse_type === 'transit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        warehouse.warehouse_type === 'repair_shop' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {warehouse.warehouse_type === 'main' ? 'Principal' :
                         warehouse.warehouse_type === 'transit' ? 'En Tránsito' :
                         warehouse.warehouse_type === 'repair_shop' ? 'Taller Técnico' :
                         warehouse.warehouse_type || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {warehouse.location}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {warehouse.responsible_person || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {warehouse.capacity ? warehouse.capacity.toLocaleString() : '-'} unidades
                      </div>
                    </td>
                    {canManage() && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(warehouse.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Eliminar
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay bodegas</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron bodegas que coincidan con tu búsqueda.' : 'Comienza agregando una nueva bodega.'}
            </p>
            {canManage() && !searchTerm && (
              <div className="mt-6">
                <button onClick={handleAddNew} className="btn-theme-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar Bodega
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
