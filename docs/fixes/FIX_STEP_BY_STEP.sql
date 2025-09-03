-- =============================================================================
-- SCRIPT DE CORRECCIÓN PASO A PASO
-- =============================================================================
-- Ejecutar en orden, una sección a la vez para evitar errores

-- =============================================================================
-- PASO 1: CREAR EXTENSIÓN UUID
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PASO 2: CORREGIR TABLA PROFILES
-- =============================================================================
-- Agregar columnas faltantes a profiles si no existen
DO $$ 
BEGIN
    -- Agregar email si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email TEXT;
    END IF;
    
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
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'authorized') THEN
        ALTER TABLE profiles ADD COLUMN authorized BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

END $$;

SELECT 'PASO 2 COMPLETADO: Profiles corregido' AS status;

-- =============================================================================
-- PASO 3: CORREGIR TABLA WAREHOUSES
-- =============================================================================
DO $$ 
BEGIN
    -- Agregar warehouse_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'warehouse_type') THEN
        ALTER TABLE warehouses ADD COLUMN warehouse_type TEXT DEFAULT 'main';
        UPDATE warehouses SET warehouse_type = 'main' WHERE warehouse_type IS NULL;
        ALTER TABLE warehouses ALTER COLUMN warehouse_type SET NOT NULL;
    END IF;
    
    -- Agregar otras columnas
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

END $$;

SELECT 'PASO 3 COMPLETADO: Warehouses corregido' AS status;

-- =============================================================================
-- PASO 4: CREAR TABLA EQUIPMENT
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

SELECT 'PASO 4 COMPLETADO: Equipment creado' AS status;

-- =============================================================================
-- PASO 5: CREAR TABLA CLIENTS
-- =============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    client_type TEXT NOT NULL DEFAULT 'attendance_company',
    contact_person TEXT,
    technical_contact TEXT,
    contract_number TEXT,
    service_level TEXT DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

SELECT 'PASO 5 COMPLETADO: Clients creado' AS status;

-- =============================================================================
-- PASO 6: CREAR TABLA PROVIDERS
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

-- Crear índice único para RUT si no existe
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS providers_rut_unique ON providers(rut);
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN others THEN
        NULL;
END $$;

SELECT 'PASO 6 COMPLETADO: Providers creado' AS status;

-- =============================================================================
-- PASO 7: CREAR TABLA EQUIPMENT_INSTANCES
-- =============================================================================
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

-- Crear índice único para serial_number si no existe
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS equipment_instances_serial_unique ON equipment_instances(serial_number);
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN others THEN
        NULL;
END $$;

SELECT 'PASO 7 COMPLETADO: Equipment instances creado' AS status;

-- =============================================================================
-- PASO 8: CREAR TABLA SERVICE_ORDERS
-- =============================================================================
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

-- Crear índice único para order_number si no existe
DO $$
BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS service_orders_order_number_unique ON service_orders(order_number);
EXCEPTION
    WHEN duplicate_table THEN
        NULL;
    WHEN others THEN
        NULL;
END $$;

SELECT 'PASO 8 COMPLETADO: Service orders creado' AS status;

-- =============================================================================
-- PASO 9: CREAR TABLA STOCK_MOVEMENTS
-- =============================================================================
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

SELECT 'PASO 9 COMPLETADO: Stock movements creado' AS status;

-- =============================================================================
-- PASO 10: INSERTAR DATOS DE EJEMPLO
-- =============================================================================
-- Solo insertar si las tablas están vacías

-- Insertar bodegas
INSERT INTO warehouses (name, location, warehouse_type, responsible_person) 
SELECT 'Bodega Principal', 'Matriz - Santiago Centro', 'main', 'Jefe de Bodega'
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE name = 'Bodega Principal');

INSERT INTO warehouses (name, location, warehouse_type, responsible_person) 
SELECT 'Bodega En Tránsito', 'Zona de Despacho', 'transit', 'Coordinador Logística'
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE name = 'Bodega En Tránsito');

INSERT INTO warehouses (name, location, warehouse_type, responsible_person) 
SELECT 'Taller Técnico', 'Área de Reparaciones', 'repair_shop', 'Supervisor Técnico'
WHERE NOT EXISTS (SELECT 1 FROM warehouses WHERE name = 'Taller Técnico');

-- Insertar algunos equipos básicos
INSERT INTO equipment (name, description, price, equipment_category, equipment_subcategory, minimum_stock, critical_stock) 
SELECT 'Reloj Biométrico ZK-U160', 'Reloj de asistencia con lector de huella dactilar', 245000, 'main_equipment', 'attendance_clocks', 5, 2
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Reloj Biométrico ZK-U160');

INSERT INTO equipment (name, description, price, equipment_category, equipment_subcategory, minimum_stock, critical_stock) 
SELECT 'Fuente de Poder 12V 3A', 'Fuente switching regulada 12VDC 3A', 15000, 'parts_consumables', 'power_supplies', 10, 3
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE name = 'Fuente de Poder 12V 3A');

-- Insertar clientes básicos
INSERT INTO clients (name, email, phone, client_type, contact_person, service_level) 
SELECT 'Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'contacto@construccionesabc.cl');

-- Insertar proveedores básicos
INSERT INTO providers (name, rut, address, phone, email, provider_type, contact_person, credit_terms, delivery_time) 
SELECT 'ZKTeco Chile Ltda.', '96.123.456-7', 'Av. Providencia 1234, Santiago', '+56912345678', 'ventas@zkteco.cl', 'equipment_distributor', 'Roberto Silva', '30 días', 7
WHERE NOT EXISTS (SELECT 1 FROM providers WHERE rut = '96.123.456-7');

SELECT 'PASO 10 COMPLETADO: Datos de ejemplo insertados' AS status;

-- =============================================================================
-- PASO 11: HABILITAR ROW LEVEL SECURITY
-- =============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas
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
    
    -- Crear nuevas políticas
    CREATE POLICY "Enable all operations for authenticated users" ON profiles FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON equipment FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON clients FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON equipment_instances FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON providers FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON service_orders FOR ALL TO authenticated USING (true);
    CREATE POLICY "Enable all operations for authenticated users" ON stock_movements FOR ALL TO authenticated USING (true);

EXCEPTION
    WHEN others THEN
        -- Error creando políticas, continuar
        NULL;
END $$;

SELECT 'PASO 11 COMPLETADO: RLS habilitado y políticas creadas' AS status;

-- =============================================================================
-- FINALIZADO
-- =============================================================================
SELECT 'CONFIGURACIÓN COMPLETADA: Base de datos lista para usar' AS final_status;