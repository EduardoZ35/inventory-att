-- Script mínimo para insertar UNA factura sin fallar
-- Este script prueba diferentes estrategias hasta que una funcione

-- Estrategia 1: INSERT mínimo solo con columnas básicas
DO $$
BEGIN
    BEGIN
        INSERT INTO public.invoices (invoice_number, total, status) 
        VALUES ('MIN-001', 1000, 'pending');
        RAISE NOTICE '✅ Estrategia 1 exitosa: INSERT mínimo';
        RETURN;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Estrategia 1 falló: %', SQLERRM;
    END;
END $$;

-- Estrategia 2: INSERT con fechas
DO $$
BEGIN
    BEGIN
        INSERT INTO public.invoices (invoice_number, total, status, issued_at, due_date) 
        VALUES ('MIN-002', 1000, 'pending', CURRENT_DATE, CURRENT_DATE + 30);
        RAISE NOTICE '✅ Estrategia 2 exitosa: Con fechas';
        RETURN;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Estrategia 2 falló: %', SQLERRM;
    END;
END $$;

-- Estrategia 3: INSERT con campos financieros en NULL
DO $$
BEGIN
    BEGIN
        INSERT INTO public.invoices (
            invoice_number, 
            total, 
            total_net,
            subtotal,
            tax,
            status, 
            issued_at, 
            due_date,
            client_id,
            provider_id
        ) 
        VALUES (
            'MIN-003', 
            1000, 
            NULL,
            NULL,
            NULL,
            'pending', 
            CURRENT_DATE, 
            CURRENT_DATE + 30,
            NULL,
            NULL
        );
        RAISE NOTICE '✅ Estrategia 3 exitosa: Campos en NULL';
        RETURN;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Estrategia 3 falló: %', SQLERRM;
    END;
END $$;

-- Estrategia 4: INSERT con todos los campos financieros
DO $$
BEGIN
    BEGIN
        INSERT INTO public.invoices (
            invoice_number, 
            total, 
            total_net,
            subtotal,
            tax,
            status, 
            issued_at,
            issue_date, 
            due_date,
            client_id,
            provider_id
        ) 
        VALUES (
            'MIN-004', 
            1000, 
            1000,
            1000,
            0,
            'pending', 
            CURRENT_DATE,
            CURRENT_DATE, 
            CURRENT_DATE + 30,
            NULL,
            NULL
        );
        RAISE NOTICE '✅ Estrategia 4 exitosa: Todos los campos';
        RETURN;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Estrategia 4 falló: %', SQLERRM;
    END;
END $$;

-- Verificar resultado
SELECT 'Resultado final:' as info;
SELECT COUNT(*) as total_registros FROM public.invoices;
SELECT * FROM public.invoices ORDER BY id DESC LIMIT 1;


