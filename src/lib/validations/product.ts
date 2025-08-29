import { z } from 'zod';

// Schema para crear producto
export const createProductSchema = z.object({
  name: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),
  
  description: z.string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .trim()
    .optional()
    .nullable(),
  
  price: z.number()
    .positive('El precio debe ser mayor a 0')
    .max(999999999, 'El precio es demasiado alto')
    .multipleOf(0.01, 'El precio puede tener máximo 2 decimales'),
  
  product_type_id: z.number()
    .positive('Debe seleccionar un tipo de producto')
    .int('El ID del tipo debe ser un número entero'),
  
  product_model_id: z.number()
    .positive('Debe seleccionar un modelo de producto')
    .int('El ID del modelo debe ser un número entero'),
});

// Schema para actualizar producto (todos los campos opcionales)
export const updateProductSchema = createProductSchema.partial();

// Schema para filtros de búsqueda
export const productFiltersSchema = z.object({
  search: z.string().trim().optional(),
  typeId: z.number().positive().int().optional(),
  modelId: z.number().positive().int().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  includeDeleted: z.boolean().optional(),
}).refine(
  (data) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
      return data.minPrice <= data.maxPrice;
    }
    return true;
  },
  {
    message: 'El precio mínimo debe ser menor o igual al precio máximo',
    path: ['minPrice'],
  }
);

// Schema para crear instancia de producto
export const createProductInstanceSchema = z.object({
  product_definition_id: z.number()
    .positive('Debe seleccionar un producto')
    .int(),
  
  serial_number: z.string()
    .min(4, 'El número de serie debe tener al menos 4 caracteres')
    .max(50, 'El número de serie no puede exceder 50 caracteres')
    .regex(/^[A-Z0-9]+$/i, 'El número de serie solo puede contener letras y números')
    .trim()
    .toUpperCase(),
  
  state_id: z.number()
    .positive('Debe seleccionar un estado')
    .int(),
});

// Schema para importación masiva
export const importProductSchema = z.object({
  products: z.array(
    createProductSchema.extend({
      sku: z.string().optional(),
      barcode: z.string().optional(),
    })
  ).min(1, 'Debe incluir al menos un producto'),
});

// Tipos inferidos
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductFiltersInput = z.infer<typeof productFiltersSchema>;
export type CreateProductInstanceInput = z.infer<typeof createProductInstanceSchema>;
export type ImportProductInput = z.infer<typeof importProductSchema>;

// Funciones de validación helper
export function validateCreateProduct(data: unknown) {
  return createProductSchema.safeParse(data);
}

export function validateUpdateProduct(data: unknown) {
  return updateProductSchema.safeParse(data);
}

export function validateProductFilters(data: unknown) {
  return productFiltersSchema.safeParse(data);
}






