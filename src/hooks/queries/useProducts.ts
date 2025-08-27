import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/productService';
// import { useUIStore } from '@/stores/uiStore'; // Deshabilitado temporalmente
import type { Product, CreateProductDTO, UpdateProductDTO, ProductFilters } from '@/types';

// Keys para React Query
const PRODUCTS_KEY = 'products';
const PRODUCT_KEY = 'product';
const PRODUCT_STATS_KEY = 'product-stats';

/**
 * Hook para obtener lista de productos
 */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, filters],
    queryFn: () => productService.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para obtener productos paginados
 */
export function useProductsPaginated(page: number = 1, limit: number = 20, filters?: ProductFilters) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'paginated', page, limit, filters],
    queryFn: () => productService.getProductsPaginated(page, limit, filters),
    placeholderData: (previousData: any) => previousData, // Mantener datos anteriores mientras se cargan nuevos
  });
}

/**
 * Hook para obtener un producto por ID
 */
export function useProduct(id: number | null) {
  return useQuery({
    queryKey: [PRODUCT_KEY, id],
    queryFn: () => productService.getProductById(id!),
    enabled: !!id, // Solo ejecutar si hay ID
  });
}

/**
 * Hook para obtener estadísticas de productos
 */
export function useProductStats() {
  return useQuery({
    queryKey: [PRODUCT_STATS_KEY],
    queryFn: () => productService.getProductStats(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });
}

/**
 * Hook para crear un producto
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();
  // const { addNotification } = useUIStore(); // Deshabilitado temporalmente
  
  return useMutation({
    mutationFn: (product: CreateProductDTO) => productService.createProduct(product),
    onSuccess: (newProduct) => {
      // Invalidar cache de productos
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_STATS_KEY] });
      
      // Agregar el nuevo producto al cache si es posible
      queryClient.setQueryData([PRODUCT_KEY, newProduct.id], newProduct);
      
      console.log('✅ Producto creado:', newProduct.name);
    },
    onError: (error: Error) => {
      console.error('❌ Error al crear producto:', error.message);
    },
  });
}

/**
 * Hook para actualizar un producto
 */
export function useUpdateProduct() {
  const queryClient = useQueryClient();
  // const { addNotification } = useUIStore(); // Deshabilitado temporalmente
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: UpdateProductDTO }) => 
      productService.updateProduct(id, updates),
    onSuccess: (updatedProduct) => {
      // Actualizar cache del producto específico
      queryClient.setQueryData([PRODUCT_KEY, updatedProduct.id], updatedProduct);
      
      // Invalidar lista de productos
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      
      console.log('✅ Producto actualizado:', updatedProduct.name);
    },
    onError: (error: Error) => {
      console.error('❌ Error al actualizar producto:', error.message);
    },
  });
}

/**
 * Hook para eliminar un producto
 */
export function useDeleteProduct() {
  const queryClient = useQueryClient();
  // const { addNotification } = useUIStore(); // Deshabilitado temporalmente
  
  return useMutation({
    mutationFn: (id: number) => productService.deleteProduct(id),
    onSuccess: (_, id) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_KEY, id] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_STATS_KEY] });
      
      console.log('✅ Producto eliminado correctamente');
    },
    onError: (error: Error) => {
      console.error('❌ Error al eliminar producto:', error.message);
    },
  });
}

/**
 * Hook para restaurar un producto eliminado
 */
export function useRestoreProduct() {
  const queryClient = useQueryClient();
  // const { addNotification } = useUIStore(); // Deshabilitado temporalmente
  
  return useMutation({
    mutationFn: (id: number) => productService.restoreProduct(id),
    onSuccess: (restoredProduct) => {
      // Actualizar caches
      queryClient.setQueryData([PRODUCT_KEY, restoredProduct.id], restoredProduct);
      queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [PRODUCT_STATS_KEY] });
      
      console.log('✅ Producto restaurado:', restoredProduct.name);
    },
    onError: (error: Error) => {
      console.error('❌ Error al restaurar producto:', error.message);
    },
  });
}

/**
 * Hook para buscar productos por código
 */
export function useSearchProductByCode(code: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'search', code],
    queryFn: () => productService.searchByCode(code),
    enabled: code.length > 0,
  });
}
