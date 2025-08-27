-- Script simplificado para corregir tablas existentes
-- Ejecutar este script si tienes errores de "column does not exist"

-- 1. Verificar estructura actual
SELECT 
    'ESTRUCTURA ACTUAL DE TABLAS:' as info,
    '' as tabla,
    '' as columna,
    '' as tipo
UNION ALL
SELECT 
    '',
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'warehouses', 'invoices')
ORDER BY tabla, columna;

-- 2. Corregir tabla CLIENTS
DO $$
BEGIN
    RAISE NOTICE 'Corrigiendo tabla CLIENTS...';
    
    -- Crear tabla si no existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
        CREATE TABLE public.clients (
            id BIGSERIAL PRIMARY KEY
        );
        RAISE NOTICE 'Tabla clients creada';
    END IF;
    
    -- Agregar columnas una por una
    BEGIN
        ALTER TABLE public.clients ADD COLUMN name VARCHAR(200);
        RAISE NOTICE 'Agregada columna: name';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna name ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.clients ADD COLUMN email VARCHAR(250);
        RAISE NOTICE 'Agregada columna: email';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna email ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.clients ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE 'Agregada columna: phone';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna phone ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.clients ADD COLUMN address TEXT;
        RAISE NOTICE 'Agregada columna: address';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna address ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.clients ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Agregada columna: created_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna created_at ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.clients ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Agregada columna: updated_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna updated_at ya existe';
    END;
    
END $$;

-- 3. Corregir tabla WAREHOUSES
DO $$
BEGIN
    RAISE NOTICE 'Corrigiendo tabla WAREHOUSES...';
    
    -- Crear tabla si no existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'warehouses') THEN
        CREATE TABLE public.warehouses (
            id BIGSERIAL PRIMARY KEY
        );
        RAISE NOTICE 'Tabla warehouses creada';
    END IF;
    
    -- Agregar columnas una por una
    BEGIN
        ALTER TABLE public.warehouses ADD COLUMN name VARCHAR(100);
        RAISE NOTICE 'Agregada columna: name';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna name ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.warehouses ADD COLUMN location VARCHAR(200);
        RAISE NOTICE 'Agregada columna: location';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna location ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.warehouses ADD COLUMN capacity INTEGER;
        RAISE NOTICE 'Agregada columna: capacity';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna capacity ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.warehouses ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Agregada columna: created_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna created_at ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.warehouses ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Agregada columna: updated_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna updated_at ya existe';
    END;
    
END $$;

-- 4. Corregir tabla INVOICES
DO $$
BEGIN
    RAISE NOTICE 'Corrigiendo tabla INVOICES...';
    
    -- Crear tabla si no existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
        CREATE TABLE public.invoices (
            id BIGSERIAL PRIMARY KEY
        );
        RAISE NOTICE 'Tabla invoices creada';
    END IF;
    
    -- Agregar columnas una por una
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN client_id BIGINT;
        RAISE NOTICE 'Agregada columna: client_id';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna client_id ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN total DECIMAL(12,2) DEFAULT 0;
        RAISE NOTICE 'Agregada columna: total';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna total ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
        RAISE NOTICE 'Agregada columna: status';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna status ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN issued_at DATE DEFAULT CURRENT_DATE;
        RAISE NOTICE 'Agregada columna: issued_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna issued_at ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN due_date DATE;
        RAISE NOTICE 'Agregada columna: due_date';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna due_date ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Agregada columna: paid_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna paid_at ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Agregada columna: created_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna created_at ya existe';
    END;
    
    BEGIN
        ALTER TABLE public.invoices ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
        RAISE NOTICE 'Agregada columna: updated_at';
    EXCEPTION WHEN duplicate_column THEN
        RAISE NOTICE 'Columna updated_at ya existe';
    END;
    
END $$;

-- 5. Agregar constraints importantes
DO $$
BEGIN
    -- Email único para clients
    BEGIN
        ALTER TABLE public.clients ADD CONSTRAINT clients_email_unique UNIQUE (email);
        RAISE NOTICE 'Agregado constraint: clients_email_unique';
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Constraint clients_email_unique ya existe';
    END;
    
    -- Check constraint para status de invoices
    BEGIN
        ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('pending', 'paid', 'cancelled'));
        RAISE NOTICE 'Agregado constraint: invoices_status_check';
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Constraint invoices_status_check ya existe';
    END;
    
END $$;

-- 6. Habilitar RLS si no está habilitado
DO $$
BEGIN
    -- Para clients
    BEGIN
        ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para clients';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'RLS ya habilitado para clients o error: %', SQLERRM;
    END;
    
    -- Para warehouses
    BEGIN
        ALTER TABLE public.warehouses ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para warehouses';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'RLS ya habilitado para warehouses o error: %', SQLERRM;
    END;
    
    -- Para invoices
    BEGIN
        ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS habilitado para invoices';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'RLS ya habilitado para invoices o error: %', SQLERRM;
    END;
    
END $$;

-- 7. Mostrar estructura final
SELECT 
    'ESTRUCTURA FINAL DE TABLAS:' as info,
    '' as tabla,
    '' as columna,
    '' as tipo,
    '' as nullable
UNION ALL
SELECT 
    '',
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'warehouses', 'invoices')
ORDER BY tabla, columna;

-- 8. Insertar datos de ejemplo de manera segura
DO $$
BEGIN
    -- Datos para clients
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'name') THEN
        INSERT INTO public.clients (name, email, phone, address) VALUES
        ('Juan Pérez', 'juan.perez@ejemplo.com', '+56 9 1234 5678', 'Av. Libertador 123, Santiago'),
        ('María González', 'maria.gonzalez@ejemplo.com', '+56 9 8765 4321', 'Calle Principal 456, Valparaíso'),
        ('Carlos Silva', 'carlos.silva@ejemplo.com', '+56 9 5555 1234', 'Pasaje Los Robles 789, Concepción')
        ON CONFLICT (email) DO NOTHING;
        RAISE NOTICE 'Datos de ejemplo insertados en clients';
    END IF;
    
    -- Datos para warehouses
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'warehouses' AND column_name = 'name') THEN
        INSERT INTO public.warehouses (name, location, capacity) VALUES
        ('Bodega Central', 'Santiago Centro, Av. Matta 1234', 10000),
        ('Almacén Norte', 'La Serena, Ruta 5 Norte Km 120', 5000),
        ('Depósito Sur', 'Temuco, Av. Alemania 567', 7500);
        RAISE NOTICE 'Datos de ejemplo insertados en warehouses';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al insertar datos de ejemplo: %', SQLERRM;
END $$;

SELECT 'SCRIPT COMPLETADO - ¡Revisa las páginas ahora!' as resultado;


