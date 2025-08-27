-- Actualizar esquemas de proveedores y clientes para incluir país, región y comuna

-- === PROVEEDORES ===
SELECT 'ACTUALIZANDO TABLA PROVIDERS...' as info;

-- Agregar nuevas columnas a providers si no existen
DO $$
BEGIN
    -- Agregar columna country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'providers' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.providers ADD COLUMN country TEXT;
        RAISE NOTICE 'Columna country agregada a providers';
    ELSE
        RAISE NOTICE 'Columna country ya existe en providers';
    END IF;

    -- Agregar columna region_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'providers' 
        AND column_name = 'region_id'
    ) THEN
        ALTER TABLE public.providers ADD COLUMN region_id TEXT;
        RAISE NOTICE 'Columna region_id agregada a providers';
    ELSE
        RAISE NOTICE 'Columna region_id ya existe en providers';
    END IF;

    -- Agregar columna region_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'providers' 
        AND column_name = 'region_name'
    ) THEN
        ALTER TABLE public.providers ADD COLUMN region_name TEXT;
        RAISE NOTICE 'Columna region_name agregada a providers';
    ELSE
        RAISE NOTICE 'Columna region_name ya existe en providers';
    END IF;

    -- Agregar columna commune_id
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'providers' 
        AND column_name = 'commune_id'
    ) THEN
        ALTER TABLE public.providers ADD COLUMN commune_id TEXT;
        RAISE NOTICE 'Columna commune_id agregada a providers';
    ELSE
        RAISE NOTICE 'Columna commune_id ya existe en providers';
    END IF;

    -- Agregar columna commune_name
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'providers' 
        AND column_name = 'commune_name'
    ) THEN
        ALTER TABLE public.providers ADD COLUMN commune_name TEXT;
        RAISE NOTICE 'Columna commune_name agregada a providers';
    ELSE
        RAISE NOTICE 'Columna commune_name ya existe en providers';
    END IF;
END $$;

-- === CLIENTES ===
SELECT 'ACTUALIZANDO TABLA CLIENTS...' as info;

-- Agregar nuevas columnas a clients si no existen
DO $$
BEGIN
    -- Verificar si la tabla clients existe
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
    ) THEN
        -- Agregar columna country
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'clients' 
            AND column_name = 'country'
        ) THEN
            ALTER TABLE public.clients ADD COLUMN country TEXT;
            RAISE NOTICE 'Columna country agregada a clients';
        ELSE
            RAISE NOTICE 'Columna country ya existe en clients';
        END IF;

        -- Agregar columna region_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'clients' 
            AND column_name = 'region_id'
        ) THEN
            ALTER TABLE public.clients ADD COLUMN region_id TEXT;
            RAISE NOTICE 'Columna region_id agregada a clients';
        ELSE
            RAISE NOTICE 'Columna region_id ya existe en clients';
        END IF;

        -- Agregar columna region_name
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'clients' 
            AND column_name = 'region_name'
        ) THEN
            ALTER TABLE public.clients ADD COLUMN region_name TEXT;
            RAISE NOTICE 'Columna region_name agregada a clients';
        ELSE
            RAISE NOTICE 'Columna region_name ya existe en clients';
        END IF;

        -- Agregar columna commune_id
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'clients' 
            AND column_name = 'commune_id'
        ) THEN
            ALTER TABLE public.clients ADD COLUMN commune_id TEXT;
            RAISE NOTICE 'Columna commune_id agregada a clients';
        ELSE
            RAISE NOTICE 'Columna commune_id ya existe en clients';
        END IF;

        -- Agregar columna commune_name
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'clients' 
            AND column_name = 'commune_name'
        ) THEN
            ALTER TABLE public.clients ADD COLUMN commune_name TEXT;
            RAISE NOTICE 'Columna commune_name agregada a clients';
        ELSE
            RAISE NOTICE 'Columna commune_name ya existe en clients';
        END IF;
    ELSE
        RAISE NOTICE 'Tabla clients no existe, saltando actualización';
    END IF;
END $$;

-- Verificar estructuras finales
SELECT 'ESTRUCTURA FINAL PROVIDERS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'providers'
ORDER BY ordinal_position;

SELECT 'ESTRUCTURA FINAL CLIENTS:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clients'
ORDER BY ordinal_position;

SELECT 'ACTUALIZACIÓN COMPLETADA' as resultado;


