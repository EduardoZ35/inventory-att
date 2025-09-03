"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { EquipmentInstance } from '@/types';

export default function InventarioFisicoClient() {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchUnidades = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Consulta base de unidades
      let query = supabase
        .from('equipment_instances')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }

      const { data: unidadesData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (!unidadesData || unidadesData.length === 0) {
        setUnidades([]);
        return;
      }

      // Obtener datos relacionados
      const equipmentIds = [...new Set(unidadesData.map(u => u.equipment_id))];
      const warehouseIds = [...new Set(unidadesData.map(u => u.location_id).filter(Boolean))];
      const clientIds = [...new Set(unidadesData.map(u => u.assigned_to_client).filter(Boolean))];

      // Consultas paralelas
      const [equipmentRes, warehousesRes, clientsRes] = await Promise.all([
        equipmentIds.length > 0 ? supabase
          .from('equipment')
          .select('id, name, equipment_category, equipment_subcategory, price')
          .in('id', equipmentIds)
          .is('deleted_at', null) : { data: [], error: null },
        
        warehouseIds.length > 0 ? supabase
          .from('warehouses')
          .select('id, name, warehouse_type')
          .in('id', warehouseIds) : { data: [], error: null },
        
        clientIds.length > 0 ? supabase
          .from('clients')
          .select('id, name, client_type')
          .in('id', clientIds) : { data: [], error: null }
      ]);

      // Crear mapas para lookup
      const equipmentMap = new Map((equipmentRes.data || []).map(item => [item.id, item]));
      const warehousesMap = new Map((warehousesRes.data || []).map(item => [item.id, item]));
      const clientsMap = new Map((clientsRes.data || []).map(item => [item.id, item]));

      // Combinar datos
      const enrichedUnidades = unidadesData.map(unidad => ({
        ...unidad,
        equipment: equipmentMap.get(unidad.equipment_id) || null,
        warehouse: warehousesMap.get(unidad.location_id) || null,
        client: unidad.assigned_to_client ? clientsMap.get(unidad.assigned_to_client) || null : null
      }));

      // Aplicar filtros
      let filteredUnidades = enrichedUnidades;

      // Filtro de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredUnidades = enrichedUnidades.filter(unidad => 
          unidad.serial_number?.toLowerCase().includes(searchLower) ||
          unidad.imei?.toLowerCase().includes(searchLower) ||
          unidad.equipment?.name?.toLowerCase().includes(searchLower) ||
          unidad.warehouse?.name?.toLowerCase().includes(searchLower) ||
          unidad.client?.name?.toLowerCase().includes(searchLower)
        );
      }

      // Filtro de categoría
      if (categoryFilter) {
        filteredUnidades = filteredUnidades.filter(unidad =>
          unidad.equipment?.equipment_category === categoryFilter
        );
      }

      setUnidades(filteredUnidades);
    } catch (err) {
      console.error('Error fetching unidades:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`${errorMessage}. Es posible que las tablas no existan en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnidades();
  }, [searchTerm, statusFilter, categoryFilter]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'available': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Disponible' },
      'installed': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', label: 'Instalado' },
      'maintenance': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Mantenimiento' },
      'defective': { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', label: 'Defectuoso' },
      'sold': { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300', label: 'Vendido' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['available'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getCategoryDisplay = (category: string) => {
    const categoryNames = {
      'main_equipment': 'Equipos Principales',
      'parts_consumables': 'Repuestos y Consumibles',
      'tools_accessories': 'Herramientas y Accesorios'
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar inventario físico</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={fetchUnidades}
              className="btn-secondary"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Inventario Físico
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control completo de todas las unidades físicas por número de serie
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Unidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{unidades.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Disponibles</p>
              <p className="text-2xl font-bold text-green-600">
                {unidades.filter(u => u.status === 'available').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Instaladas</p>
              <p className="text-2xl font-bold text-blue-600">
                {unidades.filter(u => u.status === 'installed').length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">En Servicio</p>
              <p className="text-2xl font-bold text-yellow-600">
                {unidades.filter(u => ['maintenance', 'defective'].includes(u.status)).length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número de serie, IMEI, equipo, bodega o cliente..."
              className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="available">Disponible</option>
              <option value="installed">Instalado</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="defective">Defectuoso</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              <option value="main_equipment">Equipos Principales</option>
              <option value="parts_consumables">Repuestos y Consumibles</option>
              <option value="tools_accessories">Herramientas y Accesorios</option>
            </select>

            {canManage() && (
              <button
                onClick={() => router.push('/inventario-fisico/importar')}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Importar Series
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de unidades */}
      <div className="card-modern overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando inventario físico...</p>
          </div>
        ) : unidades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente/Asignación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Registro
                  </th>
                  {canManage() && (
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {unidades.map((unidad) => (
                  <tr key={unidad.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          S/N: {unidad.serial_number}
                        </div>
                        {unidad.imei && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            IMEI: {unidad.imei}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          ID: {unidad.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {unidad.equipment?.name || 'Equipo no encontrado'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getCategoryDisplay(unidad.equipment?.equipment_category || '')}
                        </div>
                        {unidad.equipment?.price && (
                          <div className="text-xs text-gray-400">
                            ${unidad.equipment.price.toLocaleString('es-CL')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(unidad.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {unidad.warehouse?.name || 'Sin ubicación'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {unidad.warehouse?.warehouse_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {unidad.client?.name || 'Sin asignar'}
                      </div>
                      {unidad.installation_date && (
                        <div className="text-xs text-gray-500">
                          Instalado: {new Date(unidad.installation_date).toLocaleDateString('es-CL')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {new Date(unidad.created_at).toLocaleDateString('es-CL')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(unidad.created_at).toLocaleTimeString('es-CL')}
                      </div>
                    </td>
                    {canManage() && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/inventario-fisico/${unidad.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          Ver Detalle
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay unidades en inventario
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron unidades que coincidan con tu búsqueda.' : 'Comienza importando números de serie al sistema.'}
            </p>
            {canManage() && !searchTerm && (
              <div className="mt-6">
                <button 
                  onClick={() => router.push('/inventario-fisico/importar')} 
                  className="btn-primary"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Importar Primeras Unidades
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}