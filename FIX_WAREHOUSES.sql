-- =============================================================================
-- SCRIPT DE CORRECCIÓN ESPECÍFICO PARA WAREHOUSES
-- =============================================================================
-- Este script corrige la tabla warehouses existente

-- Agregar columnas faltantes a warehouses si no existen
DO $$ 
BEGIN
    -- Agregar warehouse_type si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'warehouse_type') THEN
        ALTER TABLE warehouses ADD COLUMN warehouse_type TEXT DEFAULT 'main';
        
        -- Actualizar registros existentes con un tipo por defecto
        UPDATE warehouses SET warehouse_type = 'main' WHERE warehouse_type IS NULL;
        
        -- Hacer la columna NOT NULL después de actualizar
        ALTER TABLE warehouses ALTER COLUMN warehouse_type SET NOT NULL;
        
        -- Agregar el constraint de validación
        ALTER TABLE warehouses ADD CONSTRAINT warehouses_type_check 
        CHECK (warehouse_type IN ('main', 'transit', 'repair_shop'));
    END IF;
    
    -- Agregar responsible_person si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'responsible_person') THEN
        ALTER TABLE warehouses ADD COLUMN responsible_person TEXT;
    END IF;
    
    -- Agregar capacity si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'capacity') THEN
        ALTER TABLE warehouses ADD COLUMN capacity INTEGER;
    END IF;
    
    -- Agregar created_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'created_at') THEN
        ALTER TABLE warehouses ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Agregar updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'warehouses' AND column_name = 'updated_at') THEN
        ALTER TABLE warehouses ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;

END $$;

-- Insertar bodegas por defecto solo si no existen ya
DO $$
BEGIN
    -- Verificar si ya hay registros en warehouses
    IF (SELECT COUNT(*) FROM warehouses) = 0 THEN
        -- No hay registros, insertar los por defecto
        INSERT INTO warehouses (name, location, warehouse_type, responsible_person) VALUES
        ('Bodega Principal', 'Matriz - Santiago Centro', 'main', 'Jefe de Bodega'),
        ('Bodega En Tránsito', 'Zona de Despacho', 'transit', 'Coordinador Logística'),
        ('Taller Técnico', 'Área de Reparaciones', 'repair_shop', 'Supervisor Técnico');
    ELSE
        -- Ya hay registros, actualizar los tipos si están como 'main' por defecto
        UPDATE warehouses 
        SET warehouse_type = CASE 
            WHEN name LIKE '%En Tránsito%' OR name LIKE '%Transito%' OR name LIKE '%Transit%' THEN 'transit'
            WHEN name LIKE '%Taller%' OR name LIKE '%Reparac%' OR name LIKE '%Repair%' THEN 'repair_shop'
            ELSE 'main'
        END
        WHERE warehouse_type = 'main';
    END IF;
END $$;

-- Habilitar RLS para warehouses
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;

-- Crear política si no existe
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON warehouses;
    CREATE POLICY "Enable all operations for authenticated users" ON warehouses FOR ALL TO authenticated USING (true);
EXCEPTION
    WHEN others THEN
        -- Error creando la política, continuar
        NULL;
END $$;

SELECT 'Tabla warehouses corregida exitosamente' AS status;