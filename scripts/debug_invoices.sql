-- Script de diagnóstico para entender el estado actual de la tabla invoices

-- 1. Verificar si la tabla existe
SELECT 'Verificando existencia de tabla invoices...' as paso;

SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') 
        THEN '✅ Tabla invoices EXISTE' 
        ELSE '❌ Tabla invoices NO EXISTE' 
    END as estado_tabla;

-- 2. Mostrar estructura completa de la tabla
SELECT 'Estructura de la tabla invoices:' as info;

SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default,
    CASE WHEN is_nullable = 'NO' THEN '🔴 OBLIGATORIA' ELSE '🟢 Opcional' END as obligatoriedad
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY ordinal_position;

-- 3. Verificar constraints y foreign keys
SELECT 'Foreign keys y constraints:' as info;

SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    CASE 
        WHEN tc.constraint_type = 'FOREIGN KEY' THEN 
            'FK hacia: ' || ccu.table_name || '.' || ccu.column_name
        ELSE tc.constraint_type
    END as detalle
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'invoices'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 4. Contar registros actuales
SELECT 'Registros en la tabla:' as info;

SELECT COUNT(*) as total_registros FROM public.invoices;

-- 5. Mostrar últimos registros
SELECT 'Últimos registros (si los hay):' as info;

SELECT * FROM public.invoices ORDER BY id DESC LIMIT 5;

-- 6. Verificar tablas relacionadas
SELECT 'Tablas relacionadas:' as info;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'clients' THEN 
            (SELECT COUNT(*)::TEXT || ' registros' FROM public.clients)
        WHEN table_name = 'providers' THEN 
            (SELECT COUNT(*)::TEXT || ' registros' FROM public.providers)
        ELSE 'Sin datos'
    END as contenido
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'providers', 'users', 'profiles')
ORDER BY table_name;

-- 7. Intentar INSERT simple para diagnosticar problema
SELECT 'Intentando INSERT de prueba...' as info;

DO $$
BEGIN
    BEGIN
        INSERT INTO public.invoices (invoice_number, total, status, issued_at, due_date) 
        VALUES ('TEST-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24:MI:SS'), 100, 'pending', CURRENT_DATE, CURRENT_DATE + 1);
        
        RAISE NOTICE '✅ INSERT simple exitoso';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ INSERT falló: %', SQLERRM;
    END;
END $$;

-- 8. Verificar resultado final
SELECT 'Estado final:' as info;
SELECT COUNT(*) as registros_totales FROM public.invoices;
SELECT * FROM public.invoices ORDER BY id DESC LIMIT 3;




