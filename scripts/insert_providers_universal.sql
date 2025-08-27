-- Script universal que detecta TODAS las columnas obligatorias automáticamente

-- 1. Mostrar estructura completa
SELECT 'ESTRUCTURA COMPLETA DE PROVIDERS:' as info;
SELECT 
    ordinal_position as pos,
    column_name,
    data_type,
    CASE WHEN is_nullable = 'NO' THEN '🔴 OBLIGATORIA' ELSE '🟢 Opcional' END as estado,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'providers'
ORDER BY ordinal_position;

-- 2. Insertar proveedores detectando todas las columnas automáticamente
DO $$
DECLARE
    col_record RECORD;
    insert_columns TEXT := '';
    insert_values TEXT := '';
    first_col BOOLEAN := TRUE;
    provider_count INTEGER := 0;
BEGIN
    -- Detectar todas las columnas que no son auto-generadas
    FOR col_record IN 
        SELECT column_name, data_type, column_default, is_nullable
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'providers'
        AND column_name NOT IN ('id')  -- Excluir ID auto-generado
        AND (column_default IS NULL OR column_default NOT LIKE 'nextval%')  -- Excluir secuencias
        ORDER BY ordinal_position
    LOOP
        IF NOT first_col THEN
            insert_columns := insert_columns || ', ';
        END IF;
        first_col := FALSE;
        
        insert_columns := insert_columns || col_record.column_name;
    END LOOP;
    
    -- Insertar 3 proveedores
    FOR provider_count IN 1..3 LOOP
        insert_values := '';
        first_col := TRUE;
        
        -- Construir valores para cada columna
        FOR col_record IN 
            SELECT column_name, data_type, column_default, is_nullable
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'providers'
            AND column_name NOT IN ('id')
            AND (column_default IS NULL OR column_default NOT LIKE 'nextval%')
            ORDER BY ordinal_position
        LOOP
            IF NOT first_col THEN
                insert_values := insert_values || ', ';
            END IF;
            first_col := FALSE;
            
            -- Asignar valores según el nombre de columna y proveedor
            CASE 
                WHEN col_record.column_name = 'name' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''Proveedor Tech SpA''';
                        WHEN 2 THEN insert_values := insert_values || '''Electrónica Chile Ltda.''';
                        WHEN 3 THEN insert_values := insert_values || '''Suministros Industriales SA''';
                    END CASE;
                WHEN col_record.column_name = 'organization' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''Proveedor Tech SpA''';
                        WHEN 2 THEN insert_values := insert_values || '''Electrónica Chile Ltda.''';
                        WHEN 3 THEN insert_values := insert_values || '''Suministros Industriales SA''';
                    END CASE;
                WHEN col_record.column_name = 'rut' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''12.345.678-9''';
                        WHEN 2 THEN insert_values := insert_values || '''98.765.432-1''';
                        WHEN 3 THEN insert_values := insert_values || '''11.222.333-K''';
                    END CASE;
                WHEN col_record.column_name = 'dni' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''12345678''';
                        WHEN 2 THEN insert_values := insert_values || '''98765432''';
                        WHEN 3 THEN insert_values := insert_values || '''11222333''';
                    END CASE;
                WHEN col_record.column_name = 'address' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''Av. Providencia 1234, Santiago''';
                        WHEN 2 THEN insert_values := insert_values || '''Calle Los Electrónicos 567, Valparaíso''';
                        WHEN 3 THEN insert_values := insert_values || '''Av. Industrial 890, Concepción''';
                    END CASE;
                WHEN col_record.column_name = 'phone' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''+56 2 2234 5678''';
                        WHEN 2 THEN insert_values := insert_values || '''+56 32 123 4567''';
                        WHEN 3 THEN insert_values := insert_values || '''+56 41 987 6543''';
                    END CASE;
                WHEN col_record.column_name = 'email' THEN
                    CASE provider_count
                        WHEN 1 THEN insert_values := insert_values || '''ventas@proveedortech.cl''';
                        WHEN 2 THEN insert_values := insert_values || '''contacto@electronicachile.cl''';
                        WHEN 3 THEN insert_values := insert_values || '''compras@suministros.cl''';
                    END CASE;
                WHEN col_record.column_name IN ('created_at', 'updated_at') THEN
                    insert_values := insert_values || 'NOW()';
                WHEN col_record.data_type IN ('integer', 'bigint', 'numeric', 'decimal') THEN
                    insert_values := insert_values || '0';
                WHEN col_record.data_type IN ('character varying', 'text') THEN
                    insert_values := insert_values || '''Valor por defecto''';
                WHEN col_record.data_type = 'boolean' THEN
                    insert_values := insert_values || 'FALSE';
                WHEN col_record.data_type = 'date' THEN
                    insert_values := insert_values || 'CURRENT_DATE';
                WHEN col_record.data_type LIKE 'timestamp%' THEN
                    insert_values := insert_values || 'NOW()';
                ELSE
                    insert_values := insert_values || 'NULL';
            END CASE;
        END LOOP;
        
        -- Ejecutar INSERT para este proveedor
        BEGIN
            EXECUTE 'INSERT INTO public.providers (' || insert_columns || ') VALUES (' || insert_values || ')';
            RAISE NOTICE 'Proveedor % insertado exitosamente', provider_count;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error insertando proveedor %: %', provider_count, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Proceso de inserción completado';
    RAISE NOTICE 'Columnas detectadas: %', insert_columns;
    
END $$;

-- 3. Mostrar resultado
SELECT 'PROVEEDORES INSERTADOS:' as resultado;
SELECT * FROM public.providers ORDER BY id;

SELECT 'TOTAL PROVEEDORES:' as info;
SELECT COUNT(*) as total FROM public.providers;

