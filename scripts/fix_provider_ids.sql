-- Arreglar los provider_ids en las facturas para que coincidan con los providers existentes

-- 1. Ver qué providers existen realmente
SELECT 'PROVIDERS EXISTENTES:' as info;
SELECT id, name, rut FROM public.providers ORDER BY id;

-- 2. Ver qué provider_ids tienen las facturas
SELECT 'PROVIDER_IDS EN FACTURAS:' as info;
SELECT id, invoice_number, provider_id FROM public.purchase_invoices ORDER BY id;

-- 3. Actualizar las facturas para usar provider_ids que existen
-- Asumiendo que los providers tienen ids 6, 7, 8 como mostraste antes

UPDATE public.purchase_invoices 
SET provider_id = 6 
WHERE id = 1;

UPDATE public.purchase_invoices 
SET provider_id = 7 
WHERE id = 2;

UPDATE public.purchase_invoices 
SET provider_id = 8 
WHERE id = 3;

-- 4. Verificar que ahora sí haga JOIN
SELECT 'VERIFICAR JOIN:' as info;
SELECT 
    pi.id,
    pi.invoice_number,
    pi.provider_id,
    p.name as provider_name,
    p.rut as provider_rut
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.id;




