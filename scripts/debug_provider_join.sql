-- Debug del JOIN entre purchase_invoices y providers

-- 1. Verificar facturas
SELECT 'FACTURAS SIN JOIN:' as info;
SELECT id, invoice_number, provider_id, net_amount FROM public.purchase_invoices ORDER BY id;

-- 2. Verificar proveedores
SELECT 'PROVEEDORES:' as info;
SELECT id, name, rut, organization FROM public.providers ORDER BY id;

-- 3. Test del JOIN manual
SELECT 'JOIN MANUAL:' as info;
SELECT 
    pi.id,
    pi.invoice_number,
    pi.provider_id,
    p.id as provider_table_id,
    p.name as provider_name,
    p.rut as provider_rut
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.id;

-- 4. Test del query exacto que usa el frontend
SELECT 'QUERY FRONTEND:' as info;
SELECT 
    purchase_invoices.id,
    purchase_invoices.invoice_number,
    purchase_invoices.purchase_date,
    purchase_invoices.net_amount,
    purchase_invoices.tax_amount,
    purchase_invoices.total_amount,
    purchase_invoices.description,
    purchase_invoices.created_at,
    purchase_invoices.provider_id,
    json_build_object(
        'id', providers.id,
        'name', providers.name,
        'rut', providers.rut,
        'address', providers.address,
        'phone', providers.phone,
        'email', providers.email
    ) as provider
FROM public.purchase_invoices
LEFT JOIN public.providers ON purchase_invoices.provider_id = providers.id
ORDER BY purchase_invoices.purchase_date DESC;
