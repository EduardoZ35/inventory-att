import { supabase } from '@/lib/supabaseClient';
import type { 
  Product, 
  CreateProductDTO, 
  UpdateProductDTO, 
  ProductFilters,
  PaginatedResponse 
} from '@/types';

export const productService = {
  /**
   * Obtener todos los productos con filtros opcionales
   */
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_type:product_types(id, name),
        product_model:product_models(id, name)
      `)
      .order('created_at', { ascending: false });

    // Aplicar filtros
    if (!filters?.includeDeleted) {
      query = query.is('deleted_at', null);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.typeId) {
      query = query.eq('product_type_id', filters.typeId);
    }

    if (filters?.modelId) {
      query = query.eq('product_model_id', filters.modelId);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;
    
    if (error) throw new Error(`Error al obtener productos: ${error.message}`);
    return data || [];
  },

  /**
   * Obtener productos paginados
   */
  async getProductsPaginated(
    page: number = 1,
    limit: number = 20,
    filters?: ProductFilters
  ): Promise<PaginatedResponse<Product>> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('products')
      .select(`
        *,
        product_type:product_types(id, name),
        product_model:product_models(id, name)
      `, { count: 'exact' });

    // Aplicar los mismos filtros
    if (!filters?.includeDeleted) {
      query = query.is('deleted_at', null);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    // ... aplicar resto de filtros ...

    query = query
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(`Error al obtener productos: ${error.message}`);

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return {
      data: data || [],
      totalCount,
      totalPages,
      currentPage: page,
      hasMore: page < totalPages,
    };
  },

  /**
   * Obtener un producto por ID
   */
  async getProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_type:product_types(id, name),
        product_model:product_models(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // No encontrado
      throw new Error(`Error al obtener producto: ${error.message}`);
    }

    return data;
  },

  /**
   * Crear un nuevo producto
   */
  async createProduct(product: CreateProductDTO): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(`Error al crear producto: ${error.message}`);
    return data;
  },

  /**
   * Actualizar un producto
   */
  async updateProduct(id: number, updates: UpdateProductDTO): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar producto: ${error.message}`);
    return data;
  },

  /**
   * Eliminar un producto (soft delete)
   */
  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw new Error(`Error al eliminar producto: ${error.message}`);
  },

  /**
   * Restaurar un producto eliminado
   */
  async restoreProduct(id: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({
        deleted_at: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Error al restaurar producto: ${error.message}`);
    return data;
  },

  /**
   * Obtener estadísticas de productos
   */
  async getProductStats(): Promise<{
    total: number;
    active: number;
    deleted: number;
    avgPrice: number;
    byType: Record<string, number>;
  }> {
    // Total de productos
    const { count: total } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    // Productos activos
    const { count: active } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Productos eliminados
    const { count: deleted } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .not('deleted_at', 'is', null);

    // Precio promedio
    const { data: avgData } = await supabase
      .from('products')
      .select('price')
      .is('deleted_at', null);

    const avgPrice = avgData?.length 
      ? avgData.reduce((sum, p) => sum + p.price, 0) / avgData.length 
      : 0;

    // Por tipo (simplificado, idealmente usar una función SQL)
    const { data: typeData } = await supabase
      .from('products')
      .select('product_type_id')
      .is('deleted_at', null);

    const byType: Record<string, number> = {};
    typeData?.forEach(p => {
      const typeId = p.product_type_id.toString();
      byType[typeId] = (byType[typeId] || 0) + 1;
    });

    return {
      total: total || 0,
      active: active || 0,
      deleted: deleted || 0,
      avgPrice: Math.round(avgPrice * 100) / 100,
      byType,
    };
  },

  /**
   * Buscar productos por código de barras o serial
   */
  async searchByCode(code: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`barcode.eq.${code},sku.eq.${code}`)
      .is('deleted_at', null);

    if (error) throw new Error(`Error al buscar por código: ${error.message}`);
    return data || [];
  },
};
