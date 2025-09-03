# Configuración de Base de Datos - Sistema de Inventario

Este documento contiene las instrucciones para configurar todas las tablas necesarias en Supabase para el sistema de inventario especializado en Control & Soporte Tecnológico.

## ❗ SOLUCIÓN RÁPIDA

Si ves el error "Es posible que la tabla 'warehouses' no exista en la base de datos", necesitas ejecutar el script SQL completo en Supabase.

## Instrucciones

1. Ve a tu proyecto en [Supabase](https://supabase.com/dashboard)
2. Navega a **SQL Editor**
3. Crea una nueva query y ejecuta el siguiente script SQL

## Script SQL Completo

```sql
-- =============================================================================
-- SISTEMA DE INVENTARIO - CONTROL & SOPORTE TECNOLÓGICO
-- =============================================================================

-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 1. TABLA PROFILES (Usuarios del sistema)
-- =============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'blocked' CHECK (role IN ('admin', 'tech_support', 'warehouse_staff', 'sales', 'blocked')),
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMPTZ,
    blocked_by UUID REFERENCES profiles(id),
    blocked_reason TEXT,
    authorized BOOLEAN DEFAULT false,
    authorized_at TIMESTAMPTZ,
    authorized_by UUID REFERENCES profiles(id),
    auth_request_pending BOOLEAN DEFAULT true,
    auth_request_date TIMESTAMPTZ DEFAULT NOW(),
    auth_request_status TEXT CHECK (auth_request_status IN ('approved', 'rejected', 'pending')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 2. TABLA WAREHOUSES (Bodegas)
-- =============================================================================
CREATE TABLE IF NOT EXISTS warehouses (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    warehouse_type TEXT NOT NULL CHECK (warehouse_type IN ('main', 'transit', 'repair_shop')),
    capacity INTEGER,
    responsible_person TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 3. TABLA EQUIPMENT (Equipos/Productos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    equipment_category TEXT NOT NULL CHECK (equipment_category IN ('main_equipment', 'parts_consumables', 'tools_accessories')),
    equipment_subcategory TEXT NOT NULL CHECK (equipment_subcategory IN (
        'attendance_clocks', 'casino_clocks', 'thermal_printers', 'fingerprint_readers',
        'power_supplies', 'displays_screens', 'thermal_ribbons_rolls', 'sensors_modules', 
        'internal_batteries_ups', 'electronic_boards',
        'installation_tools', 'cables_connectors', 'screws_supports', 'mounting_kits'
    )),
    serial_number TEXT,
    imei TEXT,
    batch_number TEXT,
    expiry_date DATE,
    minimum_stock INTEGER DEFAULT 0,
    critical_stock INTEGER DEFAULT 0,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 4. TABLA CLIENTS (Clientes)
-- =============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    client_type TEXT NOT NULL CHECK (client_type IN ('attendance_company', 'casino_corporate', 'internal_area')),
    contact_person TEXT,
    technical_contact TEXT,
    contract_number TEXT,
    service_level TEXT CHECK (service_level IN ('basic', 'standard', 'premium', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 5. TABLA EQUIPMENT_INSTANCES (Instancias específicas de equipos)
-- =============================================================================
CREATE TABLE IF NOT EXISTS equipment_instances (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id),
    serial_number TEXT NOT NULL UNIQUE,
    imei TEXT,
    location_id INTEGER NOT NULL REFERENCES warehouses(id),
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_transit', 'installed', 'in_repair', 'warranty', 'damaged', 'obsolete')),
    condition TEXT NOT NULL DEFAULT 'new' CHECK (condition IN ('new', 'good', 'fair', 'poor', 'broken')),
    installation_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    assigned_to_client INTEGER REFERENCES clients(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 6. TABLA PROVIDERS (Proveedores)
-- =============================================================================
CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rut TEXT NOT NULL UNIQUE,
    address TEXT,
    phone TEXT,
    email TEXT,
    provider_type TEXT NOT NULL CHECK (provider_type IN ('equipment_distributor', 'parts_manufacturer', 'supplies_provider')),
    contact_person TEXT,
    credit_terms TEXT,
    delivery_time INTEGER, -- días
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 7. TABLA PURCHASE_INVOICES (Facturas de compra)
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_invoices (
    id SERIAL PRIMARY KEY,
    invoice_number TEXT,
    provider_id INTEGER NOT NULL REFERENCES providers(id),
    purchase_date DATE NOT NULL,
    net_amount DECIMAL(12,2) NOT NULL,
    tax_amount DECIMAL(12,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 8. TABLA PURCHASE_INVOICE_ITEMS (Items de facturas de compra)
-- =============================================================================
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id SERIAL PRIMARY KEY,
    purchase_invoice_id INTEGER NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 9. TABLA SERVICE_ORDERS (Órdenes de servicio técnico)
-- =============================================================================
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    technician_id UUID NOT NULL REFERENCES profiles(id),
    service_type TEXT NOT NULL CHECK (service_type IN ('installation', 'maintenance', 'repair', 'replacement', 'warranty')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'in_progress', 'completed', 'cancelled')),
    description TEXT NOT NULL,
    equipment_serial TEXT,
    scheduled_date TIMESTAMPTZ,
    completion_date TIMESTAMPTZ,
    labor_hours DECIMAL(5,2),
    total_cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 10. TABLA SERVICE_ORDER_PARTS (Partes usadas en órdenes de servicio)
-- =============================================================================
CREATE TABLE IF NOT EXISTS service_order_parts (
    id SERIAL PRIMARY KEY,
    service_order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    equipment_instance_id INTEGER NOT NULL REFERENCES equipment_instances(id),
    quantity_used INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- 11. TABLA STOCK_MOVEMENTS (Movimientos de stock)
-- =============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    equipment_instance_id INTEGER NOT NULL REFERENCES equipment_instances(id),
    movement_type TEXT NOT NULL CHECK (movement_type IN (
        'purchase', 'warranty_return', 'inventory_adjustment',
        'client_installation', 'internal_loan', 'warranty_replacement', 'obsolescence',
        'warehouse_transfer'
    )),
    quantity INTEGER NOT NULL DEFAULT 1,
    from_warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER REFERENCES warehouses(id),
    client_id INTEGER REFERENCES clients(id),
    service_order_id INTEGER REFERENCES service_orders(id),
    reason TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =============================================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Índices para equipment
CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment(equipment_category);
CREATE INDEX IF NOT EXISTS idx_equipment_subcategory ON equipment(equipment_subcategory);
CREATE INDEX IF NOT EXISTS idx_equipment_deleted_at ON equipment(deleted_at);

-- Índices para equipment_instances
CREATE INDEX IF NOT EXISTS idx_equipment_instances_serial ON equipment_instances(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_status ON equipment_instances(status);
CREATE INDEX IF NOT EXISTS idx_equipment_instances_location ON equipment_instances(location_id);

-- Índices para service_orders
CREATE INDEX IF NOT EXISTS idx_service_orders_status ON service_orders(status);
CREATE INDEX IF NOT EXISTS idx_service_orders_client ON service_orders(client_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_technician ON service_orders(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_orders_created_at ON service_orders(created_at);

-- Índices para stock_movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_created_at ON stock_movements(created_at);

-- =============================================================================
-- DATOS INICIALES
-- =============================================================================

-- Insertar bodegas por defecto
INSERT INTO warehouses (name, location, warehouse_type, responsible_person) VALUES
('Bodega Principal', 'Matriz - Santiago Centro', 'main', 'Jefe de Bodega'),
('Bodega En Tránsito', 'Zona de Despacho', 'transit', 'Coordinador Logística'),
('Taller Técnico', 'Área de Reparaciones', 'repair_shop', 'Supervisor Técnico')
ON CONFLICT DO NOTHING;

-- Insertar equipos de ejemplo
INSERT INTO equipment (name, description, price, equipment_category, equipment_subcategory, minimum_stock, critical_stock) VALUES
-- Equipos principales
('Reloj Biométrico ZK-U160', 'Reloj de asistencia con lector de huella dactilar', 245000, 'main_equipment', 'attendance_clocks', 5, 2),
('Reloj Casino ZK-C3-400', 'Reloj especializado para casinos con múltiples verificaciones', 380000, 'main_equipment', 'casino_clocks', 3, 1),
('Impresora Térmica Zebra GC420t', 'Impresora térmica para etiquetas y tickets', 195000, 'main_equipment', 'thermal_printers', 2, 1),
('Lector Biométrico ZK-F18', 'Lector de huella dactilar standalone', 156000, 'main_equipment', 'fingerprint_readers', 4, 2),

-- Repuestos y consumibles
('Fuente de Poder 12V 3A', 'Fuente switching regulada 12VDC 3A', 15000, 'parts_consumables', 'power_supplies', 10, 3),
('Display LCD 16x2', 'Pantalla LCD alfanumérica 16 caracteres x 2 líneas', 8500, 'parts_consumables', 'displays_screens', 8, 3),
('Rollo Térmico 80x40mm', 'Papel térmico para impresoras 80mm x 40m', 2800, 'parts_consumables', 'thermal_ribbons_rolls', 50, 15),
('Sensor PIR HC-SR501', 'Sensor de movimiento infrarrojo pasivo', 3200, 'parts_consumables', 'sensors_modules', 15, 5),
('Batería Recargable 3.7V 2000mAh', 'Batería Li-ion para respaldo equipos', 12000, 'parts_consumables', 'internal_batteries_ups', 20, 8),
('Placa Controladora Arduino Nano', 'Microcontrolador para expansiones', 8900, 'parts_consumables', 'electronic_boards', 10, 3),

-- Herramientas y accesorios
('Kit Destornilladores Precisión', 'Set 32 piezas para electrónicos', 18500, 'tools_accessories', 'installation_tools', 3, 1),
('Cable USB 2.0 A-B 2m', 'Cable para conexión de equipos', 3500, 'tools_accessories', 'cables_connectors', 25, 10),
('Tornillos M3x10mm (100 unidades)', 'Tornillos métricos para montaje', 2100, 'tools_accessories', 'screws_supports', 30, 10),
('Kit Montaje Pared Universal', 'Soporte universal para instalación en pared', 8700, 'tools_accessories', 'mounting_kits', 12, 5)
ON CONFLICT DO NOTHING;

-- Insertar clientes de ejemplo
INSERT INTO clients (name, email, phone, client_type, contact_person, service_level) VALUES
('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard'),
('Casino Marina del Sol', 'it@marinadelsol.cl', '+56912345002', 'casino_corporate', 'María González', 'premium'),
('Área RRHH Corporativo', 'rrhh@empresa.cl', '+56912345003', 'internal_area', 'Carlos Rodríguez', 'enterprise')
ON CONFLICT DO NOTHING;

-- Insertar proveedores de ejemplo
INSERT INTO providers (name, rut, address, phone, email, provider_type, contact_person, credit_terms, delivery_time) VALUES
('ZKTeco Chile Ltda.', '96.123.456-7', 'Av. Providencia 1234, Santiago', '+56912345678', 'ventas@zkteco.cl', 'equipment_distributor', 'Roberto Silva', '30 días', 7),
('Suministros Electrónicos SpA', '78.987.654-3', 'San Diego 567, Santiago', '+56987654321', 'compras@sumelec.cl', 'parts_manufacturer', 'Ana María López', '15 días', 3),
('Papeles y Consumibles SA', '89.456.123-8', 'Las Condes 890, Santiago', '+56934567890', 'pedidos@papelcons.cl', 'supplies_provider', 'Carlos Mendoza', '7 días', 2)
ON CONFLICT DO NOTHING;

-- Insertar algunas instancias de equipos de ejemplo
DO $$
DECLARE
    warehouse_main_id INTEGER;
    equipment_reloj_id INTEGER;
    equipment_fuente_id INTEGER;
BEGIN
    -- Obtener IDs
    SELECT id INTO warehouse_main_id FROM warehouses WHERE warehouse_type = 'main' LIMIT 1;
    SELECT id INTO equipment_reloj_id FROM equipment WHERE name LIKE '%ZK-U160%' LIMIT 1;
    SELECT id INTO equipment_fuente_id FROM equipment WHERE name LIKE '%Fuente de Poder%' LIMIT 1;
    
    -- Solo insertar si encontramos los registros
    IF warehouse_main_id IS NOT NULL AND equipment_reloj_id IS NOT NULL THEN
        INSERT INTO equipment_instances (equipment_id, serial_number, location_id, status, condition) VALUES
        (equipment_reloj_id, 'ZK001234', warehouse_main_id, 'available', 'new'),
        (equipment_reloj_id, 'ZK001235', warehouse_main_id, 'available', 'new')
        ON CONFLICT (serial_number) DO NOTHING;
    END IF;
    
    IF warehouse_main_id IS NOT NULL AND equipment_fuente_id IS NOT NULL THEN
        INSERT INTO equipment_instances (equipment_id, serial_number, location_id, status, condition) VALUES
        (equipment_fuente_id, 'FP12V001', warehouse_main_id, 'available', 'new'),
        (equipment_fuente_id, 'FP12V002', warehouse_main_id, 'available', 'new'),
        (equipment_fuente_id, 'FP12V003', warehouse_main_id, 'available', 'new')
        ON CONFLICT (serial_number) DO NOTHING;
    END IF;
END $$;

-- =============================================================================
-- TRIGGERS PARA ACTUALIZAR TIMESTAMPS
-- =============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_warehouses_updated_at ON warehouses;
CREATE TRIGGER update_warehouses_updated_at BEFORE UPDATE ON warehouses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_updated_at ON equipment;
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON equipment FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipment_instances_updated_at ON equipment_instances;
CREATE TRIGGER update_equipment_instances_updated_at BEFORE UPDATE ON equipment_instances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_purchase_invoices_updated_at ON purchase_invoices;
CREATE TRIGGER update_purchase_invoices_updated_at BEFORE UPDATE ON purchase_invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_orders_updated_at ON service_orders;
CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON warehouses;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON equipment;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON equipment_instances;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON providers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchase_invoices;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchase_invoice_items;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON service_orders;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON service_order_parts;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stock_movements;

-- Crear políticas básicas (permitir todo para usuarios autenticados por ahora)
CREATE POLICY "Enable all operations for authenticated users" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON equipment FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON equipment_instances FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON providers FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON purchase_invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON purchase_invoice_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON service_orders FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON service_order_parts FOR ALL TO authenticated USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON stock_movements FOR ALL TO authenticated USING (true);

-- =============================================================================
-- FINALIZADO
-- =============================================================================

SELECT 'Base de datos configurada exitosamente para Sistema de Inventario - Control & Soporte Tecnológico' AS status;
```

## Verificación

Después de ejecutar el script, puedes verificar que las tablas se crearon correctamente ejecutando:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Deberías ver las siguientes tablas:
- `clients`
- `equipment`
- `equipment_instances`
- `profiles`
- `providers`
- `purchase_invoice_items`
- `purchase_invoices`
- `service_order_parts`
- `service_orders`
- `stock_movements`
- `warehouses`

## Próximos Pasos

1. **Ejecutar el script SQL completo** en el SQL Editor de Supabase
2. **Verificar que todas las tablas se crearon** con la consulta de verificación
3. **Probar la aplicación** - ya no deberías ver errores de tablas faltantes
4. **Configurar usuarios** - el primer usuario registrado necesitará ser autorizado manualmente en la tabla `profiles`

## Notas Importantes

- Las políticas RLS están configuradas para permitir todo a usuarios autenticados
- En producción, deberías configurar políticas más específicas según roles
- Los datos de ejemplo incluyen bodegas básicas, equipos típicos del rubro y clientes de muestra
- Todos los campos obligatorios tienen valores por defecto o validaciones apropiadas

## ⚡ Solución al Error Actual

El error que estás viendo indica que la tabla `warehouses` no existe. Ejecutar este script completo resolverá el problema y creará todas las tablas necesarias para el sistema de inventario especializado en Control & Soporte Tecnológico.