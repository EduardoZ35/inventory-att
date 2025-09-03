"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/stores/authStore';
import type { Equipment, EquipmentCategory, EquipmentSubcategory } from '@/types';

export default function EquipmentClient() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory | 'all'>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<EquipmentSubcategory | 'all'>('all');

  const router = useRouter();
  const { canManage } = useAuthStore();

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from('equipment')
        .select('*')
        .is('deleted_at', null)
        .order('name', { ascending: true });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('equipment_category', selectedCategory);
      }

      if (selectedSubcategory && selectedSubcategory !== 'all') {
        query = query.eq('equipment_subcategory', selectedSubcategory);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setEquipment(data || []);
    } catch (err) {
      console.error('Error fetching equipment:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`${errorMessage}. Es posible que la tabla 'equipment' no exista en la base de datos.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedCategory, selectedSubcategory]);

  const handleDelete = async (equipmentId: number) => {
    if (!confirm('¿Estás seguro de eliminar este equipo?')) return;

    try {
      const { error } = await supabase
        .from('equipment')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', equipmentId);

      if (error) {
        throw error;
      }

      fetchEquipment();
    } catch (err) {
      console.error('Error deleting equipment:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleAddNew = () => {
    router.push('/equipment/add');
  };

  const handleEdit = (equipmentId: number) => {
    router.push(`/equipment/edit/${equipmentId}`);
  };

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.imei?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCategoryDisplay = (category: EquipmentCategory) => {
    const categoryNames = {
      'main_equipment': 'Equipos Principales',
      'parts_consumables': 'Repuestos y Consumibles',
      'tools_accessories': 'Herramientas y Accesorios'
    };
    return categoryNames[category] || category;
  };

  const getSubcategoryDisplay = (subcategory: EquipmentSubcategory) => {
    const subcategoryNames = {
      'attendance_clocks': 'Relojes de Asistencia',
      'casino_clocks': 'Relojes Casino',
      'thermal_printers': 'Impresoras Térmicas',
      'fingerprint_readers': 'Huelleros',
      'power_supplies': 'Fuentes de Poder',
      'displays_screens': 'Pantallas/Displays',
      'thermal_ribbons': 'Cintas/Rollos Térmicos',
      'sensors_modules': 'Sensores/Módulos',
      'batteries_ups': 'Baterías/UPS Mini',
      'electronic_boards': 'Placas Electrónicas',
      'installation_tools': 'Herramientas de Instalación',
      'cables_connectors': 'Cables/Conectores',
      'screws_supports': 'Tornillos/Soportes',
      'mounting_kits': 'Kits de Montaje'
    };
    return subcategoryNames[subcategory] || subcategory;
  };

  const getStatusBadge = (item: Equipment) => {
    const stockLevel = item.minimum_stock || 0;
    const criticalLevel = item.critical_stock || 0;
    
    // Para efectos de demo, usar el minimum_stock como cantidad actual
    const currentStock = stockLevel;
    
    if (currentStock <= criticalLevel) {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 rounded-full">Stock Crítico</span>;
    } else if (currentStock <= stockLevel) {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300 rounded-full">Stock Bajo</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full">En Stock</span>;
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar equipos</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">{error}</p>
          <div className="mt-3 flex gap-2">
            <button 
              onClick={fetchEquipment}
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
          Gestión de Equipos
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Control completo del inventario de equipos especializados en control y soporte tecnológico
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, descripción, serie o IMEI..."
            className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filtros por categoría */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value as EquipmentCategory | 'all');
                setSelectedSubcategory('all');
              }}
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las categorías</option>
              <option value="main_equipment">Equipos Principales</option>
              <option value="parts_consumables">Repuestos y Consumibles</option>
              <option value="tools_accessories">Herramientas y Accesorios</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subcategoría
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value as EquipmentSubcategory | 'all')}
              className="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas las subcategorías</option>
              <option value="attendance_clocks">Relojes de Asistencia</option>
              <option value="casino_clocks">Relojes Casino</option>
              <option value="thermal_printers">Impresoras Térmicas</option>
              <option value="fingerprint_readers">Huelleros</option>
              <option value="power_supplies">Fuentes de Poder</option>
              <option value="displays_screens">Pantallas/Displays</option>
              <option value="thermal_ribbons">Cintas/Rollos Térmicos</option>
              <option value="sensors_modules">Sensores/Módulos</option>
              <option value="batteries_ups">Baterías/UPS Mini</option>
              <option value="electronic_boards">Placas Electrónicas</option>
              <option value="installation_tools">Herramientas de Instalación</option>
              <option value="cables_connectors">Cables/Conectores</option>
              <option value="screws_supports">Tornillos/Soportes</option>
              <option value="mounting_kits">Kits de Montaje</option>
            </select>
          </div>

          {canManage() && (
            <div className="flex items-end">
              <button
                onClick={handleAddNew}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Equipo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Equipos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{equipment.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Filtrados</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredEquipment.length}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <svg className="h-6 w-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Categorías</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {selectedCategory === 'all' ? '3' : '1'}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="card-modern p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {isLoading ? 'Cargando...' : 'Listo'}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de equipos */}
      <div className="card-modern overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando equipos...</p>
          </div>
        ) : filteredEquipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  {canManage() && (
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEquipment.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.description || `ID: ${item.id}`}
                          </div>
                          {(item.serial_number || item.imei) && (
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              {item.serial_number && `S/N: ${item.serial_number}`}
                              {item.imei && ` | IMEI: ${item.imei}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                          {getCategoryDisplay(item.equipment_category)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {getSubcategoryDisplay(item.equipment_subcategory)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">
                        ${item.price?.toLocaleString('es-CL') || '0'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-300">
                        <div>Mín: {item.minimum_stock || 0}</div>
                        <div className="text-xs text-gray-500">Crítico: {item.critical_stock || 0}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item)}
                    </td>
                    {canManage() && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay equipos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'No se encontraron equipos que coincidan con tu búsqueda.' : 'Comienza agregando equipos al inventario.'}
            </p>
            {canManage() && !searchTerm && (
              <div className="mt-6">
                <button onClick={handleAddNew} className="btn-primary">
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Agregar Primer Equipo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}