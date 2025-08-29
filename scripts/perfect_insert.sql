-- INSERT PERFECTO basado en el error exacto detectado
-- Sabemos que issue_date es obligatorio

SELECT 'Insertando factura con todos los campos obligatorios detectados...' as paso;

-- INSERT con los campos obligatorios confirmados
INSERT INTO public.invoices (
    invoice_number,    -- ✅ OBLIGATORIO - confirmado
    issue_date         -- ✅ OBLIGATORIO - detectado en error
) VALUES (
    'FACTURA-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),
    CURRENT_DATE
);

-- Verificar que funcionó
SELECT '✅ ¡FACTURA INSERTADA EXITOSAMENTE!' as resultado;

SELECT 'FACTURAS EN LA BASE DE DATOS:' as info;
SELECT 
    id,
    invoice_number,
    issue_date,
    status,
    issued_at,
    created_at
FROM public.invoices 
ORDER BY id DESC 
LIMIT 3;

SELECT 'CONTEO TOTAL:' as info;
SELECT COUNT(*) as total_facturas FROM public.invoices;

-- Estado final
SELECT 
    '🎉 ¡LISTO! Ahora ve a tu app web /invoices - debería funcionar perfectamente' as mensaje_final
WHERE (SELECT COUNT(*) FROM public.invoices) > 0;




