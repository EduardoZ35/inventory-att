-- Migración para agregar campo provincia a las tablas
-- Ejecutar en Supabase SQL Editor

-- Agregar campo provincia a la tabla clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS provincia_id TEXT,
ADD COLUMN IF NOT EXISTS provincia_name TEXT;

-- Agregar campo provincia a la tabla providers  
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS provincia_id TEXT,
ADD COLUMN IF NOT EXISTS provincia_name TEXT;

-- Verificar que las columnas se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'clients' 
AND column_name IN ('provincia_id', 'provincia_name')
ORDER BY ordinal_position;

SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'providers' 
AND column_name IN ('provincia_id', 'provincia_name')
ORDER BY ordinal_position;
