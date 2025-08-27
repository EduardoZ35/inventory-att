-- Adaptar sistema de compras usando las tablas existentes

-- 1. Verificar y adaptar tabla providers existente
DO $$
BEGIN
    -- Agregar columnas que podrían faltar en providers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'providers' AND column_name = 'name') THEN
        ALTER TABLE public.providers ADD COLUMN name VARCHAR(255);
        RAISE NOTICE 'Agregada columna name a providers';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'providers' AND column_name = 'rut') THEN
        ALTER TABLE public.providers ADD COLUMN rut VARCHAR(20) UNIQUE;
        RAISE NOTICE 'Agregada columna rut a providers';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'providers' AND column_name = 'address') THEN
        ALTER TABLE public.providers ADD COLUMN address TEXT;
        RAISE NOTICE 'Agregada columna address a providers';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'providers' AND column_name = 'phone') THEN
        ALTER TABLE public.providers ADD COLUMN phone VARCHAR(50);
        RAISE NOTICE 'Agregada columna phone a providers';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'providers' AND column_name = 'email') THEN
        ALTER TABLE public.providers ADD COLUMN email VARCHAR(255);
        RAISE NOTICE 'Agregada columna email a providers';
    END IF;
END $$;

-- 2. Eliminar tabla invoices problemática y crear purchase_invoices
DROP TABLE IF EXISTS public.invoices CASCADE;

CREATE TABLE IF NOT EXISTS public.purchase_invoices (
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
        FOREIGN KEY (provider_id) REFERENCES public.providers(id)
);

-- 3. Crear tabla de items de facturas de compra
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

-- 4. Habilitar RLS
ALTER TABLE public.purchase_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_invoice_items ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas básicas
DROP POLICY IF EXISTS "Enable read access for purchase_invoices" ON public.purchase_invoices;
CREATE POLICY "Enable read access for purchase_invoices" ON public.purchase_invoices FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for purchase_invoices" ON public.purchase_invoices;
CREATE POLICY "Enable insert for purchase_invoices" ON public.purchase_invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for purchase_invoices" ON public.purchase_invoices;
CREATE POLICY "Enable update for purchase_invoices" ON public.purchase_invoices FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Enable read access for purchase_items" ON public.purchase_invoice_items;
CREATE POLICY "Enable read access for purchase_items" ON public.purchase_invoice_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Enable insert for purchase_items" ON public.purchase_invoice_items;
CREATE POLICY "Enable insert for purchase_items" ON public.purchase_invoice_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 6. Insertar proveedores usando INSERT dinámico
DO $$
DECLARE
    provider1_id BIGINT;
    provider2_id BIGINT;
    invoice1_id BIGINT;
    net_value DECIMAL(12,2);
    tax_value DECIMAL(12,2);
    total_value DECIMAL(12,2);
BEGIN
    -- Insertar proveedores de ejemplo adaptándose a la estructura existente
    INSERT INTO public.providers (name, rut, address, phone, email) VALUES
    ('Proveedor Tech SpA', '12.345.678-9', 'Av. Providencia 1234, Santiago', '+56 2 2234 5678', 'ventas@proveedortech.cl'),
    ('Electrónica Chile Ltda.', '98.765.432-1', 'Calle Los Electrónicos 567, Valparaíso', '+56 32 123 4567', 'contacto@electronicachile.cl')
    ON CONFLICT (rut) DO UPDATE SET 
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email;
    
    -- Obtener ID del primer proveedor
    SELECT id INTO provider1_id FROM public.providers WHERE rut = '12.345.678-9' LIMIT 1;
    
    -- Crear factura de ejemplo
    net_value := 500000.00;
    tax_value := net_value * 0.19;  -- IVA 19%
    total_value := net_value + tax_value;
    
    INSERT INTO public.purchase_invoices (
        invoice_number, provider_id, purchase_date, 
        net_amount, tax_amount, total_amount, description
    ) VALUES (
        'FC-001-2025', provider1_id, CURRENT_DATE - INTERVAL '2 days',
        net_value, tax_value, total_value,
        'Compra de equipos de cómputo para inventario'
    ) RETURNING id INTO invoice1_id;
    
    -- Insertar items de la factura
    INSERT INTO public.purchase_invoice_items (purchase_invoice_id, product_name, quantity, unit_price, total_price) VALUES
    (invoice1_id, 'Laptop Dell Inspiron 15', 2, 250000.00, 500000.00);
    
    RAISE NOTICE 'Sistema de facturas de compra adaptado exitosamente';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error adaptando sistema: %', SQLERRM;
END $$;

-- 7. Mostrar resultado
SELECT 'PROVEEDORES ACTUALIZADOS:' as seccion;
SELECT id, name, rut, address FROM public.providers WHERE name IS NOT NULL ORDER BY id;

SELECT 'FACTURAS DE COMPRA CREADAS:' as seccion;
SELECT 
    pi.id,
    pi.invoice_number as "Nº Factura",
    p.name as "Proveedor",
    pi.purchase_date as "Fecha",
    pi.net_amount as "Neto",
    pi.tax_amount as "IVA (19%)",
    pi.total_amount as "Total"
FROM public.purchase_invoices pi
JOIN public.providers p ON pi.provider_id = p.id;

SELECT '✅ Sistema adaptado - la tabla invoices se eliminó y se creó purchase_invoices' as resultado_final;

