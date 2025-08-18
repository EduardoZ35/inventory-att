"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

export default function AddProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [serialNumbers, setSerialNumbers] = useState('');
  const [status, setStatus] = useState('available'); // Estado por defecto
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!id) {
      setError('ID de producto no proporcionado.');
      setLoading(false);
      return;
    }

    const serials = serialNumbers.split('\n').map(s => s.trim()).filter(s => s !== '');

    if (serials.length === 0) {
      setError('Por favor, introduce al menos un número de serie.');
      setLoading(false);
      return;
    }

    const productDetailsToInsert = serials.map(serial_number => ({
      product_id: parseInt(id as string),
      serial_number,
      status,
    }));

    try {
      const { error } = await supabase
        .from('product_detail')
        .insert(productDetailsToInsert)
        .select();

      if (error) {
        throw error;
      }

      setSuccess(`Se agregaron ${productDetailsToInsert.length} números de serie exitosamente!`);
      setSerialNumbers('');
      setStatus('available');
      router.push(`/products/${id}`); // Redirigir a la página de detalles del producto
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agregar Números de Serie para Producto ID: {id}</h1>
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
          <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">Estado:</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="available">Disponible</option>
            <option value="assigned">Asignado</option>
            <option value="defective">Defectuoso</option>
            <option value="in_repair">En Reparación</option>
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
