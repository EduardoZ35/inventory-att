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
    <div className="main-container page-bg">
      <div className="page-header">
        <h1 className="page-title">
          Agregar Nuevo Producto
        </h1>
        <p className="page-subtitle">
          Completa la información del nuevo producto
        </p>
      </div>

      <div className="card-theme p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">Nombre:</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-theme w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">Descripción:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-theme w-full"
              rows={4}
              required
            ></textarea>
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2">Precio:</label>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              className="input-theme w-full"
              required
            />
          </div>
          
          <div>
            <label htmlFor="productType" className="block text-sm font-medium mb-2">Tipo de Producto:</label>
            <select
              id="productType"
              value={productTypeId}
              onChange={(e) => setProductTypeId(parseInt(e.target.value))}
              className="input-theme w-full"
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
          
          <div>
            <label htmlFor="productModel" className="block text-sm font-medium mb-2">Modelo de Producto:</label>
            <select
              id="productModel"
              value={productModelId}
              onChange={(e) => setProductModelId(parseInt(e.target.value))}
              className="input-theme w-full"
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
          
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="btn-theme-primary"
              disabled={loading}
            >
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="btn-theme-secondary"
            >
              Cancelar
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}
          
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
