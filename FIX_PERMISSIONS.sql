-- =============================================================================
-- SCRIPT PARA VERIFICAR Y CORREGIR PERMISOS Y CONEXIÓN
-- =============================================================================

-- =============================================================================
-- PASO 1: VERIFICAR QUE LAS TABLAS EXISTEN
-- =============================================================================
SELECT 
    'VERIFICACIÓN DE TABLAS' AS tipo,
    table_name,
    'EXISTS' AS estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'warehouses', 'profiles', 'equipment')
ORDER BY table_name;

-- =============================================================================
-- PASO 2: VERIFICAR ESTRUCTURA DE LA TABLA CLIENTS
-- =============================================================================
SELECT 
    'ESTRUCTURA CLIENTS' AS tipo,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =============================================================================
-- PASO 3: VERIFICAR POLÍTICAS RLS EN CLIENTS
-- =============================================================================
SELECT 
    'POLÍTICAS RLS' AS tipo,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'clients';

-- =============================================================================
-- PASO 4: CORREGIR POLÍTICAS RLS SI ESTÁN MAL CONFIGURADAS
-- =============================================================================
DO $$ 
BEGIN
    -- Verificar si RLS está habilitado en clients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clients') THEN
        
        -- Deshabilitar RLS temporalmente para debug
        ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
        
        -- Limpiar todas las políticas existentes
        DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON clients;
        DROP POLICY IF EXISTS "Enable read access for all users" ON clients;
        DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON clients;
        DROP POLICY IF EXISTS "Enable update for users based on email" ON clients;
        DROP POLICY IF EXISTS "Enable delete for users based on email" ON clients;
        
        -- Habilitar RLS nuevamente
        ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
        
        -- Crear política permisiva para usuarios autenticados
        CREATE POLICY "Enable all operations for authenticated users" 
        ON clients FOR ALL 
        TO authenticated 
        USING (true) 
        WITH CHECK (true);
        
        -- Crear política adicional para usuarios anónimos (para casos específicos)
        CREATE POLICY "Enable read for anon" 
        ON clients FOR SELECT 
        TO anon 
        USING (true);
        
    END IF;
END $$;

-- =============================================================================
-- PASO 5: HACER LO MISMO PARA OTRAS TABLAS CRÍTICAS
-- =============================================================================
DO $$ 
DECLARE
    table_list text[] := ARRAY['warehouses', 'profiles', 'equipment', 'equipment_instances', 'providers', 'service_orders', 'stock_movements'];
    tbl text;
BEGIN
    FOREACH tbl IN ARRAY table_list
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = tbl) THEN
            
            -- Deshabilitar RLS temporalmente
            EXECUTE 'ALTER TABLE ' || tbl || ' DISABLE ROW LEVEL SECURITY';
            
            -- Limpiar políticas existentes
            EXECUTE 'DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON ' || tbl;
            EXECUTE 'DROP POLICY IF EXISTS "Enable read for anon" ON ' || tbl;
            
            -- Habilitar RLS nuevamente
            EXECUTE 'ALTER TABLE ' || tbl || ' ENABLE ROW LEVEL SECURITY';
            
            -- Crear políticas permisivas
            EXECUTE 'CREATE POLICY "Enable all operations for authenticated users" ON ' || tbl || ' FOR ALL TO authenticated USING (true) WITH CHECK (true)';
            EXECUTE 'CREATE POLICY "Enable read for anon" ON ' || tbl || ' FOR SELECT TO anon USING (true)';
            
        END IF;
    END LOOP;
END $$;

-- =============================================================================
-- PASO 6: VERIFICAR QUE HAY DATOS EN LAS TABLAS
-- =============================================================================
DO $$
DECLARE
    client_count INTEGER := 0;
    warehouse_count INTEGER := 0;
BEGIN
    -- Contar registros en clients
    SELECT COUNT(*) INTO client_count FROM clients;
    
    -- Contar registros en warehouses
    SELECT COUNT(*) INTO warehouse_count FROM warehouses;
    
    -- Mostrar resultados
    RAISE NOTICE 'Clientes en la base de datos: %', client_count;
    RAISE NOTICE 'Bodegas en la base de datos: %', warehouse_count;
    
    -- Si no hay datos, insertar algunos básicos
    IF client_count = 0 THEN
        INSERT INTO clients (name, email) VALUES 
        ('Cliente Test 1', 'test1@example.com'),
        ('Cliente Test 2', 'test2@example.com');
        
        RAISE NOTICE 'Insertados 2 clientes de prueba';
    END IF;
    
    IF warehouse_count = 0 THEN
        INSERT INTO warehouses (name, location) VALUES 
        ('Bodega Test', 'Ubicación Test');
        
        RAISE NOTICE 'Insertada 1 bodega de prueba';
    END IF;
END $$;

-- =============================================================================
-- PASO 7: PROBAR CONEXIÓN DIRECTA
-- =============================================================================
-- Estas consultas deberían funcionar si todo está bien configurado
SELECT 'PRUEBA CLIENTS' AS test, COUNT(*) as total FROM clients;
SELECT 'PRUEBA WAREHOUSES' AS test, COUNT(*) as total FROM warehouses;

-- =============================================================================
-- PASO 8: VERIFICAR CONFIGURACIÓN FINAL
-- =============================================================================
SELECT 
    'CONFIGURACIÓN FINAL' AS estado,
    (SELECT COUNT(*) FROM clients) as clientes,
    (SELECT COUNT(*) FROM warehouses) as bodegas,
    (SELECT COUNT(*) FROM equipment) as equipos,
    CASE 
        WHEN (SELECT COUNT(*) FROM clients) > 0 THEN 'OK'
        ELSE 'ERROR'
    END as status_clientes;

-- =============================================================================
-- INFORMACIÓN PARA DEBUG
-- =============================================================================
SELECT 'INFORMACIÓN DE DEBUG' AS info;

-- Verificar versión de PostgreSQL
SELECT version() as postgresql_version;

-- Verificar usuario actual
SELECT current_user as usuario_actual, session_user as usuario_sesion;

-- Verificar permisos en la tabla clients
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'clients';

SELECT 'DIAGNÓSTICO COMPLETADO - Revisa los resultados arriba' AS final_status;