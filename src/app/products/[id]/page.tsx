"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (error) {
            throw error;
          }

          setProduct(data as Product);
        } catch (err: any) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return <p>Cargando detalles del producto...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!product) {
    return <p>Producto no encontrado.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalles del Producto</h1>
      <div className="bg-white p-6 rounded shadow-md">
        <p><strong>Nombre:</strong> {product.name}</p>
        <p><strong>Descripción:</strong> {product.description}</p>
        <p><strong>Precio:</strong> {product.price}</p>
        <p><strong>Stock:</strong> {product.stock}</p>
        <p><strong>ID:</strong> {product.id}</p>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => router.push(`/products/edit/${product.id}`)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Editar Producto
          </button>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver a la Lista de Productos
          </button>
        </div>
      </div>
    </div>
  );
}
