-- Verificar estado actual del sistema de facturas de compra

-- 1. Verificar proveedores
SELECT 'PROVEEDORES EXISTENTES:' as seccion;
SELECT 
    id, 
    name, 
    rut, 
    address,
    CASE WHEN name IS NULL THEN '❌ Sin nombre' ELSE '✅ Completo' END as estado
FROM public.providers 
ORDER BY id;

-- 2. Verificar facturas de compra
SELECT 'FACTURAS DE COMPRA EXISTENTES:' as seccion;
SELECT COUNT(*) as total_facturas FROM public.purchase_invoices;

-- 3. Si hay facturas, mostrarlas
SELECT 'DETALLE DE FACTURAS:' as seccion;
SELECT 
    pi.id,
    pi.invoice_number,
    pi.provider_id,
    p.name as proveedor_nombre,
    pi.net_amount,
    pi.tax_amount,
    pi.total_amount,
    pi.purchase_date
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.id;

-- 4. Verificar estructura de tablas
SELECT 'ESTRUCTURA PURCHASE_INVOICES:' as seccion;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'purchase_invoices'
ORDER BY ordinal_position;

SELECT 'ESTRUCTURA PROVIDERS:' as seccion;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'providers'
ORDER BY ordinal_position;


