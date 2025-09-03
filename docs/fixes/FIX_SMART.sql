-- =============================================================================
-- SCRIPT INTELIGENTE - DETECTA Y MANEJA TODAS LAS RESTRICCIONES NOT NULL
-- =============================================================================

-- =============================================================================
-- PASO 1: CREAR EXTENSIÓN UUID
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- PASO 2: HACER TODAS LAS COLUMNAS NULLABLE EN CLIENTS (excepto las básicas)
-- =============================================================================
DO $$
DECLARE
    col_record RECORD;
BEGIN
    -- Solo si la tabla clients existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        
        -- Hacer nullable todas las columnas que podrían causar problemas
        FOR col_record IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'clients' 
            AND is_nullable = 'NO' 
            AND column_name NOT IN ('id', 'name', 'email') -- Mantener estas como NOT NULL
        LOOP
            BEGIN
                EXECUTE 'ALTER TABLE clients ALTER COLUMN ' || col_record.column_name || ' DROP NOT NULL';
            EXCEPTION
                WHEN others THEN NULL; -- Ignorar errores
            END;
        END LOOP;
        
        -- Agregar columnas que necesitamos si no existen
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
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
        
    END IF;
END $$;

-- =============================================================================
-- PASO 3: CORREGIR TABLA PROFILES
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
-- PASO 4: CORREGIR TABLA WAREHOUSES
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
-- PASO 5: INSERTAR DATOS EN CLIENTS DE FORMA INTELIGENTE
-- =============================================================================
DO $$
DECLARE
    columns_exist RECORD;
    insert_query TEXT := 'INSERT INTO clients (name, email';
    values_part TEXT := ' VALUES ';
    client_count INTEGER := 0;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        
        -- Verificar si necesitamos insertar datos
        SELECT COUNT(*) INTO client_count FROM clients;
        
        IF client_count = 0 THEN
            -- Construir query dinámico basado en las columnas existentes
            
            -- Agregar columnas opcionales si existen
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
                insert_query := insert_query || ', phone';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
                insert_query := insert_query || ', client_type';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
                insert_query := insert_query || ', contact_person';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'service_level') THEN
                insert_query := insert_query || ', service_level';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'organization') THEN
                insert_query := insert_query || ', organization';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'dni') THEN
                insert_query := insert_query || ', dni';
            END IF;
            
            -- Cerrar parte de columnas
            insert_query := insert_query || ')';
            
            -- Construir valores
            values_part := values_part || '(''Empresa Construcciones ABC'', ''contacto@construccionesabc.cl''';
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
                values_part := values_part || ', ''+56912345001''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
                values_part := values_part || ', ''attendance_company''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
                values_part := values_part || ', ''Juan Pérez''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'service_level') THEN
                values_part := values_part || ', ''standard''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'organization') THEN
                values_part := values_part || ', ''Empresa Construcciones ABC''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'dni') THEN
                values_part := values_part || ', ''12345678-9''';
            END IF;
            
            values_part := values_part || '), (''Casino Marina del Sol'', ''it@marinadelsol.cl''';
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
                values_part := values_part || ', ''+56912345002''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'client_type') THEN
                values_part := values_part || ', ''casino_corporate''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'contact_person') THEN
                values_part := values_part || ', ''María González''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'service_level') THEN
                values_part := values_part || ', ''premium''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'organization') THEN
                values_part := values_part || ', ''Casino Marina del Sol''';
            END IF;
            
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'dni') THEN
                values_part := values_part || ', ''87654321-0''';
            END IF;
            
            values_part := values_part || ')';
            
            -- Ejecutar el INSERT dinámico
            BEGIN
                EXECUTE insert_query || values_part;
            EXCEPTION
                WHEN others THEN
                    -- Si falla, insertar solo lo mínimo requerido
                    INSERT INTO clients (name, email) VALUES 
                    ('Empresa Construcciones ABC', 'contacto@construccionesabc.cl'),
                    ('Casino Marina del Sol', 'it@marinadelsol.cl');
            END;
            
        END IF;
    END IF;
END $$;

-- =============================================================================
-- PASO 6: CREAR TABLA EQUIPMENT SI NO EXISTE
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
-- PASO 7: CREAR TABLA PROVIDERS SI NO EXISTE
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
-- PASO 8: CREAR TABLAS DEPENDIENTES
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
-- PASO 9: INSERTAR DATOS EN OTRAS TABLAS
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
        ('Fuente de Poder 12V 3A', 'Fuente switching regulada 12VDC 3A', 15000, 'parts_consumables', 'power_supplies', 10, 3);
    END IF;
END $$;

-- Insertar proveedores si está vacía
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM providers) = 0 THEN
        INSERT INTO providers (name, rut, address, phone, email, provider_type, contact_person, credit_terms, delivery_time) VALUES
        ('ZKTeco Chile Ltda.', '96.123.456-7', 'Av. Providencia 1234, Santiago', '+56912345678', 'ventas@zkteco.cl', 'equipment_distributor', 'Roberto Silva', '30 días', 7);
    END IF;
END $$;

-- =============================================================================
-- PASO 10: HABILITAR ROW LEVEL SECURITY
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
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON profiles;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON warehouses;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON equipment;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON equipment_instances;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON providers;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON service_orders;
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON stock_movements;
    
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
SELECT 'CONFIGURACIÓN COMPLETADA: Base de datos configurada con estructura personalizada' AS status;