"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { EquipmentCategory, EquipmentSubcategory } from '@/types';

export default function AddEquipmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    equipment_category: 'main_equipment' as EquipmentCategory,
    equipment_subcategory: 'attendance_clocks' as EquipmentSubcategory,
    serial_number: '',
    imei: '',
    batch_number: '',
    expiry_date: '',
    minimum_stock: '',
    critical_stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('equipment')
        .insert([{ 
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          price: formData.price ? parseFloat(formData.price) : 0,
          equipment_category: formData.equipment_category,
          equipment_subcategory: formData.equipment_subcategory,
          serial_number: formData.serial_number.trim() || null,
          imei: formData.imei.trim() || null,
          batch_number: formData.batch_number.trim() || null,
          expiry_date: formData.expiry_date || null,
          minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock) : 0,
          critical_stock: formData.critical_stock ? parseInt(formData.critical_stock) : 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        throw error;
      }

      setSuccess('Equipo creado exitosamente!');
      
      setTimeout(() => {
        router.push('/equipment');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getCategorySubcategories = (category: EquipmentCategory): EquipmentSubcategory[] => {
    const subcategories = {
      'main_equipment': ['attendance_clocks', 'casino_clocks', 'thermal_printers', 'fingerprint_readers'] as EquipmentSubcategory[],
      'parts_consumables': ['power_supplies', 'displays_screens', 'thermal_ribbons', 'sensors_modules', 'batteries_ups', 'electronic_boards'] as EquipmentSubcategory[],
      'tools_accessories': ['installation_tools', 'cables_connectors', 'screws_supports', 'mounting_kits'] as EquipmentSubcategory[]
    };
    return subcategories[category] || [];
  };

  const getSubcategoryDisplay = (subcategory: EquipmentSubcategory) => {
    const displays = {
      'attendance_clocks': 'Relojes de Asistencia',
      'casino_clocks': 'Relojes Casino',
      'thermal_printers': 'Impresoras Térmicas',
      'fingerprint_readers': 'Huelleros',
      'power_supplies': 'Fuentes de Poder',
      'displays_screens': 'Pantallas/Displays',
      'thermal_ribbons': 'Cintas/Rollos Térmicos',
      'thermal_ribbons_rolls': 'Cintas/Rollos Térmicos',
      'sensors_modules': 'Sensores/Módulos',
      'batteries_ups': 'Baterías/UPS Mini',
      'internal_batteries_ups': 'Baterías Internas/UPS Mini',
      'electronic_boards': 'Placas Electrónicas',
      'installation_tools': 'Herramientas de Instalación',
      'cables_connectors': 'Cables/Conectores',
      'screws_supports': 'Tornillos/Soportes',
      'mounting_kits': 'Kits de Montaje'
    };
    return displays[subcategory] || subcategory;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Agregar Nuevo Equipo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Completa la información para agregar un nuevo equipo al inventario
        </p>
      </div>

      <div className="card-modern p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Equipo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Reloj Biométrico ZK-U160"
                required
                maxLength={200}
              />
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada del equipo..."
                maxLength={500}
              />
            </div>

            {/* Precio */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Precio (CLP) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="245000"
                required
                min="0"
                step="0.01"
              />
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="equipment_category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                id="equipment_category"
                name="equipment_category"
                value={formData.equipment_category}
                onChange={(e) => {
                  const newCategory = e.target.value as EquipmentCategory;
                  const availableSubcategories = getCategorySubcategories(newCategory);
                  setFormData(prev => ({
                    ...prev,
                    equipment_category: newCategory,
                    equipment_subcategory: availableSubcategories[0]
                  }));
                }}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="main_equipment">Equipos Principales</option>
                <option value="parts_consumables">Repuestos y Consumibles</option>
                <option value="tools_accessories">Herramientas y Accesorios</option>
              </select>
            </div>

            {/* Subcategoría */}
            <div>
              <label htmlFor="equipment_subcategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subcategoría <span className="text-red-500">*</span>
              </label>
              <select
                id="equipment_subcategory"
                name="equipment_subcategory"
                value={formData.equipment_subcategory}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {getCategorySubcategories(formData.equipment_category).map(subcategory => (
                  <option key={subcategory} value={subcategory}>
                    {getSubcategoryDisplay(subcategory)}
                  </option>
                ))}
              </select>
            </div>

            {/* Serial Number */}
            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Serie
              </label>
              <input
                type="text"
                id="serial_number"
                name="serial_number"
                value={formData.serial_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: ZK123456789"
                maxLength={100}
              />
            </div>

            {/* IMEI */}
            <div>
              <label htmlFor="imei" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                IMEI
              </label>
              <input
                type="text"
                id="imei"
                name="imei"
                value={formData.imei}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: 123456789012345"
                maxLength={15}
              />
            </div>

            {/* Batch Number */}
            <div>
              <label htmlFor="batch_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Número de Lote
              </label>
              <input
                type="text"
                id="batch_number"
                name="batch_number"
                value={formData.batch_number}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: LOTE-2024-001"
                maxLength={50}
              />
            </div>

            {/* Fecha de Vencimiento */}
            <div>
              <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de Vencimiento
              </label>
              <input
                type="date"
                id="expiry_date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock Mínimo */}
            <div>
              <label htmlFor="minimum_stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Mínimo
              </label>
              <input
                type="number"
                id="minimum_stock"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5"
                min="0"
              />
            </div>

            {/* Stock Crítico */}
            <div>
              <label htmlFor="critical_stock" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stock Crítico
              </label>
              <input
                type="number"
                id="critical_stock"
                name="critical_stock"
                value={formData.critical_stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2"
                min="0"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/equipment')}
              className="btn-secondary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !formData.name.trim() || !formData.price}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Crear Equipo
                </>
              )}
            </button>
          </div>

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
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Error al crear equipo
                  </h3>
                  <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                    {error}
                  </div>
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
                  <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                    ¡Éxito!
                  </h3>
                  <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                    {success} Redirigiendo...
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}