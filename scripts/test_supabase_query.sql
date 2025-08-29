-- Test exacto del query que usa Supabase

-- 1. Query que usa el frontend actualmente
SELECT 
    id,
    invoice_number,
    purchase_date,
    net_amount,
    tax_amount,
    total_amount,
    description,
    created_at,
    provider_id
FROM public.purchase_invoices
ORDER BY purchase_date DESC;

-- 2. Test simple del JOIN
SELECT 
    pi.id,
    pi.invoice_number,
    pi.provider_id,
    p.id as provider_real_id,
    p.name as provider_name,
    p.rut as provider_rut
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.purchase_date DESC;

-- 3. Ver estructura de providers
SELECT 'ESTRUCTURA PROVIDERS:' as info;
SELECT column_name FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'providers'
ORDER BY ordinal_position;

-- 4. Ver todos los providers
SELECT 'TODOS LOS PROVIDERS:' as info;
SELECT id, name, rut FROM public.providers ORDER BY id;




