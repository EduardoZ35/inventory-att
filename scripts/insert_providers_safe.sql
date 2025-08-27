-- Script seguro para insertar proveedores detectando automáticamente columnas obligatorias

-- 1. Primero mostrar estructura para diagnóstico
SELECT 'ESTRUCTURA DE PROVIDERS:' as info;
SELECT 
    column_name,
    data_type,
    CASE WHEN is_nullable = 'NO' THEN '🔴 OBLIGATORIA' ELSE '🟢 Opcional' END as estado,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'providers'
ORDER BY ordinal_position;

-- 2. Insertar proveedores usando INSERT dinámico
DO $$
DECLARE
    has_organization BOOLEAN;
    has_name BOOLEAN;
    has_rut BOOLEAN;
    insert_query TEXT;
    values_query TEXT;
BEGIN
    -- Verificar qué columnas existen
    SELECT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'providers' 
                   AND column_name = 'organization') INTO has_organization;
                   
    SELECT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'providers' 
                   AND column_name = 'name') INTO has_name;
                   
    SELECT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'providers' 
                   AND column_name = 'rut') INTO has_rut;
    
    -- Construir INSERT dinámicamente
    insert_query := 'INSERT INTO public.providers (';
    values_query := ' VALUES ';
    
    -- Columnas básicas
    IF has_name THEN
        insert_query := insert_query || 'name, ';
    END IF;
    
    IF has_rut THEN
        insert_query := insert_query || 'rut, ';
    END IF;
    
    IF has_organization THEN
        insert_query := insert_query || 'organization, ';
    END IF;
    
    -- Agregar columnas opcionales comunes
    insert_query := insert_query || 'address, phone, email';
    insert_query := insert_query || ')';
    
    -- Proveedor 1
    values_query := values_query || '(';
    IF has_name THEN
        values_query := values_query || '''Proveedor Tech SpA'', ';
    END IF;
    IF has_rut THEN
        values_query := values_query || '''12.345.678-9'', ';
    END IF;
    IF has_organization THEN
        values_query := values_query || '''Proveedor Tech SpA'', ';
    END IF;
    values_query := values_query || '''Av. Providencia 1234, Santiago'', ''+56 2 2234 5678'', ''ventas@proveedortech.cl''), ';
    
    -- Proveedor 2
    values_query := values_query || '(';
    IF has_name THEN
        values_query := values_query || '''Electrónica Chile Ltda.'', ';
    END IF;
    IF has_rut THEN
        values_query := values_query || '''98.765.432-1'', ';
    END IF;
    IF has_organization THEN
        values_query := values_query || '''Electrónica Chile Ltda.'', ';
    END IF;
    values_query := values_query || '''Calle Los Electrónicos 567, Valparaíso'', ''+56 32 123 4567'', ''contacto@electronicachile.cl''), ';
    
    -- Proveedor 3
    values_query := values_query || '(';
    IF has_name THEN
        values_query := values_query || '''Suministros Industriales SA'', ';
    END IF;
    IF has_rut THEN
        values_query := values_query || '''11.222.333-K'', ';
    END IF;
    IF has_organization THEN
        values_query := values_query || '''Suministros Industriales SA'', ';
    END IF;
    values_query := values_query || '''Av. Industrial 890, Concepción'', ''+56 41 987 6543'', ''compras@suministros.cl'')';
    
    -- Agregar ON CONFLICT si hay RUT
    IF has_rut THEN
        values_query := values_query || ' ON CONFLICT (rut) DO NOTHING';
    END IF;
    
    -- Ejecutar
    EXECUTE insert_query || values_query;
    
    RAISE NOTICE 'Proveedores insertados exitosamente';
    RAISE NOTICE 'Query ejecutado: %', insert_query || values_query;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error insertando proveedores: %', SQLERRM;
END $$;

-- 3. Mostrar resultado
SELECT 'PROVEEDORES INSERTADOS:' as resultado;
SELECT 
    id,
    COALESCE(name, 'Sin nombre') as nombre,
    COALESCE(rut, 'Sin RUT') as rut,
    COALESCE(organization, 'Sin organización') as organizacion,
    address
FROM public.providers 
ORDER BY id;

SELECT 'TOTAL PROVEEDORES:' as info;
SELECT COUNT(*) as total FROM public.providers;

