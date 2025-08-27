-- Actualizar tabla warehouses para incluir campos de región, comuna y descripción

-- Verificar estructura actual
SELECT 'ESTRUCTURA ACTUAL WAREHOUSES:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'warehouses'
ORDER BY ordinal_position;

-- Agregar nuevas columnas si no existen
DO $$
BEGIN
    -- Agregar columna address si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'address'
    ) THEN
        ALTER TABLE public.warehouses ADD COLUMN address TEXT;
        RAISE NOTICE 'Columna address agregada';
    ELSE
        RAISE NOTICE 'Columna address ya existe';
    END IF;

    -- Agregar columna region_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'region_id'
    ) THEN
        ALTER TABLE public.warehouses ADD COLUMN region_id TEXT;
        RAISE NOTICE 'Columna region_id agregada';
    ELSE
        RAISE NOTICE 'Columna region_id ya existe';
    END IF;

    -- Agregar columna region_name si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'region_name'
    ) THEN
        ALTER TABLE public.warehouses ADD COLUMN region_name TEXT;
        RAISE NOTICE 'Columna region_name agregada';
    ELSE
        RAISE NOTICE 'Columna region_name ya existe';
    END IF;

    -- Agregar columna commune_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'commune_id'
    ) THEN
        ALTER TABLE public.warehouses ADD COLUMN commune_id TEXT;
        RAISE NOTICE 'Columna commune_id agregada';
    ELSE
        RAISE NOTICE 'Columna commune_id ya existe';
    END IF;

    -- Agregar columna commune_name si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'commune_name'
    ) THEN
        ALTER TABLE public.warehouses ADD COLUMN commune_name TEXT;
        RAISE NOTICE 'Columna commune_name agregada';
    ELSE
        RAISE NOTICE 'Columna commune_name ya existe';
    END IF;

    -- Agregar columna description si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'warehouses' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE public.warehouses ADD COLUMN description TEXT;
        RAISE NOTICE 'Columna description agregada';
    ELSE
        RAISE NOTICE 'Columna description ya existe';
    END IF;
END $$;

-- Verificar estructura final
SELECT 'ESTRUCTURA FINAL WAREHOUSES:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'warehouses'
ORDER BY ordinal_position;

-- Mostrar datos existentes
SELECT 'WAREHOUSES EXISTENTES:' as info;
SELECT COUNT(*) as total_warehouses FROM public.warehouses;


