-- =============================================================================
-- SCRIPT DE CORRECCIÓN PARA BASE DE DATOS EXISTENTE
-- =============================================================================
-- Este script corrige tablas que ya existen pero tienen estructura incorrecta

-- =============================================================================
-- 1. CORREGIR TABLA PROFILES
-- =============================================================================

-- Agregar columnas faltantes a profiles si no existen
DO $$ 
BEGIN
    -- Agregar email si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    
    -- Hacer email único si existe pero no tiene constrainst
    BEGIN
        ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
    EXCEPTION
        WHEN duplicate_table THEN
            -- El constraint ya existe, no hacer nada
            NULL;
        WHEN others THEN
            -- Otro error, intentar hacer email NOT NULL
            NULL;
    END;

    -- Agregar otras columnas faltantes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'blocked';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_blocked') THEN
        ALTER TABLE profiles ADD COLUMN is_blocked BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'blocked_at') THEN
        ALTER TABLE profiles ADD COLUMN blocked_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'blocked_by') THEN
        ALTER TABLE profiles ADD COLUMN blocked_by UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'blocked_reason') THEN
        ALTER TABLE profiles ADD COLUMN blocked_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'authorized') THEN
        ALTER TABLE profiles ADD COLUMN authorized BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'authorized_at') THEN
        ALTER TABLE profiles ADD COLUMN authorized_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'authorized_by') THEN
        ALTER TABLE profiles ADD COLUMN authorized_by UUID REFERENCES profiles(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'auth_request_pending') THEN
        ALTER TABLE profiles ADD COLUMN auth_request_pending BOOLEAN DEFAULT true;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'auth_request_date') THEN
        ALTER TABLE profiles ADD COLUMN auth_request_date TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'auth_request_status') THEN
        ALTER TABLE profiles ADD COLUMN auth_request_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

END $$;

-- =============================================================================
-- 2. CREAR TABLAS FALTANTES
-- =============================================================================

-- Crear extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla WAREHOUSES
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

-- Tabla EQUIPMENT
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

-- Tabla CLIENTS
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

-- Tabla EQUIPMENT_INSTANCES
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

-- Tabla PROVIDERS
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
    delivery_time INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla PURCHASE_INVOICES
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

-- Tabla PURCHASE_INVOICE_ITEMS
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id SERIAL PRIMARY KEY,
    purchase_invoice_id INTEGER NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla SERVICE_ORDERS
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

-- Tabla SERVICE_ORDER_PARTS
CREATE TABLE IF NOT EXISTS service_order_parts (
    id SERIAL PRIMARY KEY,
    service_order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    equipment_instance_id INTEGER NOT NULL REFERENCES equipment_instances(id),
    quantity_used INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla STOCK_MOVEMENTS
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
-- 3. INSERTAR DATOS INICIALES
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

-- =============================================================================
-- 4. HABILITAR ROW LEVEL SECURITY
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

-- Limpiar políticas existentes si existen
DO $$ 
BEGIN
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
EXCEPTION
    WHEN others THEN
        -- Las políticas no existen, continuar
        NULL;
END $$;

-- Crear políticas básicas
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

SELECT 'Base de datos corregida y configurada exitosamente' AS status;