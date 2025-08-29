"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsPaginated, useDeleteProduct } from '@/hooks/queries/useProducts';
import { useAuthStore } from '@/stores/authStore';
// import { useUIStore } from '@/stores/uiStore'; // Deshabilitado temporalmente
import type { ProductFilters } from '@/types';

export default function ProductsClient() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  
  const router = useRouter();
  const { canManage } = useAuthStore();
  // const { openModal } = useUIStore(); // Deshabilitado temporalmente
  
  // Query para productos paginados
  const { data, isLoading, isError, error } = useProductsPaginated(page, 20, filters);
  const deleteProductMutation = useDeleteProduct();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchTerm });
    setPage(1); // Reset a primera página
  };
  
  const handleDelete = async (productId: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    deleteProductMutation.mutate(productId);
  };
  
  const handleEdit = (productId: number) => {
    router.push(`/products/edit/${productId}`);
  };
  
  const handleAddNew = () => {
    router.push('/products/add');
  };

  if (isError) {
    return (
      <div className="main-container page-bg">
        <div className="card-theme p-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h3 className="text-red-800 dark:text-red-200 font-semibold">Error al cargar productos</h3>
            <p className="text-red-600 dark:text-red-300 mt-1">{error?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container page-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">
            Gestión de Productos
          </h1>
          <p className="page-subtitle">
            Administra el catálogo de productos del inventario
          </p>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="card-theme p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar productos por nombre o descripción..."
                  className="input-theme w-full pl-10 pr-4"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>
            
            {canManage() && (
              <button
                onClick={handleAddNew}
                className="btn-theme-primary flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Agregar Producto
              </button>
            )}
          </div>
        </div>

        {/* Estadísticas rápidas */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stats-label">Total Productos</p>
                  <p className="stats-number">{data.totalCount}</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stats-label">Página Actual</p>
                  <p className="stats-number">{page}</p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stats-label">Por Página</p>
                  <p className="stats-number">20</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="stats-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stats-label">Total Páginas</p>
                  <p className="stats-number">{Math.ceil(data.totalCount / 20)}</p>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de productos */}
        <div className="card-theme overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Cargando productos...</p>
            </div>
          ) : data && data.data.length > 0 ? (
            <>
              <div className="table-theme">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {data.data.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </div>
                            {product.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {product.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge-theme badge-info">
                            {product.product_type?.name || 'Sin tipo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="badge-theme badge-warning">
                            {product.product_model?.name || 'Sin modelo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            ${product.price.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/products/${product.id}`)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 transition-colors duration-200"
                              title="Ver detalles"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            
                            {canManage() && (
                              <>
                                <button
                                  onClick={() => handleEdit(product.id)}
                                  className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-200"
                                  title="Editar"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                <button
                                  onClick={() => handleDelete(product.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-200"
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación */}
              {data.totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando {((page - 1) * 20) + 1} a {Math.min(page * 20, data.totalCount)} de {data.totalCount} productos
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      <span className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">
                        Página {page} de {data.totalPages}
                      </span>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === data.totalPages}
                        className="btn-theme-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay productos</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda.' : 'Aún no se han agregado productos al inventario.'}
              </p>
              {canManage() && (
                <button
                  onClick={handleAddNew}
                  className="btn-theme-primary"
                >
                  Agregar Primer Producto
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
