"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Equipment, EquipmentInstance } from '@/types';

export default function EquipmentInstancesPage() {
  const { id } = useParams();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [instances, setInstances] = useState<EquipmentInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newInstance, setNewInstance] = useState({
    serial_number: '',
    imei: '',
    location_id: '',
    status: 'available',
    condition: 'new'
  });

  const router = useRouter();
  const { canManage } = useAuthStore();

  useEffect(() => {
    fetchEquipmentAndInstances();
  }, [id]);

  const fetchEquipmentAndInstances = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener información del equipo
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (equipmentError) throw equipmentError;
      setEquipment(equipmentData);

      // Obtener instancias con información relacionada
      const { data: instancesData, error: instancesError } = await supabase
        .from('equipment_instances')
        .select(`
          *,
          warehouses!location_id (
            id,
            name,
            warehouse_type
          ),
          clients!assigned_to_client (
            id,
            name,
            client_type
          )
        `)
        .eq('equipment_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (instancesError) throw instancesError;
      setInstances(instancesData || []);

    } catch (err) {
      console.error('Error fetching equipment instances:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newInstance.serial_number || !newInstance.location_id) {
      setError('El número de serie y la ubicación son obligatorios');
      return;
    }

    try {
      const { error } = await supabase
        .from('equipment_instances')
        .insert([{
          equipment_id: parseInt(id as string),
          serial_number: newInstance.serial_number.trim(),
          imei: newInstance.imei.trim() || null,
          location_id: parseInt(newInstance.location_id),
          status: newInstance.status,
          condition: newInstance.condition,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Registrar movimiento de entrada
      await supabase
        .from('stock_movements')
        .insert([{
          equipment_instance_id: null, // Se actualizará con trigger o después
          movement_type: 'purchase',
          quantity: 1,
          to_warehouse_id: parseInt(newInstance.location_id),
          reason: `Ingreso nuevo - ${equipment?.name} S/N: ${newInstance.serial_number}`,
          performed_by: (await supabase.auth.getUser()).data.user?.id,
          created_at: new Date().toISOString()
        }]);

      setNewInstance({
        serial_number: '',
        imei: '',
        location_id: '',
        status: 'available',
        condition: 'new'
      });
      setShowAddForm(false);
      fetchEquipmentAndInstances();

    } catch (err) {
      console.error('Error adding instance:', err);
      setError(err instanceof Error ? err.message : 'Error al agregar instancia');
    }
  };

  const handleDeleteInstance = async (instanceId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta instancia?')) return;

    try {
      const { error } = await supabase
        .from('equipment_instances')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', instanceId);

      if (error) throw error;
      fetchEquipmentAndInstances();
    } catch (err) {
      console.error('Error deleting instance:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

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

  const getConditionBadge = (condition: string) => {
    const conditionConfig = {
      'new': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', label: 'Nuevo' },
      'good': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', label: 'Bueno' },
      'fair': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', label: 'Regular' },
      'poor': { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300', label: 'Malo' },
      'broken': { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', label: 'Averiado' }
    };
    
    const config = conditionConfig[condition as keyof typeof conditionConfig] || conditionConfig['good'];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredInstances = instances.filter(instance => 
    (instance.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     instance.imei?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (!statusFilter || instance.status === statusFilter)
  );

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando instancias...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!equipment) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Equipo no encontrado</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">
            El equipo que buscas no existe o ha sido eliminado.
          </p>
          <button 
            onClick={() => router.push('/equipment')}
            className="mt-2 btn-secondary"
          >
            Volver a equipos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.push('/equipment')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-gray-400">Equipos</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-300">Instancias</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Instancias de {equipment.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control individual de cada unidad física • Total: {instances.length} unidades
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Unidades</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{instances.length}</p>
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
                {instances.filter(i => i.status === 'available').length}
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
                {instances.filter(i => i.status === 'installed').length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">En Mantenimiento</p>
              <p className="text-2xl font-bold text-yellow-600">
                {instances.filter(i => i.status === 'maintenance').length}
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
          <div className="flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número de serie o IMEI..."
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
              <option value="sold">Vendido</option>
            </select>

            {canManage() && (
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/equipment/${id}/instances/bulk-import`)}
                  className="btn-secondary flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Importar Masivo
                </button>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Individual
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulario agregar instancia */}
      {showAddForm && (
        <div className="card-modern p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Agregar Nueva Instancia</h3>
          <form onSubmit={handleAddInstance} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Serie <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newInstance.serial_number}
                  onChange={(e) => setNewInstance(prev => ({...prev, serial_number: e.target.value}))}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: ZK-12345678"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IMEI (opcional)
                </label>
                <input
                  type="text"
                  value={newInstance.imei}
                  onChange={(e) => setNewInstance(prev => ({...prev, imei: e.target.value}))}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 123456789012345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación <span className="text-red-500">*</span>
                </label>
                <select
                  value={newInstance.location_id}
                  onChange={(e) => setNewInstance(prev => ({...prev, location_id: e.target.value}))}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar bodega</option>
                  {/* Aquí deberías cargar las bodegas dinámicamente */}
                  <option value="1">Bodega Principal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={newInstance.status}
                  onChange={(e) => setNewInstance(prev => ({...prev, status: e.target.value}))}
                  className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="available">Disponible</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="defective">Defectuoso</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
              >
                Agregar Instancia
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de instancias */}
      <div className="card-modern overflow-hidden">
        {filteredInstances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Identificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado/Condición
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cliente Asignado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Fechas
                  </th>
                  {canManage() && (
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInstances.map((instance) => (
                  <tr key={instance.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          S/N: {instance.serial_number}
                        </div>
                        {instance.imei && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            IMEI: {instance.imei}
                          </div>
                        )}
                        <div className="text-xs text-gray-400">
                          ID: {instance.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getStatusBadge(instance.status)}
                        {getConditionBadge(instance.condition)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {instance.warehouses?.name || 'Sin ubicación'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {instance.warehouses?.warehouse_type}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        {instance.clients?.name || 'Sin asignar'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        <div>Creado: {new Date(instance.created_at).toLocaleDateString('es-CL')}</div>
                        {instance.installation_date && (
                          <div className="text-xs text-gray-500">
                            Instalado: {new Date(instance.installation_date).toLocaleDateString('es-CL')}
                          </div>
                        )}
                      </div>
                    </td>
                    {canManage() && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/equipment/${id}/instances/${instance.id}`)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          Ver
                        </button>
                        <button
                          onClick={() => handleDeleteInstance(instance.id)}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay instancias
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron instancias que coincidan con tu búsqueda.' : 'Comienza agregando la primera instancia de este equipo.'}
            </p>
            {canManage() && !searchTerm && (
              <div className="mt-6">
                <button 
                  onClick={() => setShowAddForm(true)} 
                  className="btn-primary"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Primera Instancia
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}