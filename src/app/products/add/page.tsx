"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface ProductType {
  id: number;
  name: string;
}

interface ProductModel {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [productTypeId, setProductTypeId] = useState<number | ''>('');
  const [productModelId, setProductModelId] = useState<number | ''>('');
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productModels, setProductModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProductTypes = async () => {
      const { data, error } = await supabase.from('product_types').select('id, name');
      if (error) {
        console.error('Error fetching product types:', error);
      } else {
        console.log('Product types fetched:', data); // Añadido para depuración
        setProductTypes(data);
      }
    };

    const fetchProductModels = async () => {
      const { data, error } = await supabase.from('product_models').select('id, name');
      if (error) {
        console.error('Error fetching product models:', error);
      } else {
        console.log('Product models fetched:', data); // Añadido para depuración
        setProductModels(data);
      }
    };

    fetchProductTypes();
    fetchProductModels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('products')
        .insert([{ name, description, price, product_type_id: productTypeId, product_model_id: productModelId }])
        .select();

      if (error) {
        throw error;
      }

      setSuccess('Producto genérico agregado exitosamente!');
      setName('');
      setDescription('');
      setPrice(0);
      setProductTypeId('');
      setProductModelId('');
      router.push('/products'); // Redirigir a la lista de productos genéricos
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agregar Nuevo Producto Genérico</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">Descripción:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows={4}
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block text-gray-700 text-sm font-bold mb-2">Precio:</label>
          <input
            type="number"
            id="price"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="productType" className="block text-gray-700 text-sm font-bold mb-2">Tipo de Producto:</label>
          <select
            id="productType"
            value={productTypeId}
            onChange={(e) => setProductTypeId(parseInt(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Selecciona un tipo</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label htmlFor="productModel" className="block text-gray-700 text-sm font-bold mb-2">Modelo de Producto:</label>
          <select
            id="productModel"
            value={productModelId}
            onChange={(e) => setProductModelId(parseInt(e.target.value))}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          >
            <option value="">Selecciona un modelo</option>
            {productModels.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name}
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
            {loading ? 'Agregando...' : 'Agregar Producto'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/products')}
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
