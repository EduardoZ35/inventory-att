-- Script para verificar y corregir tablas existentes en Supabase
-- Ejecutar este script ANTES del script principal

-- 1. PRIMERO: Verificar qué tablas y columnas existen
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'warehouses', 'invoices', 'invoice_items')
ORDER BY table_name, ordinal_position;

-- 2. Verificar si la tabla clients existe y qué columnas tiene
DO $$
BEGIN
    -- Si la tabla clients existe, mostrar su estructura
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
        RAISE NOTICE 'La tabla clients YA EXISTE. Verificando columnas...';
        
        -- Agregar columnas faltantes si no existen
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'name') THEN
            ALTER TABLE public.clients ADD COLUMN name VARCHAR(200);
            RAISE NOTICE 'Agregada columna: name';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'email') THEN
            ALTER TABLE public.clients ADD COLUMN email VARCHAR(250);
            RAISE NOTICE 'Agregada columna: email';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'phone') THEN
            ALTER TABLE public.clients ADD COLUMN phone VARCHAR(20);
            RAISE NOTICE 'Agregada columna: phone';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clients' AND column_name = 'address') THEN
            ALTER TABLE public.clients ADD COLUMN address TEXT;
            RAISE NOTICE 'Agregada columna: address';
        END IF;
        
        -- Agregar constraints si no existen
        BEGIN
            ALTER TABLE public.clients ADD CONSTRAINT clients_email_unique UNIQUE (email);
            RAISE NOTICE 'Agregado constraint unique para email';
        EXCEPTION WHEN duplicate_table THEN
            RAISE NOTICE 'Constraint unique para email ya existe';
        END;
        
    ELSE
        RAISE NOTICE 'La tabla clients NO EXISTE. Se creará con el script principal.';
    END IF;
END $$;

-- 3. Verificar tabla warehouses
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'warehouses') THEN
        RAISE NOTICE 'La tabla warehouses YA EXISTE. Verificando columnas...';
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'warehouses' AND column_name = 'name') THEN
            ALTER TABLE public.warehouses ADD COLUMN name VARCHAR(100);
            RAISE NOTICE 'Agregada columna: name';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'warehouses' AND column_name = 'location') THEN
            ALTER TABLE public.warehouses ADD COLUMN location VARCHAR(200);
            RAISE NOTICE 'Agregada columna: location';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'warehouses' AND column_name = 'capacity') THEN
            ALTER TABLE public.warehouses ADD COLUMN capacity INTEGER;
            RAISE NOTICE 'Agregada columna: capacity';
        END IF;
        
    ELSE
        RAISE NOTICE 'La tabla warehouses NO EXISTE. Se creará con el script principal.';
    END IF;
END $$;

-- 4. Verificar tabla invoices
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
        RAISE NOTICE 'La tabla invoices YA EXISTE. Verificando columnas...';
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'client_id') THEN
            ALTER TABLE public.invoices ADD COLUMN client_id BIGINT;
            RAISE NOTICE 'Agregada columna: client_id';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'total') THEN
            ALTER TABLE public.invoices ADD COLUMN total DECIMAL(12,2) DEFAULT 0;
            RAISE NOTICE 'Agregada columna: total';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'status') THEN
            ALTER TABLE public.invoices ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
            RAISE NOTICE 'Agregada columna: status';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'issued_at') THEN
            ALTER TABLE public.invoices ADD COLUMN issued_at DATE DEFAULT CURRENT_DATE;
            RAISE NOTICE 'Agregada columna: issued_at';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'due_date') THEN
            ALTER TABLE public.invoices ADD COLUMN due_date DATE;
            RAISE NOTICE 'Agregada columna: due_date';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'paid_at') THEN
            ALTER TABLE public.invoices ADD COLUMN paid_at TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Agregada columna: paid_at';
        END IF;
        
    ELSE
        RAISE NOTICE 'La tabla invoices NO EXISTE. Se creará con el script principal.';
    END IF;
END $$;

-- 5. Agregar columnas created_at y updated_at si no existen
DO $$
DECLARE
    target_tables TEXT[] := ARRAY['clients', 'warehouses', 'invoices'];
    current_table TEXT;
BEGIN
    FOREACH current_table IN ARRAY target_tables
    LOOP
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = current_table) THEN
            -- Agregar created_at si no existe
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = current_table AND column_name = 'created_at') THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(''utc''::text, NOW())', current_table);
                RAISE NOTICE 'Agregada columna created_at a tabla: %', current_table;
            END IF;
            
            -- Agregar updated_at si no existe
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = current_table AND column_name = 'updated_at') THEN
                EXECUTE format('ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE(''utc''::text, NOW())', current_table);
                RAISE NOTICE 'Agregada columna updated_at a tabla: %', current_table;
            END IF;
        END IF;
    END LOOP;
END $$;

-- 6. Mostrar estructura final de las tablas
SELECT 
    'ESTRUCTURA FINAL DE TABLAS:' as info;
    
SELECT 
    table_name, 
    column_name, 
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('clients', 'warehouses', 'invoices')
ORDER BY table_name, ordinal_position;
