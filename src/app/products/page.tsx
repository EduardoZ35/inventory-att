"use client";

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  product_type_id: number;
  product_model_id: number;
  deleted_at: string | null;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('products').select('id, name, description, price, product_type_id, product_model_id, deleted_at').is('deleted_at', null);

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setProducts(data as Product[]);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, supabase, setProducts, setLoading, setError]);

  const handleDeleteProduct = useCallback(async (productId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este producto genérico? Esto no eliminará las instancias físicas.')) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', productId);

      if (error) {
        throw error;
      }
      fetchProducts(); // Refrescar la lista después del borrado suave
    } catch (err: unknown) {
      setError((err as Error).message);
    }
  }, [supabase, fetchProducts, setError]);

  useEffect(() => {
    fetchProducts();

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

    // Escuchar cambios de autenticación (opcional)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserRole();
      } else {
        setUserRole(null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [searchTerm, fetchProducts]);

  if (loading) {
    return <p>Cargando productos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const canManage = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Lista de Productos Genéricos</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar productos genéricos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      {canManage && (
        <button
          onClick={() => router.push('/products/add')}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
        >
          Agregar Nuevo Producto Genérico
        </button>
      )}

      {products.length === 0 ? (
        <p>No hay productos genéricos disponibles.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Nombre</th>
                <th className="py-2 px-4 border-b text-left">Descripción</th>
                <th className="py-2 px-4 border-b text-left">Precio</th>
                <th className="py-2 px-4 border-b text-left">Tipo</th>
                <th className="py-2 px-4 border-b text-left">Modelo</th>
                {canManage && <th className="py-2 px-4 border-b text-left">Acciones</th>}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-100 cursor-pointer">
                  <td onClick={() => router.push(`/products/${product.id}`)} className="py-2 px-4 border-b">{product.name}</td>
                  <td onClick={() => router.push(`/products/${product.id}`)} className="py-2 px-4 border-b">{product.description}</td>
                  <td onClick={() => router.push(`/products/${product.id}`)} className="py-2 px-4 border-b">{product.price}</td>
                  <td onClick={() => router.push(`/products/${product.id}`)} className="py-2 px-4 border-b">{product.product_type_id}</td>
                  <td onClick={() => router.push(`/products/${product.id}`)} className="py-2 px-4 border-b">{product.product_model_id}</td>
                  {canManage && (
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
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
