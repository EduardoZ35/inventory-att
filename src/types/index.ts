// Tipos globales para el sistema de inventario

export interface User {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    given_name?: string;
    family_name?: string;
  };
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  role: 'admin' | 'manager' | 'viewer' | 'blocked';
  is_blocked: boolean | null;
  blocked_at: string | null;
  blocked_by: string | null;
  blocked_reason: string | null;
  authorized: boolean | null;
  authorized_at: string | null;
  authorized_by: string | null;
  auth_request_pending?: boolean | null;
  auth_request_date?: string | null;
  auth_request_status?: 'approved' | 'rejected' | 'pending' | null;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  product_type_id: number;
  product_model_id: number;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  product_type?: ProductType;
  product_model?: ProductModel;
}

export interface ProductType {
  id: number;
  name: string;
  description?: string;
}

export interface ProductModel {
  id: number;
  name: string;
  description?: string;
}

export interface ProductInstance {
  id: number;
  product_definition_id: number;
  serial_number: string;
  state_id: number;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  product?: Product;
  state?: ProductState;
}

export interface ProductState {
  id: number;
  name: string;
  description?: string;
}

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  capacity?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id: number;
  invoice_number?: string;
  provider_id: number;
  purchase_date: string;
  net_amount: number;
  tax_amount: number;
  total_amount: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  provider?: Provider;
  items?: PurchaseInvoiceItem[];
}

export interface Provider {
  id: number;
  name: string;
  rut: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  product_instance_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  // Relaciones
  product_instance?: ProductInstance;
}

export interface PurchaseInvoiceItem {
  id: number;
  purchase_invoice_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at?: string;
}

// DTOs (Data Transfer Objects)
export interface CreateProductDTO {
  name: string;
  description?: string;
  price: number;
  product_type_id: number;
  product_model_id: number;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

export interface CreateProductInstanceDTO {
  product_definition_id: number;
  serial_number: string;
  state_id: number;
}

export interface CreateClientDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

// Tipos de respuesta API
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
}

// Tipos de filtros
export interface ProductFilters {
  search?: string;
  typeId?: number;
  modelId?: number;
  minPrice?: number;
  maxPrice?: number;
  includeDeleted?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: Profile['role'];
  authorized?: boolean;
  blocked?: boolean;
  pendingRequests?: boolean;
}


