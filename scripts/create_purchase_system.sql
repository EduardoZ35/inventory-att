-- Sistema de Facturas de Compra (Purchase Invoices)
-- Para registrar compras a proveedores con IVA 19%

-- 1. Crear tabla de Proveedores
CREATE TABLE IF NOT EXISTS public.providers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    rut VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Recrear tabla de facturas como FACTURAS DE COMPRA
DROP TABLE IF EXISTS public.invoices CASCADE;

CREATE TABLE public.purchase_invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL,           -- Número de factura del proveedor
    provider_id BIGINT NOT NULL,                    -- Proveedor (obligatorio)
    purchase_date DATE NOT NULL,                    -- Fecha de compra
    net_amount DECIMAL(12,2) NOT NULL DEFAULT 0,    -- Valor neto (sin IVA)
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,    -- IVA (19%)
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,  -- Total con IVA
    description TEXT,                               -- Descripción de la compra
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key hacia proveedores
    CONSTRAINT fk_purchase_invoice_provider 
        FOREIGN KEY (provider_id) REFERENCES public.providers(id),
    
    -- Constraint para número de factura único por proveedor
    CONSTRAINT unique_invoice_per_provider 
        UNIQUE (provider_id, invoice_number)
);

-- 3. Crear tabla de items de factura de compra (productos comprados)
CREATE TABLE IF NOT EXISTS public.purchase_invoice_items (
    id BIGSERIAL PRIMARY KEY,
    purchase_invoice_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,             -- Nombre del producto comprado
    quantity INTEGER NOT NULL DEFAULT 1,           -- Cantidad comprada
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0,   -- Precio unitario (neto)
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0,  -- Total del item (cantidad × precio)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Foreign key hacia factura de compra
    CONSTRAINT fk_purchase_item_invoice 
        FOREIGN KEY (purchase_invoice_id) REFERENCES public.purchase_invoices(id) ON DELETE CASCADE
);

-- 4. Habilitar RLS en todas las tablas
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_items ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas básicas para providers
DROP POLICY IF EXISTS "Enable read access for providers" ON public.providers;
CREATE POLICY "Enable read access for providers" ON public.providers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for providers" ON public.providers;
CREATE POLICY "Enable insert for providers" ON public.providers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for providers" ON public.providers;
CREATE POLICY "Enable update for providers" ON public.providers FOR UPDATE USING (auth.role() = 'authenticated');

-- 6. Crear políticas básicas para purchase_invoices
DROP POLICY IF EXISTS "Enable read access for purchase_invoices" ON public.purchase_invoices;
CREATE POLICY "Enable read access for purchase_invoices" ON public.purchase_invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for purchase_invoices" ON public.purchase_invoices;
CREATE POLICY "Enable insert for purchase_invoices" ON public.purchase_invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for purchase_invoices" ON public.purchase_invoices;
CREATE POLICY "Enable update for purchase_invoices" ON public.purchase_invoices FOR UPDATE USING (auth.role() = 'authenticated');

-- 7. Crear políticas básicas para purchase_invoice_items  
DROP POLICY IF EXISTS "Enable read access for purchase_items" ON public.purchase_invoice_items;
CREATE POLICY "Enable read access for purchase_items" ON public.purchase_invoice_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for purchase_items" ON public.purchase_invoice_items;
CREATE POLICY "Enable insert for purchase_items" ON public.purchase_invoice_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 8. Insertar proveedores de ejemplo
INSERT INTO public.providers (name, rut, address, phone, email) VALUES
('Proveedor Tech SpA', '12.345.678-9', 'Av. Providencia 1234, Santiago', '+56 2 2234 5678', 'ventas@proveedortech.cl'),
('Electrónica Chile Ltda.', '98.765.432-1', 'Calle Los Electrónicos 567, Valparaíso', '+56 32 123 4567', 'contacto@electronicachile.cl'),
('Suministros Industriales SA', '11.222.333-K', 'Av. Industrial 890, Concepción', '+56 41 987 6543', 'compras@suministros.cl')
ON CONFLICT (rut) DO NOTHING;

-- 9. Insertar facturas de compra de ejemplo (con IVA 19%)
DO $$
DECLARE
    provider1_id BIGINT;
    provider2_id BIGINT;
    invoice1_id BIGINT;
    invoice2_id BIGINT;
    net_value DECIMAL(12,2);
    tax_value DECIMAL(12,2);
    total_value DECIMAL(12,2);
BEGIN
    -- Obtener IDs de proveedores
    SELECT id INTO provider1_id FROM public.providers WHERE rut = '12.345.678-9';
    SELECT id INTO provider2_id FROM public.providers WHERE rut = '98.765.432-1';
    
    -- Factura 1: Compra de equipos (neto: $500,000)
    net_value := 500000.00;
    tax_value := net_value * 0.19;  -- IVA 19%
    total_value := net_value + tax_value;
    
    INSERT INTO public.purchase_invoices (
        invoice_number, provider_id, purchase_date, 
        net_amount, tax_amount, total_amount, description
    ) VALUES (
        'FC-001-2025', provider1_id, CURRENT_DATE - INTERVAL '5 days',
        net_value, tax_value, total_value,
        'Compra de equipos de cómputo y accesorios'
    ) RETURNING id INTO invoice1_id;
    
    -- Items de la factura 1
    INSERT INTO public.purchase_invoice_items (purchase_invoice_id, product_name, quantity, unit_price, total_price) VALUES
    (invoice1_id, 'Laptop Dell Inspiron 15', 2, 250000.00, 500000.00);
    
    -- Factura 2: Compra de componentes (neto: $300,000)
    net_value := 300000.00;
    tax_value := net_value * 0.19;
    total_value := net_value + tax_value;
    
    INSERT INTO public.purchase_invoices (
        invoice_number, provider_id, purchase_date,
        net_amount, tax_amount, total_amount, description
    ) VALUES (
        'ELC-2025-001', provider2_id, CURRENT_DATE - INTERVAL '2 days',
        net_value, tax_value, total_value,
        'Compra de componentes electrónicos varios'
    ) RETURNING id INTO invoice2_id;
    
    -- Items de la factura 2
    INSERT INTO public.purchase_invoice_items (purchase_invoice_id, product_name, quantity, unit_price, total_price) VALUES
    (invoice2_id, 'Resistencias 1K Ohm', 100, 500.00, 50000.00),
    (invoice2_id, 'Capacitores 10uF', 50, 1000.00, 50000.00),
    (invoice2_id, 'Arduino Uno R3', 10, 20000.00, 200000.00);
    
    RAISE NOTICE 'Sistema de facturas de compra creado exitosamente';
    RAISE NOTICE 'Proveedores insertados: %', (SELECT COUNT(*) FROM public.providers);
    RAISE NOTICE 'Facturas de compra insertadas: %', (SELECT COUNT(*) FROM public.purchase_invoices);
    RAISE NOTICE 'Items de facturas insertados: %', (SELECT COUNT(*) FROM public.purchase_invoice_items);
END $$;

-- 10. Mostrar resumen del sistema creado
SELECT 'PROVEEDORES REGISTRADOS:' as seccion;
SELECT id, name, rut, address FROM public.providers ORDER BY name;

SELECT 'FACTURAS DE COMPRA:' as seccion;
SELECT 
    pi.id,
    pi.invoice_number as "Nº Factura",
    p.name as "Proveedor",
    pi.purchase_date as "Fecha",
    pi.net_amount as "Neto",
    pi.tax_amount as "IVA",
    pi.total_amount as "Total",
    pi.description
FROM public.purchase_invoices pi
JOIN public.providers p ON pi.provider_id = p.id
ORDER BY pi.purchase_date DESC;

SELECT 'ITEMS COMPRADOS:' as seccion;
SELECT 
    pii.product_name as "Producto",
    pii.quantity as "Cantidad", 
    pii.unit_price as "Precio Unit.",
    pii.total_price as "Total",
    pi.invoice_number as "Factura"
FROM public.purchase_invoice_items pii
JOIN public.purchase_invoices pi ON pii.purchase_invoice_id = pi.id
ORDER BY pi.purchase_date DESC, pii.product_name;

SELECT '✅ Sistema de facturas de compra listo para usar' as resultado_final;

