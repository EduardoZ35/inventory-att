-- INSERT DEFINITIVO agregando todos los campos obligatorios detectados paso a paso

SELECT 'Insertando factura con TODOS los campos obligatorios detectados...' as paso;

-- INSERT con TODOS los campos obligatorios encontrados hasta ahora
INSERT INTO public.invoices (
    invoice_number,    -- ✅ OBLIGATORIO #1 - confirmado
    issue_date,        -- ✅ OBLIGATORIO #2 - detectado
    total_net          -- ✅ OBLIGATORIO #3 - recién detectado
) VALUES (
    'FACTURA-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),
    CURRENT_DATE,
    125000.00          -- Valor monetario para total_net
);

-- Si falla, probar agregando más campos comunes
DO $$
BEGIN
    -- Verificar si la inserción anterior funcionó
    IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE invoice_number LIKE 'FACTURA-2025%' AND total_net = 125000.00) THEN
        -- Si no funcionó, intentar con más campos
        INSERT INTO public.invoices (
            invoice_number,
            issue_date,
            total_net,
            total,          -- Posible campo obligatorio adicional
            subtotal        -- Posible campo obligatorio adicional
        ) VALUES (
            'FACTURA-ALT-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),
            CURRENT_DATE,
            125000.00,
            125000.00,      -- Total igual a total_net
            125000.00       -- Subtotal igual a total_net
        );
        RAISE NOTICE 'Insertado con campos adicionales';
    ELSE
        RAISE NOTICE 'Primera inserción exitosa';
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Si todavía falla, agregar más campos
    BEGIN
        INSERT INTO public.invoices (
            invoice_number,
            issue_date,
            total_net,
            total,
            subtotal,
            tax             -- Campo de impuestos
        ) VALUES (
            'FACTURA-FINAL-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),
            CURRENT_DATE,
            125000.00,
            125000.00,
            125000.00,
            0.00            -- Sin impuestos
        );
        RAISE NOTICE 'Insertado con campos de impuestos';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Error final: %', SQLERRM;
    END;
END $$;

-- Verificar resultado final
SELECT '=== RESULTADO FINAL ===' as seccion;

SELECT COUNT(*) as total_facturas FROM public.invoices;

SELECT 
    'Últimas facturas creadas:' as info,
    id,
    invoice_number,
    issue_date,
    total_net,
    total,
    status
FROM public.invoices 
WHERE invoice_number LIKE 'FACTURA%'
ORDER BY id DESC 
LIMIT 3;

-- Mensaje final
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '🎉 ¡ÉXITO! Ve a /invoices en tu app - ya debería funcionar'
        ELSE '❌ Necesitamos encontrar más campos obligatorios'
    END as estado_final
FROM public.invoices 
WHERE invoice_number LIKE 'FACTURA%';


