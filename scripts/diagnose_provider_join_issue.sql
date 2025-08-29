-- Diagnóstico específico del problema de JOIN

-- 1. Ver qué provider_id tienen las facturas
SELECT 'PROVIDER_IDS EN FACTURAS:' as info;
SELECT id, invoice_number, provider_id 
FROM public.purchase_invoices 
ORDER BY id;

-- 2. Ver qué IDs tienen los proveedores
SELECT 'IDS EN TABLA PROVIDERS:' as info;
SELECT id, name, rut 
FROM public.providers 
ORDER BY id;

-- 3. Verificar si existe el provider_id 8
SELECT 'EXISTE PROVIDER ID 8?' as info;
SELECT COUNT(*) as existe, 
       CASE WHEN COUNT(*) > 0 THEN 'SI EXISTE' ELSE 'NO EXISTE' END as resultado
FROM public.providers 
WHERE id = 8;

-- 4. Hacer JOIN manual para ver qué pasa
SELECT 'JOIN MANUAL:' as info;
SELECT 
    pi.id as factura_id,
    pi.invoice_number,
    pi.provider_id,
    p.id as proveedor_encontrado_id,
    p.name as proveedor_name
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
WHERE pi.id = 3;

-- 5. Ver si hay problemas de tipos de datos
SELECT 'TIPOS DE DATOS:' as info;
SELECT 
    'purchase_invoices.provider_id' as tabla_columna,
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'purchase_invoices' 
  AND column_name = 'provider_id'
UNION ALL
SELECT 
    'providers.id' as tabla_columna,
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'providers' 
  AND column_name = 'id';




