"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import type { Warehouse } from '@/types';

export default function EditWarehousePage() {
  const { id } = useParams();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchWarehouse = async () => {
      if (!id) return;
      
      try {
        setFetchLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('warehouses')
          .select('id, name, location, warehouse_type, capacity, responsible_person, created_at, updated_at')
          .eq('id', id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (data) {
          setWarehouse(data);
          setName(data.name);
          setLocation(data.location);
          setCapacity(data.capacity || '');
        }
      } catch (err) {
        console.error('Error fetching warehouse:', err);
        setError(err instanceof Error ? err.message : 'Error al cargar la bodega');
      } finally {
        setFetchLoading(false);
      }
    };

    fetchWarehouse();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('warehouses')
        .update({ 
          name: name.trim(), 
          location: location.trim(),
          capacity: capacity === '' ? null : Number(capacity)
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      setSuccess('Bodega actualizada exitosamente!');
      
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

  if (fetchLoading) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando bodega...</p>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h3 className="text-red-800 dark:text-red-200 font-semibold">Bodega no encontrada</h3>
          <p className="text-red-600 dark:text-red-300 mt-1">
            La bodega que buscas no existe o ha sido eliminada.
          </p>
          <button 
            onClick={() => router.push('/warehouses')}
            className="mt-2 btn-secondary"
          >
            Volver a la lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Editar Bodega
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Modifica la información de la bodega: <span className="font-semibold">{warehouse.name}</span>
        </p>
      </div>

      {/* Formulario */}
      <div className="card-modern p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ID de la Bodega
            </label>
            <input
              type="text"
              value={warehouse.id}
              className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
              disabled
            />
          </div>

          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre de la Bodega <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ej: Bodega Central, Almacén Norte..."
              required
              maxLength={100}
            />
          </div>

          {/* Ubicación */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubicación <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ej: Santiago Centro, Av. Principal 123..."
              required
              maxLength={200}
            />
          </div>

          {/* Capacidad */}
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Capacidad (opcional)
            </label>
            <input
              type="number"
              id="capacity"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              placeholder="Ej: 1000"
              min="1"
              max="999999999"
            />
          </div>

          {/* Fecha de creación (solo lectura) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha de Creación
            </label>
            <input
              type="text"
              value={warehouse.created_at ? new Date(warehouse.created_at).toLocaleDateString('es-CL') : 'No disponible'}
              className="w-full px-4 py-2 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg cursor-not-allowed"
              disabled
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => router.push('/warehouses')}
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
              disabled={loading || !name.trim() || !location.trim()}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Actualizando...
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Actualizar Bodega
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
                    Error al actualizar bodega
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




