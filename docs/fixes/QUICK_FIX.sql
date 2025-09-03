-- =============================================================================
-- SOLUCIÓN RÁPIDA - RESOLVER ERROR DE CONEXIÓN A CLIENTS
-- =============================================================================

-- =============================================================================
-- 1. DESHABILITAR RLS TEMPORALMENTE PARA DEBUG
-- =============================================================================
ALTER TABLE IF EXISTS clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS warehouses DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. LIMPIAR Y RECREAR POLÍTICAS
-- =============================================================================

-- Para CLIENTS
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
        DROP POLICY IF EXISTS "Enable read for anon" ON clients;
        DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON clients;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON clients;
        DROP POLICY IF EXISTS "Users can update own profile" ON clients;
    END IF;
END $$;

-- Para WAREHOUSES  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'warehouses') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON warehouses;
        DROP POLICY IF EXISTS "Enable read for anon" ON warehouses;
    END IF;
END $$;

-- Para PROFILES
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON profiles;
        DROP POLICY IF EXISTS "Enable read for anon" ON profiles;
        DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
        DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    END IF;
END $$;

-- =============================================================================
-- 3. HABILITAR RLS Y CREAR POLÍTICAS SIMPLES
-- =============================================================================

-- CLIENTS
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_clients" ON clients FOR ALL USING (true);

-- WAREHOUSES  
ALTER TABLE IF EXISTS warehouses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_warehouses" ON warehouses FOR ALL USING (true);

-- PROFILES
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all_profiles" ON profiles FOR ALL USING (true);

-- =============================================================================
-- 4. VERIFICAR Y INSERTAR DATOS MÍNIMOS SI NO EXISTEN
-- =============================================================================

-- Insertar clientes básicos si la tabla está vacía
INSERT INTO clients (name, email)
SELECT 'Cliente Ejemplo 1', 'cliente1@example.com'
WHERE NOT EXISTS (SELECT 1 FROM clients);

INSERT INTO clients (name, email)  
SELECT 'Cliente Ejemplo 2', 'cliente2@example.com'
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE email = 'cliente2@example.com');

-- Insertar bodegas básicas si la tabla está vacía
INSERT INTO warehouses (name, location)
SELECT 'Bodega Principal', 'Ubicación Central'
WHERE NOT EXISTS (SELECT 1 FROM warehouses);

-- =============================================================================
-- 5. EXTENDER POLÍTICAS A TODAS LAS TABLAS IMPORTANTES
-- =============================================================================
DO $$
DECLARE
    table_names text[] := ARRAY[
        'equipment', 'equipment_instances', 'providers', 'service_orders', 
        'stock_movements', 'purchase_invoices', 'purchase_invoice_items', 'service_order_parts'
    ];
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY table_names
    LOOP
        -- Solo procesar si la tabla existe
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            
            -- Habilitar RLS
            EXECUTE 'ALTER TABLE ' || tbl || ' ENABLE ROW LEVEL SECURITY';
            
            -- Limpiar políticas existentes
            EXECUTE 'DROP POLICY IF EXISTS "allow_all_' || tbl || '" ON ' || tbl;
            EXECUTE 'DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON ' || tbl;
            
            -- Crear política simple
            EXECUTE 'CREATE POLICY "allow_all_' || tbl || '" ON ' || tbl || ' FOR ALL USING (true)';
            
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- 6. VERIFICACIÓN FINAL
-- =============================================================================
SELECT 'VERIFICACIÓN' as tipo, 'Clientes' as tabla, COUNT(*) as registros FROM clients
UNION ALL
SELECT 'VERIFICACIÓN' as tipo, 'Bodegas' as tabla, COUNT(*) as registros FROM warehouses
UNION ALL  
SELECT 'VERIFICACIÓN' as tipo, 'Equipos' as tabla, COUNT(*) as registros FROM equipment
WHERE EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'equipment');

-- =============================================================================
-- 7. MENSAJE FINAL
-- =============================================================================
SELECT 'CORRECCIÓN APLICADA - Refresca la aplicación y prueba nuevamente' as status;