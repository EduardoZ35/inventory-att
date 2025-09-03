"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Equipment } from '@/types';

export default function ImportarUnidadesPage() {
  const [equipos, setEquipos] = useState<Equipment[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [serialNumbers, setSerialNumbers] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('available');
  const [selectedCondition, setSelectedCondition] = useState('new');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<string[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [equipmentRes, warehousesRes] = await Promise.all([
        supabase
          .from('equipment')
          .select('id, name, equipment_category, equipment_subcategory, price')
          .is('deleted_at', null)
          .order('name'),
        supabase
          .from('warehouses')
          .select('id, name, warehouse_type')
          .order('name')
      ]);

      if (equipmentRes.error) throw equipmentRes.error;
      if (warehousesRes.error) throw warehousesRes.error;

      setEquipos(equipmentRes.data || []);
      setWarehouses(warehousesRes.data || []);
      
      if (warehousesRes.data && warehousesRes.data.length > 0) {
        setSelectedWarehouse(warehousesRes.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    }
  };

  const handlePreview = () => {
    const lines = serialNumbers
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    setPreviewData(lines);
    setError(null);
    
    if (lines.length === 0) {
      setError('No se detectaron números de serie válidos');
    }
  };

  const handleBulkImport = async () => {
    if (!selectedEquipment) {
      setError('Debes seleccionar un equipo');
      return;
    }

    if (!selectedWarehouse) {
      setError('Debes seleccionar una bodega');
      return;
    }

    if (previewData.length === 0) {
      setError('No hay datos para importar. Haz clic en "Vista Previa" primero.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Verificar duplicados existentes
      const { data: existingInstances, error: checkError } = await supabase
        .from('equipment_instances')
        .select('serial_number')
        .in('serial_number', previewData)
        .is('deleted_at', null);

      if (checkError) throw checkError;

      const existingSerials = existingInstances?.map(i => i.serial_number) || [];
      const duplicates = previewData.filter(serial => existingSerials.includes(serial));

      if (duplicates.length > 0) {
        setError(`Los siguientes números de serie ya existen: ${duplicates.join(', ')}`);
        return;
      }

      // Preparar datos para inserción
      const instancesToInsert = previewData.map(serialNumber => ({
        equipment_id: parseInt(selectedEquipment),
        serial_number: serialNumber,
        location_id: parseInt(selectedWarehouse),
        status: selectedStatus,
        condition: selectedCondition,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Insertar unidades
      const { error: insertError } = await supabase
        .from('equipment_instances')
        .insert(instancesToInsert);

      if (insertError) throw insertError;

      // Crear movimientos de entrada para cada unidad
      const currentUser = await supabase.auth.getUser();
      const selectedEquipmentData = equipos.find(e => e.id === parseInt(selectedEquipment));
      
      const movementsToInsert = previewData.map(serialNumber => ({
        movement_type: 'purchase',
        quantity: 1,
        to_warehouse_id: parseInt(selectedWarehouse),
        reason: `Importación masiva - ${selectedEquipmentData?.name} S/N: ${serialNumber}`,
        performed_by: currentUser.data.user?.id,
        created_at: new Date().toISOString()
      }));

      await supabase
        .from('stock_movements')
        .insert(movementsToInsert);

      setSuccess(`Se importaron exitosamente ${previewData.length} unidades`);
      
      // Limpiar formulario
      setSerialNumbers('');
      setPreviewData([]);
      setSelectedEquipment('');
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/inventario-fisico');
      }, 2000);

    } catch (err) {
      console.error('Error importing units:', err);
      setError(err instanceof Error ? err.message : 'Error al importar unidades');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categoryNames = {
      'main_equipment': 'Equipos Principales',
      'parts_consumables': 'Repuestos y Consumibles',
      'tools_accessories': 'Herramientas y Accesorios'
    };
    return categoryNames[category as keyof typeof categoryNames] || category;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.push('/inventario-fisico')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <span className="text-gray-400">Inventario Físico</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-300">Importar Unidades</span>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Importar Unidades Masivamente
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Agrega múltiples unidades físicas con números de serie de una sola vez
        </p>
      </div>

      <div className="card-modern p-6">
        <form className="space-y-6">
          {/* Selección de equipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Equipo <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEquipment}
              onChange={(e) => setSelectedEquipment(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Seleccionar equipo</option>
              {equipos.map(equipo => (
                <option key={equipo.id} value={equipo.id.toString()}>
                  {equipo.name} - {getCategoryDisplay(equipo.equipment_category)} - ${equipo.price?.toLocaleString('es-CL')}
                </option>
              ))}
            </select>
          </div>

          {/* Configuración general */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bodega de Destino <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar bodega</option>
                {warehouses.map(warehouse => (
                  <option key={warehouse.id} value={warehouse.id.toString()}>
                    {warehouse.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado Inicial
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="available">Disponible</option>
                <option value="maintenance">Mantenimiento</option>
                <option value="defective">Defectuoso</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Condición Inicial
              </label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">Nuevo</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
                <option value="broken">Averiado</option>
              </select>
            </div>
          </div>

          {/* Área de números de serie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Números de Serie <span className="text-red-500">*</span>
            </label>
            <textarea
              value={serialNumbers}
              onChange={(e) => setSerialNumbers(e.target.value)}
              placeholder="Ingresa un número de serie por línea:&#10;ZK-12345678&#10;ZK-12345679&#10;ZK-12345680&#10;...&#10;&#10;También puedes pegar desde Excel o CSV"
              rows={12}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              💡 Un número de serie por línea. Se ignorarán las líneas vacías.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={handlePreview}
              className="btn-secondary flex items-center gap-2"
              disabled={!serialNumbers.trim() || !selectedEquipment}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Vista Previa
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.push('/inventario-fisico')}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleBulkImport}
                className="btn-primary"
                disabled={isLoading || previewData.length === 0}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Importando...
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Importar {previewData.length} Unidades
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Vista previa */}
          {previewData.length > 0 && selectedEquipment && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  Vista Previa - {previewData.length} unidades detectadas
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {equipos.find(e => e.id === parseInt(selectedEquipment))?.name}
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
                  {previewData.map((serial, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded border font-mono"
                    >
                      {serial}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mensajes */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">¡Éxito!</h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">{success}</div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}