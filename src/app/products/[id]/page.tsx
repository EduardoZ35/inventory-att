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

interface ProductInstance {
  id: number;
  product_definition_id: number;
  serial_number: string;
  state_id: number;
  -- otros campos como warranty_start_date, currency_id, etc. irían aquí
}

export default function ProductDetailsPage() {
  "use client";

  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [productInstances, setProductInstances] = useState<ProductInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchProductAndInstances = async () => {
        try {
          // Fetch generic product details
          const { data: productData, error: productError } = await supabase
            .from('products')
            .select('id, name, description, price, product_type_id, product_model_id')
            .eq('id', parseInt(id as string))
            .single();

          if (productError) {
            throw productError;
          }
          setProduct(productData as Product);

          // Fetch product instances for this generic product
          const { data: instancesData, error: instancesError } = await supabase
            .from('product_instances') // Nombre de la nueva tabla
            .select('id, serial_number, state_id') // Ajusta los campos según necesites
            .eq('product_definition_id', parseInt(id as string));

          if (instancesError) {
            throw instancesError;
          }
          setProductInstances(instancesData as ProductInstance[]);

        } catch (err: unknown) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      };
      fetchProductAndInstances();
    }
  }, [id]);

  if (loading) {
    return <p>Cargando detalles del producto genérico y sus instancias...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!product) {
    return <p>Producto genérico no encontrado.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalles del Producto Genérico: {product.name}</h1>
      <div className="bg-white p-6 rounded shadow-md mb-8">
        <p><strong>Nombre:</strong> {product.name}</p>
        <p><strong>Descripción:</strong> {product.description}</p>
        <p><strong>Precio:</strong> {product.price}</p>
        <p><strong>Tipo de Producto ID:</strong> {product.product_type_id}</p>
        <p><strong>Modelo de Producto ID:</strong> {product.product_model_id}</p>
        <p><strong>ID Genérico:</strong> {product.id}</p>
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => router.push(`/products/edit/${product.id}`)}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Editar Producto Genérico
          </button>
          <button
            onClick={() => router.push(`/products/${product.id}/add-detail`)}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Agregar Números de Serie
          </button>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver a la Lista de Productos Genéricos
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Instancias de Producto</h2>
      {productInstances.length === 0 ? (
        <p>No hay instancias para este producto genérico.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">ID Instancia</th>
                <th className="py-2 px-4 border-b text-left">Número de Serie</th>
                <th className="py-2 px-4 border-b text-left">Estado</th>
              </tr>
            </thead>
            <tbody>
              {productInstances.map((instance) => (
                <tr key={instance.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{instance.id}</td>
                  <td className="py-2 px-4 border-b">{instance.serial_number}</td>
                  <td className="py-2 px-4 border-b">{instance.state_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
