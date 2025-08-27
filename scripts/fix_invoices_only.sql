-- Script específico para crear/arreglar solo la tabla de facturas
-- Ejecutar este script si clientes y bodegas funcionan pero facturas no

-- 1. Verificar si la tabla invoices existe
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices')
        THEN 'La tabla invoices EXISTE'
        ELSE 'La tabla invoices NO EXISTE'
    END as estado_tabla;

-- 2. Mostrar columnas actuales de invoices (si existe)
SELECT 
    'COLUMNAS ACTUALES DE INVOICES:' as info,
    '' as columna,
    '' as tipo
UNION ALL
SELECT 
    '',
    column_name, 
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY columna;

-- 3. Crear/corregir tabla invoices
DO $$
BEGIN
    RAISE NOTICE 'Creando/corrigiendo tabla INVOICES...';
    
    -- Crear tabla si no existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invoices') THEN
        CREATE TABLE public.invoices (
            id BIGSERIAL PRIMARY KEY,
            client_id BIGINT,
            total DECIMAL(12,2) DEFAULT 0,
            status VARCHAR(20) DEFAULT 'pending',
            issued_at DATE DEFAULT CURRENT_DATE,
            due_date DATE,
            paid_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
        );
        RAISE NOTICE 'Tabla invoices creada completamente';
    ELSE
        RAISE NOTICE 'Tabla invoices ya existe, verificando columnas...';
        
        -- Agregar columnas faltantes una por una
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
    END IF;
END $$;

-- 4. Agregar constraints importantes
DO $$
BEGIN
    -- Check constraint para status
    BEGIN
        ALTER TABLE public.invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('pending', 'paid', 'cancelled'));
        RAISE NOTICE 'Agregado constraint: invoices_status_check';
    EXCEPTION 
        WHEN duplicate_table THEN
            RAISE NOTICE 'Constraint invoices_status_check ya existe';
        WHEN check_violation THEN
            RAISE NOTICE 'Constraint invoices_status_check conflicta con datos existentes';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error al crear constraint: %', SQLERRM;
    END;
    
    -- Foreign key hacia clients (opcional, puede fallar si no hay relación)
    BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'clients') THEN
            ALTER TABLE public.invoices ADD CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id);
            RAISE NOTICE 'Agregada foreign key hacia clients';
        END IF;
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Foreign key hacia clients ya existe';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'No se pudo crear foreign key hacia clients: %', SQLERRM;
    END;
    
END $$;

-- 5. Habilitar RLS
DO $$
BEGIN
    ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'RLS habilitado para invoices';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'RLS ya habilitado para invoices o error: %', SQLERRM;
END $$;

-- 6. Crear políticas de seguridad básicas
DO $$
BEGIN
    -- Política de lectura
    BEGIN
        CREATE POLICY "Enable read access for all users" ON public.invoices FOR SELECT USING (true);
        RAISE NOTICE 'Política de lectura creada para invoices';
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Política de lectura ya existe para invoices';
    END;
    
    -- Política de inserción
    BEGIN
        CREATE POLICY "Enable insert for authenticated users only" ON public.invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de inserción creada para invoices';
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Política de inserción ya existe para invoices';
    END;
    
    -- Política de actualización
    BEGIN
        CREATE POLICY "Enable update for authenticated users only" ON public.invoices FOR UPDATE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de actualización creada para invoices';
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Política de actualización ya existe para invoices';
    END;
    
    -- Política de eliminación
    BEGIN
        CREATE POLICY "Enable delete for authenticated users only" ON public.invoices FOR DELETE USING (auth.role() = 'authenticated');
        RAISE NOTICE 'Política de eliminación creada para invoices';
    EXCEPTION WHEN duplicate_table THEN
        RAISE NOTICE 'Política de eliminación ya existe para invoices';
    END;
    
END $$;

-- 7. Crear trigger para updated_at
DO $$
BEGIN
    -- Crear función si no existe
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $func$
    BEGIN
        NEW.updated_at = TIMEZONE('utc'::text, NOW());
        RETURN NEW;
    END;
    $func$ LANGUAGE plpgsql;
    
    -- Crear trigger
    DROP TRIGGER IF EXISTS handle_updated_at ON public.invoices;
    CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.invoices
        FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
    
    RAISE NOTICE 'Trigger para updated_at creado en invoices';
    
END $$;

-- 8. Insertar una factura de ejemplo para probar
DO $$
DECLARE
    test_client_id BIGINT;
BEGIN
    -- Buscar un cliente existente
    SELECT id INTO test_client_id FROM public.clients LIMIT 1;
    
    IF test_client_id IS NOT NULL THEN
        -- Insertar factura de ejemplo con cliente
        INSERT INTO public.invoices (client_id, total, status, issued_at, due_date) VALUES
        (test_client_id, 150000, 'pending', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Factura de ejemplo creada con cliente ID: %', test_client_id;
    ELSE
        -- Insertar factura sin cliente específico
        INSERT INTO public.invoices (total, status, issued_at, due_date) VALUES
        (75000, 'pending', CURRENT_DATE, CURRENT_DATE + INTERVAL '15 days')
        ON CONFLICT DO NOTHING;
        RAISE NOTICE 'Factura de ejemplo creada sin cliente específico';
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error al crear factura de ejemplo: %', SQLERRM;
END $$;

-- 9. Mostrar estructura final
SELECT 
    'ESTRUCTURA FINAL DE INVOICES:' as info,
    '' as columna,
    '' as tipo,
    '' as nullable,
    '' as default_value
UNION ALL
SELECT 
    '',
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'invoices'
ORDER BY columna;

-- 10. Mostrar contenido de la tabla
SELECT 'CONTENIDO ACTUAL DE INVOICES:' as info;
SELECT * FROM public.invoices LIMIT 5;

-- 11. Probar la consulta que usa la aplicación
SELECT 
    'PRUEBA DE CONSULTA JOIN:' as test,
    '' as id,
    '' as total,
    '' as client_name
UNION ALL
SELECT 
    '',
    i.id::text,
    i.total::text,
    COALESCE(c.name, 'Sin cliente')
FROM public.invoices i
LEFT JOIN public.clients c ON i.client_id = c.id
LIMIT 3;

SELECT '✅ SCRIPT COMPLETADO - ¡Prueba la página de facturas ahora!' as resultado;
