"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

interface ProductState {
  id: number;
  name: string;
}

export default function AddProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [serialNumbers, setSerialNumbers] = useState('');
  const [stateId, setStateId] = useState<number | ''>(''); // Ahora es stateId, no status
  const [productStates, setProductStates] = useState<ProductState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductStates = async () => {
      const { data, error } = await supabase.from('product_states').select('id, name');
      if (error) {
        console.error('Error fetching product states:', error);
      } else {
        setProductStates(data);
      }
    };

    fetchProductStates();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!id) {
      setError('ID de producto genérico no proporcionado.');
      setLoading(false);
      return;
    }

    const serials = serialNumbers.split('\n').map(s => s.trim()).filter(s => s !== '');

    if (serials.length === 0) {
      setError('Por favor, introduce al menos un número de serie.');
      setLoading(false);
      return;
    }

    if (stateId === '') {
      setError('Por favor, selecciona un estado.');
      setLoading(false);
      return;
    }

    const productInstancesToInsert = serials.map(serial_number => ({
      product_definition_id: parseInt(id as string),
      serial_number,
      state_id: stateId,
    }));

    try {
      const { error } = await supabase
        .from('product_instances') // Cambiado a product_instances
        .insert(productInstancesToInsert)
        .select();

      if (error) {
        throw error;
      }

      setSuccess(`Se agregaron ${productInstancesToInsert.length} números de serie exitosamente!`);
      setSerialNumbers('');
      setStateId(''); // Reiniciar el estado
      router.push(`/products/${id}`); // Redirigir a la página de detalles del producto genérico
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agregar Instancias para Producto Genérico ID: {id}</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label htmlFor="serialNumbers" className="block text-gray-700 text-sm font-bold mb-2">Números de Serie (uno por línea):</label>
          <textarea
            id="serialNumbers"
            value={serialNumbers}
            onChange={(e) => setSerialNumbers(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={10}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">Estado:</label>
          <select
            id="state"
            value={stateId}
            onChange={(e) => setStateId(parseInt(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Selecciona un estado</option>
            {productStates.map((state) => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={loading}
          >
            {loading ? 'Agregando...' : 'Agregar Números de Serie'}
          </button>
          <button
            type="button"
            onClick={() => router.push(`/products/${id}`)}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Cancelar
          </button>
        </div>
        {error && <p className="text-red-500 text-xs italic mt-4">Error: {error}</p>}
        {success && <p className="text-green-500 text-xs italic mt-4">{success}</p>}
      </form>
    </div>
  );
}
