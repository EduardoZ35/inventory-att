"use client";

import { useEffect, useState, useCallback } from 'react';
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
  deleted_at: string | null;
}

export default function ProductDetailsPage() {
  "use client";

  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [productInstances, setProductInstances] = useState<ProductInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchProductAndInstances = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
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

      // Fetch product instances for this generic product (not soft-deleted)
      const { data: instancesData, error: instancesError } = await supabase
        .from('product_instances')
        .select('id, serial_number, state_id, deleted_at')
        .eq('product_definition_id', parseInt(id as string))
        .is('deleted_at', null);

      if (instancesError) {
        throw instancesError;
      }
      setProductInstances(instancesData as ProductInstance[]);

    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [id, supabase, setLoading, setError, setProduct, setProductInstances]);

  const handleDeleteInstance = useCallback(async (instanceId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta instancia de producto?')) return;

    try {
      const { error } = await supabase
        .from('product_instances')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', instanceId);

      if (error) {
        throw error;
      }
      // Refrescar la lista de instancias después del borrado suave
      fetchProductAndInstances();
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }, [supabase, fetchProductAndInstances, setError]);

  useEffect(() => {
    fetchProductAndInstances();

    // Fetch user role
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase.rpc('get_user_role');
        if (error) console.error('Error fetching user role:', error);
        else setUserRole(data);
      }
    };
    fetchUserRole();

    // Escuchar cambios de autenticación (opcional, para re-fetch roles)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserRole(); // Re-fetch role if auth state changes
      } else {
        setUserRole(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [id, fetchProductAndInstances]); // id dependency for fetchProductAndInstances

  if (loading) {
    return <p>Cargando detalles del producto genérico y sus instancias...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!product) {
    return <p>Producto genérico no encontrado.</p>;
  }

  const canManage = userRole === 'admin' || userRole === 'manager';

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
          {canManage && (
            <button
              onClick={() => router.push(`/products/edit/${product.id}`)}
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              Editar Producto Genérico
            </button>
          )}
          {canManage && (
            <button
              onClick={() => router.push(`/products/${product.id}/add-detail`)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              Agregar Números de Serie
            </button>
          )}
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
                {canManage && <th className="py-2 px-4 border-b text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {productInstances.map((instance) => (
                <tr key={instance.id} className="hover:bg-gray-100">
                  <td className="py-2 px-4 border-b">{instance.id}</td>
                  <td className="py-2 px-4 border-b">{instance.serial_number}</td>
                  <td className="py-2 px-4 border-b">{instance.state_id}</td>
                  {canManage && (
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteInstance(instance.id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
