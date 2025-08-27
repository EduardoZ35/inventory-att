-- Script para obtener TODA la información de la tabla invoices de forma clara

-- 1. Mostrar TODA la estructura de la tabla
SELECT 'ESTRUCTURA COMPLETA DE INVOICES:' as seccion;

SELECT 
    ordinal_position as "#",
    column_name as "Columna",
    data_type as "Tipo", 
    character_maximum_length as "Longitud",
    CASE WHEN is_nullable = 'NO' THEN '🔴 OBLIGATORIA' ELSE '🟢 Opcional' END as "Estado",
    COALESCE(column_default, 'Sin default') as "Valor_por_defecto"
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY ordinal_position;

-- 2. Mostrar TODAS las restricciones
SELECT 'RESTRICCIONES Y CONSTRAINTS:' as seccion;

SELECT 
    tc.constraint_name as "Constraint",
    tc.constraint_type as "Tipo",
    kcu.column_name as "Columna",
    COALESCE(
        ccu.table_name || '.' || ccu.column_name,
        cc.check_clause,
        'N/A'
    ) as "Referencia_o_Regla"
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu 
    ON tc.constraint_name = ccu.constraint_name
LEFT JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public' 
AND tc.table_name = 'invoices'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Intentar INSERT con SOLO el campo obligatorio conocido
SELECT 'PROBANDO INSERT SOLO CON INVOICE_NUMBER:' as seccion;

-- Test insert más básico posible
INSERT INTO public.invoices (invoice_number) 
VALUES ('TEST-SIMPLE-' || EXTRACT(EPOCH FROM NOW())::bigint);

-- 4. Ver si funcionó
SELECT 'RESULTADO INMEDIATO:' as seccion;
SELECT COUNT(*) as facturas_totales FROM public.invoices;

-- 5. Si funcionó, mostrar la factura
SELECT 'FACTURAS CREADAS:' as seccion;
SELECT * FROM public.invoices ORDER BY id DESC LIMIT 1;

-- 6. Si no funcionó, este SELECT nos dirá por qué
SELECT 'DIAGNÓSTICO FINAL:' as seccion;
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ INSERT falló - la tabla sigue vacía'
        WHEN COUNT(*) > 0 THEN '✅ ¡INSERT exitoso! Hay ' || COUNT(*) || ' facturas'
    END as estado
FROM public.invoices;

