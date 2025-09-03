"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { StockMovement } from '@/types';

export default function StockMovementsClient() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');

  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchMovements = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Consulta base de movimientos
      let query = supabase
        .from('stock_movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (typeFilter) {
        query = query.eq('movement_type', typeFilter);
      }

      const { data: movementsData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (!movementsData || movementsData.length === 0) {
        setMovements([]);
        return;
      }

      // Obtener datos relacionados
      const instanceIds = [...new Set(movementsData.map(m => m.equipment_instance_id))];
      const warehouseIds = [...new Set([
        ...movementsData.map(m => m.from_warehouse_id).filter(Boolean),
        ...movementsData.map(m => m.to_warehouse_id).filter(Boolean)
      ])];
      const clientIds = [...new Set(movementsData.map(m => m.client_id).filter(Boolean))];
      const userIds = [...new Set(movementsData.map(m => m.performed_by).filter(Boolean))];

      // Consultas paralelas para obtener datos relacionados
      const [instancesRes, warehousesRes, clientsRes, usersRes] = await Promise.all([
        // Equipment instances con equipment
        instanceIds.length > 0 ? supabase
          .from('equipment_instances')
          .select(`
            id,
            serial_number,
            equipment_id,
            equipment!equipment_id (
              id,
              name,
              equipment_category,
              equipment_subcategory
            )
          `)
          .in('id', instanceIds) : { data: [], error: null },
        
        // Warehouses
        warehouseIds.length > 0 ? supabase
          .from('warehouses')
          .select('id, name, warehouse_type')
          .in('id', warehouseIds) : { data: [], error: null },
        
        // Clients
        clientIds.length > 0 ? supabase
          .from('clients')
          .select('id, name, client_type')
          .in('id', clientIds) : { data: [], error: null },
        
        // Users/Profiles
        userIds.length > 0 ? supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .in('id', userIds) : { data: [], error: null }
      ]);

      // Crear mapas para lookup rápido
      const instancesMap = new Map((instancesRes.data || []).map(item => [item.id, item]));
      const warehousesMap = new Map((warehousesRes.data || []).map(item => [item.id, item]));
      const clientsMap = new Map((clientsRes.data || []).map(item => [item.id, item]));
      const usersMap = new Map((usersRes.data || []).map(item => [item.id, item]));

      // Combinar datos
      const enrichedMovements = movementsData.map(movement => ({
        ...movement,
        equipment_instance: instancesMap.get(movement.equipment_instance_id) || null,
        from_warehouse: movement.from_warehouse_id ? warehousesMap.get(movement.from_warehouse_id) || null : null,
        to_warehouse: movement.to_warehouse_id ? warehousesMap.get(movement.to_warehouse_id) || null : null,
        client: movement.client_id ? clientsMap.get(movement.client_id) || null : null,
        user: movement.performed_by ? usersMap.get(movement.performed_by) || null : null
      }));

      // Aplicar filtro de búsqueda si existe
      let filteredMovements = enrichedMovements;
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredMovements = enrichedMovements.filter(movement => 
          movement.reason?.toLowerCase().includes(searchLower) ||
          movement.equipment_instance?.serial_number?.toLowerCase().includes(searchLower) ||
          movement.equipment_instance?.equipment?.name?.toLowerCase().includes(searchLower)
        );
      }

      setMovements(filteredMovements as unknown as StockMovement[]);
    } catch (err) {
      console.error('Error fetching stock movements:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`${errorMessage}. Es posible que la tabla 'stock_movements' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovements();
  }, [searchTerm, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMovements();
  };

  const getMovementTypeLabel = (type: string) => {
    const types = {
      purchase: 'Compra',
      installation: 'Instalación',
      transfer: 'Transferencia',
      maintenance: 'Mantenimiento',
      return: 'Devolución',
      adjustment: 'Ajuste',
      sale: 'Venta',
      damaged: 'Dañado'
    };
    return types[type as keyof typeof types] || type;
  };

  const getMovementTypeColor = (type: string) => {
    const colors = {
      purchase: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
      installation: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
      transfer: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
      maintenance: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      return: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
      adjustment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
      sale: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      damaged: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (error) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <h3 className="text-lg font-semibold mb-2">Error al cargar movimientos de stock</h3>
          <p className="mb-4">{error}</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium">💡 Solución</h4>
            <p className="text-sm mt-1">
              Necesitas crear la tabla 'stock_movements' en Supabase para el sistema de gestión de stock.
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={fetchMovements}
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
          Movimientos de Stock
        </h1>
        <p className="page-subtitle">
          Historial de entradas, salidas y transferencias de equipos
        </p>
      </div>

      {/* Estadísticas por tipo de movimiento */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Movimientos</p>
              <p className="stats-number text-blue-600">{movements.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Entradas</p>
              <p className="stats-number text-green-600">
                {movements.filter(m => ['purchase', 'return', 'adjustment'].includes(m.movement_type)).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Salidas</p>
              <p className="stats-number text-red-600">
                {movements.filter(m => ['installation', 'sale', 'damaged', 'maintenance'].includes(m.movement_type)).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Transferencias</p>
              <p className="stats-number text-indigo-600">
                {movements.filter(m => m.movement_type === 'transfer').length}
              </p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="card-theme p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por razón o número de serie..."
                className="input-theme w-full pl-10 pr-4"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-theme text-sm"
            >
              <option value="">Todos los tipos</option>
              <option value="purchase">Compras</option>
              <option value="installation">Instalaciones</option>
              <option value="transfer">Transferencias</option>
              <option value="maintenance">Mantenimiento</option>
              <option value="return">Devoluciones</option>
              <option value="adjustment">Ajustes</option>
              <option value="sale">Ventas</option>
              <option value="damaged">Dañados</option>
            </select>
          </div>

          {canManage() && (
            <button
              onClick={() => router.push('/stock-movements/add')}
              className="btn-theme-primary flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Registrar Movimiento
            </button>
          )}
        </div>
      </div>

      {/* Lista de movimientos */}
      <div className="card-theme overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Cargando movimientos...</p>
          </div>
        ) : movements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-theme min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Tipo de Movimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Desde/Hacia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Realizado por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Razón
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {movements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {new Date(movement.created_at).toLocaleDateString('es-CL')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(movement.created_at).toLocaleTimeString('es-CL')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {movement.equipment_instance?.equipment?.name || 'Equipo no encontrado'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Serie: {movement.equipment_instance?.serial_number || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {movement.equipment_instance?.equipment?.equipment_category?.replace(/_/g, ' ')}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getMovementTypeColor(movement.movement_type)}`}>
                        {getMovementTypeLabel(movement.movement_type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {movement.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {movement.from_warehouse && (
                          <div>Desde: {movement.from_warehouse.name}</div>
                        )}
                        {movement.to_warehouse && (
                          <div>Hacia: {movement.to_warehouse.name}</div>
                        )}
                        {movement.client && (
                          <div>Cliente: {movement.client.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {movement.user ? 
                          [movement.user.first_name, movement.user.last_name]
                            .filter(Boolean)
                            .join(' ') || movement.user.email || 'Usuario' :
                          'Usuario no encontrado'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300 max-w-xs truncate">
                        {movement.reason}
                      </div>
                      {movement.service_order && (
                        <div className="text-xs text-blue-600 dark:text-blue-400">
                          OS: {movement.service_order.order_number}
                        </div>
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay movimientos de stock</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || typeFilter ? 'No se encontraron movimientos que coincidan con los filtros.' : 'Aún no se han registrado movimientos de stock.'}
            </p>
            {canManage() && !searchTerm && !typeFilter && (
              <div className="mt-6">
                <button 
                  onClick={() => router.push('/stock-movements/add')} 
                  className="btn-theme-primary"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Registrar Primer Movimiento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}