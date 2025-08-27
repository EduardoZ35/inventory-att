-- Script para insertar SOLO facturas (los proveedores ya existen)

-- 1. Verificar proveedores existentes
SELECT 'PROVEEDORES DISPONIBLES:' as info;
SELECT id, name, rut, organization FROM public.providers ORDER BY id;

-- 2. Insertar facturas usando proveedores existentes
DO $$
DECLARE
    provider1_id BIGINT;
    provider2_id BIGINT;
    provider3_id BIGINT;
    invoice1_id BIGINT;
    invoice2_id BIGINT;
    invoice3_id BIGINT;
BEGIN
    -- Obtener IDs de los primeros 3 proveedores disponibles
    SELECT id INTO provider1_id FROM public.providers ORDER BY id LIMIT 1;
    SELECT id INTO provider2_id FROM public.providers WHERE id > provider1_id ORDER BY id LIMIT 1;
    SELECT id INTO provider3_id FROM public.providers WHERE id > provider2_id ORDER BY id LIMIT 1;
    
    RAISE NOTICE 'Usando proveedores: %, %, %', provider1_id, provider2_id, provider3_id;
    
    -- Factura 1: Compra de equipos (neto: $500,000)
    IF provider1_id IS NOT NULL THEN
        INSERT INTO public.purchase_invoices (
            invoice_number, provider_id, purchase_date, 
            net_amount, tax_amount, total_amount, description
        ) VALUES (
            'FC-001-2025', provider1_id, CURRENT_DATE - INTERVAL '5 days',
            500000.00, 95000.00, 595000.00,
            'Compra de equipos de cómputo para inventario'
        ) RETURNING id INTO invoice1_id;
        
        -- Items de la factura 1
        INSERT INTO public.purchase_invoice_items (purchase_invoice_id, product_name, quantity, unit_price, total_price) VALUES
        (invoice1_id, 'Laptop Dell Inspiron 15', 2, 250000.00, 500000.00);
        
        RAISE NOTICE 'Factura 1 creada: FC-001-2025 con ID %', invoice1_id;
    END IF;
    
    -- Factura 2: Compra de componentes (neto: $300,000)
    IF provider2_id IS NOT NULL THEN
        INSERT INTO public.purchase_invoices (
            invoice_number, provider_id, purchase_date,
            net_amount, tax_amount, total_amount, description
        ) VALUES (
            'ELC-2025-001', provider2_id, CURRENT_DATE - INTERVAL '2 days',
            300000.00, 57000.00, 357000.00,
            'Compra de componentes electrónicos'
        ) RETURNING id INTO invoice2_id;
        
        -- Items de la factura 2
        INSERT INTO public.purchase_invoice_items (purchase_invoice_id, product_name, quantity, unit_price, total_price) VALUES
        (invoice2_id, 'Resistencias 1K Ohm (pack 100)', 5, 20000.00, 100000.00),
        (invoice2_id, 'Capacitores 10uF (pack 50)', 4, 25000.00, 100000.00),
        (invoice2_id, 'Arduino Uno R3', 5, 20000.00, 100000.00);
        
        RAISE NOTICE 'Factura 2 creada: ELC-2025-001 con ID %', invoice2_id;
    END IF;
    
    -- Factura 3: Compra de oficina (neto: $150,000)
    IF provider3_id IS NOT NULL THEN
        INSERT INTO public.purchase_invoices (
            invoice_number, provider_id, purchase_date,
            net_amount, tax_amount, total_amount, description
        ) VALUES (
            'SUM-2025-001', provider3_id, CURRENT_DATE - INTERVAL '1 day',
            150000.00, 28500.00, 178500.00,
            'Suministros de oficina y materiales'
        ) RETURNING id INTO invoice3_id;
        
        -- Items de la factura 3
        INSERT INTO public.purchase_invoice_items (purchase_invoice_id, product_name, quantity, unit_price, total_price) VALUES
        (invoice3_id, 'Papel A4 (resma)', 10, 5000.00, 50000.00),
        (invoice3_id, 'Tóner impresora HP', 2, 35000.00, 70000.00),
        (invoice3_id, 'Cables USB variados', 6, 5000.00, 30000.00);
        
        RAISE NOTICE 'Factura 3 creada: SUM-2025-001 con ID %', invoice3_id;
    END IF;
    
    RAISE NOTICE 'Facturas de ejemplo insertadas exitosamente';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error insertando facturas: %', SQLERRM;
END $$;

-- 3. Mostrar resumen final
SELECT 'RESUMEN FINAL:' as seccion;

SELECT 
    COUNT(*) as total_proveedores,
    'proveedores registrados' as descripcion
FROM public.providers;

SELECT 
    COUNT(*) as total_facturas,
    'facturas de compra registradas' as descripcion
FROM public.purchase_invoices;

SELECT 
    COUNT(*) as total_items,
    'items de facturas registrados' as descripcion
FROM public.purchase_invoice_items;

SELECT 
    COALESCE(SUM(total_amount), 0) as monto_total_compras,
    'pesos chilenos en compras' as descripcion
FROM public.purchase_invoices;

-- 4. Mostrar facturas creadas
SELECT 'FACTURAS CREADAS:' as seccion;
SELECT 
    pi.id,
    pi.invoice_number as "Nº Factura",
    p.name as "Proveedor",
    pi.purchase_date as "Fecha",
    pi.net_amount as "Neto",
    pi.tax_amount as "IVA",
    pi.total_amount as "Total",
    pi.description as "Descripción"
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.purchase_date DESC;

-- 5. Mostrar items comprados
SELECT 'ITEMS COMPRADOS:' as seccion;
SELECT 
    pii.product_name as "Producto",
    pii.quantity as "Cantidad",
    pii.unit_price as "Precio Unit.",
    pii.total_price as "Total Item",
    pi.invoice_number as "Factura"
FROM public.purchase_invoice_items pii
LEFT JOIN public.purchase_invoices pi ON pii.purchase_invoice_id = pi.id
ORDER BY pi.purchase_date DESC, pii.product_name;


