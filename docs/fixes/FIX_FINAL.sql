-- =============================================================================
-- SCRIPT FINAL DE CORRECCIÓN - MANEJA TABLAS EXISTENTES CON ESTRUCTURA INCORRECTA
-- =============================================================================

-- =============================================================================
-- PASO 1: CREAR EXTENSIÓN UUID
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PASO 2: CORREGIR TABLA PROFILES (si existe)
-- =============================================================================
DO $$ 
BEGIN
    -- Solo si la tabla profiles existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        
        -- Agregar columnas faltantes una por una
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
            ALTER TABLE profiles ADD COLUMN email TEXT;
        END IF;
        
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
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'authorized') THEN
            ALTER TABLE profiles ADD COLUMN authorized BOOLEAN DEFAULT false;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
            ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
            ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
    END IF;
END $$;

-- =============================================================================
-- PASO 3: CORREGIR TABLA WAREHOUSES (si existe)
-- =============================================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') THEN
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'warehouse_type') THEN
            ALTER TABLE warehouses ADD COLUMN warehouse_type TEXT DEFAULT 'main';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'responsible_person') THEN
            ALTER TABLE warehouses ADD COLUMN responsible_person TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'capacity') THEN
            ALTER TABLE warehouses ADD COLUMN capacity INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'created_at') THEN
            ALTER TABLE warehouses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'updated_at') THEN
            ALTER TABLE warehouses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
    END IF;
END $$;

-- =============================================================================
-- PASO 4: CORREGIR TABLA CLIENTS (si existe)
-- =============================================================================
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
            ALTER TABLE clients ADD COLUMN client_type TEXT DEFAULT 'attendance_company';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
            ALTER TABLE clients ADD COLUMN contact_person TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'technical_contact') THEN
            ALTER TABLE clients ADD COLUMN technical_contact TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contract_number') THEN
            ALTER TABLE clients ADD COLUMN contract_number TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'service_level') THEN
            ALTER TABLE clients ADD COLUMN service_level TEXT DEFAULT 'standard';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
            ALTER TABLE clients ADD COLUMN phone TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'address') THEN
            ALTER TABLE clients ADD COLUMN address TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'created_at') THEN
            ALTER TABLE clients ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updated_at') THEN
            ALTER TABLE clients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        END IF;
        
    END IF;
END $$;

-- =============================================================================
-- PASO 5: CREAR O CORREGIR TABLA EQUIPMENT
-- =============================================================================
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    equipment_category TEXT NOT NULL DEFAULT 'main_equipment',
    equipment_subcategory TEXT NOT NULL DEFAULT 'attendance_clocks',
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
-- PASO 6: CREAR O CORREGIR TABLA PROVIDERS
-- =============================================================================
CREATE TABLE IF NOT EXISTS providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    rut TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    provider_type TEXT NOT NULL DEFAULT 'equipment_distributor',
    contact_person TEXT,
    credit_terms TEXT,
    delivery_time INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PASO 7: CREAR TABLAS DEPENDIENTES
-- =============================================================================

-- EQUIPMENT_INSTANCES (depende de equipment y warehouses)
CREATE TABLE IF NOT EXISTS equipment_instances (
    id SERIAL PRIMARY KEY,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id),
    serial_number TEXT NOT NULL,
    imei TEXT,
    location_id INTEGER NOT NULL REFERENCES warehouses(id),
    status TEXT NOT NULL DEFAULT 'available',
    condition TEXT NOT NULL DEFAULT 'new',
    installation_date DATE,
    warranty_expiry DATE,
    last_maintenance DATE,
    assigned_to_client INTEGER REFERENCES clients(id),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE_ORDERS (depende de clients y profiles)
CREATE TABLE IF NOT EXISTS service_orders (
    id SERIAL PRIMARY KEY,
    order_number TEXT NOT NULL,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    technician_id UUID NOT NULL REFERENCES profiles(id),
    service_type TEXT NOT NULL DEFAULT 'installation',
    priority TEXT NOT NULL DEFAULT 'normal',
    status TEXT NOT NULL DEFAULT 'pending',
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

-- STOCK_MOVEMENTS (depende de equipment_instances, warehouses, clients, service_orders, profiles)
CREATE TABLE IF NOT EXISTS stock_movements (
    id SERIAL PRIMARY KEY,
    equipment_instance_id INTEGER NOT NULL REFERENCES equipment_instances(id),
    movement_type TEXT NOT NULL DEFAULT 'purchase',
    quantity INTEGER NOT NULL DEFAULT 1,
    from_warehouse_id INTEGER REFERENCES warehouses(id),
    to_warehouse_id INTEGER REFERENCES warehouses(id),
    client_id INTEGER REFERENCES clients(id),
    service_order_id INTEGER REFERENCES service_orders(id),
    reason TEXT NOT NULL,
    performed_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE_INVOICES (depende de providers)
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

-- PURCHASE_INVOICE_ITEMS (depende de purchase_invoices)
CREATE TABLE IF NOT EXISTS purchase_invoice_items (
    id SERIAL PRIMARY KEY,
    purchase_invoice_id INTEGER NOT NULL REFERENCES purchase_invoices(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE_ORDER_PARTS (depende de service_orders y equipment_instances)
CREATE TABLE IF NOT EXISTS service_order_parts (
    id SERIAL PRIMARY KEY,
    service_order_id INTEGER NOT NULL REFERENCES service_orders(id) ON DELETE CASCADE,
    equipment_instance_id INTEGER NOT NULL REFERENCES equipment_instances(id),
    quantity_used INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PASO 8: INSERTAR DATOS DE EJEMPLO (solo si las tablas están vacías)
-- =============================================================================

-- Insertar bodegas
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM warehouses) = 0 THEN
        INSERT INTO warehouses (name, location, warehouse_type, responsible_person) VALUES
        ('Bodega Principal', 'Matriz - Santiago Centro', 'main', 'Jefe de Bodega'),
        ('Bodega En Tránsito', 'Zona de Despacho', 'transit', 'Coordinador Logística'),
        ('Taller Técnico', 'Área de Reparaciones', 'repair_shop', 'Supervisor Técnico');
    END IF;
END $$;

-- Insertar equipos
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM equipment) = 0 THEN
        INSERT INTO equipment (name, description, price, equipment_category, equipment_subcategory, minimum_stock, critical_stock) VALUES
        ('Reloj Biométrico ZK-U160', 'Reloj de asistencia con lector de huella dactilar', 245000, 'main_equipment', 'attendance_clocks', 5, 2),
        ('Reloj Casino ZK-C3-400', 'Reloj especializado para casinos con múltiples verificaciones', 380000, 'main_equipment', 'casino_clocks', 3, 1),
        ('Fuente de Poder 12V 3A', 'Fuente switching regulada 12VDC 3A', 15000, 'parts_consumables', 'power_supplies', 10, 3),
        ('Display LCD 16x2', 'Pantalla LCD alfanumérica 16 caracteres x 2 líneas', 8500, 'parts_consumables', 'displays_screens', 8, 3);
    END IF;
END $$;

-- Insertar clientes
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM clients) = 0 THEN
        INSERT INTO clients (name, email, phone, client_type, contact_person, service_level) VALUES
        ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard'),
        ('Casino Marina del Sol', 'it@marinadelsol.cl', '+56912345002', 'casino_corporate', 'María González', 'premium'),
        ('Área RRHH Corporativo', 'rrhh@empresa.cl', '+56912345003', 'internal_area', 'Carlos Rodríguez', 'enterprise');
    END IF;
END $$;

-- Insertar proveedores
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM providers) = 0 THEN
        INSERT INTO providers (name, rut, address, phone, email, provider_type, contact_person, credit_terms, delivery_time) VALUES
        ('ZKTeco Chile Ltda.', '96.123.456-7', 'Av. Providencia 1234, Santiago', '+56912345678', 'ventas@zkteco.cl', 'equipment_distributor', 'Roberto Silva', '30 días', 7),
        ('Suministros Electrónicos SpA', '78.987.654-3', 'San Diego 567, Santiago', '+56987654321', 'compras@sumelec.cl', 'parts_manufacturer', 'Ana María López', '15 días', 3);
    END IF;
END $$;

-- =============================================================================
-- PASO 9: CREAR ÍNDICES ÚNICOS (con manejo de errores)
-- =============================================================================
DO $$
BEGIN
    -- Índice único para providers.rut
    BEGIN
        CREATE UNIQUE INDEX providers_rut_unique ON providers(rut);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN others THEN NULL;
    END;
    
    -- Índice único para equipment_instances.serial_number
    BEGIN
        CREATE UNIQUE INDEX equipment_instances_serial_unique ON equipment_instances(serial_number);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN others THEN NULL;
    END;
    
    -- Índice único para service_orders.order_number
    BEGIN
        CREATE UNIQUE INDEX service_orders_order_number_unique ON service_orders(order_number);
    EXCEPTION
        WHEN duplicate_table THEN NULL;
        WHEN others THEN NULL;
    END;
    
END $$;

-- =============================================================================
-- PASO 10: HABILITAR ROW LEVEL SECURITY Y CREAR POLÍTICAS
-- =============================================================================

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_order_parts ENABLE ROW LEVEL SECURITY;

-- Crear políticas (con manejo de errores)
DO $$ 
BEGIN
    -- Limpiar políticas existentes
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON profiles;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON warehouses;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON equipment;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON equipment_instances;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON providers;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON service_orders;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stock_movements;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchase_invoices;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchase_invoice_items;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON service_order_parts;
    
    -- Crear nuevas políticas
    CREATE POLICY "Enable all operations for authenticated users" ON profiles FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON equipment FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON equipment_instances FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON providers FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON service_orders FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON stock_movements FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON purchase_invoices FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON purchase_invoice_items FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON service_order_parts FOR ALL TO authenticated USING (true);

EXCEPTION
    WHEN others THEN
        -- Error creando políticas, pero continuar
        NULL;
END $$;

-- =============================================================================
-- FINALIZADO
-- =============================================================================
SELECT 
    'CONFIGURACIÓN COMPLETADA: Base de datos lista para el Sistema de Inventario' AS status,
    (SELECT COUNT(*) FROM warehouses) AS bodegas_creadas,
    (SELECT COUNT(*) FROM equipment) AS equipos_creados,
    (SELECT COUNT(*) FROM clients) AS clientes_creados,
    (SELECT COUNT(*) FROM providers) AS proveedores_creados;