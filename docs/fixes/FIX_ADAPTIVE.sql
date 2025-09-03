-- =============================================================================
-- SCRIPT ADAPTATIVO - SE AJUSTA A LA ESTRUCTURA EXISTENTE
-- =============================================================================
-- Este script detecta las tablas existentes y se adapta a su estructura

-- =============================================================================
-- PASO 1: CREAR EXTENSIÓN UUID
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PASO 2: CORREGIR TABLA PROFILES
-- =============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        
        -- Agregar columnas básicas necesarias
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
        
    END IF;
END $$;

-- =============================================================================
-- PASO 3: CORREGIR TABLA WAREHOUSES
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
        
    END IF;
END $$;

-- =============================================================================
-- PASO 4: CORREGIR TABLA CLIENTS DE MANERA ADAPTATIVA
-- =============================================================================
DO $$
DECLARE
    has_organization BOOLEAN := FALSE;
    has_client_type BOOLEAN := FALSE;
    client_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        
        -- Detectar si existe la columna organization
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clients' AND column_name = 'organization'
        ) INTO has_organization;
        
        -- Detectar si existe client_type
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'clients' AND column_name = 'client_type'
        ) INTO has_client_type;
        
        -- Agregar columnas faltantes
        IF NOT has_client_type THEN
            ALTER TABLE clients ADD COLUMN client_type TEXT DEFAULT 'attendance_company';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
            ALTER TABLE clients ADD COLUMN contact_person TEXT;
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
        
        -- Si organization existe y es NOT NULL, hacerla nullable
        IF has_organization THEN
            BEGIN
                ALTER TABLE clients ALTER COLUMN organization DROP NOT NULL;
            EXCEPTION
                WHEN others THEN NULL;
            END;
        END IF;
        
        -- Verificar si necesitamos insertar datos
        SELECT COUNT(*) INTO client_count FROM clients;
        
        IF client_count = 0 THEN
            -- Insertar datos adaptándose a la estructura
            IF has_organization THEN
                -- Tabla tiene organization, incluirla
                INSERT INTO clients (name, email, phone, client_type, contact_person, service_level, organization) VALUES
                ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard', 'Empresa Construcciones ABC'),
                ('Casino Marina del Sol', 'it@marinadelsol.cl', '+56912345002', 'casino_corporate', 'María González', 'premium', 'Casino Marina del Sol'),
                ('Área RRHH Corporativo', 'rrhh@empresa.cl', '+56912345003', 'internal_area', 'Carlos Rodríguez', 'enterprise', 'Área RRHH Corporativo');
            ELSE
                -- Tabla no tiene organization, usar solo columnas estándar
                INSERT INTO clients (name, email, phone, client_type, contact_person, service_level) VALUES
                ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl', '+56912345001', 'attendance_company', 'Juan Pérez', 'standard'),
                ('Casino Marina del Sol', 'it@marinadelsol.cl', '+56912345002', 'casino_corporate', 'María González', 'premium'),
                ('Área RRHH Corporativo', 'rrhh@empresa.cl', '+56912345003', 'internal_area', 'Carlos Rodríguez', 'enterprise');
            END IF;
        END IF;
        
    END IF;
END $$;

-- =============================================================================
-- PASO 5: CREAR TABLA EQUIPMENT SI NO EXISTE
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
-- PASO 6: CREAR TABLA PROVIDERS SI NO EXISTE
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

-- EQUIPMENT_INSTANCES
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

-- SERVICE_ORDERS
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

-- STOCK_MOVEMENTS
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

-- =============================================================================
-- PASO 8: INSERTAR DATOS DE EJEMPLO EN OTRAS TABLAS
-- =============================================================================

-- Insertar bodegas si está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM warehouses) = 0 THEN
        INSERT INTO warehouses (name, location, warehouse_type, responsible_person) VALUES
        ('Bodega Principal', 'Matriz - Santiago Centro', 'main', 'Jefe de Bodega'),
        ('Bodega En Tránsito', 'Zona de Despacho', 'transit', 'Coordinador Logística'),
        ('Taller Técnico', 'Área de Reparaciones', 'repair_shop', 'Supervisor Técnico');
    END IF;
END $$;

-- Insertar equipos si está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM equipment) = 0 THEN
        INSERT INTO equipment (name, description, price, equipment_category, equipment_subcategory, minimum_stock, critical_stock) VALUES
        ('Reloj Biométrico ZK-U160', 'Reloj de asistencia con lector de huella dactilar', 245000, 'main_equipment', 'attendance_clocks', 5, 2),
        ('Fuente de Poder 12V 3A', 'Fuente switching regulada 12VDC 3A', 15000, 'parts_consumables', 'power_supplies', 10, 3),
        ('Display LCD 16x2', 'Pantalla LCD alfanumérica 16 caracteres x 2 líneas', 8500, 'parts_consumables', 'displays_screens', 8, 3);
    END IF;
END $$;

-- Insertar proveedores si está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM providers) = 0 THEN
        INSERT INTO providers (name, rut, address, phone, email, provider_type, contact_person, credit_terms, delivery_time) VALUES
        ('ZKTeco Chile Ltda.', '96.123.456-7', 'Av. Providencia 1234, Santiago', '+56912345678', 'ventas@zkteco.cl', 'equipment_distributor', 'Roberto Silva', '30 días', 7),
        ('Suministros Electrónicos SpA', '78.987.654-3', 'San Diego 567, Santiago', '+56987654321', 'compras@sumelec.cl', 'parts_manufacturer', 'Ana María López', '15 días', 3);
    END IF;
END $$;

-- =============================================================================
-- PASO 9: HABILITAR ROW LEVEL SECURITY
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
    WHEN others THEN NULL;
END $$;

-- =============================================================================
-- FINALIZADO
-- =============================================================================
SELECT 
    'CONFIGURACIÓN COMPLETADA: Base de datos adaptada exitosamente' AS status,
    (SELECT COUNT(*) FROM warehouses) AS bodegas,
    (SELECT COUNT(*) FROM equipment) AS equipos,
    (SELECT COUNT(*) FROM clients) AS clientes,
    (SELECT COUNT(*) FROM providers) AS proveedores;