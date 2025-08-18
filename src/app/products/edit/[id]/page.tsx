"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  product_type_id: number;
  product_model_id: number;
}

interface ProductType {
  id: number;
  name: string;
}

interface ProductModel {
  id: number;
  name: string;
}

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [productTypeId, setProductTypeId] = useState<number | ''>('');
  const [productModelId, setProductModelId] = useState<number | ''>('');
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [productModels, setProductModels] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProductData = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('id, name, description, price, product_type_id, product_model_id')
            .eq('id', parseInt(id as string))
            .single();

          if (error) {
            throw error;
          }

          setProduct(data as Product);
          setName(data.name);
          setDescription(data.description);
          setPrice(data.price);
          setProductTypeId(data.product_type_id);
          setProductModelId(data.product_model_id);
        } catch (err: unknown) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };

      const fetchProductTypesAndModels = async () => {
        const { data: typesData, error: typesError } = await supabase.from('product_types').select('id, name');
        if (typesError) console.error('Error fetching product types:', typesError);
        else setProductTypes(typesData);

        const { data: modelsData, error: modelsError } = await supabase.from('product_models').select('id, name');
        if (modelsError) console.error('Error fetching product models:', modelsError);
        else setProductModels(modelsData);
      };

      fetchProductData();
      fetchProductTypesAndModels();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from('products')
        .update({ name, description, price, product_type_id: productTypeId, product_model_id: productModelId })
        .eq('id', parseInt(id as string));

      if (error) {
        throw error;
      }

      setSuccess('Producto genérico actualizado exitosamente!');
      router.push(`/products/${id}`); // Redirigir a la página de detalles del producto genérico
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p>Cargando datos del producto genérico para editar...</p>;
  }

  if (error && !product) {
    return <p>Error al cargar el producto genérico: {error}</p>;
  }

  if (!product) {
    return <p>Producto genérico no encontrado para editar.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Producto Genérico: {product.name}</h1>
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
            disabled={submitting}
          >
            {submitting ? 'Actualizando...' : 'Actualizar Producto'}
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
