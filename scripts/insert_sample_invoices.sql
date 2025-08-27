-- Insertar facturas de compra de ejemplo

-- 1. Verificar e insertar proveedores (con organization y dni obligatorios)
INSERT INTO public.providers (name, rut, dni, address, phone, email, organization) VALUES
('Proveedor Tech SpA', '12.345.678-9', '12345678', 'Av. Providencia 1234, Santiago', '+56 2 2234 5678', 'ventas@proveedortech.cl', 'Proveedor Tech SpA'),
('Electrónica Chile Ltda.', '98.765.432-1', '98765432', 'Calle Los Electrónicos 567, Valparaíso', '+56 32 123 4567', 'contacto@electronicachile.cl', 'Electrónica Chile Ltda.'),
('Suministros Industriales SA', '11.222.333-K', '11222333', 'Av. Industrial 890, Concepción', '+56 41 987 6543', 'compras@suministros.cl', 'Suministros Industriales SA')
ON CONFLICT (rut) DO UPDATE SET 
    name = EXCLUDED.name,
    dni = EXCLUDED.dni,
    address = EXCLUDED.address,
    phone = EXCLUDED.phone,
    email = EXCLUDED.email,
    organization = EXCLUDED.organization;

-- 2. Insertar facturas de compra usando IDs de proveedores existentes
DO $$
DECLARE
    provider1_id BIGINT;
    provider2_id BIGINT;
    provider3_id BIGINT;
    invoice1_id BIGINT;
    invoice2_id BIGINT;
    invoice3_id BIGINT;
BEGIN
    -- Obtener IDs de proveedores (usar el primero disponible si hay problemas)
    SELECT id INTO provider1_id FROM public.providers WHERE rut = '12.345.678-9' OR name LIKE '%Tech%' LIMIT 1;
    SELECT id INTO provider2_id FROM public.providers WHERE rut = '98.765.432-1' OR name LIKE '%Electr%' LIMIT 1;
    SELECT id INTO provider3_id FROM public.providers WHERE rut = '11.222.333-K' OR name LIKE '%Suministro%' LIMIT 1;
    
    -- Si no hay proveedores específicos, usar los primeros 3 disponibles
    IF provider1_id IS NULL THEN
        SELECT id INTO provider1_id FROM public.providers ORDER BY id LIMIT 1;
    END IF;
    
    IF provider2_id IS NULL THEN
        SELECT id INTO provider2_id FROM public.providers WHERE id != provider1_id ORDER BY id LIMIT 1;
    END IF;
    
    IF provider3_id IS NULL THEN
        SELECT id INTO provider3_id FROM public.providers WHERE id NOT IN (provider1_id, provider2_id) ORDER BY id LIMIT 1;
    END IF;
    
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
    END IF;
    
    RAISE NOTICE 'Facturas de ejemplo insertadas exitosamente';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error insertando facturas: %', SQLERRM;
END $$;

-- 3. Mostrar resultado
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
    SUM(total_amount) as monto_total_compras,
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
    pi.total_amount as "Total"
FROM public.purchase_invoices pi
LEFT JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.purchase_date DESC;
