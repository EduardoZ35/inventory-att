// Tipos globales para el sistema de inventario especializado en Control & Soporte Tecnológico

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
  role: 'admin' | 'tech_support' | 'warehouse_staff' | 'sales' | 'blocked';
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

export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  price: number;
  equipment_category: EquipmentCategory;
  equipment_subcategory: EquipmentSubcategory;
  serial_number?: string;
  imei?: string;
  batch_number?: string;
  expiry_date?: string;
  minimum_stock?: number;
  critical_stock?: number;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
}

export type EquipmentCategory = 
  | 'main_equipment'      // Equipos principales
  | 'parts_consumables'   // Repuestos y consumibles
  | 'tools_accessories'   // Herramientas y accesorios

export type EquipmentSubcategory = 
  // Equipos principales
  | 'attendance_clocks'
  | 'casino_clocks'
  | 'thermal_printers'
  | 'fingerprint_readers'
  // Repuestos y consumibles
  | 'power_supplies'
  | 'displays_screens'
  | 'thermal_ribbons_rolls'
  | 'sensors_modules'
  | 'internal_batteries_ups'
  | 'electronic_boards'
  // Herramientas y accesorios
  | 'installation_tools'
  | 'cables_connectors'
  | 'screws_supports'
  | 'mounting_kits'

export interface EquipmentInstance {
  id: number;
  equipment_id: number;
  serial_number: string;
  imei?: string;
  location_id: number;
  status: EquipmentStatus;
  condition: EquipmentCondition;
  installation_date?: string;
  warranty_expiry?: string;
  last_maintenance?: string;
  assigned_to_client?: number;
  deleted_at: string | null;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  equipment?: Equipment;
  location?: Warehouse;
  client?: Client;
}

export type EquipmentStatus = 
  | 'available'       // Disponible en bodega
  | 'in_transit'      // En tránsito
  | 'installed'       // Instalado en cliente
  | 'in_repair'       // En taller técnico
  | 'warranty'        // En garantía
  | 'damaged'         // Dañado
  | 'obsolete'        // Obsoleto

export type EquipmentCondition = 
  | 'new'             // Nuevo
  | 'good'            // Buen estado
  | 'fair'            // Estado regular
  | 'poor'            // Mal estado
  | 'broken'          // Averiado

export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  client_type?: string;
  contact_person?: string;
  service_level?: string;
  organization?: string;
  dni?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  country?: string;
  region_id?: string;
  region_name?: string;
  provincia_id?: string;
  provincia_name?: string;
  commune_id?: string;
  commune_name?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export type ClientType = 
  | 'attendance_company'    // Empresas con relojes de asistencia
  | 'casino_corporate'      // Casinos corporativos
  | 'internal_area'         // Áreas internas (RRHH, operaciones)

export type ServiceLevel = 
  | 'basic'
  | 'standard'
  | 'premium'
  | 'enterprise'

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  warehouse_type: WarehouseType;
  capacity?: number;
  responsible_person?: string;
  created_at?: string;
  updated_at?: string;
}

export type WarehouseType = 
  | 'main'           // Bodega principal
  | 'transit'        // En tránsito (para envíos a sucursales/clientes)
  | 'repair_shop'    // Taller técnico (para reparaciones)

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

// Nueva interfaz para órdenes de servicio técnico
export interface ServiceOrder {
  id: number;
  order_number: string;
  client_id: number;
  technician_id: string;
  service_type: ServiceType;
  priority: ServicePriority;
  status: ServiceStatus;
  description: string;
  equipment_serial?: string;
  scheduled_date?: string;
  completion_date?: string;
  parts_used?: ServiceOrderPart[];
  labor_hours?: number;
  total_cost?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  client?: Client;
  technician?: Profile;
}

export type ServiceType = 
  | 'installation'     // Instalación
  | 'maintenance'      // Mantención
  | 'repair'           // Reparación
  | 'replacement'      // Reemplazo
  | 'warranty'         // Garantía

export type ServicePriority = 
  | 'low'
  | 'normal'
  | 'high'
  | 'urgent'

export type ServiceStatus = 
  | 'pending'          // Pendiente
  | 'scheduled'        // Programado
  | 'in_progress'      // En progreso
  | 'completed'        // Completado
  | 'cancelled'        // Cancelado

export interface ServiceOrderPart {
  id: number;
  service_order_id: number;
  equipment_instance_id: number;
  quantity_used: number;
  // Relaciones
  equipment_instance?: EquipmentInstance;
}

export interface Provider {
  id: number;
  name: string;
  rut: string;
  address?: string;
  phone?: string;
  email?: string;
  provider_type: ProviderType;
  contact_person?: string;
  credit_terms?: string;
  delivery_time?: number; // días
  created_at?: string;
  updated_at?: string;
}

export type ProviderType = 
  | 'equipment_distributor'    // Distribuidores de equipos
  | 'parts_manufacturer'       // Fabricantes de repuestos
  | 'supplies_provider'        // Proveedores de insumos

export interface InvoiceItem {
  id: number;
  invoice_id: number;
  equipment_instance_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  // Relaciones
  equipment_instance?: EquipmentInstance;
}

// Nuevas interfaces para gestión de stock
export interface StockMovement {
  id: number;
  equipment_instance_id: number;
  movement_type: MovementType;
  quantity: number;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  client_id?: number;
  service_order_id?: number;
  reason: string;
  performed_by: string;
  created_at: string;
  // Relaciones
  equipment_instance?: EquipmentInstance;
  from_warehouse?: Warehouse;
  to_warehouse?: Warehouse;
  client?: Client;
  service_order?: ServiceOrder;
  user?: Profile;
}

export type MovementType = 
  // Entradas
  | 'purchase'           // Compras a proveedor
  | 'warranty_return'    // Devolución de equipos en garantía
  | 'inventory_adjustment' // Ajustes de inventario
  // Salidas
  | 'client_installation' // Instalaciones a clientes
  | 'internal_loan'      // Préstamos/entregas internas
  | 'warranty_replacement' // Reemplazo por garantía
  | 'obsolescence'       // Bajas por obsolescencia o daño
  // Transferencias
  | 'warehouse_transfer' // Entre bodegas

// Interface para reportes técnicos
export interface TechnicalReport {
  id: number;
  report_type: TechnicalReportType;
  period_start: string;
  period_end: string;
  generated_by: string;
  data: any; // JSON con datos del reporte
  created_at: string;
  // Relaciones
  user?: Profile;
}

export type TechnicalReportType = 
  | 'parts_usage_monthly'     // Uso de repuestos por mes
  | 'repair_vs_new'          // Equipos enviados a reparación vs. nuevos instalados
  | 'supplies_rotation'       // Rotación de insumos
  | 'support_indicators'      // Indicadores de soporte
  | 'replacement_times'       // Tiempos de reposición
  | 'client_costs'           // Costos por cliente/contrato
  | 'tools_consumption'      // Consumo de herramientas

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
export interface CreateEquipmentDTO {
  name: string;
  description?: string;
  price: number;
  equipment_category: EquipmentCategory;
  equipment_subcategory: EquipmentSubcategory;
  minimum_stock?: number;
  critical_stock?: number;
}

export interface UpdateEquipmentDTO extends Partial<CreateEquipmentDTO> {}

export interface CreateEquipmentInstanceDTO {
  equipment_id: number;
  serial_number: string;
  imei?: string;
  location_id: number;
  status: EquipmentStatus;
  condition: EquipmentCondition;
}

export interface CreateClientDTO {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  client_type: ClientType;
  contact_person?: string;
  technical_contact?: string;
  service_level?: ServiceLevel;
}

export interface CreateServiceOrderDTO {
  client_id: number;
  technician_id: string;
  service_type: ServiceType;
  priority: ServicePriority;
  description: string;
  equipment_serial?: string;
  scheduled_date?: string;
}

export interface CreateStockMovementDTO {
  equipment_instance_id: number;
  movement_type: MovementType;
  quantity: number;
  from_warehouse_id?: number;
  to_warehouse_id?: number;
  client_id?: number;
  service_order_id?: number;
  reason: string;
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

// Interfaces para dashboards e indicadores
export interface StockAlert {
  equipment_id: number;
  equipment_name: string;
  current_stock: number;
  minimum_stock: number;
  critical_stock: number;
  alert_level: 'low' | 'critical';
}

export interface DashboardStats {
  total_equipment: number;
  available_equipment: number;
  installed_equipment: number;
  in_repair_equipment: number;
  low_stock_alerts: number;
  critical_stock_alerts: number;
  pending_service_orders: number;
  overdue_service_orders: number;
}

// Tipos de filtros
export interface EquipmentFilters {
  search?: string;
  category?: EquipmentCategory;
  subcategory?: EquipmentSubcategory;
  minPrice?: number;
  maxPrice?: number;
  includeDeleted?: boolean;
  lowStock?: boolean;
  criticalStock?: boolean;
}

export interface EquipmentInstanceFilters {
  search?: string;
  status?: EquipmentStatus;
  condition?: EquipmentCondition;
  warehouse_id?: number;
  client_id?: number;
  category?: EquipmentCategory;
  subcategory?: EquipmentSubcategory;
}

export interface ServiceOrderFilters {
  search?: string;
  status?: ServiceStatus;
  service_type?: ServiceType;
  priority?: ServicePriority;
  client_id?: number;
  technician_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface UserFilters {
  search?: string;
  role?: Profile['role'];
  authorized?: boolean;
  blocked?: boolean;
  pendingRequests?: boolean;
}


