-- Script verbose que muestra TODOS los resultados claramente

-- 1. Mostrar estructura de la tabla primero
SELECT 'ESTRUCTURA DE LA TABLA INVOICES:' as resultado;

SELECT 
    ordinal_position as pos,
    column_name as columna, 
    data_type as tipo,
    CASE WHEN is_nullable = 'NO' THEN 'OBLIGATORIA' ELSE 'opcional' END as requerida,
    column_default as valor_por_defecto
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY ordinal_position;

-- 2. Mostrar foreign keys
SELECT 'FOREIGN KEYS ACTIVAS:' as resultado;

SELECT 
    kcu.column_name as columna_local,
    ccu.table_name as tabla_referenciada,
    ccu.column_name as columna_referenciada
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'invoices'
AND tc.constraint_type = 'FOREIGN KEY';

-- 3. Verificar tablas relacionadas
SELECT 'CONTENIDO DE TABLAS RELACIONADAS:' as resultado;

SELECT 
    'clients' as tabla,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients')
        THEN (SELECT COUNT(*)::text FROM public.clients) || ' registros'
        ELSE 'NO EXISTE'
    END as estado
UNION ALL
SELECT 
    'providers' as tabla,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'providers')
        THEN (SELECT COUNT(*)::text FROM public.providers) || ' registros'
        ELSE 'NO EXISTE'
    END as estado;

-- 4. Test simple paso a paso
SELECT 'PROBANDO INSERT BÁSICO...' as resultado;

-- Test 1: Solo campos básicos
DO $$
BEGIN
    INSERT INTO public.invoices (invoice_number, total, status) 
    VALUES ('TEST-BASIC', 1000, 'pending');
EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.invoices DEFAULT VALUES; -- Esto debería mostrar qué columnas faltan
END $$;

-- Verificar si funcionó
SELECT 'RESULTADO TEST BÁSICO:' as info;
SELECT COUNT(*) as registros_despues_test_basico FROM public.invoices;

-- 5. Si falló, probar con más campos
DO $$
BEGIN
    -- Intentar con campos más comunes
    INSERT INTO public.invoices (
        invoice_number, 
        total, 
        total_net,
        subtotal,
        tax,
        status, 
        issued_at,
        issue_date,
        due_date
    ) VALUES (
        'TEST-FULL',
        1000,
        1000,
        1000,
        0,
        'pending',
        CURRENT_DATE,
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days'
    );
EXCEPTION WHEN OTHERS THEN
    -- Si falla, intentar INSERT vacío para ver estructura
    NULL;
END $$;

-- 6. Resultado final
SELECT 'ESTADO FINAL:' as info;
SELECT COUNT(*) as total_facturas FROM public.invoices;

-- 7. Mostrar facturas si existen
SELECT 'FACTURAS EXISTENTES:' as info;
SELECT * FROM public.invoices LIMIT 3;

-- 8. Test de INSERT mínimo que debe fallar para mostrar error
SELECT 'INTENTANDO INSERT VACÍO PARA VER ERROR:' as info;
DO $$
BEGIN
    INSERT INTO public.invoices DEFAULT VALUES;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Error esperado que nos dice qué falta: %', SQLERRM;
END $$;




