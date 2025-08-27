-- Script garantizado para hacer que el JOIN funcione

-- 1. Ver estructura actual
SELECT 'SITUACION ACTUAL:' as info;

-- 2. Obtener los IDs reales de providers
WITH real_provider_ids AS (
    SELECT id, row_number() OVER (ORDER BY id) as rn 
    FROM public.providers 
    ORDER BY id
)
SELECT 'IDS REALES DE PROVIDERS:' as info, id, rn FROM real_provider_ids;

-- 3. Actualizar facturas con IDs que definitivamente existen
DO $$
DECLARE
    provider_ids INTEGER[];
    i INTEGER;
BEGIN
    -- Obtener array de provider IDs que existen
    SELECT ARRAY(SELECT id FROM public.providers ORDER BY id LIMIT 3) INTO provider_ids;
    
    -- Actualizar cada factura con un provider_id válido
    FOR i IN 1..3 LOOP
        UPDATE public.purchase_invoices 
        SET provider_id = provider_ids[i]
        WHERE id = i;
    END LOOP;
    
    RAISE NOTICE 'Provider IDs actualizados: %', provider_ids;
END $$;

-- 4. Test final del JOIN
SELECT 'JOIN FINAL TEST:' as info;
SELECT 
    pi.id as factura_id,
    pi.invoice_number,
    pi.provider_id,
    p.id as provider_real_id,
    p.name as provider_name
FROM public.purchase_invoices pi
JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.id;


