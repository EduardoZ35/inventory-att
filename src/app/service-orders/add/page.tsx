"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Client, Profile, CreateServiceOrderDTO } from '@/types';

export default function AddServiceOrderPage() {
  const [formData, setFormData] = useState<CreateServiceOrderDTO>({
    client_id: 0,
    technician_id: '',
    service_type: 'installation',
    priority: 'normal',
    description: '',
    equipment_serial: '',
    scheduled_date: '',
  });
  
  const [clients, setClients] = useState<Client[]>([]);
  const [technicians, setTechnicians] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { canManage } = useAuthStore();

  useEffect(() => {
    if (!canManage()) {
      router.push('/unauthorized');
      return;
    }

    fetchClients();
    fetchTechnicians();
  }, [canManage, router]);

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

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OS-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const orderNumber = generateOrderNumber();
      
      const { data, error } = await supabase
        .from('service_orders')
        .insert([{
          order_number: orderNumber,
          ...formData,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;

      router.push(`/service-orders/${data.id}`);
    } catch (err) {
      console.error('Error creating service order:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la orden de servicio');
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

  return (
    <div className="main-container page-bg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Nueva Orden de Servicio</h1>
          <p className="page-subtitle">
            Crear una nueva orden de servicio técnico para instalación, reparación o mantenimiento
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
                {isLoading ? 'Creando...' : 'Crear Orden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}