// ARCHIVO DESHABILITADO TEMPORALMENTE - NECESITA ACTUALIZACIÓN PARA USAR EQUIPMENT EN LUGAR DE PRODUCT

/*
import { supabase } from '@/lib/supabaseClient';
import type { 
  Equipment, 
  CreateEquipmentDTO, 
  UpdateEquipmentDTO, 
  EquipmentFilters,
  PaginatedResponse 
} from '@/types';

// Todo el servicio está comentado temporalmente
// Necesita ser actualizado para usar Equipment en lugar de Product
// y usar la tabla 'equipment' en lugar de 'products'

*/

// Placeholder temporal para evitar errores de import
export const productService = {
  getProducts: () => Promise.resolve([]),
  getProductsPaginated: () => Promise.resolve({ data: [], totalCount: 0, totalPages: 0, currentPage: 1, hasMore: false }),
  getProductById: () => Promise.resolve(null),
  getProductStats: () => Promise.resolve({}),
  createProduct: () => Promise.resolve({}),
  updateProduct: () => Promise.resolve({}),
  deleteProduct: () => Promise.resolve({}),
  restoreProduct: () => Promise.resolve({}),
  searchByCode: () => Promise.resolve([])
};