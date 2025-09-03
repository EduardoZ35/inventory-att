"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { ServiceOrder, ServiceOrderPart, EquipmentInstance } from '@/types';

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { canManage } = useAuthStore();
  const [serviceOrder, setServiceOrder] = useState<ServiceOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage()) {
      router.push('/unauthorized');
      return;
    }

    if (params.id) {
      fetchServiceOrder(params.id as string);
    }
  }, [params.id, canManage, router]);

  const fetchServiceOrder = async (id: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          client:clients(*),
          technician:profiles(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setServiceOrder(data);
    } catch (err) {
      console.error('Error fetching service order:', err);
      setError('Error al cargar la orden de servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: ServiceOrder['status']) => {
    if (!serviceOrder) return;

    try {
      const { error } = await supabase
        .from('service_orders')
        .update({ 
          status: newStatus,
          ...(newStatus === 'completed' && { completion_date: new Date().toISOString() })
        })
        .eq('id', serviceOrder.id);

      if (error) throw error;

      setServiceOrder(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Error al actualizar el estado');
    }
  };

  const getStatusColor = (status: ServiceOrder['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'in_progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  const getPriorityColor = (priority: ServiceOrder['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="main-container page-bg">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando orden de servicio...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !serviceOrder) {
    return (
      <div className="main-container page-bg">
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Orden de servicio no encontrada'}</p>
          <button
            onClick={() => router.back()}
            className="btn-theme-secondary"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container page-bg">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Orden de Servicio #{serviceOrder.order_number}</h1>
              <p className="page-subtitle">
                Detalles de la orden de servicio técnico
              </p>
            </div>
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(serviceOrder.status)}`}>
                {serviceOrder.status === 'pending' && 'Pendiente'}
                {serviceOrder.status === 'scheduled' && 'Programado'}
                {serviceOrder.status === 'in_progress' && 'En Progreso'}
                {serviceOrder.status === 'completed' && 'Completado'}
                {serviceOrder.status === 'cancelled' && 'Cancelado'}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(serviceOrder.priority)}`}>
                {serviceOrder.priority === 'urgent' && 'Urgente'}
                {serviceOrder.priority === 'high' && 'Alta'}
                {serviceOrder.priority === 'normal' && 'Normal'}
                {serviceOrder.priority === 'low' && 'Baja'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información Principal */}
          <div className="lg:col-span-2">
            <div className="card-theme p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información General</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{serviceOrder.client?.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Técnico Asignado</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {serviceOrder.technician?.first_name} {serviceOrder.technician?.last_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tipo de Servicio</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {serviceOrder.service_type === 'installation' && 'Instalación'}
                    {serviceOrder.service_type === 'maintenance' && 'Mantenimiento'}
                    {serviceOrder.service_type === 'repair' && 'Reparación'}
                    {serviceOrder.service_type === 'replacement' && 'Reemplazo'}
                    {serviceOrder.service_type === 'warranty' && 'Garantía'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Serie del Equipo</label>
                  <p className="mt-1 text-gray-900 dark:text-white">{serviceOrder.equipment_serial || 'N/A'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Programada</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {serviceOrder.scheduled_date 
                      ? new Date(serviceOrder.scheduled_date).toLocaleString() 
                      : 'No programada'
                    }
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Creación</label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {new Date(serviceOrder.created_at!).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descripción</label>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{serviceOrder.description}</p>
                </div>
              </div>

              {serviceOrder.notes && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notas</label>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{serviceOrder.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div>
            <div className="card-theme p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acciones</h3>
              
              <div className="space-y-3">
                {serviceOrder.status === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus('scheduled')}
                      className="w-full btn-theme-primary"
                    >
                      Programar
                    </button>
                    <button
                      onClick={() => updateStatus('in_progress')}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      Iniciar Trabajo
                    </button>
                  </>
                )}

                {serviceOrder.status === 'scheduled' && (
                  <button
                    onClick={() => updateStatus('in_progress')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Iniciar Trabajo
                  </button>
                )}

                {serviceOrder.status === 'in_progress' && (
                  <button
                    onClick={() => updateStatus('completed')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Completar
                  </button>
                )}

                {serviceOrder.status !== 'completed' && serviceOrder.status !== 'cancelled' && (
                  <button
                    onClick={() => updateStatus('cancelled')}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                )}

                <button
                  onClick={() => router.push(`/service-orders/${serviceOrder.id}/edit`)}
                  className="w-full btn-theme-secondary"
                >
                  Editar
                </button>

                <button
                  onClick={() => router.back()}
                  className="w-full btn-theme-secondary"
                >
                  Volver
                </button>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="card-theme p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Información Adicional</h3>
              
              <div className="space-y-4">
                {serviceOrder.labor_hours && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Horas de Trabajo</label>
                    <p className="mt-1 text-gray-900 dark:text-white">{serviceOrder.labor_hours} hrs</p>
                  </div>
                )}

                {serviceOrder.total_cost && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Costo Total</label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      ${serviceOrder.total_cost.toLocaleString()}
                    </p>
                  </div>
                )}

                {serviceOrder.completion_date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha Completado</label>
                    <p className="mt-1 text-gray-900 dark:text-white">
                      {new Date(serviceOrder.completion_date).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}