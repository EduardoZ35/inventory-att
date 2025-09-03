"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { ServiceOrder, ServiceOrderFilters } from '@/types';

export default function ServiceOrdersClient() {
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ServiceOrderFilters>({});
  const [searchTerm, setSearchTerm] = useState('');

  const router = useRouter();
  const { canManage, user } = useAuthStore();

  const fetchServiceOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('service_orders')
        .select(`
          id,
          order_number,
          client_id,
          technician_id,
          service_type,
          priority,
          status,
          description,
          equipment_serial,
          scheduled_date,
          completion_date,
          labor_hours,
          total_cost,
          notes,
          created_at,
          updated_at,
          clients:client_id (
            id,
            name,
            client_type
          ),
          profiles:technician_id (
            id,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters.search) {
        query = query.or(`order_number.ilike.%${filters.search}%,description.ilike.%${filters.search}%,equipment_serial.ilike.%${filters.search}%`);
      }

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.service_type) {
        query = query.eq('service_type', filters.service_type);
      }

      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }

      if (filters.client_id) {
        query = query.eq('client_id', filters.client_id);
      }

      if (filters.technician_id) {
        query = query.eq('technician_id', filters.technician_id);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setServiceOrders(data || []);
    } catch (err) {
      console.error('Error fetching service orders:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`${errorMessage}. Es posible que la tabla 'service_orders' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceOrders();
  }, [filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
  };

  const handleStatusFilter = (status?: string) => {
    setFilters({ ...filters, status: status as any });
  };

  const handleAddNew = () => {
    router.push('/service-orders/add');
  };

  const handleView = (orderId: number) => {
    router.push(`/service-orders/${orderId}`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
      scheduled: { label: 'Programado', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      in_progress: { label: 'En Progreso', class: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300' },
      completed: { label: 'Completado', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
      cancelled: { label: 'Cancelado', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { label: 'Baja', class: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
      normal: { label: 'Normal', class: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
      high: { label: 'Alta', class: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
      urgent: { label: 'Urgente', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' },
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || { label: priority, class: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.label}
      </span>
    );
  };

  if (error) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <h3 className="text-lg font-semibold mb-2">Error al cargar órdenes de servicio</h3>
          <p className="mb-4">{error}</p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium">💡 Solución</h4>
            <p className="text-sm mt-1">
              Necesitas crear la tabla 'service_orders' en Supabase para el sistema de órdenes de servicio técnico.
            </p>
          </div>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={fetchServiceOrders}
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
          Órdenes de Servicio Técnico
        </h1>
        <p className="page-subtitle">
          Gestiona instalaciones, reparaciones y mantenimiento de equipos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Total Órdenes</p>
              <p className="stats-number text-blue-600">{serviceOrders.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Pendientes</p>
              <p className="stats-number text-yellow-600">
                {serviceOrders.filter(order => order.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">En Progreso</p>
              <p className="stats-number text-purple-600">
                {serviceOrders.filter(order => order.status === 'in_progress').length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stats-label">Completadas</p>
              <p className="stats-number text-green-600">
                {serviceOrders.filter(order => order.status === 'completed').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                placeholder="Buscar por número de orden, descripción o serie del equipo..."
                className="input-theme w-full pl-10 pr-4"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => handleStatusFilter(undefined)}
              className={`btn-theme-secondary text-sm ${!filters.status ? 'bg-blue-100 text-blue-800' : ''}`}
            >
              Todas
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`btn-theme-secondary text-sm ${filters.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}`}
            >
              Pendientes
            </button>
            <button
              onClick={() => handleStatusFilter('in_progress')}
              className={`btn-theme-secondary text-sm ${filters.status === 'in_progress' ? 'bg-purple-100 text-purple-800' : ''}`}
            >
              En Progreso
            </button>
            <button
              onClick={() => handleStatusFilter('completed')}
              className={`btn-theme-secondary text-sm ${filters.status === 'completed' ? 'bg-green-100 text-green-800' : ''}`}
            >
              Completadas
            </button>
          </div>

          {canManage() && (
            <button
              onClick={handleAddNew}
              className="btn-theme-primary flex items-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Orden
            </button>
          )}
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="card-theme overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2">Cargando órdenes de servicio...</p>
          </div>
        ) : serviceOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table-theme min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Orden
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Técnico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Tipo/Prioridad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Programada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {serviceOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.order_number}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {order.equipment_serial && `Serie: ${order.equipment_serial}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {order.client?.name || 'Cliente no encontrado'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {order.client?.client_type?.replace(/_/g, ' ') || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {order.technician ? 
                          `${order.technician.first_name} ${order.technician.last_name}`.trim() || 'Sin asignar' :
                          'Sin asignar'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {order.service_type?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                        </div>
                        {getPriorityBadge(order.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {order.scheduled_date ? 
                          new Date(order.scheduled_date).toLocaleDateString('es-CL') : 
                          'No programada'
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleView(order.id)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay órdenes de servicio</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || filters.status ? 'No se encontraron órdenes que coincidan con los filtros.' : 'Comienza creando una nueva orden de servicio.'}
            </p>
            {canManage() && !searchTerm && !filters.status && (
              <div className="mt-6">
                <button onClick={handleAddNew} className="btn-theme-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Primera Orden
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}