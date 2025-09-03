"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { ServiceOrder, Client, Profile } from '@/types';

export default function EditServiceOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { canManage } = useAuthStore();
  
  const [formData, setFormData] = useState({
    client_id: 0,
    technician_id: '',
    service_type: 'installation' as ServiceOrder['service_type'],
    priority: 'normal' as ServiceOrder['priority'],
    description: '',
    equipment_serial: '',
    scheduled_date: '',
    notes: '',
    labor_hours: '',
    total_cost: '',
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canManage()) {
      router.push('/unauthorized');
      return;
    }

    if (params.id) {
      fetchServiceOrder(params.id as string);
      fetchClients();
      fetchTechnicians();
    }
  }, [params.id, canManage, router]);

  const fetchServiceOrder = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setFormData({
        client_id: data.client_id,
        technician_id: data.technician_id,
        service_type: data.service_type,
        priority: data.priority,
        description: data.description,
        equipment_serial: data.equipment_serial || '',
        scheduled_date: data.scheduled_date ? data.scheduled_date.slice(0, 16) : '',
        notes: data.notes || '',
        labor_hours: data.labor_hours?.toString() || '',
        total_cost: data.total_cost?.toString() || '',
      });
    } catch (err) {
      console.error('Error fetching service order:', err);
      setError('Error al cargar la orden de servicio');
    } finally {
      setIsFetching(false);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, client_type')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, role, is_blocked, blocked_at, blocked_by, blocked_reason, authorized, authorized_at, authorized_by')
        .eq('role', 'tech_support')
        .eq('authorized', true)
        .eq('is_blocked', false);
      
      if (error) throw error;
      setTechnicians(data || []);
    } catch (err) {
      console.error('Error fetching technicians:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const updateData: any = {
        client_id: formData.client_id,
        technician_id: formData.technician_id,
        service_type: formData.service_type,
        priority: formData.priority,
        description: formData.description,
        equipment_serial: formData.equipment_serial || null,
        scheduled_date: formData.scheduled_date || null,
        notes: formData.notes || null,
        labor_hours: formData.labor_hours ? parseFloat(formData.labor_hours) : null,
        total_cost: formData.total_cost ? parseFloat(formData.total_cost) : null,
      };

      const { error } = await supabase
        .from('service_orders')
        .update(updateData)
        .eq('id', params.id);

      if (error) throw error;

      router.push(`/service-orders/${params.id}`);
    } catch (err) {
      console.error('Error updating service order:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la orden de servicio');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'client_id' ? parseInt(value) || 0 : value
    }));
  };

  if (isFetching) {
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

  return (
    <div className="main-container page-bg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Editar Orden de Servicio</h1>
          <p className="page-subtitle">
            Modificar los detalles de la orden de servicio técnico
          </p>
        </div>

        {/* Formulario */}
        <div className="card-theme">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cliente *
                </label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleChange}
                  className="input-theme w-full"
                  required
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.client_type?.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Técnico */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Técnico Asignado *
                </label>
                <select
                  name="technician_id"
                  value={formData.technician_id}
                  onChange={handleChange}
                  className="input-theme w-full"
                  required
                >
                  <option value="">Seleccionar técnico</option>
                  {technicians.map(tech => (
                    <option key={tech.id} value={tech.id}>
                      {tech.first_name} {tech.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Servicio *
                </label>
                <select
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="input-theme w-full"
                  required
                >
                  <option value="installation">Instalación</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="repair">Reparación</option>
                  <option value="replacement">Reemplazo</option>
                  <option value="warranty">Garantía</option>
                </select>
              </div>

              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prioridad *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-theme w-full"
                  required
                >
                  <option value="low">Baja</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              {/* Serie del equipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Serie del Equipo
                </label>
                <input
                  type="text"
                  name="equipment_serial"
                  value={formData.equipment_serial}
                  onChange={handleChange}
                  placeholder="Número de serie del equipo"
                  className="input-theme w-full"
                />
              </div>

              {/* Fecha programada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha Programada
                </label>
                <input
                  type="datetime-local"
                  name="scheduled_date"
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  className="input-theme w-full"
                />
              </div>

              {/* Horas de trabajo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Horas de Trabajo
                </label>
                <input
                  type="number"
                  name="labor_hours"
                  value={formData.labor_hours}
                  onChange={handleChange}
                  step="0.5"
                  min="0"
                  placeholder="Horas trabajadas"
                  className="input-theme w-full"
                />
              </div>

              {/* Costo total */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Costo Total
                </label>
                <input
                  type="number"
                  name="total_cost"
                  value={formData.total_cost}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Costo total del servicio"
                  className="input-theme w-full"
                />
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción del Servicio *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe detalladamente el trabajo a realizar..."
                className="input-theme w-full"
                required
              />
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notas Adicionales
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notas adicionales, observaciones, etc."
                className="input-theme w-full"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-theme-secondary flex-1"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-theme-primary flex-1 disabled:opacity-50"
              >
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}