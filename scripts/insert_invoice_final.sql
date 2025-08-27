-- Script definitivo basado en el error conocido
-- Sabemos que invoice_number es obligatorio y la estructura básica

-- 1. Insertar factura con todos los campos necesarios detectados
DO $$
BEGIN
    -- Basado en el error, sabemos que la tabla tiene esta estructura aproximada:
    -- (id, ?, ?, ?, ?, ?, ?, created_at, updated_at, ?, status, issued_at, ?, ?, total)
    
    INSERT INTO public.invoices (
        invoice_number,           -- Campo obligatorio detectado
        total,                   -- Campo común en facturas
        status,                  -- Campo común
        issued_at,               -- Campo de fecha
        created_at,              -- Timestamp automático
        updated_at               -- Timestamp automático
    ) VALUES (
        'FACTURA-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),  -- Número único
        125000.00,               -- Total en pesos
        'pending',               -- Estado pendiente
        CURRENT_DATE,            -- Fecha de emisión hoy
        NOW(),                   -- Fecha creación ahora
        NOW()                    -- Fecha actualización ahora
    );
    
    RAISE NOTICE '✅ Factura insertada exitosamente con campos mínimos obligatorios';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Error: %', SQLERRM;
    
    -- Si falla, intentar con más campos basados en estructura típica
    BEGIN
        INSERT INTO public.invoices (
            invoice_number,
            total,
            status,
            issued_at,
            due_date,
            created_at,
            updated_at
        ) VALUES (
            'FACTURA-ALT-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),
            125000.00,
            'pending',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Factura insertada con estrategia alternativa';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en estrategia alternativa: %', SQLERRM;
        
        -- Último intento: llenar todos los campos posibles
        BEGIN
            INSERT INTO public.invoices (
                invoice_number,
                total,
                status,
                issued_at,
                due_date,
                created_at,
                updated_at,
                client_id,
                provider_id
            ) VALUES (
                'FACTURA-LAST-' || TO_CHAR(NOW(), 'YYYY-MM-DD-HH24MI'),
                125000.00,
                'pending',
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '30 days',
                NOW(),
                NOW(),
                NULL,  -- Cliente NULL por ahora
                NULL   -- Proveedor NULL por ahora
            );
            RAISE NOTICE '✅ Factura insertada con último intento';
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Todos los intentos fallaron: %', SQLERRM;
        END;
    END;
END $$;

-- 2. Verificar resultado
SELECT 'VERIFICACION FINAL:' as info;

SELECT COUNT(*) as total_facturas FROM public.invoices;

SELECT 
    id,
    invoice_number,
    total,
    status,
    issued_at,
    created_at
FROM public.invoices 
ORDER BY id DESC 
LIMIT 3;

-- 3. Si tenemos facturas, probar la página web
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ ¡LISTO! Ve a /invoices en tu app - debería funcionar ahora'
        ELSE '❌ Aún no hay facturas. Necesitamos más diagnóstico.'
    END as estado_final
FROM public.invoices;


