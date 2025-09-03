"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { CreateStockMovementDTO, EquipmentInstance, Warehouse, Client, ServiceOrder } from '@/types';

export default function AddStockMovementPage() {
  const [formData, setFormData] = useState<CreateStockMovementDTO>({
    equipment_instance_id: 0,
    movement_type: 'purchase',
    quantity: 1,
    reason: '',
  });
  
  const [equipmentInstances, setEquipmentInstances] = useState<EquipmentInstance[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { canManage, user } = useAuthStore();

  useEffect(() => {
    if (!canManage()) {
      router.push('/unauthorized');
      return;
    }

    fetchEquipmentInstances();
    fetchWarehouses();
    fetchClients();
    fetchServiceOrders();
  }, [canManage, router]);

  const fetchEquipmentInstances = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment_instances')
        .select(`
          id,
          equipment_id,
          serial_number,
          imei,
          location_id,
          status,
          condition,
          installation_date,
          warranty_expiry,
          last_maintenance,
          assigned_to_client,
          deleted_at,
          created_at,
          updated_at,
          equipment:equipment_id (
            id,
            name,
            description,
            price,
            equipment_category,
            equipment_subcategory,
            serial_number,
            imei,
            batch_number,
            expiry_date,
            minimum_stock,
            critical_stock,
            deleted_at,
            created_at,
            updated_at
          )
        `)
        .order('serial_number');
      
      if (error) throw error;
      setEquipmentInstances((data || []) as unknown as EquipmentInstance[]);
    } catch (err) {
      console.error('Error fetching equipment instances:', err);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { data, error } = await supabase
        .from('warehouses')
        .select('id, name, location, warehouse_type')
        .order('name');
      
      if (error) throw error;
      setWarehouses(data || []);
    } catch (err) {
      console.error('Error fetching warehouses:', err);
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

  const fetchServiceOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('service_orders')
        .select('id, order_number, status, client:clients(name)')
        .in('status', ['pending', 'scheduled', 'in_progress'])
        .order('order_number');
      
      if (error) throw error;
      setServiceOrders((data || []) as unknown as ServiceOrder[]);
    } catch (err) {
      console.error('Error fetching service orders:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('stock_movements')
        .insert([{
          ...formData,
          performed_by: user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      // Actualizar el stock del equipo según el tipo de movimiento
      await updateEquipmentStock(formData);

      router.push('/stock-movements');
    } catch (err) {
      console.error('Error creating stock movement:', err);
      setError(err instanceof Error ? err.message : 'Error al crear el movimiento de stock');
    } finally {
      setIsLoading(false);
    }
  };

  const updateEquipmentStock = async (movement: CreateStockMovementDTO) => {
    // Esta función debería actualizar el stock del equipo
    // dependiendo del tipo de movimiento
    try {
      const equipmentInstance = equipmentInstances.find(ei => ei.id === movement.equipment_instance_id);
      if (!equipmentInstance) return;

      let newStatus = equipmentInstance.status;
      let newLocationId = equipmentInstance.location_id;

      // Determinar nuevo estado y ubicación según el tipo de movimiento
      switch (movement.movement_type) {
        case 'purchase':
        case 'warranty_return':
        case 'inventory_adjustment':
          newStatus = 'available';
          newLocationId = movement.to_warehouse_id || equipmentInstance.location_id;
          break;
        
        case 'client_installation':
          newStatus = 'installed';
          break;
        
        case 'internal_loan':
          newStatus = 'in_transit';
          break;
        
        case 'warranty_replacement':
          newStatus = 'warranty';
          break;
        
        case 'obsolescence':
          newStatus = 'obsolete';
          break;
        
        case 'warehouse_transfer':
          newLocationId = movement.to_warehouse_id || equipmentInstance.location_id;
          break;
      }

      await supabase
        .from('equipment_instances')
        .update({ 
          status: newStatus,
          location_id: newLocationId
        })
        .eq('id', movement.equipment_instance_id);

    } catch (err) {
      console.error('Error updating equipment stock:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['equipment_instance_id', 'quantity', 'from_warehouse_id', 'to_warehouse_id', 'client_id', 'service_order_id'].includes(name)
        ? (parseInt(value) || undefined)
        : value
    }));
  };

  const getMovementTypeDescription = (type: string) => {
    const descriptions = {
      purchase: 'Entrada de equipos comprados a proveedores',
      warranty_return: 'Devolución de equipos desde garantía',
      inventory_adjustment: 'Ajuste manual de inventario',
      client_installation: 'Salida para instalación en cliente',
      internal_loan: 'Préstamo o entrega interna',
      warranty_replacement: 'Reemplazo por garantía',
      obsolescence: 'Baja por obsolescencia o daño',
      warehouse_transfer: 'Transferencia entre bodegas'
    };
    return descriptions[type as keyof typeof descriptions] || '';
  };

  const requiresFromWarehouse = () => {
    return ['client_installation', 'internal_loan', 'warranty_replacement', 'obsolescence', 'warehouse_transfer'].includes(formData.movement_type);
  };

  const requiresToWarehouse = () => {
    return ['purchase', 'warranty_return', 'inventory_adjustment', 'warehouse_transfer'].includes(formData.movement_type);
  };

  const requiresClient = () => {
    return ['client_installation'].includes(formData.movement_type);
  };

  return (
    <div className="main-container page-bg">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Registrar Movimiento de Stock</h1>
          <p className="page-subtitle">
            Registrar entrada, salida o transferencia de equipos
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
              {/* Tipo de movimiento */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Movimiento *
                </label>
                <select
                  name="movement_type"
                  value={formData.movement_type}
                  onChange={handleChange}
                  className="input-theme w-full"
                  required
                >
                  <optgroup label="Entradas">
                    <option value="purchase">Compra a proveedor</option>
                    <option value="warranty_return">Devolución de garantía</option>
                    <option value="inventory_adjustment">Ajuste de inventario</option>
                  </optgroup>
                  <optgroup label="Salidas">
                    <option value="client_installation">Instalación a cliente</option>
                    <option value="internal_loan">Préstamo interno</option>
                    <option value="warranty_replacement">Reemplazo por garantía</option>
                    <option value="obsolescence">Obsolescencia/Baja</option>
                  </optgroup>
                  <optgroup label="Transferencias">
                    <option value="warehouse_transfer">Transferencia entre bodegas</option>
                  </optgroup>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {getMovementTypeDescription(formData.movement_type)}
                </p>
              </div>

              {/* Equipo */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Equipo *
                </label>
                <select
                  name="equipment_instance_id"
                  value={formData.equipment_instance_id}
                  onChange={handleChange}
                  className="input-theme w-full"
                  required
                >
                  <option value="">Seleccionar equipo</option>
                  {equipmentInstances.map(instance => (
                    <option key={instance.id} value={instance.id}>
                      {instance.equipment?.name} - Serie: {instance.serial_number} 
                      ({instance.status}, {instance.condition})
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="input-theme w-full"
                  required
                />
              </div>

              {/* Bodega origen */}
              {requiresFromWarehouse() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bodega Origen *
                  </label>
                  <select
                    name="from_warehouse_id"
                    value={formData.from_warehouse_id || ''}
                    onChange={handleChange}
                    className="input-theme w-full"
                    required
                  >
                    <option value="">Seleccionar bodega origen</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.warehouse_type?.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Bodega destino */}
              {requiresToWarehouse() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bodega Destino *
                  </label>
                  <select
                    name="to_warehouse_id"
                    value={formData.to_warehouse_id || ''}
                    onChange={handleChange}
                    className="input-theme w-full"
                    required
                  >
                    <option value="">Seleccionar bodega destino</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.warehouse_type?.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cliente */}
              {requiresClient() && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente *
                  </label>
                  <select
                    name="client_id"
                    value={formData.client_id || ''}
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
              )}

              {/* Orden de servicio (opcional) */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Orden de Servicio (opcional)
                </label>
                <select
                  name="service_order_id"
                  value={formData.service_order_id || ''}
                  onChange={handleChange}
                  className="input-theme w-full"
                >
                  <option value="">Sin orden de servicio</option>
                  {serviceOrders.map(order => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.client?.name} ({order.status})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Razón */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Razón del Movimiento *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                placeholder="Describe la razón del movimiento de stock..."
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
                {isLoading ? 'Registrando...' : 'Registrar Movimiento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}