-- Script para crear las tablas faltantes en Supabase
-- Ejecutar este script en el editor SQL de Supabase

-- Tabla de clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(250) NOT NULL UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de bodegas
CREATE TABLE IF NOT EXISTS public.warehouses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    capacity INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de facturas
CREATE TABLE IF NOT EXISTS public.invoices (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    issued_at DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de items de factura (opcional, para futuras mejoras)
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_instance_id BIGINT,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para clientes
CREATE POLICY "Enable read access for all users" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.clients FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.clients FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.clients FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de seguridad para bodegas
CREATE POLICY "Enable read access for all users" ON public.warehouses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.warehouses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.warehouses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.warehouses FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de seguridad para facturas
CREATE POLICY "Enable read access for all users" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.invoices FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.invoices FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de seguridad para items de factura
CREATE POLICY "Enable read access for all users" ON public.invoice_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON public.invoice_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON public.invoice_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON public.invoice_items FOR DELETE USING (auth.role() = 'authenticated');

-- Crear funciones para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.warehouses
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insertar algunos datos de ejemplo (opcional)
-- Solo si las tablas se crearon exitosamente
DO $$
BEGIN
    -- Verificar que la tabla clients tiene las columnas necesarias
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'clients' 
        AND column_name = 'name'
    ) THEN
        INSERT INTO public.clients (name, email, phone, address) VALUES
        ('Juan Pérez', 'juan.perez@email.com', '+56 9 1234 5678', 'Av. Libertador 123, Santiago'),
        ('María González', 'maria.gonzalez@email.com', '+56 9 8765 4321', 'Calle Principal 456, Valparaíso'),
        ('Carlos Silva', 'carlos.silva@email.com', '+56 9 5555 1234', 'Pasaje Los Robles 789, Concepción')
        ON CONFLICT (email) DO NOTHING;
        
        RAISE NOTICE 'Datos de ejemplo insertados en clients';
    ELSE
        RAISE NOTICE 'No se pueden insertar datos: la tabla clients no tiene el esquema correcto';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al insertar datos en clients: %', SQLERRM;
END $$;

DO $$
BEGIN
    -- Verificar que la tabla warehouses tiene las columnas necesarias
    IF EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'name'
    ) THEN
        INSERT INTO public.warehouses (name, location, capacity) VALUES
        ('Bodega Central', 'Santiago Centro, Av. Matta 1234', 10000),
        ('Almacén Norte', 'La Serena, Ruta 5 Norte Km 120', 5000),
        ('Depósito Sur', 'Temuco, Av. Alemania 567', 7500)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Datos de ejemplo insertados en warehouses';
    ELSE
        RAISE NOTICE 'No se pueden insertar datos: la tabla warehouses no tiene el esquema correcto';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al insertar datos en warehouses: %', SQLERRM;
END $$;

-- Comentario: Después de ejecutar este script, las páginas de clientes, bodegas y facturas deberían funcionar correctamente.
