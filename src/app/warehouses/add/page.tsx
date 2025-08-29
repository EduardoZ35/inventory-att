"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import RegionCommuneSelector from '@/components/common/RegionCommuneSelector';

export default function AddWarehousePage() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [regionId, setRegionId] = useState('');
  const [regionName, setRegionName] = useState('');
  const [communeId, setCommuneId] = useState('');
  const [communeName, setCommuneName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Construir ubicación completa
      const fullLocation = `${address.trim()}${communeName ? `, ${communeName}` : ''}${regionName ? `, ${regionName}` : ''}`;
      
      const { error } = await supabase
        .from('warehouses')
        .insert([{ 
          name: name.trim(), 
          location: fullLocation,
          address: address.trim(),
          region_id: regionId || null,
          region_name: regionName || null,
          commune_id: communeId || null,
          commune_name: communeName || null,
          description: description.trim() || null,
          capacity: capacity === '' ? null : Number(capacity)
        }])
        .select();

      if (error) {
        throw error;
      }

      setSuccess('Bodega agregada exitosamente!');
      setName('');
      setAddress('');
      setRegionId('');
      setRegionName('');
      setCommuneId('');
      setCommuneName('');
      setDescription('');
      setCapacity('');
      
      // Redirigir después de un momento
      setTimeout(() => {
        router.push('/warehouses');
      }, 1500);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container page-bg">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Agregar Bodega
        </h1>
        <p className="page-subtitle">
          Registra una nueva bodega en el sistema de inventario
        </p>
      </div>

      {/* Formulario */}
      <div className="card-theme p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nombre de la Bodega <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-theme w-full"
              placeholder="Ej: Bodega Central, Almacén Norte..."
              required
              maxLength={100}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nombre identificativo de la bodega
            </p>
          </div>

          {/* Dirección */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-2">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-theme w-full"
              placeholder="Ej: Pedro de Valdivia 6055"
              required
              maxLength={200}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Dirección exacta de la bodega (calle y número)
            </p>
          </div>

          {/* Selector de Región y Comuna */}
          <RegionCommuneSelector
            selectedRegionId={regionId}
            selectedCommuneId={communeId}
            onRegionChange={(id, name) => {
              setRegionId(id);
              setRegionName(name);
            }}
            onCommuneChange={(id, name) => {
              setCommuneId(id);
              setCommuneName(name);
            }}
            required={true}
          />

          {/* Descripción/Detalles */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Descripción o Detalles
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input-theme w-full"
              placeholder="Ej: Número de bodega: 2096, Características especiales, etc."
              maxLength={500}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Información adicional sobre la bodega (número de bodega, características, etc.)
            </p>
          </div>

          {/* Capacidad */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium mb-2">
              Capacidad (opcional)
            </label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="input-theme w-full"
              placeholder="Ej: 1000"
              min="1"
              max="999999999"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Capacidad máxima de almacenamiento en unidades (opcional)
            </p>
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/warehouses')}
              className="btn-theme-secondary"
            >
              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-theme-primary"
              disabled={loading || !name.trim() || !address.trim() || !communeId || !regionId}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Guardar Bodega
                </>
              )}
            </button>
          </div>

          {/* Mensajes */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al agregar bodega
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    ¡Éxito!
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
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
